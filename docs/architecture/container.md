# C4 Container — Customer Management Platform

> **TODO:** Place React, Spring Boot, PostgreSQL, Kafka, IdP, and observability. Note sync vs async paths.

## Containers

| Container | Responsibility | Tech | Data store / topics |
| --------- | -------------- | ---- | ------------------- |
| `crm-web` | Search, profile, timeline, interaction form. Attaches token + `X-Correlation-ID`. No business rules | React | — |
| `crm-api` | Authn/authz, validation, transaction boundary, event publish, and the notification/audit consumer that runs inside the same app (so nothing is published to Kafka without something reading it) | Spring Boot | JDBC → PostgreSQL |
| `crm-db` | `customers`, `interactions`, `audit_events`. Schema from versioned migrations only | PostgreSQL | schemas / tables |
| `crm-events` | Versioned interaction events, keyed by `customerId` for per-customer order | Kafka | topic: `crm.customer.interaction.v1`, plus a dead-letter topic `.DLT` for messages that keep failing |
| `idp` | Signs login tokens, exposes JWKS (public keys for signature checks). Sync fetch at startup and key rotation | OAuth2 / OIDC (JWKS) | — |
| `obs` | Health, readiness, metrics, structured logs with correlation ID | Actuator + JSON logging | logs / metrics |

- **Sync:** agent→`crm-web`, `crm-web`→`crm-api` (REST+JWT), `crm-api`→`crm-db` (JDBC), `crm-api`→`idp` (JWKS). Only this path is in the latency budget.
- **Async:** `crm-api` producer → `crm-events` → notification/audit consumer.
- **Deploy / admin boundary:** all containers in one k3s training namespace (ADR-005). Only the operator and the CI deploy job may apply manifests or roll back. DB credentials, Kafka bootstrap, and issuer URI come from k8s secrets, never baked into an image.

## Data flow (interaction create)

1. Agent → UI → `POST /api/v1/interactions` with `X-Correlation-ID: lab-request-001`
2. API validates → persists → publishes `CustomerInteractionRecordedV1` (or equivalent)
3. Consumer is the in-process notification/audit listener in `crm-api` (idempotent / DLT notes): keyed on `eventId` with a unique constraint, so redelivery is a no-op. Deserialization failure or 3 failed attempts sends the message to the dead-letter topic `crm.customer.interaction.v1.DLT`, logged once with the correlation ID, so one bad message cannot block the rest.

## Open decisions → ADRs

- Database: see `docs/adrs/ADR-001-postgresql.md` (or draft from `_ADR-TEMPLATE.md`)
- Messaging: `ADR-002-kafka.md` — versioned topic + `V1` type name, keyed by `customerId`
- Consistency (persist + publish): `ADR-003-after-commit-publish.md` — publish after commit, retry + DLT + reconciliation; outbox is the follow-up
- Auth: `ADR-004-jwt-rbac.md` — stateless JWT, deny by default, AGENT/MANAGER
- Deploy: `ADR-005-image-digest-deploy.md` — k3s training namespace, image by digest, `kubectl rollout undo`

---

## Domain ownership and contracts

Synthetic identities only: `amina.khan@example.test`, `ravi.singh@example.test`. Never real customer data, tokens, or URLs.

### Aggregate ownership

| Aggregate | Owner | Owns |
| --------- | ----- | ---- |
| Customer | `crm-api` customer module | `CUS-` ID, name, contact, status transitions |
| Interaction | `crm-api` interaction module | Interaction rows, per-customer ordering, validation |
| Audit event | Notification/audit consumer | `audit_events` rows keyed by `eventId`, actor attribution |
| Notification side effect | Notification/audit consumer | Reacting to the event (no email/SMS — out of scope) |

No `Case` aggregate this week.

### HTTP contract

`POST /api/v1/interactions` — requires `AGENT` or `MANAGER`.
Headers: `Authorization: Bearer <jwt>`, `X-Correlation-ID: lab-request-001`

```json
{
  "customerId": "CUS-1001",
  "interactionType": "PHONE",
  "summary": "Confirmed billing address before renewal.",
  "correlationId": "lab-request-001"
}
```

`201 Created` → `Location: /api/v1/interactions/{interactionId}`.

Errors use Problem Details (`application/problem+json`), same shape on every `/api/v1` route. Every body carries `correlationId`.

| Condition | Status |
| --------- | -----: |
| Blank `summary` or unknown `interactionType` (nothing persisted) | 400 |
| No or expired token | 401 |
| `AGENT` attempts a manager-only status change | 403 |
| `customerId` is `CUS-9999` | 404 |
| Illegal status transition | 409 |

### Event contract

`CustomerInteractionRecordedV1` on `crm.customer.interaction.v1`, keyed by `customerId`.

| Field | Type | Notes |
| ----- | ---- | ----- |
| `eventId` | UUID | Consumer idempotency key |
| `type` | string | `CustomerInteractionRecorded` |
| `version` | int | `1`, asserted before reading other fields |
| `time` | ISO-8601 | Set at publish |
| `actor` | string | JWT subject, for audit attribution |
| `correlationId` | string | From `X-Correlation-ID` |
| `customerId` | string | Also the message key |
| `interactionId` | long | Persisted row identity |
| `interactionType` | enum | `PHONE`, `EMAIL`, `CHAT` |

`summary` is deliberately not published — audit records that a contact happened and by whom, not the note text.

### Compatibility policy

- Within `v1`: additive optional fields only; consumers ignore unknown fields.
- Breaking change (remove, rename, narrow, redefine): new topic `...v2` and `...V2` type, run in parallel, then retire `v1`.
- Same rule for HTTP via the `/api/v1` prefix.

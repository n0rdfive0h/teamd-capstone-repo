# C4 Container — Customer Management Platform

> **TODO:** Place React, Spring Boot, PostgreSQL, Kafka, IdP, and observability. Note sync vs async paths.

## Containers

| Container | Responsibility | Tech | Data store / topics |
| --------- | -------------- | ---- | ------------------- |
| `crm-web` | Search, profile, timeline, interaction form. Attaches token + `X-Correlation-ID`. No business rules | React | — |
| `crm-api` | Authn/authz, validation, transaction boundary, event publish, and the in-process notification/audit consumer (so Kafka is not orphaned) | Spring Boot | JDBC → PostgreSQL |
| `crm-db` | `customers`, `interactions`, `audit_events`. Schema from versioned migrations only | PostgreSQL | schemas / tables |
| `crm-events` | Versioned interaction events, keyed by `customerId` for per-customer order | Kafka | topic: `crm.customer.interaction.v1` (+ `.DLT`) |
| `idp` | Signs tokens, exposes JWKS. Sync fetch at startup and key rotation | OAuth2 / OIDC (JWKS) | — |
| `obs` | Health, readiness, metrics, structured logs with correlation ID | Actuator + JSON logging | logs / metrics |

- **Sync:** agent→`crm-web`, `crm-web`→`crm-api` (REST+JWT), `crm-api`→`crm-db` (JDBC), `crm-api`→`idp` (JWKS). Only this path is in the latency budget.
- **Async:** `crm-api` producer → `crm-events` → notification/audit consumer.
- **Deploy / admin boundary:** all containers in one k3s training namespace (ADR-005). Only the operator and the CI deploy job may apply manifests or roll back. DB credentials, Kafka bootstrap, and issuer URI come from k8s secrets, never baked into an image.

## Data flow (interaction create)

1. Agent → UI → `POST /api/v1/interactions` with `X-Correlation-ID: lab-request-001`
2. API validates → persists → publishes `CustomerInteractionRecordedV1` (or equivalent)
3. Consumer is the in-process notification/audit listener in `crm-api` (idempotent / DLT notes): keyed on `eventId` with a unique constraint, so redelivery is a no-op. Deserialization failure or 3 failed attempts → `crm.customer.interaction.v1.DLT`, logged once with the correlation ID.

## Open decisions → ADRs

- Database: see `docs/adrs/ADR-001-postgresql.md` (or draft from `_ADR-TEMPLATE.md`)
- Messaging: `ADR-002-kafka.md` — versioned topic + `V1` type name, keyed by `customerId`
- Consistency (persist + publish): `ADR-003-after-commit-publish.md` — publish after commit, retry + DLT + reconciliation; outbox is the follow-up
- Auth: `ADR-004-jwt-rbac.md` — stateless JWT, deny by default, AGENT/MANAGER
- Deploy: `ADR-005-image-digest-deploy.md` — k3s training namespace, image by digest, `kubectl rollout undo`
- Contract detail: `docs/contracts.md`

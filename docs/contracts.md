# Domain ownership and contracts

> Lab 48 Step 4. Synthetic only: `amina.khan@example.test`.

## Aggregate ownership

| Aggregate | Owner | Owns |
| --------- | ----- | ---- |
| Customer | `crm-api` customer module | `CUS-` ID, name, contact, status transitions |
| Interaction | `crm-api` interaction module | Interaction rows, per-customer ordering, validation |
| Audit event | Notification/audit consumer | `audit_events` rows keyed by `eventId`, actor attribution |
| Notification side effect | Notification/audit consumer | Reacting to the event (no email/SMS — out of scope) |

No `Case` aggregate this week.

## HTTP contract

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

Errors use Problem Details (`application/problem+json`). Every body carries `correlationId`.

| Condition | Status |
| --------- | -----: |
| Blank `summary` or unknown `interactionType` (nothing persisted) | 400 |
| No or expired token | 401 |
| `AGENT` attempts a manager-only status change | 403 |
| `customerId` is `CUS-9999` | 404 |
| Illegal status transition | 409 |

## Event contract

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

## Compatibility policy

- Within `v1`: additive optional fields only; consumers ignore unknown fields.
- Breaking change (remove, rename, narrow, redefine): new topic `...v2` and `...V2` type, run in parallel, then retire `v1`.
- Same rule for HTTP via the `/api/v1` prefix.

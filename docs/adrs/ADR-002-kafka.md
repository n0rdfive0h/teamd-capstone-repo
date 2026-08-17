# ADR-002: Kafka for interaction events

- **Status:** Accepted
- **Date:** 2026-08-15
- **Deciders:** Team D
- **Related backlog:** CAP-12

## Context


- Audit and downstream work must stay off the agent's request path.
- A silent contract change is worst in audit, so the event is self-describing.
- No schema registry here, so the version rides in the topic name and the type name (`...V1`).
- Keyed by `customerId` so one customer's history stays ordered on one partition.

## Decision

We will publish versioned interaction events to **Kafka** after a successful transactional write (strategy per ADR-003).

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| Sync-only REST | Simple | Couples consumers | Misses Week 4 messaging skills |
| DB polling | No broker | Lag / load | Not preferred |
| Outbox later | Strong consistency | Extra tables | Optional stretch |

## Consequences

- **Positive:** Traceable `lab-request-001` across API → topic
- **Negative / follow-ups:** Idempotent consumer, DLT, retries (Lab 49)
- **NFR impact:** Consumer work sits outside the request path (per ADR-003), so it is not in the 500 ms p95 budget. Carrying `correlationId` and omitting `summary` is what the retention/privacy row checks. Adds Kafka to readiness; version discipline is manual, so the consumer asserts `version`.
- **Evidence later labs will need:** topic message + consumer/DLT notes

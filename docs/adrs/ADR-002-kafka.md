# ADR-002: Kafka for interaction events

- **Status:** Proposed
- **Date:** _____
- **Deciders:** _____
- **Related backlog:** CAP-12

## Context

TODO: Why async notification of `CustomerInteractionRecordedV1` (or equivalent) after persist.

_____

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
- **NFR impact:** _____
- **Evidence later labs will need:** topic message + consumer/DLT notes

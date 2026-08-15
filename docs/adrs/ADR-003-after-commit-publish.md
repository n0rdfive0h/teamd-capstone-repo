# ADR-003: Publish interaction events after database commit

- **Status:** Accepted
- **Date:** 2026-08-15
- **Deciders:** Team D
- **Related backlog:** CAP-12

## Context

- CAP-12 does two writes in one agent action: an interaction row in PostgreSQL, and a `CustomerInteractionRecordedV1` event on Kafka.
- They are separate systems, so one can succeed while the other fails. We have to choose which bad outcome we accept:
  - row saved but no event, so the audit trail misses a real contact, or
  - event sent but no row, so the audit trail claims a contact that never happened.
- ADR-002 already says the event is published after a successful transactional write. The only open question here is how far after.
- The safest design is a transactional outbox: write the event into a database table inside the same transaction, then a background job reads that table and publishes to Kafka. Nothing is lost even if Kafka is down for hours.
- We are not building it. It needs a new table, a background poller, and its own tests, and the six instructional days from CP1 to the defense (17–21 and 24 Aug) are already committed to backend, frontend, security, and deploy. It is recorded as the follow-up instead.

## Decision

We will publish **after the transaction commits**, via an after-commit listener in the service layer. The agent's request succeeds once the row is durable. A failed publish retries with backoff; if it still fails it is logged at ERROR with the correlation ID and interaction ID. It cannot be dead-lettered, because a producer has no broker to write to when the broker is the thing that is down. A reconciliation query (Lab 49) lists interactions with no matching `audit_events` row so the gap is visible instead of silent. The dead-letter topic covers the separate consumer-side failure.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| A — Publish inside the transaction | No row without a publish attempt | Broker blip rolls back a valid action; transaction spans a network call | An agent's valid save gets undone by an infrastructure hiccup, and the DB transaction stays open waiting on Kafka |
| B — Transactional outbox + poller | Nothing lost even if Kafka is down for hours | New table, background poller, and its own tests | No spare build days before the 24 Aug defense. Recorded as the follow-up |
| C — Publish before the write | Consumer learns early | Event can describe a row that never existed | Phantom audit entries are indefensible |

## Consequences

- **Positive:** A committed interaction is never rolled back by a messaging failure; the transaction never spans a call to Kafka.
- **Negative / follow-ups:** A broker outage after commit can leave a row with no event. Detectable, not silent: retries, the ERROR log, and the reconciliation query surface it. Outbox is the next step.
- **NFR impact:** Keeps the 500 ms p95 off broker latency. Introduces audit lag, tracked as risk R3.
- **Evidence later labs will need:** Test proving publish happens only after commit; a producer-retry test; consumer DLT test; reconciliation query showing zero unmatched rows after the demo.

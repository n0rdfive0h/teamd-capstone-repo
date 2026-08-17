# ADR-001: PostgreSQL as system of record

- **Status:** Accepted
- **Date:** 2026-08-15
- **Deciders:** Team D
- **Related backlog:** CAP-12 (and persistence stories)

## Context


- Interaction writes need real transactions, not best-effort writes.
- Read patterns are relational: customer joined to an ordered timeline, filtered by status.
- The cohort already has PostgreSQL and migration tooling running, so our four build days go to the CRM slice instead of standing up a new datastore.

## Decision

We will use **PostgreSQL** as the system of record for customer and interaction data in the Week 6 CRM.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| H2 only | Fast local | Not production-like | Fail for Lab 50 durability proof |
| Document DB | Flexible docs | Weak relational joins | Overkill for this slice |
| Files / JSON | Simple | No concurrency / query | Not enterprise CRM |

## Consequences

- **Positive:** Aligns with Labs 37–39 / shared Postgres; Flyway migrations reusable
- **Negative / follow-ups:** Need migrations, connection secrets handling (Lab 51)
- **NFR impact:** The create path is one customer lookup by primary key plus one insert, so most of the 500 ms p95 budget is DB round-trip. Readiness depends on the DB being up, which is what the 30 s DOWN drill measures. Costs a connection pool to size.
- **Evidence later labs will need:** migration apply proof, SQL row for `CUS-1001`

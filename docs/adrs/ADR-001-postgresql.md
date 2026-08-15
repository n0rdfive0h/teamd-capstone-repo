# ADR-001: PostgreSQL as system of record

- **Status:** Proposed
- **Date:** _____
- **Deciders:** _____
- **Related backlog:** CAP-12 (and persistence stories)

## Context

TODO: Why relational persistence for CRM customers/interactions (ACID, query patterns, shared cohort Postgres).

_____

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
- **NFR impact:** _____
- **Evidence later labs will need:** migration apply proof, SQL row for `CUS-1001`

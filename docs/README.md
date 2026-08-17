# Northstar CRM — Lab 48 planning docs

Team D · Week 6. Labs 49–52 build against these. Nothing counts unless it maps to a backlog story, an ADR, and an NFR.

**The demo story (CAP-12):** agent searches `CUS-1001`, opens the profile, records an interaction. Row saved in PostgreSQL, event sent to Kafka, audit row written.

## Core artifacts

| Question | Doc |
| -------- | --- |
| Who uses it, what is out of scope | [`architecture/context.md`](architecture/context.md) |
| Moving parts, request flow, API + event shapes | [`architecture/container.md`](architecture/container.md) |
| Quality targets and how we prove them | [`nfrs.md`](nfrs.md) |
| What we build, in order | [`backlog.md`](backlog.md) |
| Why we chose X over Y | [`adrs/`](adrs/) (5 records) |
| What could go wrong, who watches it | [`risk-register.md`](risk-register.md) |
| Who does what by when | [`team-plan.md`](team-plan.md) |

## Owners

Fill at CP1. Other docs use these tokens as placeholders.

| Token | Lane | Owner | Backup |
| ----- | ---- | ----- | ------ |
| `[ARCH]` | Docs, evidence index, demo script | Jimmy Le-Nguyen | Ethan Pacifico |
| `[BACKEND]` | API, Kafka, tests | Ethan Pacifico | Aidan Conroy |
| `[FRONTEND]` | React, JPA, migrations | Aidan Conroy | Nick Smith |
| `[DELIVERY]` | Login/roles, pipeline, deploy, rollback | Nick Smith | Jimmy Le-Nguyen |

## Glossary

| Term | Means |
| ---- | ----- |
| ADR | Architecture Decision Record: one decision per file, with rejected alternatives |
| NFR | Quality target with a number and a way to measure it |
| p95 | 95 of 100 requests finish faster than this |
| Correlation ID | One ID stamped on a request, its logs, and its event, so you can trace one action |
| Idempotent | Doing it twice gives the same result as once |
| DLT | Dead-letter topic: where a repeatedly failing message goes so it stops blocking the queue |
| JWKS | Public keys the API fetches to verify a login token's signature |
| Image digest | `sha256:...` fingerprint of a container image. Unlike a tag, it cannot be repointed |
| Outbox | A safer publishing pattern we chose **not** to build — see ADR-003 |

## Not built yet

`docs/backend-demo.md` (Lab 49) · `scripts/smoke.sh` (Lab 51) · `defense/` (Lab 52). `reports/` exists but stays empty until the first evidence lands.

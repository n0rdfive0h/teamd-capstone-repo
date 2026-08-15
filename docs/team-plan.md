# Team plan — Capstone

> **TODO:** Owners, milestones, critical path for Labs 49–52.

| Milestone | Owner | Due | Depends on |
| --------- | ----- | --- | ---------- |
| Lab 49 interaction API | `[BACKEND]` | Wed 19 Aug | ADRs 001–003 |
| Lab 50 UI + SQL | `[FRONTEND]` | Fri 21 Aug (CP2) | Lab 49 contract |
| Lab 51 security/deploy | `[DELIVERY]` | Mon 24 Aug a.m. | digest from CI |
| Lab 52 defense pack | `[ARCH]` | Mon 24 Aug (CP3) | evidence from 48–51 |

## Critical path

1. **CP1, 17 Aug** — freeze the plan. No redesign after this.
2. **19 Aug** — CAP-12 end to end: persist + publish after commit, happy path and validation failure tested. Everything downstream waits on this contract.
3. **CP2, 21 Aug** — CAP-13 journey against the frozen contract, UI→DB proof. Walkable in under 5 min without slides.
4. **24 Aug a.m.** — CAP-14: 401/403 green, pipeline + SAST (static security scan), digest recorded, k3s deploy, smoke, written rollback.
5. **CP3, 24 Aug** — CAP-16: 10–15 min demo, one rehearsed failure, ≥5 evidence links, Q&A, retro.

Off the critical path: CAP-15 and the a11y pass. Both cut before steps 2–4 slip.

## Integration points

| Integration | Owners | Contract of record | Verified by | Drift risk |
| ----------- | ------ | ------------------ | ----------- | ---------- |
| UI ↔ API | `[FRONTEND]` + `[BACKEND]` | HTTP contract in `architecture/container.md` | CAP-13 against a live API, not a mock | R6 |
| API ↔ PostgreSQL | `[BACKEND]` + `[FRONTEND]` | Migration files; entities validated at startup | CAP-12 test + SQL row for `CUS-1001` | R4 |
| API ↔ Kafka | `[BACKEND]` | Event field table in `architecture/container.md` | `version` assertion; duplicate + DLT tests | R3 |
| Pipeline ↔ registry ↔ cluster | `[DELIVERY]` | Digest in the run log and the manifest | Deploy + smoke; timed rollback rehearsal | R5 |

## Working notes for Week 6 continuity

1. **Lab 49 owns:** CAP-12 API + Kafka for `CUS-1001` with `lab-request-001`.
2. **Lab 50 owns:** React search/profile/timeline + PostgreSQL durability proof, same fixtures.
3. **Lab 51 owns:** JWT deny-by-default, pipeline gates, immutable image, smoke + rollback.
4. **Lab 52 owns:** Demo script, evidence index, Q&A cards, retro, self-assessment — no new scope.

Deferred stories go in `risk-register.md` marked Explicitly Deferred with owner and date — never silently dropped.

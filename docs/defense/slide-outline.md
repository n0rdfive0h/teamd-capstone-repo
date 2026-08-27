# Final defense - slide outline

Export later to `defense/final-presentation.pdf` (or instructor-approved format).

**Team D:** Jimmy Le-Nguyen `[ARCH]` · Ethan Pacifico `[BACKEND]` · Aidan Conroy `[FRONTEND]` · Nick Smith `[DELIVERY]`

**Budget:** 6 min slides + 10 min live demo = 16 min, then Q&A.

| # | Slide title | Speaker      | Time | Evidence link (must exist) |
| - | ----------- |--------------| ---- | -------------------------- |
| 1 | One authenticated journey, one durable trail | Jimmy        | 1 min | `docs/architecture/context.md` |
| 2 | Scope, fixtures, and what we cut on purpose | Jimmy        | 0:30 | `docs/backlog.md` |
| 3 | Context and containers (2 trust boundaries) | Ethan        | 1 min | `docs/architecture/container.md` |
| 4 | Four decisions that shaped the failure modes | Ethan        | 1:30 | `docs/adrs/` (5 ADRs) |
| 5 | Vertical slice map: UI to API to DB to event to audit | Ethan        | 0:30 | `docs/backend-demo.md` |
| 6 | **Live demo** (see demo-script) | Aidan drives | 10 min | `defense/demo-script.md` |
            -
| 7 | Security and release: what is proven, what is not | Nick         | 1:30 | `docs/security/threat-model.md`, `Dockerfile`, `k8s/deployment.yaml` |
| 8 | NFRs and residual risks | Nick         | 0:30 | `docs/nfrs.md`, `docs/risk-register.md` |
| 9 | Retrospective and next week | Jimmy        | 0:30 | `defense/retrospective.md`, `defense/known-gaps.md` |
| 10 | Q&A | all          | remaining | `defense/technical-q-and-a.md` |

## Speaker notes (one line per slide, say it, do not read it)

**1. Business outcome**

- Agents record and retrieve customer interactions in one authenticated journey.
- Every write leaves a durable row plus a traceable audit event.
- Success measure: record an interaction for `CUS-1001` with correlation `lab-request-001` and prove UI to API to DB to event.

**2. Scope and fixtures**

- In: search, profile, timeline, record interaction, `PROSPECT` to `ACTIVE`, versioned events, correlation IDs.
- Out on purpose: billing, PII import, email/SMS delivery, `Case` aggregate, transactional outbox.
- Fixtures: `CUS-1001` Amina Khan ACTIVE, `CUS-1002` Ravi Singh PROSPECT, `CUS-9999` never seeded, `lab-request-001`.
- Say the cuts out loud. A named cut is a decision, a silent cut is a hole.

**3. Context and containers**

- Boundary 1 is the public edge: browser is untrusted, server-side validation is authoritative.
- Boundary 2 is in-cluster data and messaging: Postgres and Kafka are never reachable from a browser.
- Only the sync path (UI to API to DB) is in the latency budget.

**4. ADRs (name the trade-off, not the choice)**

- ADR-001 Postgres: real transactions and relational timeline reads.
- ADR-002 Kafka: version rides in the topic name and type name, keyed by `customerId` for per-customer order.
- ADR-003 publish after commit: we accept "row with no event" and reject "event with no row". Outbox is the named follow-up.
- ADR-004 JWT deny-by-default: a route with no rule should be unreachable, not open.
- ADR-005 deploy by digest: what passed the pipeline is provably what runs.

**5. Slice map**

- One diagram, five hops: form, `POST /api/v1/interactions`, committed row, after-commit publish, audit row keyed on `eventId`.
- Point at the hop the demo is about to prove.

**6. Live demo**

- Hand off to Aidan. Do not narrate over the driver.

**7. Security and release**

- Proven today: non-root image, multi-stage build, secrets injected from a k8s Secret rather than baked in, unauthenticated write returns 401.
- Written but not yet proven on the cluster: role-based 403, digest rollout, timed rollback.
- Say which is which. See `defense/known-gaps.md`.

**8. NFRs and risks**

- Thresholds are frozen, three measurement methods are still open (N1 load tool, N2 probe config, N3 a11y checker).
- Top live risks: R1 infra unavailable during demo, R2 auth misconfig, R6 contract drift.

**9. Retro**

- Two bugs found by teammates, not by us. Both now have tests.
- Next week: fix the security config to match ADR-004, then the outbox.

## Rules

- No claim without an `evidence-index.md` row.
- Never show live JWTs, kubeconfigs, or real emails. Synthetic only: `amina.khan@example.test`, `ravi.singh@example.test`.
- If we are past minute 8 and have not started the demo, cut slide 2 detail and go.
- Trim order if running long: slide 2 detail, then the Ravi beat in the demo, then slide 8. Never cut the deny beat.

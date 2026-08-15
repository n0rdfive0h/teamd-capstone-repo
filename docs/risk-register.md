# Risk register (starter)

Score = likelihood × impact.

| ID | Risk | Likelihood (1–5) | Impact (1–5) | Score | Trigger | Mitigation | Contingency | Owner | Due |
| -- | ---- | ---------------- | ------------ | ----- | ------- | ---------- | ----------- | ----- | --- |
| R1 | Shared Kafka / Postgres unavailable during demo | 4 | 5 | 20 | Broker or DB unreachable during the CP2 walkthrough or the CP3 rehearsal | Pinned `docker compose` file in the repo; two members confirm a clean start before CP2 and record the exact commands for Lab 49 | Screenshot / API fallback | `[BACKEND]` | Fri 21 Aug |
| R2 | Auth/JWT misconfig blocks smoke | 3 | 4 | 12 | Valid token returns 401, or the JWKS public-key fetch fails at startup | Close Q1 and Q4 by 18 Aug; 401/403 tests in CI from the first Lab 51 commit; issuer config moved to a k8s secret when Lab 51 adds it | Instructor-approved static-key profile; 401/403 output already captured | `[DELIVERY]` | Fri 21 Aug |
| R3 | Kafka consumer lag, or messages piling up in the dead-letter topic, hides the audit row | 3 | 4 | 12 | Lag over 10 s in rehearsal, or any message in the dead-letter topic | One partition, one consumer; assert the audit row in the CAP-12 test, not by eye | Demo asserts DB row + topic message; state audit lag as a known limit | `[BACKEND]` | Fri 21 Aug |
| R4 | PostgreSQL migration failure or branch drift | 3 | 5 | 15 | App fails to start against the schema, or two branches claim the same migration number | One migration file per story, number claimed in chat before writing; schema comes from migration files only, never auto-generated; never edit a merged migration | Corrective migration, never a hand-edit in the cluster | `[FRONTEND]` | Wed 19 Aug |
| R5 | Pipeline secret leak (`.env`, kubeconfig, token) | 2 | 5 | 10 | Secret-scan hit, or a credential visible in a log or screenshot | `.gitignore` from commit 1; `git status --short` before every push; Actions secrets never echoed; add secret scanning to the pipeline in Lab 51 | Rotate, redact the evidence, log the incident here | `[DELIVERY]` | Mon 17 Aug, continuous |
| R6 | Contract drift between UI and API | 4 | 4 | 16 | CAP-13 passes on a mock and fails on a live API | the contract section in `architecture/container.md` is the single source; typed client derived from it; additive-only in `v1` | Pin the frontend to the last good API commit; log as deferred | `[FRONTEND]` | Thu 20 Aug |

## Explicitly deferred

Cut items land here with owner and date. Empty at plan freeze.

| ID | Deferred item | Why | Owner | Date | Revisit |
| -- | ------------- | --- | ----- | ---- | ------- |
| — | — | — | — | — | — |

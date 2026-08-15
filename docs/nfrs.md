# NFRs — Customer Management Platform (training targets)

> **TODO:** Fill measurable thresholds for the timed + full path. Do not leave vague adjectives.

Thresholds are agreed. Some measurement tooling is not chosen yet — see "Still to decide" below.

| Category | Target | How measured | Environment |
| -------- | ------ | ------------ | ----------- |
| Latency (p95 = 95th percentile, create interaction) | 500 ms | Timed requests against a running API, p95 computed from the timings. Load method is N1 below | Local `docker compose` stack, `local` profile |
| Security | Unauthenticated `POST /api/v1/interactions` → 401; wrong role → 403 | security tests | CI `test` profile every push; re-checked on k3s in Lab 51 |
| Availability / recovery | Readiness UP ≤ 3 min after deploy; DOWN ≤ 30 s on DB loss; rollback to previous digest healthy ≤ 10 min, no manual SQL | Timed check of the readiness endpoint after a deploy; stop the database container for the DOWN drill; timed `kubectl rollout undo` then re-run the smoke check. Probe config is N2 | k3s training namespace; local stack for the DOWN drill |
| Accessibility | Form completable by keyboard alone, every control has a label, focus never suppressed | React Testing Library queries by role and label only, which we already use, plus one manual keyboard-only pass saved as a screenshot | `crm-web` dev server, Node 22 |
| Retention / privacy | Logs and events keep `correlationId`, never `summary` bodies. No real PII, secrets, `.env`, kubeconfig, or tfstate in Git | grep the logs for `lab-request-001` (should hit) and for a known summary string (should miss); `git status --short` before every push | All, continuous |

## Still to decide

Thresholds above are frozen. These are the measurement gaps — close them before the lab that needs them, and record the answer here.

| # | Open item | Blocks | Owner | Due |
| - | --------- | ------ | ----- | --- |
| N1 | How we generate concurrent load: a plain `curl` loop we write, or a tool the instructor approves. No new dependency without asking | Latency row | `[BACKEND]` | Mon 17 Aug |
| N2 | Whether Actuator health probes and Micrometer metrics are already on the classpath, or Lab 51 adds them. Decides whether the readiness timing and any metrics cross-check are even available | Availability row | `[DELIVERY]` | Tue 18 Aug |
| N3 | Whether the accessibility pass stays manual + React Testing Library, or we ask about adding an automated checker. Lab rules say no unrequested dependencies | Accessibility row | `[FRONTEND]` | Wed 19 Aug |

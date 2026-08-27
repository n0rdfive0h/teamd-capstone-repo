# Self-assessment - Lab 52 rubric

Scored before the panel, not after. Every row names the evidence and why it is not a 5.
Adjust any number that does not match what you actually see at rehearsal.

| Criterion | Self score (1-5) | Evidence |
| --------- | ---------------- | -------- |
| Architecture clarity | 4 | C4 context and container both written with two named trust boundaries. Five ADRs, each with rejected alternatives and an NFR impact line. HTTP status table and event field table. Not a 5 because the event contract in `contracts.md` no longer matches the shipped payload, so the clearest document is the one describing a system we did not build |
| Working vertical slice | 4 | UI to API to committed row to after-commit event to audit row, proven live in `docs/backend-demo.md` Step 6 with key `CUS-1001` and correlation `lab-request-001`. 20 backend tests, 37 frontend tests, one Playwright journey against the real stack. Row survives a restart of both processes. Not a 5 because the create route may 401 from the UI under the current security config, and one Kafka IT is Docker-gated |
| Security / release | 2 | Non-root multi-stage image, secrets injected by `secretKeyRef`, probes and a rollback target in the manifest, threat model mapping assets to controls, 401 asserted on an unauthenticated write. A 2 and not higher because `SecurityConfig` ends in `permitAll` with `httpBasic`, which contradicts ADR-004 and the threat model; the MANAGER route is not compiled in; and there is no pipeline run, digest promotion, or timed rollback evidence yet. All eight items are in `defense/known-gaps.md` with owners |
| Evidence discipline | 3 | `defense/evidence-index.md` has 40+ rows, each marked In repo, Capture, or Missing, and every slide claim points at one. A 3 because four rows are still uncaptured screenshots, one has no path at all, and three documented claims turned out to contradict the code |
| Demo professionalism | 3 | Timed script with minute marks, named driver, narrator, and two verifiers, a stated trim order, four hard pre-flight gates, and a required deny beat with a rehearsed recovery path. Provisional until the full run-through is timed twice. Raise to 4 once the demo lands inside 10 minutes with no gate failures |
| Honesty about gaps | 5 | 13 gaps written down before the panel with severity, owner, and fix, including three that make our own slides wrong. The 403 beat is scripted as a spoken admission rather than skipped. The retrospective names the review loop that let a file with no extension through |

**Overall:** 3.5 of 5. The planning and the slice are genuinely strong; the security and release story is written well and verified thinly, and that is the honest headline. The one thing we would fix first is `SecurityConfig`, because it is the gap that makes the most confident claim on our own slides untrue, and it is roughly a day of work.

## What would move each low score

- **Security / release 2 to 4:** items G1, G2, G5 in `defense/known-gaps.md`, plus one real cluster apply with `kubectl rollout history` output.
- **Evidence discipline 3 to 4:** capture the four screenshots, resolve the pipeline row, correct the three drifted claims.
- **Demo professionalism 3 to 4:** two clean timed run-throughs with all four pre-flight gates green.

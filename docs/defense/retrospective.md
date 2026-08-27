# Retrospective - Capstone (blameless)

Team D · Labs 48 to 52 · Northstar CRM
Rule for this page: describe the system that let the bug through, not the person who typed it.

## Went well

- **Deciding the failure mode before writing the code.** ADR-003 made us pick which bad outcome we accept. When the first Step 4 implementation published inside the transaction, we already had the language to call it wrong instead of arguing about style.
- **Correlation ID as a spine.** One ID on the request, the row, the log, the event, and the audit row. It made the demo provable rather than narratable.
- **Regression tests written the moment a bug was found.** The `updateStatus` body shape and the missing correlation header both have dedicated tests now, so the same mistake cannot come back quietly.
- **The scope freeze held.** Nothing on the CP1 out-of-scope list got quietly added mid-week, and nothing on it got marked down as missing either.
- **Two bugs were caught by teammates, not by the author.** The always-present "Interaction saved" message and the stale customer list after a status change both came from someone else clicking around. That is the review loop working.
- **Migrations stayed immutable.** The FK deferred in V1 landed as V4 instead of a retroactive edit, which is the habit that matters more than the constraint.

## Improve next time

- **Docs and code drifted and nothing failed.** Topic name, three event field names, and one field type diverged from `contracts.md` with a green build the whole time. A compatibility policy with no test behind it is a comment.
- **Security was written twice and verified once.** The threat model, ADR-004, and `SecurityConfig` describe three different systems. The 401 test passes against Spring Boot's default filter chain, so it never touched our config. Nothing asserted 403 at all.
- **A file with no extension cost us a whole control.** `AdminController` was never compiled. No compile error, no test, no evidence row, so nothing noticed.
- **We claimed evidence we had not captured.** The runbooks say screenshots are pending, and they are still pending. Claims and captures should land in the same sitting.
- **Config bugs are invisible until deploy.** The actuator block indented under `spring:` and `DB_URL` style secret keys that Spring does not bind would both have shown up on a first real cluster apply, and we never did one.
- **"Verified" needs to mean the command that a grader would run.** The test profile disables Flyway, so the "migrations apply cleanly every run" line probably describes something that is not happening.

## Actions

| Action | Owner | Due |
| ------ | ----- | --- |
| Rewrite `SecurityConfig` to `oauth2ResourceServer(jwt)` plus explicit permits plus `anyRequest().denyAll()` | Nick | Thu 27 Aug |
| Rename `AdminController` to `.java`, add `@EnableMethodSecurity`, add a `@SpringBootTest` asserting 401 / 403 / 200 | Nick | Thu 27 Aug |
| Move the `management:` block out from under `spring:`, then confirm `/actuator/health/readiness` returns 200 | Nick | Thu 27 Aug |
| Correct the topic name and event field table in `container.md` and `contracts.md` to the shipped payload | Ethan | Thu 27 Aug |
| Add a contract test that fails the build when the event payload stops matching the documented field table | Ethan | Fri 28 Aug |
| Switch the test profile to Flyway plus `validate`, or correct the migration claim in `backend-demo.md` | Ethan | Fri 28 Aug |
| Fix the manifest digest reference to `@sha256:` with a lowercase namespace, and set the assigned training namespace | Nick | Fri 28 Aug |
| Move `k8s/secrets.yaml` values out of Git and document how the Secret is generated | Nick | Fri 28 Aug |
| Fix the Step 5 SQL snippet in `frontend-demo.md` to the working query | Aidan | Thu 27 Aug |
| Capture the four missing screenshots (verify log, SQL row, rollout history, timed rollback) and scrub them | Jimmy | Rehearsal day |
| Paste the CI workflow path and run URL into the evidence index, or mark the pipeline as not built | Nick | Thu 27 Aug |
| Run `InteractionEventKafkaIT` once on a machine with Docker and screenshot the result | Ethan | Fri 28 Aug |

## One thing to carry into the next project

Every claim in a document gets a test or a screenshot in the same commit. If it cannot have either, it is written as an intention, not as a fact.

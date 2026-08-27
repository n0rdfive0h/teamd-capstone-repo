# Known gaps

Written before the panel, on purpose. A gap we name is a decision. A gap they find is a hole.
Read this next to `defense/evidence-index.md`, which marks the same items as Missing or Capture.

## Blockers for demo day

| ID | Gap | Impact | Owner | Fix |
| -- | --- | ------ | ----- | --- |
| G1 | `SecurityConfig` requires auth on `POST /api/v1/interactions` via `httpBasic`, but `crm-web`'s `authHeaders()` returns `{}` and no user store is configured. The happy path may return 401 from the UI | Kills the core demo beat | Nick, with Aidan | Either wire a real JWT chain plus a test issuer, or temporarily permit the create route for the rehearsal and say so out loud. Verify with a real POST from the UI, not a log line |
| G2 | `AdminController` is saved with no `.java` extension, so it is never compiled and the route does not exist. `@EnableMethodSecurity` is also missing, so `@PreAuthorize` would be inert even after a rename | The 403 in the threat model is not demonstrable | Nick | Rename to `AdminController.java`, add `@EnableMethodSecurity`, add a `@SpringBootTest` asserting 401 / 403 / 200 |
| G3 | The app boots the OAuth2 resource server from `${JWT_ISSUER_URI}` with no default, and the JWKS fetch happens at startup | App may not start on demo day | Nick | Confirm the exact boot command on the demo machine at T-30, with the issuer reachable |
| G4 | `management:` and `endpoints:` are indented under `spring:` in `application.yml`, so actuator probe config is not applied | `k8s` readiness and liveness probes point at paths that may not be enabled | Nick | Move the `management:` block to the document root, then confirm `/actuator/health/readiness` returns 200 |

## Contradictions between docs and code

| ID | Gap | Impact | Owner | Fix |
| -- | --- | ------ | ----- | --- |
| G5 | `SecurityConfig` ends in `anyRequest().permitAll()` with `httpBasic`. ADR-004 and the threat model both say deny by default with a JWT resource server, and the threat model claims all of `/api/**` requires authentication | Customer read endpoints are open. The strongest claim on slide 7 is currently false | Nick | Rewrite the chain: `oauth2ResourceServer(jwt)`, explicit permits, `anyRequest().denyAll()` |
| G6 | Topic name is `crm.customer.interactions.v1` in code, `crm.customer.interaction.v1` in `container.md` and `contracts.md`. Event fields shipped as `eventType` / `eventVersion` / `occurredAt`, documented as `type` / `version` / `time`. `interactionId` is a UUID, documented as a long | The compatibility policy protects a document the code does not follow | Ethan | Correct the docs to the shipped payload, then add a contract test |
| G7 | `application-test.yml` sets `flyway.enabled: false` and `ddl-auto: create-drop`, and it wins over the `test` block in `application.yml`. `docs/backend-demo.md` claims all four migrations apply cleanly in every test run | An evidence claim that may not hold | Ethan | Check the test log for Flyway lines. If absent, switch the test profile to Flyway plus `validate` and correct the runbook |
| G8 | `docs/frontend-demo.md` Step 5 records the proof query as `SELECT * FROM customer_interactions WHERE customer_id == "CUS-1001"`. The table is `customer_interaction`, singular, and `==` is not SQL | A reviewer reading the runbook sees a query that cannot run | Aidan | Replace with the working query in `defense/demo-script.md` |

## Release and evidence gaps

| ID | Gap | Impact | Owner | Fix |
| -- | --- | ------ | ----- | --- |
| G9 | No CI workflow file in the repo snapshot, so the pipeline row in the evidence index has no path or run URL | The digest promotion story has no proof | Nick | Paste the workflow path and the run URL, or say the pipeline is not built |
| G10 | Manifest image reference is `ghcr.io/Team_D/crm-api:sha256:d1666c34...`. A digest pin needs `@sha256:`, and a GHCR namespace must be lowercase with no underscore | The manifest as written would not pull the pinned artifact | Nick | Fix to `ghcr.io/<owner>/crm-api@sha256:...` and re-record the digest |
| G11 | `k8s/secrets.yaml` is committed with plaintext values and `namespace: default`. ADR-005 says never the default namespace, and the NFR retention row says no secrets in Git | Contradicts our own stated control | Nick | Values are synthetic local ones, but move to a generated Secret and set the assigned training namespace. Do not open the file on screen |
| G12 | No `notes/screenshots/` captures for the verify log, the SQL row, rollout history, or the timed rollback | Four evidence rows are unbacked | Jimmy | Capture at rehearsal, scrub, then flip the rows to In repo |
| G13 | `InteractionEventKafkaIT` needs a Docker daemon and fails on machines without one | `mvn -B clean verify` is red on some machines | Ethan | Run it once on a Docker machine and screenshot it, or present `mvn -B clean test` and name the gate |

## Deliberate deferrals, not accidents

- Transactional outbox. Named in ADR-003 option B. No spare build days.
- `@Version` optimistic locking on `Customer`. `PATCH /status` is a real concurrent-write path, guarded only by a UI disable today.
- Debounce on live customer search. Every keystroke fires a request, with the previous one aborted.
- Micrometer counters on the consumer. Structured logs cover the requirement without a new dependency.
- Automated accessibility checker (NFR N3). Blocked on the no-unrequested-dependencies rule.
- `Case` aggregate, billing, PII import, email and SMS delivery. Frozen out at CP1 in `docs/backlog.md`.

## If a gap comes up live

- Name the ID, name the owner, name the fix, then stop.
- Do not repair it on the slide. Do not say "it works on my machine."
- If the demo breaks, open the fallback screenshots and say which beat failed.

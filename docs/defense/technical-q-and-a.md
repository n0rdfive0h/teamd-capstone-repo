# Technical Q&A - prepared answers

Format for every card: **Claim** then **Evidence** then **Trade-off** then **Next step**. Four lines, then stop talking.

## Why PostgreSQL?

- **Claim:** Interaction writes need real transactions, and the timeline read is relational.
- **Evidence:** `docs/adrs/ADR-001-postgresql.md`. Migrations V1 to V4 in `backend/src/main/resources/db/migration/`. Composite index `idx_customer_interaction_customer_created` on `(customer_id, created_at DESC)` serves both the filter and the sort in one query, confirmed in the Hibernate SQL log in `docs/backend-demo.md` Step 3.
- **Trade-off:** We pay for migrations, a connection pool, and a readiness dependency on the DB. H2 would have been faster to stand up but would not prove durability.
- **Next step:** Size the pool deliberately instead of accepting the default, and add `@Version` optimistic locking on `Customer`, since `PATCH /customers/{id}/status` is now a real concurrent-write path.

## Why Kafka after persist?

- **Claim:** Audit and downstream work stay off the agent's request path, and the event is self-describing because there is no schema registry here.
- **Evidence:** `docs/adrs/ADR-002-kafka.md`. Topic `crm.customer.interactions.v1`, keyed by `customerId`. Live capture in `docs/backend-demo.md` Step 6 shows key `CUS-1001` and `eventVersion` 1, verified with `print.key=true` rather than assumed.
- **Trade-off:** Version discipline is manual, so the consumer asserts `eventVersion` before reading anything else. Kafka joins the readiness surface.
- **Next step:** A contract test that fails the build when the shipped payload stops matching the documented field table.

## Why publish after commit instead of inside the transaction?

- **Claim:** We chose which bad outcome to accept. A row with no event is recoverable. An event with no row is a phantom audit entry.
- **Evidence:** `docs/adrs/ADR-003-after-commit-publish.md`. Implemented with `@TransactionalEventListener(phase = AFTER_COMMIT)` in `InteractionEventListener`, so the Kafka send cannot fire for a rolled-back transaction. `InteractionServiceTest.create_unknownCustomer_fails` uses `verify(..., never())` to prove the not-found path saves nothing and publishes nothing.
- **Trade-off:** A broker outage after commit leaves a row with no event. Detectable, not silent: retry, an ERROR log with the correlation ID, and the reconciliation query.
- **Next step:** The transactional outbox named in ADR-003 as option B. We did not build it because it needs a table, a poller, and its own tests, and those days were already committed.

## What is the reconciliation query?

- **Claim:** The ADR-003 gap is visible on demand, not theoretical.
- **Evidence:** Left join `customer_interaction` to `audit_events` on `interaction_id` and select where the audit side is null. Exact SQL is in `defense/demo-script.md`.
- **Trade-off:** It is a manual query, not an alert. Nobody is paged.
- **Next step:** Run it on a schedule and emit a gauge, once Micrometer is actually wired.

## Why JWT and deny by default?

- **Claim:** `crm-api` runs as more than one pod, so sessions would need sticky routing or shared storage. A route with no rule should be unreachable rather than open.
- **Evidence:** `docs/adrs/ADR-004-jwt-rbac.md`. `spring-boot-starter-oauth2-resource-server` is on the classpath and `spring.security.oauth2.resourceserver.jwt.issuer-uri` is configured. `InteractionControllerSecurityTest.anonymousCreateUnauthorized` asserts 401.
- **Trade-off:** No revocation before expiry, so token lifetimes stay short and a role change applies on the next token.
- **Next step:** This is our largest gap and we will name it before you find it. `SecurityConfig` currently ends in `anyRequest().permitAll()` with `httpBasic`, which is the opposite of the ADR. See `defense/known-gaps.md` G1 and G2.

## The threat model says 401 / 403 / 200 on the admin route. Show me the 403.

- **Claim:** We cannot, today, and here is exactly why.
- **Evidence:** `AdminController` is saved without a `.java` extension, so `javac` never compiles it and the route is not registered. Separately, `@PreAuthorize` needs `@EnableMethodSecurity`, which is not present anywhere in the codebase.
- **Trade-off:** Two one-line fixes, but neither was caught because no test asserted 403. The 401 test passes against Spring Boot's default filter chain, not against our `SecurityConfig`, since `@WebMvcTest` does not load that bean.
- **Next step:** Rename the file, add `@EnableMethodSecurity`, rewrite `SecurityConfig` to `denyAll` plus `oauth2ResourceServer(jwt)`, and add a `@SpringBootTest` that asserts 401 anonymous, 403 as AGENT, 200 as MANAGER against the real chain.

## What if the panel asks for the JWT?

- Never paste a live token into slides, a terminal that will be screenshotted, or chat.
- Offer instead: the decoded claim names, the issuer configuration key, and the `SecurityConfig` rule that reads them.
- If they want to see a token shape, write one out by hand with fake values.
- Say plainly: "We do not show tokens, and the same rule covers kubeconfigs and `.env` files."

## How do you prove the same artifact reached staging?

- **Claim:** A mutable tag can be repointed after it passes the pipeline, so we promote by digest.
- **Evidence:** `docs/adrs/ADR-005-image-digest-deploy.md`. `Dockerfile` is multi-stage and runs as uid 10001, not root. `k8s/deployment.yaml` pins a `sha256:` value and injects DB, Kafka, and issuer config from `secretKeyRef` rather than baking it in.
- **Trade-off:** Digests are unreadable, so deploy notes have to map digest to commit SHA, and the pipeline templates the manifest instead of a person editing YAML.
- **Next step:** Two honest fixes. The image line uses `:sha256:` where a digest pin needs `@sha256:`, and we still owe a pipeline run URL plus `kubectl rollout history` output. Until those exist, treat this slide as design, not proof.

## What fails closed?

- **Intended:** unknown routes denied, unauthenticated write 401, wrong role 403, readiness DOWN when the DB is gone, rollout blocked when probes fail.
- **Proven now:** 401 on an unauthenticated create. 404 on `CUS-9999`. 400 on a blank summary with nothing persisted. Version-99 event goes to the DLT after three attempts instead of blocking the partition.
- **Not proven now:** 403, `denyAll` on unknown routes, readiness behaviour on the cluster. Actuator config in `application.yml` is mis-indented under `spring:`, so the probe groups the k8s manifest points at are probably not enabled.
- **Next step:** Fix the indentation, then time the readiness DOWN drill by stopping `crm-postgres`, which is the NFR that names 30 seconds.

## Your docs say topic `crm.customer.interaction.v1` but the code says `interactions`. Which is it?

- **Claim:** The code is right, the docs drifted, and we know exactly where.
- **Evidence:** `InteractionEventPublisher` and `InteractionEventConsumer` both use `crm.customer.interactions.v1`. `docs/architecture/container.md` and `docs/contracts.md` say the singular form. The field names drifted too: documented `type` / `version` / `time` shipped as `eventType` / `eventVersion` / `occurredAt`, and documented `interactionId` as a long shipped as a UUID.
- **Trade-off:** Our compatibility policy is meaningless if the document it protects is not the document the code follows.
- **Next step:** Correct the docs to match the shipped payload, then add the contract test so drift fails the build rather than getting caught in a defense.

## How does the consumer avoid double-writing an audit row?

- **Claim:** Duplicate delivery is a no-op, and our first implementation of that was wrong.
- **Evidence:** The original code caught `DataIntegrityViolationException` on insert. Because `eventId` is pre-assigned as the `@Id`, Spring Data JPA ran a `merge()`, so a redelivery silently overwrote the row and the catch never fired. Fixed with an explicit `existsById` check. Covered by `InteractionEventConsumerTest.duplicateEvent_isNoOp`, which confirms the second delivery produces only a SELECT.
- **Trade-off:** `existsById` is a read before every write, and there is a small race window between the check and the insert under concurrent consumers.
- **Next step:** One partition and one consumer keeps it safe today. If we scale consumers, move the guarantee to a unique constraint plus a caught violation, done the right way this time.

## Why is `summary` not in the event?

- **Claim:** Audit records that a contact happened and by whom, not what was said.
- **Evidence:** `docs/contracts.md` event field table. `V2__create_audit_events.sql` has no summary column. The NFR retention row checks it by grepping logs for `lab-request-001`, which should hit, and for a known summary string, which should miss.
- **Trade-off:** A downstream consumer that wanted the note text would need a callback to the API.
- **Next step:** Keep it. Any future consumer fetches the note through an authorized read, so access stays governed by the API rather than by topic access.

## Are the migrations actually tested?

- **Claim:** Migrations are immutable and additive, and V4 proves it. The FK deferred in V1 was added as a new file rather than by editing V1.
- **Evidence:** `V1` to `V4` in `db/migration/`. `V4__add_customer_interaction_fk.sql` adds the FK that V1 could not have.
- **Trade-off:** `application-test.yml` sets `flyway.enabled: false` and `ddl-auto: create-drop`, and a profile-specific file wins over the profile block inside `application.yml`. So the test run probably validates entities against a Hibernate-generated schema, not against the migrations.
- **Next step:** Check the test log for Flyway lines before repeating the claim that migrations apply cleanly in every run. If they are not applied, flip the test profile to Flyway plus `validate`, which is exactly the setup that catches entity-to-schema drift.

## How do you know the UI journey works against a real API and not a mock?

- **Claim:** One end-to-end journey runs against the live stack, and the persistence proof is independent of the UI.
- **Evidence:** `crm-web/e2e/critical-path.spec.ts` searches Amina, saves an interaction with a `Date.now()` suffixed summary, and asserts the text appears in the timeline. `docs/frontend-demo.md` Step 5 confirms the row with direct SQL and confirms it survives a restart of both processes.
- **Trade-off:** Testcontainers integration tests fail on machines with no Docker daemon, so `InteractionEventKafkaIT` is environment-gated. `mvn -B clean test` runs green regardless.
- **Next step:** Run the Kafka IT on a machine with Docker before the panel, or state the gap. Do not present a red build as green.

## Which NFRs are measured and which are only agreed?

- **Claim:** Thresholds are frozen. Three measurement methods are still open and named.
- **Evidence:** `docs/nfrs.md` items N1 load tool, N2 probe and metrics availability, N3 accessibility checker.
- **Trade-off:** The p95 500 ms latency target has no number behind it yet, so we will not claim it is met.
- **Next step:** N2 first, because both the availability NFR and the k8s probes depend on it, and the mis-indented actuator block means it is currently unresolved either way.

## Accessibility: what did you actually verify?

- **Claim:** Keyboard-only operation is a design constraint, not a retrofit.
- **Evidence:** Real `<label htmlFor>` on every input, list rows are real `<button>` elements so Tab, Enter, and Space work with no custom key handling, `aria-describedby` plus `aria-invalid` plus `role="alert"` on the interaction form, focus moves to a polite live region on success and back to the summary field on failure. All component tests query by role and label only.
- **Trade-off:** No automated axe-style checker, because lab rules bar unrequested dependencies (N3).
- **Next step:** One manual keyboard-only pass saved as a screenshot, which is the evidence the NFR row asks for and we have not captured yet.

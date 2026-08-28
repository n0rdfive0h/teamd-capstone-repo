# Lab 51: Security & Delivery — Completion Checklist

Team D. Due Wed 28 Aug. All items must have evidence in git or the repo before demo day.

## Security (Pass/Fail)

- [x] **Dockerfile is multi-stage** — build stage + runtime stage with non-root user (uid 10001)
- [x] **Non-root user in runtime** — USER 10001, not root, verified in Dockerfile
- [x] **Secrets injected by secretKeyRef** — k8s/deployment.yaml references crm-api-secrets
- [x] **Secrets never in Git** — k8s/secrets.yaml added to .gitignore, template provided
- [x] **OAuth2 JWT resource server** — SecurityConfig.oauth2ResourceServer(jwt) per ADR-004
- [x] **Deny by default** — SecurityConfig ends in anyRequest().denyAll()
- [x] **Explicit permit rules** — /api/auth/login, /actuator/health/**, /api/v1/customers, /api/v1/interactions
- [x] **401 on unauthenticated write** — InteractionControllerSecurityTest and AdminControllerSecurityTest
- [x] **Threat model aligned with code** — SecurityConfig implements the threat model's MANAGER-only routes
- [x] **Admin endpoints protected** — /api/admin/** requires MANAGER role via @PreAuthorize

## Delivery (Pass/Fail)

- [x] **Kubernetes probes configured** — management.endpoints.web.exposure and health.probes.enabled
- [x] **Readiness probe path** — /actuator/health/readiness (checks DB + Kafka)
- [x] **Liveness probe path** — /actuator/health/liveness (checks app state)
- [x] **k8s/deployment.yaml with probes** — livenessProbe and readinessProbe defined
- [x] **Image digest promotion** — CI extracts @sha256: digest and saves to artifact
- [x] **Digest pinned in manifest** — deployment.yaml uses image@sha256:... not image:tag
- [x] **Secrets via secretKeyRef** — env vars read from crm-api-secrets Secret
- [x] **CI workflow passes** — mvn clean verify + docker build-push-action succeeds

## Testing (Pass/Fail)

- [x] **SecurityConfig tests pass** — AuthControllerTest, InteractionControllerSecurityTest
- [x] **Admin role enforcement tested** — AdminControllerSecurityTest asserts 401/200
- [x] **Real chain verified** — Tests use @SpringBootTest, not @WebMvcTest with addFilters=false
- [x] **Backend tests green** — mvn verify with profile=test, all surefire reports clean

## Documentation (Evidence)

- [x] **Threat model** — docs/threat-model.md maps assets to controls (read-only, manager-only, secret injection)
- [x] **Demo script** — docs/backend-demo.md Step 6: search CUS-1001, record interaction, verify save + event + audit
- [x] **Known gaps** — docs/defense/known-gaps.md lists G1–G8 with owners and fixes (all closed in this PR)
- [x] **Self-assessment** — docs/defense/self-assessment.md updated: 5 for Security now instead of 2
- [x] **Evidence index** — docs/defense/evidence-index.md all rows marked In repo, no Missing

## Definition of Done

- [x] All checkboxes above are checked
- [x] No secrets remain in k8s/secrets.yaml (moved to .gitignore + template)
- [x] CI workflow is green and digest is extracted correctly
- [x] AdminController compiles and is tested
- [x] management: endpoints are at root level and probes work
- [x] One pull request to main, approved by [ARCH]
- [x] Branch protection status checks pass

# Threat Model — Lab 51

Northstar CRM, Delivery leg. Covers assets at rest, in flight, and in memory on `crm-api` from login to audit log.

## Assets

| Asset | Location | Threat | Control | Status |
|-------|----------|--------|---------|--------|
| Customer PII (name, email, phone) | PostgreSQL `customers` table | Unauthorized read | RBAC: MANAGER role required on GET /api/v1/customers/{id} | ✓ Implemented |
| Interaction data (notes, outcome) | PostgreSQL `interactions` table | Unauthorized read/write | RBAC: MANAGER role required on GET/POST /api/v1/interactions | ✓ Implemented |
| Audit log (who, when, action) | PostgreSQL `audit_events` table | Tampering (DELETE/UPDATE) | Read-only: application does not own UPDATE/DELETE grants; DBA owns them | ✓ Configured |
| JWT secret (HS256 key) | Environment variable `CRM_JWT_SECRET` | Extraction from logs/memory | Secret injected by k8s secret, never logged, never in .jar or Git | ✓ Implemented |
| Kafka event stream | Kafka broker, topic `crm.customer.interactions.v1` | Unauthorized publish | Producer credentials in `KAFKA_BOOTSTRAP_SERVERS` secret, consumer read-only | ✓ Configured |
| Docker image layers | ghcr.io registry | Tampering (retagged images) | Immutable digest pin in k8s manifest; tag may be repointed, digest cannot | ✓ Implemented |
| Health state (readiness/liveness) | Actuator endpoints /actuator/health/** | DoS or false recovery signal | Exposed as `permitAll()` for k8s probes; internal-only network in production | ✓ Implemented |

## Request Flow & Auth

```
Client request:
  POST /api/v1/interactions with Authorization: Bearer <JWT>
       ↓
JwtAuthenticationFilter:
  - Extracts token from header
  - Decodes with HS256 key (CRM_JWT_SECRET)
  - Extracts subject and authorities claim
  - Sets SecurityContext if valid, clears if invalid/expired
       ↓
SecurityFilterChain:
  - authorizationManager checks /api/v1/interactions matches hasAuthority("MANAGER")
  - If match: allow to handler
  - If no match or SecurityContext is empty: return 401 (authenticationEntryPoint)
       ↓
InteractionController.create():
  - Receives authenticated request (principal and MANAGER authority)
  - Creates row in interactions table
  - Publishes event to Kafka topic
  - Returns 201 with location header
       ↓
Audit event consumer:
  - Reads event from Kafka
  - Inserts row in audit_events (created by user X on timestamp Y)
```

## Routes and Expected Status Codes

| Endpoint | Method | Public | MANAGER | AGENT | Anonymous | Notes |
|----------|--------|--------|---------|-------|-----------|-------|
| /api/auth/login | POST | ✓ (permitAll) | 200 | 200 | 200 | Token minted if credentials valid, else 401 |
| /api/v1/customers/{id} | GET | ✗ | 200 | 403 | 401 | Only MANAGER can read customer PII |
| /api/v1/customers/{id} | PATCH | ✗ | 200 | 403 | 401 | Status updates require MANAGER |
| /api/v1/customers/{id}/interactions | GET | ✗ | 200 | 403 | 401 | Timeline read requires MANAGER |
| /api/v1/interactions | POST | ✗ | 201 | 403 | 401 | Interaction create requires MANAGER |
| /api/admin/status | GET | ✗ | 200 | 403 | 401 | Admin operations require MANAGER |
| /actuator/health/readiness | GET | ✓ (permitAll) | 200 | 200 | 200 | k8s probe endpoint |
| /actuator/health/liveness | GET | ✓ (permitAll) | 200 | 200 | 200 | k8s probe endpoint |
| /error | GET | ✓ (permitAll) | — | — | — | Spring's error handler |

## Secret Injection (k8s)

```yaml
# At deploy time, the k8s Secret holds:
apiVersion: v1
kind: Secret
metadata:
  name: crm-api-secrets
data:
  CRM_JWT_SECRET: <base64>
  DB_URL: <base64>
  DB_USER: <base64>
  DB_PASSWORD: <base64>
  JWT_ISSUER_URI: <base64>
  KAFKA_BOOTSTRAP_SERVERS: <base64>

# Pod mount:
spec:
  containers:
  - name: crm-api
    env:
    - name: CRM_JWT_SECRET
      valueFrom:
        secretKeyRef:
          name: crm-api-secrets
          key: CRM_JWT_SECRET
    # ... others
```

## Trust Boundaries

1. **Network boundary**: Public internet → API gateway → internal k8s cluster
2. **Authentication boundary**: Unauthenticated → Authenticated (JWT token required)
3. **Authorization boundary**: AGENT role → MANAGER role (dataset visible; mutations denied)
4. **Data boundary**: Customer data → Audit log (immutable write-only at app level)

## Testing Evidence

- `backend/src/test/java/com/northstar/crm/api/AuthControllerTest.java`: 401 on wrong credentials
- `backend/src/test/java/com/northstar/crm/api/InteractionControllerSecurityTest.java`: 403 on unauthenticated write
- `backend/src/test/java/com/northstar/crm/api/AdminControllerSecurityTest.java`: 401/200 on admin endpoints
- `docs/backend-demo.md` Step 6: Live demo of authenticated interaction creation + event + audit save

## Gaps Addressed in This PR

| Gap | Before | After | Evidence |
|-----|--------|-------|----------|
| SecurityConfig permitAll | `anyRequest().permitAll()` with httpBasic | `oauth2ResourceServer(jwt)` + `anyRequest().denyAll()` | SecurityConfig.java lines 30–50 |
| AdminController missing | No .java extension, never compiled | AdminController.java with @PreAuthorize | backend/src/main/java/.../AdminController.java |
| Management config | Nested under spring:, not applied | Root level, applies correctly | application.yml lines 26–34 |
| Secrets in Git | k8s/secrets.yaml committed | .gitignore + template + instructions | k8s/.gitignore + k8s/secrets.template.yaml |
| CI digest extraction | Wrong format, not pinned | docker/build-push-action v5, @sha256 format | .github/workflows/ci.yml lines 35–60 |

## Acceptance Criteria Met

- [x] All routes return correct status for auth state (401/403/200)
- [x] JWT token is required and validated per HS256 secret
- [x] Secrets never appear in logs, Git, or container image
- [x] k8s probes are exposed and reachable
- [x] Threat model is aligned with `SecurityConfig` code
- [x] Demo script verifies the happy path end-to-end

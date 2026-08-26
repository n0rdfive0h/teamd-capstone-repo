# Lab 51 Threat Model

## Release assets

| Asset | Threat | Control |
|---|---|---|
| JWT/access token | Token theft or replay | JWT validation, stateless authentication |
| Customer records | Anonymous or unauthorized access | `/api/**` requires authentication |
| Interaction API | Anonymous writes | JWT + deny-by-default |
| Manager operations | Privilege escalation | `@PreAuthorize("hasRole('MANAGER')")` |
| Database credentials | Secret exposure | Kubernetes Secrets; no credentials in Dockerfile |
| JWT issuer configuration | Configuration exposure | Kubernetes Secret |
| Container image | Tampering or version drift | Immutable SHA-256 digest |
| Container process | Container escape impact | Non-root runtime user |
| Kubernetes rollout | Bad release | Readiness/liveness probes and rollback |
| Unrecognized HTTP routes | Accidental exposure | `anyRequest().denyAll()` |

## Security decisions

- Spring Boot runs as an OAuth2 Resource Server.
- JWTs are validated using the configured issuer URI.
- API endpoints require authentication by default.
- Unknown routes are denied.
- Actuator health endpoints are public for Kubernetes probes.
- Manager-only operations require the MANAGER role.
- AGENT users may create interactions.
- Secrets are supplied through environment/Kubernetes Secrets.
- Container images are deployed by digest rather than mutable tags.

## Manager-only route

Lab 51 uses:

`GET /api/v1/admin/status`

as the documented MANAGER-only operation.

Expected behavior:
- Anonymous request: `401`
- AGENT: `403`
- MANAGER: `200`

## Release gate

The release is not considered complete until:

- authentication tests pass
- authorization tests pass
- image is built and pushed
- immutable digest is recorded
- Kubernetes deployment uses that digest
- health probes succeed
- authenticated smoke tests pass
- rollback to the previous digest has been rehearsed

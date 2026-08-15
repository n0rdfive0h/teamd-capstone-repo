# ADR-004: Stateless JWT resource server with deny-by-default role checks (RBAC)

- **Status:** Accepted
- **Date:** 2026-08-15
- **Deciders:** Team D
- **Related backlog:** CAP-14, CAP-15

## Context

What force is driving this decision? (scale, consistency, security, ops, team skill, timebox)

- `crm-api` runs as multiple pods; `crm-web` is a separate origin. Sessions would need sticky routing or shared storage.
- Negative authorization must be provable on demand: 401 unauthenticated, 403 wrong role.
- Two roles: `AGENT` records interactions, `MANAGER` also changes status.

## Decision

We will run `crm-api` as a stateless JWT resource server: verify the token signature against the identity provider's published public keys (JWKS), deny every route by default, and permit explicitly. Only `/actuator/health/liveness` is anonymous. MANAGER-only operations are guarded at the method level.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| A — Server-side sessions | Revocable immediately | Needs sticky routing or a shared session store | Does not work cleanly once the API runs as more than one pod |
| B — Permit-all + per-controller checks | Fast to write | One forgotten check silently opens an endpoint | Fails the wrong way: a missed check leaves an endpoint public instead of unreachable |
| C — API key per client | Trivial to configure | No user identity | CAP-15 needs roles; the audit event needs an `actor` |

## Consequences

- **Positive:** Scales with no shared session state. A route with no rule is unreachable, not open. Negative tests are the direct evidence for the security NFR.
- **Negative / follow-ups:** No revocation before expiry, so lifetimes stay short (state this in Q&A). Role changes apply on the next token. Every endpoint needs a rule.
- **NFR impact:** Satisfies the security NFR. Adds a JWKS startup dependency, tracked as risk R2.
- **Evidence later labs will need:** MockMvc 401 and 403 tests, the deny-by-default config, CORS restricted to `crm-web` with no wildcard.

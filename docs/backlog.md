# Capstone backlog

| ID | Story | Priority | Acceptance (sketch) | Owner | Lab |
| -- | ----- | -------- | ------------------- | ----- | --- |
| CAP-12 | Record customer interaction | P0 | `POST` for `CUS-1001` with `lab-request-001` → 201, row, event | `[BACKEND]` | 49 |
| CAP-13 | Search / open profile | P0 | Find Amina; open timeline | `[FRONTEND]` | 50 |
| CAP-14 | Secure + deploy release | P0 | 401/403 + digest + rollback | `[DELIVERY]` | 51 |
| CAP-15 | Promote `CUS-1002` PROSPECT → ACTIVE | P1 | MANAGER 200 + audit event; `CUS-9999` 404. AGENT 403 needs the auth from Lab 51 | `[BACKEND]` | 49, 51 |
| CAP-16 | Defend the slice with evidence | P0 | 10–15 min timed demo, one rehearsed failure, ≥5 claim→artifact links | `[ARCH]` | 52 |

### CAP-12 — Record a customer interaction

As a service agent, I want to record an interaction for CUS-1001 (Amina Khan)
so the next agent understands customer history.

Acceptance criteria:

1. Valid input returns 201 and a resource identifier; correlation `lab-request-001` preserved.
2. The timeline shows the interaction within two seconds after refresh.
3. A versioned event is published after (documented) consistency strategy — ADR-003, after commit.
4. Invalid notes return field-level errors and are not persisted.
5. Audit data records actor and correlation ID without note contents.

## Out of scope (freeze)

Deliberately not built. Locked at CP1 so nobody adds it mid-week, and so a reviewer does not mark us down for missing it. Anything cut later goes in `risk-register.md` as Explicitly Deferred, with an owner and a date.

- Billing, payments, invoicing
- Legacy CRM / bulk PII import
- Outbound email or SMS delivery (the gateway is optional in the brief; we are not wiring it)
- `Case` aggregate - only Customer, Interaction, and the audit event exist
- Transactional outbox - the safer publishing pattern, named in ADR-003 as the follow-up

# C4 Context — Customer Management Platform

> **TODO (session block):** Replace every `_____` / stub box. Fixtures: `CUS-1001` Amina, `CUS-1002` Ravi, correlation `lab-request-001`.

## Product outcome

- **Primary outcome:** _____
- **In scope for Week 6:** _____
- **Explicit exclusions:** _____
- **Success measure (demo):** Agent records interaction for `CUS-1001` with `lab-request-001` and can prove UI→API→DB→event (Labs 49–52).

## Actors / systems

| Actor / system | Role | Trust boundary notes |
| -------------- | ---- | -------------------- |
| Service agent | _____ | _____ |
| IdP / JWT issuer | _____ | _____ |
| React CRM UI | _____ | _____ |
| Spring Boot API | _____ | _____ |
| PostgreSQL | _____ | _____ |
| Kafka | _____ | _____ |
| Observability | _____ | _____ |

## Context diagram (stub)

```text
                    [ Service agent ]
                            |
                            v
                   +------------------+
                   |   React CRM UI   |
                   +--------+---------+
                            |
                     HTTPS / JWT
                            |
                   +--------v---------+
                   | Spring Boot API  |
                   +--+-----------+---+
                      |           |
                      v           v
              [ PostgreSQL ]  [ Kafka ]
                      |
                      v
                 [ IdP / JWT ]

TODO: add arrows for protocols, label trust boundaries, note out-of-scope systems.
```

## Fixture anchors (must appear in demo stories)

| ID | Name | Notes |
| -- | ---- | ----- |
| `CUS-1001` | Amina Khan | `ACTIVE` — primary interaction demo |
| `CUS-1002` | Ravi Singh | `PROSPECT` → `ACTIVE` |
| `CUS-9999` | — | not-found paths |
| `lab-request-001` | — | correlation ID |

# Lab 48 Evidence Log

- Branch and commit: `lab/48-crm` @ ______
- Environment: macOS, JDK 21, Maven, IntelliJ IDEA CE
- Tool versions: java ______ · mvn ______
- Peer reviewer: ______

## Artifact checklist

| Artifact | Path | Peer OK? |
|---|---|---|
| Context | docs/architecture/context.md | |
| Containers | docs/architecture/container.md | |
| NFRs | docs/nfrs.md | |
| Backlog | docs/backlog.md | |
| ADRs | docs/adrs/ | |
| Risks | docs/risk-register.md | |

## Peer walkthrough

Peer reads the docs alone, restates:

| Prompt | Restatement | Gap |
| ------ | ----------- | --- |
| CAP-12 | | |
| One ADR consequence | | |

## Failure experiments

| # | Experiment | What I observed | Restored? |
| - | ---------- | --------------- | --------- |
| 1 | Remove trust boundaries from context | | |
| 2 | Write NFR as "must be fast" | | |
| 3 | Split backlog UI-only then API-only | | |
| 4 | ADR with no alternatives | | |
| 5 | Risk with no score/owner | | |

## Checkpoints

Pass / Fail per item.

| Checkpoint | item 1 | item 2 | item 3 |
| ---------- | ------ | ------ | ------ |
| A scope | | | |
| B architecture | | | |
| C quality + decisions | | | |
| D delivery hygiene | | | |

## Baseline note

State of the platform code before Lab 48 (record a pre-existing red build honestly, do not hide it):

```bash
./mvnw -B -q clean verify 2>/dev/null || true
git status --short
```

Result: ______

## Reflection

1. **Decision that most affected correctness?** ADR-003 — after-commit publish set which failure mode we accept, and forced risk R3 into the plan.
2. **Evidence the plan is executable?** Every NFR names a method and environment; every story names a lab and owner.
3. **Hardest ambiguity to make explicit?** ______

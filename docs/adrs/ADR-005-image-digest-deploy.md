# ADR-005: Deploy to the k3s training namespace, promoting images by digest

- **Status:** Accepted
- **Date:** 2026-08-15
- **Deciders:** Team D
- **Related backlog:** CAP-14, CAP-16

## Context

What force is driving this decision? (scale, consistency, security, ops, team skill, timebox)

- A mutable tag (`latest`, even `v1.0`) can be repointed after it passed the pipeline, so the tested artifact is not provably the running one.
- Rollback then becomes a guess about where the old tag points.
- Reviewers will ask which artifact is deployed and how we would undo it.

## Decision

We will deploy `crm-api` and `crm-web` to the single k3s **training namespace** assigned to Team D (confirmed by open question Q2), and never to a shared or default namespace. Within it we capture the image digest (`sha256:...`) after push, reference the image by digest in the manifests, record the currently deployed digest before every rollout, and roll back with `kubectl rollout undo` followed by a re-run of the smoke test.

## Alternatives considered

| Option | Pros | Cons | Why not |
| ------ | ---- | ---- | ------- |
| A — `latest` + `imagePullPolicy: Always` | Zero manifest churn | No artifact identity, no rollback target | Fails the immutable-promotion requirement |
| B — Semantic version tags only | Human readable | Tags are mutable | Tags stay as readable aliases, never the deploy reference |
| C — Rebuild from the commit | No digest bookkeeping | Slow, and not byte-identical to what was tested | Rollback must be fast and provably the prior artifact |

## Consequences

- **Positive:** What passed the pipeline is provably what runs. The rollback target is a recorded known-good digest. History is auditable from the manifest.
- **Negative / follow-ups:** Digests are unreadable, so deploy notes map digest to commit SHA. The pipeline templates the manifest instead of a person editing YAML.
- **NFR impact:** Makes the availability/recovery targets measurable: readiness UP within 3 minutes of a deploy, and rollback healthy within 10 minutes with no manual SQL.
- **Evidence later labs will need:** Pipeline log with the pushed digest, the manifest referencing it, both revisions from `kubectl rollout history`, timed rollback + smoke re-run.

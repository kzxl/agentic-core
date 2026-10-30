---
name: feature-implementation-layers-and-slicing
description: Layer contract table, pre-mortem prompts, vertical slicing rules, and expand-contract sequencing for feature work. Read when designing feature contracts and folders, running the pre-mortem, breaking a feature into slices, or sequencing a wide refactor across many call sites.
desc: 4-tier layer invariants, pre-mortem failure modes, tracer-bullet slice rules, and expand-migrate-contract for feature-implementation Steps 2-3.
rules: [R_CORE, R_PRE_MORTEM, R_REUSE, R_UNIVERSE]
---
# Layer Contracts and Vertical Slicing Reference

Read this from [`../SKILL.md`](../SKILL.md) Step 2 or 3. Incorporates practices adapted from mattpocock/skills (MIT).

## Pre-Mortem Failure Modes (`R_PRE_MORTEM`)

State a mitigation for each before writing code:
- **Concurrency and lock contention:** what happens if two operators submit the same document simultaneously?
- **Scale and data volume:** does the query remain SARGable and paginated at $10^6$ rows (zero N+1 queries)?
- **Operator ergonomics:** are UI actions labelled with clear imperative verbs ($\le 20$ chars) and protected against double-click re-entrancy?

## Layer Contracts (`CLEAN`, `FEAT`, `PART`)

Folder-per-Feature with 1-to-1 partial partitioning:

| Architectural Layer | Artifact Responsibility | Mandatory Invariant |
| :--- | :--- | :--- |
| **1. Domain / Entities** | Pure business invariants, enums, value objects. | Zero dependency on ORM, HTTP, or UI frameworks. |
| **2. Localized DTOs** | `<Feature>ActionDTO`, `<Feature>QueryDTO`, `<Feature>LookupDTO`. | Co-located inside the feature folder, not a global `Models/` folder. |
| **3. Application Service** | `<Feature>Service.Action.cs`, `.Query.cs`, `.Lookup.cs`. | Each partial file $\le 200$ LOC; methods $\le 40$ LOC; propagate `CancellationToken` (`CTOK`). |
| **4. Presentation / API** | Thin Controller endpoint or `BaseForm`/`XtraForm` view. | Zero business logic or raw SQL in UI/Controllers; use `RunAfterShown` and 1-way mapping. |

## Vertical Tracer-Bullet Slices

- Each slice cuts a narrow but complete path through every layer (schema, service, API/UI, tests), not a horizontal slice of one layer.
- A completed slice is demoable or verifiable on its own.
- Each slice fits in one fresh context window.
- Prefactoring comes first: "make the change easy, then make the easy change".
- Record per slice: title, what it delivers end to end, and which slices block it. Work the frontier: any slice whose blockers are done.

## Wide Refactors: Expand-Contract

A wide refactor is one mechanical change (rename a column, retype a shared symbol) whose blast radius breaks many call sites at once, so no vertical slice can land green. Sequence it instead:
1. **Expand:** add the new form beside the old so nothing breaks.
2. **Migrate in batches** sized by blast radius (per project, per folder); each batch stays green because the old form still exists.
3. **Contract:** delete the old form once `rg` finds no remaining caller.

When even the batches cannot stay green alone, let them share an integration branch and promise green only at a final integrate-and-verify step.

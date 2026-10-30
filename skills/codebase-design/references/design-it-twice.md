---
name: codebase-design-design-it-twice
description: Parallel interface exploration (Design It Twice, Ousterhout). Read when an interface is hard to reverse (public API, Universe plugin contract, shared DTO, cross-module service contract) or when two or more plausible interface shapes exist for a deepening candidate.
desc: Spawn 3+ parallel subagents with different constraints, compare on depth, locality, and seam placement, then recommend.
rules: [R_CORE, R_TEAM, R_UNIVERSE]
---

# Design It Twice

The first interface idea is rarely the best. Generate radically different designs in parallel, compare them, and commit to an opinionated recommendation. Vocabulary is defined in [../SKILL.md](../SKILL.md); dependency categories in [deepening.md](deepening.md).

## 1. Frame the Problem Space

Write a short user-facing frame before dispatching workers:

- Constraints every design must satisfy (invariants, performance bounds, platform rules such as `RunAfterShown` lifecycle or plugin self-registration).
- Dependencies and their category (in-process, local-substitutable, remote-owned, true external).
- A rough illustrative sketch that makes the constraints concrete. It is a grounding aid, not a proposal.

Show the frame to the user, then dispatch immediately. The user reads while the workers run.

Completion criterion: every constraint is stated as a checkable condition.

## 2. Dispatch 3+ Parallel Workers

Launch all workers in one `invoke_subagent` batch with `TypeName: "research"` (read-only; designs, not edits). Each brief is technical and self-contained: file paths, coupling details, dependency categories, what sits behind the seam, plus the vocabulary from `../SKILL.md` and the project `GLOSSARY.md` terms.

Give each worker a different constraint:

| Worker | Constraint |
| :-: | :--- |
| 1 | Minimal interface: 1-3 entry points, maximum leverage per entry point |
| 2 | Maximum flexibility: many use cases and extension points |
| 3 | Common caller trivial: the default case is one call with no options |
| 4 (when cross-seam dependencies exist) | Ports and adapters: one port per category 3/4 dependency, each with production and in-memory adapters |

Required output from each worker:

1. Interface: types, members, parameters, invariants, ordering, error modes.
2. Caller usage example (C#, TypeScript, or the target language).
3. What the implementation hides behind the seam.
4. Dependency strategy and adapters per category.
5. Trade-offs: where leverage is high, where it is thin.

After dispatch, end the turn; the runtime wakes you when workers report (`skills/multi-agent-teamwork/SKILL.md` covers dispatch discipline).

Completion criterion: every worker returned all five sections.

## 3. Compare and Recommend

1. Present each design in turn so the user can absorb it.
2. Compare in prose on **depth** (leverage at the interface), **locality** (where change concentrates), and **seam placement** (does each seam have two adapters?).
3. Apply the deletion test to every interface each design introduces.
4. Recommend one design, or a hybrid that combines named elements from several. Be opinionated: the user wants a strong read, not a menu.
5. When the chosen interface is hard to reverse, surprising, and the result of a real trade-off, record it as an ADR (`skills/domain-modeling/SKILL.md`, ADR format).

Completion criterion: one recommendation with its reason, and the rejected designs each have a one-line reason for rejection.

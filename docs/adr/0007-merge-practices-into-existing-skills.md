# Merge adopted practices into existing skills; new packages only for new concepts

Practices adopted from `mattpocock/skills` are merged into the skill or standard that already owns the concept, so each meaning keeps a single source of truth. A new package is created only for a concept no existing file owns: `writing-for-agents`, `codebase-design`, `domain-modeling`, and `retro`. Parallel packages would duplicate guidance, compete with existing skills on triggers, and drift apart.

## Considered Options

- Import the upstream catalog as standalone packages: rejected for duplicated triggers and drift.
- A dedicated motion package: rejected, see [separate-ui-motion-skill.md](../governance/out-of-scope/separate-ui-motion-skill.md).

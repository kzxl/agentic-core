# Scope

This framework is curated. Proposals to change a rule (`rules.json`), standard, skill, architecture blueprint, or agent persona are judged against the bar below. Personal or single-project preferences belong in that project's `.project-rule.md`, not in the framework.

## The bar

A proposal is accepted only if it clears both parts:

1. **Observed failure.** It describes something that went wrong in a real agent session: what was run, what the agent produced, and what was expected. Paste the agent output or give a transcript pointer (conversation link or transcript path). A hypothetical improvement ("it would be better if...") does not clear this part.
2. **Fits the philosophy.** It keeps agent-facing docs positive-first with one source of truth per meaning (see [ADR 0006](../adr/0006-positive-first-agent-docs.md)), it composes from existing skills where possible (see [ADR 0007](../adr/0007-merge-practices-into-existing-skills.md)), and it matches nothing in [out-of-scope/](out-of-scope/).

Size is irrelevant: a one-word fix and a rewrite face the same bar.

## Anti-slop rules

A new anti-slop rule additionally ships as one unit: an AS ID in the standard, a linter rule, and a fixture reproducing the observed output. See the root [AGENTS.md](../../AGENTS.md).

## Unclear proposals

A proposal that cannot be judged against the bar gets one round of questions. If the answers still do not clear the bar, it is closed as not planned and, when the idea is likely to return, recorded in `out-of-scope/`.

## Already decided

Each file in [out-of-scope/](out-of-scope/) records one rejected idea, why, and when to revisit it. Read them before proposing a change; the list is in [README.md](README.md).

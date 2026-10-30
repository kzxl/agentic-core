# Architecture Decision Records

Decisions about this framework and why they were made. All listed ADRs are accepted.

| ADR | Decision | Area |
| :--- | :--- | :--- |
| [0001](0001-diff-scoped-comment-rule.md) | Comment rule applies to changed lines only | AS-C1 |
| [0002](0002-interface-needs-two-adapters.md) | An interface needs two adapters or a runtime plugin contract | AS-C4 |
| [0003](0003-zebra-striping-opt-in.md) | Zebra striping is off by default | Grids |
| [0004](0004-light-semantic-palette-and-brand-decoupling.md) | Muted light semantic palette and a decoupled brand accent | AS-01 |
| [0005](0005-motion-profiles-and-gsap-allowlist.md) | Motion profiles, GSAP allowlist, and anti-slop precedence | AS-03 |
| [0006](0006-positive-first-agent-docs.md) | Positive-first agent docs, negative examples outside agent context | Writing |
| [0007](0007-merge-practices-into-existing-skills.md) | Merge adopted practices into existing skills | Skills |
| [0008](0008-governance-docs-under-docs.md) | Governance documents live under docs/ | Repo layout |
| [0009](0009-baseline-delta-intent-auditing-and-collision-linter.md) | Baseline delta, intent auditing, and skill collision linter | Governance & Skills |

## Adding an ADR

1. Write one only when the decision is hard to reverse, surprising without context, and the result of a real trade-off.
2. Name it `NNNN-slug.md`, using the next free number.
3. Body: a title plus 1-3 sentences covering context, decision, and why. Add `Considered Options` or a `Status` line only when it records something a future reader needs.
4. Add a row to the table above. Done when `node tools/validate-framework.js` reports no broken links.

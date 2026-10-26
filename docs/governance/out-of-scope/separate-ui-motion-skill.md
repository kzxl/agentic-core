# A dedicated motion skill package

A separate `ui-motion` skill package is out of scope. Motion guidance composes from the existing anti-slop standard (AS-03 and the motion profiles) and the `ui-design-system` skill (tokens and the motion ladder), per [ADR 0007](../../adr/0007-merge-practices-into-existing-skills.md).

## Why this is out of scope

A second package would become a second source for motion rules, and its trigger would compete with `ui-design-system` on every UI task. Agents would reach one and miss the other, and the two would drift.

## Revisit when

Motion guidance outgrows the `ui-design-system` line budget and cannot be disclosed through a `references/` file, or a recorded session shows agents missing motion rules because the UI skill did not trigger. Try a `references/motion.md` file first.

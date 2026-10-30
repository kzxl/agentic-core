# Governance

How changes to this framework are judged, and which ideas were already rejected.

- [SCOPE.md](SCOPE.md): the change bar (observed failure plus fit with the philosophy).
- Decisions that were accepted live in [docs/adr/](../adr/README.md).

## Out of scope

One file per rejected idea, each with "Why this is out of scope" and "Revisit when":

- [copilot-cursor-export.md](out-of-scope/copilot-cursor-export.md): Copilot and Cursor export targets.
- [css-only-reduced-motion.md](out-of-scope/css-only-reduced-motion.md): reduced motion handled in CSS alone.
- [gsap-skills-global-install.md](out-of-scope/gsap-skills-global-install.md): user-level install of gsap-skills.
- [legacy-comment-sweep.md](out-of-scope/legacy-comment-sweep.md): repo-wide comment removal in untouched files.
- [separate-ui-motion-skill.md](out-of-scope/separate-ui-motion-skill.md): a dedicated motion skill package.
- [subagent-recursion-guards-in-skills.md](out-of-scope/subagent-recursion-guards-in-skills.md): recursion guards written into skill prose.

## Adding a record

Create `out-of-scope/<idea>.md` with a title, a one-paragraph statement of the rejected idea, and the sections `## Why this is out of scope` and `## Revisit when`, then add it to the list above.

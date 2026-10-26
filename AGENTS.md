# AGENTS.md

Invariants for agents editing this repository. Each row points to the source of truth; read the target before acting on it.

## Where things live

| Need | Source of truth |
| :--- | :--- |
| Concrete UI values (hex, px, ms) | [tokens.md](skills/ui-design-system/references/tokens.md) |
| Anti-slop laws and AS IDs | [ui-anti-ai-slop-standard.md](standards/universal/ui-anti-ai-slop-standard.md) |
| Anti-slop rationale and slop examples (human-facing) | [docs/anti-slop.md](docs/anti-slop.md) |
| How to write agent-facing docs | [writing-for-agents](skills/writing-for-agents/SKILL.md) |
| Change bar and rejected ideas | [docs/governance/](docs/governance/README.md) |
| Decisions and their reasons | [docs/adr/](docs/adr/README.md) |

## Invariants

1. Concrete UI values live only in `tokens.md`; every other file references token names.
2. A rule or standard change keeps `rules.json`, `shortcuts.json`, and the README Vital Metrics in sync, and is done when `node tools/validate-framework.js` reports 0 errors.
3. A new anti-slop rule ships as one unit: an AS ID in the standard with its "Checked by" owner; when the rule is mechanically detectable, also a rule in [anti-slop-lint.js](tools/anti-slop-lint.js) and a fixture that triggers it.
4. Before editing skills, standards, rules, or agents, read `skills/writing-for-agents/SKILL.md` and follow it. Write positive-first: state the target behaviour; keep prohibitions only as guardrails paired with a positive target and an ID.
5. Every edit includes a prune pass: delete restatements and no-ops in the touched section.
6. A proposed rule, standard, or skill change clears [SCOPE.md](docs/governance/SCOPE.md) and matches nothing in [out-of-scope/](docs/governance/out-of-scope/).
7. A hard-to-reverse or surprising decision gets an ADR in `docs/adr/`.
8. After editing any skill, run `npm run sync-skills`.

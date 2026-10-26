---
name: writing-for-agents-skill-mechanics
description: AgentOption-specific mechanics for skill packages and registry entries. Read when creating or renaming a skill package, editing SKILL.md frontmatter, adding references/, wiring shortcuts.json or rules.json, updating README vital metrics, or syncing skills to the Antigravity global skills directory.
desc: Frontmatter schema, validator, shortcut coverage, README metrics, sync-skills, references disclosure, and skill-to-skill dependencies in AgentOption
rules: [R_LLM_GOV, R_CORE]
---

# Skill Mechanics (AgentOption)

The skill-specific branch of `writing-for-agents`. The universal writing levers live in [../SKILL.md](../SKILL.md); this file covers only what changes when the document is an AgentOption skill or registry entry.

## 1. Layout

| Kind | Location | Synced to `~/.gemini/config/skills`? |
| :--- | :--- | :---: |
| **Skill package** (workflow or discipline) | `skills/<name>/SKILL.md` + optional `references/`, `examples/`, `resources/` | Yes (whole folder) |
| **Flat skill** (pattern note) | `skills/<cluster>/<name>.md` | No |
| Standard / blueprint / persona | `standards/`, `architecture/`, `agents/` | No |

A package folder name is the skill `name`. `npm run sync-skills` (`node tools/export-agents.js --sync-skills`) copies every folder that contains `SKILL.md`, recursively, so relative links inside a package survive the copy and links outside it do not.

## 2. Frontmatter Schema

Required on every `.md` under `skills/`, `standards/`, `architecture/`, `agents/`, including `skills/<pkg>/references/*.md`:

```yaml
---
name: <folder-name for packages; unique identifier otherwise>
description: <model-facing router pointer, "Use when ..." branches, <= 1024 chars, ends in punctuation>
desc: <short human summary, used in shortcuts.json and README>
rules: [R_CORE, ...]   # at least one; existing rules.json keys only
---
```

- Preserve existing keys (`category`, `shortcuts`) when editing a file.
- `description` is the context pointer and router. Only `name` and `description` load at discovery time. It MUST include:
  1. What the skill does concretely with an active verb.
  2. `Use when...` or `USE FOR:` matching developer-typed keywords and error codes.
  3. `Do not use for X — use Y.` negative trigger boundary partitioning against sibling skills.
  4. Terminal punctuation canary (`.!?)"'`).
  5. Maximum 1024 characters.
- Look up valid rule IDs in `rules.json` instead of copying a list into prose.

## 3. Validator & Skill-Lint Quality Gates

Run `node tools/validate-framework.js` (alias `npm run validate`) and `node tools/skill-lint.js` (alias `npm run lint:skills`) after every edit:

| Tool & Check | Enforcement Rule & Fix |
| :--- | :--- |
| `validate-framework.js` | Frontmatter closed, non-empty `desc`/`rules`, markdown links resolve, 0 errors. |
| `skill-lint.js` (Punctuation canary) | Ensures description terminates in valid punctuation to catch truncation bugs. |
| `skill-lint.js` (Length cap) | Enforces $\le 1024$ character budget per description (`desc-max-length`). |
| `skill-lint.js` (Collision detector) | Computes TF-IDF cosine similarity across all skills; flags collisions $\ge 0.45$. |

Completion criterion: `Errors found: 0` on both tools.

## 4. Registry Entries

- **`shortcuts.json`:** `{ "<KEY>": { "name", "target", "desc" } }`. Workflow packages use the `WF_` prefix (`WF_BUG`, `WF_TEAM`). `target` is repo-relative with forward slashes.
- **`rules.json`:** one line per rule, written as a pointer: leading words + "Read `<path>` before `<branches>`". Restating the target document's content in the rule line is duplication.
- `rules.json`, `shortcuts.json`, `README.md`, `package.json`, `.project-rule.md` are shared root files. In multi-agent runs only the orchestrator edits them (`skills/multi-agent-teamwork/SKILL.md`).

## 5. Progressive Disclosure with references/

- Keep `SKILL.md` under ~150 lines. Move reference that only some branches need into `references/<topic>.md`.
- Point to it with an explicit condition: "Read `references/<topic>.md` when ...", written as a relative markdown link. An unconditional "see also" is a weak pointer.
- A reference file never points to a sibling reference for a required step; required steps stay in `SKILL.md`.

## 6. Skill-to-Skill Dependencies

Antigravity reads skills by path with `read_file`; there is no Skill tool. Phrase a dependency as an operative step:

- Synced packages: "Read `skills/<name>/SKILL.md` and follow it." The installed copy lives at `~/.gemini/config/skills/<name>/SKILL.md`; both resolve to the same package.
- Non-synced files (flat skills, standards): use `[AgentOption]/<path>`, where `[AgentOption]` is the framework root (`E:\16. AgentOption`). The validator skips these links.
- Shared reference lives in the package that owns it; other skills point to that package, never copy it.

## 7. Invocation in Antigravity

Every installed skill's `description` is in the system prompt, so every skill is model-discoverable and pays context load. Consequences:

- Write the description for the narrowest set of branches that genuinely need autonomous reach.
- Flows that only a human should start (retro, full-repo audits, release) map to **workflows and slash commands** (`templates/workflow-template.md`). Their skill description names the explicit user trigger ("Use when the user asks for a retro") so the model does not fire them unprompted.
- A discipline that other skills must reach (TDD, codebase design, domain modeling) stays a model-reachable skill package.

## 8. Change Bar and Pruning

- A new rule, skill, or standard section needs an **observed failure**: a real session output that showed the problem. Hypothetical improvements wait.
- Compose from existing skills before creating a new one; every package is maintenance surface.
- Run the `retro` skill (`skills/retro/SKILL.md`) after sessions that exposed navigation gaps or repeated mistakes.

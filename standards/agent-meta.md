---
title: Agent Meta Rules
purpose: Strict standard for creating/updating any Rule, Skill, or Architecture document in the system.
format_enforcement: strict_yaml_or_bullet
---
# RULES_FOR_RULES

1. AI_COMPREHENSION_FIRST:
   - NO formatting fluff or conversational prose.
   - USE YAML, JSON, or terse bullet lists.
   
2. MAXIMUM_TOKEN_SAVINGS:
   - Replace long sentences with concise technical keywords.
   - Bad: "This skill helps you to create a controller."
   - Good: "desc: Create controller."

3. DRY (Rule ID Reference):
   - Never copy-paste standard coding rules into a Skill/Arch file.
   - Always reference the exact Rule ID from `[AgentOption]/rules.json`.
   - Example: `rules: [R_CS, R_WPF]`

4. UPDATING_SKILLS (Standard Pattern):
   - Body must be structured Markdown with YAML frontmatter.
   - Frontmatter Required:
     ```yaml
     ---
     name: [skill_name]
     desc: [action]
     rules: [R_ID]
     ---
     ```

5. ADDING_NEW_RULES:
   - Must be registered in `[AgentOption]/rules.json` as a single Key-Value pair.
   - Key format: `R_[DOMAIN]` (e.g. `R_SQL`).

6. SYMBOL_DECODING_PROTOCOL (Token-Optimized Attention):
   - `R_*` (e.g. `R_CS`, `R_WPF`, `R_DB`) -> Hard constraints mapped to `rules.json`.
   - `ACRONYM` (e.g. `DBS`, `HND`, `TDD`, `PERF`, `PONY`, `CONS`, `BLAST`, `NORM`) -> Design patterns mapped to `shortcuts.json`.
   - Agents MUST treat compact tag arrays (e.g. `apply: [R_CS, R_WPF, DBS, PERF]`) as fully expanded operational directives.
   - Zero hallucination: If an unknown tag is encountered, resolve via `node [AgentOption]/tools/lookup.js <TAG>`.

7. INVARIANT_COMMIT_GATE (5-Question Pre-Commit Check):
   - 1. Zero forbidden patterns (`BindingSource`, `Form_Load`, sync `.Result` / `.Wait()`)?
   - 2. Zero cross-module direct table queries (`R_UNIVERSE` Data Sovereignty)?
   - 3. Zero unrequested abstractions (`PONY` YAGNI ladder satisfied)?
   - 4. Blast-radius scanned if touching shared code (`BLAST`)?
   - 5. Project built and verified with zero errors?

8. BLAST_RADIUS_PRE_CHECK:
   - Mandatory `rg "FunctionName\("` caller scan before editing non-private/shared symbols.

9. PRE_ACTION_INPUT_NORMALIZATION:
   - Pre-Action Step: Evaluate input prompt. If free-form prose, auto-normalize into canonical Micro-Payload `[Action] @[Feature] | [Intent] | [Tags]` before planning or reasoning (`NORM`).



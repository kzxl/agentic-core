---
title: Agent Meta Rules
desc: Strict standard for creating/updating Rules, Skills, Symbol Decoding, and Commit Gates
rules: [R_CORE, R_GIT]
---
# 🤖 Agent Meta Rules & Execution Gates

## 1. AI Comprehension & Token Savings
- Terse YAML/JSON frontmatter, concise bullet points (Zero prose fluff).
- Replace long explanations with direct keyword directives.
- DRY: Reference exact Rule IDs (`rules: [R_CS, R_WPF]`) from `rules.json`.

## 2. Symbol Decoding Protocol (RAM Attention)
- `R_*` (e.g. `R_CS`, `R_WPF`, `R_DB`, `R_GIT`) &rarr; Hard constraints in `rules.json`.
- `ACRONYM` (e.g. `DBS`, `HND`, `TDD`, `PERF`, `PONY`, `CONS`, `BLAST`, `NORM`, `SQL`, `SOLID`, `GIT`) &rarr; Patterns in `shortcuts.json`.
- Unknown tags &rarr; Resolve via `node [AgentOption]/tools/lookup.js <TAG>`.

## 3. Pre-Action Input Normalization (NORM)
- Detect input format: If free-form prose, auto-normalize into canonical Micro-Payload `[Action] @[Feature] | [Intent] | [Tags]` before planning or reasoning.

## 4. Blast-Radius Pre-Check (BLAST)
- Mandatory `rg "FunctionName\("` caller scan before editing shared/public symbols.

## 5. Invariant Commit Gate (6-Point Pre-Commit Check)
- 1. Zero forbidden patterns (`BindingSource`, `Form_Load`, sync `.Result` / `.Wait()`)?
- 2. Zero cross-module direct table queries (`R_UNIVERSE` Data Sovereignty)?
- 3. Zero unrequested abstractions (`PONY` YAGNI ladder satisfied)?
- 4. Blast-radius scanned if touching shared code (`BLAST`)?
- 5. Project built and verified with zero errors?
- 6. Atomic commit invariant satisfied (`R_GIT`: 1 feature/fix per commit, conventional commit syntax, no multi-feature mega-commits)?

## 6. Language & Authoring Invariant
- All markdown documentation (`.md`), rules, standards, architectures, and skills MUST be authored in concise, standard, unambiguous Technical English.
- Localized chat responses may be in user-selected language, but all persistent knowledge artifacts and framework files remain in standard English for deterministic AI reasoning.


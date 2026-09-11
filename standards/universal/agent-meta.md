---
title: Agent Meta Rules
desc: Strict standard for creating/updating Rules, Skills, Symbol Decoding, and Commit Gates
rules: [R_CORE, R_GIT, R_LLM_GOV, R_EMBEDDED]
---
# 🤖 Agent Meta Rules & Execution Gates

## 1. AI Comprehension & Token Savings
- Terse YAML/JSON frontmatter, concise bullet points (Zero prose fluff).
- Replace long explanations with direct keyword directives.
- DRY: Reference exact Rule IDs (`rules: [R_CS, R_WPF, R_LLM_GOV]`) from `rules.json`.

## 2. Symbol Decoding Protocol (RAM Attention)
- `R_*` (e.g. `R_CS`, `R_WPF`, `R_DB`, `R_GIT`, `R_LLM_GOV`) &rarr; Hard constraints in `rules.json`.
- `ACRONYM` (e.g. `DBS`, `HND`, `TDD`, `PERF`, `PONY`, `CONS`, `BLAST`, `NORM`, `CLEAN`, `IPGOV`, `SQL`, `SOLID`, `GIT`) &rarr; Patterns in `shortcuts.json`.
- Unknown tags &rarr; Resolve via `node [AgentOption]/tools/lookup.js <TAG>`.

## 3. Pre-Action Input Normalization (NORM)
- Detect input format: If free-form prose, auto-normalize into canonical Micro-Payload `[Action] @[Feature] | [Intent] | [Tags]` before planning or reasoning.

## 4. Blast-Radius Pre-Check (BLAST)
- Mandatory `rg "FunctionName\("` caller scan before editing shared/public symbols.

## 5. Invariant Commit Gate (8-Point Pre-Commit Check)
- 1. Zero forbidden patterns (`BindingSource`, `Form_Load`, sync `.Result` / `.Wait()`)?
- 2. Zero cross-module direct table queries (`R_UNIVERSE` Data Sovereignty)?
- 3. Zero unrequested abstractions (`PONY` YAGNI ladder satisfied)?
- 4. Blast-radius scanned if touching shared code (`BLAST`)?
- 5. Project built and verified with zero errors (compiler exit code = 0)?
- 6. Atomic commit invariant satisfied (`R_GIT`: 1 feature/fix per commit, conventional commit syntax, no multi-feature mega-commits)?
- 7. Zero unverified MMIO/hardware registers (`R_EMBEDDED`, `R_LLM_GOV`: verified against active SSoT headers or ROM dumps)?
- 8. LLM Governance & Clean-Room IP satisfied (`R_LLM_GOV`: no raw substantial LLM chunks, GNU <15 lines respected, provenance disclosed)?

## 6. Evidence-First Verification Protocol (`R_ENG_OS`)
- Every completion claim, root-cause diagnosis, or technical assertion MUST be backed by concrete evidence:
  1. Specific file path and line numbers (`file:///path/to/file#L10-L20`).
  2. Actual build or test command executed via shell.
  3. Verified exit code (`Exit Code 0`).
  4. Raw output snippet confirming behavioral correctness. Zero speculation allowed.

## 7. Language & Authoring Invariant
- All markdown documentation (`.md`), rules, standards, architectures, and skills MUST be authored in concise, standard, unambiguous Technical English.
- Localized chat responses may be in user-selected language, but all persistent knowledge artifacts and framework files remain in standard English for deterministic AI reasoning.


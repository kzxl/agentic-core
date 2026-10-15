---
title: Agent Meta Rules
desc: Strict standard for creating/updating Rules, Skills, Symbol Decoding, and Commit Gates
rules: [R_CORE, R_GIT, R_LLM_GOV, R_EMBEDDED]
---
# 🤖 Sovereign Agent Meta Rules & Execution Gates

## 1. Architectural Invariants & Quantitative Thresholds

| Governance Gate | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Symbol & Rule Resolution** | `100%` of `R_*` & acronyms decoded via `rules.json` / `shortcuts.json` | `node tools/lookup.js <TAG>` prior to implementation |
| **Blast-Radius Caller Scan** | Mandatory `rg "SymbolName"` before modifying any public/shared symbol | Zero broken downstream callers across workspace |
| **Framework Integrity Check** | `0` broken links, missing frontmatter, or orphan index entries | `node tools/validate-framework.js` (`Exit Code 0`) |
| **Evidence Proof Hierarchy** | `L1` (Runtime/Test Exit `0`) > `L2` (Compiler `0` Err) > `L3` (Static AST) | Zero unverified completion claims (`R_ENG_OS`) |
| **Context Window Hygiene** | Targeted line-range `view_file` (`<= 300` lines); offload broad scans | Subagent delegation (`research` / multi-agent team) |

---

## 2. Router-First Lookup & Symbol Decoding Protocol

Before authoring code, modifying architecture documents, or creating skills, the agent MUST resolve applicable domain constraints through the deterministic routing hierarchy:
1. **Rule IDs (`R_*`):** Map directly to hard constraints in `rules/rules.json` (e.g., `R_CORE`, `R_CS`, `R_WPF`, `R_API`, `R_DB`, `R_GO`, `R_NODE`, `R_PHP`, `R_PY`, `R_RUST`, `R_CPP`, `R_ANDROID`, `R_PERF`, `R_SEC`, `R_RES`, `R_GIT`, `R_LLM_GOV`).
2. **Shortcut Acronyms:** Map to canonical execution patterns in `rules/shortcuts.json` (`NORM`, `BLAST`, `DBS`, `HND`, `TDD`, `PONY`, `CONS`, `CLEAN`, `IPGOV`).
3. **Automated CLI Lookup:** Never guess an unfamiliar rule or tag; query `node E:\16. AgentOption\tools\lookup.js <TAG>` and run `node E:\Tools\SemanticBrain\tools\context-fetch.js "<task>"` for non-trivial engineering tasks.

```bash
# ❌ BAD: Editing shared infrastructure or creating a skill without checking rules, callers, or templates
# 1. Skips context-fetch.js and lookup.js
# 2. Invents non-standard YAML frontmatter keys ("description" instead of "desc", missing "rules: [...]")
# 3. Uses "git add -A && git commit" sweeping in untracked scratch files

# ✅ GOOD: Deterministic Router-First Lookup -> Blast-Radius Scan -> Framework Validation -> Safe Commit
node E:\Tools\SemanticBrain\tools\context-fetch.js "Upgrade concurrency standards"
node E:\16. AgentOption\tools\lookup.js R_RES
rg "ProcessOrders\(" --type go
node E:\16. AgentOption\tools\validate-framework.js
node E:\Tools\SemanticBrain\tools\git-safe-commit.js -m "docs(standards): upgrade golang concurrency spec" standards/golang/concurrency.md
```

---

## 3. Zero-Trust Proof Hierarchy & Blast-Radius Defense (`BLAST`)

Every technical claim, bug fix, or standard upgrade MUST satisfy the **Zero-Trust Proof Hierarchy**:
- **Tier 1 (Executable Proof):** Automated unit/integration test pass, benchmark output, or `validate-framework.js` returning `Exit Code 0`.
- **Tier 2 (Compiler / Static Analyzer Proof):** Clean `dotnet build`, `cargo check`, `go vet`, `phpstan`, or `tsc --noEmit` with `0` errors.
- **Tier 3 (Structural File Proof):** Exact clickable file URI and line range (`[filename.ext](file:///path/to/file#L10-L25)`) plus verified byte/line counts from `view_file`. Speculative assertions (*"This should fix the issue"*) without Tier 1–3 proof are strictly prohibited.

---

## 4. 8-Point Atomic Commit Gate & Authoring Invariant

Before staging or committing any change, verify all 8 invariants:
1. **Zero Forbidden Anti-Patterns:** No sync-over-async (`.Result`/`.Wait()`), no raw SQL string concatenation, no machine-local paths (`C:\...`, `E:\...`), no `Overwrite: true` on config/rule files without prior `view_file` and permission.
2. **Data Sovereignty (`R_UNIVERSE`):** Zero cross-module direct table queries; modules communicate strictly via service interfaces or domain events.
3. **YAGNI / `PONY` Ladder:** Zero speculative abstractions or unused wrapper layers.
4. **Blast-Radius Verified (`BLAST`):** All callers of modified signatures updated and verified.
5. **Compiler & Validator Clean:** Build/test and `validate-framework.js` exit with code `0`.
6. **Scoped Atomic Commit (`R_GIT`):** Stage only task-scoped files via `git-safe-commit.js` (never `git add -A`).
7. **Hardware / MMIO SSoT (`R_EMBEDDED`):** All register offsets and bitfields verified against official datasheets or ROM headers.
8. **Clean-Room IP & Technical English (`R_LLM_GOV`):** All `.md` standards, skills, rules, and code identifiers authored in precise **Standard Technical English**; chat responses localized to the user's preferred language (Vietnamese).


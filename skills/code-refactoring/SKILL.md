---
name: code-refactoring
description: Zero-regression refactoring and modularization workflow. Use when the user asks to refactor, restructure, split a large class or file, extract a service, localize DTOs, remove wrappers or dead abstractions, rename or retype a widely used symbol, or clean up technical debt without changing behaviour.
desc: Zero-regression code refactoring and modularization workflow (Blast-Radius, Expand-Contract, 1-to-1 Partitioning, Deletion Test, Conformance, and Post-Harvest).
rules: [R_CORE, R_NEV, R_REUSE, R_PROOF]
---

# Zero-Regression Multi-Objective Code Refactoring Workflow

**Goal:** Refactor legacy monolithic classes, extract shared services, localize DTOs, and clean up technical debt with ZERO performance regression, ZERO abstraction bloat, and verified positive Net Engineering Value (NEV).

Incorporates practices adapted from mattpocock/skills (MIT).

---

### Step 1: Pre-Edit Caller, Blast-Radius Scan & Baseline Inscription
1. **Quantify Blast Radius:**
// turbo
```bash
# Grep all direct and indirect references
rg "(\b<TargetClassOrMethod>\b|nameof\(<TargetClassOrMethod>\))"
```
2. **Capture Baseline Invariants:**
   - Record baseline unit test pass count ($N_{\text{tests}}$).
   - Record baseline Lines of Code (LOC).
   - If performance-sensitive, capture baseline benchmark/execution latency ($T_0$) and allocations ($M_0$).

**Done when:** the caller count and every baseline value are recorded.

---

### Step 2: Semantic Brain PRE-Fetch (Migration Lessons)
Check previous refactoring gotchas and architectural constraints:
// turbo
```bash
node [AgentOption]/tools/brain.js pre "refactor <target module>" --tags=<domain>,refactor
```

---

### Step 3: Apply 1-to-1 Partial Partitioning & DTO Localization
Partition monolithic files into cohesive units:
- `<Feature>ActionDTO.cs` & `<Feature>AppService.Action.cs`
- `<Feature>QueryDTO.cs` & `<Feature>AppService.Query.cs`
- `<Feature>LookupDTO.cs` & `<Feature>AppService.Lookup.cs`
- Keep every partial file strictly between **50 to 200 lines**.

**Wide refactors use expand-contract.** When the Step 1 scan shows one mechanical change (rename a column, retype a shared symbol, move a namespace) fanning out across many call sites:
1. **Expand:** add the new form beside the old so nothing breaks.
2. **Migrate in batches** sized by blast radius (per project, per folder); build and tests stay green after each batch because the old form still exists.
3. **Contract:** delete the old form once the Step 1 `rg` scan returns zero remaining callers.

**Done when:** every partial is within 50-200 lines and, for wide refactors, the contract step has removed the old form.

---

### Step 4: Ponytail Minimalist Clean-up & Abstraction Tax Audit
Enforce strict structural leanliness (`R_NEV`):
- **Delete > Add:** Use standard library helpers over custom utility classes (`PONY`).
- **Deletion test:** for each module, wrapper, or layer touched, imagine deleting it. If the complexity vanishes, it was a pass-through (Middle Man): inline it and call the real target directly. If the complexity reappears across N callers, it earns its keep.
- **Real seams only (`AS-C4`):** keep an interface only when it has at least two adapters (production + in-memory test fake counts) or a runtime plugin contract; otherwise inline it (Speculative Generality).
- **Cap LOC Inflation:** Refactored code must not increase lines by $> +30\%$ over the original implementation.

**Done when:** every touched module passes the deletion test and LOC growth is $\le +30\%$.

---

### Step 5: Conformance Testing, Benchmark & Multi-Criteria Scorecard
Verify functional equivalence and compile the scorecard:
```bash
# 1. Verify zero compile warnings/errors
dotnet build /warnaserror  # or npm run build

# 2. Verify all regression tests pass
dotnet test                # or npm test
```

**Replace, don't layer tests:** once behaviour tests exist at the new, deeper interface, delete the old shallow tests that targeted removed internals instead of keeping both. List the replaced tests in the scorecard so a lower test count is explained, not hidden.

Generate the quantitative **Multi-Criteria Refactoring Scorecard**:

```markdown
### Multi-Criteria Refactoring Scorecard
| Dimension | Metric | Baseline (Old) | New State | Delta (Δ) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Functional** | Test Pass Rate | [OldPass] | [NewPass] | 0 regression | PASS/FAIL |
| **Functional** | Replaced Tests | [OldShallowTests] | [NewInterfaceTests] | listed | PASS/FAIL |
| **Performance** | Latency / Allocations | [OldPerf] | [NewPerf] | Δ ≤ 0% | PASS/FAIL |
| **Complexity** | Total LOC | [OldLOC] | [NewLOC] | Δ ≤ +30% | PASS/FAIL |
| **Cognitive** | Max Nesting Depth | [OldNest] | [NewNest] | ≤ 3 levels | PASS/FAIL |
```

**Done when:** build and tests exit `0` and every scorecard row is filled.

---

### Step 6: Red-Flag Rollback Gate
If **ANY** of the following conditions are met, immediately abort and execute `git checkout .`:
1. Any existing test fails or contract breaks.
2. Latency increases by $\ge 5\%$ or heap allocation increases.
3. Code bloat exceeds $+30\%$ without adding new features.
4. Net Engineering Value is non-positive ($\text{NEV} \le 0$).

---

### Step 7: Commit & POST-Harvest
Record migration results and lessons learned:
```bash
node E:\Tools\SemanticBrain\tools\git-safe-commit.js -m "refactor(<domain>): partition <module_name> with zero regression and verified NEV" <refactored_files...>
```
// turbo
```bash
node [AgentOption]/tools/brain.js post "[Refactor: <Module>] | [Reduced <N> lines / eliminated legacy dependency / ΔPerf: <P>%] | [Scorecard & Pattern Used]" --tags=<domain>,refactor
```

---
name: CodeRefactoringWorkflow
desc: Zero-regression code refactoring and modularization workflow (Blast-Radius -> 1-to-1 Partitioning -> Conformance -> Post-Harvest)
rules: [R_CORE, R_API, R_NEV]
category: Workflows
---
# 🔨 Zero-Regression Multi-Objective Code Refactoring Workflow

**Goal:** Refactor legacy monolithic classes, extract shared services, localize DTOs, and clean up technical debt with ZERO performance regression, ZERO abstraction bloat, and verified positive Net Engineering Value (NEV).

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

---

### Step 4: Ponytail Minimalist Clean-up & Abstraction Tax Audit
Enforce strict structural leanliness (`R_NEV`):
- **Delete > Add:** Use standard library helpers over custom utility classes (`PONY`).
- **Ban Speculative Interfaces:** Eliminate interfaces with only 1 concrete implementation unless required by dependency injection at project boundary.
- **Ban Pass-Through Wrappers:** Never create an intermediary class that simply delegates calls without transforming data.
- **Cap LOC Inflation:** Refactored code must not increase lines by $> +30\%$ over the original implementation.

---

### Step 5: Conformance Testing, Benchmark & Multi-Criteria Scorecard
Verify functional equivalence and compile the scorecard:
```bash
# 1. Verify zero compile warnings/errors
dotnet build /warnaserror  # or npm run build

# 2. Verify all regression tests pass
dotnet test                # or npm test
```

Generate the quantitative **Multi-Criteria Refactoring Scorecard**:

```markdown
### ⚖️ Multi-Criteria Refactoring Scorecard
| Dimension | Metric | Baseline (Old) | New State | Delta (Δ) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Functional** | Test Pass Rate | [OldPass] | [NewPass] | 0 regression | PASS/FAIL |
| **Performance** | Latency / Allocations | [OldPerf] | [NewPerf] | Δ ≤ 0% | PASS/FAIL |
| **Complexity** | Total LOC | [OldLOC] | [NewLOC] | Δ ≤ +30% | PASS/FAIL |
| **Cognitive** | Max Nesting Depth | [OldNest] | [NewNest] | ≤ 3 levels | PASS/FAIL |
```

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
git add .
git commit -m "refactor(<domain>): partition <module_name> with zero regression and verified NEV"
```
// turbo
```bash
node [AgentOption]/tools/brain.js post "[Refactor: <Module>] | [Reduced <N> lines / eliminated legacy dependency / ΔPerf: <P>%] | [Scorecard & Pattern Used]" --tags=<domain>,refactor
```

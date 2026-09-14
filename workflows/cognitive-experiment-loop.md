---
name: CognitiveExperimentLoopWorkflow
desc: 5-Phase Empirical Cognitive Loop Workflow (Sensory Sweep -> Socratic Inquiry & Baseline -> Pre-Mortem -> Targeted Action -> Grounded Stress -> Comparative Delta -> Dual Memory)
rules: [R_CORE, R_ENG_OS, R_COG_LOOP, R_PRE_MORTEM, R_EPISTEMIC, R_REUSE]
category: Workflows
---
# 🔬 Empirical Cognitive Experiment Workflow

**Goal:** Execute high-complexity, uncertain, or optimization engineering tasks through a strictly verified, 5-phase empirical cognitive loop. Eliminate premature code changes, speculative optimizations, and regression loops.

---

### Step 1: Zero-Turn Sensory Sweep & Environment Baseline (Mandatory)
Before querying memory or analyzing user prompts, verify the physical health of the workspace:
```bash
# 1. Verify working directory cleanliness
git status --short

# 2. Check baseline build and test execution
dotnet test / npm test / go test ./...
```
- **If workspace is dirty:** Stash or commit cleanly. Never mix uncommitted baggage into a new cognitive cycle.
- **If baseline test fails:** Isolate the existing regression immediately. Do not proceed to new features until the baseline is known.

---

### Step 2: Socratic Inquiry & Epistemic Uncertainty Gate
Assess the epistemic uncertainty of the target module:
1. **Uncertainty Gate Evaluation:**
   - Are there tests covering the target area?
   - Is domain documentation present?
   - If **Uncertainty is HIGH ($U > 0.6$):** Enter **Spike / Probing Mode**. Forbid bulk refactoring. Write a reproduction test or log trace first.
2. **Pre-Fetch Historical Lessons:**
```bash
node [AgentOption]/tools/brain.js pre "<Target Feature or Bug Description>" --tags=<domain>
```

---

### Step 3: Baseline Inscription & Falsifiable Hypothesis ($H_1$)
Record the quantitative baseline and formulate the hypothesis **before touching code**:
- **Baseline Metric ($M_0$):** [e.g., Latency: 380ms, Allocation: 8.5MB, Failure: 100% on concurrent writes]
- **Hypothesis ($H_1$):** "Applying pattern $X$ will reduce metric $Y$ to $< 100$ms without breaking contract $Z$."
- **Graveyard Check:** Confirm the hypothesis was not marked DEAD in past SemanticBrain logs.

---

### Step 4: Mental Sandbox & Pre-Mortem Simulation
Simulate real-world deployment friction across 3 failure vectors:
1. **Ergonomic Persona:** "How will an operator under stress, wearing gloves, or on a mobile network fail when interacting with this flow?"
2. **Scale & Volume Stress:** "How does this algorithm behave when collection size jumps from $N=20$ to $N=200,000$?"
3. **Catastrophic Failure Modes:** "What happens during unexpected socket drops, database deadlock, or out-of-order message delivery?"

Adjust the technical design to preempt the identified failure modes before code generation.

---

### Step 5: Minimal Targeted Implementation & Asset Survey
Implement the minimum code delta necessary to validate $H_1$:
- **Asset-First Invariant (`R_REUSE`):** Survey project helpers, extension methods, and common utilities first (`rg "class .*Extensions"`). Never write hand-rolled utilities when existing project assets solve the problem.
- Keep modifications strictly isolated to target boundaries.
- Preserve backward compatibility with existing callers.

---

### Step 6: Grounded Stress Experimentation & Edge Probing
Subject the new code to empirical pressure rather than simple compiler verification:
```bash
# 1. Run targeted test suite with race-condition / stress flags
go test -race -v ./... -run TestTargetFeature
dotnet test --filter "FullyQualifiedName~TargetFeature" -c Release
npm test -- --grep "TargetFeature"

# 2. Stress with boundary data loads & negative payloads
```

---

### Step 7: Comparative Delta Evaluation ($\Delta = \text{After} - \text{Before}$)
Quantify the empirical improvement:

```markdown
### 🔬 Cognitive Experiment Delta Report

| Metric / Invariant           | Baseline (Before) | New State (After)  | Delta (Δ)      | Verdict |
| :--------------------------- | :---------------- | :----------------- | :------------- | :------ |
| Primary Performance Metric   | [M_0]             | [M_1]              | [Δ%]           | PASS/FAIL |
| Regression Test Pass Rate    | [Pass_0]          | [Pass_1]           | [+N tests]     | PASS/FAIL |
| Memory / Allocation Budget   | [Alloc_0]         | [Alloc_1]          | [Δ%]           | PASS/FAIL |
| Ergonomic / User Verification| [Risk_0]          | [Mitigated]        | Mitigated      | PASS/FAIL |
```

- **If $\Delta < 0$ or Invariant Broken:**
  1. Trigger immediate `git checkout .` to rollback speculative changes.
  2. Mark hypothesis as FAILED in research notes.
  3. Pivot to alternative hypothesis.
- **If $\Delta \ge 0$ (Hypothesis Proven):** Proceed to Step 8.

---

### Step 8: Clean Commit & Dual-Path Knowledge Harvesting
1. **Commit Verified Changes:**
```bash
git add <touched-files>
git commit -m "<type>(<domain>): <concise description of proven improvement>"
```

2. **POST-Harvest Proven Insight into SemanticBrain:**
```bash
node [AgentOption]/tools/brain.js post "[Context/Symptom] | [Hypothesis & Verified Pattern] | [Empirical Delta Achieved & Trade-off]" --tags=<domain>,<tech_tag>
```

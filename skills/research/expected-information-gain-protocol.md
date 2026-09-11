---
desc: Expected Information Gain Protocol — Pre-Flight Epistemic Gate, Candidate Ranking by eROI & Zero-Gain Trial Pruning Playbook
rules: [R_INFO_GAIN, R_RESEARCH, R_STATE]
---
# 💡 Expected Information Gain Protocol

## 1. Operating Principle: The Epistemic Filter

Before authoring code, modifying configuration, or triggering a compiler/benchmark, the agent must pause and ask:

$$\textbf{"Does this next experiment have a high probability of teaching me something fundamentally new?"}$$

* If **YES**: The experiment reduces systemic entropy. Execute it.
* If **NO**: The experiment is an illusion of progress. **PRUNE IT.**

---

## 2. The 3-Question Epistemic Pre-Flight Checklist

Every candidate experiment must pass this 3-question filter before execution:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   PRE-FLIGHT EPISTEMIC FILTER CHECKLIST                │
├────────────────────────────────────────────────────────────────────────┤
│ Q1: [Outcome Distribution]                                             │
│     What are the 2-3 distinct observable outcomes this test could yield?│
│                                                                        │
│ Q2: [Hypothesis Discrimination]                                        │
│     If Outcome 1 occurs, which hypothesis dies?                        │
│     If Outcome 2 occurs, which competing hypothesis dies?              │
│                                                                        │
│ Q3: [Predictability Check]                                             │
│     Can I already predict the outcome with >=90% confidence based      │
│     on previous experiments, documentation, or architecture invariants?│
│                                                                        │
│ VERDICT:                                                               │
│ If Q3 is YES -> EIG is ZERO. REJECT EXPERIMENT. DO NOT EXECUTE.        │
│ If Q2 cannot name a dying hypothesis -> EIG is LOW. DE-PRIORITIZE.     │
│ If Q2 cleanly separates H1 vs H2 -> EIG is HIGH. DISPATCH IMMEDIATELY. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Working Memory Epistemic Evaluation Schema

Before scheduling experiments, log candidate evaluations in working memory:

```json
{
  "candidate_experiments": [
    {
      "id": "EXP-021",
      "name": "SIMD AVX2 PopCount Vectorization",
      "target_hypothesis": "H-002 vs H-003",
      "predicted_outcomes": ["3x throughput speedup", "port saturation stall"],
      "discriminates_hypotheses": true,
      "prior_predictability": 0.40,
      "estimated_eig": 0.85,
      "verdict": "EXECUTE"
    },
    {
      "id": "EXP-022",
      "name": "SIMD AVX2 PopCount Unroll by 4",
      "target_hypothesis": "H-003 refinement",
      "predicted_outcomes": ["marginal 2% delta", "L1I cache spill"],
      "discriminates_hypotheses": false,
      "prior_predictability": 0.70,
      "estimated_eig": 0.25,
      "verdict": "QUEUE"
    },
    {
      "id": "EXP-023",
      "name": "SIMD AVX2 PopCount Unroll by 8",
      "target_hypothesis": "None (redundant tweak)",
      "predicted_outcomes": ["identical L1I cache thrash as EXP-022"],
      "discriminates_hypotheses": false,
      "prior_predictability": 0.95,
      "estimated_eig": 0.03,
      "verdict": "PRUNED"
    }
  ]
}
```

---

## 4. Walkthrough: The Exp-A $\to$ Exp-B $\to$ Exp-C Lifecycle

### Step 1: Experiment A (Novel Premise $\implies$ High EIG)
* **Goal:** Test whether hardware AVX2 `_mm256_popcnt` kernel outperforms lookup table.
* **Q1/Q2:** If faster $\implies H_{\text{vector}}$ accepted. If slower $\implies H_{\text{table}}$ accepted.
* **Q3:** Predictability is $50\%$.
* **Action:** **DISPATCH IMMEDIATELY.** Outcome yields massive new knowledge (e.g. $4.1\times$ faster).

### Step 2: Experiment B (Corroborating Variant $\implies$ Low EIG)
* **Goal:** Tweak kernel by unrolling loop from 2 to 4 accumulators.
* **Q1/Q2:** Refines parameter, but doesn't change the underlying causal model.
* **Q3:** Predictability is $70\%$.
* **Action:** **EXECUTE ONLY IF BUDGET ALLOWS.** Result: No improvement (CPU port 0/1 saturated).

### Step 3: Experiment C (Cosmetic Redundancy $\implies$ Zero EIG)
* **Goal:** Tweak kernel by unrolling loop from 4 to 8 accumulators.
* **Q1/Q2:** Cannot discriminate any new hypothesis.
* **Q3:** Predictability is $96\%$ (since unroll-4 already saturated ports, unroll-8 is guaranteed to be worse or identical).
* **Action:** **PRUNED AT GATE.** Output Rejection Notice:

```text
╔══════════════════════════════════════════════════════════════════════╗
║  🛑 PRE-FLIGHT EIG REJECTION NOTICE (Zero Information Gain)          ║
╠══════════════════════════════════════════════════════════════════════╣
║ Proposed Experiment: EXP-023 (Unroll AVX2 PopCount by 8)             ║
║ Estimated EIG: 0.03 bits (Threshold: >= 0.10 bits required)          ║
║ Prior Predictability: 96% certain to fail or match EXP-022.          ║
║ Causal Invariant: Out-of-order execution port 0/1 was already proven ║
║ saturated in EXP-022. Adding 8 accumulators increases L1I cache size ║
║ without unlocking instruction parallelism.                           ║
╠══════════════════════════════════════════════════════════════════════╣
║ DECISION: PRUNED. DO NOT EXECUTE.                                    ║
║ Saved Resources: ~15,000 tokens, 120 seconds compilation time.       ║
║ Next Action: Pivot to memory layout optimization (SoA conversion).   ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 5. Candidate Ranking by Epistemic Return on Investment (eROI)

When Explorer generates multiple orthogonal ideas:

$$\text{eROI} = \frac{\text{EIG}}{\text{Cost}}$$

1. Sort candidate pool descending by $\text{eROI}$.
2. Reject all candidates with $\text{EIG} < 0.10$ bits.
3. Dispatch only the top candidate.

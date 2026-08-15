---
name: AgenticSelfConsistencyConsensus
desc: 3-Pass Consensus with Early Stopping protocol for multi-perspective decision making and divergence detection
rules: [R_CORE]
category: Agentic
---
# 🎯 Agentic Self-Consistency & Early Stopping Protocol

**Goal:** Ensure optimal balance between maximum decision precision and minimal token consumption. Stop early when independent reasoning passes converge, and deep-dive only when divergence is detected.

---

## 1. The 3-Pass Consensus Architecture

```
                       [COMPLEX DECISION / TASK]
                                │
                        ┌───────▼───────┐
                        │   Pass 1: R1  │  (Functional & Core Logic Perspective)
                        └───────┬───────┘
                                │
                        ┌───────▼───────┐
                        │   Pass 2: R2  │  (Data Integrity, Nulls & Concurrency)
                        └───────┬───────┘
                                │
                 ┌──────────────┴──────────────┐
           [R1 == R2]                    [R1 != R2]
                 │                             │
         ┌───────▼───────┐                     │
         │   Pass 3: R3  │ (Performance)       │
         └───────┬───────┘                     │
                 │                             │
          ┌──────┴──────┐                      │
    [R1==R2==R3]   [Khác nhau]                 │
          │             │                      │
   ✅ 3/3 CONSENSUS    └──────────────┬───────┘
 (Early Stopping)                     ▼
 Lock Answer & Execute       ⚠️ DIVERGENCE DETECTED
                           Trigger Deep-Dive / Plan Artifact
```

---

## 2. Protocol Execution Rules

### A. The 3 Reasoning Perspectives
1. **Pass 1 (Functional Flow):** Direct implementation addressing primary requirements.
2. **Pass 2 (Defensive & Data Integrity):** Edge cases, nullability, transaction boundary, schema mapping, rollback.
3. **Pass 3 (Architecture & Performance):** Anti-N+1, UI thread non-blocking, async safety, module isolation (`R_UNIVERSE`).

### B. Early Stopping Conditions
- If **Pass 1 and Pass 2 yield the exact same solution pattern** &rarr; Proceed to Pass 3.
- If **Pass 1 == Pass 2 == Pass 3 (Consensus)** &rarr; **EARLY EXIT**. Lock the decision and immediately write code/tests. Zero redundant looping.

### C. Divergence Handling
- If **Pass 1 ≠ Pass 2** or **Pass 1 ≠ Pass 3 (Divergence)**:
  - DO NOT flip a coin or take arbitrary guess.
  - Identify root cause of divergence (hidden constraint, schema conflict, race condition).
  - Resolve via test reproduction (`TDD`) or document trade-offs in `implementation_plan.md` for user confirmation.

---

## 3. Token Economy & ROI
- **Simple Tasks:** Single pass, zero overhead.
- **Medium/High Tasks with Consensus:** 3 passes (~100-150 tokens overhead), saves ~2000 tokens of subsequent bugfix cycles.
- **Complex Tasks with Divergence:** Traps critical flaws before writing production code.

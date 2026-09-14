---
name: EmpiricalCognitiveLoopArchitecture
title: Empirical Cognitive Loop & Cognitive Scaffolding Architecture
desc: Empirical Cognitive Loop & Cognitive Scaffolding Architecture — 5-Phase Closed Loop, Active Sensing, Pre-Mortem Persona Simulation, and Epistemic Calibration
rules: [R_CORE, R_ENG_OS, R_COG_LOOP, R_PRE_MORTEM, R_EPISTEMIC]
category: Architecture
---
# 🧠 Empirical Cognitive Loop & Cognitive Scaffolding Architecture

## 1. Architectural Vision

Modern Large Language Models (LLMs) operate fundamentally via token-level next-word prediction (**Kahneman's System 1**). Without external cognitive scaffolding, an agent is purely reactive: it jumps directly from user prompts to code generation, relying on stochastic recall rather than grounded deliberation.

The **Empirical Cognitive Loop Architecture** surrounds the LLM "Reasoning Core" with a deterministic cognitive operating environment (**System 2 Scaffolding**). It guarantees that the agent:
1. **Never writes code before understanding deep boundaries** (Socratic Inquiry).
2. **Never modifies state without capturing a verifiable benchmark** (Baseline Inscription).
3. **Never releases solutions without simulated stress-testing** (Pre-Mortem & User Persona Sandbox).
4. **Never asserts success without measurable proof** (Grounded Experimentation & Comparative Delta).
5. **Never loses operational wisdom** (Consolidation into Long-Term Memory).

```
                        ┌──────────────────────────────────────────────┐
                        │            SemanticBrain & Memory            │
                        │    (Episodic Graveyard & Invariant Rules)    │
                        └──────────────────────┬───────────────────────┘
                                               │ (Pre-fetch & History Check)
                                               ▼
┌──────────────────┐               ┌───────────────────────┐               ┌──────────────────┐
│  Phase 1:        │ ──Clarify───► │  Phase 2:             │ ──Formulate─► │  Phase 3:        │
│  Socratic        │               │  Baseline Inscription │               │  Targeted        │
│  Inquiry         │               │  & Hypothesis (H1)    │               │  Implementation  │
└──────────────────┘               └───────────────────────┘               └─────────┬────────┘
                                               ▲                                     │
                                               │ (Re-evaluate on failure)            ▼
┌──────────────────┐               ┌───────────┴───────────┐               ┌──────────────────┐
│  Phase 5:        │ ◄──Evaluate── │  Phase 4:             │ ◄──Verify──── │  Mental Sandbox  │
│  Comparative     │               │  Grounded Stress      │   Feedback    │  & Pre-Mortem    │
│  Delta (Δ)       │               │  Experimentation      │               │  Simulation      │
└────────┬─────────┘               └───────────────────────┘               └──────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Memory Consolidation (Sleep Protocol)        │
│ • Success -> SemanticBrain Proven Pattern    │
│ • Failure -> Historian Graveyard (Anti-Rule) │
└──────────────────────────────────────────────┘
```

---

## 2. The 5 Universal Phases of Cognition

Every non-trivial engineering task (bugfix, architectural refactoring, feature implementation, performance optimization) must strictly navigate the 5-phase cycle:

### Phase 1: Socratic Inquiry & Boundary Framing
The agent actively interrogates premises before formulating solutions:
- **Root Cause vs. Symptom:** Distinguish the observed error from the underlying structural defect.
- **Inviolable Invariants:** Explicitly list what contracts, database schemas, public APIs, or performance envelopes must **not** change.
- **Constraint Elicitation:** Identify real-world operating conditions (e.g., concurrency levels, memory budgets, network latency, operator environment).

### Phase 2: Baseline Inscription & Falsifiable Hypothesis ($H_1$)
Before altering any project file, the agent records an empirical snapshot:
- **Quantitative Baseline:** Measure and record the current metric (e.g., latency: 450ms, heap allocation: 12MB, error rate: 100%, test status: failing).
- **Falsifiable Hypothesis ($H_1$):** Formulate an explicit testable assertion:
  $$\text{"If we implement pattern } X \text{, then metric } Y \text{ will improve by } Z\% \text{ without degrading invariant } W\text{."}$$
- **Failed Approach Guard:** Query SemanticBrain to ensure the hypothesis has not already failed in past attempts under identical conditions.

### Phase 3: Targeted Implementation (Minimal Blast-Radius)
Execute code modifications adhering strictly to single-responsibility boundaries:
- Implement the minimal viable delta required to test $H_1$.
- Avoid collateral refactoring or formatting sweeps in unrelated modules.
- Preserve backward compatibility and existing unit tests.

### Phase 4: Grounded Stress Experimentation (Epistemic Verification)
A green compiler or trivial unit test is **not** sufficient proof of correctness. The agent subjects the new code to empirical pressure:
- **Volume & Scale Stress:** Test with realistic production data volumes (e.g., 100,000 entities vs. 5 mock items).
- **Concurrency & Race Conditions:** Verify thread safety, re-entrancy, and lock contention.
- **Negative & Adversarial Testing:** Feed malformed payloads, abrupt network disconnects, and unauthorized inputs to verify boundary resilience.

### Phase 5: Comparative Delta ($\Delta$) & Knowledge Consolidation
Compute the explicit empirical difference between the new state and the Phase 2 baseline:
$$\Delta = \text{Metric}_{\text{After}} - \text{Metric}_{\text{Before}}$$

```
| Metric / Invariant           | Baseline (Before) | New Implementation | Delta (Δ)      | Outcome |
| :--------------------------- | :---------------- | :----------------- | :------------- | :------ |
| Execution Latency (p95)      | 420 ms            | 115 ms             | -72.6% (Fast)  | ✅ PASS  |
| Memory Allocation            | 14.8 MB           | 2.1 MB             | -85.8% (Lean)  | ✅ PASS  |
| Regression Test Pass Rate    | 100% (24/24)      | 100% (26/26)       | +2 new tests   | ✅ PASS  |
| User Ergonomics & Misclicks  | Prone to misclick | Explicit debounce  | Zero misclicks | ✅ PASS  |
```

- **If $\Delta \ge 0$ (Target met, zero regression):** Commit cleanly via conventional commits and record the proven pattern into SemanticBrain (`post-harvest`).
- **If $\Delta < 0$ (Regression or failed hypothesis):** Immediately trigger an atomic git rollback, log the failed attempt into the Historian Graveyard, and pivot the hypothesis.

---

## 3. Active Environment Sensing (Zero-Turn State Sweep)

An intelligent agent must possess awareness of its physical operating context before cognitive processing:
- **Dirty Workspace Detection:** Scan `git status` prior to planning. Uncommitted local modifications must not be mistaken for fresh regressions.
- **Pre-Existing Broken Baselines:** Verify whether the test suite and build pipeline pass **before** touching code. Never attempt a feature on top of a broken build without alerting the operator.
- **Resource Footprint & File Locks:** Detect stale running processes, locked DLLs, or zombie dev servers that would corrupt build outputs.

---

## 4. Mental Sandbox & Pre-Mortem Protocol

The defining hallmark of experienced engineers and designers is **tacit foresight** — the ability to visualize how an implementation will fail in production before writing it.

Prior to code generation, the agent must execute a mandatory **Pre-Mortem Analysis**:

```
                              ┌──────────────────────────────┐
                              │     PRE-MORTEM PROTOCOL      │
                              └──────────────┬───────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
    [1. Ergonomic Persona]         [2. Scale & Volume]          [3. Catastrophic Modes]
    "How does a fatigued user      "What happens when data      "What are the top 3 worst
    misuse this interface under    expands 100x beyond local    failure scenarios in real
    real-world conditions?"        test mocks?"                 deployment?"
```

1. **Ergonomic Persona Proxy:**
   - *Example (ERP UI):* "A warehouse operator wearing work gloves using a rugged barcode scanner will accidentally trigger this adjacent delete button 40 times a day. Requirement: Move action to overflow menu, mandate confirmation modal."
2. **Scale Stress Simulation:**
   - *Example (Data Pipeline):* "This LINQ `.ToList()` call holds all records in memory. Works fine with 50 test rows; triggers `OutOfMemoryException` with 500,000 production rows. Requirement: Stream via `IAsyncEnumerable` or bounded producer-consumer channel."
3. **Catastrophic Failure Modes:**
   - Identify network partition behavior, database timeout deadlocks, and stale-state race conditions.

---

## 5. Epistemic Calibration & The Uncertainty Gate

Agents frequently suffer from **Epistemic Overconfidence** — presenting speculative assumptions as definitive facts. The Uncertainty Gate enforces epistemic humility:

$$\text{Uncertainty Score } (U) = f(\text{Test Coverage}, \text{Documentation Quality}, \text{Domain Complexity}, \text{Code Churn})$$

```
                  ┌──────────────────────────────────────────────┐
                  │          EPISTEMIC UNCERTAINTY GATE          │
                  └──────────────────────┬───────────────────────┘
                                         │
                         Is Uncertainty Score U > 0.6?
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼ YES                                     ▼ NO
         [DOWNGRADE TO PROBE MODE]                 [DIRECT IMPLEMENTATION]
         • Forbid bulk refactoring                 • Standard TDD & Feature flow
         • Write diagnostic spikes                 • Execute minimal delta
         • Add empirical test probes               • Validate against baseline
         • Inspect runtime logs
```

- **High Uncertainty ($U > 0.6$):** The agent is **strictly prohibited** from performing broad refactorings or rewriting architecture. It must enter **Spike / Probing Mode**: write isolated reproduction tests, inject logging probes, and establish concrete ground truth first.
- **Low Uncertainty ($U \le 0.6$):** The agent proceeds with confident, minimal-delta implementation.

---

## 6. Memory Consolidation: The Sleep Protocol

In human cognition, sleep consolidates fragmented episodic memories into durable semantic knowledge and reflex heuristics.

Agent systems must not allow episodic logs (`post-harvest` Q&A pairs) to grow infinitely into noisy vector databases:
1. **Episodic Layer (L3):** Daily post-harvest entries capturing specific problem-solution pairs.
2. **Consolidation Sweep (Sleep Engine):** A scheduled distillation process scans recent episodic logs to identify recurrent patterns, frequent anti-patterns, and repeating edge cases.
3. **Semantic Invariant Promotion (L1/L2):** Distilled insights are codified directly into immutable rules (`rules.json`) or concrete engineering standards (`standards/`).

---

## 7. Dual-Brain Cognition (Actor vs. Adversarial Critic)

Single-agent reasoning is vulnerable to **Confirmation Bias**: the entity that wrote the code instinctively rationalizes why it is correct.

The Cognitive Scaffolding separates cognitive duties:
- **Actor (Builder Core):** Focused on feature delivery, architectural harmony, and functional correctness.
- **Adversarial Critic (Auditor Core):** An independent persona evaluated under adversarial constraints. Its sole objective is to **break the Actor's solution** (seeking race conditions, unauthorized state tampering, UI misclicks, memory leaks, and unhandled edge cases).
- Only when the Adversarial Critic produces zero fatal objections is the delta permitted to proceed to the commit gate.

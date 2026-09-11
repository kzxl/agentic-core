---
desc: Expected Information Gain Architecture — Bayesian Optimal Experimental Design, Epistemic Value of Information & Redundant Trial Pruning
rules: [R_INFO_GAIN, R_RESEARCH, R_BUDGET, R_ENG_OS, R_CORE]
---
# 💡 Expected Information Gain (EIG) Engine Architecture

## 1. Architectural Vision: The Scientist's Pre-Flight Filter

In naive agent engineering, every plausible code patch or command is treated as equally worthy of execution:

$$\text{Agent Idea} \xrightarrow{\quad\text{Execute Directly}\quad} \text{Run Benchmark / Test}$$

This naive approach wastes tokens, burns budgets, and floods working memory with redundant data. Conversely, human scientists operate under the **Pre-Flight Epistemic Invariant**:

$$\text{"Before I expend resources running this experiment, what is the probability it will teach me something fundamentally new?"}$$

```text
               EVALUATING THREE SUCCESSIVE EXPERIMENTS
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ EXPERIMENT A  │           │ EXPERIMENT B  │           │ EXPERIMENT C  │
│(Novel Premise)│           │ (Minor Tweak) │           │(Cosmetic Var.)│
├───────────────┤           ├───────────────┤           ├───────────────┤
│ Disproves main│           │ Corroborates A│           │ Outcome is 95%│
│ assumption    │           │ with delta=2% │           │ identical to A│
├───────────────┤           ├───────────────┤           ├───────────────┤
│ EIG: HIGH     │           │ EIG: LOW      │           │ EIG: ZERO     │
│ [EXECUTE NOW] │           │ [DE-PRIORITIZE│           │ [PRUNE / BLOCK│
└───────────────┘           └───────────────┘           └───────────────┘
```

The **Expected Information Gain (EIG) Engine** implements formal **Bayesian Optimal Experimental Design (OED)** to evaluate, rank, and prune candidate experiments *before* executing a single line of code.

---

## 2. Mathematical Foundation: Bayesian Optimal Experimental Design

Let $\Theta = \{H_1, H_2, \dots, H_M\}$ represent the finite discrete set of competing hypotheses under active investigation.

### 2.1 Prior Epistemic Uncertainty (Entropy)
The agent's uncertainty over the true state of the software system is quantified by the Shannon entropy of the hypothesis distribution:

$$H(\Theta) = -\sum_{m=1}^M P(H_m) \log_2 P(H_m)$$

### 2.2 Expected Posterior Uncertainty
For a candidate experiment $e \in \mathcal{E}$, let $\mathcal{Y}_e = \{y_1, y_2, \dots, y_K\}$ denote the set of possible observable outcomes (e.g. `latency_improved`, `latency_regressed`, `compile_error`).

The expected posterior entropy across all potential outcomes is:

$$\mathbb{E}_{y \sim p(y \mid e)} [H(\Theta \mid y, e)] = \sum_{k=1}^K P(y_k \mid e) \cdot \left( -\sum_{m=1}^M P(H_m \mid y_k, e) \log_2 P(H_m \mid y_k, e) \right)$$

### 2.3 Expected Information Gain (EIG)
The Expected Information Gain of experiment $e$ is the mutual information between the hypothesis space $\Theta$ and the anticipated observation $y$:

$$\mathbb{E}[\text{IG}(e)] = I(\Theta; y \mid e) = H(\Theta) - \mathbb{E}_{y \sim p(y \mid e)} [H(\Theta \mid y, e)]$$

---

## 3. The Three Epistemic Classes of Experiments

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CANDIDATE EXPERIMENT POOL                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  CLASS 1: HIGH   │       │  CLASS 2: LOW    │       │  CLASS 3: ZERO   │
│   BIFURCATORS    │       │  CORROBORATORS   │       │ DEAD DUPLICATES  │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ EIG >= 0.50 bits │       │ 0.10 <= EIG < 0.5│       │ EIG < 0.10 bits  │
│ Outcome cleanly  │       │ Re-tests known   │       │ Outcome known    │
│ separates H1/H2  │       │ trend with micro-│       │ with >=90% prior │
│ Epistemic Leap   │       │ parameter tweak  │       │ certainty        │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ ACTION: EXECUTE  │       │ ACTION: QUEUE    │       │ ACTION: PRUNE    │
│ FIRST PRIORITY   │       │ IF BUDGET SPARE  │       │ STRICTLY FORBID  │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

### 3.1 Class 1: Hypothesis Bifurcators ($\mathbb{E}[\text{IG}] \ge 0.50$ bits)
* **Definition:** An experiment where Outcome $y_1$ strongly supports $H_1$ and falsifies $H_2$, while Outcome $y_2$ does the reverse.
* **Example:** *Benchmarking AVX2 Gather vs Scalar Unrolled Loads on Intel Core i9.*
  * If gather is faster $\implies H_1$ (Hardware gather micro-ops are efficient) lives, $H_2$ dies.
  * If scalar is faster $\implies H_2$ lives, $H_1$ dies.
* **Verdict:** Maximum epistemic utility. Must be prioritized immediately.

### 3.2 Class 2: Marginal Corroborators ($0.10 \le \mathbb{E}[\text{IG}] < 0.50$ bits)
* **Definition:** An experiment that tests a minor variation of an already-verified mechanism without altering the causal explanation.
* **Example:** *Testing unroll factor 8 after unroll factor 4 was already measured.*
* **Verdict:** Low marginal value. Execute only if Experiment Budget ($B_{\text{exp}}$) has ample surplus.

### 3.3 Class 3: Dead Duplicates ($\mathbb{E}[\text{IG}] < 0.10$ bits) — *The Strict Pruning Target*
* **Definition:** An experiment where the prior probability of the outcome is overwhelmingly predictable from prior evidence ($P(y = y_{\text{expected}}) \ge 0.90$).
* **Example:** *Testing unroll factor 16 after unroll factor 4 and 8 both caused L1I cache thrashing with zero speedup.*
  * The outcome is already 98% certain to thrash the cache and fail.
  * Running this experiment teaches the agent **nothing new**.
* **Verdict:** **ABSOLUTELY FORBIDDEN.** The engine intercepts and prunes the candidate before code generation.

---

## 4. Epistemic Return on Investment (eROI)

When deciding among $N$ candidate experiments under finite resource constraints (Token Budget, Time Budget, Experiment Budget), the engine ranks candidates by **eROI**:

$$\text{eROI}(e) = \frac{\mathbb{E}[\text{IG}(e)]}{\text{ResourceCost}(e)} = \frac{\mathbb{E}[\text{IG}(e)]}{w_1 \cdot \text{EstTokens}(e) + w_2 \cdot \text{EstSeconds}(e) + w_3 \cdot \text{EstRisk}(e)}$$

The agent is mathematically directed to schedule the candidate that maximizes entropy reduction per unit of burned budget.

---

## 5. Architectural Pipeline & Interception Gate

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   RESEARCH EXPLORER GENERATES CANDIDATES               │
│                   Candidates: [Exp_A, Exp_B, Exp_C]                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    EIG PRE-FLIGHT EVALUATION GATE                      │
│                                                                        │
│   Exp_A: EIG = 0.85 bits, Cost = Low   ──► eROI = 1.42 [CLASS 1]       │
│   Exp_B: EIG = 0.22 bits, Cost = Med   ──► eROI = 0.31 [CLASS 2]       │
│   Exp_C: EIG = 0.02 bits, Cost = Med   ──► eROI = 0.03 [CLASS 3]       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DISPATCH RESOLUTION                            │
│                                                                        │
│   1. DISPATCH: Exp_A (Highest eROI, bifurcates core hypotheses)        │
│   2. QUEUE:    Exp_B (Hold in reserve)                                 │
│   3. PRUNE:    Exp_C (Blocked: EIG < 0.10 bits, redundant mechanism)  │
└────────────────────────────────────────────────────────────────────────┘
```

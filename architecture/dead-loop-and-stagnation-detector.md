---
desc: Dead-Loop & Research Stagnation Detector — Structural Graph Cycle Detection, Semantic Similarity Matrix & Epistemic Entropy Breaker
rules: [R_DEAD_LOOP, R_RESEARCH, R_RES_MEM, R_ENG_OS, R_CORE]
---
# 🔄 Dead-Loop & Research Stagnation Detector Architecture

## 1. Architectural Vision: The Two Modes of Agent Looping

Autonomous agents operating without meta-cognitive supervision inevitably succumb to two distinct topological traps:

```text
                           AGENT EXECUTION PATHOLOGIES
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│  MODE 1: STRUCTURAL GRAPH CYCLES     │  │  MODE 2: SEMANTIC STAGNATION         │
│  "Syntactic Ping-Pong / Triplet"     │  │  "Synonym Thrashing & Stagnation"    │
├──────────────────────────────────────┤  ├──────────────────────────────────────┤
│ State A ──► State B ──► State C      │  │ Query 1: "Rust FFI memory overhead"  │
│    ▲                       │         │  │ Query 2: "Rust FFI RAM consumption"   │
│    └───────────────────────┘         │  │ Query 3: "Rust FFI heap footprint"    │
│                                      │  │ Query 4: "Rust FFI memory cost"      │
│ • Exact state or action hash repeats │  │ • Structurally different text tokens │
│ • Identical compiler / test errors   │  │ • Identical underlying semantic space│
│ • Deterministic, discrete recurrence │  │ • Marginal Information Gain: ΔI ≈ 0  │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

The **Dead-Loop & Research Stagnation Detector** is an in-process, dual-mode meta-cognitive guardian that intercepts both discrete graph cycles and continuous semantic plateaus before they burn execution tokens or corrupt codebases.

---

## 2. Dual-Engine Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AGENT RUNTIME DISPATCHER                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ Action / Query Stream (t)
┌────────────────────────────────────────────────────────────────────────┐
│               DUAL-MODE DEAD-LOOP & STAGNATION DETECTOR                │
│                                                                        │
│   ┌────────────────────────────────┐  ┌────────────────────────────┐   │
│   │  ENGINE 1: GRAPH CYCLE ENGINE  │  │ ENGINE 2: SEMANTIC ENGINE  │   │
│   │  • State Hash Tracker H(S_t)   │  │ • Sliding Window Buffer W  │   │
│   │  • Directed Graph G = (V, E)   │  │ • Cosine Similarity Matrix │   │
│   │  • Floyd / Tarjan SCC Detector │  │ • Document Jaccard Overlap │   │
│   │  • Sliding-Window Path Hashing │  │ • Epistemic Entropy ΔI     │   │
│   └───────────────┬────────────────┘  └─────────────┬──────────────┘   │
└───────────────────┼─────────────────────────────────┼──────────────────┘
                    │                                 │
                    ▼                                 ▼
           [Cycle Detected?]                 [Stagnation Detected?]
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                     ┌───────────────────────────────┐
                     │   STAGNATION CIRCUIT BREAKER  │
                     │  • Intercept Execution        │
                     │  • Lock Out Redundant Query   │
                     │  • Rollback Ephemeral Diff    │
                     │  • Escalate to Res. Manager   │
                     └───────────────┬───────────────┘
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │    RESEARCH MANAGER DECISION  │
                     │       [PIVOT] or [DISCARD]    │
                     └───────────────────────────────┘
```

---

## 3. Engine 1: Structural Graph Cycle Detection

### 3.1 State & Action Representation
At each discrete step $t$, the detector computes a composite state-action signature $s_t$:

$$s_t = \text{Hash}\Big(\text{ActionType} \parallel \text{TargetEntity} \parallel \text{AST\_Delta\_Hash} \parallel \text{ErrorSignature}\Big)$$

The execution history is modeled as a directed multigraph $G = (V, E)$, where $V$ represents observed state signatures and directed edges $e = (s_{t-1}, s_t)$ represent transitions.

### 3.2 Detection Algorithms
The engine employs two complementary detection mechanisms across a sliding window of depth $W = 8$:

1. **Sliding-Window Path Hashing (Zobrist-Style):**
   * Computes incremental rolling path hashes for sequence lengths $L \in \{2, 3, 4\}$.
   * An immediate ping-pong cycle ($L = 2$): $s_t = s_{t-2}$ with $s_{t-1} = s_{t-3}$.
   * A triplet cycle ($L = 3$): $s_t = s_{t-3}$ with $(s_t, s_{t-1}, s_{t-2}) = (s_{t-3}, s_{t-4}, s_{t-5})$.
2. **Directed Cycle Interception:**
   * When any vertex $s \in V$ exceeds an in-degree threshold within window $W$ ($\text{deg}^-(s) \ge 2$) and forms an active closed directed path, `GRAPH_CYCLE_DETECTED` is asserted immediately.

---

## 4. Engine 2: Semantic & Information-Theoretic Stagnation Detection

### 4.1 The Semantic Similarity Matrix
For investigative actions (e.g. web search, codebase grep, log inspection), the agent often varies word forms to bypass lexical filters while asking the exact same epistemic question:

$$\mathbf{Q}_W = [q_{t-K}, \dots, q_{t-1}, q_t]$$

The engine projects each query into dense embedding space $\mathbf{e}_i = \text{Embed}(q_i)$ (or fast character/word $n$-gram MinHash when offline) and constructs the pairwise similarity matrix:

$$S_{ij} = \cos(\mathbf{e}_i, \mathbf{e}_j) = \frac{\mathbf{e}_i \cdot \mathbf{e}_j}{\|\mathbf{e}_i\| \|\mathbf{e}_j\|}$$

* **Threshold Invariant:** If $\max_{j < i} S_{ij} \ge \tau_{\text{semantic}}$ (calibrated at $\tau = 0.82$), the query is flagged as an **Echo Query**.

### 4.2 Marginal Information Gain ($\Delta I$)
A query that is semantically similar might be justified *only* if it uncovers disjoint, novel evidence. The engine measures empirical novelty via **Document Cluster Jaccard Overlap**:

$$J(D_t, D_{<t}) = \frac{|D_t \cap D_{<t}|}{|D_t \cup D_{<t}|}$$

Where $D_t$ is the set of identifiers (file paths, documentation sections, AST symbol nodes) returned by query $t$.

$$\text{Marginal Information Gain } \Delta I_t = 1 - J(D_t, D_{<t})$$

* If $\text{Echo Query}$ is flagged AND $\Delta I_t \le 0.15$ for $N \ge 2$ consecutive queries:
  $$\implies \textbf{RESEARCH\_STAGNATION}$$

---

## 5. 4-Tier Alert Hierarchy & State Machine

```text
  ┌───────────────┐
  │    NOMINAL    │ ◄─── Normal frontier expansion (ΔI > 0.40, no graph cycles)
  └───────┬───────┘
          │ Query similarity >= 0.80 across consecutive steps
          ▼
  ┌───────────────┐
  │ ECHO_WARNING  │ ◄─── Warn agent: "Synonym permutation detected. Broaden query axis."
  └───────┬───────┘
          │
          ├───────────────────────────────────────────┐
          │ ΔI < 0.15 for >= 2 queries                │ Graph cycle closed (A -> B -> C -> A)
          ▼                                           ▼
  ┌──────────────────────┐                    ┌─────────────────────────┐
  │ RESEARCH_STAGNATION  │                    │  GRAPH_CYCLE_DETECTED   │
  └──────────┬───────────┘                    └────────────┬────────────┘
             │                                             │
             └──────────────────────┬──────────────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │ CIRCUIT BREAKER TRIGGERED │
                      │   Hard stop & Rollback    │
                      └───────────────────────────┘
```

| State | Trigger Condition | Agent Action Required |
| :--- | :--- | :--- |
| **`NOMINAL`** | Unique states, $\Delta I \ge 0.40$, acyclic transition graph. | Proceed normally. |
| **`ECHO_WARNING`** | $\cos(\mathbf{e}_t, \mathbf{e}_{t-1}) \ge 0.80$ with novel results. | Suppress further synonym tweaking; force orthogonal query domain. |
| **`GRAPH_CYCLE_DETECTED`** | Direct edge closure $s_t \to \dots \to s_t$ ($L \in [2, 4]$). | **Halt.** Roll back dirty working tree (`git checkout -- .`). Forbid re-entry. |
| **`RESEARCH_STAGNATION`** | Semantic similarity $\ge 0.82$ with $\Delta I < 0.15$ over 2+ queries. | **Trip Circuit Breaker.** Escalate to Research Manager $\to$ force `PIVOT` or `DISCARD`. |

---

## 6. Escalation Protocol to Research Manager

When `GRAPH_CYCLE_DETECTED` or `RESEARCH_STAGNATION` trips the circuit breaker:

1. **Immediate Execution Freeze:** The agent is physically blocked from dispatching the proposed query or repeating the failed patch.
2. **Causal Incident Report Generation:**
   ```text
   [STAGNATION CIRCUIT BREAKER TRIPPED]
   - Type: RESEARCH_STAGNATION (Semantic Thrashing)
   - Redundant Queries:
     #1: "How to eliminate dynamic dispatch overhead in C# interface"
     #2: "C# remove vtable call virtual function cost"
     #3: "Devirtualization tricks in .NET 8"
   - Similarity: 0.89 | Marginal Information Gain: 0.04 (Stagnant)
   - Diagnostic: The agent is re-phrasing questions about devirtualization without generating new architectural alternatives.
   ```
3. **Executive Resolution:** The **Research Manager** evaluates the incident and enforces one of two non-negotiable transitions:
   * **`PIVOT`:** Prohibit all further inquiries on interface devirtualization; pivot to source-generated static polymorphism (`CRTP` or struct generics).
   * **`DISCARD`:** Mark the current hypothesis `DEAD` in the Historian graveyard and prune the search branch entirely.

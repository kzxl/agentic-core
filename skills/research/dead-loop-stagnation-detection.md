---
desc: Dead-Loop & Stagnation Detection Protocol — Sliding Window Query Tracking, Graph Cycle Interception & Semantic Circuit Breakers
rules: [R_DEAD_LOOP, R_RESEARCH, R_STATE]
---
# 🛑 Dead-Loop & Stagnation Detection Protocol

## 1. Context & Threat Model

When solving challenging engineering problems, AI agents frequently enter **Cognitive Dead Loops**:
1. **The Structural Ping-Pong / Triplet ($A \to B \to C \to A$):**
   * *Example:* Agent edits file `Foo.cs` to add generic constraint $\to$ build fails with CS0311 $\to$ Agent changes to object cast $\to$ runtime invalid cast exception $\to$ Agent removes cast and reverts to generic constraint $\to$ repeats indefinitely.
2. **The Search Synonym Spin (Research Stagnation):**
   * *Example:*
     * Turn 1: `Search: "AVX2 gather instruction latency Intel"`
     * Turn 2: `Search: "Intel AVX2 gather performance cycles"`
     * Turn 3: `Search: "x86 vpgatherdd benchmark throughput"`
     * Turn 4: `Search: "is AVX2 gather fast or slow"`
   * The agent generates 4 queries that look lexically distinct, but all 4 inhabit the exact same semantic coordinates and return identical documentation. **Zero epistemic progress** is made.

This protocol provides the concrete rules and circuit breaker mechanisms to detect and break both failure modes.

---

## 2. Sliding Window Working Memory Buffer

To detect loops, the agent must maintain an in-memory sliding buffer ($W = 6$) in its working memory scratchpad:

```json
{
  "recent_actions": [
    { "step": 14, "type": "tool_query", "target": "search_web", "query": "AVX2 gather instruction latency Intel", "fingerprint": "q_7f21a" },
    { "step": 15, "type": "tool_query", "target": "search_web", "query": "Intel AVX2 gather performance cycles", "fingerprint": "q_7f21b" },
    { "step": 16, "type": "code_edit", "target": "kernel.c", "ast_delta": "unroll_loop_4", "fingerprint": "c_901a" }
  ],
  "seen_state_hashes": ["c_901a", "c_901b", "c_901a"]
}
```

---

## 3. Detection Rule 1: Structural Graph Cycle ($A \to B \dots \to A$)

### The Check:
Before executing any state-mutating action (code edit, compiler invocation, test run), compare the planned state signature $s_{\text{planned}}$ against `seen_state_hashes`:

1. If $s_{\text{planned}} == s_{t-2}$ (Ping-Pong, period $L=2$):
   * **IMMEDIATE REJECTION.**
   * Trigger: `[STRUCTURAL CYCLE DETECTED: Period 2 Ping-Pong]`
2. If $s_{\text{planned}} == s_{t-3}$ or $s_{\text{planned}} == s_{t-4}$ (Triplet/Quad Cycle):
   * **IMMEDIATE REJECTION.**
   * Trigger: `[STRUCTURAL CYCLE DETECTED: Period L Cycle]`

### The Remediation:
* **Immediate Git Rollback:** Discard the dirty working state via `git checkout -- <file>`.
* **Lock Out Recurrent Action:** Add the state signature to the Historian Graveyard.
* **Force Orthogonal Strategy:** The agent is forbidden from editing the same function body until an architectural pivot is approved.

---

## 4. Detection Rule 2: Semantic Stagnation (The Synonym Spin)

### The Check:
Before issuing a new search, grep, or documentation query $q_{\text{new}}$:

1. **Calculate Semantic Overlap:** Compare $q_{\text{new}}$ against recent queries $q \in \mathbf{Q}_{W}$ using token overlap, keyword stem matching, or vector cosine:
   $$\text{Similarity}(q_{\text{new}}, q_j) \ge 0.82$$
2. **Calculate Information Novelty:** Evaluate whether previous query $q_j$ already answered the core factual requirement. If the previous query returned documentation but the agent didn't like the answer and re-queries with a synonym:
   $$\implies \textbf{RESEARCH\_STAGNATION}$$

```text
[DETECTOR PRE-FLIGHT VERDICT]
Query: "is AVX2 gather fast or slow"
Matched against recent query: "AVX2 gather instruction latency Intel" (Sim: 0.88)
Information Novelty: 0.00 (Latency tables already retrieved in Step 14).
STATUS: REJECTED BY R_DEAD_LOOP.
```

---

## 5. The Stagnation Circuit Breaker & Breakout Protocol

When a loop or stagnation is detected, the agent **MUST NOT** proceed silently. It must output the standardized **Circuit Breaker Breakout Notice**:

```text
╔══════════════════════════════════════════════════════════════════════╗
║  🚨 STAGNATION CIRCUIT BREAKER TRIPPED                               ║
╠══════════════════════════════════════════════════════════════════════╣
║ Mode: RESEARCH_STAGNATION (Synonym Thrashing)                        ║
║ Repeated Subject: AVX2 Gather Instruction Performance                ║
║ Evidence Already Acquired: Gather throughput is 2-4x slower than    ║
║ sequential scalar loads on Intel Skylake/Zen3 architectures.         ║
║ Root Cause of Loop: Seeking confirmation for an invalid optimization ║
║ premise instead of accepting the empirical data.                     ║
╠══════════════════════════════════════════════════════════════════════╣
║ MANDATORY ACTION: FORCED PIVOT                                       ║
║ 1. Cease all queries on SIMD gather instructions.                    ║
║ 2. Mark Hypothesis H-004 (SIMD Gather Acceleration) as DEAD.        ║
║ 3. PIVOT to Structure-of-Arrays (SoA) layout reorganization to       ║
║    enable contiguous linear vector loads (_mm256_load_si256).        ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 6. Self-Audit Checklist for AI Agents

Before submitting your next thought or tool call, perform this 3-second self-audit:

- [ ] **Are you asking the same question with different words?** If you searched for "X latency", did you just search for "X speed"?
- [ ] **Did you already revert this exact code line earlier in the task?** If you are undoing your own previous fix, you are in a cycle.
- [ ] **Has the compiler returned the exact same error code 2 times?** (e.g. CS0120, E0308). If yes, stop changing syntax; the architecture is mismatched.
- [ ] **Has the Research Manager tripped $K=2$?** If 2 variations failed, escalate to `PIVOT` or `DISCARD` immediately.

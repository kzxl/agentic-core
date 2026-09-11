---
desc: Multi-Dimensional Research Budget Governance Protocol — Working Memory Quotas, Burn Telemetry & Stagnation Exhaustion Playbook
rules: [R_BUDGET, R_RESEARCH, R_STATE]
---
# 📊 Multi-Dimensional Research Budget Governance Protocol

## 1. Operating Philosophy: "Resource-Aware Engineering"

A junior agent burns 50 iterations searching Google without writing a line of code. A senior agent budgets its resources like an elite R&D team:
* *Tokens* are finite capital.
* *Wall-clock time* is an SLA.
* *Failed experiments* are bounded explorations.
* *Stagnation* is an immediate signal to change strategy.

Never rely on a single `max_iterations` counter. Manage a live **Multi-Dimensional Budget Ledger**.

---

## 2. Working Memory Budget Ledger

During any research, optimization, or complex debugging task, the agent must maintain this JSON ledger in its working memory:

```json
{
  "research_budget": {
    "token_budget": { "allocated": 150000, "consumed": 38200, "remaining": 111800 },
    "time_budget_sec": { "allocated": 600, "elapsed": 145, "remaining": 455 },
    "experiment_budget": { "allocated": 12, "executed": 4, "remaining": 8 },
    "search_budget": { "allocated": 6, "executed": 3, "remaining": 3 },
    "hypothesis_budget": { "allocated": 4, "tested": 1, "remaining": 3 },
    "stagnation_budget": { "max_consecutive_zero_gain": 5, "current_stagnant_streak": 0 }
  }
}
```

---

## 3. Pre-Flight Quota Deduction Workflow

Before issuing any tool call or code modification:

```text
Action Planned
     │
     ├── Is it a Search / Grep?  ──► Deduct search_budget. If <= 0 ──► TRIGGER SEARCH CLAMP
     ├── Is it an Experiment?   ──► Deduct experiment_budget. If <= 0 ──► TRIGGER EMPIRICAL CLAMP
     └── Is it a New Hypothesis?──► Deduct hypothesis_budget. If <= 0 ──► TRIGGER EXPLORATION CAP
```

### 3.1 The Search Quota Clamp ($B_{\text{search}} \le 0$)
When the search budget is exhausted:
1. **Tool Ban:** The agent is **strictly prohibited** from calling `search_web`, `read_url_content`, or running open-ended exploratory directory scans.
2. **Forced Synthesis Directive:**
   ```text
   [SEARCH BUDGET EXHAUSTED - QUOTA CLAMP ENFORCED]
   All 6 allocated discovery queries have been consumed. 
   You MUST proceed using currently acquired evidence. 
   Formulate your hypothesis and begin code implementation immediately.
   ```

---

## 4. The 5-Experiment Stagnation Exhaustion Protocol

### 4.1 Measuring Marginal Information Gain ($\Delta I$)
After each experiment #k:
1. Did the target benchmark or test metric improve by $\ge 5\%$? ($\Delta_{\text{metric}} \ge 0.05$)
2. Did the profiler or compiler return a fundamentally new diagnostic clue? ($\Delta_{\text{diag}} \ge 0.05$)
3. **If NEITHER:** The experiment is marked **Zero-Gain**:
   $$\Delta I_k < \epsilon \implies \text{Increment } \texttt{current\_stagnant\_streak}$$

### 4.2 The Forced Pivot Trigger ($B_{\text{stag}} \le 0$)
When `current_stagnant_streak == 5`:
* **The Stagnation Budget is completely depleted.**
* The agent is **forbidden** from running another micro-tweak on the current branch.
* Output the **Stagnation Exhaustion Notice**:

```text
╔══════════════════════════════════════════════════════════════════════╗
║  🚨 STAGNATION BUDGET EXHAUSTED (5/5 Zero-Gain Experiments)          ║
╠══════════════════════════════════════════════════════════════════════╣
║ Branch / Hypothesis: H-003 (Loop Unrolling in PopCount AVX2)        ║
║ Experiments Run: EXP-008 through EXP-012                             ║
║ Result: Zero significant throughput improvement (< 0.8% delta).      ║
║ Conclusion: Hardware execution port 0/1 is fully saturated.          ║
║ Additional code-level micro-tweaks will NOT yield speedup.           ║
╠══════════════════════════════════════════════════════════════════════╣
║ MANDATORY ACTION: PIVOT                                              ║
║ 1. Register H-003 as DEAD in the Historian Graveyard.                ║
║ 2. Git rollback: `git checkout -- kernel.c`                          ║
║ 3. Reset stagnation streak to 0.                                     ║
║ 4. PIVOT to orthogonal Hypothesis H-004: Cache-tiled lookup table.   ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 5. Early-Warning Amber Alerts (75% Consumption)

When any budget crosses $75\%$ consumption:
* **Token Budget $\ge 75\%$:** Condense output; disable exploratory sub-agents; use diff blocks instead of full files.
* **Time Budget $\ge 75\%$:** Abort long-running benchmarks; switch to low-iteration sanity passes.
* **Experiment Budget $\ge 75\%$:** Stop speculative trials; execute only high-confidence verification runs.

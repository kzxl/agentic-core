---
desc: Multi-objective refactoring standard enforcing zero performance regression, abstraction tax ceilings, and Net Engineering Value (NEV)
rules: [R_CORE, R_PERF, R_BENCH, R_NEV]
---
# 📐 Multi-Objective Refactoring & Net Engineering Value Standard

## 1. The Core Invariant: Pareto Refactoring

In autonomous software engineering, **functional equivalence (matching input/output behavior) is merely a necessary baseline, not a justification for code changes**.

Refactoring that preserves behavior while degrading performance or inflating architectural complexity is an **unacceptable regression**. Every refactoring must satisfy the **Pareto Improvement Principle**:
$$\text{Refactoring Valid} \iff (\text{Behavior}_{\text{New}} \equiv \text{Behavior}_{\text{Old}}) \land (\exists i: \text{Metric}_i^{\text{New}} > \text{Metric}_i^{\text{Old}}) \land (\forall j: \text{Metric}_j^{\text{New}} \ge \text{Metric}_j^{\text{Old}})$$

A refactoring that improves "elegance" but slows execution or triples line counts is strictly rejected.

---

## 2. The 4 Dimensions of the Quality Envelope

```
                          ┌───────────────────────────────────────────────┐
                          │         1. FUNCTIONAL CONTRACT INVARIANT      │
                          │   100% Test Pass • Zero Breaking Contract     │
                          └───────────────────────┬───────────────────────┘
                                                  │
            ┌─────────────────────────────────────┼─────────────────────────────────────┐
            ▼                                     ▼                                     ▼
   [2. RUNTIME ENVELOPE]               [3. ABSTRACTION TAX]                  [4. COGNITIVE LOAD]
   • Latency p95 (Δ ≤ 0%)              • LOC inflation ceiling (≤ +30%)      • Nesting depth (≤ 3)
   • Heap Allocation (Δ ≤ 0%)          • Ban single-impl interfaces          • Call-stack hop limit (≤ 2)
   • Zero extra DB queries (N+1 = 0)   • Ban pass-through wrappers           • Immediate debuggability
```

### Dimension 1: Functional Contract Invariance
- All existing unit, integration, and regression tests must pass without modification to their assertions.
- Return types, status codes, exception semantics, and side-effects must remain 100% backward-compatible.

### Dimension 2: Runtime Performance Envelope
- **Zero Latency Regression:** Execution time ($p50$, $p95$) must be equal to or faster than baseline ($\Delta \le 0\%$).
- **Zero Allocation Regression:** Heap allocations and garbage collection pressure must not increase.
- **Zero Query Inflation:** Refactoring must never introduce hidden N+1 queries, duplicate serialization sweeps, or unindexed scans.

### Dimension 3: The Abstraction Tax & Structural Leanliness
AI agents frequently suffer from **Speculative Over-Engineering** (converting 20 clear lines into 5 classes, 3 interfaces, and a factory).
- **The Abstraction Tax Limit:** Total Lines of Code (LOC) must not expand by more than **+30%** without introducing new business capabilities. If a refactoring bloats code from 50 to 150 lines just to satisfy an abstract pattern, it is rejected.
- **Single-Implementation Interface Ban:** Do not create `IFooService` if only `FooService` ever exists, unless mandated by an isolated architectural/RPC boundary.
- **Pass-Through Wrapper Ban:** Forbid classes or methods whose sole purpose is forwarding calls to another object without transformation or policy enforcement.

### Dimension 4: Cognitive Load & Debuggability
- **Nesting Depth Invariant:** Control-flow nesting must never exceed 3 levels. Use early returns (`guard clauses`) to flatten pyramids.
- **Call-Stack Hop Limit:** A developer reading the code must not need to navigate more than 2 intermediate layers to locate the actual execution logic.
- **Stack Trace Clarity:** When an exception occurs, the resulting stack trace must clearly identify the failing business operation without 15 levels of framework dispatchers.

---

## 3. Net Engineering Value (NEV) Formula

To evaluate whether a refactoring qualifies for merging, the agent evaluates its **Net Engineering Value (NEV)**:

$$\text{NEV} = \Delta \text{Maintainability} - \big(\Delta \text{Latency} + \text{Abstraction Tax} + \text{Cognitive Complexity}\big)$$

$$\text{Verdict} = \begin{cases} 
\text{APPROVED} & \text{if } \text{NEV} > 0 \text{ and } \Delta \text{Latency} \le 0 \\
\text{REJECTED \& ROLLBACK} & \text{if } \text{NEV} \le 0 \text{ or } \Delta \text{Latency} > 0 
\end{cases}$$

---

## 4. Mandatory Multi-Criteria Refactor Scorecard

Every pull request or commit generated from a refactoring task must include the following quantitative scorecard in its description:

```markdown
### ⚖️ Multi-Criteria Refactoring Scorecard

- **Target Module:** [e.g., InventoryAppService.Stockout.cs]
- **Primary Goal:** [e.g., Decompose 400-line monolithic method into single-responsibility partials]

| Dimension | Metric | Baseline (Old) | New Code | Delta (Δ) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Functional** | Test Suite Pass Rate | 18/18 (100%) | 22/22 (100%) | +4 tests | ✅ PASS |
| **Performance** | Execution Time (p95) | 42 ms | 39 ms | -7.1% | ✅ PASS |
| **Performance** | Heap Allocation | 8.2 KB | 2.4 KB | -70.7% | ✅ PASS |
| **Complexity** | Lines of Code (LOC) | 412 lines | 310 lines | -24.7% | ✅ PASS |
| **Complexity** | Max Nesting Depth | 5 levels | 2 levels | -60.0% | ✅ PASS |
| **Architecture** | New Files / Interfaces | N/A | 3 partials / 0 interfaces | Flat structure | ✅ PASS |

**Net Engineering Value:** POSITIVE (Clean separation, zero wrapper bloat, faster execution).
```

---

## 5. Automatic Red-Flag Rollback Triggers

If any of the following **Red Flags** occur during verification, the agent must immediately execute `git checkout .` to rollback changes:
1. 🚩 **Benchmark Regression:** Code executes $\ge 5\%$ slower or allocates $\ge 10\%$ more memory.
2. 🚩 **Bloat Regression:** Line count increases by $> 30\%$ without adding test coverage or new features.
3. 🚩 **Indirection Explosion:** An operation that originally required 1 function call now requires navigating $\ge 3$ new classes/wrappers.
4. 🚩 **Mocking Nightmare:** Writing a unit test for the refactored code requires configuring $> 3$ mock objects where none were needed previously.

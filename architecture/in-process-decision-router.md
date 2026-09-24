---
desc: In-Process System 1 Decision Router — Reflexive decision primitives (Choice, Noul, Score), zero-daemon execution, and calibrated pre-execution governance
rules: [R_ROUTE, R_ENG_OS, R_DEAD_LOOP, R_EPISTEMIC, R_CORE]
category: Architecture
---

# ⚡ In-Process System 1 Decision Router Architecture

## 1. Executive Summary & Problem Formulation

Standard autonomous agent loops suffer from severe computational waste and latency overhead when delegating trivial classification, tool routing, and circuit-breaker checks to heavy autoregressive Large Language Models (LLMs). Querying an LLM (System 2) for basic dispatch tasks introduces:
1. **Uncalibrated Latency**: 800ms to 4,000ms per decision round-trip.
2. **Ephemeral Schema Drift**: Stochastic output hallucinations that violate strict function-calling schemas.
3. **High Token Attrition**: Burning inference budgets on deterministic routing decisions.
4. **Daemon Bloat**: Introducing external microservices (e.g. Python sidecars, heavy GPU runtimes) introduces operational complexity and process isolation failures.

The **In-Process System 1 Decision Router** provides an ultra-low-latency (<15ms), zero-token, zero-daemon reflexive decision layer integrated natively into the runtime.

---

## 2. Dual-System Cognitive Pipeline

```
                                  [Task Description / Prompt]
                                                │
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   System 1: In-Process Decision Engine (route-decision.js)             │
│                                                                                        │
│  [Context Harvester]            [Lexical & Inverted Index]      [Risk & Stagnation]    │
│  - Git porcelain status         - Domain & Tech Pattern tokens   - Destructive keywords │
│  - .project-rule.md metadata    - rules.json & shortcuts.json   - SHA-256 state delta  │
└───────────────────────────────────────────────┬────────────────────────────────────────┘
                                                │
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          Synthesized Decision Primitives                               │
│  • Choice : Top R_* rules & Skill Shortcuts (e.g. R_API, SEC_API, HND)                │
│  • Noul   : Dead-Loop & Stagnation Detection (Boolean True/False via State Cache)       │
│  • Score  : Confidence Score (0.00-1.00) & Risk Level (Level 1-5)                      │
└───────────────────────────────────────────────┬────────────────────────────────────────┘
                                                │
                        ┌───────────────────────┴───────────────────────┐
                        ▼                                               ▼
         [High Confidence (>= 0.80)]                     [Uncertainty / High Risk]
         [Risk <= 3 & Dead-Loop: CLEAR]                  [Confidence < 0.70 OR Risk >= 4]
                        │                                               │
                        ▼                                               ▼
                FAST_EXECUTE Mode                               PROBE_AND_SPIKE Mode
         - Deterministic tool dispatch                   - Socratic boundary clarification
         - In-line code implementation                   - Reproduction test generation
         - Sub-20ms cognitive handoff                    - Escalate to System 2 Reasoning Core
```

---

## 3. Decision Primitives Specification

The engine strictly implements three atomic decision primitives without autoregressive generation:

### A. Choice Primitive (Categorization & Routing)
- **Input**: Task description, project domain, Git modified file extensions.
- **Mechanism**: Inverted-index keyword matching against the Single Source of Truth (`rules.json`, `shortcuts.json`).
- **Output**: Ranked array of target rules (`R_*`) and skill targets sorted by semantic density score.

### B. Noul Primitive (Propositional Truth & Dead-Loop)
- **Input**: SHA-256 cryptographic digest of `(projectName : normalizedTaskText)`.
- **Mechanism**: Evaluates sliding time-window (10 minutes) against local decision cache.
- **Output**: Boolean `is_dead_loop` flag. When identical tasks recur with zero state delta, it immediately activates `TRIP_CIRCUIT_BREAKER` per [R_DEAD_LOOP](file:///e:/16.%20AgentOption/rules.json#L34).

### C. Score Primitive (Risk Assessment & Epistemic Confidence)
- **Risk Score (1 to 5)**:
  - Level 5: Destructive operations (`drop table`, `rm -rf`, `reset --hard`).
  - Level 4: Security, authorization, JWT, cryptographic, or database migration boundaries.
  - Level 3: Architecture refactoring, concurrency, deadlocks, or breaking interface changes.
  - Level 2: Standard feature creation, endpoint additions, or test authoring.
  - Level 1: Formatting, documentation, comments, or UI styling.
- **Confidence Calibration (0.00 to 1.00)**: Evaluates lexical match coverage, project rule adherence, and active file correlation.

---

## 4. Execution Directives & Tool Integration

1. **Pre-Flight Hook (`context-fetch.js`)**:
   - The pre-fetch runner automatically invokes `decideRoute()` to infer multi-dimensional tags before querying the knowledge repository.
   - Example:
     ```bash
     node E:\Tools\SemanticBrain\tools\context-fetch.js "<task description>"
     ```

2. **Standalone CLI Dispatch (`brain.js route`)**:
   - Engineers and agents can invoke the reflexive gate directly from the command line:
     ```bash
     node brain.js route "<task description>" [--json]
     ```

3. **In-Process Module Binding**:
   - Other Node.js tools can consume the router via direct module import without subprocessing:
     ```javascript
     const { decideRoute } = require('E:/Tools/SemanticBrain/tools/route-decision');
     const { decision } = decideRoute("Refactor customer billing controller");
     ```

---

## 5. Architectural Invariants

- **Zero External Daemon**: Must execute synchronously or asynchronously within the calling Node.js process without requiring background HTTP servers.
- **Zero Token Expenditure**: Routing and preliminary risk scoring must consume 0 LLM tokens.
- **Immutable SSoT**: All routing targets must strictly map to verified entries in `rules.json` and `shortcuts.json`. Speculative or unregistered skill paths are forbidden.

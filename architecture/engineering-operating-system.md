---
name: EngineeringOperatingSystem
desc: Universal 8-core Engineering Operating System (Eng-OS) architecture with 5-tier memory (L0-L4), dynamic risk-proportional compute, role-isolated agent runtime, and transactional regression gates
rules: [R_CORE, R_ENG_OS]
category: Architecture
---
# 🏛️ Universal Engineering Operating System (Eng-OS)

**Vision:** Decouple AI Coding Agents from ephemeral chat prompts. Transform the agent execution environment into a robust, deterministic, and self-evolving **Engineering Operating System (Eng-OS)** where the LLM functions strictly as the **Reasoning CPU**, while the OS provides memory hierarchies, kernel policies, device drivers, and transactional security gates.

---

## 1. The Computer Metaphor

$$\text{LLM} = \text{CPU Core} \quad\Big|\quad \text{Codebase} = \text{Filesystem} \quad\Big|\quad \text{Memory (L0–L4)} = \text{Storage Hierarchy}$$
$$\text{Rules } (R\_*) = \text{Kernel Policy} \quad\Big|\quad \text{Tools} = \text{Device Drivers} \quad\Big|\quad \text{Evidence} = \text{Hardware Interrupt (IRQ)} \quad\Big|\quad \text{Commit Gate} = \text{Security Ring}$$

```
                               ┌─────────────────────────────────────────────────┐
                               │       ENGINEERING OPERATING SYSTEM (Eng-OS)     │
                               │                                                 │
   User / Task ──────► [SYS]   │  1. Knowledge Engine    2. Memory Engine (L0-L4)│
                               │  3. State Engine        4. Graph Engine         │ ◄────► LLM Core (CPU)
 Evidence Loop ◄────── [I/O]   │  5. Agent Runtime       6. Risk Engine          │  (Gemini/Claude/GPT)
(Compiler/Test)                │  7. Evidence Engine     8. Governance Engine    │
                               └─────────────────────────────────────────────────┘
```

---

## 2. The 5 Core Primitives

Every subsystem in Eng-OS operates on **5 universal primitives**:

```
                 ┌──────────────────────────────────────────────┐
                 │                5 PRIMITIVES                  │
                 ├───────────────┬──────────────────────────────┤
                 │ 1. Knowledge  │ Rules, standards & blueprints│
                 │ 2. Memory     │ L0 to L4 storage hierarchy   │
                 │ 3. State      │ Active task & workspace delta│
                 │ 4. Policy     │ Invariants & ACL permissions │
                 │ 5. Evidence   │ Compiler, tests & traces     │
                 └───────────────┴──────────────────────────────┘
```

The Agent is simply the **execution runtime** that consumes and updates these 5 primitives.

---

## 3. The 8 Core Subsystems

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE 8 SUBSYSTEMS OF ENG-OS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [1. KNOWLEDGE ENGINE]             [2. MEMORY ENGINE]                       │
│   • Invariant Rules (rules.json)    • L0: Immediate Context (Scratchpad)    │
│   • Architectural Blueprints        • L1: Project Memory (.project-rule.md) │
│   • Coding Standards (standards/)   • L2: Semantic Memory (Vector/Keyword)  │
│                                     • L3: Episodic Memory (Structured Event)│
│                                     • L4: Archive Storage (Cold logs)       │
│                                                                             │
│  [3. STATE ENGINE]                 [4. GRAPH ENGINE]                        │
│   • Task Goal & Scope Boundaries    • AST Signatures (Virtual Memory)       │
│   • Workspace Delta (git diff)      • Dependency & Call Graph Projection    │
│   • Active Hypotheses & Attempt Log • Type Graph Impact Analysis            │
│                                                                             │
│  [5. AGENT RUNTIME]                [6. RISK ENGINE]                         │
│   • Role-Based Worker Pool          • Complexity & Blast-Radius Calculation │
│   • Capability & Tool Isolation     • Dynamic Compute Budget Allocation     │
│   • Dynamic Single vs Multi-Core    • Human Approval Escalation Gate        │
│                                                                             │
│  [7. EVIDENCE ENGINE]              [8. GOVERNANCE ENGINE]                   │
│   • Baseline Regression Gate        • Policy Enforcement (R_* rules)        │
│   • Targeted Test Runner            • Capability Isolation & Access Control │
│   • Empirical Evidence Voting       • Transactional Workspace & Rollback    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. The 5-Tier Memory Hierarchy (L0 $\rightarrow$ L4)

```
[L0: Immediate Context]   ──► Active task, touched files, compiler errors, active hypothesis (RAM)
        │
[L1: Project Memory]      ──► .project-rule.md, rules.json, project standards, business rules (SRAM)
        │
[L2: Semantic Memory]     ──► Code search, pattern lookups, vector/graph search (DRAM)
        │
[L3: Episodic Memory]     ──► Structured historical events: Task #ID, Symptom, Root Cause, Fix (SSD)
        │
[L4: Archive Storage]     ──► Session transcripts, raw terminal logs, historical artifacts (Cold Storage)
```

| Tier | Storage Target | Retrieval Mechanism | Example |
| :--- | :--- | :--- | :--- |
| **L0 Immediate** | Session Context / Plan | Read active context / `git status -s` | Step 2; Editing `MaterialService.cs`; Test fail L42 |
| **L1 Project** | `.project-rule.md`, `rules.json` | Direct file read / system prompt | `R_DB`: No cross-module queries; use `BaseForm` |
| **L2 Semantic** | AST index / Vector search | `lookup.js` / keyword / graph query | *"How does Inventory handle RefInId?"* |
| **L3 Episodic** | `SemanticBrain` Structured DB | Tagged semantic lookup (`brain.js pre`) | Task #182: Fixed deadlock with composite index |
| **L4 Archive** | `<appDataDir>/brain/<id>/` | Deep transcript / log search | Raw debug output of session 3 weeks ago |

---

## 5. Graph Engine: Codebase Virtual Memory

Instead of stuffing entire 2,000-line source files into the context window, the **Graph Engine** provides on-demand projection:

```
[Virtual Memory Code Projection]
         │
         ├── SIGNATURE    ──► AST Skeleton (Class outline, methods, params, returns)
         ├── DEPENDENCY   ──► Direct callers, callees, and imported interfaces
         ├── IMPLEMENTATION──► Method body ONLY when actively modifying that method
         ├── HISTORY      ──► L3 episodic lessons related to this symbol
         └── TEST         ──► Targeted test files exercising this specific symbol
```

---

## 6. Risk Engine & Dynamic Compute Allocation

$$\text{Risk Score} = \text{Callers} + \text{PublicAPI} + \text{DBImpact} + \text{SharedDTO} + \text{CrossModule} - \text{TestCoverage}$$

```
                          [User Task Received]
                                   │
                                   ▼
                       [Task Risk Calculation]
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ↓                           ↓                           ↓
 [Score: 0 – 19]            [Score: 20 – 49]            [Score: 50 – 79]
  • Low Risk                 • Medium Risk               • High Risk
  • 1 Single Core (Dev)      • 2 Cores (Dev + QA)        • 3 Cores (Dev + QA + Auditor)
  • Build + Targeted Test    • Regression Test Baseline  • Adversarial Review + Impact Scan
                                                               │
                                                               ▼ [Score >= 80: Critical]
                                                         [HUMAN APPROVAL GATE]
```

---

## 7. Role-Based Agent Pool & Capability Isolation

Agents are organized into specialized roles with strict tool and capability boundaries:

```
┌─────────────────┬──────────────────────────┬──────────────────────────┬────────────────────────┐
│ Role            │ Allowed Capabilities     │ Forbidden Actions        │ Primary Objective      │
├─────────────────┼──────────────────────────┼──────────────────────────┼────────────────────────┤
│ IMPLEMENTATION  │ Read, Edit Code, Build   │ Commit, Bypass Gate      │ Deliver minimal diff   │
│ QA / VERIFY     │ Write Tests, Run Tests   │ Modify Business Logic    │ Prove bug & regression │
│ AUDITOR         │ Read, Search, AST Linter │ Modify Source, Commit, DB│ Detect security/rule v.│
│ ARCHITECT       │ Read, Design, Risk Calc  │ Write Implementation     │ Set boundaries & spec  │
└─────────────────┴──────────────────────────┴──────────────────────────┴────────────────────────┘
```

---

## 8. Empirical Evidence Voting (No Hallucination Echo-Chambers)

Eng-OS rejects democratic multi-agent voting (where 3 agents can agree on a wrong assumption). Decisions are determined strictly by **Empirical Evidence**:

```
                       [Candidate Solution]
                                │
          ┌─────────────────────┼─────────────────────┐
          ↓                     ↓                     ↓
   [Compiler Check]     [Regression Tests]     [AST Impact Scan]
   (NewErrors == 0)     (NewFailures == 0)    (Zero Caller Breaks)
          ↓                     ↓                     ↓
          └─────────────────────┼─────────────────────┘
                                ↓
                        [Evidence Engine]
                                ↓
                         Confidence Score
```

---

## 9. Transactional Workspace & Regression Gate

### A. The Transaction Loop
All modifications are treated as a single isolated **ChangeSet Transaction**:

```
[Start Transaction] ──► [Apply Diffs in Sandbox] ──► [Run Evidence Suite]
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            ↓ PASS                              ↓ FAIL
                                    [COMMIT TRANSACTION]                [ABORT & ROLLBACK]
                                    (Merge to workspace)                (Revert all diffs clean)
```

### B. Delta Regression Gates (Legacy-Safe)
For legacy repositories with pre-existing warnings or failures:
$$\Delta \text{Errors} = \text{CurrentErrors} - \text{BaselineErrors} \le 0$$
$$\Delta \text{Warnings} = \text{CurrentWarnings} - \text{BaselineWarnings} \le 0$$
$$\Delta \text{Failures} = \text{CurrentFailures} - \text{BaselineFailures} \le 0$$

> **The Invariant:** A task passes the commit gate if and only if **$\Delta = 0$** (no new bugs, warnings, or broken tests introduced).

---

## 10. End-to-End Task Lifecycle

```
[1. TASK NORMALIZATION]
  └── Ingest prompt -> Normalize to canonical Micro-Payload `[Action] @[Feature] | [Intent]`

[2. RISK & COMPUTE ALLOCATION]
  └── Calculate Risk Score -> Allocate compute budget (Single Core vs Multi-Role Pool)

[3. CONTEXT HYDRATION]
  ├── L1 Project Memory (Rules & constraints)
  ├── L2 Semantic Search (Graph & AST Signatures)
  ├── L3 Episodic Memory (PRE-Fetch past lessons from SemanticBrain)
  └── L0 Immediate Context (Initialize Working Memory & active hypothesis)

[4. TRANSACTIONAL EXECUTION]
  └── Role-isolated workers execute bounded actions within the Workspace Transaction

[5. EVIDENCE VERIFICATION]
  └── Run Targeted Tests -> Verify Delta Regression Gates ($\Delta \text{Errors} = 0$)

[6. GOVERNANCE & COMMIT]
  ├── If PASS -> Commit Transaction to repository
  └── If FAIL -> Abort & Rollback diffs; update Attempt History in L0 Working Memory

[7. EPISODIC HARVEST]
  └── Extract distilled lesson -> POST-Harvest to L3 Episodic Memory (SemanticBrain)
```

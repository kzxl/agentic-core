# 🏛️ agentic-core (AgentOption) — Universal Enterprise Operating System for AI Coding Agents

**agentic-core** (internally designated as **AgentOption**) is an enterprise-grade, language-agnostic engineering operating system and cognitive architecture designed to be plugged into **ANY software project** (Web, Cloud Microservices, Desktop WinForms/WPF, Android Mobile, Real-Time Game Engines, Bare-Metal RTOS). It equips autonomous AI coding agents and engineering teams with high-precision architectural blueprints, standardized coding rules, empirical research faculties, and reusable production skills.

Together with **[agentic-brain](https://github.com/kzxl/agentic-brain)** (the episodic semantic memory engine), it forms an autonomous pair-programming and scientific discovery ecosystem supporting progressive context disclosure, harvest quality guards, and continuous lifecycle learning.

---

## 📊 Framework Vital Metrics

| Metric | Count | Coverage / Status | SSoT Registry |
| :--- | :---: | :---: | :--- |
| **Architectural Blueprints** | **19** | 100% Documented | `architecture/` |
| **Language & Universal Standards** | **40** | 100% Rule-Linked | `standards/` |
| **Actionable Autonomous Skills** | **49** | 100% Frontmatter Validated | `skills/` (8 Clusters) |
| **Automated Agentic Workflows** | **6** | 100% Step-Verified | `workflows/` |
| **Rapid Extension Templates** | **5** | Reusable Baselines | `templates/` |
| **Universal Machine Rules** | **36** | 100% Active Enforced | `rules.json` (`R_*`) |
| **Agent Quick-Routing Shortcuts** | **115** | 100% Zero-Broken Targets | `shortcuts.json` |

---

## 🏛️ The 4 Core Architectural Pillars

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AGENTIC-CORE ARCHITECTURAL PILLARS                                    │
└───────────────────────────────────────────────────┬───────────────────────────────────────────────────┘
                                                    │
        ┌───────────────────────────┬───────────────┴───────────────┬───────────────────────────┐
        ▼                           ▼                               ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│       PILLAR 1:       │   │       PILLAR 2:       │   │       PILLAR 3:       │   │       PILLAR 4:       │
│ COGNITIVE OPERATING   │   │ AUTONOMOUS SCIENTIFIC │   │ ENTERPRISE & CLEAN    │   │ HIGH-PERFORMANCE &    │
│ SYSTEM & GOVERNANCE   │   │  RESEARCH SUBSYSTEM   │   │ DISTRIBUTED ARCH.     │   │ BARE-METAL REAL-TIME  │
├───────────────────────┤   ├───────────────────────┤   ├───────────────────────┤   ├───────────────────────┤
│ • 8-Core Eng-OS       │   │ • Socratic Q-Gen      │   │ • 4-Tier Clean Arch.  │   │ • Tiled Data Pipeline │
│ • L0-L4 Memory Tiers  │   │ • Expected Info Gain  │   │ • Folder-per-Feature  │   │ • Server-Auth Engine  │
│ • Deterministic Router│   │ • 6D Research Budget  │   │ • Universe Plugin v4  │   │ • Zero-Alloc HFSM     │
│ • Tool-Index SSoT     │   │ • Dead-Loop Detector  │   │ • Event-Driven Outbox │   │ • Bare-Metal Hooking  │
│ • Clean-Room IP Guard │   │ • Research Manager    │   │ • Resilience Patterns │   │ • DMA Zero-Copy       │
│ • License Compliance  │   │ • Research Memory SSoT│   │ • Multi-Tenancy RLS   │   │ • SIMD Vector256/512  │
└───────────────────────┘   └───────────────────────┘   └───────────────────────┘   └───────────────────────┘
```

---

## 🔬 Deep Dive: The Autonomous Research Subsystem

The crowning capability of **agentic-core** is its **Autonomous Scientific Research Subsystem**. Instead of blindly executing code or looping through unverified tweaks, the agent behaves as a rigorous empirical scientist:

```text
                               THE AUTONOMOUS RESEARCH PIPELINE
                                              │
    [Human Research Directive: "Build an embedded framework faster and safer than C"]
                                              │
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. AUTONOMOUS QUESTION GENERATOR (Q-Gen)                                              │
│    • Decomposes problem across 6 Socratic axes (Premise, Compiler, Comparative, etc.)  │
│    • Evaluates Question Dependency DAG: Q1 (Bottleneck?) -> Q6 (Static Analysis?)      │
└─────────────────────────────────────────────┬──────────────────────────────────────────┘
                                              │ Top-Ranked Questions
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. EXPECTED INFORMATION GAIN (EIG) PRE-FLIGHT GATE                                     │
│    • Pre-evaluates epistemic value: "Will this experiment teach me anything new?"      │
│    • Classifies: Class 1 (Bifurcator, EIG>=0.5) vs Class 3 (Dead Duplicate, EIG<0.10)  │
│    • Automatically PRUNES redundant experiments before writing code                    │
└─────────────────────────────────────────────┬──────────────────────────────────────────┘
                                              │ Viable Candidate Experiments
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. MULTI-DIMENSIONAL RESEARCH BUDGET GOVERNANCE                                        │
│    • Manages 6D Tensor: Token, Time, Experiment, Search, Hypothesis, Stagnation        │
│    • Search Quota Clamp: Forces code synthesis when discovery budget exhausts          │
│    • Stagnation Budget Exhaustion: 5 zero-gain trials (ΔI < 0.05) -> Mandatory PIVOT   │
└─────────────────────────────────────────────┬──────────────────────────────────────────┘
                                              │ Active Execution
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. DEAD-LOOP & RESEARCH STAGNATION DETECTOR                                            │
│    • Mode 1: Sliding-Window Path Hashing intercepts state cycles (A -> B -> C -> A)    │
│    • Mode 2: Cosine Similarity Matrix (>=0.82) catches "Search Synonym Spin"           │
│    • Trips Stagnation Circuit Breaker on duplicate states or zero marginal entropy     │
└─────────────────────────────────────────────┬──────────────────────────────────────────┘
                                              │ Empirical Outcomes & Benchmarks
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 5. RESEARCH MANAGER TRIAD & 5-WAY DECISION GATE                                        │
│    • Explorer (Generates) | Verifier (Empirical Proof) | Historian (Memory & Graveyard)│
│    • Strict 5-Way Decision Gate: [CONTINUE] | [PIVOT] | [MERGE] | [DISCARD] | [STOP]   │
│    • K <= 2 Anti-Dead-Loop Invariant: 2 non-improving mutations mandate DISCARD        │
└─────────────────────────────────────────────┬──────────────────────────────────────────┘
                                              │ Decisions & Negative Knowledge
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 6. RESEARCH MEMORY & FAILED APPROACH KNOWLEDGE BASE                                    │
│    • Dual-Substrate: Git-tracked `.research-memory.json` + Fast In-Memory AME Engine   │
│    • 8-Entity Cognitive Research Graph (H, E, X, R, F, A, C, D)                        │
│    • Mandatory "Query-Before-Action" Rule: "Cái này thử rồi, đừng làm lại"             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Framework Hierarchy

```text
E:\16. AgentOption/
├── README.md                          # Central Documentation & Framework Index
├── rules.json                         # Universal Machine-Readable Rule Registry (36 Rules: R_*)
├── shortcuts.json                     # Quick Slash Command & Prompt Routing Registry (115 Shortcuts)
├── .project-rule.md                   # Sovereign Self-Hosting Project Rule & Doctor Baseline
│
├── architecture/                      # Layer 1: High-Level Architectural Blueprints (19 Blueprints)
│   ├── engineering-operating-system.md # 8-Core Engineering Operating System (Eng-OS) & L0-L4 Memory
│   ├── clean-layered-architecture.md  # 4-Tier Clean Architecture (Domain, Application, Infra, Presentation)
│   ├── folder-per-feature.md          # Folder-per-Feature Architecture & DTO Localization
│   ├── hybrid-dual-scope-execution.md # Hybrid Desktop & WebAPI Dual-Scope Service Execution
│   ├── universe-plugin.md             # Universe Plugin Architecture v4.0 (Micro-kernel, Data Sovereignty)
│   ├── solid-and-separation-of-concerns.md # Pragmatic SOLID Principles & Layer Boundary Matrix
│   ├── event-driven-architecture.md   # Event-Driven Systems, Outbox Pattern, Saga Orchestration
│   ├── resilience-patterns.md         # Circuit Breaker, Exponential Backoff, Fallback Cache
│   ├── micro-frontends.md             # Micro-Frontend Module Federation & Runtime Assembly
│   ├── multi-tenancy.md               # Multi-Tenant Data Isolation (RLS, Schema-per-tenant, DB-per-tenant)
│   ├── tiled-data-pipeline.md         # High-Throughput Tiled Data Pipeline & Bounded Memory Pools
│   ├── game-engine-architecture.md    # Universal Game Engine & Authoritative Simulation Blueprint
│   ├── agent-skill-router-architecture.md # Deterministic Skill Router, Tool-Index SSoT & Capability Bootstrapping
│   ├── research-manager-orchestration.md # Research Manager Triad (Explorer, Verifier, Historian) & 5-Way Gate
│   ├── research-memory-schema.md      # 8-Entity Cognitive Research Graph & Dual-Substrate Storage
│   ├── dead-loop-and-stagnation-detector.md # Dual-Mode Graph Cycle & Semantic Stagnation Detector
│   ├── multi-dimensional-research-budget.md # Tensor Resource Allocation & Stagnation-Driven Pivots
│   ├── expected-information-gain-engine.md # Bayesian Optimal Experimental Design & Zero-Gain Trial Pruning
│   └── autonomous-question-generator.md # Socratic Problem Decomposition & Question Dependency DAG
│
├── standards/                         # Layer 2: Modular Language & Engineering Standards (40 Standards)
│   ├── universal/                     # Universal Engineering Standards (13 Standards)
│   │   ├── agent-meta.md              # Meta-Rules, Symbol Decoding, Commit Gate
│   │   ├── working-memory-state.md    # Working Memory & Execution State Invariants
│   │   ├── naming-conventions.md      # Multi-Language Naming Rules
│   │   ├── performance-guidelines.md  # Memory, Anti-N+1 & Async Concurrency
│   │   ├── conformance-testing.md     # Module Isolation & Conformance Tests
│   │   ├── test-logic.md              # Test Logic & Algorithmic Verification (Invariants, AAA, BVA)
│   │   ├── git-commit-standards.md    # Git Commit Discipline & Atomic Conventional Commits Standard
│   │   ├── llm-contribution-and-governance.md # LLM Policy, GNU <15-Line IP Compliance & Embedded Safety
│   │   ├── license-governance-and-ip-compliance.md # License Governance, Compatibility Matrix & IP Compliance
│   │   ├── benchmark-and-hardware-provenance.md # Empirical Benchmarking & Host Hardware Provenance
│   │   ├── scientific-research-methodology.md # Empirical Scientific Research, Hypotheses & Falsifiability
│   │   ├── literature-synthesis-and-prior-art.md # Literature Synthesis, Comparative Taxonomy & Gap Analysis
│   │   └── research-memory-standard.md # Research Memory Schema, Query-Before-Action & Negative Knowledge
│   ├── csharp/                        # C# .NET Standards (6 Standards)
│   │   ├── high-performance-compute.md # Span<T>, NativeMemory, SIMD Vector256/512, Zero-Alloc
│   │   ├── godot-game-standards.md    # Godot 4 & C# Standards (Zero-Alloc, Signal Hygiene, Node Lifecycle)
│   │   ├── webapi.md                  # Web API Standards (Clean Architecture, DI, DTO Localization)
│   │   ├── winforms.md                # WinForms Standards (BaseForm, RunAfterShown, No BindingSource)
│   │   ├── wpf-ui.md                  # WPF UI & Fluent Design Tokens (Dark/Light Themes, Compact Density)
│   │   └── wpf.md                     # WPF Desktop MVVM Standards (Pure XAML, Dispatcher Safety)
│   ├── android/                       # Android & Mobile Engineering Standards (5 Standards)
│   │   ├── state-architecture.md      # Unidirectional Data Flow (UDF) & MVI State Architecture
│   │   ├── compose-ui-ux.md           # Jetpack Compose Performance & Recomposition Boundaries
│   │   ├── camera-computational.md    # CameraX / Camera2 Computational Vision Pipeline
│   │   ├── ndk-native-bridge.md       # JNI / NDK Memory Safety & Zero-Copy ByteBuffers
│   │   └── performance-optimization.md # Baseline Profiles, R8 ProGuard & Startup Latency
│   ├── cpp/                           # C++ Standards (1 Standard)
│   │   └── native-interop.md          # C-ABI DLL Export, Zero-Copy Shared Memory, OpenMP
│   ├── nodejs/                        # Node.js Standards (3 Standards)
│   │   ├── architecture.md            # Controller-Service-Repository Layer Separation
│   │   ├── event-loop-streams.md      # Non-blocking Event Loop & Stream Pipelines
│   │   └── security-middleware.md     # Helmet, Rate Limiting & Input Sanitization
│   ├── react/                         # React Standards (3 Standards)
│   │   ├── component-lifecycle.md     # Pure Functional Components & Hook Cleanup
│   │   ├── performance.md             # React.memo, useMemo/useCallback & Code Splitting
│   │   └── state-management.md        # State Colocation & Redux/Zustand Unidirectional Flow
│   ├── golang/                        # Go Standards (3 Standards)
│   │   ├── concurrency.md             # Goroutines, Context Cancellation & Worker Pools
│   │   ├── error-observability.md     # Error Wrapping (%w) & Structured slog Logging
│   │   └── memory-allocation.md       # Escape Analysis, sync.Pool & Zero-Alloc Slices
│   ├── php/                           # PHP 8.2+ Standards (3 Standards)
│   │   ├── database-transactions.md   # PDO Transactions, Row Locking & Concurrency
│   │   ├── memory-generators.md       # Yield Generators for Large Data Streaming
│   │   └── modern-syntax.md           # strict_types=1, Match Expressions & Readonly Classes
│   └── database/                      # Universal SQL Standards (3 Standards)
│       ├── indexing-optimization.md   # Composite Indexing, Covering Indexes & SARGable Queries
│       ├── concurrency-deadlocks.md   # Deadlock Defense, Consistent Lock Ordering & RCSI
│       └── bulk-audit.md              # Chunked Bulk Processing & Mandatory Audit Logging
│
├── skills/                            # Layer 3: Actionable, Reusable Skills & Design Patterns (49 Skills)
│   ├── agentic/                       # Agentic Methodology & Autonomous Superpowers (13 Skills)
│   ├── research/                      # Scientific Research & Experimental Skills (10 Skills)
│   ├── game/                          # Game Development & ARPG Engine Skills (6 Skills)
│   ├── security/                      # Reverse Engineering & Security Analysis (2 Skills)
│   ├── csharp/                        # C# .NET Enterprise Skills (6 Skills)
│   ├── nodejs/                        # Node.js Enterprise Skills & Patterns (8 Skills)
│   ├── react/                         # React Enterprise Skills (3 Skills)
│   └── embedded/                      # Embedded & Bare-Metal RTOS Skills (1 Skill)
│
├── workflows/                         # Layer 4: Automated Agentic & DevOps Workflows (6 Workflows)
│   ├── feature-implementation.md      # End-to-End Feature Development Workflow
│   ├── bugfix-investigation.md        # 5-Step Scientific Bugfix & Regression Workflow
│   ├── code-refactoring.md            # Zero-Regression 1-to-1 Refactoring Workflow
│   ├── dotnet-publish-release.md      # .NET Dual Publish (Full Self-Contained vs Lite)
│   ├── project-bootstrap-doctor.md    # Project Onboarding & Compliance Audit
│   └── continuous-learning-harvest.md # Automated Pre-Fetch & Post-Harvest Memory Loop
│
├── tools/                             # Layer 5: Automated Verification & Agent CLI Tools (4 Tools)
│   ├── validate-framework.js          # Self-Linter validating YAML frontmatter & rule links
│   ├── lookup.js                      # Sub-50ms Fast Query CLI for AI Agents
│   ├── doctor.js                      # Project Health-Check validating against .project-rule.md
│   └── brain.js                       # Portable SemanticBrain Bridge CLI (PRE-Fetch & POST-Harvest)
│
└── templates/                         # Layer 6: Rapid Bootstrapping & Extension Templates (5 Templates)
    ├── project-bootstrap-template.md  # Template to bind ANY project to AgentOption
    ├── standard-template.md           # Template for authoring new Language Standards
    ├── skill-template.md              # Template for authoring new Actionable Skills
    ├── workflow-template.md           # Template for multi-step automated workflows
    └── research-memory-template.json  # Template for .research-memory.json Schema
```

---

## 🏛️ Architectural Blueprints Catalog (19 Blueprints)

| Blueprint | Shortcut | Core Responsibility & Architectural Invariant |
| :--- | :---: | :--- |
| **[`engineering-operating-system.md`](architecture/engineering-operating-system.md)** | `ENGOS` | 8-core cognitive OS (Knowledge, Memory L0-L4, State, Graph, Runtime, Risk, Evidence, Governance) enforcing evidence-first execution. |
| **[`clean-layered-architecture.md`](architecture/clean-layered-architecture.md)** | `CLEAN` | 4-tier separation: Domain (Entities, Invariants) $\to$ Application (Use Cases, DTOs) $\to$ Infrastructure $\to$ Presentation. |
| **[`folder-per-feature.md`](architecture/folder-per-feature.md)** | `FEAT` | Vertical slice architecture with feature-local DTOs, controllers, and services eliminating cross-module leakage. |
| **[`hybrid-dual-scope-execution.md`](architecture/hybrid-dual-scope-execution.md)** | `HYBRID` | Bridges Desktop WinForms apps and stateless WebAPI microservices over shared transactional business engines. |
| **[`universe-plugin.md`](architecture/universe-plugin.md)** | `UNIVERSE` | Plugin micro-kernel v4.0 with data sovereignty, isolated auto-registry, and indirect event communication. |
| **[`solid-and-separation-of-concerns.md`](architecture/solid-and-separation-of-concerns.md)** | `SOLID` | Pragmatic SOLID compliance matrix, explicit layer boundary guards, and 1-to-1 partial service partitioning. |
| **[`event-driven-architecture.md`](architecture/event-driven-architecture.md)** | `EVT` | Asynchronous domain events, Transactional Outbox pattern for dual-write safety, and idempotent consumers. |
| **[`resilience-patterns.md`](architecture/resilience-patterns.md)** | `RES` | Circuit Breaker, Exponential Backoff with Jitter, and Stale-While-Revalidate Fallback Caching. |
| **[`micro-frontends.md`](architecture/micro-frontends.md)** | `MFE` | Module Federation, isolated sub-app mounting, decentralized routing, and contract-driven shared state. |
| **[`multi-tenancy.md`](architecture/multi-tenancy.md)** | `TENANT` | Multi-tenant data segregation models: Row-Level Security (RLS), Schema-per-tenant, and DB-per-tenant. |
| **[`tiled-data-pipeline.md`](architecture/tiled-data-pipeline.md)** | `TILED` | High-throughput tiled pipeline using ring buffers, bounded channels, and tile partitioning for big data. |
| **[`game-engine-architecture.md`](architecture/game-engine-architecture.md)** | `GAME_ARC` | Server-authoritative simulation, fixed-timestep physics loop decoupled from rendering, and zero-allocation entity pools. |
| **[`agent-skill-router-architecture.md`](architecture/agent-skill-router-architecture.md)** | `ROUTE_ARC` | Deterministic router-first dispatch, Machine-Local Tool-Index SSoT, and capability auto-bootstrapping. |
| **[`research-manager-orchestration.md`](architecture/research-manager-orchestration.md)** | `RES_ARC` | Triad separation (Explorer, Verifier, Historian), 5-way decision gate, and $K \le 2$ anti-dead-loop rollback. |
| **[`research-memory-schema.md`](architecture/research-memory-schema.md)** | `RES_SCHEMA` | 8-entity cognitive research knowledge graph (H, E, X, R, F, A, C, D) and Dual-Substrate persistence. |
| **[`dead-loop-and-stagnation-detector.md`](architecture/dead-loop-and-stagnation-detector.md)** | `LOOP_ARC` | Dual-mode dead-loop detector with sliding-window path hashing and semantic similarity cosine matrix ($\ge 0.82$). |
| **[`multi-dimensional-research-budget.md`](architecture/multi-dimensional-research-budget.md)** | `BUDGET_ARC` | 6D tensor resource allocation (Token, Time, Exp, Search, Hyp, Stagnation) and forced PIVOT on zero gain. |
| **[`expected-information-gain-engine.md`](architecture/expected-information-gain-engine.md)** | `EIG_ARC` | Bayesian Optimal Experimental Design, epistemic entropy reduction, and pre-flight zero-gain trial pruning. |
| **[`autonomous-question-generator.md`](architecture/autonomous-question-generator.md)** | `QGEN_ARC` | Socratic problem decomposition across 6 axes, question dependency DAGs, and topological priority ranking. |

---

## 🧩 Comprehensive Skill Clusters & Capabilities Catalog (49 Skills)

### 1. 🤖 Agentic & Cognitive Superpowers (`skills/agentic/` — 13 Skills)
- **`action-first-cognitive-ux`**: Action-first communication protocol reducing human cognitive load (ADHD-aware, zero pleasantry preamble, micro-actions $< 2$ min, visual progress proofs).
- **`agent-skill-router-protocol`**: Deterministic router-first skill dispatch, Machine-Local Tool-Index Single Source of Truth (SSoT), and self-supervision.
- **`blast-radius-analysis`**: Pre-edit grep scanner for shared classes, database columns, and API contracts to prevent cascading regressions.
- **`clean-room-ip-and-governance`**: Clean-Room IP protocol, GNU <15-line compliance, MMIO hardware safety, and LLM contribution transparency.
- **`input-normalization-pipeline`**: Multi-stage noise filtering that converts raw free-form prompts into structured micro-payloads.
- **`lazy-minimalism-protocol`**: 7-rung Ponytail Decision Ladder enforcing YAGNI, standard library first, zero unrequested abstractions, and shortest working diffs.
- **`self-consistency-consensus`**: 3-pass reasoning protocol with early stopping on convergence and deep-dive verification on divergence.
- **`brainstorming-and-spec`**: Socratic discovery, user intent alignment, and unambiguous technical specification authoring before coding.
- **`test-driven-development`**: Strict Red-Green-Refactor development protocol ensuring 100% executable verification.
- **`adversarial-code-review`**: Multi-dimensional self-audit covering boundary conditions, security vulnerabilities, and backward compatibility.
- **`systematic-debugging`**: 5-step scientific hypothesis debugging process that isolates root causes without guesswork.
- **`execution-state-tracking`**: L0–L4 working memory state machine and live task progress tracking.
- **`continuous-learning-protocol`**: Automated PRE-fetch context retrieval and POST-harvest episodic learning loop bridged to SemanticBrain.

### 2. 🔬 Scientific Research & Experimental Methodology (`skills/research/` — 10 Skills)
- **`research-manager-protocol`**: Executive meta-cognitive governor, Triad orchestration (Explorer, Verifier, Historian), 5-way decision gate (Continue, Pivot, Merge, Discard, Stop), and dead hypothesis graveyard.
- **`hypothesis-driven-experimentation`**: Formal hypothesis cycles ($H_0$ vs $H_1$), pre-declared falsification gates, counter-factual scenario stress-testing, and working memory hypothesis logs.
- **`ablation-study-protocol`**: Drop-one-out and add-one-in ablation study harnesses, component contribution scoring ($C_i$), and architectural complexity pruning.
- **`statistical-benchmark-analysis`**: Robust non-parametric benchmarking, warm-up run exclusion, IQR outlier filtering, p90/p99 tail latency analysis, and Mann-Whitney U / Welch significance tests.
- **`prior-art-gap-analysis`**: Multi-dimensional competitive matrix, Pareto frontier trade-off evaluation, and explicit architectural niche definition.
- **`failed-approach-negative-memory`**: Anti-repetition pattern matching, cause-of-death deep causal extraction, prompt-injected negative constraints, and graveyard registry ("Cái này thử rồi, đừng làm lại").
- **`dead-loop-stagnation-detection`**: Structural graph cycle interception ($A \to B \to C \to A$), semantic similarity matrices, epistemic entropy tracking, and research stagnation circuit breakers.
- **`multi-dimensional-budget-governance`**: Multi-vector budget ledger, token/time burn telemetry, search quota clamps, and 5-experiment zero-gain stagnation forced pivots.
- **`expected-information-gain-protocol`**: Pre-flight epistemic gate ("Thử nghiệm này giúp tôi biết thêm điều gì mới?"), candidate ranking by eROI, and zero-gain experiment pruning.
- **`autonomous-question-generation`**: 6-axis Socratic problem decomposition, question dependency DAGs, epistemic priority sorting, and question-to-hypothesis transformation.

### 3. 🎮 Game Development & ARPG Engine (`skills/game/` — 6 Skills)
- **`server-authoritative-bridge`**: Unified host-client networking abstraction decoupling game logic from local/remote transport.
- **`hierarchical-finite-state-machine`**: Zero-allocation hierarchical FSM for entity combat behaviors, animations, and input buffering.
- **`spatial-object-pooling`**: High-throughput node object pooling preventing GC spikes during intense combat particle and projectile bursts.
- **`arpg-stat-formula-pipeline`**: Multi-stage stat calculation pipeline (Base $\to$ Added Flat $\to$ Increased % $\to$ More % $\to$ Caps & Clamp).
- **`game-input-action-buffer`**: Buffered input timing windows and responsive 8-direction radial action selection.
- **`procedural-loot-and-economy`**: Tiered loot drop tables, item affixes rolling, and balanced gold sink sinks.

### 4. 🛡️ Reverse Engineering & Defensive Security (`skills/security/` — 2 Skills)
- **`reverse-engineering-playbook`**: Multi-target reverse engineering workflows across Android APK/AAR, native PE/ELF/Mach-O binaries, .NET assemblies, and obfuscated Web JS.
- **`security-scope-and-evidence-contract`**: Operations gate enforcing cryptographic chain-of-custody evidence and verified legal authorization scopes.

### 5. ⚡ C# .NET Enterprise Patterns (`skills/csharp/` — 6 Skills)
- **`baseform-lifecycle-orchestration`**: Clean UI initialization lifecycle via `RunAfterShown` and strict unidirectional data binding (`PopulateControls` / `CollectData`).
- **`hybrid-dbscope-pattern`**: Dual-scope database connection and transaction management bridging Desktop apps and WebAPI services.
- **`feature-partial-partitioning`**: Clean 1-to-1 partial class segregation (`*.Action.cs`, `*.Query.cs`, `*.Lookup.cs`) eliminating God services.
- **`cancellation-token-propagation`**: Cooperative, responsive task cancellation flow across async boundaries.
- **`dapper-bulk-data-access`**: High-throughput multi-entity bulk queries and fast mapping without ORM bloat.
- **`zero-copy-interop`**: High-performance unsafe pointers and native C/C++ memory sharing via `Span<T>` and `Memory<T>`.

### 6. 🟢 Node.js Enterprise Microservices (`skills/nodejs/` — 8 Skills)
- **`handler-dispatcher-pattern`**: Clean `canHandle` / `handle` polymorphic request dispatching.
- **`interceptor-pipeline`**: Flexible request/response transformation and audit pipelines.
- **`error-boundary-handler`**: Centralized, predicate-based error management and safe failure handling.
- **`persistence-adapter-pattern`**: Pluggable storage abstraction isolating business models from databases.
- **`scoped-attributes-manager`**: Multi-tier state scoping (Request, Session, Persistent).
- **`fluent-response-builder`**: Immutable, fluent builder for robust API payload construction.
- **`service-client-factory`**: Authenticated API delegation and client pooling factory.
- **`skill-builder-pattern`**: Composable application bootstrap builder for complex microservices.

### 7. ⚛️ Modern React Frontend Engineering (`skills/react/` — 3 Skills)
- **`abortable-fetch-lifecycle`**: Automatic request cleanup using `AbortController` preventing race conditions and unmounted state updates.
- **`compound-components-pattern`**: Context-driven component composition providing expressive and flexible JSX APIs.
- **`optimistic-ui-updates`**: Instantaneous UI state mutation with automatic rollback on network failure.

### 8. 🔌 Embedded Systems & Bare-Metal RTOS (`skills/embedded/` — 1 Skill)
- **`bare-metal-rtos-hooking`**: Non-disruptive RTOS trampoline hooking, EDMAC DMA zero-copy transfers, relocatable `.mo` module loading, and cache-coherent frame buffer processing.

---

## 📜 Universal & Language Standards Catalog (40 Standards)

| Domain | Count | Key Standards & Technical Guidelines |
| :--- | :---: | :--- |
| **Universal Engineering** | **13** | `agent-meta.md`, `working-memory-state.md`, `naming-conventions.md`, `performance-guidelines.md`, `conformance-testing.md`, `test-logic.md`, `git-commit-standards.md`, `llm-contribution-and-governance.md`, `license-governance-and-ip-compliance.md`, `benchmark-and-hardware-provenance.md`, `scientific-research-methodology.md`, `literature-synthesis-and-prior-art.md`, `research-memory-standard.md`. |
| **C# .NET & Godot** | **6** | `high-performance-compute.md` (SIMD/Span), `godot-game-standards.md` (C# 4.x), `webapi.md` (Clean DI), `winforms.md` (No BindingSource), `wpf-ui.md` (Fluent Tokens), `wpf.md` (Pure XAML). |
| **Android & Mobile** | **5** | `state-architecture.md` (UDF/MVI), `compose-ui-ux.md` (Recomposition), `camera-computational.md` (Camera2/X), `ndk-native-bridge.md` (Zero-Copy JNI), `performance-optimization.md` (R8/Baseline). |
| **C++ Modern** | **1** | `native-interop.md` (C-ABI DLL Export, Zero-Copy Shared Memory, OpenMP). |
| **Node.js** | **3** | `architecture.md` (Layer Separation), `event-loop-streams.md` (Backpressure), `security-middleware.md` (Sanitization). |
| **React** | **3** | `component-lifecycle.md` (Hook Cleanup), `performance.md` (useMemo/memo), `state-management.md` (Colocation/Zustand). |
| **Go (Golang)** | **3** | `concurrency.md` (Worker Pools/errgroup), `error-observability.md` (%w/slog), `memory-allocation.md` (sync.Pool/Zero-Alloc). |
| **PHP 8.2+** | **3** | `database-transactions.md` (Row Locking), `memory-generators.md` (Streaming Yield), `modern-syntax.md` (strict_types=1). |
| **Universal SQL** | **3** | `indexing-optimization.md` (Covering/SARGable), `concurrency-deadlocks.md` (RCSI), `bulk-audit.md` (Chunked Audit). |

---

## ⚡ How to Integrate into ANY Project (Portable Resolution)

To bind any codebase (new or existing) to the **AgentOption** engineering operating system, place a `.project-rule.md` file in the project's root directory:

```yaml
---
project_name: <project_id>
domain: <domain_name>
primary_language: <nodejs | react | csharp | go | php | cpp | android>
architecture: <clean_architecture | universe_plugin | winforms_erp | game_engine | research_lab>
framework_references:
  agent_option_root: "[AgentOption]"      # Resolved automatically by AI Agents
  rules: ["R_CORE", "R_ENG_OS", "R_ROUTE", "R_GIT", "R_ACT", "R_RESEARCH", "R_BUDGET"]
  shortcuts: ["ENGOS", "ROUTE", "GIT", "ACT", "RES_STD", "RES_MEM", "QGEN_RES"]
---
```

### Path Resolution Priority:
1. `AGENT_OPTION_PATH` (System Environment Variable).
2. Sibling directory: `../16. AgentOption` or `./16. AgentOption`.
3. Explicit path configured in `agent_option_root`.
4. Default local fallback: `E:\16. AgentOption`.

---

## 🛠️ Developer & AI Agent Toolchain CLI

```bash
# 1. Fast Lookup across all 115 shortcuts and 114 documents:
node [AgentOption]/tools/lookup.js "circuit breaker"
node [AgentOption]/tools/lookup.js "cancellation" --lang=csharp
node [AgentOption]/tools/lookup.js "stagnation"
node [AgentOption]/tools/lookup.js QGEN_RES

# 2. Check health and compliance of a target repository:
node [AgentOption]/tools/doctor.js <path-to-target-repo>

# 3. Validate integrity and frontmatter of AgentOption framework itself:
node [AgentOption]/tools/validate-framework.js

# 4. Continuous Learning & Semantic Memory Loop (Bridged to agentic-brain):
node [AgentOption]/tools/brain.js pre "task description"        # Progressive L0 index retrieval
node [AgentOption]/tools/brain.js view 42                       # L1 deep inspection
node [AgentOption]/tools/brain.js post "problem | cause | fix"  # Quality-guarded harvest
node [AgentOption]/tools/brain.js curate --dry-run              # Memory lifecycle audit
```

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).

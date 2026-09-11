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

## 📁 Framework Structure & Layering

The framework is organized into 7 clean architectural tiers:

| Layer | Directory | Items | Core Purpose | Deep Dive |
| :--- | :--- | :---: | :--- | :--- |
| **Layer 1: Blueprints** | [`architecture/`](architecture/) | 19 | High-level cognitive OS, research engines & distributed systems | [Catalog](#-architectural-blueprints-catalog-19-blueprints) |
| **Layer 2: Standards** | [`standards/`](standards/) | 40 | Universal rules & multi-language coding standards (9 stacks) | [Catalog](#-universal--language-standards-catalog-40-standards) |
| **Layer 3: Skills** | [`skills/`](skills/) | 49 | Actionable implementation patterns & empirical research skills (8 clusters) | [Catalog](#-comprehensive-skill-clusters--capabilities-catalog-49-skills) |
| **Layer 4: Workflows** | [`workflows/`](workflows/) | 6 | End-to-end automated agentic & DevOps lifecycle workflows | [`workflows/`](workflows/) |
| **Layer 5: Tools** | [`tools/`](tools/) | 4 | Framework linter, CLI lookup, repository doctor, brain bridge | [Toolchain](#-developer--ai-agent-toolchain-cli) |
| **Layer 6: Templates** | [`templates/`](templates/) | 5 | Rapid bootstrapping templates for projects, standards & skills | [`templates/`](templates/) |
| **Layer 7: Docs** | [`docs/`](docs/) | — | Exhaustive system maps, hierarchies & architectural specifications | [Hierarchy](docs/framework-hierarchy.md) |

> [!TIP]
> 📖 **Complete File-by-File Tree**: For the exhaustive, fully-annotated directory tree of all 114+ components, see **[`docs/framework-hierarchy.md`](docs/framework-hierarchy.md)**.

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

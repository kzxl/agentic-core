# 🏛️ agentic-core (AgentOption) — Enterprise Cognitive Operating System for AI Coding Agents

**agentic-core** (internally designated as **AgentOption**) is an enterprise-grade, language-agnostic cognitive operating system and empirical engineering architecture designed to be plugged into **ANY software project** (Web, Cloud Microservices, Desktop WinForms/WPF, Android Mobile, Real-Time Game Engines, Bare-Metal RTOS). It equips autonomous AI coding agents and engineering teams with high-precision architectural blueprints, standardized coding rules, closed-loop empirical reasoning, and reusable production skills.

Together with **[agentic-brain](https://github.com/kzxl/agentic-brain)** (the episodic semantic memory engine), it forms an autonomous pair-programming and scientific discovery ecosystem supporting progressive context disclosure, harvest quality guards, and continuous lifecycle learning.

---

## 📊 Framework Vital Metrics

| Metric | Count | Coverage / Status | SSoT Registry |
| :--- | :---: | :---: | :--- |
| **Agent Personas & Specialist Roles** | **13** | 100% Validated (3 Divisions) | `agents/` |
| **Architectural Blueprints** | **24** | 100% Documented | `architecture/` |
| **Language & Enterprise Standards** | **65** | 100% Rule-Linked | `standards/` (13 Stacks/Domains) |
| **Actionable Autonomous Skills** | **85** | 100% Frontmatter Validated | `skills/` (13 Clusters + 13 Sovereign Packages) |
| **Sovereign Workflow Packages** | **12** | 100% Step-Verified | `skills/*/SKILL.md` (`WF_*`) |
| **Rapid Extension Templates** | **7** | Reusable Baselines | `templates/` |
| **Universal Machine Rules** | **56** | 100% Active Enforced | `rules.json` (`R_*`) |
| **Agent Quick-Routing Shortcuts** | **192** | 100% Zero-Broken Targets | `shortcuts.json` |

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
│ • 5-Phase Cog. Loop   │   │ • Expected Info Gain  │   │ • Folder-per-Feature  │   │ • Server-Auth Engine  │
│ • Pre-Mortem Sandbox  │   │ • 6D Research Budget  │   │ • Universe Plugin v4  │   │ • Zero-Alloc HFSM     │
│ • Epistemic Gate      │   │ • Dead-Loop Detector  │   │ • Event-Driven Outbox │   │ • Bare-Metal Hooking  │
│ • Zero-Trust Proof    │   │ • Research Manager    │   │ • Resilience Patterns │   │ • DMA Zero-Copy       │
│ • Multi-Objective NEV │   │ • Research Memory SSoT│   │ • Multi-Tenancy RLS   │   │ • SIMD Vector256/512  │
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
│    • Mandatory "Query-Before-Action" Rule: "Never repeat a verified failed approach"   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 SOTA Agent Architectural Research & Execution Blueprint

AgentOption incorporates comprehensive comparative research and production blueprints synthesized from the industry's leading open-source agent designs:
- 📖 **[`docs/AGENT_DESIGN_REPOS_STUDY.md`](docs/AGENT_DESIGN_REPOS_STUDY.md)** (`DOC_AGENT_STUDY`): In-depth architectural trade-off analysis evaluating 7 frameworks across 3 core paradigms:
  1. *Orchestration, Cyclic State Graphs & Actor Models*: LangGraph (Pregel BSP, atomic checkpointing), Microsoft AutoGen v0.4 (Asynchronous Actor Model, pub/sub bus), Anthropic Workflows (Routing, Orchestrator-Workers, Evaluator-Optimizer).
  2. *Coding Agent Harnesses & Interfaces*: Aider (Tree-sitter AST repository mapping, Architect/Editor dual-model), OpenHands (Event-stream architecture, sandboxed runtimes), SWE-agent (Agent-Computer Interface / ACI design, low-noise command sets).
  3. *Tiered Cognitive Memory & Context Governance*: Letta/MemGPT (OS hierarchical memory, self-editing context), Mem0 (Dynamic entity/episodic graphs), Negative Knowledge Graveyards (Dead-loop circuit breakers, epistemic stagnation detection).
- 🏛️ **[`architecture/agent-cognitive-and-execution-patterns.md`](architecture/agent-cognitive-and-execution-patterns.md)** (`ARCH_COG_EXEC`): Production-grade engineering specification synthesizing these paradigms into AgentOption's 4 core execution components:
  - *Component A*: Formal Cyclic State Graph (FSM) with atomic checkpoint protocol and transactional git rollback.
  - *Component B*: AST-based progressive context disclosure and hierarchical repo mapping.
  - *Component C*: Standardized low-noise Agent-Computer Interface (ACI) shell and file manipulation wrappers.
  - *Component D*: Tiered cognitive memory harmonizing L0–L4 working scratchpads, git episodic traces, and vector knowledge.
  - *Mermaid Diagrams*: Complete state machine transitions, event-stream execution pipelines, and tiered memory hierarchy.

---

## 📁 Framework Structure & Layering

The framework is organized into 7 clean architectural tiers:

| Layer | Directory | Items | Core Purpose | Deep Dive |
| :--- | :--- | :---: | :--- | :--- |
| **Layer 0: Agents** | [`agents/`](agents/) | 13 | Specialized AI personas bound to mandatory standards, rules, and toolchains | [Hierarchy](docs/framework-hierarchy.md) |
| **Layer 1: Blueprints** | [`architecture/`](architecture/) | 24 | High-level cognitive OS, multi-agent teamwork, research engines & distributed systems | [Catalog](#-architectural-blueprints-catalog-24-blueprints) |
| **Layer 2: Standards** | [`standards/`](standards/) | 65 | Universal rules, 13-stack coding & enterprise ERP standards | [Catalog](#-universal--language-standards-catalog-65-standards) |
| **Layer 3: Skills & Workflows** | [`skills/`](skills/) | 96 | Actionable implementation patterns & sovereign packages (72 cluster skills + 13 `SKILL.md` + 11 package references) | [Catalog](#-comprehensive-skill-clusters--capabilities-catalog-85-skills-across-15-clusters) |
| **Layer 4: Tools** | [`tools/`](tools/) | 9 + 1 Lib | Linter, anti-slop linter, CLI lookup, doctor, brain bridge, bin-triage, CVSS, scope guard, agent exporter & shared core | [Toolchain](#-developer--ai-agent-toolchain-cli) |
| **Layer 5: Templates** | [`templates/`](templates/) | 7 | Rapid bootstrapping templates for agents, projects, standards, skills & scope | [`templates/`](templates/) |
| **Layer 6: Docs** | [`docs/`](docs/) | 20 | System maps, comparative research, anti-slop rationale, ADRs & governance (change bar, out-of-scope records) | [Hierarchy](docs/framework-hierarchy.md), [ADRs](docs/adr/README.md) & [Governance](docs/governance/README.md) |

> [!TIP]
> 📖 **Complete File-by-File Tree**: For the exhaustive, fully-annotated directory tree of all 185+ core components, see **[`docs/framework-hierarchy.md`](docs/framework-hierarchy.md)**.

---

## 🏛️ Architectural Blueprints Catalog (24 Blueprints)

| Blueprint | Shortcut | Core Responsibility & Architectural Invariant |
| :--- | :---: | :--- |
| **[`engineering-operating-system.md`](architecture/engineering-operating-system.md)** | `ENGOS` | 8-core cognitive OS (Knowledge, Memory L0-L4, State, Graph, Runtime, Risk, Evidence, Governance) governing the LLM as a Reasoning Core. |
| **[`empirical-cognitive-loop.md`](architecture/empirical-cognitive-loop.md)** | `COG_LOOP` | 5-phase closed cognitive loop, active sensing, pre-mortem simulation, epistemic uncertainty gate, and memory consolidation. |
| **[`multi-agent-teamwork-protocol.md`](architecture/multi-agent-teamwork-protocol.md)** | `TEAM_ARC` | Zero-collision file ownership matrix, Goldfish pre-coding spec gate, design drift invariant, and 4-stage adversarial verification gates. |
| **[`clean-layered-architecture.md`](architecture/clean-layered-architecture.md)** | `CLEAN` | 4-tier separation: Domain (Entities, Invariants) $\to$ Application (Use Cases, DTOs) $\to$ Infrastructure $\to$ Presentation. |
| **[`folder-per-feature.md`](architecture/folder-per-feature.md)** | `FEAT` | Vertical slice architecture with feature-local DTOs, controllers, and services eliminating cross-module leakage. |
| **[`hybrid-dual-scope-execution.md`](architecture/hybrid-dual-scope-execution.md)** | `DUAL` | Bridges Desktop WinForms apps and stateless WebAPI microservices over shared transactional business engines. |
| **[`universe-plugin.md`](architecture/universe-plugin.md)** | `UNIV` | Plugin micro-kernel v4.0 with data sovereignty, isolated auto-registry, and indirect event communication. |
| **[`solid-and-separation-of-concerns.md`](architecture/solid-and-separation-of-concerns.md)** | `SOLID` | Pragmatic SOLID compliance matrix, explicit layer boundary guards, and 1-to-1 partial service partitioning. |
| **[`event-driven-architecture.md`](architecture/event-driven-architecture.md)** | `EVT` | Asynchronous domain events, Transactional Outbox pattern for dual-write safety, and idempotent consumers. |
| **[`resilience-patterns.md`](architecture/resilience-patterns.md)** | `RES` | Circuit Breaker, Exponential Backoff with Jitter, and Stale-While-Revalidate Fallback Caching. |
| **[`micro-frontends.md`](architecture/micro-frontends.md)** | `MFE` | Module Federation, isolated sub-app mounting, decentralized routing, and contract-driven shared state. |
| **[`multi-tenancy.md`](architecture/multi-tenancy.md)** | `MT` | Multi-tenant data segregation models: Row-Level Security (RLS), Schema-per-tenant, and DB-per-tenant. |
| **[`tiled-data-pipeline.md`](architecture/tiled-data-pipeline.md)** | `PIPE` | High-throughput tiled pipeline using ring buffers, bounded channels, and tile partitioning for big data. |
| **[`game-engine-architecture.md`](architecture/game-engine-architecture.md)** | `GAME` | Server-authoritative simulation, fixed-timestep physics loop decoupled from rendering, and zero-allocation entity pools. |
| **[`real-time-embedded-architecture.md`](architecture/real-time-embedded-architecture.md)** | `EMBED_ARCH` | Real-time RTOS firmware invariants, linker auto-init, multi-tier memory governance, and priority hooking. |
| **[`agent-skill-router-architecture.md`](architecture/agent-skill-router-architecture.md)** | `ROUTEARC` | Deterministic router-first dispatch, Machine-Local Tool-Index SSoT, and capability auto-bootstrapping. |
| **[`research-manager-orchestration.md`](architecture/research-manager-orchestration.md)** | `RES_ARC` | Triad separation (Explorer, Verifier, Historian), 5-way decision gate, and $K \le 2$ anti-dead-loop rollback. |
| **[`research-memory-schema.md`](architecture/research-memory-schema.md)** | `RES_SCHEMA` | 8-entity cognitive research knowledge graph (H, E, X, R, F, A, C, D) and Dual-Substrate persistence. |
| **[`dead-loop-and-stagnation-detector.md`](architecture/dead-loop-and-stagnation-detector.md)** | `LOOP_ARC` | Dual-mode dead-loop detector with sliding-window path hashing and semantic similarity cosine matrix ($\ge 0.82$). |
| **[`multi-dimensional-research-budget.md`](architecture/multi-dimensional-research-budget.md)** | `BUDGET_ARC` | 6D tensor resource allocation (Token, Time, Exp, Search, Hyp, Stagnation) and forced PIVOT on zero gain. |
| **[`expected-information-gain-engine.md`](architecture/expected-information-gain-engine.md)** | `EIG_ARC` | Bayesian Optimal Experimental Design, epistemic entropy reduction, and pre-flight zero-gain trial pruning. |
| **[`autonomous-question-generator.md`](architecture/autonomous-question-generator.md)** | `QGEN_ARC` | Socratic problem decomposition across 6 axes, question dependency DAGs, and topological priority ranking. |
| **[`agent-cognitive-and-execution-patterns.md`](architecture/agent-cognitive-and-execution-patterns.md)** | `ARCH_COG_EXEC` | Production-grade cyclic state graphs, checkpoint rollback protocol, AST progressive repo mapping, standardized ACI, and tiered memory architecture. |
| **[`in-process-decision-router.md`](architecture/in-process-decision-router.md)** | `SYS1` | In-process System 1 decision router, ultra-low-latency reflexive decision primitives, zero-daemon skill dispatch, and pre-execution risk gate. |

---

## 🧩 Comprehensive Skill Clusters & Capabilities Catalog (85 Skills across 15 Clusters)

### 1. 🤖 Agentic & Cognitive Superpowers (`skills/agentic/` — 13 Skills)
- **`action-first-cognitive-ux`**: Action-first communication protocol reducing human cognitive load (ADHD-aware, zero pleasantry preamble, micro-actions $< 2$ min, visual progress proofs).
- **`agent-skill-router-protocol`**: Deterministic router-first skill dispatch, Machine-Local Tool-Index Single Source of Truth (SSoT), and self-supervision.
- **`blast-radius-analysis`**: Pre-edit grep scanner for shared classes, database columns, and API contracts to prevent cascading regressions.
- **`clean-room-ip-and-governance`**: Clean-Room IP protocol, GNU <15-line compliance, MMIO hardware safety, and LLM contribution transparency.
- **`input-normalization-pipeline`**: Multi-stage noise filtering that converts raw free-form prompts into structured micro-payloads.
- **`lazy-minimalism-protocol`**: 7-rung Ponytail Decision Ladder enforcing YAGNI, standard library first, zero unrequested abstractions, and shortest working diffs.
- **`self-consistency-consensus`**: 3-pass reasoning protocol with early stopping on convergence and deep-dive verification on divergence.
- **`brainstorming-and-spec`**: Grilling protocol (design tree, frontier rounds, facts vs decisions), executable Given-When-Then specification, and Zero-Context Goldfish Spec Review Gate before coding.
- **`test-driven-development`**: Red-green loop at pre-agreed seams, vertical tracer-bullet slices, tautology-free assertions, and boundary-only mocking.
- **`adversarial-code-review`**: Two-axis review (Standards with Fowler smell baseline, Spec fidelity) in parallel subagents, plus anti-slop lint for UI diffs.
- **`systematic-debugging`**: Feedback-loop construction reference (10 loop techniques, tightening, raising reproduction rate) for `bugfix-investigation`.
- **`execution-state-tracking`**: L0–L4 working memory state machine and live task progress tracking.
- **`continuous-learning-protocol`**: Automated PRE-fetch context retrieval and POST-harvest episodic learning loop bridged to SemanticBrain.

### 2. 🔬 Scientific Research & Experimental Methodology (`skills/research/` — 10 Skills)
- **`research-manager-protocol`**: Executive meta-cognitive governor, Triad orchestration (Explorer, Verifier, Historian), 5-way decision gate (Continue, Pivot, Merge, Discard, Stop), and dead hypothesis graveyard.
- **`hypothesis-driven-experimentation`**: Formal hypothesis cycles ($H_0$ vs $H_1$), pre-declared falsification gates, counter-factual scenario stress-testing, and working memory hypothesis logs.
- **`ablation-study-protocol`**: Drop-one-out and add-one-in ablation study harnesses, component contribution scoring ($C_i$), and architectural complexity pruning.
- **`statistical-benchmark-analysis`**: Robust non-parametric benchmarking, warm-up run exclusion, IQR outlier filtering, p90/p99 tail latency analysis, and Mann-Whitney U / Welch significance tests.
- **`prior-art-gap-analysis`**: Multi-dimensional competitive matrix, Pareto frontier trade-off evaluation, and explicit architectural niche definition.
- **`failed-approach-negative-memory`**: Anti-repetition pattern matching, cause-of-death deep causal extraction, prompt-injected negative constraints, and graveyard registry ("Never repeat a verified failed approach").
- **`dead-loop-stagnation-detection`**: Structural graph cycle interception ($A \to B \to C \to A$), semantic similarity matrices, epistemic entropy tracking, and research stagnation circuit breakers.
- **`multi-dimensional-budget-governance`**: Multi-vector budget ledger, token/time burn telemetry, search quota clamps, and 5-experiment zero-gain stagnation forced pivots.
- **`expected-information-gain-protocol`**: Pre-flight epistemic gate ("Will this experiment yield fundamentally new information?"), candidate ranking by eROI, and zero-gain experiment pruning.
- **`autonomous-question-generation`**: 6-axis Socratic problem decomposition, question dependency DAGs, epistemic priority sorting, and question-to-hypothesis transformation.

### 3. 🎮 Game Development & ARPG Engine (`skills/game/` — 6 Skills)
- **`server-authoritative-bridge`**: Unified host-client networking abstraction decoupling game logic from local/remote transport.
- **`hierarchical-finite-state-machine`**: Zero-allocation hierarchical FSM for entity combat behaviors, animations, and input buffering.
- **`spatial-object-pooling`**: High-throughput node object pooling preventing GC spikes during intense combat particle and projectile bursts.
- **`arpg-stat-formula-pipeline`**: Multi-stage stat calculation pipeline (Base $\to$ Added Flat $\to$ Increased % $\to$ More % $\to$ Caps & Clamp).
- **`game-input-action-buffer`**: Buffered input timing windows and responsive 8-direction radial action selection.
- **`procedural-loot-and-economy`**: Tiered loot drop tables, item affixes rolling, and balanced gold sink sinks.

### 4. 🛡️ Security Governance & Assessment Contracts (`skills/security/` — 2 Skills)
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

### 9. 🔍 Deep Reverse Engineering & Binary Analysis (`skills/reversing/` — 7 Skills)
- **`dynamic-instrumentation-analysis`**: Frida runtime hooking, API monitoring, SSL pinning bypass, JNI interception, and memory scanning.
- **`binary-deobfuscation-and-recovery`**: Control flow de-flattening (OLLVM), symbolic execution with angr/Triton, opaque predicate removal, and string decryption.
- **`malware-triage-and-unpacking`**: Defensive sandbox triage, packer detection, OEP discovery via ESP trick, memory dumping with Scylla, and IAT reconstruction.
- **`cryptographic-primitive-reversing`**: Crypto constant and S-box signature detection, entropy analysis, and in-memory key/IV extraction.
- **`protocol-and-wire-format-analysis`**: Reversing proprietary binary network protocols, TLV frames, Wireshark Lua dissectors, and Protobuf schema recovery.
- **`il2cpp-and-managed-runtime-recovery`**: Unity IL2CPP metadata extraction, C# dummy assembly generation, method RVA lookup, and runtime hooking.
- **`firmware-extraction-and-hardware-audit`**: Binwalk filesystem extraction, bare-metal base address calculation, Vector Table mapping, and U-Boot audit.

### 10. 🎯 Application Security & Defensive Penetration Testing (`skills/pentest/` — 7 Skills)
- **`attack-surface-mapping-and-recon`**: Passive and active perimeter discovery, subdomain enumeration, exposed documentation, and secret leak auditing.
- **`api-security-and-auth-auditing`**: OWASP API Top 10 auditing: BOLA/IDOR, BFLA, JWT algorithm none, and token replay verification.
- **`injection-defense-and-input-fuzzing`**: Non-destructive verification for SQLi, SSRF, SSTI, command injection, and parameterized defense checks.
- **`concurrency-and-race-condition-audit`**: TOCTOU flaws, HTTP/2 single-packet synchronization attacks, coupon double-spend, and database locking.
- **`cloud-container-hardening-audit`**: Docker socket breakouts, dangerous capabilities, Kubernetes RBAC misconfigurations, and IMDSv1 audit.
- **`fuzzing-harness-and-asan-triage`**: In-memory LibFuzzer/AFL++ harnesses, AddressSanitizer compilation, and memory safety crash root-cause triage.
- **`vulnerability-triaging-and-remediation`**: Standardized CVSS v3.1/v4.0 scoring, CWE taxonomy mapping, non-destructive PoC, and code remediation diffs.

### 11. 🗄️ Database & SQL Server Optimization (`skills/database/` — 3 Skills)
- **`sqlserver-query-tuning`** (`SQLTUNE`): 5-step query diagnosis, SARGability transformations, parameter sniffing remedies (`RECOMPILE`/local var), CTE to `#Temp` materialization, and Dapper ANSI string alignment.
- **`sqlserver-index-advisor`** (`SQLIDX`): Equality $\to$ Range $\to$ Sort composite index rules, covering index design (`INCLUDE`), filtered indexes (`IsDeleted = 0`), and DMV diagnostic scripts for missing/unused/fragmented indexes.
- **`sqlserver-plan-inspection`** (`SQLPLAN`): Graphical & XML execution plan inspection, detecting parameter sniffing via compiled vs runtime values, TempDB spills, and pre/post plan regression comparison.

### 12. 🐍 Python & AI Workflow Engineering (`skills/python/` — 3 Skills)
- **`async-taskgroup-orchestration`** (`PY_SKILL_ASYNC`): Structured concurrency with `asyncio.TaskGroup`, bounded semaphores, and CPU/blocking I/O offloading via `to_thread` / `ProcessPoolExecutor`.
- **`pydantic-v2-boundary-validation`** (`PY_SKILL_PYDANTIC`): Zero-overhead `TypeAdapter` validation, strict mode DTO schemas, discriminated unions, and custom boundary validators.
- **`structured-llm-tool-calling`** (`PY_SKILL_AGENT`): Deterministic state-machine agent loops, bounded retries, schema-enforced tool dispatch, and SSE token streaming.

### 13. 🦀 Rust Systems & Low-Latency Engineering (`skills/rust/` — 3 Skills)
- **`zero-copy-arena-lifetimes`** (`RUST_SKILL_ZCOPY`): Bump/arena allocation, zero-copy slice parsing, `Cow<str>`, and 64-byte cacheline-aligned ring buffers.
- **`typestate-error-taxonomy`** (`RUST_SKILL_ERR`): Compile-time typestate machines, zero-panic `Result<T, E>` hierarchies with `thiserror`, and infallible transitions.
- **`ffi-panic-boundary-guard`** (`RUST_SKILL_FFI`): `catch_unwind` FFI barriers, `#[repr(C)]` layout verification, opaque pointer handles, and safety contracts.

### 14. 🎨 Enterprise Multi-Platform UI Design System (`skills/ui-design-system/` — 1 Sovereign Package + 3 References)
- **`ui-design-system`** (`UIDESIGN`): Universal Multi-Platform UI/UX Design System for WinForms (DevExpress), WPF, Web (React/Tailwind) & Mobile, backed by progressive sub-references (`UI_TOKENS`, `UI_COMPONENTS`, `UI_PLATFORM`).

### 15. 🔄 Sovereign Agentic Lifecycle Workflows (`skills/*/SKILL.md` — 8 Workflows)
- **`feature-implementation`** (`WF_FEAT`): End-to-end automated feature development workflow (Normalization, Pre-Fetch, Spec, TDD, Blast-Radius, Commit, Post-Harvest).
- **`bugfix-investigation`** (`WF_BUG`): Gated diagnosis workflow: tight red-capable feedback loop, minimise, ranked falsifiable hypotheses, tagged instrumentation, correct-seam regression test, cleanup and harvest.
- **`code-refactoring`** (`WF_REF`): Zero-regression code refactoring and modularization workflow (Blast-Radius, 1-to-1 Partitioning, Conformance, and Net Engineering Value).
- **`dotnet-publish-release`** (`WF_PUB`): Lightweight framework-dependent single-file distribution publishing adhering to `R_PUB`.
- **`project-bootstrap-doctor`** (`WF_DOC`): Automated project onboarding, rule binding, and architectural compliance health-check workflow.
- **`continuous-learning-harvest`** (`WF_MEM`): Automated pre-task context lookup and post-task knowledge harvesting workflow using SemanticBrain bridge.
- **`cognitive-experiment-loop`** (`WF_COG`): 5-phase closed cognitive loop (Sensory Sweep, Socratic Inquiry, Pre-Mortem, Targeted Action, Grounded Stress, Comparative Delta, Dual Memory).
- **`multi-agent-teamwork`** (`WF_TEAM`): Multi-agent subagent team orchestration with zero-collision file ownership locks, parallel partitioning, and 4-stage adversarial verification gates.
- **`writing-for-agents`** (`WF_WRITING_AGENTS`): Authoring discipline for skills, standards, rules, and AGENTS.md: context pointers, information hierarchy, completion criteria, leading words, positive-first steering, pruning.
- **`codebase-design`** (`WF_CODEBASE_DESIGN`): Deep-module vocabulary (module, interface, seam, adapter), deletion test, two-adapter seam rule, dependency categories, and design-it-twice.
- **`domain-modeling`** (`WF_DOMAIN_MODEL`): Sharpen domain language against `GLOSSARY.md`, cross-check code, and record ADRs only for hard-to-reverse trade-offs.
- **`retro`** (`WF_RETRO`): Post-session retrospective ranking improvements to the agent environment (pointers, automated checks, standards, rules size, tool economy, no-ops).

---

## 📜 Universal & Language Standards Catalog (65 Standards across 13 Stacks)

| Domain | Count | Key Standards & Technical Guidelines |
| :--- | :---: | :--- |
| **Universal Engineering** | **22** | `agent-meta.md`, `working-memory-state.md`, `naming-conventions.md`, `performance-guidelines.md`, `conformance-testing.md`, `test-logic.md`, `git-commit-standards.md`, `versioning-and-release-standards.md`, `llm-contribution-and-governance.md`, `license-governance-and-ip-compliance.md`, `benchmark-and-hardware-provenance.md`, `scientific-research-methodology.md`, `literature-synthesis-and-prior-art.md`, `research-memory-standard.md`, `package-and-dependency-portability.md`, `security-standards.md`, `ui-ux-design-system.md`, `ui-layout-and-color-mastery.md`, `ui-anti-ai-slop-standard.md`, `multi-objective-refactoring.md`, `empirical-verification-and-evidence-hierarchy.md`, `existing-asset-discovery-and-reuse.md`. |
| **C# .NET & Godot** | **7** | `high-performance-compute.md` (SIMD/Span), `godot-game-standards.md` (C# 4.x), `webapi.md` (Clean DI), `winforms.md` (BaseForm/No BindingSource), `winforms-ui.md` (DevExpress Skinning/Grid), `wpf-ui.md` (Fluent Tokens), `wpf.md` (MVVM/Virtualization). |
| **Database & SQL Server** | **5** | `sqlserver-2012-optimization.md` (SARGability/Types/#Temp), `execution-plan-diagnosis.md` (Lookups/Spills/Joins), `indexing-optimization.md` (Covering/Filtered), `concurrency-deadlocks.md` (RCSI/UPDLOCK/ROWVERSION), `bulk-audit.md` (TVP/SqlBulkCopy/Outbox Audit). |
| **Android & Mobile** | **5** | `state-architecture.md` (UDF/MVI), `compose-ui-ux.md` (Recomposition), `camera-computational.md` (Camera2/X), `ndk-native-bridge.md` (Zero-Copy JNI), `performance-optimization.md` (R8/Baseline). |
| **Python & AI** | **4** | `ai-agent-orchestration.md` (Cyclic State Graphs/Cycle Limits), `code-quality-typing.md` (Python 3.10+ Strict Typing/Pydantic v2), `fastapi-async-web.md` (Lifespan/SSE Framing), `performance-async.md` (Non-Blocking Event Loop/TaskGroup). |
| **React & Web UI** | **4** | `component-lifecycle.md` (Hook Cleanup/Error Boundaries), `performance.md` (Virtualization/useTransition), `react-ui.md` (Tailwind High-Density Tables), `state-management.md` (TanStack Query/Zustand). |
| **Enterprise ERP** | **4** | `inventory-invariants.md` (Double-Entry/Row Locks), `production-lot-traceability.md` (Lineage/BOM), `sales-packing-journal.md` (NKDG/Journals), `rbac-permission-matrix.md` (2-Tier/RLS). |
| **Rust Systems** | **3** | `memory-performance.md` (Zero-Alloc Hot Loops, 64B Cacheline Alignment, SIMD & Pools), `safety-error-handling.md` (Zero-Panic Invariant, Explicit Result, Safe RAII & C-FFI), `toolchain-quality.md` (Clippy -D warnings, rustfmt, Headless Mocks & <450 LOC). |
| **Node.js** | **3** | `architecture.md` (Handler-Dispatcher/Clean DI), `event-loop-streams.md` (Stream Pipeline/Worker Offload), `security-middleware.md` (Rate Limiting/CSP/SSRF Guard). |
| **Go (Golang)** | **3** | `concurrency.md` (Bounded Worker Pools/errgroup), `error-observability.md` (%w/slog/OTel), `memory-allocation.md` (Escape Analysis/sync.Pool/3-Index Slicing). |
| **PHP 8.2+** | **3** | `database-transactions.md` (PDO FOR UPDATE/Deadlock Retry), `memory-generators.md` (Unbuffered Streaming Yield), `modern-syntax.md` (strict_types=1/Readonly/Enums). |
| **Embedded & RTOS** | **1** | `firmware-engineering.md` (Linker Auto-Init, Multi-Tier Memory Hub, Priority Event Hooks, 2D DMA, Stack Canary). |
| **C++ Modern** | **1** | `native-interop.md` (C-ABI DLL Export, Zero-Copy Shared Memory, OpenMP). |

---

## ⚡ How to Integrate into ANY Project (Portable Resolution)

To bind any codebase (new or existing) to the **AgentOption** engineering operating system, place a `.project-rule.md` file in the project's root directory:

```yaml
---
project_name: <project_id>
domain: <domain_name>
primary_language: <nodejs | react | csharp | go | php | python | rust | cpp | android>
architecture: <clean_architecture | universe_plugin | winforms_erp | game_engine | research_lab>
framework_references:
  agent_option_root: "[AgentOption]"      # Resolved automatically by AI Agents
  rules: ["R_CORE", "R_ENG_OS", "R_ROUTE", "R_GIT", "R_ACT", "R_RESEARCH", "R_BUDGET", "R_COG_LOOP", "R_PROOF", "R_NEV", "R_TEAM"]
  shortcuts: ["ENGOS", "ROUTE", "GIT", "ACT", "RES_STD", "RES_MEM", "COG_LOOP", "WF_COG", "REF_GATE", "PROOF_STD", "TEAM_ARC", "WF_TEAM"]
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
# 1. Fast Lookup across all 187 shortcuts and 185 core documents:
node [AgentOption]/tools/lookup.js "circuit breaker"
node [AgentOption]/tools/lookup.js "cancellation" --lang=csharp
node [AgentOption]/tools/lookup.js PY_AGENT
node [AgentOption]/tools/lookup.js TEAM_ARC
node [AgentOption]/tools/lookup.js "architect" --type=agents

# 2. Check health and compliance of a target repository:
node [AgentOption]/tools/doctor.js <path-to-target-repo>

# 3. Validate integrity and frontmatter of AgentOption framework itself:
node [AgentOption]/tools/validate-framework.js

# 3b. Anti-slop gate for UI and comment changes (staged diff by default):
node [AgentOption]/tools/anti-slop-lint.js --diff
node [AgentOption]/tools/anti-slop-lint.js --tokens <tokens.css>     # WCAG contrast audit of token pairs
node [AgentOption]/tools/anti-slop-lint.js --all src --json          # Full audit, machine-readable

# 4. Continuous Learning & Semantic Memory Loop (Bridged to agentic-brain):
node [AgentOption]/tools/brain.js pre "task description"        # Progressive L0 index retrieval (project + global)
node [AgentOption]/tools/brain.js route "task description"      # System 1 fast rule/skill/agent dispatch
node [AgentOption]/tools/brain.js view 42                       # L1 deep inspection
node [AgentOption]/tools/brain.js post "problem | cause | fix"  # One structured atom (no LLM re-analysis)
node [AgentOption]/tools/brain.js ingest --file=atoms.json      # Multiple atomic lessons (recommended)
node [AgentOption]/tools/brain.js curate --dry-run              # Memory lifecycle audit

# 5. Binary Static Triage & Shannon Entropy Scanner:
node [AgentOption]/tools/bin-triage.js <target_binary>          # Header, hashes, entropy
node [AgentOption]/tools/bin-triage.js <target_binary> --blocks # 4KB block entropy map
node [AgentOption]/tools/bin-triage.js <target_binary> --strings --min-len=8 # Extract strings

# 6. Deterministic CVSS v3.1 Calculator & CWE Taxonomy Lookup:
node [AgentOption]/tools/cvss.js "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
node [AgentOption]/tools/cvss.js "AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N" --markdown
node [AgentOption]/tools/cvss.js --lookup=IDOR                  # Search CWE & suggested vector

# 7. Pre-Flight Scope Authorization Guard:
node [AgentOption]/tools/scope-guard.js --init                  # Bootstrap .scope-contract.json
node [AgentOption]/tools/scope-guard.js check "https://api-staging.example.com"

# 8. Multi-Target Agent Exporter & Global Antigravity Skill Sync:
node [AgentOption]/tools/export-agents.js --target=all          # Export 13 personas to Claude/Cursor/Antigravity
node [AgentOption]/tools/export-agents.js --sync-skills         # Sync sovereign SKILL.md packages to .gemini/config/skills
```

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).


# 🏛️ agentic-core — Universal Enterprise Operating System for AI Coding Agents

**agentic-core** (internally known as *AgentOption*) is a universal, language-agnostic engineering operating system and architectural baseline designed to be plugged into **ANY software project** (Web, Desktop, Mobile, Distributed Microservices, Game Engines). It equips autonomous AI coding agents and engineering teams with high-precision architectural blueprints, standardized coding rules, and advanced, reusable implementation skills.

Together with **[agentic-brain](https://github.com/kzxl/agentic-brain)** (the episodic semantic memory engine), it forms a cohesive autonomous engineering ecosystem supporting progressive knowledge retrieval, harvest quality guards, and continuous lifecycle learning.

---

## 🏛️ Framework Hierarchy

```text
E:\16. AgentOption/
├── README.md                          # Central Documentation & Framework Index
├── rules.json                         # Universal Machine-Readable Rule Registry (R_*)
├── shortcuts.json                     # Quick Slash Command & Prompt Routing Registry
│
├── architecture/                      # Layer 1: High-Level Architectural Blueprints (13 Blueprints)
│   ├── engineering-operating-system.md # 8-Core Engineering Operating System (Eng-OS) & L0-L4 Memory
│   ├── clean-layered-architecture.md  # 4-Tier Clean Architecture (Domain, Application, Infra, Presentation)
│   ├── folder-per-feature.md          # Folder-per-Feature Architecture & DTO Localization
│   ├── hybrid-dual-scope-execution.md # Hybrid Desktop & WebAPI Dual-Scope Service Execution
│   ├── universe-plugin.md             # Universe Plugin Architecture v4.0 (Micro-kernel, Data Sovereignty)
│   ├── solid-and-separation-of-concerns.md # Pragmatic SOLID Principles, Layer Boundary Matrix & 1-to-1 Partitioning
│   ├── event-driven-architecture.md   # Event-Driven Systems, Outbox Pattern, Saga Orchestration
│   ├── resilience-patterns.md         # Circuit Breaker, Exponential Backoff, Fallback Cache
│   ├── micro-frontends.md             # Micro-Frontend Module Federation & Runtime Assembly
│   ├── multi-tenancy.md               # Multi-Tenant Data Isolation (RLS, Schema-per-tenant, DB-per-tenant)
│   ├── tiled-data-pipeline.md         # High-Throughput Tiled Data Pipeline & Bounded Memory Pools
│   ├── game-engine-architecture.md    # Universal Game Engine & Authoritative Simulation Blueprint
│   └── agent-skill-router-architecture.md # Deterministic Skill Router, Tool-Index SSoT & Capability Bootstrapping
│
├── standards/                         # Layer 2: Modular Language & Engineering Standards
│   ├── universal/                     # Universal Engineering Standards
│   │   ├── agent-meta.md              # Meta-Rules, Symbol Decoding, Commit Gate
│   │   ├── working-memory-state.md    # Working Memory & Execution State Invariants
│   │   ├── naming-conventions.md      # Multi-Language Naming Rules
│   │   ├── performance-guidelines.md  # Memory, Anti-N+1 & Async Concurrency
│   │   ├── conformance-testing.md     # Module Isolation & Conformance Tests
│   │   ├── test-logic.md              # Test Logic & Algorithmic Verification (Invariants, AAA, BVA)
│   │   └── git-commit-standards.md    # Git Commit Discipline & Atomic Conventional Commits Standard
│   ├── csharp/                        # C# .NET Standards (WinForms, WebAPI, WPF, DarkTheme, HighPerf, Godot)
│   │   ├── high-performance-compute.md # Span<T>, NativeMemory, SIMD Vector256/512, Zero-Alloc
│   │   └── godot-game-standards.md    # Godot 4 & C# Standards (Zero-Alloc, Signal Hygiene, Node Lifecycle)
│   ├── android/                       # Android & Mobile Engineering Standards
│   │   ├── state-architecture.md      # Unidirectional Data Flow (UDF) & MVI State Architecture
│   │   ├── compose-ui-ux.md           # Jetpack Compose Performance & Recomposition Boundaries
│   │   ├── camera-computational.md    # CameraX / Camera2 Computational Vision Pipeline
│   │   ├── ndk-native-bridge.md       # JNI / NDK Memory Safety & Zero-Copy ByteBuffers
│   │   └── performance-optimization.md # Baseline Profiles, R8 ProGuard & Startup Latency
│   ├── cpp/                           # C++ Standards (Native Interop, C-ABI Export, LibraryImport)
│   │   └── native-interop.md          # C-ABI DLL Export, Zero-Copy Shared Memory, OpenMP
│   ├── nodejs/                        # Node.js Standards (Architecture, Streams, Security)
│   ├── react/                         # React Standards (Lifecycle, State, Performance)
│   ├── golang/                        # Go Standards (Concurrency, Memory, Slog)
│   ├── php/                           # PHP 8.2+ Standards (Syntax, Transactions, Generators)
│   └── database/                      # Universal SQL Standards (Indexing, Deadlocks, Audit)
│
├── skills/                            # Layer 3: Actionable, Reusable Skills & Design Patterns (37 Skills)
│   ├── agentic/                       # Agentic Methodology & Autonomous Superpowers (12 Skills)
│   │   ├── action-first-cognitive-ux.md     # Action-First UX Protocol (ADHD-aware, Zero Preamble, Micro-Actions)
│   │   ├── agent-skill-router-protocol.md   # Deterministic Skill Routing, Tool-Index SSoT & Self-Supervision
│   │   ├── blast-radius-analysis.md         # Pre-Edit Blast-Radius Grep Analysis for Shared Classes & APIs
│   │   ├── input-normalization-pipeline.md  # Ingestion Pipeline & Structured Micro-Payload Normalization
│   │   ├── lazy-minimalism-protocol.md      # Ponytail Decision Ladder (YAGNI, Shortest Working Diff, Stdlib First)
│   │   ├── self-consistency-consensus.md    # 3-Pass Consensus with Early Stopping & Divergence Detection
│   │   ├── brainstorming-and-spec.md        # Pre-coding Exploration, Ambiguity Resolution & Spec Authoring
│   │   ├── test-driven-development.md       # Red-Green-Refactor Protocol for AI Coding Agents
│   │   ├── adversarial-code-review.md       # Self-Critique & Security/Edge-Case Audit
│   │   ├── systematic-debugging.md          # 5-Step Scientific Hypothesis Debugging
│   │   ├── execution-state-tracking.md      # Working Memory & Execution State Protocol
│   │   └── continuous-learning-protocol.md  # PRE-Fetch Context & POST-Harvest Semantic Memory
│   ├── game/                          # Game Development & ARPG Engine Skills (6 Skills)
│   │   ├── server-authoritative-bridge.md   # Unified Host-Client Bridge (Local vs Remote Server)
│   │   ├── hierarchical-finite-state-machine.md # Zero-Alloc HFSM for Entity Combat & Input Buffering
│   │   ├── spatial-object-pooling.md        # High-Throughput Node Object Pool (Zero-GC Spikes)
│   │   ├── arpg-stat-formula-pipeline.md    # Multi-Stage ARPG Stat Pipeline (Flat, Inc, More, Caps)
│   │   ├── game-input-action-buffer.md      # Input Action Buffer Window & 8-Direction Radial Wheel
│   │   └── procedural-loot-and-economy.md   # Procedural Loot Roll Algorithm & Gold Sink Economy
│   ├── security/                      # Reverse Engineering & Security Analysis (2 Skills)
│   │   ├── reverse-engineering-playbook.md  # Multi-Target Reverse Engineering (APK, PE/ELF, .NET, Web JS)
│   │   └── security-scope-and-evidence-contract.md # Ops Gate, Precedent Authorization & Evidence Chains
│   ├── csharp/                        # C# .NET Enterprise Skills (6 Skills)
│   │   ├── baseform-lifecycle-orchestration.md # RunAfterShown & Explicit 1-Way Data Binding
│   │   ├── hybrid-dbscope-pattern.md           # Hybrid DbScope for WinForms & WebAPI Execution
│   │   ├── feature-partial-partitioning.md     # 1-to-1 Partial Class Partitioning (Action/Query/Lookup)
│   │   ├── cancellation-token-propagation.md   # End-to-End Task Cancellation Flow
│   │   ├── dapper-bulk-data-access.md          # Multi-Mapping & High-Throughput Bulk Operations
│   │   └── zero-copy-interop.md                # Zero-Copy C# & C++ Pointer Interoperability
│   ├── nodejs/                        # Node.js Enterprise Skills & Patterns (8 Skills)
│   │   ├── handler-dispatcher-pattern.md    # canHandle/handle Dispatcher Architecture
│   │   ├── interceptor-pipeline.md          # Request & Response Interceptors Pipeline
│   │   ├── error-boundary-handler.md        # Predicate-based Centralized Error Handling
│   │   ├── persistence-adapter-pattern.md   # Storage & State Persistence Adapters
│   │   ├── scoped-attributes-manager.md     # 3-Tier Scoped State (Request, Session, Persistent)
│   │   ├── fluent-response-builder.md       # Fluent API Response Payload Builder
│   │   ├── service-client-factory.md        # Authenticated API Delegation Client Factory
│   │   └── skill-builder-pattern.md         # Fluent Module/App Builder Composition
│   └── react/                         # React Enterprise Skills (3 Skills)
│       ├── abortable-fetch-lifecycle.md     # AbortController Lifecycle & Race Prevention
│       ├── compound-components-pattern.md   # Context-Driven Compound Components
│       └── optimistic-ui-updates.md         # Instantaneous Mutations & Automated Rollback
│
├── workflows/                         # Layer 4: Automated Agentic & DevOps Workflows
│   ├── feature-implementation.md      # End-to-End Feature Development Workflow
│   ├── bugfix-investigation.md        # 5-Step Scientific Bugfix & Regression Workflow
│   ├── code-refactoring.md            # Zero-Regression 1-to-1 Refactoring Workflow
│   ├── dotnet-publish-release.md      # .NET Dual Publish (Full Self-Contained vs Lite)
│   ├── project-bootstrap-doctor.md    # Project Onboarding & Compliance Audit
│   └── continuous-learning-harvest.md # Automated Pre-Fetch & Post-Harvest Memory Loop
│
├── tools/                             # Layer 5: Automated Verification & Agent CLI Tools
│   ├── validate-framework.js          # Self-Linter validating YAML frontmatter & rule links
│   ├── lookup.js                      # Sub-50ms Fast Query CLI for AI Agents
│   ├── doctor.js                      # Project Health-Check validating against .project-rule.md
│   └── brain.js                       # Portable SemanticBrain Bridge CLI (PRE-Fetch & POST-Harvest)
│
└── templates/                         # Layer 6: Rapid Bootstrapping & Extension Templates
    ├── project-bootstrap-template.md  # Template to bind ANY project to AgentOption
    ├── standard-template.md           # Template for authoring new Language Standards
    ├── skill-template.md              # Template for authoring new Actionable Skills
    └── workflow-template.md           # Template for multi-step automated workflows
```

---

## 🧩 Comprehensive Skill Clusters & Capabilities Catalog

The framework organizes its **37 reusable skills** across 6 specialized engineering clusters:

### 1. 🤖 Agentic & Cognitive Superpowers (`skills/agentic/`)
Designed to govern the AI agent's internal reasoning loop, cognitive UX with humans, and defensive coding habits:
- **`action-first-cognitive-ux`**: Action-first communication protocol reducing human cognitive load (ADHD-aware, zero pleasantry preamble, micro-actions $< 2$ min, visual progress proofs).
- **`agent-skill-router-protocol`**: Deterministic router-first skill dispatch, Machine-Local Tool-Index Single Source of Truth (SSoT), and self-supervision.
- **`blast-radius-analysis`**: Pre-edit grep scanner for shared classes, database columns, and API contracts to prevent cascading regressions.
- **`input-normalization-pipeline`**: Multi-stage noise filtering that converts raw free-form prompts into structured micro-payloads.
- **`lazy-minimalism-protocol`**: 7-rung Ponytail Decision Ladder enforcing YAGNI, standard library first, zero unrequested abstractions, and shortest working diffs.
- **`self-consistency-consensus`**: 3-pass reasoning protocol with early stopping on convergence and deep-dive verification on divergence.
- **`brainstorming-and-spec`**: Socratic discovery, user intent alignment, and unambiguous technical specification authoring before coding.
- **`test-driven-development`**: Strict Red-Green-Refactor development protocol ensuring 100% executable verification.
- **`adversarial-code-review`**: Multi-dimensional self-audit covering boundary conditions, security vulnerabilities, and backward compatibility.
- **`systematic-debugging`**: 5-step scientific hypothesis debugging process that isolates root causes without guesswork.
- **`execution-state-tracking`**: L0–L4 working memory state machine and live task progress tracking.
- **`continuous-learning-protocol`**: Automated PRE-fetch context retrieval and POST-harvest episodic learning loop bridged to SemanticBrain.

### 2. 🎮 Game Development & ARPG Engine (`skills/game/`)
High-performance architectural patterns for real-time simulations, Godot 4 / C# ARPGs, and networked game engines:
- **`server-authoritative-bridge`**: Unified host-client networking abstraction decoupling game logic from local/remote transport.
- **`hierarchical-finite-state-machine`**: Zero-allocation hierarchical FSM for entity combat behaviors, animations, and input buffering.
- **`spatial-object-pooling`**: High-throughput node object pooling preventing GC spikes during intense combat particle and projectile bursts.
- **`arpg-stat-formula-pipeline`**: Multi-stage stat calculation pipeline (Base $\to$ Added Flat $\to$ Increased % $\to$ More % $\to$ Caps & Clamp).
- **`game-input-action-buffer`**: Buffered input timing windows and responsive 8-direction radial action selection.
- **`procedural-loot-and-economy`**: Tiered loot drop tables, item affixes rolling, and balanced gold sink sinks.

### 3. 🛡️ Reverse Engineering & Security (`skills/security/`)
Defensive security audits, decompilation pipelines, and binary analysis:
- **`reverse-engineering-playbook`**: Multi-target reverse engineering workflows across Android APK/AAR, native PE/ELF/Mach-O binaries, .NET assemblies, and obfuscated Web JS.
- **`security-scope-and-evidence-contract`**: Operations gate enforcing cryptographic chain-of-custody evidence and verified legal authorization scopes.

### 4. ⚡ C# .NET Enterprise Patterns (`skills/csharp/`)
Enterprise-grade patterns for high-performance .NET applications, WinForms modernization, and WebAPI architectures:
- **`baseform-lifecycle-orchestration`**: Clean UI initialization lifecycle via `RunAfterShown` and strict unidirectional data binding (`PopulateControls` / `CollectData`).
- **`hybrid-dbscope-pattern`**: Dual-scope database connection and transaction management bridging Desktop apps and WebAPI services.
- **`feature-partial-partitioning`**: Clean 1-to-1 partial class segregation (`*.Action.cs`, `*.Query.cs`, `*.Lookup.cs`) eliminating God services.
- **`cancellation-token-propagation`**: Cooperative, responsive task cancellation flow across async boundaries.
- **`dapper-bulk-data-access`**: High-throughput multi-entity bulk queries and fast mapping without ORM bloat.
- **`zero-copy-interop`**: High-performance unsafe pointers and native C/C++ memory sharing via `Span<T>` and `Memory<T>`.

### 5. 🟢 Node.js Enterprise Patterns (`skills/nodejs/`)
Modular, extensible architecture patterns for enterprise Node.js microservices:
- **`handler-dispatcher-pattern`**: Clean `canHandle` / `handle` polymorphic request dispatching.
- **`interceptor-pipeline`**: Flexible request/response transformation and audit pipelines.
- **`error-boundary-handler`**: Centralized, predicate-based error management and safe failure handling.
- **`persistence-adapter-pattern`**: Pluggable storage abstraction isolating business models from databases.
- **`scoped-attributes-manager`**: Multi-tier state scoping (Request, Session, Persistent).
- **`fluent-response-builder`**: Immutable, fluent builder for robust API payload construction.
- **`service-client-factory`**: Authenticated API delegation and client pooling factory.
- **`skill-builder-pattern`**: Composable application bootstrap builder for complex microservices.

### 6. ⚛️ React Frontend Engineering (`skills/react/`)
Modern React patterns ensuring leak-free component lifecycles and fluid UX:
- **`abortable-fetch-lifecycle`**: Automatic request cleanup using `AbortController` preventing race conditions and unmounted state updates.
- **`compound-components-pattern`**: Context-driven component composition providing expressive and flexible JSX APIs.
- **`optimistic-ui-updates`**: Instantaneous UI state mutation with automatic rollback on network failure.

---

## ⚡ How to Integrate into ANY Project (Portable Resolution)

To enable AI agents to automatically apply `AgentOption` standards to any project across different workstations, add `.project-rule.md` to the project root:

```yaml
---
project_name: <project_id>
domain: <domain_name>
primary_language: <nodejs | react | csharp | go | php>
architecture: <clean_architecture | universe_plugin | winforms_erp | game_engine>
framework_references:
  agent_option_root: "[AgentOption]"      # Automatically resolved by Agents
  rules: ["R_CORE", "R_NODE", "R_REACT", "R_CS", "R_GAME"]
---
```

### Path Resolution Priority:
1. `AGENT_OPTION_PATH` (Environment Variable).
2. Sibling directory: `../16. AgentOption` or `./16. AgentOption`.
3. Configured path in `agent_option_root`.
4. Default local fallback: `E:\16. AgentOption`.

---

## 🛠️ CLI Tools for AI Agents & Developers

```bash
# 1. Fast Lookup across all skills and architectures:
node [AgentOption]/tools/lookup.js "circuit breaker"
node [AgentOption]/tools/lookup.js "cancellation" --lang=csharp
node [AgentOption]/tools/lookup.js "loot" --lang=game

# 2. Check health of a target repository:
node [AgentOption]/tools/doctor.js <path-to-target-repo>

# 3. Validate integrity of AgentOption framework itself:
node [AgentOption]/tools/validate-framework.js

# 4. Continuous Learning & Memory Loop (Bridged to agentic-brain):
node [AgentOption]/tools/brain.js pre "task description"        # Progressive L0 index retrieval
node [AgentOption]/tools/brain.js view 42                       # L1 deep inspection
node [AgentOption]/tools/brain.js post "problem | cause | fix"  # Quality-guarded harvest
node [AgentOption]/tools/brain.js curate --dry-run              # Memory lifecycle audit
```

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).

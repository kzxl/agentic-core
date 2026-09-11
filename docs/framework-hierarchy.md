# 🏛️ agentic-core — Framework Directory Hierarchy & File Map

This document provides the complete, exhaustive, file-by-file structural map of **agentic-core** (**AgentOption**). It details every architectural blueprint, engineering standard, actionable skill, automated workflow, developer tool, and configuration registry across all 7 layers of the operating system.

---

## 🌳 Complete System File Tree

```text
E:\16. AgentOption/
├── README.md                          # Executive Overview, Pillars & Capability Catalog
├── rules.json                         # Machine-Readable Rule Registry (36 Rules: R_*)
├── shortcuts.json                     # Deterministic Prompt & Agent Routing (115 Shortcuts)
├── .project-rule.md                   # Self-Hosting Root Rule & Doctor Compliance Baseline
├── LICENSE                            # MIT License Terms
│
├── docs/                              # Framework Documentation & System Maps
│   └── framework-hierarchy.md         # Exhaustive Directory Hierarchy & File-by-File SSoT (This File)
│
├── architecture/                      # Layer 1: High-Level System Blueprints (19 Blueprints)
│   ├── engineering-operating-system.md # 8-Core Engineering Operating System (Eng-OS) & L0-L4 Memory Tiers
│   ├── clean-layered-architecture.md  # 4-Tier Clean Architecture (Domain, Application, Infra, Presentation)
│   ├── folder-per-feature.md          # Vertical Slice Architecture & Feature-Local DTO Isolation
│   ├── hybrid-dual-scope-execution.md # Desktop WinForms & Stateless WebAPI Dual-Scope Service Engine
│   ├── universe-plugin.md             # Universe Plugin Architecture v4.0 (Micro-kernel & Data Sovereignty)
│   ├── solid-and-separation-of-concerns.md # Pragmatic SOLID Principles & Layer Boundary Matrix
│   ├── event-driven-architecture.md   # Domain Events, Transactional Outbox Pattern & Saga Orchestration
│   ├── resilience-patterns.md         # Circuit Breaker, Exponential Backoff & Stale-While-Revalidate Caching
│   ├── micro-frontends.md             # Micro-Frontend Module Federation & Contract-Driven State
│   ├── multi-tenancy.md               # Multi-Tenant Data Isolation (RLS, Schema-per-tenant, DB-per-tenant)
│   ├── tiled-data-pipeline.md         # High-Throughput Tiled Data Pipeline & Bounded Memory Pools
│   ├── game-engine-architecture.md    # Server-Authoritative Simulation & Fixed-Timestep Physics Loop
│   ├── agent-skill-router-architecture.md # Deterministic Skill Router, Tool-Index SSoT & Auto-Bootstrapping
│   ├── research-manager-orchestration.md # Research Manager Triad (Explorer, Verifier, Historian) & 5-Way Gate
│   ├── research-memory-schema.md      # 8-Entity Cognitive Research Graph & Dual-Substrate Persistence
│   ├── dead-loop-and-stagnation-detector.md # Dual-Mode Graph Cycle & Semantic Stagnation Detector
│   ├── multi-dimensional-research-budget.md # 6D Tensor Resource Allocation & Stagnation-Driven Pivots
│   ├── expected-information-gain-engine.md # Bayesian Optimal Experimental Design & Zero-Gain Trial Pruning
│   └── autonomous-question-generator.md # Socratic Problem Decomposition across 6 Axes & Question DAG
│
├── standards/                         # Layer 2: Modular Language & Engineering Standards (40 Standards)
│   ├── universal/                     # Universal Engineering Standards (13 Standards)
│   │   ├── agent-meta.md              # Meta-Rules, Symbol Decoding & Commit Verification Gate
│   │   ├── working-memory-state.md    # Working Memory & Execution State Machine Invariants
│   │   ├── naming-conventions.md      # Universal Multi-Language Naming & Symbol Standards
│   │   ├── performance-guidelines.md  # Memory Footprint, Anti-N+1 Queries & Async Concurrency
│   │   ├── conformance-testing.md     # Module Isolation, Contract Compliance & Conformance Harnesses
│   │   ├── test-logic.md              # Test Logic & Algorithmic Verification (Invariants, AAA, BVA)
│   │   ├── git-commit-standards.md    # Conventional Commits, Atomic Scoping & Git Guard Discipline
│   │   ├── llm-contribution-and-governance.md # Clean-Room LLM Policy, GNU <15-Line IP Safety & MMIO Protection
│   │   ├── license-governance-and-ip-compliance.md # Software License Matrix, Compatibility & IP Governance
│   │   ├── benchmark-and-hardware-provenance.md # Empirical Benchmarking, Hardware Telemetry & Variance Isolation
│   │   ├── scientific-research-methodology.md # Scientific Method, Formal Hypotheses & Falsifiability Gates
│   │   ├── literature-synthesis-and-prior-art.md # Prior Art Gap Analysis, Comparative Taxonomy & Citation Standard
│   │   └── research-memory-standard.md # Research Memory Schema, Query-Before-Action & Negative Knowledge
│   │
│   ├── csharp/                        # C# .NET Standards (6 Standards)
│   │   ├── high-performance-compute.md # Span<T>, NativeMemory, SIMD Vector256/512 & Zero-Alloc Allocations
│   │   ├── godot-game-standards.md    # Godot 4 & C# Standards (Zero-Alloc, Signal Hygiene, Node Lifecycle)
│   │   ├── webapi.md                  # Web API Standards (Clean Architecture, DI, DTO Localization)
│   │   ├── winforms.md                # WinForms Standards (BaseForm, RunAfterShown, No BindingSource)
│   │   ├── wpf-ui.md                  # WPF UI & Fluent Design Tokens (Dark/Light Themes, Compact Density)
│   │   └── wpf.md                     # WPF Desktop MVVM Standards (Pure XAML, Dispatcher Safety)
│   │
│   ├── android/                       # Android & Mobile Engineering Standards (5 Standards)
│   │   ├── state-architecture.md      # Unidirectional Data Flow (UDF) & MVI State Architecture
│   │   ├── compose-ui-ux.md           # Jetpack Compose Performance & Recomposition Boundaries
│   │   ├── camera-computational.md    # CameraX / Camera2 Computational Vision Pipeline
│   │   ├── ndk-native-bridge.md       # JNI / NDK Memory Safety & Zero-Copy ByteBuffers
│   │   └── performance-optimization.md # Baseline Profiles, R8 ProGuard & Startup Latency Optimization
│   │
│   ├── cpp/                           # C++ Standards (1 Standard)
│   │   └── native-interop.md          # C-ABI DLL Export, Zero-Copy Shared Memory & OpenMP Concurrency
│   │
│   ├── nodejs/                        # Node.js Standards (3 Standards)
│   │   ├── architecture.md            # Controller-Service-Repository Layer Separation
│   │   ├── event-loop-streams.md      # Non-blocking Event Loop, Backpressure & Stream Pipelines
│   │   └── security-middleware.md     # Helmet, Rate Limiting & Input Sanitization Guards
│   │
│   ├── react/                         # React Standards (3 Standards)
│   │   ├── component-lifecycle.md     # Pure Functional Components & Hook Cleanup Lifecycle
│   │   ├── performance.md             # React.memo, useMemo/useCallback & Code Splitting Optimization
│   │   └── state-management.md        # State Colocation & Redux/Zustand Unidirectional Data Flow
│   │
│   ├── golang/                        # Go Standards (3 Standards)
│   │   ├── concurrency.md             # Goroutines, Context Cancellation & Worker Pools
│   │   ├── error-observability.md     # Error Wrapping (%w) & Structured slog Observability
│   │   └── memory-allocation.md       # Escape Analysis, sync.Pool & Zero-Alloc Slices
│   │
│   ├── php/                           # PHP 8.2+ Standards (3 Standards)
│   │   ├── database-transactions.md   # PDO Transactions, Row-Level Locking & Concurrency Safety
│   │   ├── memory-generators.md       # Streaming Yield Generators for High-Volume Data Processing
│   │   └── modern-syntax.md           # strict_types=1, Match Expressions & Readonly Classes
│   │
│   └── database/                      # Universal SQL Standards (3 Standards)
│       ├── indexing-optimization.md   # Composite Indexing, Covering Indexes & SARGable Query Discipline
│       ├── concurrency-deadlocks.md   # Deadlock Defense, Consistent Lock Ordering & RCSI Isolation
│       └── bulk-audit.md              # Chunked Bulk Processing & Mandatory Audit Trail Logging
│
├── skills/                            # Layer 3: Actionable, Reusable Skills & Design Patterns (49 Skills)
│   ├── agentic/                       # Agentic Methodology & Autonomous Superpowers (13 Skills)
│   │   ├── action-first-cognitive-ux.md     # Action-First UX Protocol (ADHD-aware, Zero Preamble, Micro-Actions)
│   │   ├── agent-skill-router-protocol.md   # Deterministic Skill Routing, Tool-Index SSoT & Self-Supervision
│   │   ├── blast-radius-analysis.md         # Pre-Edit Blast-Radius Grep Analysis for Shared Classes & APIs
│   │   ├── clean-room-ip-and-governance.md  # Clean-Room IP Protocol, GNU Compliance & Hardware Verification
│   │   ├── input-normalization-pipeline.md  # Ingestion Pipeline & Structured Micro-Payload Normalization
│   │   ├── lazy-minimalism-protocol.md      # Ponytail Decision Ladder (YAGNI, Shortest Working Diff, Stdlib First)
│   │   ├── self-consistency-consensus.md    # 3-Pass Consensus with Early Stopping & Divergence Detection
│   │   ├── brainstorming-and-spec.md        # Pre-coding Exploration, Ambiguity Resolution & Spec Authoring
│   │   ├── test-driven-development.md       # Red-Green-Refactor Protocol for AI Coding Agents
│   │   ├── adversarial-code-review.md       # Self-Audit Checklist for Regressions, Security & Boundary Cases
│   │   ├── systematic-debugging.md          # 5-Step Scientific Hypothesis Root-Cause Isolation
│   │   ├── execution-state-tracking.md      # L0-L4 Working Memory State Machine & Live Progress Telemetry
│   │   └── continuous-learning-protocol.md  # PRE-Fetch & POST-Harvest Memory Loop with SemanticBrain
│   │
│   ├── research/                      # Scientific Research & Experimental Skills (10 Skills)
│   │   ├── research-manager-protocol.md     # Triad Meta-Governor (Explorer, Verifier, Historian) & 5-Way Gate
│   │   ├── hypothesis-driven-experimentation.md # Formal Hypotheses (H0/H1), Falsifiability & Invariant Stress-Tests
│   │   ├── ablation-study-protocol.md       # Drop-One-Out / Add-One-In Harnesses & Contribution Scoring
│   │   ├── statistical-benchmark-analysis.md # Non-Parametric Statistics, IQR Filtering & Welch's T-Test
│   │   ├── prior-art-gap-analysis.md        # Multi-Vector Competitive Matrix & Pareto Frontier Evaluation
│   │   ├── failed-approach-negative-memory.md # Anti-Repetition Pattern Matching & Graveyard Invariants
│   │   ├── dead-loop-stagnation-detection.md # Graph Cycle Interception, Cosine Stagnation & Circuit Breaker
│   │   ├── multi-dimensional-budget-governance.md # 6D Tensor Resource Tracking & Stagnation-Driven Pivots
│   │   ├── expected-information-gain-protocol.md # Bayesian Pre-Flight Gate & Zero-Gain Trial Pruning
│   │   └── autonomous-question-generation.md # 6-Axis Socratic Decomposition & Topological Question DAGs
│   │
│   ├── game/                          # Game Development & ARPG Engine Skills (6 Skills)
│   │   ├── server-authoritative-bridge.md   # Unified Host-Client Networking Decoupling Simulation from Transport
│   │   ├── hierarchical-finite-state-machine.md # Zero-Alloc HFSM for Entity Combat & Input Buffering
│   │   ├── spatial-object-pooling.md        # High-Throughput Node Object Pool (Zero-GC Spikes)
│   │   ├── arpg-stat-formula-pipeline.md    # Multi-Stage ARPG Stat Pipeline (Flat, Inc, More, Caps)
│   │   ├── game-input-action-buffer.md      # Input Action Buffer Window & 8-Direction Radial Wheel
│   │   └── procedural-loot-and-economy.md   # Procedural Loot Roll Algorithm & Gold Sink Economy
│   │
│   ├── security/                      # Reverse Engineering & Security Analysis (2 Skills)
│   │   ├── reverse-engineering-playbook.md  # Multi-Target Reverse Engineering (APK, PE/ELF, .NET, Web JS)
│   │   └── security-scope-and-evidence-contract.md # Ops Gate, Precedent Authorization & Evidence Chains
│   │
│   ├── csharp/                        # C# .NET Enterprise Skills (6 Skills)
│   │   ├── baseform-lifecycle-orchestration.md # RunAfterShown & Explicit 1-Way Data Binding
│   │   ├── hybrid-dbscope-pattern.md           # Hybrid DbScope for WinForms & WebAPI Execution
│   │   ├── feature-partial-partitioning.md     # 1-to-1 Partial Class Partitioning (Action/Query/Lookup)
│   │   ├── cancellation-token-propagation.md   # End-to-End Task Cancellation Flow
│   │   ├── dapper-bulk-data-access.md          # Multi-Mapping & High-Throughput Bulk Operations
│   │   └── zero-copy-interop.md                # Zero-Copy C# & C++ Pointer Interoperability
│   │
│   ├── nodejs/                        # Node.js Enterprise Skills & Patterns (8 Skills)
│   │   ├── handler-dispatcher-pattern.md    # canHandle/handle Dispatcher Architecture
│   │   ├── interceptor-pipeline.md          # Request & Response Interceptors Pipeline
│   │   ├── error-boundary-handler.md        # Predicate-based Centralized Error Handling
│   │   ├── persistence-adapter-pattern.md   # Storage & State Persistence Adapters
│   │   ├── scoped-attributes-manager.md     # 3-Tier Scoped State (Request, Session, Persistent)
│   │   ├── fluent-response-builder.md       # Fluent API Response Payload Builder
│   │   ├── service-client-factory.md        # Authenticated API Delegation Client Factory
│   │   └── skill-builder-pattern.md         # Fluent Module/App Builder Composition
│   │
│   ├── react/                         # React Enterprise Skills (3 Skills)
│   │   ├── abortable-fetch-lifecycle.md     # AbortController Lifecycle & Race Prevention
│   │   ├── compound-components-pattern.md   # Context-Driven Compound Components
│   │   └── optimistic-ui-updates.md         # Instantaneous Mutations & Automated Rollback
│   │
│   └── embedded/                      # Embedded & Bare-Metal RTOS Skills (1 Skill)
│       └── bare-metal-rtos-hooking.md # Non-Disruptive RTOS Hooking, EDMAC DMA & Dynamic .mo
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
│   ├── validate-framework.js          # Self-Linter validating YAML frontmatter, rules & shortcuts
│   ├── lookup.js                      # Sub-50ms Fast Query CLI for AI Agents
│   ├── doctor.js                      # Project Health-Check validating against .project-rule.md
│   └── brain.js                       # Portable SemanticBrain Bridge CLI (PRE-Fetch & POST-Harvest)
│
└── templates/                         # Layer 6: Rapid Bootstrapping & Extension Templates (5 Templates)
    ├── project-bootstrap-template.md  # Template to bind ANY external project to AgentOption
    ├── standard-template.md           # Template for authoring new Language Standards
    ├── skill-template.md              # Template for authoring new Actionable Skills
    ├── workflow-template.md           # Template for multi-step automated workflows
    └── research-memory-template.json  # Starter JSON Schema for .research-memory.json
```

---

## 🏛️ Layer Responsibilities & Architectural Invariants

| Layer | Directory | Invariant & Governance |
| :--- | :--- | :--- |
| **Layer 1: Blueprints** | `architecture/` | Macro-level system designs. Must define domain boundaries, data sovereignty, and anti-corruption layers. Every blueprint requires a registered shortcut in `shortcuts.json`. |
| **Layer 2: Standards** | `standards/` | Concrete technical rules and code guidelines per language/domain. Every standard must link to at least one machine rule in `rules.json` and declare explicit verification criteria. |
| **Layer 3: Skills** | `skills/` | Practical, actionable implementation recipes and patterns. Organized into 8 specialized clusters with zero-boilerplate guidelines and executable test logic. |
| **Layer 4: Workflows** | `workflows/` | Deterministic, multi-phase operational procedures for complex agent tasks (features, bugfixes, refactorings, releases, harvests). |
| **Layer 5: Tools** | `tools/` | Automated verification CLIs and agent accelerator tools ensuring framework integrity, fast retrieval, and compliance auditing. |
| **Layer 6: Templates** | `templates/` | Rapid scaffolding baselines for onboarding new projects or extending standards, skills, and workflows without starting from scratch. |
| **Layer 7: Docs** | `docs/` | Deep-dive structural references, hierarchy maps, and cross-framework integration guides. |

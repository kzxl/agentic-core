# 🏛️ agentic-core — Framework Directory Hierarchy & File Map

This document provides the complete, exhaustive, file-by-file structural map of **agentic-core** (**AgentOption**). It details every agent persona (13 agents), architectural blueprint (24 blueprints), engineering standard (65 standards across 13 stacks/domains), actionable skill & sovereign package (96 markdown files: 72 cluster skills across 13 clusters + 13 sovereign `SKILL.md` packages + 11 package reference specs), developer tool, and configuration registry across all 7 layers of the operating system, encompassing 198 core content files.

---

## 🌳 Complete System File Tree

```text
E:\16. AgentOption/
├── README.md                          # Executive Overview, Pillars & Capability Catalog
├── AGENTS.md                          # Auto-loaded invariants for agents editing this repo (navigation pointers)
├── package.json                       # Node.js Package Manifest, Scripts & Test Runner Baseline
├── rules.json                         # Machine-Readable Rule Registry (56 Rules: R_*)
├── shortcuts.json                     # Deterministic Prompt & Agent Routing (192 Shortcuts)
├── .project-rule.md                   # Self-Hosting Root Rule & Doctor Compliance Baseline
├── LICENSE                            # MIT License Terms
│
├── docs/                              # Layer 6: Framework Documentation, Decisions & Governance (20 Docs)
│   ├── framework-hierarchy.md         # Exhaustive Directory Hierarchy & File-by-File SSoT (This File)
│   ├── AGENT_DESIGN_REPOS_STUDY.md    # Comprehensive SOTA Agent Architectural Research & Trade-off Study
│   ├── anti-slop.md                   # Human-facing anti-slop rationale, before/after gallery & palette migration
│   ├── adr/                           # Architecture Decision Records (index + 0001-0008)
│   └── governance/                    # Change bar (SCOPE.md) & out-of-scope records (6 rejected ideas)
│
├── agents/                            # Layer 0: Agent Persona & Role Registry (13 Agents across 3 Divisions)
│   ├── engineering/                   # Technical Implementation Specialists (7 Agents)
│   │   ├── csharp-core-architect.md   # Principal C# Architect (Clean Arch, Plugins, High-Perf)
│   │   ├── winforms-modernizer.md     # Desktop WinForms Modernization (BaseForm, RunAfterShown)
│   │   ├── webapi-feature-dev.md      # Vertical Slice Folder-per-Feature WebAPI & Localized DTOs
│   │   ├── high-perf-compute-specialist.md # Zero-Alloc, Span<T>, NativeMemory, SIMD Vector256/512
│   │   ├── python-ai-architect.md     # Python 3.10+ & AI Workflow Architect (FastAPI, Pydantic v2, State Graphs)
│   │   ├── rust-systems-architect.md  # Low-Latency Rust Systems Architect (#![no_std], SIMD, Safe FFI)
│   │   └── sql-performance-tuner.md   # SQL Server Execution Plan Diagnostician (SARGability, Indexes, TVP)
│   ├── governance/                    # Quality, Security & Orchestration Authorities (4 Agents)
│   │   ├── multi-agent-orchestrator.md # Multi-Agent Lead Coordinator (Zero-Collision Locks, Adversarial Gates)
│   │   ├── goldfish-spec-critic.md    # Zero-Context Spec Gatekeeper (Zoom Out, Comprehension, Critic, Readiness)
│   │   ├── adversarial-code-reviewer.md # Independent Auditor (Regression Hunting, NEV Gate)
│   │   └── security-pentest-auditor.md  # Defensive Security Auditor (CVSS, Scope Contracts, OWASP)
│   └── erp/                           # Business Domain Functional Authorities (2 Agents)
│       ├── inventory-domain-specialist.md # Warehouse Ledger Immutability & Pessimistic Row Locking
│       └── production-lot-specialist.md   # Manufacturing Lineage, Bidirectional Lot Traceability
│
├── architecture/                      # Layer 1: High-Level System Blueprints (24 Blueprints)
│   ├── engineering-operating-system.md # 8-Core Engineering Operating System (Eng-OS) & L0-L4 Memory Tiers
│   ├── empirical-cognitive-loop.md    # 5-Phase Closed Cognitive Loop, Active Sensing, Pre-Mortem & Epistemic Gate
│   ├── multi-agent-teamwork-protocol.md # Multi-Agent Teamwork Topology, Zero-Collision Locks & 4-Stage Adversarial Gate
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
│   ├── real-time-embedded-architecture.md # Real-Time RTOS Firmware Invariants, Linker Auto-Init & Memory Governance
│   ├── agent-skill-router-architecture.md # Deterministic Skill Router, Tool-Index SSoT & Auto-Bootstrapping
│   ├── research-manager-orchestration.md # Research Manager Triad (Explorer, Verifier, Historian) & 5-Way Gate
│   ├── research-memory-schema.md      # 8-Entity Cognitive Research Graph & Dual-Substrate Persistence
│   ├── dead-loop-and-stagnation-detector.md # Dual-Mode Graph Cycle & Semantic Stagnation Detector
│   ├── multi-dimensional-research-budget.md # 6D Tensor Resource Allocation & Stagnation-Driven Pivots
│   ├── expected-information-gain-engine.md # Bayesian Optimal Experimental Design & Zero-Gain Trial Pruning
│   ├── autonomous-question-generator.md # Socratic Problem Decomposition across 6 Axes & Question DAG
│   ├── agent-cognitive-and-execution-patterns.md # Sovereign Cognitive & Execution Patterns Blueprint (FSM Rollback, ACI, Tiered Memory)
│   └── in-process-decision-router.md  # In-Process System 1 Fast Decision Router & Pre-Execution Risk Gate
│
├── standards/                         # Layer 2: Modular Language & Engineering Standards (65 Standards across 13 Stacks)
│   ├── universal/                     # Universal Engineering Standards (22 Standards)
│   │   ├── agent-meta.md              # Meta-Rules, Symbol Decoding & Commit Verification Gate
│   │   ├── working-memory-state.md    # Working Memory & Execution State Machine Invariants
│   │   ├── naming-conventions.md      # Universal Multi-Language Naming & Symbol Standards
│   │   ├── performance-guidelines.md  # Complexity Bounds, Batch I/O, Streaming & Latency Budgets
│   │   ├── conformance-testing.md     # Module Isolation, Contract Compliance & Conformance Harnesses
│   │   ├── test-logic.md              # Test Logic & Algorithmic Verification (Invariants, AAA, BVA)
│   │   ├── git-commit-standards.md    # Conventional Commits, Atomic Scoping & Git Guard Discipline
│   │   ├── versioning-and-release-standards.md # Semantic Versioning 2.0.0, 4-Part Revisions & Forward-Only Rollback
│   │   ├── llm-contribution-and-governance.md # Clean-Room LLM Policy, GNU <15-Line IP Safety & MMIO Protection
│   │   ├── license-governance-and-ip-compliance.md # Software License Matrix, Compatibility & IP Governance
│   │   ├── benchmark-and-hardware-provenance.md # Empirical Benchmarking, Hardware Telemetry & Variance Isolation
│   │   ├── scientific-research-methodology.md # Scientific Method, Formal Hypotheses & Falsifiability Gates
│   │   ├── literature-synthesis-and-prior-art.md # Prior Art Gap Analysis, Comparative Taxonomy & Citation Standard
│   │   ├── research-memory-standard.md # Research Memory Schema, Query-Before-Action & Negative Knowledge
│   │   ├── package-and-dependency-portability.md # Elimination of Machine-Specific Absolute Paths & NuGet Governance
│   │   ├── security-standards.md      # Zero-Leakage Credential Protection, Test Isolation & Data Minimization
│   │   ├── ui-ux-design-system.md     # 5-Tier Design Tokens, 60-30-10 Color Balance, Living Slate & ERP Immutability
│   │   ├── ui-layout-and-color-mastery.md # Mathematical Color Formulas, 8pt Spatial Rhythm & Responsive Multi-Pane
│   │   ├── ui-anti-ai-slop-standard.md # Visual Restraint, Neon/Glow/Slop Elimination & High-Density UI
│   │   ├── multi-objective-refactoring.md # Pareto Refactoring, Zero Performance Regression & Net Engineering Value
│   │   ├── empirical-verification-and-evidence-hierarchy.md # 5-Level Proof Hierarchy, Adjective Ban & Adversarial Audit
│   │   └── existing-asset-discovery-and-reuse.md # 4-Tier Discovery Hierarchy, Zero-Redundancy & Grep Patterns
│   │
│   ├── csharp/                        # C# .NET & Godot Standards (7 Standards)
│   │   ├── high-performance-compute.md # Span<T>, NativeMemory, SIMD Vector256/512 & Zero-Alloc Allocations
│   │   ├── godot-game-standards.md    # Godot 4 & C# Standards (Zero-Alloc, Signal Hygiene, Node Lifecycle)
│   │   ├── webapi.md                  # Web API Standards (Clean Architecture, DI, DTO Localization)
│   │   ├── winforms.md                # WinForms Standards (BaseForm, RunAfterShown, No BindingSource)
│   │   ├── winforms-ui.md             # WinForms & DevExpress UI Standards (Skinning, High-Density GridControl)
│   │   ├── wpf-ui.md                  # WPF UI & Fluent Design Tokens (Dark/Light Themes, Compact Density)
│   │   └── wpf.md                     # WPF Desktop MVVM Standards (Virtualization, WeakEvent, Dispatcher)
│   │
│   ├── python/                        # Python 3.10+ & AI Workflow Standards (4 Standards)
│   │   ├── ai-agent-orchestration.md  # Deterministic State Graphs, Cycle Limits & Safe Tool Calling
│   │   ├── code-quality-typing.md     # Strict Typing (mypy --strict), Pydantic v2 & Ruff Governance
│   │   ├── fastapi-async-web.md       # FastAPI Lifespan, Non-Blocking DI & SSE Token Streaming
│   │   └── performance-async.md       # Asyncio Event-Loop Discipline, TaskGroup & ProcessPool Offloading
│   │
│   ├── rust/                          # Rust Systems Standards (3 Standards)
│   │   ├── memory-performance.md      # Zero-Alloc Hot Loops, 64B Cacheline Alignment, SIMD & FrameBufferPool
│   │   ├── safety-error-handling.md   # Zero-Panic Invariant, Explicit Result, Safe RAII & C-FFI Guardrails
│   │   └── toolchain-quality.md       # Micro-Crate Architecture, Clippy -D warnings, rustfmt & Headless Mocks
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
│   ├── embedded/                      # Embedded & RTOS Firmware Standards (1 Standard)
│   │   └── firmware-engineering.md    # Linker Auto-Init, Multi-Tier Memory Hub, Priority Hooks & Stack Canaries
│   │
│   ├── nodejs/                        # Node.js Standards (3 Standards)
│   │   ├── architecture.md            # Handler-Dispatcher, Clean Layer Separation & Graceful Drain
│   │   ├── event-loop-streams.md      # Non-Blocking Event Loop, stream.pipeline & Worker Offload
│   │   └── security-middleware.md     # Rate Limiting, Helmet CSP, SSRF Defense & Input Sanitization
│   │
│   ├── react/                         # React & Web UI Standards (4 Standards)
│   │   ├── component-lifecycle.md     # Functional Components, AbortController Cleanup & Error Boundaries
│   │   ├── performance.md             # Row Virtualization, useTransition & Referential Stability
│   │   ├── react-ui.md                # React & Tailwind High-Density Tables, Layouts & Anti-Slop Restraint
│   │   └── state-management.md        # TanStack Query Server Cache, Zustand Selectors & URL State
│   │
│   ├── golang/                        # Go Standards (3 Standards)
│   │   ├── concurrency.md             # Bounded Worker Pools, errgroup.WithContext & Channel Ownership
│   │   ├── error-observability.md     # Error Wrapping (%w), Sentinel Taxonomy & Zero-Alloc slog
│   │   └── memory-allocation.md       # Escape Analysis, sync.Pool Safety & 3-Index Slice Capacity Guard
│   │
│   ├── php/                           # PHP 8.2+ Standards (3 Standards)
│   │   ├── database-transactions.md   # PDO Explicit Transactions, FOR UPDATE Locks & Deadlock Retry
│   │   ├── memory-generators.md       # Unbuffered Streaming Yield Generators & Worker GC Hygiene
│   │   └── modern-syntax.md           # strict_types=1, Readonly Classes, Backed Enums & Value Objects
│   │
│   ├── database/                      # Universal & SQL Server Standards (5 Standards)
│   │   ├── sqlserver-2012-optimization.md # SARGability, Type Alignment, #Temp vs @Table & Parameter Sniffing
│   │   ├── execution-plan-diagnosis.md # Plan Inspection, Red Flags, Key Lookups, Spills & Join Analysis
│   │   ├── indexing-optimization.md   # Composite Key Order, Covering INCLUDE, Filtered Indexes & Fragmentation
│   │   ├── concurrency-deadlocks.md   # Lock Ordering, UPDLOCK/ROWLOCK, ROWVERSION & RCSI Isolation
│   │   └── bulk-audit.md              # TVP/SqlBulkCopy Batching, OUTPUT Audit Capture & Outbox Journaling
│   │
│   └── erp/                           # Enterprise ERP Domain Standards (4 Standards)
│       ├── inventory-invariants.md    # Warehouse Ledger Immutability, Row Locking & Zero Negative Stock
│       ├── production-lot-traceability.md # Bidirectional Lot/Serial Traceability & Stage Transition Gates
│       ├── sales-packing-journal.md   # Price Calculation Engine Decoupling, Packing Log (NKDG) & Journaling
│       └── rbac-permission-matrix.md  # Two-Tier Permission: Feature-Action Flags & Row-Level Security (RLS)
│
├── skills/                            # Layer 3: Actionable Skills & Sovereign Packages (96 Files: 72 Cluster Skills + 13 SKILL.md + 11 Package Refs)
│   ├── agentic/                       # Agentic Methodology & Autonomous Superpowers (13 Skills)
│   │   ├── action-first-cognitive-ux.md     # Action-First UX Protocol (ADHD-aware, Zero Preamble, Micro-Actions)
│   │   ├── agent-skill-router-protocol.md   # Deterministic Skill Routing, Tool-Index SSoT & Self-Supervision
│   │   ├── blast-radius-analysis.md         # Pre-Edit Blast-Radius Grep Analysis for Shared Classes & APIs
│   │   ├── clean-room-ip-and-governance.md  # Clean-Room IP Protocol, GNU Compliance & Hardware Verification
│   │   ├── input-normalization-pipeline.md  # Ingestion Pipeline & Structured Micro-Payload Normalization
│   │   ├── lazy-minimalism-protocol.md      # Ponytail Decision Ladder (YAGNI, Shortest Working Diff, Stdlib First)
│   │   ├── self-consistency-consensus.md    # 3-Pass Consensus with Early Stopping & Divergence Detection
│   │   ├── brainstorming-and-spec.md        # Grilling Protocol (Design Tree, Frontier Rounds) & Executable Spec
│   │   ├── test-driven-development.md       # Red-Green at Pre-Agreed Seams, Tracer-Bullet Slices, Boundary Mocks
│   │   ├── adversarial-code-review.md       # Two-Axis Review (Standards + Fowler Smells, Spec) & Anti-Slop Lint
│   │   ├── systematic-debugging.md          # Feedback-Loop Construction Reference for bugfix-investigation
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
│   ├── python/                        # Python 3.10+ & AI Engineering Skills (3 Skills)
│   │   ├── async-taskgroup-orchestration.md # Structured TaskGroup Concurrency, Semaphores & Executor Offloading
│   │   ├── pydantic-v2-boundary-validation.md # TypeAdapter Zero-Overhead Validation & Discriminated Unions
│   │   └── structured-llm-tool-calling.md   # Deterministic State-Machine Agent Loops & SSE Token Streaming
│   │
│   ├── rust/                          # Rust Systems & Low-Latency Skills (3 Skills)
│   │   ├── zero-copy-arena-lifetimes.md     # Bump Arena Allocation, Zero-Copy Slices & Cacheline Ring Buffers
│   │   ├── typestate-error-taxonomy.md      # Compile-Time Typestate Machines & Zero-Panic Result Taxonomy
│   │   └── ffi-panic-boundary-guard.md      # catch_unwind C-ABI Barriers & Opaque Pointer Handles
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
│   ├── reversing/                     # Deep Reverse Engineering & Binary Analysis (7 Skills)
│   │   ├── dynamic-instrumentation-analysis.md # Frida Runtime Hooking, API Monitoring, SSL Pinning & JNI
│   │   ├── binary-deobfuscation-and-recovery.md # OLLVM De-flattening, Symbolic Execution (angr) & String Recovery
│   │   ├── malware-triage-and-unpacking.md # Defensive Sandbox Triage, OEP Detection & Scylla IAT Rebuilding
│   │   ├── cryptographic-primitive-reversing.md # Magic Constant & S-Box Detection, Runtime Key/IV Extraction
│   │   ├── protocol-and-wire-format-analysis.md # Proprietary Binary Frame Reversing & Wireshark Lua Dissectors
│   │   ├── il2cpp-and-managed-runtime-recovery.md # Unity IL2CPP Metadata Dumps & C# Dummy Assembly Synthesis
│   │   └── firmware-extraction-and-hardware-audit.md # Binwalk Filesystem Extraction, Base Mapping & U-Boot Audit
│   │
│   ├── pentest/                       # Application Security & Defensive Penetration Testing (7 Skills)
│   │   ├── attack-surface-mapping-and-recon.md # Passive/Active Perimeter Discovery & Secret Leak Auditing
│   │   ├── api-security-and-auth-auditing.md # OWASP API Top 10: BOLA/IDOR, BFLA & JWT Algorithm Verification
│   │   ├── injection-defense-and-input-fuzzing.md # Non-Destructive SQLi/SSRF/SSTI/Command Injection Verification
│   │   ├── concurrency-and-race-condition-audit.md # TOCTOU Flaws, HTTP/2 Single-Packet Burst & Row Locking
│   │   ├── cloud-container-hardening-audit.md # Docker Socket Breakouts, Capabilities & Kubernetes RBAC Auditing
│   │   ├── fuzzing-harness-and-asan-triage.md # LibFuzzer/AFL++ In-Memory Harnesses & ASAN Memory Crash Triage
│   │   └── vulnerability-triaging-and-remediation.md # CVSS v3.1/v4.0 Scoring, CWE Mapping & Code Remediation Diffs
│   │
│   ├── embedded/                      # Embedded & Bare-Metal RTOS Skills (1 Skill)
│   │   └── bare-metal-rtos-hooking.md # Non-Disruptive RTOS Hooking, EDMAC DMA & Dynamic .mo
│   │
│   ├── database/                      # Database & SQL Server Optimization (3 Skills)
│   │   ├── sqlserver-query-tuning.md  # 5-Step Query Diagnosis, SARGability, Parameter Sniffing & Rewriting
│   │   ├── sqlserver-index-advisor.md # Covering Index Design, Filtered Indexes & DMV Health Scripts
│   │   └── sqlserver-plan-inspection.md # Execution Plan Analysis, XML Indicators & Plan Regression Compare
│   │
│   ├── ui-design-system/              # Sovereign Enterprise Multi-Platform UI Design System Package
│   │   ├── SKILL.md                   # Universal UI Design System Orchestrator (UIDESIGN)
│   │   └── references/                # Progressive Sub-Reference Specifications (3 Files)
│   │       ├── tokens.md              # 5-Tier Token Matrix across Desktop, Web, and Mobile (UI_TOKENS)
│   │       ├── components.md          # Cross-Platform Component Specifications & Ergonomics (UI_COMPONENTS)
│   │       └── platform-mapping.md    # Implementation Mapping for WinForms, WPF, Web & Mobile (UI_PLATFORM)
│   │
│   ├── feature-implementation/        # Sovereign Feature Development Workflow Package
│   │   ├── SKILL.md                   # End-to-End Feature Workflow: Grilling, Tracer-Bullet Slices, TDD at Seams (WF_FEAT)
│   │   └── references/layers-and-slicing.md # Pre-mortem prompts, layer contract, slice rules & expand-contract
│   ├── bugfix-investigation/          # Sovereign Bugfix Workflow Package
│   │   ├── SKILL.md                   # Gated Diagnosis: Tight Loop, Minimise, Hypotheses, Correct-Seam Fix (WF_BUG)
│   │   └── references/                # hypothesis-and-instrumentation.md, fix-patterns.md
│   ├── code-refactoring/              # Sovereign Code Refactoring Workflow Package
│   │   └── SKILL.md                   # Zero-Regression Refactoring, Deletion Test & Expand-Contract (WF_REF)
│   ├── cognitive-experiment-loop/     # Sovereign Cognitive Loop Workflow Package
│   │   └── SKILL.md                   # 5-Phase Empirical Cognitive Loop & Comparative Delta Evaluation (WF_COG)
│   ├── dotnet-publish-release/        # Sovereign .NET Publish & Release Package
│   │   └── SKILL.md                   # .NET Lite Single-File Framework-Dependent Publish (WF_PUB)
│   ├── project-bootstrap-doctor/      # Sovereign Project Doctor Package
│   │   └── SKILL.md                   # Project Onboarding & Compliance Health-Check Audit (WF_DOC)
│   ├── continuous-learning-harvest/   # Sovereign Continuous Learning Package
│   │   └── SKILL.md                   # Automated Pre-Fetch & Post-Harvest Memory Loop (WF_MEM)
│   ├── multi-agent-teamwork/          # Sovereign Multi-Agent Teamwork Orchestration Package
│   │   └── SKILL.md                   # Zero-Collision Subagent Partitioning & Adversarial Gates (WF_TEAM)
│   ├── writing-for-agents/            # Sovereign Agent-Doc Authoring Package
│   │   ├── SKILL.md                   # Context Pointers, Hierarchy, Completion Criteria, Positive-First (WF_WRITING_AGENTS)
│   │   └── references/skill-mechanics.md # AgentOption frontmatter, validator, registries & sync-skills mechanics
│   ├── codebase-design/               # Sovereign Deep-Module Design Package
│   │   ├── SKILL.md                   # Module/Interface/Seam/Adapter Vocabulary & Deletion Test (WF_CODEBASE_DESIGN)
│   │   └── references/                # deepening.md, design-it-twice.md
│   ├── domain-modeling/               # Sovereign Domain Language Package
│   │   ├── SKILL.md                   # Glossary Challenge, Scenario Stress-Tests & ADR Gate (WF_DOMAIN_MODEL)
│   │   └── references/                # glossary-format.md, adr-format.md
│   └── retro/                         # Sovereign Retrospective Package
│       └── SKILL.md                   # Post-Session Agent Environment Improvement Ranking (WF_RETRO)
│
├── tools/                             # Layer 4: Automated Verification & Agent CLI Tools (9 Tools + 1 Core Lib)
│   ├── lib/
│   │   └── framework-core.js          # Shared SSoT Registry Loader, YAML Frontmatter Parser & Scoped Walker
│   ├── validate-framework.js          # Self-Linter validating YAML frontmatter, rules, shortcuts & bindings
│   ├── anti-slop-lint.js              # Diff-scoped anti-slop linter (AS-xx rules, profiles) & token contrast audit
│   ├── lookup.js                      # Sub-50ms Fast Query CLI across Blueprints, Standards, Skills & Agents
│   ├── doctor.js                      # Project Health-Check verifying .project-rule.md rules, shortcuts & paths
│   ├── brain.js                       # Portable SemanticBrain Bridge CLI (PRE-Fetch, Route & POST-Harvest)
│   ├── bin-triage.js                  # Binary Static Profiling, Shannon Entropy & Magic Byte Detection
│   ├── cvss.js                        # Deterministic CVSS v3.1 Calculator & CWE Taxonomy Mapping
│   ├── scope-guard.js                 # Pre-Flight Scope Authorization Gate & Contract Expiration Validator
│   └── export-agents.js               # Multi-Tool Agent Exporter & Global Antigravity Skill Synchronizer
│
├── tests/                             # Automated Tooling Verification Suite
│   ├── tools.test.js                  # Node.js Built-in Test Runner Suite for CLI Tools & Security Guards
│   ├── anti-slop-lint.test.js         # Anti-slop linter suite (one fixture per AS rule, profiles, token audit)
│   └── fixtures/anti-slop/            # slop/ and clean/ fixtures plus valid/invalid token sheets
│
└── templates/                         # Layer 5: Rapid Bootstrapping & Extension Templates (7 Templates)
    ├── project-bootstrap-template.md  # Template to bind ANY external project to AgentOption
    ├── standard-template.md           # Template for authoring new Language Standards
    ├── skill-template.md              # Template for authoring new Actionable Skills
    ├── workflow-template.md           # Template for multi-step Sovereign SKILL.md Workflows
    ├── agent-template.md              # Template for authoring structured Agent Personas
    ├── research-memory-template.json  # Starter JSON Schema for .research-memory.json
    └── scope-contract-template.json   # Template for Pre-Flight Security Scope Authorization Contract
```

---

## 🏛️ Layer Responsibilities & Architectural Invariants

| Layer | Directory | Invariant & Governance |
| :--- | :--- | :--- |
| **Layer 0: Agents** | `agents/` | Specialized AI personas (13 agents) bound to mandatory standards, rules, and toolchains across Engineering, Governance, and ERP domains. Every agent requires a shortcut in `shortcuts.json` and 100% valid `rules`/`shortcuts` bindings. |
| **Layer 1: Blueprints** | `architecture/` | Macro-level system designs (24 blueprints). Must define domain boundaries, data sovereignty, and anti-corruption layers. Every blueprint requires a registered shortcut in `shortcuts.json`. |
| **Layer 2: Standards** | `standards/` | Concrete technical rules and code guidelines (65 standards across 13 stacks/domains). Every standard must link to at least one machine rule in `rules.json` and a shortcut in `shortcuts.json`. |
| **Layer 3: Skills & Workflows** | `skills/` | Practical implementation recipes and sovereign packages (72 cluster skills across 13 clusters + 13 sovereign `SKILL.md` packages + 11 package reference specs = 96 files). Sovereign `SKILL.md` packages sync directly to `.gemini/config/skills/`. |
| **Layer 4: Tools** | `tools/` | Automated verification CLIs and agent accelerator tools backed by `tools/lib/framework-core.js`, ensuring zero-redundancy parsing, fast retrieval, and compliance auditing. |
| **Layer 5: Templates** | `templates/` | Rapid scaffolding baselines for onboarding new projects or extending standards, skills, workflows, and agent personas without starting from scratch. |
| **Layer 6: Docs** | `docs/` | Deep-dive structural references, hierarchy maps, cross-framework studies, human-facing anti-slop rationale, ADRs, and governance records (change bar, out-of-scope). |


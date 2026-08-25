# 🗂️ AgentOption — Universal Enterprise Framework for AI-Assisted Engineering

**AgentOption** is a universal, language-agnostic engineering framework and knowledge baseline designed to be plugged into **ANY software project** (Web, Desktop, Mobile, Distributed Microservices). It provides AI agents and engineering teams with high-precision architectural blueprints, standardized coding rules, and advanced, reusable implementation skills.

---

## 🏛️ Framework Hierarchy

```text
E:\16. AgentOption/
├── README.md                          # Central Documentation & Framework Index
├── rules.json                         # Universal Machine-Readable Rule Registry (R_*)
│
├── architecture/                      # Layer 1: High-Level Architectural Blueprints
│   ├── clean-layered-architecture.md  # 4-Tier Clean Architecture (Domain, Application, Infra, Presentation)
│   ├── folder-per-feature.md          # Folder-per-Feature Architecture & DTO Localization
│   ├── hybrid-dual-scope-execution.md # Hybrid Desktop & WebAPI Dual-Scope Service Execution
│   ├── universe-plugin.md             # Universe Plugin Architecture v4.0 (Micro-kernel, Data Sovereignty)
│   ├── event-driven-architecture.md   # Event-Driven Systems, Outbox Pattern, Saga Orchestration
│   ├── resilience-patterns.md         # Circuit Breaker, Exponential Backoff, Fallback Cache
│   ├── micro-frontends.md             # Micro-Frontend Module Federation & Runtime Assembly
│   ├── multi-tenancy.md               # Multi-Tenant Data Isolation (RLS, Schema-per-tenant, DB-per-tenant)
│   └── tiled-data-pipeline.md         # High-Throughput Tiled Data Pipeline & Bounded Memory Pools
│
├── standards/                         # Layer 2: Modular Language & Engineering Standards
│   ├── universal/                     # Universal Engineering Standards
│   │   ├── agent-meta.md              # Meta-Rules, Symbol Decoding, Commit Gate
│   │   ├── working-memory-state.md    # Working Memory & Execution State Invariants
│   │   ├── naming-conventions.md      # Multi-Language Naming Rules
│   │   ├── performance-guidelines.md  # Memory, Anti-N+1 & Async Concurrency
│   │   └── conformance-testing.md     # Module Isolation & Conformance Tests
│   ├── csharp/                        # C# .NET Standards (WinForms, WebAPI, WPF, DarkTheme, HighPerf)
│   │   └── high-performance-compute.md # Span<T>, NativeMemory, SIMD Vector256/512, Zero-Alloc
│   ├── cpp/                           # C++ Standards (Native Interop, C-ABI Export, LibraryImport)
│   │   └── native-interop.md          # C-ABI DLL Export, Zero-Copy Shared Memory, OpenMP
│   ├── nodejs/                        # Node.js Standards (Architecture, Streams, Security)
│   ├── react/                         # React Standards (Lifecycle, State, Performance)
│   ├── golang/                        # Go Standards (Concurrency, Memory, Slog)
│   ├── php/                           # PHP 8.2+ Standards (Syntax, Transactions, Generators)
│   └── database/                      # Universal SQL Standards (Indexing, Deadlocks, Audit)
│
├── skills/                            # Layer 3: Actionable, Reusable Skills & Design Patterns
│   ├── agentic/                       # Agentic Methodology Skills (inspired by obra/superpowers)
│   │   ├── brainstorming-and-spec.md        # Pre-coding Exploration, Ambiguity Resolution & Spec
│   │   ├── test-driven-development.md       # Red-Green-Refactor Protocol for AI Coding Agents
│   │   ├── adversarial-code-review.md       # Self-Critique & Security/Edge-Case Audit
│   │   ├── systematic-debugging.md          # 5-Step Scientific Hypothesis Debugging
│   │   ├── execution-state-tracking.md      # Working Memory & Execution State Protocol
│   │   └── continuous-learning-protocol.md  # PRE-Fetch Context & POST-Harvest Semantic Memory
│   ├── nodejs/                        # Node.js Enterprise Skills (inspired by ASK SDK v2)
│   │   ├── handler-dispatcher-pattern.md    # canHandle/handle Dispatcher Architecture
│   │   ├── interceptor-pipeline.md          # Request & Response Interceptors Pipeline
│   │   ├── error-boundary-handler.md        # Predicate-based Centralized Error Handling
│   │   ├── persistence-adapter-pattern.md   # Storage & State Persistence Adapters
│   │   ├── scoped-attributes-manager.md     # 3-Tier Scoped State (Request, Session, Persistent)
│   │   ├── fluent-response-builder.md       # Fluent API Response Payload Builder
│   │   ├── service-client-factory.md        # Authenticated API Delegation Client Factory
│   │   └── skill-builder-pattern.md         # Fluent Module/App Builder Composition
│   ├── react/                         # React Enterprise Skills
│   │   ├── abortable-fetch-lifecycle.md     # AbortController Lifecycle & Race Prevention
│   │   ├── compound-components-pattern.md   # Context-Driven Compound Components
│   │   └── optimistic-ui-updates.md         # Instantaneous Mutations & Automated Rollback
│   └── csharp/                        # C# .NET Enterprise Skills
│       ├── baseform-lifecycle-orchestration.md # RunAfterShown & Explicit 1-Way Data Binding
│       ├── hybrid-dbscope-pattern.md           # Hybrid DbScope for WinForms & WebAPI Execution
│       ├── feature-partial-partitioning.md     # 1-to-1 Partial Class Partitioning (Action/Query/Lookup)
│       ├── cancellation-token-propagation.md   # End-to-End Task Cancellation Flow
│       ├── dapper-bulk-data-access.md          # Multi-Mapping & High-Throughput Bulk Operations
│       └── zero-copy-interop.md                # Zero-Copy C# & C++ Pointer Interoperability
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

## ⚡ How to Integrate into ANY Project (Portable Resolution)

To enable AI agents to automatically apply `AgentOption` standards to any project across different workstations, add `.project-rule.md` to the project root:

```yaml
---
project_name: <project_id>
domain: <domain_name>
primary_language: <nodejs | react | csharp | go | php>
architecture: <clean_architecture | universe_plugin | winforms_erp>
framework_references:
  agent_option_root: "[AgentOption]"      # Automatically resolved by Agents
  rules: ["R_CORE", "R_NODE", "R_REACT"]
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

# 2. Check health of a target repository:
node [AgentOption]/tools/doctor.js <path-to-target-repo>

# 3. Validate integrity of AgentOption framework itself:
node [AgentOption]/tools/validate-framework.js
```

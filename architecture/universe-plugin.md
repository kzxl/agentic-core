---
name: UniverseArchitecturePlugin
desc: Universe Architecture v4.0 — Micro-kernel, modular plugin, and data sovereignty blueprint
rules: [R_UNIVERSE, R_CORE]
category: Architecture
---
# 🌌 Universe Plugin Architecture v4.0

**Philosophy:** Systems expand indefinitely. Adding new features must never break the fundamental laws of the existing architecture.

```
+-------------------------------------------------------------+
| Physical Laws (Core Interfaces)    -> Invariant, universal   |
| Spacetime (Infrastructure)         -> DI, Logging, EventBus  |
| Galaxies (Domain Feature Groups)   -> Autonomous & isolated  |
| Stars (Individual Features)        -> Self-contained modules |
| Black Holes (God Classes)          -> FORBIDDEN anti-pattern |
+-------------------------------------------------------------+
```

---

## 1. The 8 Core Principles

1. **Core Stable, Modules Volatile:** Core interfaces rarely change. Modules are added, modified, or removed freely.
2. **Module Independence:** `Module -> Core/Shared` (Allowed) | `Module -> Module` (FORBIDDEN, extract to Core/EventBus).
3. **Contract-First:** Interface-driven boundaries (metadata, lifecycle, UI factory).
4. **Self-Registration:** Modules auto-register via assembly scanning or decorators (no hardcoded module lists).
5. **Indirect Communication:** In-memory EventBus / Mediator for cross-module event notifications.
6. **Data Sovereignty:** Module A never directly queries tables owned by Module B. Must invoke `IServiceB`.
7. **Middleware as Gravitational Pipeline:** Cross-cutting concerns (Auth, Correlation IDs, GZip, Error Boundaries) run in pipeline.
8. **Progressive Migration:** Monolith (Level 1) &rarr; In-Memory EventBus (Level 2) &rarr; Distributed Broker (Level 3) without rewriting domain logic.

---

## 2. Platform Mapping

### A. Desktop (C# WinForms / WPF)
- **Base Components:** `BaseForm` + `RunAfterShown` in constructor (STRICTLY NO `Form_Load`).
- **Data Binding:** Explicit 1-way mapping (`PopulateControls` / `CollectData`). NO `BindingSource`.
- **View:** UI state and validation only. No direct DB helpers or file I/O.
- **Controller:** Thin pass-through. No business logic or complex data shaping.
- **Service:** Business logic, transactions, and data access.

### B. ASP.NET Web API & ASP.NET Core
```csharp
public interface IFeatureModule 
{
    string Name { get; }
    void RegisterServices(IServiceCollection services);
    void MapRoutes(WebApplication app);
}

// Module registration: 1 line
builder.Services.AddFeatureModule<SalesModule>();
```

### C. React + Node.js
- Frontend: Feature plugins declaring `{ id, path, component, navSection }`.
- Backend: Auto-mount route handlers via filesystem discovery or ModuleBuilder.

---

## 3. Package Layering Strategy

```text
┌─────────────────────────────────────────────────┐
│          Universe.Distributed (Opt-in)          │  ← Microservices & gRPC Mesh
├─────────────────────────────────────────────────┤
│          Universe.Plugins (Opt-in)              │  ← Hot-Reload DLLs only
├─────────────────────────────────────────────────┤
│          Universe.Workflows (Opt-in)            │  ← Long-running Sagas
├─────────────────────────────────────────────────┤
│          Universe.Core (Mandatory)              │  ← All projects
│  IModule · ModuleRegistry · In-Memory EventBus  │
│  Middleware Pipeline · Lifecycle Hooks          │
└─────────────────────────────────────────────────┘
```

---

## 4. Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Architectural Solution |
| :--- | :--- |
| **Module A imports Module B directly** | Decouple via In-Memory EventBus / Domain Events |
| **God Controller (1000+ lines)** | Partition into 1 Controller per feature + partial classes |
| **Service A queries Service B's database tables** | Inject `IServiceB` contract or domain DTO |
| **Raw SQL / DataTable in UI Views** | Delegate to Service Layer returning strongly-typed DTOs |
| **Destructive Cross-Feature Mutations** | Implement Transactional Outbox or Saga Compensation |

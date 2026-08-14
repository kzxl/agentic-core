---
name: HybridDualScopeExecutionArchitecture
desc: Hybrid DbScope pattern enabling the same core business service layer to run seamlessly across both Desktop clients and Web API
rules: [R_CORE, R_API, R_CS]
category: Architecture
---
# 🔄 Hybrid Dual-Scope Execution Architecture (Desktop & Web API)

**Goal:** Share 100% of the core domain and business logic service layer across both Desktop Client (WinForms/WPF) and Web API (ASP.NET / REST) without connection pool exhaustion on desktop or lifecycle conflicts on web.

---

## 1. The Dual-Execution Challenge

| Execution Context | Connection Lifecycle Need | Pitfall if Misconfigured |
| :--- | :--- | :--- |
| **Desktop Client (WinForms/WPF)** | Short-lived, per-method connection. Opened on demand, closed immediately. | Long-lived DbContext in client DI holds DB connection forever, exhausting database pool. |
| **Web API (ASP.NET Core / Web API 2)** | Per-request scoped connection. Shared across all services within 1 HTTP request. | Creating new DbContext per method breaks transaction boundaries and causes concurrency collisions. |

---

## 2. The Solution: Dual-Constructor & `DbScope` Struct

```
[Service Call Invocation]
           |
           v
   [using (var scope = new DbScope(_injectedDb))]
           |
           +---> If _injectedDb is NULL (Desktop WinForms):
           |     -> Creates fresh short-lived DbContext: AppDbContext.New()
           |     -> Disposes and closes connection immediately at the end of using block.
           |
           +---> If _injectedDb is NOT NULL (Web API):
                 -> Reuses existing per-request DbContext.
                 -> Leaves disposal to the Web API DI Container at HTTP request completion.
```

---

## 3. Benefits
1. **Single Source of Truth:** Business validation and database workflows are coded ONCE in `Application.Core` and shared by both GUI desktop and REST microservices.
2. **Zero Desktop Leakage:** Desktop clients never exhaust database connection pools.
3. **Transactional Integrity on Web:** Web APIs preserve single-transaction unit-of-work per request.

---
name: codebase-design-deepening
description: Dependency categories and seam discipline for deepening shallow modules. Read when a deepening candidate touches SQL Server, the file system, HTTP or gRPC services, message queues, OPC UA or COM devices, or third-party SDKs, and you must decide where the port goes and how to test across it.
desc: Dependency categories mapped to .NET and Node, seam discipline, and replace-don't-layer testing
rules: [R_CORE, R_TDD, R_UNIVERSE]
---

# Deepening

How to deepen a cluster of shallow modules given its dependencies. Vocabulary (module, interface, seam, adapter) is defined in [../SKILL.md](../SKILL.md).

## 1. Dependency Categories

Classify every dependency of the candidate. The category decides the test strategy and whether a port exists at the external interface.

| # | Category | .NET / AgentOption examples | Node / React examples | Strategy |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **In-process** | Pricing rules, unit conversion, stock allocation math, DTO mapping | Pure reducers, validators, formatters | Merge the modules; test the new interface directly. No adapter. |
| 2 | **Local-substitutable** | SQL Server via LocalDB or a disposable test database, `System.IO.Abstractions` in-memory file system, `TimeProvider` with `FakeTimeProvider` | SQLite in-memory, `memfs`, fake timers | Run the stand-in inside the test suite. The seam stays internal; no port on the external interface. |
| 3 | **Remote but owned** | Your own Web API, internal gRPC service, MES/ERP integration you control, queue consumer | Your own REST backend from a React app | Define a **port** at the seam. Production adapter = HTTP/gRPC/queue client; test adapter = in-memory implementation. Logic stays in one deep module. |
| 4 | **True external** | Payment gateway, SMS provider, vendor OPC UA server, licensed COM SDK | Third-party SaaS API | Inject the port; tests supply a mock or fake adapter. Prefer SDK-style members (`GetCustomerAsync`, `CreateOrderAsync`) over a generic `SendAsync(endpoint)` so each fake returns one shape. |

Recommendation shape for category 3: "Define a port at the seam, implement an HTTP adapter for production and an in-memory adapter for tests, so the logic lives in one deep module even though it is deployed across a network."

## 2. Seam Discipline

- **Two adapters or no port.** A port needs at least two justified adapters (production + test fake counts). A one-adapter port is indirection: inline it (guardrail `AS-C4`).
- **Internal vs external seams.** Internal seams serve the module's own tests and stay private (`internal` + `InternalsVisibleTo` for the test assembly, or module-private Node exports). Expose only the external seam.
- **Data sovereignty.** A module reaches another module's tables only through that module's contract (`R_UNIVERSE`). That contract is a category 3 seam even inside one process when the modules are separately deployable.
- **Transactions stay inside.** When a deepened service owns a transaction (`UPDLOCK, ROWLOCK` lock ordering, outbox write), the transaction boundary is part of its implementation; callers never pass open connections across the seam unless the hybrid scope pattern requires it (`[AgentOption]/skills/csharp/hybrid-dbscope-pattern.md`).

## 3. Testing Strategy: Replace, Don't Layer

1. Write tests at the deepened module's interface first; they assert observable outcomes (returned values, persisted rows read back through the interface, emitted events), never internal state.
2. Delete the old unit tests on the shallow modules the new tests supersede. Keeping both doubles maintenance and pins the old shape.
3. A test that must change when only the implementation changes is testing past the interface; move it to the interface or delete it.

Completion criterion: every behaviour previously covered by a deleted test is covered by an interface-level test, and the suite exits 0.

## 4. Deepening Checklist

- [ ] Every dependency has a category from §1.
- [ ] Every port has two named adapters.
- [ ] No internal seam appears in the public interface.
- [ ] Superseded shallow tests are deleted, not skipped.
- [ ] `rg` shows no remaining caller of a removed type.

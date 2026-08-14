---
name: CleanLayeredArchitecture
desc: Universal 4-tier Clean Architecture pattern (Domain, Application, Infrastructure, Presentation) for backend & enterprise services
rules: [R_CORE, R_API]
category: Architecture
---
# 🏛️ Universal Clean Layered Architecture Blueprint

**Goal:** Establish strict boundary isolation between business domain logic, application use cases, infrastructure adapters (DB, external APIs), and user interfaces/controllers.

```
+-------------------------------------------------------------+
|                      Presentation Layer                      |
|       (Controllers, API Routes, GraphQL, UI Views, CLI)      |
+-------------------------------------------------------------+
                              | (Depends on)
                              v
+-------------------------------------------------------------+
|                      Application Layer                       |
|         (Use Cases, Services, DTOs, Commands, Queries)       |
+-------------------------------------------------------------+
                              | (Depends on)
                              v
+-------------------------------------------------------------+
|                        Domain Layer                          |
|         (Entities, Value Objects, Domain Events, Enums)      |
+-------------------------------------------------------------+
                              ^
                              | (Implements interfaces of)
+-------------------------------------------------------------+
|                     Infrastructure Layer                     |
|    (Repositories, Database ORM, Caching, Message Queues)    |
+-------------------------------------------------------------+
```

---

## 1. Layer Responsibilities & Rules

### A. Domain Layer (The Core Heart)
- **Zero External Dependencies:** No imports of frameworks, ORM libraries, or HTTP abstractions.
- **Contents:** Pure Entities, Value Objects, Domain Exceptions, Domain Events.
- **Rule:** Domain invariants must be validated inside entities, not scattered across controllers.

### B. Application Layer (Orchestration & Use Cases)
- **Purpose:** Coordinates domain entities to fulfill application use cases.
- **Contents:** Feature Services, CQRS Handlers, Input/Output DTOs, Interface Contracts (e.g. `IUserRepository`, `IEmailService`).
- **Rule:** Contains 100% of business workflows. Never leaks database entities directly to presentations.

### C. Infrastructure Layer (Pluggable Adapters)
- **Purpose:** Implements contracts defined in Domain and Application layers.
- **Contents:** Database context (Mongoose/EF Core/Dapper/PDO), Redis cache client, External API gateways, File storage adapters.
- **Rule:** Changes to database engine (e.g. MongoDB &rarr; PostgreSQL) must ONLY affect this layer.

### D. Presentation Layer (Entrypoints & Delivery)
- **Purpose:** Handles external protocols (HTTP, WebSockets, gRPC, GUI forms).
- **Contents:** Controllers, Middlewares, Serializers, Route definitions.
- **Rule:** Extremely thin. Parses inputs, delegates immediately to Application Service, maps response.

---

## 2. Dependency Inversion Principle (DIP)
- High-level modules (Application) must NOT depend on low-level modules (Infrastructure). Both depend on abstractions (Interfaces).
- Dependency Injection (DI) wires implementations at runtime (e.g., Autofac, InversifyJS, NestJS, Go wire).

---

## 3. Checklist for Any Project
- [ ] No database query/SQL strings in Controller/Route files.
- [ ] DTOs localized per feature, not shared monolithically across unrelated domains.
- [ ] All external I/O operations wrapped in async interfaces with timeouts and cancellation signals.
- [ ] Errors translated to standard application domain error types at the boundary.

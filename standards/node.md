---
desc: Node.js (Express) REST API Standards
rules: [R_NODE]
---
# 🟢 Node.js (Express) REST API Standards

## 1. Architecture Layering
- **Pipeline:** `Routes` -> `Controller` -> `Service` -> `Database (MongoDB / Mongoose / SQL)`.
- **Controllers:** Thin layer responsible only for `req` parsing and `res` rendering. Catch errors and forward via `next(err)`.
- **Services:** Contain 100% of domain and business logic.
- **Skills Reference:** For complex routing and event pipelines, implement the Handler-Dispatcher pattern from `[AgentOption]/skills/nodejs/`.

## 2. Middleware Pipeline
- Aggregate cross-cutting concerns (JWT Authentication, RBAC Authorization, GZip Compression, Request Correlation IDs, Global Error Boundaries) into an execution pipeline.
- Global Error Handler enforces unified JSON schema: `{ success: false, error: { code, message, details } }`.

## 3. Database Best Practices (MongoDB / SQL)
- Prevent N+1 query bottlenecks: Utilize `.populate()`, aggregation pipelines, or explicit JOINs.
- Always index frequently queried fields (`createdAt`, `status`, foreign keys).

## 4. Event-Driven Architecture
- Emit Socket.IO events and domain events strictly from the **Service layer**, never directly inside Controllers.

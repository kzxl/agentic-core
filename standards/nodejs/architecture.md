---
desc: Node.js (Express / TypeScript) Layered Architecture & Routing Standards
rules: [R_NODE]
---
# 🟢 Node.js Layered Architecture

## 1. Pipeline & Layer Isolation
- **Pipeline:** `Routes` &rarr; `Validation (Zod/Joi)` &rarr; `Controller` &rarr; `Service` &rarr; `Data Access`.
- **Controllers:** Thin parsing & HTTP status mapping. Forward errors via `next(err)`.
- **Services:** 100% of domain logic and transaction orchestration.
- **Handler-Dispatcher:** For complex event routing, implement `skills/nodejs/handler-dispatcher-pattern.md`.

## 2. Event-Driven Messaging
- Emit Socket.IO and domain events strictly from the **Service layer**, never in Controllers.

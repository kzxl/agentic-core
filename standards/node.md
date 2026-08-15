---
desc: Node.js (Express / TypeScript) Enterprise Standards — High-Throughput & Stream Pipelines
rules: [R_NODE, R_RES, R_DB]
---
# 🟢 Node.js Enterprise Standards

## 1. Architecture Layering
- **Pipeline:** `Routes` &rarr; `Validation (Zod/Joi)` &rarr; `Controller` &rarr; `Service` &rarr; `Data Access (Mongoose / SQL)`.
- **Controllers:** Thin parsing & HTTP status mapping only. Forward errors via `next(err)`.
- **Services:** Contain 100% of domain and business logic.
- **Handler-Dispatcher:** For complex event/routing pipelines, implement `[AgentOption]/skills/nodejs/handler-dispatcher-pattern.md`.

## 2. Event Loop Safety & Stream Processing
- **Zero Sync I/O in Requests:** NEVER call `fs.readFileSync` or CPU-heavy loops inside request lifecycle.
- **Stream Large Payloads:** Use Node.js Streams (`stream.pipeline`) for export/import files > 5MB to cap RSS memory footprint.
- **CPU Offloading:** Offload heavy computations (Crypto hashing, image transformation) to `worker_threads`.

## 3. Middleware & Security Pipeline
- **Security Baseline:** Mandatory `helmet()`, CORS whitelist, and body size limits (`express.json({ limit: '1mb' })`).
- **NoSQL / SQL Injection Defense:** Sanitize query parameters (`mongo-sanitize`) and use parameterized ORM/ODM queries.
- **Unified Error Boundary:** Global error middleware returning uniform payload:
  `{ success: false, error: { code: string, message: string, details?: any } }`.

## 4. Graceful Shutdown & Lifecycle
- **Signal Trapping:** Trap `SIGTERM` and `SIGINT` to gracefully drain active HTTP requests and close DB pools:
  ```javascript
  const shutdown = async () => {
    server.close(() => process.exit(0));
    await db.disconnect();
  };
  process.on('SIGTERM', shutdown);
  ```

## 5. Event-Driven Architecture
- Emit Socket.IO and domain events strictly from the **Service layer**, never directly inside Controllers.


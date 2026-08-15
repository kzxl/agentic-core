---
desc: Node.js Security Baseline, Middleware Pipelines & Graceful Shutdown
rules: [R_NODE, R_RES]
---
# 🛡️ Node.js Security & Middleware Standards

## 1. Security Baseline
- **Mandatory Middlewares:** `helmet()`, CORS origin whitelist, `express.json({ limit: '1mb' })`.
- **Sanitization:** Sanitize query parameters (`mongo-sanitize`) against NoSQL/SQL injection.

## 2. Graceful Shutdown & Lifecycle
- Trap `SIGTERM` and `SIGINT` to drain active requests and disconnect DB pools cleanly:
  ```javascript
  const shutdown = async () => {
    server.close(() => process.exit(0));
    await db.disconnect();
  };
  process.on('SIGTERM', shutdown);
  ```

## 3. Unified Error Boundary
- Global error handler returning standard schema:
  `{ success: false, error: { code: string, message: string, details?: any } }`.

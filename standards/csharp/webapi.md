---
desc: C# WebAPI Enterprise Standards — Vertical Slice, Cancellation & High Throughput
rules: [R_API, R_CS, R_UNIVERSE, R_RES]
---
# 🌐 C# WebAPI Enterprise Standards

## 1. Controller & Payload Contracts
- **Base Controller:** `BaseApiController` returning standardized `ApiResponse<T>` / RFC 7807 `ProblemDetails`. Thin controller pattern: zero direct DB/Entity queries.
- **Status Codes:** `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable`, `429 Too Many Requests`.
- **Zero Entity Leakage:** Never expose database entities directly (`tb...`). Always use explicit Request/Response DTOs.

## 2. Async Cancellation & Detachment
- **CancellationToken:** Pass `CancellationToken ct = default` end-to-end (Controller &rarr; Service &rarr; DB).
- **ConfigureAwait(false):** Mandatory in Service and Repository layers to avoid synchronization context overhead.
- **ValueTask:** Use `ValueTask<T>` for cached hot paths to eliminate Task heap allocation.

## 3. Data Sovereignty & DI
- `Service A` NEVER queries entities of `Service B` (Inject `IServiceB` contract or domain events).
- Central Caching: Inject `ICacheService` (generate keys via `CacheKeyHelper.Generate(...)`).
- Database Access: Wrap all business logic operations in `using (var scope = new DbScope(_db))`.

## 4. API Security & OWASP Top 10 Hardening
- **Authentication:** Stateless JWT (`HMAC-SHA256`) via `Authorization: Bearer <Token>`. Resolve identity strictly from `Thread.CurrentPrincipal`.
- **Resource Ownership (Anti-IDOR):** Verify `resource.idCustomer == auth.CustomerId` or `resource.CreatedBy == auth.UserId` on every detail, update, delete, and download endpoint.
- **SQL Injection Defense:** 100% Parameterized queries via Dapper/EF. Whitelist dynamic `ORDER BY` columns.
- **Path Traversal Defense:** Canonical path verification (`Path.GetFullPath()`) and magic bytes header verification (block Windows PE `MZ` and Linux ELF executables).
- **Rate Limiting:** Protect authentication (10/15m), sensitive mutations (15/1m), and heavy queries (30/1m) with sliding window rate limiting.
- **Safe Error Response:** Global exception handling that sanitizes SQL errors, connection strings, and stack traces before returning client JSON.
- **Audit Trail:** Mandatory `ActionLogHelper.LogContact(...)` for all mutations (Create, Update, Delete, Approve, Revoke, Download, Auth). Never log passwords or secrets.

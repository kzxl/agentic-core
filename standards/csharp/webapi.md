---
desc: C# WebAPI Enterprise Standards — Vertical Slice, Cancellation & High Throughput
rules: [R_API, R_CS, R_UNIVERSE, R_RES]
---
# 🌐 C# WebAPI Enterprise Standards

## 1. Controller & Payload Contracts
- **Base Controller:** `BaseApiController` returning standardized `ApiResponse<T>` / RFC 7807 `ProblemDetails`.
- **Status Codes:** `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `422 Unprocessable`.

## 2. Async Cancellation & Detachment
- **CancellationToken:** Pass `CancellationToken ct = default` end-to-end (Controller &rarr; Service &rarr; DB).
- **ConfigureAwait(false):** Mandatory in Service and Repository layers to avoid synchronization context overhead.
- **ValueTask:** Use `ValueTask<T>` for cached hot paths to eliminate Task heap allocation.

## 3. Data Sovereignty & DI
- `Service A` NEVER queries entities of `Service B` (Inject `IServiceB` contract or domain events).
- Central Caching: Inject `ICacheService` (generate keys via `CacheKeyHelper.Generate(...)`).

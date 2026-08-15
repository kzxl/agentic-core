---
desc: C# WebAPI (.NET) Enterprise Standards — Advanced Architecture & High-Throughput APIs
rules: [R_API, R_CS, R_UNIVERSE, R_RES]
---
# 🌐 C# WebAPI Enterprise Standards

## 1. Architecture Layering & Contracts
- **Base Controller:** `BaseApiController` wrapping standardized `ApiResponse<T>` / RFC 7807 `ProblemDetails`.
- **Pipeline:** `Middleware` / `DelegatingHandler` for JWT Auth, CorrelationId, GZip, Global Exception Boundary, and Rate Limiting.
- **HTTP Status Codes:** `200 OK` (success), `201 Created` (with Location header), `400 Bad Request` (validation errors), `404 Not Found` (entity missing), `409 Conflict` (version concurrency conflict), `422 Unprocessable` (business rule violation).

## 2. Async Execution & CancellationToken Propagation
- **End-to-End Cancellation:** Pass `CancellationToken cancellationToken = default` from Controller &rarr; Service &rarr; Dapper/EF query.
- **Context Detachment:** Always use `.ConfigureAwait(false)` in Service, Repository, and Utility libraries to avoid synchronization context overhead.
- **ValueTask for Hot Paths:** Use `ValueTask<T>` for cached reads to eliminate Task heap allocation.

## 3. Data Sovereignty & DI
- Features own their data. `Service A` NEVER queries or includes entities from `Service B` (Inject `IServiceB` contract or publish domain events).
- **Autofac / MS DI Scanning:** Automatically resolves all classes ending in `*Service` as Scoped/Transient.
- **Central Caching:** Inject `ICacheService` (never raw `IMemoryCache`). Generate keys via `CacheKeyHelper.Generate(MODULE_NAME, methodName, params...)`.

## 4. Folder Layout (Vertical Slice)
```text
Features/Sales/Customer/
├── CustomerController.cs
├── Services/
│   ├── ICustomerService.cs
│   ├── CustomerService.cs
│   └── CustomerService.Action.cs (partial)
└── DTOs/
    ├── CustomerDto.cs
    └── CustomerSaveRequest.cs
```


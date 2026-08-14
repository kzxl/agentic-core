---
desc: C# WebAPI (.NET) Standards
rules: [R_API, R_CS, R_UNIVERSE]
---
# 🌐 C# WebAPI Standards

## 1. Architecture Layering
- **Base Controller:** `BaseApiController` wrapping standardized `ApiResponse<T>` output.
- **Pipeline:** `DelegatingHandler` / `Middleware` for JWT authentication, GZip compression, and Correlation IDs.

## 2. Data Sovereignty
- Features own their data. `Service A` NEVER queries or includes entities from `Service B` (Inject `IServiceB` instead).

## 3. Folder Layout (Vertical Slice)
```text
Features/Sales/Customer/
├── CustomerController.cs
├── Services/
│   ├── ICustomerService.cs
│   └── CustomerService.cs
└── DTOs/
    └── CustomerDto.cs
```

## 4. Dependency Injection & Caching
- **Autofac Scanning:** Automatically resolves all classes ending in `*Service`.
- **Central Caching:** Inject `ICacheService` (never direct `IMemoryCache`). Generate keys via `CacheKeyHelper.Generate(MODULE_NAME, methodName, params...)`.

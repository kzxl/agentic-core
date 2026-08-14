---
desc: [Language / Framework] Coding Standards
rules: [R_ID]
---
# 📘 [Language / Framework] Coding Standards

## 1. Architecture Layering & Structure
- **Pattern:** [e.g. Controller -> Service -> Repository]
- **Responsibilities:** [Clear boundaries of each layer]

## 2. Naming & Syntax Conventions
- **Files & Folders:** [e.g. kebab-case folders, PascalCase components]
- **Symbols:** [e.g. PascalCase classes/interfaces, camelCase variables/methods]
- **Async Naming:** [e.g. Async suffix on Tasks/Promises]

## 3. Error Handling & Safety
- **Exception Boundaries:** [Predicate-based error handlers or global middleware]
- **Logging & Auditing:** [Structured logging with correlation IDs]

## 4. Performance & Database Guidelines
- **Query Optimization:** [Avoiding N+1, proper indexing, parameterized queries]
- **Memory & Resource Cleanup:** [Dispose pattern, connection pooling, signal aborts]

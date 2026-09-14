---
title: Existing Asset Discovery & Zero-Redundancy Reuse Standard
desc: Pre-implementation capability survey, 4-tier asset discovery hierarchy, and grep recipes to eliminate duplicate helpers and reinvented wheels
rules: [R_CORE, R_REUSE, R_NEV]
category: Standards
---
# 📦 Existing Asset Discovery & Zero-Redundancy Reuse Standard

## 1. The Core Problem: LLM "Wheel Reinvention" Syndrome

When tasked with implementing a new feature or solving an algorithmic sub-problem (e.g., date-time formatting, string sanitization, JSON parsing, transactional database commands, or UI data extraction), **AI agents exhibit a destructive default bias: writing new inline code or generating a redundant helper from scratch**.

This behavior causes severe architectural degradation:
1. **DRY Principle Violation:** The codebase ends up with 4 different date formatters, 3 currency converters, and duplicate validation regexes scattered across unrelated files.
2. **Policy Bypass:** Bypassing the project's established wrappers (e.g., writing raw `new SqlConnection()` instead of using the repository's `DbScope` or `UnitOfWork`) circumvents mandatory telemetry, audit logging, circuit breakers, and connection pooling.
3. **Unnecessary Code Inflation:** Writing 15 lines of hand-rolled string manipulation where a single call to an existing extension method (`str.ToSafeSlug()`) already exists.

In the AgentOption framework, **writing redundant code when a project asset or standard library API already exists is treated as an immediate regression**.

---

## 2. The 4-Tier Asset Discovery Hierarchy

Before writing any new helper class, utility method, or plumbing algorithm, the agent must ascend the **4-Tier Discovery Hierarchy**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      THE 4-TIER ASSET DISCOVERY HIERARCHY                   │
├────┬──────────────────────────────────┬──────────────────────────────────────┤
│ T1 │ Existing Project Assets          │ Helpers, Extensions, Common/, Consts │
│ T2 │ Standard Library / Runtime       │ LINQ, stdlib, Built-in APIs          │
│ T3 │ Installed Framework Packages     │ Dapper, Lodash, AutoMapper, etc.     │
├────┴──────────────────────────────────┴──────────────────────────────────────┤
│ ⛔ WRITE-NEW THRESHOLD (PERMITTED ONLY WHEN TIERS 1–3 YIELD ZERO RESULTS)    │
├────┬──────────────────────────────────┬──────────────────────────────────────┤
│ T4 │ Minimalist New Implementation    │ Cohesive extension in existing home  │
└────┴──────────────────────────────────┴──────────────────────────────────────┘
```

### Tier 1: Existing Project Assets (Mandatory First Check)
- Survey the project's dedicated helper directories: `Helpers/`, `Extensions/`, `Utils/`, `Common/`, `Shared/`, `Constants/`.
- Check whether adjacent domain services or sibling classes already implement the desired routine.
- If a helper exists but lacks a specific parameter, **extend the existing helper** rather than creating a duplicate sibling file.

### Tier 2: Standard Library / Runtime Built-Ins
- Leverage native language primitives before writing custom logic:
  - C# .NET: LINQ (`Chunk`, `Zip`, `Select`), `MemoryExtensions`, `Path.Combine`, `Math.Clamp`.
  - Node.js / TS: `Array.prototype.flatMap`, `crypto.randomUUID`, `Intl.DateTimeFormat`, `structuredClone`.
  - Go: `slices`, `maps`, `strings.Builder`, `sync.Pool`.
- Never write hand-rolled array chunking, GUID generation, or string splitting when the runtime provides zero-allocation native methods.

### Tier 3: Already-Installed Dependencies
- Inspect `package.json`, `.csproj`, `go.mod`, or `composer.json` to identify libraries already linked into the build.
- Reuse capabilities provided by the project's active toolchain (e.g., using existing Dapper extension queries instead of raw ADO.NET DataReaders).
- Never install a new third-party dependency for a trivial task solvable by Tier 1 or Tier 2.

### Tier 4: Minimalist New Implementation
- Permitted **only** when Tiers 1–3 do not satisfy the requirement.
- When creating a new reusable routine:
  1. Author it as a static extension method or pure function with zero side-effects.
  2. Locate it in the established project directory (e.g., `Common/Extensions/` or `Features/<Domain>/Helpers/`).
  3. Accompany it with a unit test.

---

## 3. Mandatory Pre-Implementation Grep Recipes (The 5-Second Asset Survey)

Before writing any new utility logic, the agent must execute a targeted grep scan across the workspace:

```bash
# 1. C# .NET: Locate existing Extension classes and Helpers
rg "class .*Extensions" --type cs
rg "class .*Helper" --type cs
rg "namespace .*\.(Common|Shared|Utils|Extensions)" --type cs

# 2. Node.js / TypeScript: Locate utility exports
rg "export (const|function|class) .*(Helper|Util|Format|Validate)" --type ts --type js
rg "from ['\"].*(utils|helpers|common)['\"]" --type ts --type js

# 3. Universal Constants: Locate existing lookup dictionaries & status codes
rg "(enum|const|public static readonly) .*(Status|Type|Code|Pattern)"
```

---

## 4. Concrete Anti-Patterns (The Redundant Wheels)

| ❌ Redundant Anti-Pattern (Reinventing) | ✅ Asset-First Solution (Reusing) |
| :--- | :--- |
| Writing inline `date.ToString("dd/MM/yyyy HH:mm")` in a UI controller. | Calling project's `date.ToVietnameseDisplay()` from `DateTimeExtensions.cs`. |
| Writing a raw `new SqlConnection(...)` with manual try/catch and rollback. | Wrapping query in `DbScope.ExecuteAsync()` with automatic audit and retry. |
| Writing a custom regex loop to remove accents from Vietnamese text. | Calling `StringHelper.RemoveDiacritics(str)` from the shared utilities module. |
| Writing hand-rolled pagination math: `items.Skip((p-1)*s).Take(s)`. | Calling `query.ToPagedListAsync(page, pageSize)` or `items.Chunk(pageSize)`. |
| Writing a custom Deep Clone routine using manual property reflection. | Calling the project's existing `CloneHelper` or standard `structuredClone()`. |

---

## 5. Composition over Duplication

When an existing project helper solves $80\%$ of your problem:
- **Rule:** **DO NOT copy-paste the helper** into your feature folder to tweak the remaining $20\%$.
- **Action:**
  1. Add an optional parameter or overload to the existing helper.
  2. Compose the existing helper: call the existing method, then apply your domain-specific delta transformation on top.
  3. Keep the single source of truth intact.

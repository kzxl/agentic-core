---
name: AgenticLazyMinimalismProtocol
desc: Ponytail Minimalist Decision Ladder — YAGNI, standard library first, zero unrequested abstractions, and shortest working diff
rules: [R_CORE]
category: Agentic
---
# 🧘 Agentic Lazy Minimalism Protocol (Ponytail Decision Ladder)

**Goal:** Eliminate over-engineering, prevent code bloat, reduce token consumption, and ship the cleanest, shortest working diff. "The best code is the code you never wrote."

---

## 1. The 7-Rung Decision Ladder

Climb before writing any code. Stop at the first rung that solves the problem:

1. **Does this need to exist at all? (YAGNI):** Speculative need &rarr; Skip it.
2. **Already in this codebase?** Check existing helpers, extension methods, constants, and utils. Never re-invent existing utilities.
3. **Standard Library does it?** Use built-in language/runtime APIs (LINQ, `Array.prototype`, `path`, `sync`).
4. **Native platform feature covers it?** Use database constraints, native HTML elements, or framework hooks instead of custom logic/third-party libraries.
5. **Already-installed dependency solves it?** Utilize current packages; never add new dependencies for simple tasks.
6. **Can it be one line?** Prefer simple, declarative one-liners over multi-class scaffolding.
7. **Only then:** Write the minimum necessary production code.

---

## 2. Hard Anti-Overengineering Rules

- **No Unrequested Abstractions:** No interface with only one implementation (except for architectural boundaries `IService`), no factory for a single product, no generic config for constant values.
- **Root-Cause Fixes:** Fix bugs at the single shared source rather than scattering defensive `if` guards across all callers.
- **Deletion over Addition:** Refactoring must prioritize reducing line counts.
- **Lazy != Negligent:** Safety, type validation, error handling, and transaction boundaries are NEVER skipped.

---

## 3. Output Optimization Format (Review Mode)

When performing code reviews or evaluating diffs for complexity:
- `delete:` Dead code or unused flexibility.
- `stdlib:` Replace hand-rolled code with standard library calls.
- `native:` Leverage platform/framework feature.
- `yagni:` Remove speculative abstractions.
- `shrink:` Condense logic into fewer, clearer lines.

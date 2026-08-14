---
name: AgenticBrainstormingAndSpec
desc: Disciplined requirements exploration, ambiguity resolution, and acceptance criteria specification before coding (inspired by obra/superpowers)
rules: [R_CORE]
category: Agentic
---
# 🧠 Agentic Brainstorming & Specification Protocol

**Goal:** Eliminate "vibe coding" by forcing thorough exploration, ambiguity resolution, and explicit specification before any source files are modified.

---

## 1. The Pre-Coding Exploration Phase
Before writing or changing code, the AI Agent must execute:
1. **Codebase Archaeology:** Use search/grep tools to trace the current execution path from entrypoint to data storage.
2. **Dependency Mapping:** Identify all components, routes, database tables, and external APIs affected by the change.
3. **Ambiguity Clarification:** If requirements or edge cases are underspecified, proactively clarify or document assumptions in the implementation plan.

---

## 2. Specification Document (RFC / Plan Format)
Every non-trivial task must have a structured specification detailing:
- **Problem Statement:** What is broken, slow, or missing?
- **Proposed Architecture:** How the solution adheres to Clean Architecture and SOLID principles.
- **Acceptance Criteria (Given-When-Then):**
  - *Given* an unauthenticated user, *When* accessing `/`, *Then* redirect immediately to `/login`.
  - *Given* a valid token, *When* accessing `/statistics`, *Then* render charts within 500ms.
- **Trade-off Analysis:** Why this approach was chosen over alternatives.

---

## 3. Anti-Patterns to Avoid
- ❌ Jumping straight into editing source code based on a vague prompt.
- ❌ Modifying APIs or database column names without checking dependent frontend components.
- ❌ Over-engineering complex abstractions when simple composition suffices.

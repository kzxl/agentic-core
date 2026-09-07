---
title: Git Commit Discipline & Atomic Standards
desc: Standard for atomic feature commits, Conventional Commits format, scope isolation, and rollback safety
rules: [R_CORE, R_GIT]
---
# 📦 Git Commit Discipline & Atomic Standards

## 1. The Core Invariant: Atomic Single-Responsibility Commits
Every git commit MUST represent exactly **one logical unit of change** (Single Responsibility Principle applied to version control).

* **The Revertability Invariant:** If commit `C` is reverted via `git revert C`, it MUST cleanly remove that specific feature, fix, or refactor without side-effect regressions on unrelated components.
* **Strictly Prohibited — Mega-Commits:** Bundling multiple independent features, unrelated controls, or combining functional code changes with expansive roadmap/proposal edits into a single commit is strictly forbidden.
* **Commit Granularity Test:** If a commit message requires an "and" connecting two distinct domain subsystems (e.g., *"implement DockManager AND implement ColorPicker"*), it is NOT atomic and MUST be split into sequential individual commits.

---

## 2. Conventional Commits Specification
All commit messages must strictly conform to the **Conventional Commits 1.0.0** format:

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### A. Permitted Commit Types
| Type | Description | Permitted Contents |
| :--- | :--- | :--- |
| **`feat`** | New component, control, API, or functional capability | Production code + accompanying unit tests. |
| **`fix`** | Bug fix or regression resolution | Defect fix + regression reproduction test. |
| **`refactor`** | Internal code restructuring | Code modifications with 0 behavioral or API changes. |
| **`perf`** | Performance or memory optimization | 0-allocation changes, latency reductions + benchmarks. |
| **`docs`** | Documentation, proposals, specifications | Markdown files (`.md`), XML doc comments only (no code). |
| **`test`** | Test suite expansion or test infrastructure | Unit tests, test helpers, benchmark suites only. |
| **`chore`** | Build configuration, scripts, dependencies | Project files (`.csproj`), build scripts, packaging. |
| **`style`** | Code formatting and aesthetic cleanup | Whitespace, indentation, line endings (0 logic change). |

### B. Subject Formatting Rules
1. **Imperative, present tense:** Use *"implement"*, *"resolve"*, *"optimize"* (NEVER *"implemented"*, *"resolving"*, *"fixed"*).
2. **Lowercase start:** Do not capitalize the first letter of `<subject>` unless it is a proper symbol name (e.g. `GridControl`).
3. **No trailing period:** Do not terminate the subject line with `.`.
4. **Line length limit:** The header `<type>(<scope>): <subject>` must not exceed **72 characters** whenever possible.

---

## 3. Granular Scope Naming Hierarchy
The `<scope>` field provides immediate spatial context within the repository.

* **Mandatory Domain Specificity:** Scope MUST identify the concrete subsystem or package being modified:
  * *Data & Grids:* `grid`, `treelist`, `pivot`, `filter`
  * *Editors & Input:* `editor`, `lookup`, `token`, `barcode`
  * *Navigation & Layout:* `layout`, `docking`, `wizard`, `breadcrumb`
  * *SCADA & Instruments:* `gauge`, `chart`, `mimic`, `scene`
  * *Network & Infra:* `network`, `rack`, `switch`, `ipam`, `fieldbus`
  * *Core Engine:* `runtime`, `memory`, `tag`, `historian`, `scheduler`
  * *Diagnostics:* `debugger`, `hud`, `benchmark`
* **Forbidden Vague Scopes:** The following generic scopes are strictly prohibited:
  * ❌ `feat(controls): ...`
  * ❌ `feat(enterprise): ...`
  * ❌ `feat(all): ...`
  * ❌ `feat(misc): ...`
  * ❌ `feat(update): ...`

---

## 4. Separation of Concerns (Commit Isolation)
Distinct categories of changes MUST NOT be mixed within the same commit:

1. **Code vs Documentation Separation:**
   - Writing/updating `.cs` component code belongs in `feat(<scope>)` or `fix(<scope>)`.
   - Updating `docs/proposals.md`, `docs/roadmap.md`, or architecture blueprints belongs in a separate `docs:` commit.
2. **Feature vs Release Separation:**
   - Implementing a feature belongs in `feat(<scope>)`.
   - Version bump (`Directory.Build.props`), release notes, and NuGet packaging belongs in `chore(release): bump version to x.y.z`.
3. **Refactoring vs Bug Fixing Separation:**
   - Restructuring an existing class hierarchy must be committed as `refactor(<scope>)`.
   - Fixing a logic bug must be committed as `fix(<scope>)` to allow clear `git bisect` tracking.

---

## 5. The Self-Verifying Invariant (Code + Test Pairing)
* **Never commit broken states:** Every single commit in the repository history must successfully build and pass all unit tests:
  ```powershell
  dotnet build -c Release
  dotnet test -c Release
  ```
* **Pair Code with Tests:** When introducing a new feature or fixing a bug, the production code and its corresponding test cases MUST be committed together in the same commit. Committing code first and tests in a later commit is prohibited because it leaves the first commit unverified in history.

---

## 6. Multi-Requirement User Prompt Execution Protocol
When a user prompt specifies multiple discrete tasks or components (e.g., *"Implement CardView, BreadcrumbControl, and BarcodeBox"*):

* **Iterative Lifecycle:** The Agent MUST NOT implement everything in one pass and commit at the very end.
* **Sequential Loop (Execute & Commit Per Feature):**
  1. **Step 1:** Implement Feature 1 + Unit Tests &rarr; Verify Build & Tests &rarr; `git commit -m "feat(grid): implement CardView presentation mode"`
  2. **Step 2:** Implement Feature 2 + Unit Tests &rarr; Verify Build & Tests &rarr; `git commit -m "feat(navigation): implement BreadcrumbControl hierarchical navigator"`
  3. **Step 3:** Implement Feature 3 + Unit Tests &rarr; Verify Build & Tests &rarr; `git commit -m "feat(editor): implement BarcodeBox vector 1D and QR code generator"`
* This guarantees that if Step 3 fails or requires design changes, Steps 1 and 2 are already safely checkpointed and can be independently rolled back or deployed.

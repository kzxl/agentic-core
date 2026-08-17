---
name: CodeRefactoringWorkflow
desc: Zero-regression code refactoring and modularization workflow (Blast-Radius -> 1-to-1 Partitioning -> Conformance -> Post-Harvest)
rules: [R_CORE, R_API]
category: Workflows
---
# 🔨 Zero-Regression Code Refactoring Workflow

**Goal:** Refactor legacy monolithic classes, extract shared services, localize DTOs, and clean up technical debt without breaking existing callers or public APIs.

---

### Step 1: Pre-Edit Caller & Blast-Radius Grep Scan
Quantify the blast radius across the entire workspace:
// turbo
```bash
# Grep all direct and indirect references
rg "(\b<TargetClassOrMethod>\b|nameof\(<TargetClassOrMethod>\))"
```

### Step 2: Semantic Brain PRE-Fetch (Migration Lessons)
Check previous refactoring gotchas and architectural constraints:
// turbo
```bash
node [AgentOption]/tools/brain.js pre "refactor <target module>" --tags=<domain>,refactor
```

### Step 3: Apply 1-to-1 Partial Partitioning & DTO Localization
Partition monolithic files into cohesive units:
- `<Feature>ActionDTO.cs` & `<Feature>AppService.Action.cs`
- `<Feature>QueryDTO.cs` & `<Feature>AppService.Query.cs`
- `<Feature>LookupDTO.cs` & `<Feature>AppService.Lookup.cs`
- Keep every partial file strictly between **50 to 200 lines**.

### Step 4: Ponytail Minimalist Clean-up (Delete > Add)
Remove dead code, speculative abstractions, and duplicate helpers:
- Use standard library methods over custom logic (`PONY`).
- Eliminate interfaces with only 1 implementation unless architectural boundary.

### Step 5: Conformance Testing & Full Build Verification
Verify that behavior and public API contracts remain 100% backward compatible:
```bash
# Verify build
dotnet build /warnaserror
# Or Node.js
npm run build && npm test
```

### Step 6: Commit & POST-Harvest
Record migration results and lessons learned:
```bash
git add .
git commit -m "refactor(<domain>): partition <module_name> into 1-to-1 partials and localize DTOs"
```
// turbo
```bash
node [AgentOption]/tools/brain.js post "[Refactor: <Module>] | [Reduced <N> lines / eliminated legacy dependency] | [Partition pattern used]" --tags=<domain>,refactor
```

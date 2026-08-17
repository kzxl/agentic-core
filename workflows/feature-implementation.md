---
name: FeatureImplementationWorkflow
desc: End-to-end automated workflow for new feature implementation (Normalization -> Pre-Fetch -> Spec -> TDD -> Blast-Radius -> Commit -> Post-Harvest)
rules: [R_CORE, R_TDD]
category: Workflows
---
# 🚀 End-to-End Feature Implementation Workflow

**Goal:** Execute new feature development autonomously with zero hallucination, strict architectural boundaries, regression safety, and continuous knowledge retention.

---

### Step 1: Input Normalization & Slot Extraction
Extract canonical micro-payload slots (`action`, `target`, `intent`, `tags`) to eliminate noise:
// turbo
```text
[NORM] ADD @<Domain>.<Feature> | <Concise Intent> | [<ActiveRules>]
```

### Step 2: Semantic Brain PRE-Fetch (Mandatory Context Lookup)
Query historical repository lessons and architectural gotchas before reasoning:
// turbo
```bash
node [AgentOption]/tools/brain.js pre "<Feature Name> <Domain>" --tags=<domain>
```

### Step 3: Exploration & RFC Specification
Draft implementation plan with explicit Given-When-Then acceptance criteria:
- Map touched contracts, routes, tables, and DTO boundaries.
- Define trade-offs and single-responsibility partition.

### Step 4: Test-Driven Development (TDD)
Write failing test suite before writing production implementation:
```bash
# Node.js
npm test -- --grep "<FeatureName>"

# C# .NET
dotnet test --filter "FullyQualifiedName~<FeatureName>"

# Go
go test -v ./... -run Test<FeatureName>
```

### Step 5: Minimalist Implementation (Ponytail Ladder)
Implement minimum required production code:
- Apply standard library and existing helpers first (`PONY`).
- Follow 1-to-1 Partial Partitioning (`PART`).
- Ensure all cancellation tokens (`CTOK`) and transaction boundaries are closed.

### Step 6: Adversarial Code Review & Blast-Radius Check
Self-audit changes against edge cases, concurrency, and caller regressions:
// turbo
```bash
rg "<NewOrModifiedSymbol>" --type cs --type ts --type js
```

### Step 7: Build Verification & Clean Commit
Execute full test suite, build project, and commit cleanly:
```bash
git add .
git commit -m "feat(<domain>): implement <feature_name> with full test coverage"
```

### Step 8: Semantic Brain POST-Harvest
Record distilled architectural patterns and concrete gotchas into SemanticBrain:
// turbo
```bash
node [AgentOption]/tools/brain.js post "[Feature: <Name>] | [Key Implementation Gotcha] | [Solution & Pattern Used]" --tags=<domain>,feat
```

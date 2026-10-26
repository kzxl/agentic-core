---
name: feature-implementation
description: End-to-end workflow for building a new feature. Use when the user asks to add, implement, build, or extend a feature, endpoint, screen, report, or module, including work that needs requirements clarification, vertical slicing, TDD, blast-radius checks, a safe commit, and post-harvest.
desc: End-to-end automated workflow for new feature development (Normalization, Pre-Fetch, Grilling, Vertical Slices, TDD, Blast-Radius, Commit, Post-Harvest).
rules: [R_CORE, R_TDD, R_GIT, R_PROOF]
---

# End-to-End Feature Implementation Workflow

**Goal:** Ship production-ready features with 4-tier isolation (`CLEAN`, `FEAT`), asset reuse (`R_REUSE`), red-before-green TDD in vertical slices (`R_TDD`), and atomic commits (`R_GIT`). Incorporates practices adapted from mattpocock/skills (MIT).

```text
[1. NORM + Route + PRE-Fetch + Grilling] -> [2. Asset Survey + Pre-Mortem]
-> [3. Contracts + Vertical Slices] -> [4. TDD per Slice] -> [5. Audit, Commit, Harvest]
```

## Step 1: Normalize, Route, Pre-Fetch, Grill
1. `[NORM] ADD @<Domain>.<Feature> | <Primary Deliverable & Constraints> | [<ActiveRules>]`
2. System 1 router (`R_ROUTE`) and pre-fetch (`R_RES_MEM`):
   // turbo
   ```bash
   node E:\16. AgentOption\tools\brain.js route "<Feature Description>"
   node E:\16. AgentOption\tools\brain.js pre "<Feature Name> <Domain>" --tags=<domain>
   ```
3. When requirements are underspecified or a design decision is open, read [`skills/agentic/brainstorming-and-spec.md`](../agentic/brainstorming-and-spec.md) and run its grilling protocol.

**Done when** NORM is written, route and pre-fetch ran, and (for ambiguous work) the grilling frontier is empty and the user confirmed.

## Step 2: Asset Survey (`R_REUSE`) and Pre-Mortem (`R_PRE_MORTEM`)
1. Before creating any helper, mapper, validator, or UI control:
   // turbo
   ```bash
   rg "(Helper|Extension|Validator|BaseForm|DbScope|ApiClient)" --files
   ```
2. Evaluate three failure modes: concurrent submission of the same document, SARGable paginated queries at $10^6$ rows, and double-click re-entrancy on UI actions. Read [references/layers-and-slicing.md](references/layers-and-slicing.md) for the prompts.

**Done when** reusable assets are listed (or "none") and each failure mode has a mitigation.

## Step 3: Contracts and Vertical Slices (`CLEAN`, `FEAT`, `PART`)
1. Define Domain, localized DTOs, partial Application Service files, and a thin Presentation/API layer per the layer table in [references/layers-and-slicing.md](references/layers-and-slicing.md).
2. Slice the work into vertical tracer bullets: each crosses every layer, is demoable alone, and fits one context window; prefactor first.
3. Wide refactors use expand -> migrate in batches -> contract (same reference).

**Done when** contracts are defined and the slice list (deliverable and blockers per slice) is written.

## Step 4: Red-Green TDD per Slice (`R_TDD`)
Follow [`skills/agentic/test-driven-development.md`](../agentic/test-driven-development.md): test only at seams pre-agreed with the user, one slice per cycle.
1. **Red:** write the next test (happy path, boundary values, or invalid transition) and observe it fail:
   ```bash
   dotnet test --filter "FullyQualifiedName~<FeatureName>"  # or node --test / pytest / cargo test
   ```
2. **Green (`PONY`):** the shortest code that passes, using standard library and existing helpers.
3. **Review-stage refactor (`R_NEV`):** after all slices are green, remove duplication, nesting $\le 3$, zero warnings.

**Done when** every slice's test went red then green and the full suite exits `0`.

## Step 5: Audit, Proof, Commit (`R_GIT`, `R_PROOF`)
1. **Blast radius (`REV`, `BLAST`):** grep touched shared symbols; verify parameterized SQL (`R_DB`), RBAC checks (`R_DOMAIN_AUTH`), no hardcoded secrets/paths (`R_SEC_STD`, `R_PKG`).
2. **Proof:** full build and test suite exit `0`.
3. **Commit and harvest (`R_RES_MEM`):**
   ```bash
   node E:\Tools\SemanticBrain\tools\git-safe-commit.js -m "feat(<domain>): implement <feature_name>" <feature_files...>
   node E:\16. AgentOption\tools\brain.js post "[Feature: <Name>] | [Constraint / Edge Case] | [Pattern & Reusable Asset Applied]" --tags=<domain>,pattern
   ```

**Done when** no caller breaks, build and tests exit `0`, the commit exists, and harvest ran.

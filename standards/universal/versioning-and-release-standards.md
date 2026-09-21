---
title: Semantic Versioning, Revision & Release Governance
desc: Standard for SemVer 2.0.0, 4-part enterprise revisions, SSoT version properties, git tagging, forward-only reversion/rollback, and release lifecycle
rules: [R_CORE, R_GIT, R_VER]
---

# 🏷️ Semantic Versioning, Revision & Release Governance

## 1. The Core Invariant: Version as a Sovereign Contract
A software version is not an arbitrary counter—it is a **binding social and technical contract** between the author (producer) and consumers (developers, CI/CD runners, downstream services, end-users).

* **The Immutability Invariant:** Once a version (e.g., `v1.2.0`) is published to a package registry (NuGet, npm, PyPI) or tagged in git as an official release, its contents are **permanently immutable**. NEVER modify, overwrite, or re-publish the same version number under different commit hashes.
* **Deterministic Predictability:** Downstream consumers must be able to infer API compatibility, regression risk, and upgrade urgency solely by inspecting the version number change.

---

## 2. Semantic Versioning Specification (SemVer 2.0.0)
All software modules across the ecosystem MUST conform to the 3-part **Semantic Versioning 2.0.0** schema:

$$\mathbf{MAJOR}.\mathbf{MINOR}.\mathbf{PATCH}$$

```text
       1   .   2   .   0
       │       │       │
       │       │       └── PATCH: Backward-compatible bug fixes & internal tweaks
       │       └────────── MINOR: Backward-compatible new features & capabilities
       └────────────────── MAJOR: Incompatible, breaking API changes
```

### 2.1. MAJOR Version Increment (`X.0.0`)
A **MAJOR** increment indicates **breaking changes** that require downstream consumers to modify their code or data models:
* Removal or renaming of public classes, interfaces, methods, properties, or enum members.
* Modifying public method signatures (adding non-optional parameters, changing return types).
* Incompatible wire-format, protocol, or storage schema changes (e.g., TSDB binary block header changes).
* Fundamental architectural redesigns or dependency framework upgrades (e.g., migrating from .NET Framework 4.6.2 baseline to modern .NET 8-only).

### 2.2. MINOR Version Increment (`x.Y.0`)
A **MINOR** increment introduces **new functional capabilities** while maintaining **100% backward compatibility**:
* Introducing new public classes, nodes, decoders, or algorithm suites (e.g., adding YOLOv8 Decoders to `ZeroInference`, glTF 2.0 Loaders to `ZeroTwin3D`, or Sub-DAG macro nodes to `ZeroPipeline`).
* Adding optional parameters with default values to existing methods.
* Adding new overload methods that extend existing functionality without breaking existing call-sites.
* Marking existing APIs as `[Obsolete]` (deprecation warning) while preserving operational functionality until the next MAJOR release.
* *Rule:* Reset `PATCH` to `0` whenever `MINOR` is incremented.

### 2.3. PATCH Version Increment (`x.y.Z`)
A **PATCH** increment addresses **internal implementation fixes** without modifying public API surfaces:
* Bug fixes, logic corrections, and null-safety hardening.
* Performance optimizations, memory allocation reductions (zero-allocation enhancements) preserving behavioral invariants.
* Test suite resilience fixes (e.g., relaxing timing thresholds under parallel test runner load).
* Internal documentation, XML doc comments, and non-breaking security hardening.

---

## 3. Enterprise 4-Part Versions & Revisions (CLR / Windows)
Certain runtime platforms (such as the Windows CLR and Win32 PE headers) utilize a **4-part version number**:

$$\mathbf{MAJOR}.\mathbf{MINOR}.\mathbf{PATCH}.\mathbf{REVISION}$$

### 3.1. Role of the REVISION Field
* **CI/CD Build Traceability:** In automated continuous integration pipelines, `REVISION` is populated with the build counter or commit counter (e.g., `1.2.0.1042`), providing exact traceability back to the build agent.
* **Emergency Field Hotfixes:** In mission-critical industrial deployments (SCADA, MES, PLC firmware), if an urgent same-day field patch must be deployed to a client workstation before a formal upstream release, the `REVISION` number is bumped to distinguish deployment builds.
* **Assembly Mapping Standard:**
  | Property | Format | Usage Context |
  | :--- | :--- | :--- |
  | `<Version>` | `X.Y.Z` (or `X.Y.Z-preview.N`) | NuGet package identity and SemVer public display |
  | `<AssemblyVersion>` | `X.Y.0.0` | CLR type binding (keep stable across MINOR/PATCH to avoid binding redirect hell) |
  | `<FileVersion>` | `X.Y.Z.R` | Windows PE file properties (Explorer file version) |
  | `<InformationalVersion>` | `X.Y.Z+<git-commit-hash>` | Full provenance including Git SHA for diagnostics |

### 3.2. Pre-Release Identifiers
Pre-release versions append a hyphen and alphanumeric identifier:
* `1.2.0-alpha.1` &rarr; Experimental preview, active development.
* `1.2.0-beta.2` &rarr; Feature complete, undergoing stabilization and API freeze.
* `1.2.0-rc.1` &rarr; Release Candidate, verified against full test suite, awaiting final sign-off.
* `1.2.0-preview.1` &rarr; Public developer preview.
* *Precedence Order:* `alpha.1 < alpha.2 < beta.1 < rc.1 < 1.2.0 (final)`.

---

## 4. Single Source of Truth (SSoT) Architecture

### 4.1. .NET / C# Repositories: `Directory.Build.props`
* **Prohibition:** NEVER hardcode `<Version>` tags inside individual `.csproj` files across a multi-project repository.
* **Mandatory Standard:** Place a single `Directory.Build.props` at the repository root. All projects automatically inherit these properties:

```xml
<Project>
  <PropertyGroup>
    <Version>1.2.0</Version>
    <AssemblyVersion>1.2.0.0</AssemblyVersion>
    <FileVersion>1.2.0.0</FileVersion>
    <InformationalVersion>1.2.0</InformationalVersion>
    <Authors>Phong Võ</Authors>
    <Company>ZeroPlatform</Company>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
    <RepositoryUrl>https://github.com/kzxl/ZeroStorage.git</RepositoryUrl>
  </PropertyGroup>
</Project>
```

### 4.2. Node.js / React / TypeScript: `package.json`
* Maintain versioning in the root `package.json` (or workspace manifest).
* Sync `package-lock.json` atomically in the same release commit.

### 4.3. Python Repositories: `pyproject.toml`
* Maintain versioning under `[project] version = "X.Y.Z"` or `__version__ = "X.Y.Z"` in package `__init__.py`.

---

## 5. Git Commit & Tagging Protocol

### 5.1. Release Commit Isolation
Per [Git Commit Discipline](git-commit-standards.md), bumping the version MUST be isolated into its own dedicated commit:
```bash
node E:\Tools\SemanticBrain\tools\git-safe-commit.js -m "chore(release): bump version to 1.2.0" Directory.Build.props
```
* **Type:** `chore(release)`
* **Subject:** `bump version to <new-version>`
* **Scope:** Only files tracking version numbers (`Directory.Build.props`, `package.json`, `README.md` matrix). NEVER bundle functional feature code into a release commit.

### 5.2. Git Tag Naming Standard
* **Format:** `vMAJOR.MINOR.PATCH` (e.g., `v1.2.0`).
* **Lowercase `v` prefix:** Always prefix with lowercase `v`. Never use uppercase `V1.2.0`, raw numbers `1.2.0`, or descriptive strings `release-1.2.0`.
* **Annotated Tags ONLY:** Always create annotated tags containing a release message. Lightweight unannotated tags are forbidden:
  ```bash
  git tag -a v1.2.0 -m "Release v1.2.0 - IoT Out-Of-Order Ingestion & Auto-Rollup TimeSeries"
  git push origin v1.2.0
  ```

---

## 6. Reversion, Rollback & Yanking Protocol (Fault Mitigation)
When a critical bug, regression, or security vulnerability is discovered in an already-published version, follow the **Non-Destructive Forward-Only Rollback Protocol**.

```
    [Published v1.2.0 (FAULTY)]
                │
                ├─❌ NEVER delete git tag or re-push v1.2.0 (Poisoned Cache Danger!)
                │
                ├─▶ 1. Yank / Unlist v1.2.0 on Registry (NuGet / npm)
                │
                ├─▶ 2. Create Revert Commit: git revert <commit-hash>
                │
                └─▶ 3. Release Forward-Fix Version: v1.2.1 (Containing clean rollback)
```

### 6.1. The "Forward-Only" Rule (No Re-Tagging)
* **Prohibition:** NEVER delete a remote git tag (`git push --delete origin v1.2.0`) to re-tag a different commit under the same version.
* **Root Cause:** Upstream consumers, package caches, proxy mirrors (Cloudflare, NuGet CDN), and local developer disk caches will retain the old binary. Re-using version numbers causes silent **Cache Poisoning** where identical version strings contain mismatched binaries, breaking build reproducibility.

### 6.2. 3-Step Rollback Workflow
1. **Yank / Deprecate Published Artifact:**
   * On NuGet / npm: Mark the release as *Unlisted* or *Yanked*. This prevents new projects from adopting the faulty build while avoiding breaking existing locked lockfiles.
   * On GitHub: Edit the release, mark it as *Pre-release* or prepend `[DEPRECATED]` to the title, documenting the specific advisory.
2. **Execute Revert Commit:**
   * Revert the faulty commit cleanly:
     ```bash
     git revert <faulty-commit-sha> -m "revert(storage): rollback OOO buffer due to memory leak issue #42"
     ```
3. **Publish Forward-Fix PATCH Release:**
   * Bump version to the next PATCH number (e.g., `1.2.0` &rarr; `1.2.1`).
   * Document in release notes: `v1.2.1: Reverts v1.2.0 changes due to Issue #42. Restores known-good v1.1.0 baseline behavior.`

---

## 7. GitHub Release Lifecycle Checklist
Before publishing any official GitHub Release:

- [ ] **1. Test Suite Pass Rate:** 100% of automated tests pass in Release mode (`dotnet test -c Release`).
- [ ] **2. Dependency Invariant:** Verify zero unauthorized external dependencies (Pure C# BCL maintained).
- [ ] **3. SSoT Version Bump:** Root `Directory.Build.props` matches the release tag.
- [ ] **4. Git Commit & Tag:** Clean atomic commit pushed to `master` and annotated tag `vX.Y.Z` pushed to `origin`.
- [ ] **5. GitHub Release CLI Command:**
  ```bash
  gh release create vX.Y.Z \
    --title "vX.Y.Z - <Concise Feature Headline>" \
    --notes "<Markdown Changelog>"
  ```
- [ ] **6. Standardized Release Notes Sections:**
  - `## 🚀 Overview & Executive Summary`
  - `### ✨ Highlights & Key Capabilities`
  - `### ⚠️ Breaking Changes & Migration Guide` (if MAJOR)
  - `### 🐛 Bug Fixes & Refactoring`
  - `### 🧪 Verification & Evidence` (Pass counts, throughput benchmarks)

---

## 8. Anti-Patterns & Prohibitions

| Anti-Pattern | Violation Description | Correct Enforcement |
| :--- | :--- | :--- |
| **Silent Breaking Changes** | Changing a public method signature or wire format in a `MINOR` or `PATCH` bump. | Bump `MAJOR` or preserve existing API via backward-compatible overloads. |
| **Hardcoded Csproj Versions** | Specifying `<Version>1.0.0</Version>` in multiple sub-project `.csproj` files. | Centralize in root `Directory.Build.props` as Single Source of Truth (SSoT). |
| **Tag Deletion & Re-use** | Deleting remote tag `v1.0.0` to fix a typo and re-pushing under the same tag name. | Forward-fix by releasing `v1.0.1`. Never re-use released version strings. |
| **Mega-Release Commits** | Committing 500 lines of functional feature code together with a version bump. | Commit feature code first (`feat:`). Bump version in an isolated `chore(release):` commit. |
| **Lightweight Git Tags** | Running `git tag v1.0.0` without `-a` or release message. | Always use annotated tags `git tag -a v1.0.0 -m "..."`. |

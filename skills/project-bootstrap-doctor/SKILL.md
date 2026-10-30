---
name: project-bootstrap-doctor
description: Use for automated onboarding, rule binding, and architectural compliance health-check workflow for new repositories.
desc: Automated onboarding, rule binding, and architectural compliance health-check workflow for new repositories.
rules: [R_CORE, R_ENG_OS, R_ROUTE, R_PROOF]
---

# 🩺 Project Bootstrap & Compliance Doctor Workflow

**Goal:** Onboard repositories into AgentOption by auto-detecting stacks, synthesizing `.project-rule.md`, verifying bindings via `doctor.js`, and warming SemanticBrain memory.

---

## 1. Stack & Architecture Auto-Detection Matrix

Inspect root markers (`Test-Path` / `Get-ChildItem -Force`) to map stacks to rules and shortcuts:

| Markers | Language | Architecture | Mandatory Rules (`rules`) | Shortcuts (`shortcuts`) |
| :--- | :--- | :--- | :--- | :--- |
| `*.csproj` (`UseWindowsForms`) | `csharp` | `winforms_erp` | `R_CORE, R_CS, R_WPF, R_DB, R_PUB` | `WINFORMS, WINFORMS_UI, BASE, DBS, PART` |
| `*.csproj` (`UseWPF`) | `csharp` | `wpf_mvvm` | `R_CORE, R_CS, R_WPF, R_UI, R_PUB` | `WPF, UI_WPF, DBS, CTOK, UIDESIGN` |
| `*.csproj` (`Sdk.Web`) | `csharp` | `clean_architecture` | `R_CORE, R_CS, R_API, R_DB, R_SEC_STD` | `CLEAN, FEAT, API, DBS, CTOK` |
| `Cargo.toml`, `src/lib.rs` | `rust` | `systems_crate` | `R_CORE, R_RUST, R_PERF, R_BENCH` | `RUST_PERF, RUST_SAFE, RUST_TOOL` |
| `pyproject.toml`, `uv.lock` | `python` | `async_ai_service` | `R_CORE, R_PY, R_API, R_SEC_STD` | `PY_TYPE, PY_FASTAPI, PY_AGENT` |
| `go.mod`, `cmd/`, `internal/` | `golang` | `layered_service` | `R_CORE, R_GO, R_RES, R_DB, R_PROOF` | `GO_CONC, GO_ERR, GO_MEM, RES` |
| `package.json` (`react`) | `typescript` | `spa_feature_sliced` | `R_CORE, R_REACT, R_UI, R_SEC_STD` | `REACT_LIFE, REACT_PERF, REACT_STAT, REACT_UI` |
| `package.json` (`express`) | `javascript` | `handler_dispatcher` | `R_CORE, R_NODE, R_API, R_DB, R_SEC_STD` | `NODE_ARC, NODE_STRM, NODE_SEC, HND` |
| `project.godot`, `*.tscn` | `csharp` / `gd` | `host_client_sim` | `R_CORE, R_GAME, R_GODOT, R_PERF` | `GAME, GODOT, GBRDG, HFSM, GPOOL` |
| `CMakeLists.txt`, `linker.ld` | `c` / `cpp` | `bare_metal_rtos` | `R_CORE, R_CPP, R_EMBEDDED, R_LLM_GOV` | `EMBED_ARCH, FW_ENG, RTOS, CPP` |

---

## 2. Step-by-Step Onboarding Protocol

### Step 1: Hidden Dot-File Inspection & Asset Survey (`R_REUSE`)
1. **Verify Dot-Files:** On Windows PowerShell, always run `Test-Path .project-rule.md` or `Get-ChildItem -Force` (never `Get-ChildItem -Hidden`, which skips dot-files lacking the `Hidden` flag).
2. **Survey Helpers:** Locate `Helpers/`, `Common/`, `Extensions/`, `Services/`, and `Tests/` directories to index in `key_paths`.

### Step 2: Synthesize `.project-rule.md` Schema
Create `.project-rule.md` at the repository root. Every path under `key_paths` MUST exist on disk:

```yaml
---
project_name: <kebab-case-project-id>
domain: <inventory | production | sales | erp | auth | ai_agentic_engineering>
primary_language: <csharp | rust | python | golang | typescript | javascript | cpp>
architecture: <clean_architecture | universe_plugin | winforms_erp | modular_framework>
framework_references:
  agent_option_root: "E:\\16. AgentOption"
  rules: ["R_CORE", "R_CS", "R_WPF", "R_API", "R_DB", "R_TDD", "R_GIT", "R_PROOF", "R_REUSE"]
  shortcuts: ["CLEAN", "FEAT", "DBS", "PART", "CTOK", "TDD", "GIT", "PROOF_STD", "ASSET_REUSE"]
key_paths:
  domain: "src/Domain/"
  application: "src/Application/"
  infrastructure: "src/Infrastructure/"
  presentation: "src/Presentation/"
  tests: "tests/"
---
```

### Step 3: Execute AgentOption Compliance Doctor (`doctor.js`)
Validate YAML frontmatter, bound `rules`, `shortcuts`, and `key_paths` existence:
// turbo
```bash
node E:\16. AgentOption\tools\doctor.js <path-to-target-repo>
```
- **Pass Criterion:** Exit code `0`. Fix any invalid rule/shortcut ID or missing directory before proceeding.

### Step 4: Verify Framework Integrity & SemanticBrain Routing
// turbo
```bash
node E:\16. AgentOption\tools\validate-framework.js
node E:\16. AgentOption\tools\brain.js route "bootstrap compliance verification"
node E:\16. AgentOption\tools\brain.js pre "initial bootstrap check" --tags=<domain>
```

---

## 3. Brownfield Repository Onboarding Checklist

- [ ] **License Check (`R_LICENSE`):** Verify `LICENSE` exists at root (initialize MIT if sovereign and missing).
- [ ] **Secret Hygiene (`R_SEC_STD`):** Exclude `.env`, `appsettings.Development.json`, `*.pfx`, `bin/`, `obj/`, `node_modules/`, `target/` in `.gitignore`.
- [ ] **Package Portability (`R_PKG`):** Zero machine-specific local paths in `nuget.config`, `package.json`, `Cargo.toml`, or `pyproject.toml`.
- [ ] **Epistemic Baseline (`R_EPISTEMIC`):** Run existing test suites to record baseline pass count ($N_0$).
- [ ] **Atomic Commit (`R_GIT`):** Commit `.project-rule.md` via `git-safe-commit.js --allow-config .project-rule.md`.





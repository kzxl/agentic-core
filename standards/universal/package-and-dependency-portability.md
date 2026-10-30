---
desc: Package and dependency governance, public registry precedence, and local path prohibition
rules: [R_CORE, R_PKG]
---
# 📦 Package & Dependency Portability Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Machine-Local Absolute Paths** | `0` instances (`C:\`, `E:\`, `/Users/`, `/home/`) in tracked manifests | Pre-commit regex scan across `*.csproj`, `NuGet.Config`, `package.json`, `Cargo.toml`, `pyproject.toml` |
| **Lockfile Determinism** | `100%` committed & enforced (`--locked` / `npm ci` / `--locked-mode`) | `packages.lock.json`, `package-lock.json`, `Cargo.lock`, `uv.lock` |
| **Package Source Mapping** | Explicit namespace prefix routing (`packageSourceMapping`) | Prevents dependency confusion & typosquatting attacks |
| **Known High/Critical CVEs** | `0` unmitigated High/Critical vulnerabilities at build gate | `dotnet list package --vulnerable`, `npm audit --audit-level=high`, `cargo audit` |
| **Permissive License Compliance** | `0` copyleft (`GPL` / `AGPL`) packages in proprietary artifacts | Automated SPDX license allowlist (`MIT`, `Apache-2.0`, `BSD-3-Clause`, `ISC`) |

---

## 2. Prohibition of Machine-Local Absolute Paths & Relative Offline Feeds

Hardcoding developer workstation drive letters or user profile directories (`E:\15. Other\Packages`, `C:\Users\dev\.nuget`, `file:///Users/...`) inside `NuGet.Config`, `.csproj` `<HintPath>`, `package.json`, `Cargo.toml`, or `pyproject.toml` immediately breaks builds on CI/CD runners, Docker containers, and teammate machines.
- **Public Registry Single Source of Truth (`SSoT`):** Resolve packages primarily from canonical upstream registries (`https://api.nuget.org/v3/index.json`, `https://registry.npmjs.org/`, `https://crates.io`, `https://pypi.org/simple`).
- **Repo-Relative Offline Feed (`./local-packages`):** When air-gapped or pre-release local packages are required, place `.nupkg` / `.tgz` / `.whl` artifacts inside a repository-relative `./local-packages` directory and bind `packageSourceMapping` so internal package prefixes (`Corp.*`, `Zero*`) never leak queries to public registries.

```xml
<!-- ❌ BAD: Hardcoded workstation drive letter breaks every other machine & lacks source mapping -->
<configuration>
  <packageSources>
    <add key="MyLocalDrive" value="E:\15. Other\BuildOutput\NuGet" />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
  </packageSources>
</configuration>

<!-- ✅ GOOD: Repo-relative offline feed + deterministic packageSourceMapping against dependency confusion -->
<configuration>
  <packageSources>
    <clear />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
    <add key="repo-local" value="./local-packages" />
  </packageSources>
  <packageSourceMapping>
    <packageSource key="repo-local">
      <package pattern="Zero*" />
      <package pattern="Corp.*" />
    </packageSource>
    <packageSource key="nuget.org">
      <package pattern="*" />
    </packageSource>
  </packageSourceMapping>
</configuration>
```

---

## 3. Cross-Ecosystem Manifest & Lockfile Hygiene

Never use floating wildcards (`"*"` or `latest`) in dependency manifests. Pin exact or compatible semantic versions and enforce frozen lockfile restores in CI:

```toml
# ❌ BAD (Cargo.toml / pyproject.toml): Absolute path dependency & wildcard version
[dependencies]
 shared_kernel = { path = "C:/Users/admin/dev/shared_kernel" }
 serde = "*"

# ✅ GOOD: Workspace-relative path + locked semver + Central Package Management
[dependencies]
 shared_kernel = { path = "../shared_kernel", version = "1.4.0" }
 serde = { version = "1.0.210", features = ["derive"] }
```

- **.NET Central Package Management (`Directory.Packages.props`):** Enable `<ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>` and `<RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>`, and run `dotnet restore --locked-mode` in CI.
- **Node.js & Python:** Use `npm ci --ignore-scripts` (or `pnpm install --frozen-lockfile`) and `uv sync --locked` to guarantee bit-for-bit reproducible dependency trees.

---

## 4. Pre-Flight CVE & Portability Verification Gate

Before committing any change that touches `*.csproj`, `Directory.Packages.props`, `NuGet.Config`, `package.json`, `Cargo.toml`, or `pyproject.toml`, execute the portability and vulnerability gate:
1. Verify zero absolute drive/home paths: `rg -i "([a-z]:\\\\|/users/|/home/)" NuGet.Config *.csproj package.json Cargo.toml pyproject.toml`.
2. Run clean locked restore and vulnerability audit (`dotnet list package --vulnerable --include-transitive`).

---

## 5. MSBuild Anti-Patterns Catalog

When authoring or modifying `.csproj`, `.props`, or `.targets` files, eliminate common MSBuild anti-patterns (adapted from `dotnet/skills`):

| Anti-Pattern ID | Anti-Pattern Smell | Why It's Bad | Remediated Standard |
| :--- | :--- | :--- | :--- |
| **`AP-01`** | `<Exec Command="mkdir ... / copy ... / del ..." />` | Platform-dependent, breaks incremental build, opaque to MSBuild logger. | Use built-in tasks: `<MakeDir>`, `<Copy>`, `<Delete>`, `<Move>`, `<WriteLinesToFile>`. |
| **`AP-02`** | Unquoted Condition: `Condition="$(Foo) == Bar"` | Evaluates incorrectly or crashes with XML parse error on spaces/empty values. | Always quote **both** sides with single quotes: `Condition="'$(Foo)' == 'Bar'"`. |
| **`AP-03`** | Hardcoded workstation path in `<Import Project="C:\..." />` | Breaks on CI runners and other platforms; non-relocatable. | Use `$(MSBuildThisFileDirectory)` or NuGet props/targets auto-imports. |
| **`AP-04`** | Redundant restore in multi-step build pipelines | Triggers slow $O(N)$ network and disk I/O multiple times. | Restore once in pre-flight, then pass `--no-restore` to `build`, `test`, and `publish`. |
| **`AP-05`** | Intermediate output collision (`BaseIntermediateOutputPath`) | Parallel builds sharing the same `obj/` clash and corrupt binary outputs. | Keep project `BaseIntermediateOutputPath` and `OutputPath` isolated per project name. |


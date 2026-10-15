---
name: dotnet-publish-release
description: Build, test, and publish .NET desktop and WebAPI applications into lightweight, framework-dependent single-file distributions adhering to R_PUB.
desc: Build, test, and publish .NET desktop and WebAPI applications into lightweight, framework-dependent single-file distributions adhering to R_PUB.
rules: [R_PUB, R_VER, R_CS, R_PROOF]
---

# 🚀 .NET Publish & Release Packaging Workflow (`R_PUB`)

**Goal:** Deterministically build, test, version, and package .NET Desktop (WinForms/WPF) and WebAPI applications into compact, framework-dependent single-file distributions (`--self-contained false -p:PublishSingleFile=true`) with empirical verification and forward-only rollback safety.

---

## 1. End-to-End Release Pipeline

```text
[1. SemVer SSoT Sync] ──► [2. Clean & Release Build] ──► [3. Test Gate (100% Pass)]
                                                                   │
[5. Size, SHA-256 & Tag] ◄── [4. Lite SingleFile Publish (--self-contained false)]
```

---

## 2. Step-by-Step Execution Protocol

### Step 1: Semantic Version SSoT & Portability Audit (`R_VER`, `R_PKG`)
1. **Verify Version SSoT:** Synchronize `<Version>`, `<AssemblyVersion>`, and `<FileVersion>` in `Directory.Build.props` or `.csproj` (`MAJOR.MINOR.PATCH.REVISION`).
2. **NuGet Portability Gate:** Confirm `nuget.config` and `.csproj` contain zero hardcoded local drive paths (`C:\`, `D:\`, `E:\`).

### Step 2: Pre-Publish Clean & Zero-Warning Release Build
Clean stale `bin/` and `obj/` artifacts and compile in `Release` mode with zero warnings:
// turbo
```bash
dotnet clean -c Release
dotnet restore
dotnet build -c Release -warnaserror
```

### Step 3: Automated Regression Test Gate (`R_PROOF`)
Run all unit/integration tests against the compiled `Release` binaries. Abort immediately on any failure:
// turbo
```bash
dotnet test -c Release --no-build --verbosity normal
```

### Step 4: Lite Framework-Dependent Single-File Publish (`R_PUB`)
Per `R_PUB`, **STRICTLY FORBID** `--self-contained true` distributions (which bundle the .NET runtime and bloat outputs to `70–160 MB`). Always package in **Lite Mode**, requiring the target host to have the matching .NET Runtime installed:

// turbo
```bash
dotnet publish <ProjectPath> -c Release -r win-x64 \
  --self-contained false \
  -p:PublishSingleFile=true \
  -p:IncludeNativeLibrariesForSelfExtract=true \
  -p:DebugType=embedded \
  -o ./publish/lite
```

#### MSBuild Packaging & Symbol Trade-Off Matrix

| MSBuild Property | Setting | Engineering Trade-Off & Rationale |
| :--- | :---: | :--- |
| **`SelfContained`** | `false` (**Mandatory**) | Excludes host .NET runtime; cuts artifact footprint by $75\%–90\%$. |
| **`PublishSingleFile`** | `true` (**Mandatory**) | Bundles managed DLLs into one `.exe` entry point to prevent DLL-hell. |
| **`IncludeNativeLibrariesForSelfExtract`** | `true` (Native/PInvoke) | Embeds native `.dll` files (SQLite, DevExpress) for runtime self-extraction. |
| **`EnableCompressionInSingleFile`** | `false` (Lite) | Avoids startup decompression CPU overhead; only used in self-contained builds. |
| **`DebugType`** | `embedded` | Preserves stack trace line numbers for ERP telemetry without loose `.pdb` files. |
| **`PublishTrimmed`** | `false` (**Mandatory**) | **Prohibited** for WinForms/WPF/Dapper apps as IL trimming breaks reflection. |

---

### Step 5: Binary Footprint & SHA-256 Checksum Verification
Verify generated executable size bounds and compute its SHA-256 digest:

// turbo
```powershell
Get-ChildItem ./publish/lite | Select-Object Name, @{N="SizeKB";E={[math]::Round($_.Length/1KB,1)}}
Get-FileHash ./publish/lite/*.exe -Algorithm SHA256
```

| Application Tier | Lite Target Bound | Violation Threshold | Root Cause of Bloat |
| :--- | :---: | :---: | :--- |
| **CLI Tool / Worker** | `150 KB – 2.5 MB` | `> 15 MB` | Accidental `--self-contained true` or embedded test assets. |
| **ASP.NET Core WebAPI** | `2.0 MB – 12.0 MB` | `> 40 MB` | Bundled client `node_modules` or unexcluded debug symbols. |
| **WinForms / WPF Client** | `8.0 MB – 35.0 MB` | `> 85 MB` | Self-contained runtime bundled or duplicate satellite folders. |

---

### Step 6: Atomic Release Tag & Forward-Only Rollback (`R_VER`)
1. **Tag Release:** `git tag -a v1.2.0 -m "chore(release): v1.2.0 Lite distribution"`
2. **Forward-Only Rollback Protocol:**
   - **Never overwrite or delete a pushed release tag** (`git tag -f` is strictly prohibited).
   - On critical post-publish defects: quarantine the faulty binary, `git revert <sha>` or apply a hotfix, increment `PATCH` (`v1.2.0` $\to$ `v1.2.1`), and re-run Steps 1–5.



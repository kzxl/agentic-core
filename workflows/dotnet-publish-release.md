---
name: DotnetPublishReleaseWorkflow
desc: Automated .NET build, test, and dual-mode publish workflow (Full self-contained vs Lite framework-dependent)
rules: [R_PUB, R_CS]
category: Workflows
---
# 📦 .NET Publish & Release Packaging Workflow

**Goal:** Build, test, and publish .NET desktop and WebAPI applications into self-contained or framework-dependent single-file distributions adhering to `R_PUB`.

---

### Step 1: Pre-Publish Clean & Build Check
Ensure workspace is clean and compiles with zero warnings/errors:
// turbo
```bash
dotnet clean
dotnet restore
dotnet build -c Release
```

### Step 2: Automated Test Execution
Run all unit and integration tests before packaging:
// turbo
```bash
dotnet test -c Release --no-build --verbosity normal
```

### Step 3: Option A — Full Publish (Self-Contained Single File)
Creates a completely standalone `.exe` bundle with embedded .NET runtime (Copy & Run without runtime pre-installed):
// turbo
```bash
dotnet publish <ProjectPath> -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o ./publish/full
```

### Step 4: Option B — Lite Publish (Framework-Dependent Single File)
Creates a lightweight `.exe` binary requiring .NET Runtime on the host machine:
// turbo
```bash
dotnet publish <ProjectPath> -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o ./publish/lite
```

### Step 5: Verify Binary Artifacts
Verify that output executables exist and check file sizes:
// turbo
```bash
dir ./publish/full
dir ./publish/lite
```

### Step 6: Git Tag & Release Checkpoint
Tag the release commit:
```bash
git tag -a v1.0.0 -m "Release v1.0.0 (Full + Lite binaries generated)"
```

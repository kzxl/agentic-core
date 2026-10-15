---
name: dotnet-publish-release
description: Build, test, and publish .NET desktop and WebAPI applications into lightweight, framework-dependent single-file distributions adhering to R_PUB.
desc: Build, test, and publish .NET desktop and WebAPI applications into lightweight, framework-dependent single-file distributions adhering to R_PUB.
rules: [R_PUB, R_VER, R_CS, R_PROOF]
---

# .NET Publish & Release Packaging Workflow

**Goal:** Build, test, and publish .NET desktop and WebAPI applications into lightweight, framework-dependent single-file distributions adhering to `R_PUB`.

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

### Step 3: Lite Publish (Framework-Dependent Single File)
Creates a lightweight `.exe` binary requiring .NET Runtime on the host machine (fast packaging, small release footprint):
// turbo
```bash
dotnet publish <ProjectPath> -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o ./publish/lite
```

### Step 4: Verify Binary Artifacts
Verify that output executables exist and check file sizes:
// turbo
```bash
dir ./publish/lite
```

### Step 5: Git Tag & Release Checkpoint
Tag the release commit:
```bash
git tag -a v1.0.0 -m "Release v1.0.0 (Lite binary generated)"
```

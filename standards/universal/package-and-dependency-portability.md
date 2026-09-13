---
desc: Package and dependency governance, public registry precedence, and local path prohibition
rules: [R_CORE, R_PKG]
---
# 📦 Package & Dependency Portability Standards

## 1. Zero Machine-Specific Absolute Paths
- **Strict Prohibition:** NEVER commit hardcoded absolute filesystem paths (e.g. `E:\15. Other\...`, `C:\Users\<username>\...`) into `nuget.config`, `.csproj`, `package.json`, or environment configuration files.
- **Root Cause:** Hardcoded developer-specific paths immediately break repository builds when cloned onto other developer workstations, containerized environments, or CI/CD pipelines.

## 2. Public Registry Precedence
- **Online Standard:** Always configure dependencies to resolve primarily through official public online package registries:
  - .NET: `https://api.nuget.org/v3/index.json`
  - Node.js: `https://registry.npmjs.org/`
  - Python: `https://pypi.org/simple`
- **Internal/Self-Published Packages:** When consuming internal ecosystem packages (e.g., `ZeroGraphics`, `ZeroUI`), verify whether the packages are published to official registries before introducing custom feeds. If published on `nuget.org`, use `nuget.org` as the Single Source of Truth (SSoT).

## 3. Local Development Fallback Protocol
- **Offline / Active In-Development Libraries:** If a local build artifact must be consumed during local prototyping:
  1. **Relative Paths Only:** Package paths in repository-level configurations must be relative to the repository root (e.g. `./packages` or `../libs/dist/packages`).
  2. **Environment Variable Injection:** Alternatively, pass local directory feeds via CLI flags (e.g. `dotnet restore -s <path>`) or environment variables rather than hardcoding in tracked config files.
  3. **Clean-Up Before Commit:** Verify `git diff nuget.config` before committing to ensure no private drive letters or user-specific paths are tracked.

## 4. Portability Verification Gate
- Before closing any feature or refactoring task involving dependencies, verify:
  ```bash
  dotnet restore --force
  dotnet build --no-restore
  ```
- Ensure the build succeeds cleanly without requiring any untracked or machine-bound resources.

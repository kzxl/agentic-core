---
name: AgenticBlastRadiusAnalysis
desc: Pre-edit blast-radius grep analysis for shared classes, contracts, and core methods to prevent cascading regressions
rules: [R_CORE]
category: Agentic
---
# 💥 Agentic Blast-Radius Analysis Protocol

**Goal:** Quantify and control the blast radius before modifying shared methods, base classes, database schemas, or public API contracts. Eliminate "fix one place, break ten callers" regressions.

---

## 1. The Pre-Edit Grep Rule

Before modifying any non-private method, shared service, utility function, or contract, execute a mandatory caller scan:

```bash
# C# Example (Direct call, nameof, and string references)
rg "(\bMethodName\(|nameof\(MethodName\)|'MethodName'|\"MethodName\")" --type cs

# TypeScript / JavaScript Example (Direct import/call and string lookup)
rg "(\bfunctionOrExportName\b|'functionOrExportName'|\"functionOrExportName\")" --type ts --type js

# SQL Column / Table Example
rg "(\bcolumn_or_table_name\b)" --type sql --type cs --type ts --type js
```

---

## 2. Blast-Radius Classification Matrix

| Caller Count | Risk Level | Execution Protocol |
| :--- | :---: | :--- |
| **0 Callers** | **Dead Code** | Apply `PONY` &rarr; Delete or verify if it is an external entry point. |
| **1 – 2 Callers** | **Low Radius** | Safe to modify directly; verify all callers in the same diff. |
| **3 – 9 Callers** | **Medium Radius** | **Root-Cause Fix:** Fix inside the shared method without changing the method signature. |
| **10+ Callers** | **High Radius / Critical** | **Strict Backward Compatibility:** Do NOT change signature or semantics. Create an overload or migrate incrementally. |

---

## 3. The 3 Immutable Invariants
1. **Never alter public signatures with high blast radius** unless all callers are updated and verified in the same pull request.
2. **Prefer Fix-at-Root over Multi-Caller Patches:** A single defensive guard in the shared helper is cleaner than patching 10 separate caller files.
3. **Always Run Regression Build/Tests:** Build the entire project or run full test suite immediately after modifying shared code.

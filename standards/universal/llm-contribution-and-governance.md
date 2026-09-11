---
title: LLM Contribution and Clean-Room Governance Standard
desc: Strict standard for AI code transparency, Clean-Room IP protection, GNU copyright compliance, and bare-metal hardware safety
rules: [R_CORE, R_LLM_GOV, R_EMBEDDED, R_GIT]
---
# ⚖️ LLM Contribution & Clean-Room Governance Standard

**Goal:** Establish definitive legal, architectural, and safety boundaries for incorporating AI-assisted engineering into open-source projects, enterprise codebases, and bare-metal embedded systems without copyright violation, IP contamination, or hardware instability.

---

## 1. Transparency & Disclosure Mandate (`LLM_POLICY.md` Compliance)

When contributing code to community repositories or projects with explicit AI policies:
- **Mandatory Disclosure**: Disclose clearly whether a contribution was **LLM-Guided** (human-driven architecture with AI validation) or **LLM-Assisted** (mathematical calculations, boilerplate extraction).
- **Prohibited**: Blindly submitting unverified, black-box AI-generated code.
- **Rationale**: Maintainers require full provenance context to audit against subtle AI hallucinations, invented APIs, or unsafe concurrency assumptions.

---

## 2. Legal Boundary: GNU Copyright Threshold & IP Hygiene

International copyright law treats LLMs as non-legal entities; legal accountability rests solely on the human contributor.
- **GNU De Minimis Threshold**: Changes of **fewer than 15 lines** of code, mechanical renames, or localized syntax fixes are legally insignificant for independent copyright claims.
- **Substantial Code Rule**: Substantial blocks of code generated directly by LLMs must **NOT** be copied verbatim into target codebases, as training provenance cannot be audited against copyrighted upstream sources.
- **The "Learn & Interpret" Principle**: Contributors are explicitly permitted to use LLMs to learn algorithms, understand system flows, and extract mathematical formulas. The resulting implementation code must be the contributor's **own original work**, matching the project's idiomatic conventions.

---

## 3. Clean-Room Implementation Protocol

To maintain complete IP immunity, follow the classical **Clean-Room Design** workflow:

```text
┌─────────────────────────┐         ┌─────────────────────────┐
│     AI Specification    │         │  Human Implementation   │
│  - Mathematical models  │ ──────► │  - Idiomatic C/C# code  │
│  - Boundary analysis    │         │  - SSoT register bounds │
│  - Algorithmic formulas │         │  - Native verification  │
└─────────────────────────┘         └─────────────────────────┘
```

1. **Step 1 (Algorithmic Formulation)**: Prompt LLM for equations, data structures, and edge-case invariants (e.g., optical Depth of Field formulas, YUV luma bitshifts).
2. **Step 2 (Human Clean Synthesis)**: Author the production code independently based on the derived mathematical specification, adhering to the codebase's local paradigms.
3. **Step 3 (Zero-Line Verbatim Audit)**: Verify that the committed code is an original implementation rather than a direct copy-paste of LLM output.

---

## 4. Bare-Metal & Embedded Hardware Safety Invariants

In embedded systems, RTOS environments (e.g., Canon DryOS, FreeRTOS, Zephyr), and kernel drivers:
- **Zero Unverified MMIO Registers**: LLMs frequently hallucinate register offsets (`0xC0...`). Never write to memory-mapped I/O (MMIO) registers proposed by an AI without:
  1. Direct empirical verification against hardware ROM dumps or disassemblies (Ghidra/IDA).
  2. Cross-referencing against verified repository Single Source of Truth (`consts.h`, `stubs.S`).
- **Zero Dynamic Allocation in Hot Loops**: Strictly forbid dynamic heap allocations (`malloc`, `fio_malloc`) inside frame loops, DMA callbacks, or interrupt service routines (ISRs) to prevent Out-of-Memory (OOM) deadlocks.
- **Fail-Safe Fallback**: Every hardware-interfacing routine must gracefully disengage and return safe fallback values if preconditions or device states diverge.

---

## 5. Transparency Statement Template (PR & Commit Protocol)

When publishing PRs or community modules developed with AI assistance, append this verified disclosure:

```markdown
### Provenance & LLM Policy Compliance Statement
- **Contributor**: [Author Name / Handle]
- **AI Role**: Architectural advisor & mathematical modeling (DoF equations, memory boundary calculation).
- **Clean-Room Verification**: All code authored independently; no copyrighted training output copied.
- **Hardware Audit**: All MMIO registers verified against ROM dump; zero unverified addresses.
- **Memory Safety**: Zero dynamic heap allocations in hot/rendering loops; bounds verified.
```

---

## 6. Evidence & Ground-Truth Verification Matrix (`R_ENG_OS`)

| Information Category | Ground-Truth Authority (SSoT) | Advisory (Must Verify) | Unacceptable (Immediate Reject) |
| :--- | :--- | :--- | :--- |
| **MMIO Registers & Offsets** | `consts.h`, `internals.h`, ROM dump (Ghidra) | Hardware datasheets, developer notes | Speculative hex addresses generated by AI |
| **RTOS Function Signatures** | `stubs.S`, `dryos.h`, system disassembly | Forum threads, unverified ports | Hallucinated function pointer tables |
| **Compilation & Syntax** | Native compiler stdout/stderr, `exit code 0` | AI-predicted compilation success | "Should compile cleanly" without execution |
| **Memory Boundaries** | VRAM structs, `vram_info`, hardware pitch | Typical desktop resolutions | Blind assumptions about stack/heap limits |

> [!CAUTION]
> **Hard Invariant**: If an AI Assistant suggests touching an unverified address or cannot cite the exact file path and line number of an active SSoT symbol, the change MUST be blocked immediately. Evidence precedes execution.


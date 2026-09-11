---
name: AgenticCleanRoomGovernance
desc: Clean-Room IP protocol, GNU copyright compliance, MMIO hardware verification, and LLM contribution transparency
rules: [R_CORE, R_LLM_GOV, R_EMBEDDED, R_GIT]
category: Agentic
---
# 🛡️ Clean-Room IP & Governance Protocol

**Goal:** Ensure 100% legal compliance, zero IP contamination, and absolute hardware stability when developing software with AI/LLM assistance for open-source or mission-critical projects.

---

## 1. The 4-Step Clean-Room Execution Protocol

Execute sequentially whenever an engineering task involves external contributions, open-source repositories, or embedded hardware:

```text
[Step 1: Size & IP Gate] ──► [Step 2: Clean Synthesis] ──► [Step 3: Hardware Verification] ──► [Step 4: Disclosure]
```

### Step 1: Copyright & Scope Gate
- **Assess Change Size**:
  - Is the proposed change $< 15$ lines of glue code, mechanical refactoring, or a localized bugfix?
  *If YES:* Falls within GNU de minimis threshold; legally insignificant for independent copyright.
  *If NO:* Substantial contribution &rarr; Proceed strictly via Clean-Room protocol in Step 2.
- **Strict Prohibition**: Never copy raw code chunks $> 15$ lines directly from LLM output into public PRs.

### Step 2: Clean-Room Synthesis
- **Extract Spec, Not Code**:
  - Extract the underlying algorithm, mathematical formulas (e.g., bitwise shift ratios, DoF equations, state machine states).
  - Discard the generated syntactic implementation.
- **Author Original Code**:
  - Write fresh, idiomatic code tailored specifically to the target repository's conventions (e.g., matching Magic Lantern `MODULE_CBR`, `vram_info`, or Linux kernel coding style).
  - Ensure zero residual verbatim overlap with copyrighted or training-set source material.

### Step 3: Embedded Hardware Evidence Verification (`R_EMBEDDED`)
When interacting with memory-mapped I/O (MMIO), DMA controllers, or camera RTOS registers:
- **Rule of Zero Speculation**: Never accept an unverified hardware address (`0xC0...`, `0x80...`) emitted by an LLM.
- **Evidence Cross-Check**:
  1. Confirm the register address exists in the project's verified hardware header (`consts.h`, `internals.h`, `stubs.S`).
  2. If missing from headers, require an empirical memory dump from firmware or disassembly confirmation before committing.
- **Zero-Alloc Hot Loop Audit**: Verify that all loops running at $\ge 30\text{ fps}$ or inside ISRs perform **zero dynamic heap allocation** (`malloc`, `fio_malloc`). Use stack variables or statically pre-allocated buffers.

### Step 4: Automated Transparency Disclosure
Before submitting a PR or pushing a public commit, generate an authentic compliance statement:

```markdown
### LLM Policy Compliance Note
- **Contribution Type**: Clean-room implementation assisted by LLM.
- **AI Scope**: Algorithm derivation and mathematical verification.
- **Originality**: All source code authored independently according to repository conventions.
- **Verification**: Verified via clean compilation and empirical hardware/QEMU testing.
```

---

## 2. Fast Decision Matrix

| Scenario | Allowed Action | Required Guard |
| :--- | :--- | :--- |
| **Fix typo / rename 50 variables** | Direct AI edit | GNU mechanical exemption satisfied |
| **Derive complex math equation** | AI-formulated equation | Human writes production implementation |
| **New module / full feature (>100 lines)** | Clean-room synthesis ONLY | Full independent rewrite & transparency note |
| **Targeting hardware MMIO registers** | Empirical verification ONLY | Reject AI guesses without ROM dump proof |
| **Tight rendering/DMA loop** | Zero dynamic heap allocation | Pre-allocated static display buffers |

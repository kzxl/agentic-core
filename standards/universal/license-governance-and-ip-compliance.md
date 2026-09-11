---
title: License Governance, IP Compliance, and Clean-Room Engineering Standard
desc: Strict enterprise standard for software license taxonomy, license recognition, license initialization, and preventing copyrighted/GPL code contamination
rules: [R_CORE, R_LLM_GOV, R_LICENSE]
---
# 📜 License Governance & Intellectual Property (IP) Compliance Standard

**Goal:** Establish strict legal, architectural, and procedural invariants for identifying, initializing, and managing software licenses, while preventing catastrophic IP contamination (GPL poisoning, proprietary leakage, unauthorized code copy-paste) across sovereign, commercial, and open-source codebases.

---

## 1. The 4-Tier License Taxonomy & Compatibility Matrix

Every software component, dependency, or referenced snippet must be categorized into one of four distinct legal tiers before incorporation:

| Tier | License Family | Representative Licenses | Permissible Usage in Sovereign Ecosystem | Legal Implications & Invariants |
| :---: | :--- | :--- | :---: | :--- |
| **Tier 1** | **Ultra-Permissive** | **MIT**, Apache 2.0, BSD-2/3-Clause, ISC | ✅ **Full Compatibility** | Can be redistributed, sublicensed, closed-source, or incorporated into commercial products with minimal attribution notice. |
| **Tier 2** | **Weak Copyleft** | LGPL v2.1/v3.0, MPL 2.0, EPL 2.0 | ⚠️ **Conditional (Dynamic Only)** | Permitted **ONLY** via dynamic linking (`.dll`, `.so`). **Strictly prohibited** from static linking into bare-metal MCU firmware (`.a`/`.elf`) or single-file `.NET` executables. |
| **Tier 3** | **Strong / Viral Copyleft** | **GPL v2/v3**, **AGPL v3**, SSPL, OSL | ❌ **STRICTLY PROHIBITED** | **VIRAL CONTAMINATION**: Linking or copying code forces the *entire* encompassing codebase to be open-sourced under GPL. Never merge, copy, or statically link. |
| **Tier 4** | **Proprietary & Commercial** | Vendor NDA, Closed SDKs, Decompiled ROMs | ❌ **ZERO TOLERANCE** | Trade secret and statutory copyright infringement. No reverse-engineered proprietary snippets may ever enter clean codebases. |

---

## 2. License Recognition Protocol (Nhận diện Bản quyền)

Before consulting, adapting, or importing third-party code, execute the mandatory 4-point scan:

1. **SPDX Header Scan**: Check the first 10 lines of the source file for standard SPDX tags:
   ```c
   // SPDX-License-Identifier: MIT
   ```
2. **Repository Root License Audit**: Check repository root for `LICENSE`, `COPYING`, `LICENSE.md`, or `NOTICE`.
3. **Package Manifest Inspection**:
   - `.NET`: `<PackageLicenseExpression>` in `.csproj` or NuGet spec.
   - `Rust`: `license = "MIT"` in `Cargo.toml`.
   - `Node.js`: `"license": "..."` in `package.json`.
4. **The "Unlicensed = All Rights Reserved" Invariant**:
   > [!CAUTION]
   > Under international copyright treaties (Berne Convention), code published on GitHub/web without an explicit license is **NOT public domain**. It is legally **"All Rights Reserved"** by the author. You have **ZERO legal right** to copy, modify, or integrate unlicensed code.

---

## 3. License Initialization Standard (Khởi tạo Bản quyền)

### 3.1 Repository Root `LICENSE` File
All sovereign projects under the **ZeroUniverse** ecosystem default to the **MIT License**:

```text
MIT License

Copyright (c) <YEAR> Phong Võ

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 3.2 Standard Source File Headers (SPDX Tagging)
To ensure provenance clarity in individual distributed source files:
- **C / C++**:
  ```c
  /* SPDX-License-Identifier: MIT */
  /* Copyright (c) 2026 Phong Võ. All rights reserved. */
  ```
- **Rust**:
  ```rust
  // SPDX-License-Identifier: MIT
  // Copyright (c) 2026 Phong Võ. All rights reserved.
  ```
- **C#**:
  ```csharp
  // SPDX-License-Identifier: MIT
  // Copyright (c) 2026 Phong Võ. All rights reserved.
  ```

---

## 4. Anti-Contamination & Clean-Room Reimplementation Rules

To prevent copyright infringement, IP contamination, or statutory liability:

```text
   [UNSAFE SOURCE]                           [AIR GAP]                         [SOVEREIGN CODEBASE]
┌─────────────────────┐                                                    ┌───────────────────────────┐
│ GPL / Proprietary   │   1. Read algorithm & math                         │ Clean-Room Implementation │
│ External Codebase   │ ──────────────────────────► [Human/AI Memory] ───► │ 100% Original Syntax      │
│ (ST HAL, Linux, SO) │   2. CLOSE & ISOLATE                               │ Idiomatic Local Paradigms │
└─────────────────────┘      external files                                └───────────────────────────┘
```

### Rule 4.1 — Absolute Zero Copy-Paste Mandate
- **NEVER** copy-paste blocks of code directly from GPL-licensed projects (e.g., Linux kernel, GNU utilities), commercial SDKs, or reverse-engineered decompiler outputs.
- **StackOverflow Warning**: StackOverflow code snippets are licensed under **CC BY-SA 4.0** (Creative Commons Attribution-ShareAlike), which is copyleft and incompatible with proprietary/MIT closed distribution. Never copy non-trivial logic directly from StackOverflow.

### Rule 4.2 — Clean-Room Reimplementation Protocol
When implementing an established algorithm (e.g., CRC16, Kalman Filter, Kahn's DAG sorting, Gorilla Compression):
1. **Air-Gap Phase (Specification Extraction)**: Study the theoretical algorithm, mathematical equations, RFC, or whitepaper. Document the state transitions, data structures, and edge cases in abstract pseudocode.
2. **Close the Source**: Do not have the third-party implementation open on screen while writing code.
3. **Clean Synthesis**: Write the implementation from scratch, utilizing project-native primitives (`fw_span_t`, `Span<T>`, `Result`, idiomatic error codes).
4. **Verbatim Audit**: Ensure the variable names, structure layouts, and code style reflect the project's sovereign architecture, not the third-party artifact.

---

## 5. Agent Governance Checklist (`R_LICENSE`)

Before committing any newly introduced or modified files:
- [ ] Has a valid `LICENSE` file been created in the repository root?
- [ ] Does every newly authored file include the standardized SPDX identifier?
- [ ] Have all referenced algorithms been authored via the Clean-Room protocol without copy-paste?
- [ ] Is the codebase 100% free of viral GPL, AGPL, or restrictive commercial snippets?
- [ ] Do package manifests (`.csproj`, `Cargo.toml`, `package.json`) match the root license?

---
name: FirmwareExtractionAndHardwareAudit
desc: Extracting Embedded Firmware Dumps, Analyzing Bootloaders, Base Memory Mapping, and Secure Boot Auditing
rules: [R_CORE, R_SEC, R_REVERSE, R_EMBEDDED]
category: Reversing
---
# 🔌 Embedded Firmware Extraction & Hardware Reversing Protocol

**Goal:** Standardize procedures for analyzing embedded systems, extracting file systems and kernel images from raw SPI flash and eMMC memory dumps, locating Vector Interrupt Tables, establishing correct base memory maps in Ghidra for bare-metal binaries, and auditing Secure Boot verification chains.

---

## 1. Hardware & Firmware Triage Ladder

```text
  [Hardware Target / Flash Dump: SPI NOR / NAND / eMMC]
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 1. STATIC BINARY EXTRACTION (binwalk)                  │
│    • Scan for signatures (U-Boot, Linux, SquashFS)     │
│    • Extract filesystems & compressed kernels          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. BARE-METAL MEMORY MAP RESOLUTION                    │
│    • Locate Vector Interrupt Table (Reset Vector, SP)  │
│    • Calculate Flash Base & RAM Base addresses         │
│    • Configure Ghidra Memory Map                       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. BOOTLOADER & HARDWARE INTERFACE AUDIT               │
│    • U-Boot environment variables & autoboot delay     │
│    • UART console / JTAG / SWD probing                 │
│    • Secure Boot signature & cryptographic trust chain │
└────────────────────────────────────────────────────────┘
```

---

## 2. Firmware Extraction & Filesystem Unpacking

### Step 1: Signature Scan with `binwalk`
```bash
# Scan binary for embedded signatures and entropy
binwalk -B -E firmware.bin

# Recursive extraction of detected filesystems
binwalk -Me firmware.bin
```

### Common Embedded Signatures:
- **SquashFS**: Compressed read-only Linux root filesystem (`sqsh`).
- **U-Boot Image (`uImage`)**: Header `0x27051956` containing OS type, architecture, and load address.
- **Device Tree Blob (`dtb`)**: Header `0xD00DFEED` containing peripheral hardware register maps.
- **JFFS2 / UBIFS**: Flash memory file systems.

---

## 3. Bare-Metal Base Address Discovery (No PE/ELF Headers)

When reverse engineering raw ROM dumps (ARM Cortex-M, MIPS, RISC-V), there are no headers indicating the load address:

### ARM Cortex-M Vector Table Analysis:
1. The first 4 bytes at offset `0x0000` represent the **Initial Stack Pointer (SP)**:
   - Must point into the microcontroller's internal SRAM (e.g., `0x20004000`).
2. The second 4 bytes at offset `0x0004` represent the **Reset Handler Pointer**:
   - Points into the Flash memory where execution begins (e.g., `0x08000101`).
   - Note: In ARM Thumb-2, the least significant bit (LSB) is `1` (indicating Thumb mode). The actual execution address is `0x08000100`.
3. **Calculating Base Address**:
   - If Reset Handler points to `0x08000101` and the binary's entry code begins at file offset `0x0100`:
   $$\text{Base Address} = 0x08000100 - 0x0100 = 0x08000000$$
4. **Configuring Ghidra**:
   - Architecture: `ARM:LE:32:Cortex` (Thumb mode enabled).
   - Set Base Address in Options: `0x08000000`.

---

## 4. Bootloader & Hardware Interface Security Audit

### A. U-Boot Console Auditing
1. Connect via USB-to-UART bridge (Baud: 115200, 8-N-1):
   - Check if `bootdelay` is enabled ($> 0$). Press key to drop into U-Boot shell (`=>`).
2. Inspect environment variables:
   ```text
   => printenv
   ```
3. Audit critical security parameters:
   - `bootargs`: Look for `console=ttyS0` or `init=/bin/sh` bypasses.
   - `bootcmd`: Verify if firmware updates authenticate cryptographic signatures (`fitImage` verification).

### B. Secure Boot Verification Chain
Trace the chain-of-trust from Hardware ROM to Application layer:
1. **Root of Trust (RoT)**: Is public key hash burned into One-Time Programmable (OTP) eFuses?
2. **First-Stage Bootloader (FSBL)**: Verifies digital signature of U-Boot.
3. **U-Boot FIT Image**: Verifies RSA/ECDSA signature of kernel (`zImage`) and device tree (`.dtb`).
4. **DM-Verity**: Read-only block integrity verification on root filesystem partitions.

---

## 5. Verification & Audit Checklist
- [ ] Raw dump hashes recorded prior to processing.
- [ ] Hardware voltage levels verified (3.3V vs 1.8V) before connecting UART/SWD probes to prevent chip damage.
- [ ] Memory base address verified by checking that strings and pointer tables resolve to valid cross-references.

---
name: ReverseEngineeringPlaybook
desc: Comprehensive Artifact-Driven Reverse Engineering Playbook for Android APK, Native Binaries, .NET C# Assemblies, and Web JS
rules: [R_CORE, R_CPP, R_CS, R_ANDROID, R_SEC]
category: Security
---
# 🔬 Multi-Target Reverse Engineering Playbook

**Goal:** Standardize decompilation, unpacking, anti-analysis bypass, symbol recovery, and dynamic instrumentation workflows across mobile, native binaries, managed runtimes, and web environments.

---

## 1. Target Triage Matrix

```
                          TARGET ARTIFACT RECEIVED
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       ▼                             ▼                             ▼
[Android APK / AAR]         [Native PE / ELF / Mach-O]    [.NET / C# Assembly]
 • jadx / apktool            • IDA Pro / Ghidra / radare2  • dnSpyEx / dnlib
 • Frida / Xposed / Objen    • Binary Diffing (Ghidriff)   • de4dot Deobfuscator
 • JNI Native .so Hook       • Memory Dumps / Unpacking    • IL Patching & Rebuild
```

---

## 2. Platform-Specific Action Ladders

### A. Android APK / AAR Reverse Engineering
1. **Static Surface Mapping**:
   - Decompile with `jadx-gui` or CLI `jadx -d out/ target.apk`.
   - Inspect `AndroidManifest.xml` (Exported Activities, Receivers, Custom Permissions, Deep Links).
   - Locate cryptographic signature algorithms, API endpoints, and root detection routines.
2. **Resource & Smali Unpacking**:
   - Run `apktool d target.apk -o apk_source/` to extract resources, smali bytecode, and assets.
3. **Dynamic Instrumentation (Frida)**:
   - Bypass SSL Pinning: Inject standard Universal Certificate Pinning bypass scripts.
   - Hook JNI native boundaries (`System.loadLibrary`, `FindClass`, `RegisterNatives`).
4. **Native `.so` Analysis**:
   - Extract `.so` from `lib/arm64-v8a/` and analyze via Ghidra / IDA Pro for control flow flattening or OLLVM protections.

### B. Native Binaries (x86_64 / ARM64 PE, ELF)
1. **Header & Security Mitigations Check**:
   - Windows: Check ASLR, DEP, SafeSEH, Control Flow Guard (CFG) via `dumpbin /headers`.
   - Linux: Check NX, PIE, Canary, RELRO via `checksec --file=target`.
2. **Disassembly & Decompilation**:
   - Perform cross-reference (Xref) analysis on sensitive APIs (`VirtualAlloc`, `CreateRemoteThread`, `mprotect`, `ptrace`).
   - Use Binary Diffing (`ghidriff` / `Diaphora`) when analyzing N-day patch updates.
3. **Anti-Debugging & EDR Bypass**:
   - Detect `IsDebuggerPresent`, `NtQueryInformationProcess`, hardware breakpoints, and timing checks (`RDTSC`).
   - Employ direct/indirect syscalls (`SysWhispers`, `Hell's Gate`) to evade userland API hooks.

### C. .NET / C# Managed Assemblies
1. **Deobfuscation**:
   - Identify protector (ConfuserEx, .NET Reactor, SmartAssembly, Eazfuscator).
   - Clean assembly using `de4dot target.dll -o cleaned.dll`.
2. **Decompilation & IL Analysis**:
   - Open in `dnSpyEx` or `ILSpy`.
   - Analyze reflection logic (`Assembly.Load`, `MethodInfo.Invoke`, encrypted resource streams).
3. **Hot-Patching & Re-Compilation**:
   - Modify IL instructions directly in dnSpy, recalculate PE checksums, and verify strong-name signatures.

### D. Frontend Web & JavaScript Encryption
1. **Source Recovery**:
   - Search for exposed Source Maps (`.js.map`) to recover original TypeScript/ES6 source trees.
2. **AST Deobfuscation**:
   - Extract string arrays, decode hex literals, and simplify dead control-flow branches via Babel AST scripts.
3. **Dynamic Crypto Hooking**:
   - Hook `CryptoJS.AES.encrypt`, `SubtleCrypto.encrypt`, or `JSON.stringify` using Chrome DevTools Protocol (CDP) or tampermonkey userscripts.

---

## 3. Toolchain Reference

| Domain | Primary Tools | Fallback / Specialist Tools |
| :--- | :--- | :--- |
| **Android** | `jadx`, `apktool`, `Frida` | `Objection`, `dex2jar`, `Apk-Signer` |
| **Native Disasm**| `Ghidra`, `IDA Pro` | `radare2 / Cutter`, `Binary Ninja`, `x64dbg` |
| **.NET C#** | `dnSpyEx`, `ILSpy` | `de4dot`, `dnlib CLI`, `AsmSpy` |
| **JS / Web** | `Chrome DevTools (CDP)` | `Playwright`, `Babel AST Transformer` |

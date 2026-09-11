---
name: Il2cppAndManagedRuntimeRecovery
desc: Reconstructing Unity IL2CPP Binaries, Global Metadata Dumps, and Generating C# Dummy Assemblies for Analysis
rules: [R_CORE, R_SEC, R_REVERSE, R_CS]
category: Reversing
---
# 🎮 Unity IL2CPP & Managed Runtime Recovery Protocol

**Goal:** Provide end-to-end procedures to restore symbol definitions, class hierarchies, method signatures, and field memory offsets from Unity IL2CPP compilations (`libil2cpp.so` / `GameAssembly.dll`) and `global-metadata.dat`, generating browsable C# dummy assemblies and Ghidra/IDA symbol scripts.

---

## 1. IL2CPP Architecture & Metadata Model

```text
               UNITY ENGINE BUILD PROCESS
 [C# Source Files] ──► [Mono Roslyn Compiler] ──► [IL Bytecode DLLs]
                                                        │
                                                        ▼ (il2cpp.exe)
 ┌───────────────────────────────────────┬───────────────────────────────────────┐
 │ `libil2cpp.so` / `GameAssembly.dll`   │ `global-metadata.dat`                 │
 │ (Compiled C++ machine code)           │ (Type definitions, method names,      │
 │ (Native stripped functions)           │  string literals, field offsets)      │
 └───────────────────┬───────────────────┴───────────────────┬───────────────────┘
                     │                                       │
                     └───────────────────┬───────────────────┘
                                         ▼
                                 [Il2CppDumper / Cpp2IL]
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
 [C# Dummy DLLs]                 [`dump.cs` / JSON]             [Ghidra / IDA Script]
 • Open in dnSpy / ILSpy         • Complete class catalog       • Auto-rename functions
 • Recover game models           • Method RVA offsets           • Restore struct types
```

---

## 2. Restoration Workflow

### Step 1: File Acquisition & Validation
Locate the two essential artifacts:
- **Binary**:
  - Android: `lib/arm64-v8a/libil2cpp.so`
  - Windows: `GameAssembly.dll`
- **Metadata**:
  - `assets/bin/Data/Managed/Metadata/global-metadata.dat`
- **Integrity Check**:
  - Inspect the first 4 bytes of `global-metadata.dat`. Magic header must be `0xFAB11BAF`.
  - Check metadata version (typically 24 to 29 in modern Unity).

### Step 2: Metadata Extraction (`Il2CppDumper` Execution)
Execute `Il2CppDumper` via command line:
```bash
Il2CppDumper.exe <path/to/libil2cpp.so> <path/to/global-metadata.dat> <output_dir>
```

#### Generated Output Artifacts:
1. **`dump.cs`**: C# header file containing all recovered classes, structs, properties, and method declarations with their respective Relative Virtual Addresses (RVAs).
2. **`script.json`**: Machine-readable JSON mapping RVAs to method names, signatures, and string literals.
3. **`DummyDll/`**: Complete folder of reconstructed, decompilable `.dll` assemblies (e.g., `Assembly-CSharp.dll`, `UnityEngine.CoreModule.dll`).
4. **`ida_with_struct_py3.py` / `ghidra_with_struct.py`**: Automated import scripts for disassemblers.

### Step 3: IDA Pro / Ghidra Symbol Restoration
1. Open the original `libil2cpp.so` in Ghidra or IDA Pro.
2. Allow initial auto-analysis to finish.
3. Run the generated script (`ghidra_with_struct.py`):
   - Overwrites generic subroutines (`sub_1A2B3C`) with authentic class-qualified names (`PlayerController$$TakeDamage`).
   - Injects type signatures and argument definitions into the symbol database.

---

## 3. Dynamic Runtime Hooking using Recovered RVAs

Once method RVAs are extracted from `dump.cs`, calculate the live function address by adding the module base address:

```javascript
// Frida Dynamic Hook for IL2CPP Method
const il2cppBase = Module.findBaseAddress("libil2cpp.so");

// RVA from dump.cs: // RVA: 0x0182C340 Offset: 0x0182C340 VA: 0x7E182C340
const takeDamageRVA = ptr("0x0182C340");
const pTakeDamage = il2cppBase.add(takeDamageRVA);

Interceptor.attach(pTakeDamage, {
  onEnter(args) {
    // args[0] = this pointer (PlayerController instance)
    // args[1] = damageAmount (int/float)
    // args[2] = MethodInfo* pointer
    console.log("[+] PlayerController.TakeDamage called!");
    console.log("    [>] This ptr: " + args[0]);
    console.log("    [>] Damage:   " + args[1].toInt32());
  },
  onLeave(retval) {
    // Inspect or modify return state
  }
});
```

---

## 4. Anti-Dumper & Metadata Protection Bypass

When developers obfuscate or encrypt `global-metadata.dat`:

1. **In-Memory Memory Dump (Bypass Custom Decryptors)**:
   - Unity must load the decrypted metadata into memory at startup before calling `il2cpp_init()`.
   - Hook `il2cpp_init` via Frida and dump the loaded metadata memory block:
   ```javascript
   const pIl2cppInit = Module.findExportByName("libil2cpp.so", "il2cpp_init");
   if (pIl2cppInit) {
     Interceptor.attach(pIl2cppInit, {
       onEnter(args) {
         console.log("[+] il2cpp_init reached. Scanning memory for 0xFAB11BAF header...");
         // Scan memory ranges for decrypted metadata header
       }
     });
   }
   ```
2. **Restore Zeroed Metadata Headers**:
   - If the first 4 bytes were deliberately wiped after initialization, write back `0xAF, 0x1B, 0xB1, 0xFA` to the dump file.

---

## 5. Verification & Audit Checklist
- [ ] Magic header `0xFAB11BAF` and metadata version verified.
- [ ] Generated `DummyDll/Assembly-CSharp.dll` loads without parsing exceptions in `ILSpy` or `dnSpyEx`.
- [ ] Method RVAs verified against live module base address in dynamic debugger.

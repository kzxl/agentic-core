---
name: BinaryDeobfuscationAndRecovery
desc: Symbolic Execution, Control Flow De-flattening, and Opaque Predicate Elimination Protocol for Obfuscated Binaries
rules: [R_CORE, R_SEC, R_REVERSE]
category: Reversing
---
# 🧩 Binary Deobfuscation & Control Flow Recovery Protocol

**Goal:** Provide systematic algorithms and symbolic execution workflows using `angr`, `Triton`, and Ghidra P-Code to defeat advanced software obfuscation techniques—specifically Control Flow Flattening (OLLVM), Bogus Control Flow, dead code insertion, and encrypted string tables.

---

## 1. Deobfuscation Architecture

```text
  [Obfuscated Binary Function]
               │
               ▼
┌─────────────────────────────────────────┐
│ 1. IDENTIFY STATE VARIABLE & DISPATCHER │
│    • Locate central switch/dispatcher   │
│    • Trace state variable mutations     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ 2. SYMBOLIC EXECUTION (angr / Triton)   │
│    • Symbolize state variable           │
│    • Explore from Block -> Dispatcher   │
│    • Resolve concrete successor states  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ 3. CONTROL FLOW GRAPH (CFG) REBUILD     │
│    • Patch dead dispatcher jumps        │
│    • Link true source to true target    │
│    • NOP out opaque predicates          │
└─────────────────────────────────────────┘
```

---

## 2. De-flattening Algorithm (OLLVM Switch Flattening)

Control flow flattening transforms structured functions into a single giant loop containing a `switch` statement governed by an artificial state variable $s$:

### Step 1: Component Identification
1. **Dispatcher Block ($B_{\text{disp}}$)**: The basic block containing the jump table or cascaded conditional branches checking $s$.
2. **Relevant Blocks ($\mathcal{B}_{\text{rel}}$)**: Basic blocks executing genuine business logic before updating $s$.
3. **Pre-Dispatcher**: The block that initializes $s$.
4. **Return Blocks**: Blocks exiting the function.

### Step 2: Symbolic Path Exploration (`angr` Python Recipe)
```python
import angr
import claripy

def deflatten_function(binary_path, func_addr, dispatcher_addr):
    project = angr.Project(binary_path, load_options={'auto_load_libs': False})
    cfg = project.analyses.CFGFast()
    
    # Identify relevant basic blocks (excluding dispatcher and sub-dispatchers)
    func = cfg.kb.functions[func_addr]
    relevant_blocks = [b for b in func.blocks if b.addr != dispatcher_addr]
    
    recovered_edges = []
    
    for block in relevant_blocks:
        # Start symbolic execution at the beginning of the relevant block
        state = project.factory.blank_state(addr=block.addr)
        simgr = project.factory.simulation_manager(state)
        
        # Step until reaching dispatcher or function return
        while simgr.active:
            simgr.step()
            for active_state in simgr.active:
                if active_state.addr == dispatcher_addr:
                    # Found state update! Step one more time through dispatcher
                    next_simgr = project.factory.simulation_manager(active_state)
                    next_simgr.step()
                    for successor in next_simgr.active:
                        if successor.addr in [b.addr for b in relevant_blocks]:
                            recovered_edges.append((block.addr, successor.addr))
                            print(f"[+] Edge Recovered: {hex(block.addr)} -> {hex(successor.addr)}")
                    simgr.active.remove(active_state)

    return recovered_edges
```

### Step 3: Binary Patching & Clean Decompilation
1. Replace the indirect jump at the end of each relevant block with a direct `JMP <recovered_target>`.
2. Replace conditional branches governed by the state variable with direct conditional jumps `JZ / JNZ`.
3. Fill bypassed dispatcher blocks with `NOP` instructions (`0x90` on x86, `0x1F2003D5` on ARM64).
4. Re-open the patched binary in Ghidra / IDA Pro: the decompiled pseudocode will restore standard `if-else`, `while`, and `for` loops.

---

## 3. Opaque Predicate Elimination

Opaque predicates evaluate to a constant boolean value (always true or always false) at runtime, inserting unreachable junk code:

1. **Detection**:
   - Trace conditional jumps $J_{cc}$ using SMT solvers (Z3).
   - If constraint $\text{Condition} \land \neg \text{Condition}$ is unsatisfiable (`unsat`), the branch is invariant.
2. **Elimination Recipe**:
   - If always true: Replace conditional jump (`JZ/JNZ`) with unconditional `JMP`.
   - If always false: Replace jump with `NOP`s to let execution fall through naturally.

---

## 4. String Table Decryption via Emulation

Obfuscators often encrypt all literal strings and decrypt them dynamically during `.init_array` / PE TLS callbacks:

```python
import unicorn
from unicorn.x86_const import *

# Emulate standalone decryption routine without executing entire malware payload
def emulate_string_decryptor(code_bytes, encrypted_buffer):
    mu = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
    
    BASE_CODE = 0x400000
    BASE_DATA = 0x500000
    
    mu.mem_map(BASE_CODE, 0x1000)
    mu.mem_map(BASE_DATA, 0x1000)
    
    mu.mem_write(BASE_CODE, code_bytes)
    mu.mem_write(BASE_DATA, encrypted_buffer)
    
    # Setup registers (e.g., RDI points to data)
    mu.reg_write(UC_X86_REG_RDI, BASE_DATA)
    mu.reg_write(UC_X86_REG_RSI, len(encrypted_buffer))
    
    # Execute until ret
    mu.emu_start(BASE_CODE, BASE_CODE + len(code_bytes))
    
    decrypted = mu.mem_read(BASE_DATA, len(encrypted_buffer))
    return decrypted.split(b'\x00')[0].decode('utf-8', errors='ignore')
```

---

## 5. Verification & Audit Checklist
- [ ] Recovered edges verified against dynamic trace logs to ensure zero missing control paths.
- [ ] Patched binary re-hashed (SHA-256) and stored in isolated scratch directory (never overwrite original).
- [ ] Decompiled CFG produces single-entry single-exit structured loops in Ghidra/IDA.

---
name: DynamicInstrumentationAnalysis
desc: Deep Dynamic Instrumentation & Runtime Tracing Protocol for API Monitoring, SSL Pinning Bypass, JNI Hooking, and Memory Scanning
rules: [R_CORE, R_SEC, R_REVERSE]
category: Reversing
---
# 🔬 Dynamic Instrumentation & Runtime Tracing Protocol

**Goal:** Standardize runtime instrumentation workflows using Frida, eBPF, and dynamic debuggers to monitor execution flow, intercept sensitive API calls, inspect arguments/return values, bypass client-side transport security restrictions, and scan/patch memory non-destructively in a controlled sandbox.

---

## 1. Instrumentation Lifecycle & Safety Invariants

```text
  [Target Binary / App] ───► [Spawn / Attach with Frida Engine]
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
 [Hook Interceptor]           [Stalker Tracer]              [Memory Scanner]
 • Function entry/exit         • Basic block tracing        • Pattern searching (hex/regex)
 • Arg/return inspection       • Control flow coverage      • In-memory struct mapping
 • Transport unpinning         • Instruction recording      • Non-destructive live patch
```

### Safety Invariants:
1. **Isolated Sandbox Mandate (`R_REVERSE`)**: Always instrument inside an isolated analysis VM, container, or non-production hardware testbed.
2. **Minimal Hook Latency**: Keep JavaScript hook callbacks non-blocking (`send()` / asynchronous logging) to prevent timing-sensitive thread deadlocks.
3. **Memory Safety**: Never write out-of-bounds or corrupt heap control structures when applying in-memory dynamic patches.

---

## 2. Platform-Specific Hooking Playbook

### A. Android & JNI Native Interception
1. **Multi-Layer SSL Pinning Bypass**:
   - Hook both high-level Java trust managers (`TrustManagerImpl`, `OkHttpClient`) and low-level native OpenSSL/BoringSSL verification (`SSL_CTX_set_custom_verify`).
   ```javascript
   // Java TLS Bypass Pattern
   Java.perform(() => {
     const TrustManager = Java.use("javax.net.ssl.X509TrustManager");
     const SSLContext = Java.use("javax.net.ssl.SSLContext");
     const TrustManagerImpl = Java.registerClass({
       name: "com.agentic.TrustAllManager",
       implements: [TrustManager],
       methods: {
         checkClientTrusted(chain, authType) {},
         checkServerTrusted(chain, authType) {},
         getAcceptedIssuers() { return []; }
       }
     });
     const context = SSLContext.getInstance("TLS");
     context.init(null, [TrustManagerImpl.$new()], null);
     SSLContext.setDefault(context);
   });
   ```
2. **JNI Function Boundary Hooking**:
   - Intercept native registration (`RegisterNatives`) to dynamically resolve unexported native entry points:
   ```javascript
   Interceptor.attach(Module.findExportByName("libart.so", "_ZN3art3JNI15RegisterNativesEP7_JNIEnvP7_jclassPK15JNINativeMethodi") ||
                      Module.findExportByName(null, "RegisterNatives"), {
     onEnter(args) {
       const methods = args[2];
       const methodCount = args[3].toInt32();
       console.log(`[*] RegisterNatives called for ${methodCount} methods`);
       for (let i = 0; i < methodCount; i++) {
         const name = methods.add(i * Process.pointerSize * 3).readPointer().readCString();
         const sig = methods.add(i * Process.pointerSize * 3 + Process.pointerSize).readPointer().readCString();
         const fnPtr = methods.add(i * Process.pointerSize * 3 + Process.pointerSize * 2).readPointer();
         console.log(`    [+] Native Method: ${name} ${sig} -> ${fnPtr}`);
       }
     }
   });
   ```

### B. Windows PE & Native x86_64 Tracing
1. **Sensitive API Interception**:
   - Trace memory allocation, remote thread creation, and crypto handlers:
   ```javascript
   const pVirtualAlloc = Module.findExportByName("kernel32.dll", "VirtualAlloc");
   if (pVirtualAlloc) {
     Interceptor.attach(pVirtualAlloc, {
       onEnter(args) {
         this.size = args[1].toInt32();
         this.protect = args[3].toInt32();
       },
       onLeave(retval) {
         if (this.protect === 0x40) { // PAGE_EXECUTE_READWRITE
           console.log(`[!] RWX VirtualAlloc: Base=${retval}, Size=${this.size}`);
         }
       }
     });
   }
   ```
2. **Stalker Instruction-Level Tracing**:
   - Capture dynamic execution path through suspected packed/obfuscated routines without debugger detection:
   ```javascript
   Stalker.follow(Process.getCurrentThreadId(), {
     events: { call: true, ret: false, exec: false },
     onCallSummary(summary) {
       for (const target in summary) {
         console.log(`Called ${target}: ${summary[target]} times`);
       }
     }
   });
   ```

### C. Live Memory Pattern Scanning
Search for sensitive keys, tokens, or plaintext buffers loaded dynamically into process memory:
```javascript
const ranges = Process.enumerateRanges("rw-");
const targetHex = "48 89 5c 24 ?? 57 48 83 ec ??"; // Masked signature
ranges.forEach(range => {
  Memory.scan(range.base, range.size, targetHex, {
    onMatch(address, size) {
      console.log(`[+] Match found at ${address}`);
    },
    onError(reason) { /* Skip unreadable pages */ }
  });
});
```

---

## 3. Toolchain & Execution Commands

| Target | Command | Purpose |
| :--- | :--- | :--- |
| **Android Spawn** | `frida -U -f com.example.target -l hook.js --no-pause` | Spawn app with early-stage hooks active |
| **Windows Attach** | `frida -n target.exe -l hook.js` | Attach non-invasively to running native target |
| **RPC Dump** | `frida-ps -Uai` | List installed applications and running PIDs |
| **Symbol Tracing** | `frida-trace -U -i "EVP_*" com.example.target` | Auto-generate and attach crypto function traces |

---

## 4. Verification & Audit Checklist
- [ ] Sample executed exclusively within an isolated environment.
- [ ] Hook overhead does not cause target watchdog timer or ping timeout crashes.
- [ ] Dynamic addresses verified against static image base addresses via ASLR offset calculation.
- [ ] Discovered IOCs and memory artifacts hashed (SHA-256) and logged with execution timestamps.

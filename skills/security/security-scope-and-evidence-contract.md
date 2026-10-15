---
name: SecurityScopeAndEvidenceContract
desc: Ops Gate, Authorization Verification, Target Isolation Profiles, and Cryptographic Evidence Chains
rules: [R_CORE, R_SEC, R_STATE]
category: Security
---
# 🛡️ Security Scope & Cryptographic Evidence Contract (Ops Gate)

**Goal:** Enforce zero-trust pre-flight authorization verification (`.scope-contract.json` via `scope-guard.js`), strict target network isolation, non-destructive probing invariants, and SHA-256 cryptographic chain-of-custody evidence logging before and during any security audit or reverse-engineering workflow.

---

## 1. Quantitative Security Governance Invariants
| Governance Gate | Mandatory Threshold | Violation Consequence |
| :--- | :--- | :--- |
| **Pre-Flight Scope Check** | `auth.status === "granted"` verified via `scope-guard.js` | Immediate **HARD BLOCK** ($0$ packets or probes executed) |
| **Target Boundary Enforcement** | $100\%$ of requests match `allowed_hosts` / `allowed_cidrs` | Abort execution on out-of-scope redirect or DNS resolution |
| **Artifact Provenance** | SHA-256 digest computed before & after analysis | Rejects tampered or unverified binary/log evidence |
| **Destructive Payload Ban** | $0$ `DROP`/`TRUNCATE`, fork bombs, or live credential overwrites | Strict read-only / benign PoC verification only |
| **PII & Secret Sanitization** | Mask $> 75\%$ of captured tokens (`eyJ...REDACTED`) in reports | Prevents secondary credential leakage in audit artifacts |

---

## 2. The Pre-Flight Authorization Hard Gate (`scope-guard.js`)

```text
[Security / Pentest / RE Task Received]
                   │
                   ▼
[Execute: node tools/scope-guard.js verify .scope-contract.json]
                   │
     ┌─────────────┴─────────────┐
     ▼ (Exit Code 0: GRANTED)    ▼ (Exit Code != 0: MISSING / EXPIRED / DENIED)
[Activate Isolation Profile]  [STRICT HARD BLOCK]
 - offline-sample (Air-Gapped) - Zero network sockets or subprocess probes
 - ctf-sandbox (Container)     - Zero exploit payload generation
 - authorized-target-only      - Halt and request signed .scope-contract.json
```

### Valid `.scope-contract.json` Schema & Verification Protocol
Never treat a natural-language prompt (*"pentest example.com"*) as legal authorization. Verify a machine-readable scope contract:

```bash
# ❌ BAD: Running active scanner or curl probe directly from chat prompt without scope verification
curl -i -X POST "https://target.example.com/api/login" -d "' OR 1=1--"

# ✅ GOOD: Mandatory pre-flight scope-guard verification + SHA-256 target hashing before any inspection
node tools/scope-guard.js verify --contract .scope-contract.json --target "https://staging.internal.corp"
sha256sum ./samples/firmware_v2.bin > ./evidence/firmware_v2.sha256
```

```json
{
  "contractVersion": "1.0",
  "engagementId": "SEC-2026-104",
  "auth": {
    "status": "granted",
    "authorizedBy": "Security Architecture Board",
    "validFromUtc": "2026-10-01T00:00:00Z",
    "expiresAtUtc": "2026-10-31T23:59:59Z"
  },
  "isolationProfile": "authorized_target_only",
  "scope": {
    "allowedHosts": ["staging-api.internal.corp", "10.24.16.0/24"],
    "forbiddenPaths": ["/api/v1/admin/wipe", "/health/shutdown"],
    "maxRequestsPerSecond": 10
  }
}
```

---

## 3. Cryptographic Chain-of-Custody Evidence Record

Every confirmed vulnerability or binary reverse-engineering finding MUST be logged as an immutable evidence record binding the exact SHA-256 artifact digest, virtual address / source file offset, deterministic reproduction command, and redacted proof snippet:

```json
{
  "evidenceId": "EV-2026-001",
  "timestampUtc": "2026-10-15T16:10:00Z",
  "engagementId": "SEC-2026-104",
  "targetArtifact": "OrderService.dll",
  "artifactSha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  "location": "Features/Orders/OrderRepository.cs:L142 (Method: SearchOrdersAsync)",
  "cweId": "CWE-89",
  "cvssVector": "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N",
  "reproductionCommand": "dotnet test Tests/Security/OrderSqlInjectionReproTests.cs --filter VerifyOrderByParameterization",
  "redactedProofSnippet": "SqlException: Unclosed quotation mark after the character string 'OrderDate DESC;'."
}
```

---

## 4. Offline Sample Quarantine & Escalation Rules
1. **Static-First Binary Analysis (`offline-sample`):** When analyzing untrusted binaries, APKs, or firmware images, execute static disassembly/decompilation (`objdump`, `readelf`, `rabin2`, `bin-triage.js`) first. Never execute an untrusted binary on the host OS.
2. **Immediate Critical Halt:** Upon verifying an unauthenticated Remote Code Execution (`RCE`), SQL Injection, or hardcoded production master key (`CVSS >= 9.0`), immediately halt further active probing and deliver the containment and remediation patch.


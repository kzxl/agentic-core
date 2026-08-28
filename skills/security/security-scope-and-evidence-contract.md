---
name: SecurityScopeAndEvidenceContract
desc: Ops Gate, Authorization Verification, Target Isolation Profiles, and Cryptographic Evidence Chains
rules: [R_CORE, R_SEC, R_STATE]
category: Security
---
# 🛡️ Security Scope & Evidence Contract (Ops Gate)

**Goal:** Ensure 100% legal authorization, strict target isolation, and cryptographic immutability of findings before and during any security testing, penetration testing, or reverse engineering task.

---

## 1. The Precedent-Auth Hard Gate

```text
[Task Received] ──► [Inspect scope.md / Case Context]
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
[auth.status == granted]       [auth.status != granted]
         │                                 │
         ▼                                 ▼
[Allow Target Execution]        [STRICT HARD BLOCK]
                                - Prohibit any network request
                                - Prohibit executing active exploits
                                - Prompt user for authorization scope
```

### Authorization Scope Rules
1. **Never Assume Authorization**: Mentioning a target URL or domain is **NOT** authorization.
2. **Authorized Profiles**:
   - `offline-sample`: Local binary, isolated VM, no network traffic allowed.
   - `authorized_target_only`: Network traffic strictly constrained to explicitly approved IP/domain white-lists.
   - `ctf-sandbox`: Isolated CTF challenge container environment.

---

## 2. Evidence Integrity & Chain of Custody

Every reported vulnerability, reverse engineering discovery, or defect MUST be recorded with complete cryptographic and reproducible proof:

```json
{
  "EvidenceId": "E-001",
  "TimestampUtc": "2026-08-28T14:30:00Z",
  "TargetArtifact": "target.apk",
  "ArtifactSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "OffsetOrSymbol": "com.example.crypto.Signer.generateSignature()",
  "ReproductionCommand": "frida -U -f com.example.app -l hook.js --no-pause",
  "RawProofSnippet": "[+] Intercepted AES Key: 323032365f5345435245545f4b455921"
}
```

---

## 3. Strict Boundary Rules
- **No Data Retention**: Never store un-anonymized customer credentials, private keys, or PII in long-term markdown logs.
- **Immediate Critical Escalation**: If a critical Remote Code Execution (RCE) or Authentication Bypass is verified, immediately halt broad testing and notify the user with remediation recommendations.

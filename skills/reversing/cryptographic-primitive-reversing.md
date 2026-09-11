---
name: CryptographicPrimitiveReversing
desc: Cryptographic Signature Detection, S-Box Identification, Entropy Analysis, and In-Memory Key Extraction Protocol
rules: [R_CORE, R_SEC, R_REVERSE]
category: Reversing
---
# 🔐 Cryptographic Primitive Reversing & Key Recovery Protocol

**Goal:** Provide deterministic techniques to identify cryptographic algorithms inside compiled binaries, recognize mathematical constants (S-Boxes, IVs, round constants), analyze entropy distributions, and safely extract cryptographic keys and plaintext payloads directly from runtime memory.

---

## 1. Crypto Identification Architecture

```text
  [Compiled Binary / Memory Dump]
                 │
        ┌────────┴────────┐
        ▼                 ▼
 [Static Scan]      [Dynamic Trace]
 • FindCrypt/YARA   • Trace Crypto APIs (BCrypt, OpenSSL)
 • S-box patterns   • Hook key expansion / IV loading
 • Magic constants  • Inspect registers at encrypt/decrypt boundary
        │                 │
        └────────┬────────┘
                 ▼
 [Key & Parameter Recovery]
 • Extract Key, IV, Nonce, Mode (CBC/GCM/CTR)
 • Verify decryptability offline via OpenSSL/Python
```

---

## 2. Magic Constants & Signature Table

Cryptographic algorithms rely on invariant mathematical constants. Spotting these constants in static disassembly reliably identifies the underlying primitive:

| Algorithm | Magic Constant / Byte Signature | Context / Usage |
| :--- | :--- | :--- |
| **AES (Rijndael)** | `0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5...` | Forward S-Box Table (256 bytes) |
| **AES (Inverse)** | `0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38...` | Inverse S-Box Table (256 bytes) |
| **AES Rcon** | `0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80...` | Round Constant Table |
| **MD5** | `0x67452301`, `0xEFCDAB89`, `0x98BADCFE`, `0x10325476` | Initial state buffer ($A, B, C, D$) |
| **SHA-1** | `0x67452301`, `0xEFCDAB89`, `0x98BADCFE`, `0x10325476`, `0xC3D2E1F0` | Initial hash state vector |
| **SHA-256** | `0x428a2f98`, `0x71374491`, `0xb5c0fbcf`, `0xe9b5dba5...` | First four of 64 round constants $K_i$ |
| **ChaCha20** | `"expand 32-byte k"` (`0x65787061`, `0x6e642033`, `0x322d6279`, `0x7465206b`) | 16-byte constant matrix setup |
| **CRC32** | `0xEDB88320` (Reversed) or `0x04C11DB7` | Polynomial generator table |

---

## 3. Dynamic Key Extraction Playbook

### Step 1: Locating Crypto Boundaries
1. Search cross-references (`Xref`) to identified magic constants.
2. In Windows targets: Check imports for `BCryptEncrypt`, `CryptEncrypt`, `EVP_EncryptInit_ex`.
3. In Custom / Statically-linked binaries: Look for function loops iterating 10, 12, or 14 rounds (indicative of AES-128, 192, 256).

### Step 2: Extracting Keys via Frida Hooking
Instead of reverse engineering complex proprietary wrappers, intercept standard cryptographic function calls right before encryption/decryption takes place:

```javascript
// OpenSSL EVP Interceptor
const pEVP_EncryptInit = Module.findExportByName(null, "EVP_EncryptInit_ex");
if (pEVP_EncryptInit) {
  Interceptor.attach(pEVP_EncryptInit, {
    onEnter(args) {
      const cipher = args[1];
      const key = args[2];
      const iv = args[3];
      
      console.log("[+] EVP_EncryptInit_ex triggered!");
      if (!key.isNull()) {
        console.log("    [>] Key (hex): " + hexdump(key, { length: 32 }));
      }
      if (!iv.isNull()) {
        console.log("    [>] IV (hex):  " + hexdump(iv, { length: 16 }));
      }
    }
  });
}
```

### Step 3: Windows BCrypt Key Recovery
Hook `BCryptGenerateSymmetricKey` or `BCryptEncrypt`:
```javascript
const pBCryptEncrypt = Module.findExportByName("bcrypt.dll", "BCryptEncrypt");
if (pBCryptEncrypt) {
  Interceptor.attach(pBCryptEncrypt, {
    onEnter(args) {
      const pbInput = args[1];
      const cbInput = args[2].toInt32();
      const pbIV = args[4];
      const cbIV = args[5].toInt32();
      
      console.log(`[+] BCryptEncrypt: Plaintext (${cbInput} bytes)`);
      console.log(hexdump(pbInput, { length: Math.min(cbInput, 64) }));
      if (!pbIV.isNull() && cbIV > 0) {
        console.log("[+] BCryptEncrypt IV: " + hexdump(pbIV, { length: cbIV }));
      }
    }
  });
}
```

---

## 4. Offline Verification Recipe (Python)
Verify the recovered keys and IV by decrypting intercepted network payloads or disk artifacts offline:

```python
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

def verify_aes_cbc(ciphertext: bytes, key_hex: str, iv_hex: str) -> bytes:
    key = bytes.fromhex(key_hex)
    iv = bytes.fromhex(iv_hex)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    return plaintext
```

---

## 5. Verification & Audit Checklist
- [ ] Recovered key lengths match algorithm specifications (16/24/32 bytes for AES).
- [ ] IV/Nonce uniqueness validated across repeated runs to determine if static IV reuse flaws exist.
- [ ] Plaintext entropy verified: decrypted payload exhibits intelligible structure (JSON, XML, Protobuf, or executable headers).

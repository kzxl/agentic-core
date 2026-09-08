---
desc: Test Logic & Algorithmic Verification Standard — Deterministic testing, mathematical invariants, and boundary validation
rules: [R_TDD, R_CORE, R_PERF]
---
# 🧪 Test Logic & Algorithmic Verification Standard

## 1. Core Principles

1. **100% Determinism**: Test execution must never depend on real-world time (`Thread.Sleep`), external network calls, or random unseeded values. All randomness must use deterministic seeds.
2. **Mathematical Invariant Verification**: Validate mathematical and logical invariants that must hold true across all valid states:
   - **Commutativity**: $f(a, b) == f(b, a)$ (e.g., cryptographic key exchange, symmetric distance).
   - **Idempotency**: $f(f(x)) == f(x)$ (e.g., formatting, data normalization, state reconciliation).
   - **Reversibility**: $g(f(x)) == x$ (e.g., serialization/deserialization, compression/decompression, encryption/decryption).
3. **Boundary Value Analysis (BVA)**: Explicitly test boundary extremities:
   - Zero / Empty collection ($N = 0$).
   - Single item ($N = 1$).
   - Boundary threshold ($N = Limit - 1$, $N = Limit$, $N = Limit + 1$).
   - Extreme numeric values (`int.MinValue`, `int.MaxValue`, zero, negative values).
4. **Fault Injection & Malformed Input Handling**: Verify algorithm resilience against malformed payloads, truncated streams, invalid magic bytes, out-of-order packets, and buffer overflows.

---

## 2. Test Anatomy (The AAA Pattern)

Every test must adhere to the visual and conceptual separation of **Arrange-Act-Assert**:

```csharp
[Test]
public void CalculateChunkCount_NonDivisiblePayload_RoundsUpToNextInteger()
{
    // 1. Arrange: Setup exact, isolated inputs
    long payloadSize = 150 * 1024; // 150 KB
    int chunkSize = 64 * 1024;     // 64 KB

    // 2. Act: Execute the algorithmic function under test
    int totalChunks = (int)Math.Ceiling((double)payloadSize / chunkSize);

    // 3. Assert: Verify strict invariant expectations
    Assert.Equal(3, totalChunks);
}
```

---

## 3. Test Naming Convention

Format: `[UnitOfWork]_[StateUnderTest]_[ExpectedBehavior]`

| Good Name | Bad Name |
| :--- | :--- |
| `ParseXorMappedAddress_ValidIpv4Payload_DecodesCorrectIpAndPort` | `TestStun` |
| `ReassembleChunks_OutOfOrderArrival_ReconstructsIdenticalPayload` | `TestChunking` |
| `DeriveSharedSecret_BothPeers_ProducesIdentical256BitKey` | `TestCrypto` |
| `PacketSerializer_PayloadExceedsMaxSize_ReturnsNullWithoutException` | `TestBuffer` |

---

## 4. Algorithmic Test Categories

### A. Binary Protocol & Parsing Tests
- Verify magic numbers, headers, and protocol versions.
- Test bit-shifting, endianness conversions (Big-Endian vs Little-Endian).
- Test XOR masks (e.g., RFC 5389 STUN XOR-MAPPED-ADDRESS attributes).

### B. Streaming & Buffer Reassembly Tests
- Validate chunking algorithms against arbitrary buffer lengths ($0$, $1$, $ChunkSize - 1$, $ChunkSize$, $ChunkSize + 1$, $10 \times ChunkSize$).
- Test out-of-order sequence reconstruction (permutations of chunk arrival).
- Test missing/dropped chunk detection.

### C. Cryptographic Invariant Tests
- **Key Agreement**: Verify that two independently generated key pairs arrive at the exact same shared secret.
- **IV Entropy**: Ensure sequential encryptions with the same key produce different ciphertexts (unique IV invariant).
- **Padding Invariant**: Ensure PKCS7 padding correctly rounds up to block size (16 bytes for AES).

### D. Geometry & Coordinate Calculations
- Validate angle wrap-around algorithms: $\theta \pmod{360}$.
- Test coordinate projections inside circle radii: $(x - cx)^2 + (y - cy)^2 \le r^2$.

---

## 5. Anti-Patterns to Avoid

- ❌ **Fragile Timing Dependencies**: Never use `Thread.Sleep(500)` to wait for async tasks. Use `ManualResetEventSlim`, `TaskCompletionSource`, or timeout gates.
- ❌ **Tautological Assertions**: Do not assert trivial truths like `Assert.True(result != null)` when specific properties or byte values should be checked.
- ❌ **Shared Mutable State**: Tests must be completely isolated. Never share static collections across tests without thread-safe tear-down and reset logic.
- ❌ **External I/O Dependency**: Pure algorithm tests must run completely in memory without reading from the network or physical disk (use memory streams or temp test paths).

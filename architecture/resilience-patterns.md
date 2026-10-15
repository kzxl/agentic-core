---
name: SystemResiliencePatterns
desc: Universal fault-tolerance, circuit breaking, exponential backoff, and graceful degradation blueprints
rules: [R_RES, R_CORE]
category: Architecture
---
# 🛡️ Universal System Resilience & Fault Tolerance Blueprint

**Goal:** Guarantee service survivability under downstream brownouts, network partitions, and dependency latency spikes through state-machine Circuit Breakers, Full-Jitter Exponential Backoff, Singleflight SWR fallbacks, and strict deadline budgets (`[R_RES, R_CORE]`).

---

## 1. Quantitative Resilience Budgets & State Invariants

| Resilience Mechanism | Mandatory Parameter / Threshold | Mathematical / State Rule | Cascading Failure Prevented |
| :--- | :--- | :--- | :--- |
| **Per-Hop Timeout Budget** | `HopTimeout <= min(2000ms, RemainingDeadline * 0.8)` | Propagate `grpc-timeout` / `X-Deadline-Budget-Ms` | Thread-pool starvation waiting on zombie sockets |
| **Retry Policy (Full Jitter)** | `MaxAttempts = 3`, Idempotent verbs/keys ONLY | $T_{\text{sleep}} = \text{random}(0, \min(T_{\max}, T_{\text{base}} \cdot 2^{\text{attempt}}))$ | Synchronized retry waves ("Thundering Herd") |
| **Circuit Breaker (`Closed->Open`)** | `MinThroughput >= 20 req/10s` AND `FailureRate >= 50%` | Trips to `OPEN` for `Cooldown = 15s`, then `HALF-OPEN` (1 probe) | Hammering an overloaded downstream DB or payment gateway |
| **Bulkhead Isolation** | Per-dependency bounded semaphore (`MaxConcurrent = 32`) | Rejects excess calls with `429/503` in `< 1ms` | Slow secondary dependency exhausting 100% of host workers |
| **Graceful Degradation (SWR)** | Fresh TTL `60s`, Stale-If-Error TTL `3600s` | Serve cached stale snapshot when Circuit Breaker is `OPEN` | Total UI outage when non-critical catalog/pricing service fails |

### Core Architectural Rules
1. **Idempotency Prerequisite:** Retry ONLY idempotent verbs (`GET`, `PUT`, `DELETE`) or requests with a persisted `Idempotency-Key`. Never retry `400/401/403/422`.
2. **Wrapping Order:** Compose outermost-to-innermost: `Fallback (SWR)` $\rightarrow$ `Overall Deadline` $\rightarrow$ `Retry (Full Jitter)` $\rightarrow$ `Circuit Breaker` $\rightarrow$ `Bulkhead` $\rightarrow$ `Attempt Timeout`.
3. **Singleflight Coalescing:** Coalesce concurrent cache misses for the same key into a single upstream request.

---

## 2. Production Implementation: Full-Jitter Retry, Circuit Breaker & SWR Fallback

```typescript
// ❌ BAD: Retries without timeout or jitter -> synchronized Thundering Herd & socket hang!
export async function fetchQuoteBad(sku: string) {
  for (let i = 0; i < 5; i++) {
    try { return await (await fetch(`https://pricing.internal/quotes/${sku}`)).json(); }
    catch { await new Promise((r) => setTimeout(r, 1000)); }
  }
}

// ✅ GOOD: Full-Jitter Backoff, Half-Open Single-Probe Circuit Breaker & Stale-If-Error Cache
export class ResilientExecutor {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failures = 0;
  private nextProbeAt = 0;
  private probeActive = false;
  private readonly cache = new Map<string, { val: unknown; exp: number }>();

  constructor(private readonly maxFailures = 5, private readonly cooldownMs = 15_000) {}

  public async executeWithFallback<T>(
    key: string,
    timeoutMs: number,
    op: (sig: AbortSignal) => Promise<T>
  ): Promise<{ data: T; degraded: boolean }> {
    try {
      const data = await this.executeWithRetry(timeoutMs, op);
      this.cache.set(key, { val: data, exp: Date.now() + 3_600_000 });
      return { data, degraded: false };
    } catch (err) {
      const hit = this.cache.get(key);
      if (hit && hit.exp > Date.now()) return { data: hit.val as T, degraded: true };
      throw err;
    }
  }

  private async executeWithRetry<T>(timeoutMs: number, op: (sig: AbortSignal) => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt++) {
      this.beforeCall();
      try {
        const res = await op(AbortSignal.timeout(timeoutMs));
        this.failures = 0;
        this.probeActive = false;
        this.state = 'CLOSED';
        return res;
      } catch (err) {
        this.failures++;
        this.probeActive = false;
        if (this.state === 'HALF_OPEN' || this.failures >= this.maxFailures) {
          this.state = 'OPEN';
          this.nextProbeAt = Date.now() + this.cooldownMs;
        }
        if (attempt === 2 || this.state === 'OPEN') throw err;
        const cap = Math.min(2_000, 100 * (1 << attempt));
        await new Promise((r) => setTimeout(r, Math.floor(Math.random() * cap)));
      }
    }
    throw new Error('ERR_UNREACHABLE');
  }

  private beforeCall(): void {
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextProbeAt && !this.probeActive) {
        this.state = 'HALF_OPEN';
        this.probeActive = true;
        return;
      }
      throw new Error('ERR_CIRCUIT_OPEN');
    }
    if (this.state === 'HALF_OPEN' && this.probeActive) throw new Error('ERR_PROBE_BUSY');
  }
}
```

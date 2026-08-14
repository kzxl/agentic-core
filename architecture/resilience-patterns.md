---
name: SystemResiliencePatterns
desc: Universal fault-tolerance, circuit breaking, exponential backoff, and graceful degradation blueprints
rules: [R_CORE]
category: Architecture
---
# 🛡️ Universal System Resilience & Fault Tolerance Blueprint

**Goal:** Design systems capable of surviving partial failures, network partitions, database overloads, and third-party API downtimes without catastrophic cascading failures.

---

## 1. Core Resilience Patterns

### A. Circuit Breaker Pattern
**Mechanism:** Monitors external service calls through 3 states:
- **CLOSED:** Normal operation. Requests pass through. Failures are counted.
- **OPEN:** Failure threshold exceeded. Requests immediately fail-fast (or fallback) without hitting downstream service.
- **HALF-OPEN:** After a timeout, trial requests are allowed through. If successful, reset to CLOSED; if failed, revert to OPEN.

```javascript
export class CircuitBreaker {
  constructor(action, { failureThreshold = 5, cooldownPeriodMs = 10000 }) {
    this.action = action;
    this.failureThreshold = failureThreshold;
    this.cooldownPeriodMs = cooldownPeriodMs;
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.nextAttempt = Date.now();
  }

  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF-OPEN';
      } else {
        throw new Error('Circuit Breaker is OPEN. Request rejected to protect downstream service.');
      }
    }

    try {
      const result = await this.action(...args);
      this.reset();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold || this.state === 'HALF-OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.cooldownPeriodMs;
    }
  }

  reset() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
}
```

### B. Exponential Backoff with Jitter (Smart Retry)
**Formula:** `Delay = min(MaxDelay, BaseDelay * 2^attempt) + RandomJitter`
**Benefit:** Prevents "Thundering Herd" problem where thousands of retrying clients hit a recovering server simultaneously.

### C. Graceful Degradation & Fallback Cache
When the primary database or API is unreachable:
1. Attempt fresh read.
2. If failed, return cached snapshot (Stale-While-Revalidate).
3. Notify the client with degraded indicator: `{ data: cachedData, isDegraded: true }`.

---

## 2. Checklist for Mission-Critical Services
- [ ] All external HTTP/gRPC calls have explicit connect/read timeouts (never hang infinitely).
- [ ] Retries are configured ONLY on idempotent operations (GET, PUT, DELETE with idempotency key).
- [ ] Unhealthy dependencies trigger graceful fallbacks instead of crashing the main service.

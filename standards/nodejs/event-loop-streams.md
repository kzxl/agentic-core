---
desc: Node.js Event Loop Non-Blocking, Stream Pipelines & Worker Threads
rules: [R_NODE, R_CORE]
---
# ⚡ Node.js Event Loop & Stream Processing Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Event Loop Tick Budget** | `< 10 ms` synchronous execution per tick (`p99` lag `< 25 ms`) | `perf_hooks.monitorEventLoopDelay({ resolution: 10 })` |
| **Synchronous I/O / Crypto / Zlib** | `0` `*Sync()` calls after startup bootstrap | ESLint `n/no-sync` rule |
| **In-Memory Payload Buffering** | Stream via `pipeline()` for any payload or file `> 2 MB` | `node:stream/promises` `pipeline` |
| **Promise Fan-Out Concurrency** | Max `10 – 25` concurrent I/O promises per request | `p-limit` or bounded semaphore |
| **Worker Thread Offload Threshold** | Any CPU task `> 5 ms` (`JSON.parse` `> 1 MB`, `scrypt`, PDF/image) | Pooled `worker_threads` (`piscina`) |

---

## 2. Stream Backpressure (`stream.pipeline`) vs. Unbounded Buffering

Legacy `readStream.pipe(dest)` does **not** forward errors or destroy underlying file descriptors when a downstream client disconnects prematurely, leaking OS sockets and memory. Always use `pipeline()` from `node:stream/promises`, which enforces `highWaterMark` backpressure (`64 KB` default) and tears down all streams in the chain on any error or premature close.

```typescript
// ❌ BAD: Buffers entire 500MB CSV in V8 heap (OOM crash) and leaks file descriptor on client abort
app.get('/exports/ledger-bad', async (req, res) => {
  const data = fs.readFileSync('/data/huge-ledger.csv'); // Blocks Event Loop for hundreds of ms!
  res.send(data);
});

// ✅ GOOD: Bounded 64KB chunk streaming with automatic backpressure & error teardown
import { pipeline } from 'node:stream/promises';
import { createReadStream } from 'node:fs';
import { createGzip } from 'node:zlib';

app.get('/exports/ledger-good', async (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Encoding', 'gzip');
    await pipeline(
      createReadStream('/data/huge-ledger.csv', { highWaterMark: 64 * 1024 }),
      createGzip(),
      res,
    );
  } catch (err) {
    if (!res.headersSent) next(err);
  }
});
```

---

## 3. Bounded Async Fan-Out (`p-limit`) & `AsyncLocalStorage` Context Propagation

Passing an array of `1,000` items to raw `Promise.all(items.map(fn))` opens `1,000` simultaneous TCP sockets or DB queries, exhausting connection pools and triggering downstream `503` failures. Always bound concurrency using `p-limit`. Propagate correlation metadata (`traceId`, `tenantId`) implicitly across async ticks via `AsyncLocalStorage` rather than polluting every function signature.

```typescript
// ❌ BAD: Unbounded Promise.all spikes DB pool to 100% and starves sibling requests
export async function syncAccountsBad(accountIds: string[]): Promise<void> {
  await Promise.all(accountIds.map((id) => syncSingleAccount(id))); // 5,000 concurrent connections!
}

// ✅ GOOD: Bounded concurrency (max 12 in-flight) + AsyncLocalStorage correlation tracking
import { AsyncLocalStorage } from 'node:async_hooks';
import pLimit from 'p-limit';

export interface RequestContext {
  readonly traceId: string;
  readonly tenantId: string;
}

export const requestContextStore = new AsyncLocalStorage<RequestContext>();

export async function syncAccountsGood(accountIds: readonly string[]): Promise<SyncResult[]> {
  const limit = pLimit(12); // Strictly cap in-flight I/O operations at 12
  return Promise.all(
    accountIds.map((id) =>
      limit(async () => {
        const ctx = requestContextStore.getStore();
        return syncSingleAccount(id, ctx?.traceId ?? 'system');
      }),
    ),
  );
}
```

---

## 4. Offloading CPU-Intensive Tasks to `worker_threads`

Never spawn a new `new Worker()` per request (`~30 ms` V8 isolate startup overhead). Maintain a pre-warmed, fixed-size worker thread pool (`os.availableParallelism() - 1` threads) to execute CPU-bound workloads (Argon2/bcrypt hashing, large JSON schema serialization, cryptographic signing, or image transcoding) without stalling the main Event Loop tick beyond `10 ms`. Use `TransferList` (`ArrayBuffer` ownership transfer) to pass binary payloads between threads with zero memory copy overhead.


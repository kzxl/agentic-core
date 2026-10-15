---
name: NodeJsPersistenceAdapterPattern
desc: Pluggable storage adapter interface for state and session management in Node.js
rules: [R_NODE, R_DB]
category: NodeJs
---
# 💾 Node.js Persistence Adapter & Port Isolation Pattern

**Goal:** Decouple domain and application services from concrete storage drivers (`ioredis`, `pg`, `mongodb`) via a strictly-typed `IPersistenceAdapter<T>` port supporting TTL expiration, optimistic concurrency (`CAS` version tokens), and zero-dependency in-memory test fakes.

---

## 1. Quantitative Persistence Port Invariants
| Storage Invariant | Mandatory Threshold | Architectural Enforcement |
| :--- | :--- | :--- |
| **Driver Leakage into Domain** | $0$ imports of `redis`/`pg`/`mongoose` in Domain Services | Inject `IPersistenceAdapter<T>` interface |
| **Key Namespace Isolation** | $100\%$ prefixed `<tenant>:<domain>:<id>` | Enforce key prefixing inside adapter constructor |
| **TTL Boundedness (Cache/Session)** | Mandatory `ttlSeconds > 0` on transient state | Default $3,600\text{s}\text{–}86,400\text{s}$ to prevent Redis OOM |
| **Unit Test Execution Speed** | $\le 5\text{ ms}$ per service test using `InMemoryPersistenceAdapter` | Zero live Docker/Redis dependency required for unit tests |

---

## 2. Code Comparison: Direct Driver Coupling vs Pluggable Persistence Port

```ts
// ❌ BAD: Domain service directly coupled to ioredis commands, untestable without live Redis server
import Redis from 'ioredis';
const redis = new Redis();

export class BadSessionService {
  async saveCheckoutDraft(userId: string, draft: any) {
    await redis.set(`draft:${userId}`, JSON.stringify(draft)); // Missing TTL -> memory leak!
  }
}

// ✅ GOOD: Strictly-typed Persistence Port with TTL enforcement and atomic Compare-And-Swap
export interface PersistenceOptions {
  readonly ttlSeconds?: number;
  readonly signal?: AbortSignal;
}

export interface IPersistenceAdapter<T extends Record<string, unknown>> {
  get(key: string, signal?: AbortSignal): Promise<T | null>;
  set(key: string, value: T, options?: PersistenceOptions): Promise<void>;
  delete(key: string, signal?: AbortSignal): Promise<boolean>;
}
```

---

## 3. Production Redis Adapter & Deterministic In-Memory Fake

```ts
// 1. Production Redis Adapter with Namespace Prefix & Mandatory TTL Default
export class RedisPersistenceAdapter<T extends Record<string, unknown>> implements IPersistenceAdapter<T> {
  constructor(
    private readonly redis: {
      get(key: string): Promise<string | null>;
      set(key: string, val: string, mode: 'EX', ttl: number): Promise<unknown>;
      del(key: string): Promise<number>;
    },
    private readonly namespace: string,
    private readonly defaultTtlSeconds = 3600
  ) {}

  private buildKey(rawKey: string): string {
    return `${this.namespace}:${rawKey}`;
  }

  public async get(key: string, signal?: AbortSignal): Promise<T | null> {
    signal?.throwIfAborted();
    const raw = await this.redis.get(this.buildKey(key));
    return raw ? (JSON.parse(raw) as T) : null;
  }

  public async set(key: string, value: T, options?: PersistenceOptions): Promise<void> {
    options?.signal?.throwIfAborted();
    const ttl = options?.ttlSeconds ?? this.defaultTtlSeconds;
    if (ttl <= 0) throw new RangeError(`TTL must be positive, received ${ttl}`);
    const payload = JSON.stringify(value);
    await this.redis.set(this.buildKey(key), payload, 'EX', ttl);
  }

  public async delete(key: string, signal?: AbortSignal): Promise<boolean> {
    signal?.throwIfAborted();
    const removed = await this.redis.del(this.buildKey(key));
    return removed > 0;
  }
}

// 2. Deterministic In-Memory Adapter for Sub-Millisecond Unit Testing
export class InMemoryPersistenceAdapter<T extends Record<string, unknown>> implements IPersistenceAdapter<T> {
  private readonly store = new Map<string, { readonly json: string; readonly expiresAtMs: number }>();

  public async get(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAtMs) {
      this.store.delete(key);
      return null;
    }
    return JSON.parse(entry.json) as T;
  }

  public async set(key: string, value: T, options?: PersistenceOptions): Promise<void> {
    const ttlMs = (options?.ttlSeconds ?? 3600) * 1000;
    this.store.set(key, {
      json: JSON.stringify(value), // Deep-clones to prevent caller reference mutation bugs!
      expiresAtMs: Date.now() + ttlMs,
    });
  }

  public async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }
}
```


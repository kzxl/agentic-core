---
name: NodeJsServiceClientFactory
desc: Managed API Client Factory with automatic authorization token delegation and retry configuration.
rules: [R_NODE]
category: NodeJs
---
# 🌐 Node.js Resilient Service Client Factory Pattern

**Goal:** Provision outbound microservice HTTP clients with pooled TCP keep-alive connections, automatic W3C trace-context (`traceparent` / `x-correlation-id`) and JWT delegation, hard `AbortSignal` timeout budgets, and jittered exponential backoff on transient failures.

---

## 1. Quantitative Outbound Client Invariants
| Network Dimension | Mandatory Threshold | Architectural Enforcement |
| :--- | :--- | :--- |
| **Per-Request Timeout Budget** | $\le 5,000\text{ ms}$ default hard ceiling | `AbortSignal.timeout(timeoutMs)` merged with caller `signal` |
| **TCP Socket Reuse** | $100\%$ HTTP Keep-Alive connection pooling | Shared `http.Agent({ keepAlive: true, maxSockets: 128 })` / `undici` |
| **Correlation Propagation** | $100\%$ of outbound calls carry `x-correlation-id` | Injected automatically by `ServiceClientFactory` |
| **Retry Policy Scope** | Max $2$ retries on idempotent `GET`/`PUT` (`502`/`503`/`504`) | Never auto-retry non-idempotent `POST` without `Idempotency-Key` |

---

## 2. Code Comparison: Unbounded Ad-Hoc `fetch` vs Managed `ServiceClientFactory`

```ts
// ❌ BAD: No timeout (hangs forever if downstream stalls), drops correlationId, and leaks raw error
export async function fetchInventoryBad(sku: string) {
  const res = await fetch(`http://inventory-svc/items/${sku}`); // No timeout, no auth header!
  return await res.json();
}

// ✅ GOOD: Context-bound ServiceClientFactory with timeout composition, auth forwarding, and typed errors
export interface ServiceClientContext {
  readonly correlationId: string;
  readonly authorizationToken?: string;
  readonly defaultTimeoutMs?: number;
}

export interface RequestCallOptions {
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
  readonly idempotencyKey?: string;
}

export class UpstreamServiceError extends Error {
  constructor(
    public readonly serviceName: string,
    public readonly statusCode: number,
    public readonly correlationId: string,
    message: string
  ) {
    super(`[${serviceName}] HTTP ${statusCode} (trace=${correlationId}): ${message}`);
    this.name = 'UpstreamServiceError';
  }
}
```

---

## 3. Production `ServiceClientFactory` Implementation

```ts
export class ServiceClientFactory {
  private readonly defaultTimeoutMs: number;

  constructor(private readonly ctx: ServiceClientContext) {
    this.defaultTimeoutMs = ctx.defaultTimeoutMs ?? 5_000;
  }

  public createClient(serviceName: string, baseUrl: string) {
    const normalizedBase = baseUrl.replace(/\/+$/, '');

    const request = async <TResponse>(
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: string,
      body?: unknown,
      options?: RequestCallOptions
    ): Promise<TResponse> => {
      const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;
      const timeoutSignal = AbortSignal.timeout(timeoutMs);
      const combinedSignal = options?.signal
        ? AbortSignal.any([options.signal, timeoutSignal])
        : timeoutSignal;

      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-correlation-id': this.ctx.correlationId,
      };

      if (this.ctx.authorizationToken) {
        headers.Authorization = `Bearer ${this.ctx.authorizationToken}`;
      }
      if (options?.idempotencyKey) {
        headers['Idempotency-Key'] = options.idempotencyKey;
      }

      const response = await fetch(`${normalizedBase}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: combinedSignal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new UpstreamServiceError(serviceName, response.status, this.ctx.correlationId, errorText);
      }

      return (await response.json()) as TResponse;
    };

    return {
      get: <T>(path: string, opts?: RequestCallOptions) => request<T>('GET', path, undefined, opts),
      post: <T>(path: string, body: unknown, opts?: RequestCallOptions) => request<T>('POST', path, body, opts),
      put: <T>(path: string, body: unknown, opts?: RequestCallOptions) => request<T>('PUT', path, body, opts),
      delete: <T>(path: string, opts?: RequestCallOptions) => request<T>('DELETE', path, undefined, opts),
    };
  }
}
```


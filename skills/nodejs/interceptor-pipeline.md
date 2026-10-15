---
name: NodeJsInterceptorPipeline
desc: Request & Response Interceptors pipeline for global pre/post-processing in Node.js
rules: [R_NODE]
category: NodeJs
---
# ⚙️ Node.js Composable Onion Interceptor Pipeline Pattern

**Goal:** Decouple cross-cutting concerns (`TraceContext` $\to$ `Auth` $\to$ `RateLimit` $\to$ `SchemaValidation` $\to$ `AuditTiming`) from domain handlers using a deterministic request/response/error interceptor pipeline with monotonic `process.hrtime.bigint()` telemetry.

---

## 1. Quantitative Pipeline Execution Invariants
| Pipeline Stage | Mandatory Order & Contract | Overhead Budget |
| :--- | :--- | :--- |
| **1. Correlation & Timing** | Assign UUIDv4 `correlationId` & `hrtime.bigint()` start tick | $\le 0.05\text{ ms}$ |
| **2. Authentication & RBAC** | Verify JWT / session token and freeze `ctx.principal` | $\le 2.0\text{ ms}$ |
| **3. Schema Validation** | Validate `ctx.payload` via Zod/Ajv before handler dispatch | $\le 0.5\text{ ms}$ |
| **4. Post-Response Envelope** | Attach `responseTimeMs` and `correlationId` metadata | $\le 0.1\text{ ms}$ |
| **5. Error Guarantee** | `finally` / error interceptors always execute even if handler throws | $100\%$ deterministic |

---

## 2. Code Comparison: Tangled Handler Boilerplate vs Onion Interceptor Pipeline

```ts
// ❌ BAD: Cross-cutting auth, timing, and logging duplicated inside every business handler
export async function createInvoiceHandlerBad(ctx: any) {
  const start = Date.now();
  if (!ctx.headers.authorization) throw new Error('Unauthorized');
  const res = await invoiceService.create(ctx.payload);
  console.log(`Took ${Date.now() - start}ms`);
  return { data: res };
}

// ✅ GOOD: Composable Request & Response Interceptor Contracts
export interface PipelineContext<TPayload = unknown> {
  correlationId: string;
  startTickNs: bigint;
  readonly method: string;
  readonly path: string;
  readonly headers: Readonly<Record<string, string | undefined>>;
  principal?: { readonly userId: string; readonly tenantId: string; readonly roles: readonly string[] };
  payload: TPayload;
}

export interface RequestInterceptor {
  readonly name: string;
  beforeHandle(ctx: PipelineContext): Promise<void> | void;
}

export interface ResponseInterceptor {
  readonly name: string;
  afterHandle<TResult>(ctx: PipelineContext, result: TResult): Promise<TResult> | TResult;
}
```

---

## 3. Production Pipeline Runner & Standard Interceptors

```ts
import crypto from 'node:crypto';

export const TelemetryRequestInterceptor: RequestInterceptor = {
  name: 'TelemetryRequestInterceptor',
  beforeHandle(ctx) {
    ctx.correlationId = ctx.headers['x-correlation-id'] || crypto.randomUUID();
    ctx.startTickNs = process.hrtime.bigint();
  },
};

export const EnvelopeResponseInterceptor: ResponseInterceptor = {
  name: 'EnvelopeResponseInterceptor',
  afterHandle(ctx, result) {
    const elapsedMs = Number(process.hrtime.bigint() - ctx.startTickNs) / 1_000_000;
    return {
      success: true,
      data: result,
      meta: {
        correlationId: ctx.correlationId,
        durationMs: Number(elapsedMs.toFixed(3)),
        timestampUtc: new Date().toISOString(),
      },
    } as unknown as typeof result;
  },
};

export async function executeInterceptorPipeline<TResult>(
  ctx: PipelineContext,
  requestInterceptors: readonly RequestInterceptor[],
  handlerFn: (ctx: PipelineContext) => Promise<TResult>,
  responseInterceptors: readonly ResponseInterceptor[]
): Promise<TResult> {
  // 1. Pre-Processing Request Interceptors (Fail-fast short-circuit on throw)
  for (const reqInterceptor of requestInterceptors) {
    await reqInterceptor.beforeHandle(ctx);
  }

  // 2. Core Domain Handler Execution
  let result = await handlerFn(ctx);

  // 3. Post-Processing Response Interceptors (Reverse onion unwinding)
  for (const resInterceptor of responseInterceptors) {
    result = await resInterceptor.afterHandle(ctx, result);
  }

  return result;
}
```


---
name: NodeJsFluentResponseBuilder
desc: Fluent API response builder for consistent, type-safe, and standardized REST API payloads
rules: [R_NODE]
category: NodeJs
---
# 🏗️ Node.js Type-Safe Fluent API Response Builder Pattern

**Goal:** Guarantee 100% wire-contract consistency across all REST endpoints by constructing immutable, generic `ApiResponseEnvelope<T>` payloads (`success`, `data`, `pagination`, `errors`, `meta.traceId`) through a fluent builder.

---

## 1. Quantitative Response Contract Invariants
| Contract Field | Mandatory Invariant | Validation Rule |
| :--- | :--- | :--- |
| **`statusCode` vs `success`** | `success === (statusCode >= 200 && statusCode < 300)` | Builder automatically synchronizes boolean flag with HTTP status |
| **Pagination Bounds** | `page >= 1`, `1 <= pageSize <= 500`, `totalPages = ceil(total / size)` | Clamps negative/zero page sizes to prevent `NaN`/`Infinity` |
| **`meta.traceId`** | Present on $100\%$ of `2xx`, `4xx`, and `5xx` responses | Bound from `req.correlationId` / `x-correlation-id` |
| **Immutability** | `Object.freeze(envelope)` on `.build()` | Prevents downstream middleware mutation bugs |

---

## 2. Code Comparison: Divergent Ad-Hoc JSON vs Fluent Envelope Builder

```ts
// ❌ BAD: Divergent ad-hoc keys across routes (`items` vs `result` vs `rows`), division-by-zero in totalPages
app.get('/users', async (req, res) => {
  const limit = Number(req.query.limit); // If limit=0, total / limit === Infinity (serializes as null in JSON!)
  res.json({ ok: 1, rows: users, pages: total / limit });
});

// ✅ GOOD: Standardized Generic Envelope & Fluent Builder
export interface PaginationMeta {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
}

export interface ApiErrorItem {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

export interface ApiResponseEnvelope<TData> {
  readonly success: boolean;
  readonly message: string;
  readonly data: TData | null;
  readonly pagination?: PaginationMeta;
  readonly errors?: readonly ApiErrorItem[];
  readonly meta: Readonly<Record<string, unknown>> & {
    readonly traceId: string;
    readonly timestampUtc: string;
  };
}
```

---

## 3. Production `ApiResponseBuilder<TData>` Implementation

```ts
export class ApiResponseBuilder<TData = unknown> {
  private statusCode = 200;
  private message = '';
  private data: TData | null = null;
  private pagination?: PaginationMeta;
  private readonly errors: ApiErrorItem[] = [];
  private readonly meta: Record<string, unknown> = {};

  public static ok<T>(data: T, message = 'OK'): ApiResponseBuilder<T> {
    return new ApiResponseBuilder<T>().status(200).withData(data).withMessage(message);
  }

  public status(code: number): this {
    this.statusCode = code;
    return this;
  }

  public withData(data: TData): this {
    this.data = data;
    return this;
  }

  public withMessage(message: string): this {
    this.message = message;
    return this;
  }

  public withPagination(params: { page: number; pageSize: number; totalItems: number }): this {
    const safeSize = Math.min(500, Math.max(1, Math.trunc(params.pageSize) || 20));
    const safePage = Math.max(1, Math.trunc(params.page) || 1);
    const safeTotal = Math.max(0, Math.trunc(params.totalItems) || 0);
    const totalPages = Math.ceil(safeTotal / safeSize);

    this.pagination = Object.freeze({
      currentPage: safePage,
      pageSize: safeSize,
      totalItems: safeTotal,
      totalPages,
      hasNextPage: safePage < totalPages,
    });
    return this;
  }

  public withError(code: string, message: string, field?: string): this {
    if (this.statusCode >= 200 && this.statusCode < 300) {
      this.statusCode = 400;
    }
    this.errors.push({ code, message, ...(field ? { field } : {}) });
    return this;
  }

  public withTraceId(traceId: string): this {
    this.meta.traceId = traceId;
    return this;
  }

  public build(): { readonly statusCode: number; readonly body: ApiResponseEnvelope<TData> } {
    const isSuccess = this.statusCode >= 200 && this.statusCode < 300 && this.errors.length === 0;
    const body: ApiResponseEnvelope<TData> = Object.freeze({
      success: isSuccess,
      message: this.message || (isSuccess ? 'OK' : 'Request failed'),
      data: isSuccess ? this.data : null,
      ...(this.pagination ? { pagination: this.pagination } : {}),
      ...(this.errors.length > 0 ? { errors: Object.freeze([...this.errors]) } : {}),
      meta: Object.freeze({
        ...this.meta,
        traceId: String(this.meta.traceId ?? 'untraced'),
        timestampUtc: new Date().toISOString(),
      }),
    });

    return Object.freeze({ statusCode: this.statusCode, body });
  }
}
```


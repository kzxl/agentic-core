---
name: NodeJsErrorBoundaryHandler
desc: Centralized and typed error handling using predicate-based error handlers in Node.js
rules: [R_NODE]
category: NodeJs
---
# 🛡️ Node.js Error Boundary & RFC 7807 Exception Handler Pattern

**Goal:** Centralize exception handling across Express/Fastify/Node.js pipelines by distinguishing expected **Operational Errors** (`AppError`) from unexpected **Programmer Bugs**, serializing standardized RFC 7807 Problem Details responses, and scrubbing sensitive PII/stack traces.

---

## 1. Quantitative Error Governance Invariants
| Security & Reliability Gate | Mandatory Invariant | Violation Consequence |
| :--- | :--- | :--- |
| **Stack Trace Leakage** | $0$ stack traces or SQL queries in production HTTP responses | Information disclosure vulnerability (`CWE-209`) |
| **Operational vs Crash Classification** | Explicit `isOperational: boolean` flag on `AppError` | Uncaught `TypeError`/`ReferenceError` treated as normal `400` |
| **Wire Format Standard** | RFC 7807 (`type`, `title`, `status`, `detail`, `instance`, `traceId`) | Inconsistent error parsing on frontend clients |
| **PII & Secret Redaction** | Redact `password`, `token`, `authorization`, `secret` before logging | Credential exposure in log aggregators |

---

## 2. Operational `AppError` Hierarchy vs Programmer Bugs

```ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: readonly unknown[];

  constructor(
    errorCode: string,
    message: string,
    statusCode = 400,
    details?: readonly unknown[],
    isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}
```

---

## 3. Code Comparison: Leaky Ad-Hoc Catch vs Predicate RFC 7807 Error Boundary

```ts
// ❌ BAD: Leaks raw database error message and stack trace directly to the client!
app.post('/orders', async (req, res) => {
  try {
    return res.json(await orderService.create(req.body));
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack }); // P0 Security Leak!
  }
});

// ✅ GOOD: Predicate-based Error Boundary Chain emitting RFC 7807 Problem Details
export interface ErrorEnvelopeContext {
  readonly correlationId: string;
  readonly path: string;
}

export interface ProblemDetailsResponse {
  readonly statusCode: number;
  readonly body: {
    readonly type: string;
    readonly title: string;
    readonly status: number;
    readonly code: string;
    readonly detail: string;
    readonly instance: string;
    readonly traceId: string;
    readonly errors?: readonly unknown[];
  };
}

export interface ErrorHandlerStrategy {
  canHandle(error: unknown): boolean;
  handle(ctx: ErrorEnvelopeContext, error: unknown): ProblemDetailsResponse;
}

export const AppOperationalErrorHandler: ErrorHandlerStrategy = {
  canHandle(error): error is AppError {
    return error instanceof AppError && error.isOperational;
  },
  handle(ctx, error: AppError): ProblemDetailsResponse {
    return {
      statusCode: error.statusCode,
      body: {
        type: `https://errors.enterprise.internal/${error.errorCode.toLowerCase()}`,
        title: error.name,
        status: error.statusCode,
        code: error.errorCode,
        detail: error.message,
        instance: ctx.path,
        traceId: ctx.correlationId,
        ...(error.details ? { errors: error.details } : {}),
      },
    };
  },
};

export const FallbackCrashErrorHandler: ErrorHandlerStrategy = {
  canHandle: () => true,
  handle(ctx, error): ProblemDetailsResponse {
    // Log full structured error internally, but return opaque 500 message externally
    logger.error({ traceId: ctx.correlationId, path: ctx.path, err: error }, 'Unhandled exception');
    return {
      statusCode: 500,
      body: {
        type: 'https://errors.enterprise.internal/internal_server_error',
        title: 'Internal Server Error',
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        detail: 'An unexpected fault occurred. Reference traceId for support.',
        instance: ctx.path,
        traceId: ctx.correlationId,
      },
    };
  },
};
```


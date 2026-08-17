---
name: NodeJsInterceptorPipeline
desc: Request & Response Interceptors pipeline for global pre/post-processing in Node.js
rules: [R_NODE]
category: NodeJs
---
# ⚙️ Node.js Interceptor Pipeline Pattern

**Goal:** Decouple cross-cutting concerns (Authentication, Correlation ID, Audit Logging, Input Sanitization, Response Standardization, Performance Metrics) from core business logic.

## 1. Request Interceptors (Pre-processing)
Executed sequentially before any Request Handler is invoked to enrich context or validate inputs.

```javascript
// Request Logging & Correlation ID Interceptor
export const RequestLoggingInterceptor = {
  async process(ctx) {
    ctx.correlationId = ctx.headers?.['x-correlation-id'] || crypto.randomUUID();
    ctx.startTime = Date.now();
    console.log(`[REQUEST] [${ctx.correlationId}] ${ctx.method} ${ctx.path}`);
  }
};

// Auth Context Injection Interceptor
export const AuthContextInterceptor = {
  async process(ctx) {
    const token = ctx.headers?.authorization;
    if (token) {
      ctx.user = await authService.verifyToken(token);
    }
  }
};
```

## 2. Response Interceptors (Post-processing)
Executed after the Request Handler finishes to standardize responses, capture metrics, or attach response headers.

```javascript
// Response Standardization & Metrics Interceptor
export const ResponseFormattingInterceptor = {
  async process(ctx, response) {
    const duration = Date.now() - ctx.startTime;
    console.log(`[RESPONSE] [${ctx.correlationId}] Duration: ${duration}ms Status: ${response.statusCode || 200}`);

    return {
      success: response.success ?? true,
      data: response.data ?? response,
      meta: {
        correlationId: ctx.correlationId,
        responseTimeMs: duration,
        timestamp: new Date().toISOString()
      }
    };
  }
};
```

## 3. Pipeline Runner
```javascript
export async function executePipeline(ctx, handlers, reqInterceptors, resInterceptors) {
  // 1. Run Request Interceptors
  for (const interceptor of reqInterceptors) {
    await interceptor.process(ctx);
  }

  // 2. Dispatch Handler (Async predicate evaluation)
  let matchedHandler = null;
  for (const handler of handlers) {
    if (await handler.canHandle(ctx)) {
      matchedHandler = handler;
      break;
    }
  }

  if (!matchedHandler) throw new Error("No handler found");
  let response = await matchedHandler.handle(ctx);

  // 3. Run Response Interceptors
  for (const interceptor of resInterceptors) {
    response = (await interceptor.process(ctx, response)) || response;
  }

  return response;
}
```

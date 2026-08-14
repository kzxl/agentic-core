---
name: NodeJsErrorBoundaryHandler
desc: Centralized and typed error handling using predicate-based error handlers in Node.js
rules: [R_NODE]
---
# 🛡️ Node.js Error Boundary & Exception Handler Pattern

**Goal:** Centralize error management using granular, predicate-based error handlers (Validation, Authentication, Database, Unhandled) to return safe, standardized responses without leaking sensitive stack traces.

## 1. Error Handler Structure
Similar to Request Handlers, each Error Handler implements `canHandle(ctx, error)` and `handle(ctx, error)`.

```javascript
// 1. Validation Error Handler
export const ValidationErrorHandler = {
  canHandle(ctx, error) {
    return error.name === 'ValidationError' || error.isJoi || error.code === 'INVALID_INPUT';
  },
  async handle(ctx, error) {
    return {
      statusCode: 400,
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details || []
      }
    };
  }
};

// 2. Authentication / Authorization Error Handler
export const AuthErrorHandler = {
  canHandle(ctx, error) {
    return error.name === 'UnauthorizedError' || error.code === 'UNAUTHORIZED' || error.status === 401;
  },
  async handle(ctx, error) {
    return {
      statusCode: 401,
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required or session expired'
      }
    };
  }
};

// 3. Fallback / Unhandled Exception Handler
export const GlobalFallbackErrorHandler = {
  canHandle(ctx, error) {
    return true; // Catches all remaining unhandled errors
  },
  async handle(ctx, error) {
    console.error(`[CRITICAL ERROR] [${ctx.correlationId || 'N/A'}]`, error);
    return {
      statusCode: 500,
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred. Please try again later.'
      }
    };
  }
};
```

## 2. Dispatching Errors
```javascript
export async function dispatchError(ctx, error, errorHandlers) {
  for (const handler of errorHandlers) {
    if (await handler.canHandle(ctx, error)) {
      return await handler.handle(ctx, error);
    }
  }
  // Safe default fallback
  return { statusCode: 500, success: false, message: 'Internal Server Error' };
}
```

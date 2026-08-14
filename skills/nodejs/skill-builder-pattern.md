---
name: NodeJsSkillBuilderPattern
desc: Fluent builder for composing handlers, interceptors, error boundaries and persistence adapters in Node.js
rules: [R_NODE]
---
# 🏗️ Node.js Module Fluent Builder Pattern

**Goal:** Provide a clean, declarative Fluent Builder API to assemble Request Handlers, Error Boundaries, Interceptors, and Persistence Adapters into an execution pipeline.

## 1. ModuleBuilder Implementation
```javascript
export class ModuleBuilder {
  constructor() {
    this.requestHandlers = [];
    this.errorHandlers = [];
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.persistenceAdapter = null;
  }

  addRequestHandlers(...handlers) {
    this.requestHandlers.push(...handlers);
    return this;
  }

  addErrorHandlers(...handlers) {
    this.errorHandlers.push(...handlers);
    return this;
  }

  addRequestInterceptors(...interceptors) {
    this.requestInterceptors.push(...interceptors);
    return this;
  }

  addResponseInterceptors(...interceptors) {
    this.responseInterceptors.push(...interceptors);
    return this;
  }

  withPersistenceAdapter(adapter) {
    this.persistenceAdapter = adapter;
    return this;
  }

  create() {
    return {
      execute: async (context) => {
        try {
          context.persistence = this.persistenceAdapter;

          // 1. Execute Request Interceptors
          for (const interceptor of this.requestInterceptors) {
            await interceptor.process(context);
          }

          // 2. Locate and execute matching Request Handler
          let handled = false;
          let response = null;
          for (const handler of this.requestHandlers) {
            if (await handler.canHandle(context)) {
              response = await handler.handle(context);
              handled = true;
              break;
            }
          }

          if (!handled) {
            throw new Error(`Unhandled request for action: ${context.action || context.path}`);
          }

          // 3. Execute Response Interceptors
          for (const interceptor of this.responseInterceptors) {
            response = (await interceptor.process(context, response)) || response;
          }

          return response;
        } catch (error) {
          // 4. Fallback to Error Handlers
          for (const errorHandler of this.errorHandlers) {
            if (await errorHandler.canHandle(context, error)) {
              return await errorHandler.handle(context, error);
            }
          }
          throw error;
        }
      }
    };
  }
}
```

## 2. Practical Application Example
```javascript
import { ModuleBuilder } from './ModuleBuilder';
import { UserActivationHandler } from './handlers/UserActivationHandler';
import { QueryDevicesHandler } from './handlers/QueryDevicesHandler';
import { RequestLoggingInterceptor, AuthContextInterceptor } from './interceptors';
import { ValidationErrorHandler, GlobalFallbackErrorHandler } from './errorHandlers';
import { RedisPersistenceAdapter } from './adapters/RedisPersistenceAdapter';

export const activationApp = new ModuleBuilder()
  .addRequestHandlers(UserActivationHandler, QueryDevicesHandler)
  .addRequestInterceptors(RequestLoggingInterceptor, AuthContextInterceptor)
  .addErrorHandlers(ValidationErrorHandler, GlobalFallbackErrorHandler)
  .withPersistenceAdapter(new RedisPersistenceAdapter(redisClient))
  .create();

// Express Route Integration:
app.post('/api/activation', async (req, res) => {
  const context = { action: req.body.action, payload: req.body.payload, headers: req.headers };
  const result = await activationApp.execute(context);
  res.status(result.statusCode || 200).json(result);
});
```

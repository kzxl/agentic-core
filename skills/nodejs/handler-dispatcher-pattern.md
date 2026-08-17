---
name: NodeJsHandlerDispatcherPattern
desc: Handler-based dispatcher architecture using canHandle and handle predicates (inspired by ASK SDK v2)
rules: [R_NODE]
category: NodeJs
---
# 🧩 Node.js Handler-Dispatcher Architecture Pattern

**Goal:** Eliminate monolithic `switch-case` or nested `if-else` blocks in Controllers/Services by decomposing business logic into autonomous, testable handlers adhering to Single Responsibility (SRP) and Open/Closed (OCP) principles.

## 1. Standard Handler Structure
Each handler is an independent object or class implementing two core methods:
1. `canHandle(context)`: Returns `boolean` (or `Promise<boolean>`) determining whether this handler can process the incoming request/event.
2. `handle(context)`: Executes domain logic and returns the structured result.

```javascript
/**
 * @typedef {Object} RequestHandler
 * @property {function(Object): boolean|Promise<boolean>} canHandle
 * @property {function(Object): Promise<Object>} handle
 */

// Example: UserActivationHandler
export const UserActivationHandler = {
  canHandle(ctx) {
    return ctx.action === 'ACTIVATE_KEY' && ctx.user?.role === 'admin';
  },
  async handle(ctx) {
    const { key, deviceId } = ctx.payload;
    const result = await activationService.activate(key, deviceId);
    return { success: true, data: result };
  }
};
```

## 2. Dispatcher Engine
```javascript
export class HandlerDispatcher {
  constructor() {
    this.handlers = [];
  }

  register(...handlers) {
    this.handlers.push(...handlers);
    return this;
  }

  async dispatch(context) {
    for (const handler of this.handlers) {
      if (await handler.canHandle(context)) {
        return await handler.handle(context);
      }
    }
    throw new Error(`[Dispatcher] No matching handler found for action: ${context.action || 'UNKNOWN'}`);
  }
}
```

## 3. Key Benefits & Use Cases
- **Extensibility:** Introduce new features by adding a dedicated handler without modifying existing codebase.
- **Isolated Unit Testing:** Easily test `canHandle` predicates and `handle` execution in isolation without bootstrapping the full server.
- **Recommended Applications:** API Gateways, Event Handlers (Socket.IO/Kafka/RabbitMQ), Dynamic Business Rules, Multi-tenant dispatching.

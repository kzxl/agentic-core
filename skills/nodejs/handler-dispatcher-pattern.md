---
name: NodeJsHandlerDispatcherPattern
desc: Handler-based dispatcher architecture using canHandle and handle predicates (inspired by ASK SDK v2)
rules: [R_NODE]
category: NodeJs
---
# 🧩 Node.js Handler-Dispatcher Architecture Pattern

**Goal:** Eradicate monolithic `switch-case` and cascading `if-else` routing blocks in Node.js/TypeScript services by decomposing commands, webhooks, and domain events into open-closed, polymorphic handlers (`canHandle` + `handle`) backed by an $O(1)$ priority registry.

---

## 1. Quantitative Dispatcher Invariants & Complexity Thresholds
| Metric / Constraint | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Branching Depth in Routers** | $0$ `switch` or $> 2$-branch `if/else` chains | Decompose each command/event into an isolated `IRequestHandler` |
| **Primary Route Resolution** | $O(1)$ hash lookup via `supportedActions` index | Pre-index static action keys in `Map<string, Handler[]>` at registration |
| **Handler Size Ceiling** | $\le 80$ LOC per handler module | Single-responsibility command execution |
| **Unmatched Action Handling** | Deterministic `UnhandledActionError` (`400`/`422`) | Never silently return `undefined` on unknown commands |

---

## 2. Code Comparison: Monolithic `switch` Router vs Open-Closed Handler Registry

```ts
// ❌ BAD: Monolithic switch-case violates Open-Closed Principle and couples 15 domain services
export async function processWebhookBad(event: WebhookEvent) {
  switch (event.type) {
    case 'KEY_ACTIVATED':
      if (event.userRole === 'admin') return await keyService.activateAdmin(event.payload);
      return await keyService.activateStandard(event.payload);
    case 'KEY_REVOKED':
      return await keyService.revoke(event.payload);
    // ... 400 lines of tangled cases that break whenever a new event is added
  }
}

// ✅ GOOD: Polymorphic Handler Contract + Priority O(1) Indexed Dispatcher
export interface DispatchContext<TPayload = unknown> {
  readonly action: string;
  readonly correlationId: string;
  readonly principal?: { readonly userId: string; readonly role: 'admin' | 'member' };
  readonly payload: TPayload;
  readonly signal?: AbortSignal;
}

export interface CommandHandler<TPayload = any, TResult = unknown> {
  readonly name: string;
  readonly priority?: number; // Higher executes first when multiple handlers match an action
  readonly supportedActions?: readonly string[]; // Optional O(1) fast-path index keys
  canHandle(ctx: DispatchContext<TPayload>): boolean | Promise<boolean>;
  handle(ctx: DispatchContext<TPayload>): Promise<TResult>;
}
```

---

## 3. Production $O(1)$ Indexed & Priority-Sorted Dispatcher Engine

By combining an $O(1)$ `Map<string, CommandHandler[]>` for known `action` types with a priority-ordered fallback chain for dynamic predicate handlers, the dispatcher achieves sub-microsecond routing:

```ts
export class HandlerDispatcher {
  private readonly actionIndex = new Map<string, CommandHandler[]>();
  private readonly wildcardHandlers: CommandHandler[] = [];

  public register(...handlers: readonly CommandHandler[]): this {
    for (const handler of handlers) {
      if (handler.supportedActions && handler.supportedActions.length > 0) {
        for (const action of handler.supportedActions) {
          const bucket = this.actionIndex.get(action) ?? [];
          bucket.push(handler);
          bucket.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
          this.actionIndex.set(action, bucket);
        }
      } else {
        this.wildcardHandlers.push(handler);
        this.wildcardHandlers.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
      }
    }
    return this;
  }

  public async dispatch<TResult = unknown>(ctx: DispatchContext): Promise<TResult> {
    const candidates = [
      ...(this.actionIndex.get(ctx.action) ?? []),
      ...this.wildcardHandlers,
    ];

    for (const handler of candidates) {
      if (await handler.canHandle(ctx)) {
        return (await handler.handle(ctx)) as TResult;
      }
    }

    throw new Error(`[HandlerDispatcher] No registered handler matched action="${ctx.action}" (correlationId=${ctx.correlationId})`);
  }
}

// Example: Isolated, unit-testable Admin Key Activation Handler
export const AdminActivateKeyHandler: CommandHandler<{ keyId: string; deviceId: string }> = {
  name: 'AdminActivateKeyHandler',
  priority: 100,
  supportedActions: ['ACTIVATE_KEY'],
  canHandle(ctx) {
    return ctx.action === 'ACTIVATE_KEY' && ctx.principal?.role === 'admin';
  },
  async handle(ctx) {
    return await activationService.activatePrivileged(ctx.payload.keyId, ctx.payload.deviceId, ctx.signal);
  },
};
```


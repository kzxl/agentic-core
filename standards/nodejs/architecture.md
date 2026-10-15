---
desc: Node.js (Express / TypeScript) Layered Architecture & Routing Standards
rules: [R_NODE]
---
# 🟢 Node.js Layered Architecture Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Layer / Component | Responsibility & Hard Boundary | Prohibited Operations |
| :--- | :--- | :--- |
| **Router / Controller** | HTTP transport binding, status codes, DTO validation middleware | `0` SQL/ORM queries, `0` business branches, `0` direct event emissions |
| **Handler-Dispatcher** | Polymorphic command/event routing via `canHandle(ctx)` / `handle(ctx)` | Switch/if-else chains exceeding `3` branches (`O(1)` or registry dispatch) |
| **Service Layer** | Domain invariants, transaction orchestration, domain event dispatch | `0` references to `req`, `res`, `NextFunction`, or HTTP headers |
| **Repository Layer** | Parameterized persistence, entity mapping, cursor pagination | `0` domain policy mutations or cross-service HTTP calls |
| **Dependency Graph** | Acyclic constructor injection wired at composition root (`main.ts`) | `0` circular module imports (`madge --circular src/` must return `0`) |

---

## 2. DTO Boundary Validation & Zero Business Logic in Routers

Every external entry point (HTTP `req.body`/`req.query`/`req.params`, WebSocket frames, Queue payloads) MUST be validated and coerced into an immutable TypeScript DTO using **Zod** or **TypeBox** before invoking the Controller. Controllers act strictly as thin transport adapters (`<= 25 lines` per method).

```typescript
// ❌ BAD: Unvalidated req.body, SQL queries & business logic mixed inside Express route handler
app.post('/api/v1/orders', async (req, res) => {
  const { userId, items, coupon } = req.body; // Untrusted any!
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (!user.rows[0]?.is_active) return res.status(403).send('Inactive');
  let total = items.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  if (coupon === 'VIP50') total *= 0.5;
  const order = await db.query('INSERT INTO orders ...', [userId, total]);
  io.emit('order:created', order.rows[0]); // Transport coupling!
  res.json(order.rows[0]);
});

// ✅ GOOD: Schema validation middleware, thin controller, pure constructor-injected service
import { z } from 'zod';

export const CreateOrderSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(z.object({ sku: z.string().min(1), qty: z.number().int().positive().max(100) })).min(1),
  couponCode: z.string().trim().max(32).optional(),
}).strict();

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateOrderDto = CreateOrderSchema.parse(req.body);
      const result = await this.orderService.placeOrder(dto, req.id);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}
```

---

## 3. Handler-Dispatcher Pattern (`canHandle` / `handle`) & Dependency Injection

To satisfy the Open-Closed Principle (`OCP`) and prevent monolithic Services with sprawling `switch (event.type)` blocks, route heterogeneous workflows through an explicit **Handler-Dispatcher** registry injected via Constructor DI. Never instantiate services or database clients at module import time (`new Service()` at top level), which causes circular `require` deadlocks and untestable singletons.

```typescript
// ✅ GOOD: Pluggable Handler-Dispatcher contract with acyclic constructor injection
export interface DomainTaskHandler<TPayload = unknown, TResult = void> {
  readonly name: string;
  canHandle(taskType: string, payload: TPayload): boolean;
  handle(ctx: ExecutionContext, payload: TPayload): Promise<TResult>;
}

export class TaskDispatcher {
  constructor(private readonly handlers: readonly DomainTaskHandler[]) {}

  public async dispatch<TPayload, TResult>(
    ctx: ExecutionContext,
    taskType: string,
    payload: TPayload,
  ): Promise<TResult> {
    const matched = this.handlers.find((h) => h.canHandle(taskType, payload));
    if (!matched) {
      throw new UnsupportedTaskError(`No registered handler for taskType="${taskType}"`);
    }
    return matched.handle(ctx, payload) as Promise<TResult>;
  }
}
```

---

## 4. Ordered Graceful `SIGTERM` Drain Sequence

On `SIGTERM` / `SIGINT`, execute a deterministic 4-stage drain within a `15,000 ms` deadline:
1. Flip readiness probe to `503 Service Unavailable` so ingress halts new traffic.
2. Call `httpServer.close()` to stop accepting new connections while draining in-flight requests.
3. Drain background workers (`await workerPool.drain()`).
4. Close DB/Redis pools (`await dbPool.end()`) and exit with code `0`.

---
name: EventDrivenArchitecture
desc: Universal Event-Driven Architecture blueprint covering in-process EventBus, Distributed Pub/Sub, Outbox Pattern, and Saga Orchestration
rules: [R_EVT, R_UNIVERSE, R_CORE]
category: Architecture
---
# ⚡ Universal Event-Driven Architecture Blueprint

**Goal:** Decouple synchronous cross-domain dependencies through immutable domain events, atomic Transactional Outbox persistence, idempotent consumer deduplication, and deterministic Saga compensation (`[R_EVT, R_UNIVERSE, R_CORE]`).

---

## 1. Reliability Invariants & Delivery Guarantees

| Architectural Component | Mandatory Guarantee | Persistence Mechanism | Violation Consequence |
| :--- | :--- | :--- | :--- |
| **Event Publication** | **At-Least-Once** atomic capture | Local `sys_outbox_messages` in same ACID transaction | Ghost orders (DB committed, broker event lost on crash) |
| **Outbox Relay Worker** | Concurrent lock-free batch polling | `SELECT ... FOR UPDATE SKIP LOCKED LIMIT 100` | Duplicate relay contention across horizontally scaled pods |
| **Event Consumption** | **Effectively-Once** state mutation | `sys_inbox_dedup (event_id, consumer_group)` unique PK | Double inventory deduction or duplicate customer billing |
| **Poison Message Handling** | Bounded retries (`MaxAttempts = 5`) + DLQ | Exponential backoff (`2^n * 1000ms`) -> `*.dlq` topic | Single malformed payload blocks entire partition consumer |
| **Ordering Guarantee** | Causal ordering per aggregate root | Broker partition key = `aggregate_id` | `OrderCancelled` processed before `OrderCreated` |

### Core Architectural Rules
1. **Zero Dual-Write to Broker:** Never call `broker.PublishAsync()` directly inside a DB transaction; persist events to `sys_outbox_messages` in the same ACID commit.
2. **Immutable Versioned Envelopes:** Carry `eventId` (UUIDv7), `eventType` (`v1.order.placed`), `aggregateId`, `correlationId`, and schema-versioned payload.
3. **Saga Classification:** Separate steps into *Compensatable Transactions* (with undo commands), *Pivot Transaction* (point of no return), and *Retriable Transactions*.

---

## 2. Failure Modes & Anti-Patterns

- **Publish-Before-Commit Ghost Events:** Emitting broker messages before local DB commit leaks rollback-invalidated state to consumers.
- **Non-Atomic Deduplication:** Checking Redis before DB mutation races under redelivery bursts; insert `sys_inbox_dedup` inside the consumer's DB transaction.

---

## 3. Production Implementation: Atomic Outbox & Idempotent Inbox

```typescript
// ❌ BAD: Dual-write between PostgreSQL and Broker loses events if process crashes after COMMIT
export async function placeOrderBad(db: PoolClient, broker: Broker, order: Order) {
  await db.query('INSERT INTO orders (id, total) VALUES ($1, $2)', [order.id, order.total]);
  await broker.publish('orders.events', { type: 'OrderPlaced', orderId: order.id });
}

// ✅ GOOD: Atomic Business Write + Outbox Insert & Idempotent Consumer Deduplication
import { Pool, PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';

export interface EventEnvelope<T> {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly correlationId: string;
  readonly payload: T;
}

export async function placeOrderWithOutbox(
  pool: Pool,
  order: { id: string; totalCents: number },
  correlationId: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO orders (id, total_cents) VALUES ($1, $2)', [order.id, order.totalCents]);
    const evt: EventEnvelope<typeof order> = {
      eventId: randomUUID(),
      eventType: 'v1.order.placed',
      aggregateId: order.id,
      correlationId,
      payload: order,
    };
    await client.query(
      `INSERT INTO sys_outbox_messages (event_id, aggregate_id, event_type, payload) VALUES ($1, $2, $3, $4::jsonb)`,
      [evt.eventId, evt.aggregateId, evt.eventType, JSON.stringify(evt)]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function consumeIdempotent<T>(
  pool: Pool,
  group: string,
  evt: EventEnvelope<T>,
  handler: (client: PoolClient, payload: T) => Promise<void>
): Promise<'PROCESSED' | 'DUPLICATE'> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const dedup = await client.query(
      `INSERT INTO sys_inbox_dedup (event_id, consumer_group) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [evt.eventId, group]
    );
    if (dedup.rowCount === 0) {
      await client.query('ROLLBACK');
      return 'DUPLICATE';
    }
    await handler(client, evt.payload);
    await client.query('COMMIT');
    return 'PROCESSED';
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
```

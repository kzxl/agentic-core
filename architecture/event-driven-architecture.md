---
name: EventDrivenArchitecture
desc: Universal Event-Driven Architecture blueprint covering in-process EventBus, Distributed Pub/Sub, Outbox Pattern, and Saga Orchestration
rules: [R_EVT, R_UNIVERSE, R_CORE]
category: Architecture
---
# ⚡ Universal Event-Driven Architecture Blueprint

**Goal:** Decouple monolithic synchronous dependencies across domains and services through asynchronous domain events, publish/subscribe messaging, and reliable state convergence.

---

## 1. Core Topologies

### A. In-Process Event Bus (Modular Monolith / Desktop)
Used for decoupling modules within the same runtime process (Node.js EventEmitter, C# MediatR / Prism EventAggregator, Go Channels).

```javascript
// In-Process Domain Event Example
export class DomainEventPublisher {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(eventName, handler) {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, []);
    }
    this.subscribers.get(eventName).push(handler);
  }

  async publish(event) {
    const handlers = this.subscribers.get(event.name) || [];
    await Promise.all(handlers.map(fn => fn(event)));
  }
}
```

### B. Distributed Message Broker (Microservices / Multi-process)
Used for cross-service events (RabbitMQ, Apache Kafka, Redis Streams, AWS SQS/SNS).

---

## 2. Critical Reliability Patterns

### A. The Transactional Outbox Pattern
**Problem:** Dual-write hazard (Database write succeeds, but Message Broker publish fails or network drops).
**Solution:** Persist the event in an `Outbox` table in the SAME database transaction as the business entity. A background worker periodically pulls unpublished outbox records and delivers them to the broker with guaranteed **At-Least-Once** delivery.

```sql
CREATE TABLE sys_outbox_events (
  id VARCHAR(36) PRIMARY KEY,
  aggregate_type VARCHAR(100) NOT NULL,
  aggregate_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL
);
```

### B. Idempotent Consumer Pattern
Since distributed events may be delivered more than once, consumers MUST be idempotent:
- Track processed `event_id` in a deduplication store.
- Use conditional writes / optimistic concurrency (`version` checks).

---

## 3. Checklist for Agent Implementation
- [ ] Events are named in past tense (`OrderPlaced`, `UserActivated`, `StockOutCompleted`).
- [ ] Events contain immutable, versioned payloads with timestamps and correlation IDs.
- [ ] Consumers never mutate other services' databases directly; communication is event-only.
- [ ] Critical business operations implement the Outbox pattern or Saga compensation.

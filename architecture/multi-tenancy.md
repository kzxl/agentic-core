---
name: MultiTenantArchitecture
desc: Universal Multi-Tenancy blueprint covering data isolation, Row-Level Security, Schema-per-tenant, and dynamic context resolution
rules: [R_CORE, R_DB]
category: Architecture
---
# 🏢 Universal Multi-Tenancy Architecture Blueprint

**Goal:** Serve multiple independent tenant organizations from a unified deployment while guaranteeing deterministic data isolation, zero cross-tenant cache bleed, and bounded noisy-neighbor blast radius (`[R_CORE, R_DB]`).

---

## 1. Architectural Invariants & Isolation Models

| Isolation Model | Tenant Storage Topology | Cross-Tenant Blast Radius | Max Tenants / Cluster | Operational Overhead | Target Domain |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Pooled Row-Level (`RLS`)** | Shared DB, Shared Tables (`tenant_id` column) | Medium (Requires DB RLS + Index prefix) | `10,000 - 1,000,000+` | Lowest (Single migration) | B2B SaaS, High-volume multi-tenant platforms |
| **2. Bridge Schema-per-Tenant** | Shared DB, Isolated Schema (`tenant_x.orders`) | Low (Schema namespace boundary) | `100 - 2,500` | Medium (Per-schema DDL) | Mid-market ERP, Customizable enterprise suites |
| **3. Siloed DB-per-Tenant** | Dedicated Database instance per tenant | Zero (Physical compute/storage boundary) | `10 - 500` | High (Orchestrated fleet DDL) | Banking, Healthcare (HIPAA), Sovereign Defense |

### Mandatory Multi-Tenant Invariants
1. **Composite Index Prefix (`(tenant_id, ...)`):** In Pooled RLS models, every primary lookup, foreign key index, and unique constraint MUST lead with `tenant_id` (`CREATE UNIQUE INDEX uix_orders_tenant ON orders (tenant_id, order_code)`).
2. **Engine-Level Row-Level Security (RLS):** Enforce PostgreSQL / SQL Server RLS policies bound to transaction session context (`current_setting('app.current_tenant_id')` or `SESSION_CONTEXT(N'TenantId')`) as defense-in-depth beneath ORM query filters.
3. **Cache & Queue Namespacing:** Prefix every Redis key, S3 object path, and lock key with `t:{tenantId}:{domain}:{entityId}`.
4. **Per-Tenant Quota Partitioning:** Partition rate limiters and concurrency semaphores by `tenantId` to prevent noisy-neighbor pool starvation.

---

## 2. Failure Modes & Anti-Patterns

- **Unvalidated Header Spoofing (`X-Tenant-Id`):** Trusting raw `X-Tenant-Id` headers instead of cryptographically verified JWT claims or mTLS certs allows trivial cross-tenant privilege escalation.
- **Connection Pool Context Bleed:** Executing session-level `SET` instead of transaction-scoped `SET LOCAL` (or `set_config(..., true)`) leaks tenant context across pooled connections.

---

## 3. Production Implementation: JWT Context & PostgreSQL RLS

### ❌ BAD: Unverified Header & Session-Level Pool Mutation
```typescript
app.use(async (req, res, next) => {
  const tenantId = req.headers['x-tenant-id']; // ❌ Spoofable header!
  await dbPool.query(`SET app.current_tenant_id = '${tenantId}'`); // ❌ SQLi + leaks across pool!
  next();
});
```

### ✅ GOOD: JWT-Bound `AsyncLocalStorage` & Transaction-Scoped `SET LOCAL`
```typescript
import { AsyncLocalStorage } from 'node:async_hooks';
import { Pool, PoolClient } from 'pg';

export const tenantStorage = new AsyncLocalStorage<{ readonly tenantId: string }>();

export function requireTenantContext(req: Request, res: Response, next: NextFunction): void {
  const verifiedTenantId = req.auth?.claims?.tenant_id;
  if (!verifiedTenantId || !/^[0-9a-f-]{36}$/i.test(verifiedTenantId)) {
    res.status(403).json({ error: 'ERR_TENANT_CONTEXT_MISSING' });
    return;
  }
  tenantStorage.run({ tenantId: verifiedTenantId }, () => next());
}

export async function withTenantTransaction<T>(
  pool: Pool,
  work: (client: PoolClient, tenantId: string) => Promise<T>
): Promise<T> {
  const scope = tenantStorage.getStore();
  if (!scope?.tenantId) throw new Error('Missing active TenantScope');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Third arg 'true' scopes setting strictly to current transaction (SET LOCAL)
    await client.query('SELECT set_config($1, $2, true)', ['app.current_tenant_id', scope.tenantId]);
    const result = await work(client, scope.tenantId);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```
```sql
ALTER TABLE tenant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_orders FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON tenant_orders
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
```

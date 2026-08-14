---
name: MultiTenantArchitecture
desc: Universal Multi-Tenancy blueprint covering data isolation, Row-Level Security, Schema-per-tenant, and dynamic context resolution
rules: [R_CORE, R_DB]
category: Architecture
---
# 🏢 Universal Multi-Tenancy Architecture Blueprint

**Goal:** Securely serve multiple independent tenant organizations from a single software deployment while guaranteeing complete data isolation and performance isolation.

---

## 1. Data Isolation Strategies

| Strategy | Isolation Level | Maintenance Cost | Resource Efficiency | Recommended For |
| :--- | :--- | :--- | :--- | :--- |
| **1. Shared DB + Row-Level (Tenant ID)** | Logical | Lowest | Highest | Standard SaaS, HelpDesk, B2B SaaS |
| **2. Shared DB + Schema-per-Tenant** | Schema-level | Medium | High | Mid-tier Enterprise, Custom Fields |
| **3. Database-per-Tenant** | Physical | High | Medium | High-Compliance, Banking, Military |

---

## 2. Row-Level Tenant Context Resolution

```javascript
// Middleware: Resolve Tenant from Subdomain or JWT Claim
export const TenantContextMiddleware = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId || extractSubdomain(req.hostname);
  if (!tenantId) {
    return res.status(400).json({ success: false, message: 'Tenant identifier missing' });
  }

  req.tenantContext = { tenantId };
  next();
};

// Data Access Layer: Enforce Tenant Scope automatically
export function scopedQuery(baseQuery, tenantContext) {
  return {
    ...baseQuery,
    tenant_id: tenantContext.tenantId
  };
}
```

---

## 3. Checklist for Multi-Tenant Projects
- [ ] Every persistent entity table/collection includes `tenant_id` with composite indexes `(tenant_id, id)`.
- [ ] Database queries NEVER omit the `tenant_id` filter (enforced at ORM/Repository layer).
- [ ] Tenant context is propagated automatically via AsyncLocalStorage / ThreadLocal context.

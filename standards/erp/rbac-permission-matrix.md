---
desc: Enterprise RBAC & Multi-Tenant Data Sovereignty Standards
rules: [R_DOMAIN_AUTH, R_SEC_STD, R_API]
---
# 🔐 Enterprise RBAC & Multi-Tenant Data Sovereignty Standards

> **Scope:** Two-tier enterprise authorization, feature-action permissions, Row-Level Security (RLS) data filtering, and client UI signal delegation vs backend enforcement.

---

## 🏛️ 1. Core Architectural Invariants

### 1.1 Two-Tier Authorization Architecture
Enterprise ERP security is governed by two independent, non-interfering layers:
1. **Tier 1: Feature-Action Authorization (Functional RBAC):** Controls which operations a user or role can trigger on a given functional feature (Read, Add, Edit, Delete, Export, Approve, Print).
2. **Tier 2: Row-Level Security (Data Isolation / RLS):** Controls which specific records the user is allowed to see or mutate based on organizational hierarchy (Company, Subsidiary, Branch, Department, or Warehouse Location).

```text
┌────────────────────────────────────────────────────────┐
│ USER REQUEST: "Export Sales Invoices for Hanoi Branch"  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ TIER 1: FEATURE-ACTION CHECK                           │
│ Does Role 'SalesStaff' have 'CanExport' on 'Invoices'? │
└───────────────────────────┬────────────────────────────┘
                            │ Pass
                            ▼
┌────────────────────────────────────────────────────────┐
│ TIER 2: ROW-LEVEL SECURITY (RLS) FILTER               │
│ WHERE BranchId IN ('HN_01') AND CompanyId = 'CORP_VN'   │
└────────────────────────────────────────────────────────┘
```

### 1.2 Client UI Signal Delegation vs Backend Hard Enforcement
- Client UI controls (disabling buttons, hiding tabs, graying out menu items) are strictly for **User Ergonomics**, NOT for security.
- The Backend WebAPI / Business Service MUST independently evaluate both Feature-Action and RLS constraints on every request, regardless of client identity.
- Never rely on client-supplied parameters for organizational tenancy (e.g., `BranchId` or `TenantId` must be resolved from the authenticated JWT claims or server session, never trusted from the client payload).

---

## ⚙️ 2. Implementation Specifications

### 2.1 Feature Action Bitmask or Enum
Feature actions are represented by standardized bitwise flags or strongly-typed capability codes:
```csharp
[Flags]
public enum FeaturePermission : int
{
    None    = 0,
    Read    = 1 << 0, // 1
    Add     = 1 << 1, // 2
    Edit    = 1 << 2, // 4
    Delete  = 1 << 3, // 8
    Export  = 1 << 4, // 16
    Approve = 1 << 5, // 32
    Print   = 1 << 6  // 64
}
```

### 2.2 RLS Query Interception Pattern
- In repository queries or ORM configurations, append multi-tenant predicates automatically via query filters or session parameters:
  ```sql
  -- Parameterized RLS Filter
  SELECT i.* 
  FROM tblSalesInvoice i
  WHERE i.TenantId = @SessionTenantId
    AND (@IsGlobalAdmin = 1 OR i.BranchId IN (SELECT BranchId FROM @UserAuthorizedBranches));
  ```

---

## 🛡️ 3. Verification & Auditing
- Automated integration tests MUST assert that a user lacking `CanDelete` receives an `AccessDeniedException` (HTTP 403) when attempting a deletion endpoint.
- Cross-tenant data leakage tests must attempt to query records from a foreign `BranchId` / `TenantId` and verify that exactly 0 records are returned.

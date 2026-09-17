---
desc: Enterprise Sales Order, Packing Log (NKDG) & Journaling Standards
rules: [R_DOMAIN_SALES, R_WPF, R_API]
---
# 💼 Enterprise Sales Order, Packing Log & Journaling Standards

> **Scope:** Order processing, multi-level price calculation, approval workflows, selective packing log generation (NKDG), and accounting journal transitions.

---

## 🏛️ 1. Core Architectural Invariants

### 1.1 Decoupled Pricing & Discount Calculation Engine
- Calculation of subtotal, tiered volume discounts, customer-specific price rules, and taxes MUST be executed by a pure business service (`ISalesPricingEngine`), NEVER inside WinForms/WPF form event handlers or SQL UI triggers.
- Pricing engines must be deterministic: identical input order lines, customer grade, and order date must yield bitwise-identical financial sums regardless of execution environment (Desktop vs WebAPI).

### 1.2 Mandatory Approval Gate Before Fulfillment
- An order in draft status (`Status = New` or `PendingReview`) cannot trigger warehouse stock reservation or generate shipping manifests.
- Approval requires credit limit validation, margin threshold compliance, and authorized signatory sign-off recorded in the audit trail.

### 1.3 Packing Log (NKDG) Selective Transfer Flow
- Packing generation (`NhatKyDongGoi` / NKDG) transforms approved order line items into physical packaging units (cartons, pallets, containers) based on production area filters and shipping logistics:
  ```text
  [Approved Sales Order] 
       │
       ▼ (Filtered by ProductionArea / ShipmentBatch)
  [Selective Data Transfer] 
       │
       ▼
  [Packing Log (NKDG)] ──> [Barcode/Label Generation] ──> [Warehouse Stock-Out]
  ```
- Transfer logic must be idempotent: generating packing items for an order must not allow duplicate packing entries for lines that have already reached 100% packed status.

---

## ⚙️ 2. UI & Service Layer Separation

### 2.1 View Layer Delegation
- In WinForms/WPF client applications, UI controllers merely capture user inputs (selected order IDs, packing parameters) and delegate execution to the service layer.
- Long-running packing generations or invoice journal batch creations MUST run asynchronously using `Task.Run` or background dispatching, displaying a non-blocking progress indicator to avoid freezing the UI message pump.

### 2.2 Reversal & Cancellation Protocol
- Once an order line item has been packed or journaled into accounting, direct deletion is strictly forbidden.
- Reversals require an explicit `Unpack` or `CreditNote` workflow that generates offsetting ledger entries to preserve full financial provenance.

---

## 🛡️ 3. Verification & Auditing
- Integration tests must verify that partial shipments accurately decrement unfulfilled order quantities without leaving orphan packing records.
- Financial total calculations must use high-precision decimals (`decimal` in C#) and round according to standard enterprise rounding rules (MidpointRounding.AwayFromZero).

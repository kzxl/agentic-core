---
desc: Database Deadlock Defense, Consistent Lock Ordering & Optimistic Concurrency
rules: [R_DB, R_RES]
---
# 🔒 Database Concurrency & Deadlock Defense Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Session Abort & Lock Governance** | `SET XACT_ABORT ON; SET LOCK_TIMEOUT 5000;` (`5s` max wait) | Mandatory header in all stored procedures & sessions |
| **Default Isolation Level** | `READ COMMITTED SNAPSHOT` (`RCSI`) enabled on all OLTP DBs | `ALTER DATABASE [Db] SET READ_COMMITTED_SNAPSHOT ON` |
| **Read-Before-Update Locking** | `WITH (UPDLOCK, ROWLOCK, HOLDLOCK)` on target row | Prevents `S -> X` lock conversion deadlocks |
| **Optimistic Concurrency Column** | `ROWVERSION` (`TIMESTAMP`) or `BIGINT Version` on mutable entities | `WHERE RowVer = @ExpectedRowVer` (`0` rows &rarr; `409 Conflict`) |
| **Deadlock Graph Occurrence** | `0` cyclic table/row ordering deadlocks in production | Deterministic ascending resource sort order |

---

## 2. Session Safety (`XACT_ABORT`) & Conversion Deadlock Defense (`UPDLOCK, ROWLOCK`)

By default in SQL Server, a lock timeout (`Error 1222`) or constraint violation aborts only the single statement, leaving the transaction open and holding locks indefinitely (**zombie transaction**). Every stored procedure and explicit transaction batch MUST begin with `SET XACT_ABORT ON` so any runtime error immediately rolls back the entire transaction.

When reading a record (such as inventory stock or wallet balance) with the intent to update it in the same transaction, a standard `SELECT` under `REPEATABLE READ` or `SERIALIZABLE` acquires a Shared (`S`) lock. If two sessions both acquire `S` locks on the same row and then attempt to `UPDATE` (requiring an Exclusive `X` lock), both block each other forever (**Conversion Deadlock**). Always hint `WITH (UPDLOCK, ROWLOCK)` on the initial `SELECT` to serialize update intent at read time.

```sql
-- ❌ BAD: Missing XACT_ABORT, S-lock read followed by X-lock update causes instant Conversion Deadlock under concurrency
CREATE PROCEDURE dbo.usp_ReserveStockBad
    @SkuId BIGINT,
    @Qty   INT
AS
BEGIN
    BEGIN TRANSACTION;
    DECLARE @Available INT;
    SELECT @Available = AvailableQty FROM dbo.Inventory WHERE SkuId = @SkuId; -- Acquires Shared (S) lock or no lock
    IF @Available < @Qty
        THROW 50001, 'Insufficient stock', 1; -- Transaction remains OPEN if XACT_ABORT is OFF!

    UPDATE dbo.Inventory SET AvailableQty = AvailableQty - @Qty WHERE SkuId = @SkuId; -- Deadlocks converting S -> X!
    COMMIT TRANSACTION;
END
GO

-- ✅ GOOD: XACT_ABORT ON, 3000ms LOCK_TIMEOUT, and UPDLOCK + ROWLOCK serializes concurrent writers cleanly
CREATE OR ALTER PROCEDURE dbo.usp_ReserveStockGood
    @SkuId BIGINT,
    @Qty   INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET LOCK_TIMEOUT 3000;

    BEGIN TRANSACTION;

    DECLARE @Available INT;
    SELECT @Available = AvailableQty
    FROM dbo.Inventory WITH (UPDLOCK, ROWLOCK)
    WHERE SkuId = @SkuId;

    IF @Available IS NULL OR @Available < @Qty
    BEGIN
        ROLLBACK TRANSACTION;
        ;THROW 50001, 'Insufficient stock available for reservation.', 1;
    END

    UPDATE dbo.Inventory
    SET AvailableQty = AvailableQty - @Qty,
        ReservedQty  = ReservedQty + @Qty,
        UpdatedAt    = SYSUTCDATETIME()
    WHERE SkuId = @SkuId;

    COMMIT TRANSACTION;
END
```

---

## 3. Optimistic Concurrency (`ROWVERSION`) & Deterministic Lock Ordering

- **Deterministic Lock Ordering:** Modify tables in a canonical hierarchy (`Orders` &rarr; `OrderItems` &rarr; `Inventory`) and sort multi-row updates by `ORDER BY Id ASC`.
- **Optimistic Concurrency (`ROWVERSION`):** Include a `RowVer ROWVERSION NOT NULL` column on entities edited across HTTP requests and verify `RowVer = @ExpectedRowVer` on `UPDATE`.

```sql
-- ✅ GOOD: Atomic optimistic concurrency check prevents Lost Updates across HTTP requests
UPDATE dbo.CustomerContracts
SET CreditLimit = @NewCreditLimit,
    UpdatedBy   = @ActorId,
    UpdatedAt   = SYSUTCDATETIME()
WHERE ContractId = @ContractId
  AND RowVer     = @ExpectedRowVer;

IF @@ROWCOUNT = 0
    ;THROW 50409, 'Concurrency conflict: Contract was modified by another user.', 1;
```

---

## 4. `RCSI` vs. `SNAPSHOT` Isolation Trade-Offs

- **`READ COMMITTED SNAPSHOT` (`RCSI`):** Uses `tempdb` row versions so readers never block writers; each statement sees latest committed state. **Mandatory OLTP default.**
- **`SNAPSHOT` Isolation:** Provides transaction-level repeatable reads and automatic write-write conflict detection (`Error 3960`) for financial reconciliation.

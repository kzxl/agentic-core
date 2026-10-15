---
desc: Database Chunked Bulk Processing & Mandatory Mutation Audit Logging
rules: [R_DB]
---
# 📦 Database Bulk Processing & Audit Logging Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Row-by-Row SQL in Loops** | `0` instances for `> 10` rows | Use `SqlBulkCopy`, TVP, or `OPENJSON` set-based batching |
| **Batch Mutation Chunk Size** | `1,000 – 4,000` rows per transaction batch | Prevents SQL Server Lock Escalation (`>= 5,000` locks) |
| **Audit Trail Completeness** | `100%` of state mutations capture `OldValues` & `NewValues` atomically | SQL `OUTPUT` clause or same-transaction audit insert |
| **Outbox Delivery Guarantee** | At-least-once via same-transaction `OutboxMessages` insert | Transactional Outbox pattern (`0` dual-write broker calls) |
| **Bulk Ingestion Throughput** | `>= 25,000 rows/sec` via `SqlBulkCopy` (`BatchSize = 5000`) | Enable `SqlBulkCopyOptions.CheckConstraints` & `TableLock` (staging) |

---

## 2. High-Throughput Batch Ingestion & Lock Escalation Defense

SQL Server escalates fine-grained row/page locks to an exclusive **Table Lock (`TABLOCKX`)** when a single statement acquires `>= 5,000` locks or exceeds memory thresholds, freezing all concurrent readers and writers.
- **Chunked Batch Mutations:** Always cap bulk `UPDATE` or `DELETE` loops to `2,000 – 4,000` rows (`TOP (2500)`) per transaction commit, pausing `10–25 ms` between chunks if transaction log (`log_send_queue`) pressure rises.
- **Set-Based TVP / `OPENJSON` Upserts:** For batches of `50 – 4,000` records, pass a Table-Valued Parameter (`TVP`) or compressed JSON array parsed via `OPENJSON` in a single round-trip rather than executing `N` individual `INSERT`/`UPDATE` statements.

```sql
-- ❌ BAD: Unbounded DELETE locks millions of rows, triggers Table Lock Escalation, and fills Transaction Log
DELETE FROM dbo.TelemetryEvents
WHERE CreatedAt < DATEADD(DAY, -90, SYSUTCDATETIME());

-- ✅ GOOD: Chunked TOP (2500) batch loop stays strictly below the 5,000-lock escalation threshold
SET NOCOUNT ON;
DECLARE @DeletedRows INT = 1;

WHILE @DeletedRows > 0
BEGIN
    BEGIN TRANSACTION;

    DELETE TOP (2500)
    FROM dbo.TelemetryEvents
    WHERE CreatedAt < DATEADD(DAY, -90, SYSUTCDATETIME());

    SET @DeletedRows = @@ROWCOUNT;
    COMMIT TRANSACTION;

    IF @DeletedRows = 2500
        WAITFOR DELAY '00:00:00.020'; -- 20ms yield allows concurrent OLTP queries and log backups to breathe
END
```

---

## 3. Atomic Mutation Audit Capture via `OUTPUT` Clause & `OPENJSON`

Never rely on application-side "fetch-before-update" queries to build audit logs—concurrent updates between the `SELECT` and `UPDATE` produce inaccurate `OldValues` and double network round-trips. Use the SQL `OUTPUT` clause (`deleted.*` vs `inserted.*`) inside the same statement and transaction to capture exact pre- and post-mutation snapshots atomically.

```sql
-- ✅ GOOD: Single-round-trip batch price update via OPENJSON with atomic OUTPUT audit trail capture
CREATE OR ALTER PROCEDURE dbo.usp_BatchUpdateProductPrices
    @UpdatesJson NVARCHAR(MAX),
    @ActorId     NVARCHAR(64),
    @TraceId     NVARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @AuditBuffer TABLE (
        ProductId   BIGINT,
        OldPrice    DECIMAL(18, 4),
        NewPrice    DECIMAL(18, 4),
        UpdatedAt   DATETIME2(3)
    );

    BEGIN TRANSACTION;

    UPDATE p
    SET p.UnitPrice = j.NewPrice,
        p.UpdatedAt = SYSUTCDATETIME(),
        p.UpdatedBy = @ActorId
    OUTPUT
        inserted.ProductId,
        deleted.UnitPrice,
        inserted.UnitPrice,
        inserted.UpdatedAt
    INTO @AuditBuffer (ProductId, OldPrice, NewPrice, UpdatedAt)
    FROM dbo.Products AS p
    INNER JOIN OPENJSON(@UpdatesJson)
        WITH (
            ProductId BIGINT         '$.productId',
            NewPrice  DECIMAL(18, 4) '$.newPrice'
        ) AS j ON p.ProductId = j.ProductId
    WHERE p.UnitPrice <> j.NewPrice;

    INSERT INTO dbo.AuditLogs (EntityName, EntityId, ActionType, OldValues, NewValues, CreatedBy, TraceId, CreatedAt)
    SELECT
        N'Product',
        CAST(ProductId AS NVARCHAR(64)),
        N'PRICE_UPDATE',
        (SELECT OldPrice FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        (SELECT NewPrice FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        @ActorId,
        @TraceId,
        UpdatedAt
    FROM @AuditBuffer;

    COMMIT TRANSACTION;
END
```

---

## 4. Transactional Outbox Journaling

Never publish RabbitMQ/Kafka events directly inside a database transaction (`dual-write anti-pattern`). Persist domain events into `dbo.OutboxMessages` within the exact same database transaction as the entity mutation, and use a background relay worker (`SELECT ... WITH (UPDLOCK, READPAST)`) to publish and mark messages processed idempotently.


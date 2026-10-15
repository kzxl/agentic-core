---
desc: PHP Yield Generators for Large Dataset Batch Processing and Exports
rules: [R_PHP, R_CORE]
---
# ⚡ PHP Memory Optimization & Generator Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Per-Request / Worker Peak RAM** | `< 32 MB` delta for exports/ETL regardless of dataset row count | `memory_get_peak_usage(true)` telemetry |
| **`fetchAll()` Row Ceiling** | Prohibited on queries potentially returning `> 2,000` rows | Use `yield` generators or keyset cursor chunks |
| **Keyset Batch Cursor Size** | `500 – 2,000` rows per query page (`WHERE id > :lastId LIMIT 1000`) | Zero `OFFSET` pagination on tables `> 50,000` rows |
| **Long-Running Worker GC Cycle** | Invoke `gc_collect_cycles()` every `100` jobs; restart if RSS `> 128 MB` | Worker supervisor loop |
| **OPcache & JIT Geometry** | `opcache.memory_consumption >= 256M`, `validate_timestamps = 0` in prod | Production `php.ini` baseline |

---

## 2. Streaming Datasets with `yield` Generators & Unbuffered Queries

By default, `pdo_mysql` buffers the **entire result set** in native C memory before `PDOStatement::fetch()` returns the first row (`PDO::MYSQL_ATTR_USE_BUFFERED_QUERY = true`). Calling `fetchAll()` on `500,000` rows materializes massive PHP hash tables, triggering `Fatal error: Allowed memory size exhausted`. Combine unbuffered queries (`MYSQL_ATTR_USE_BUFFERED_QUERY => false`) or keyset-paginated chunks with PHP `Generator` (`yield`) pipelines to keep memory usage strictly `O(1)`.

```php
<?php
declare(strict_types=1);

// ❌ BAD: Loads 500,000 rows into RAM at once (> 512MB peak usage) and uses O(N^2) OFFSET pagination
public function exportAuditLogsBad(PDO $db): array {
    $stmt = $db->query('SELECT id, actor_id, payload, created_at FROM audit_logs');
    return $stmt->fetchAll(PDO::FETCH_ASSOC); // Instant OOM on large tables!
}

// ✅ GOOD: Keyset-paginated Generator (WHERE id > :lastId) keeps RAM flat (< 4MB) without pinning DB locks
/**
 * @return Generator<int, array{id: int, actor_id: string, payload: string, created_at: string}>
 */
public function streamAuditLogsGood(PDO $db, int $chunkSize = 1000): Generator {
    $lastId = 0;
    $stmt = $db->prepare(
        'SELECT id, actor_id, payload, created_at
         FROM audit_logs
         WHERE id > :lastId
         ORDER BY id ASC
         LIMIT :limit'
    );

    while (true) {
        $stmt->bindValue(':lastId', $lastId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $chunkSize, PDO::PARAM_INT);
        $stmt->execute();

        $rowCount = 0;
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $lastId = (int) $row['id'];
            $rowCount++;
            yield $lastId => $row;
        }
        $stmt->closeCursor();

        if ($rowCount < $chunkSize) {
            break;
        }
    }
}
```

---

## 3. Cyclic Reference Cleanup in Long-Running Queue Workers

In CLI daemons, RoadRunner/FrankenPHP workers, and queue consumers, ORM Unit-of-Work identity maps and bidirectional object references accumulate across iterations.
- **Explicit Detach & GC:** Clear ORM entity managers (`$entityManager->clear()`), unset large temporary buffers, and invoke `gc_collect_cycles()` after each batch.
- **Graceful Memory Ceiling:** Check `memory_get_usage(true) > 134_217_728` (`128 MB`) at the end of every job tick and exit cleanly with code `0` so `systemd` or Kubernetes spawns a fresh worker process.

```php
// ✅ GOOD: Bounded queue worker loop with deterministic memory reclamation and RSS ceiling exit
public function runWorkerLoop(QueueConsumer $queue, JobProcessor $processor): void {
    $processedCount = 0;
    while ($job = $queue->pop(timeoutSeconds: 5)) {
        try {
            $processor->handle($job);
            $queue->ack($job);
        } finally {
            unset($job);
            if (++$processedCount % 100 === 0) {
                gc_collect_cycles();
            }
            if (memory_get_usage(true) >= 128 * 1024 * 1024) {
                break; // Graceful exit for supervisor restart before OOM killer intervenes
            }
        }
    }
}
```

---

## 4. OPcache & JIT Memory Geometry

Production containers MUST bake immutable source code into the image with `opcache.validate_timestamps = 0`, `opcache.interned_strings_buffer = 32`, `opcache.max_accelerated_files = 32531`, and `opcache.jit_buffer_size = 64M` (`opcache.jit = 1255` for CPU-intensive workloads).


---
desc: PHP PDO Prepared Statements, Explicit Transactions & Security Baseline
rules: [R_PHP, R_DB]
---
# 🔒 PHP Database Transactions & Persistence Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Native Prepared Statements** | `PDO::ATTR_EMULATE_PREPARES => false` (`100%` of connections) | PDO connection factory baseline |
| **Error Mode & Fetch Mode** | `ATTR_ERRMODE => ERRMODE_EXCEPTION`, `DEFAULT_FETCH_MODE => FETCH_ASSOC` | PDO connection factory baseline |
| **Deadlock Retry Policy** | Max `3` attempts with `25ms – 150ms` exponential backoff + random jitter | SQLSTATE `40001` / MySQL `1213` interceptor |
| **Transaction Window Duration** | `< 200 ms` (`0` cURL/HTTP/SMTP calls inside open transaction) | APM slow transaction trace gate |
| **N+1 Query Loop Tolerance** | `0` SQL queries inside `foreach` / `while` loops | Batch `IN (?, ?, ...)` hydration (`<= 500` IDs/chunk) |

---

## 2. PDO Hardening, Pessimistic Locking (`FOR UPDATE`) & Deadlock Retry

Configure PDO with `ATTR_EMULATE_PREPARES => false` for native parameterized execution plans. When mutating balances or stock, acquire row locks via `SELECT ... FOR UPDATE` in deterministic primary-key order and wrap the transaction in a bounded retry loop for SQLSTATE `40001` / MySQL `1213`.

```php
<?php
declare(strict_types=1);

// ❌ BAD: String interpolation (SQLi), race condition on balance, no rollback guard
public function transferFundsBad(PDO $db, int $fromId, int $toId, int $amountCents): void {
    $row = $db->query("SELECT balance_cents FROM wallets WHERE id = $fromId")->fetch();
    if ($row['balance_cents'] < $amountCents) {
        throw new RuntimeException('Insufficient funds');
    }
    $db->exec("UPDATE wallets SET balance_cents = balance_cents - $amountCents WHERE id = $fromId");
    $db->exec("UPDATE wallets SET balance_cents = balance_cents + $amountCents WHERE id = $toId");
}

// ✅ GOOD: Ascending lock order, SELECT ... FOR UPDATE, bounded deadlock retry with jitter
public function transferFundsGood(PDO $db, int $fromId, int $toId, int $amountCents): void {
    [$firstId, $secondId] = [min($fromId, $toId), max($fromId, $toId)];

    for ($attempt = 1; $attempt <= 3; $attempt++) {
        $db->beginTransaction();
        try {
            $stmt = $db->prepare('SELECT id, balance_cents FROM wallets WHERE id IN (?, ?) ORDER BY id ASC FOR UPDATE');
            $stmt->execute([$firstId, $secondId]);
            $wallets = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'balance_cents', 'id');

            if (($wallets[$fromId] ?? 0) < $amountCents) {
                throw new DomainException("Insufficient balance for wallet {$fromId}");
            }

            $upd = $db->prepare('UPDATE wallets SET balance_cents = balance_cents + :delta WHERE id = :id');
            $upd->execute(['delta' => -$amountCents, 'id' => $fromId]);
            $upd->execute(['delta' => $amountCents, 'id' => $toId]);

            $db->commit();
            return;
        } catch (PDOException $e) {
            if ($db->inTransaction()) $db->rollBack();
            $isDeadlock = ($e->getCode() === '40001' || ($e->errorInfo[1] ?? 0) === 1213);
            if (!$isDeadlock || $attempt === 3) throw $e;
            usleep((1 << $attempt) * 20_000 + random_int(1_000, 15_000));
        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            throw $e;
        }
    }
}
```

---

## 3. Eliminating N+1 Query Loops via Batch `IN (?)` Hydration

Never execute `SELECT` inside `foreach`. Collect unique foreign keys via `array_unique(array_column(...))`, guard against empty arrays, and hydrate children in a single batch `IN (?, ...)` query.

```php
// ❌ BAD: N+1 query anti-pattern (500 orders = 501 round-trips)
foreach ($orders as &$order) {
    $stmt = $db->prepare('SELECT * FROM order_items WHERE order_id = ?');
    $stmt->execute([$order['id']]);
    $order['items'] = $stmt->fetchAll();
}

// ✅ GOOD: O(1) batch IN (?, ?, ...) query with in-memory dictionary grouping
$orderIds = array_values(array_unique(array_column($orders, 'id')));
if ($orderIds !== []) {
    $in = implode(',', array_fill(0, count($orderIds), '?'));
    $stmt = $db->prepare("SELECT * FROM order_items WHERE order_id IN ({$in})");
    $stmt->execute($orderIds);

    $grouped = [];
    while ($item = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $grouped[$item['order_id']][] = $item;
    }
    foreach ($orders as &$order) {
        $order['items'] = $grouped[$order['id']] ?? [];
    }
    unset($order);
}
```

---
desc: PHP 8.2+ Enterprise Standards — Modern OOP, Memory Generators & API Security
rules: [R_PHP, R_DB, R_CORE]
---
# 🐘 PHP 8.2+ Enterprise Standards

## 1. Modern Syntax & Strict Typing
- **Mandatory Strict Types:** `declare(strict_types=1);` as the 1st line of every `.php` file.
- **PHP 8.2+ Features:** Use Constructor Property Promotion, `readonly` classes/properties, `match` expressions, and Backed Enums:
  ```php
  enum OrderStatus: string {
      case Pending = 'PENDING';
      case Completed = 'COMPLETED';
  }

  public readonly class OrderService {
      public function __construct(private PDO $db) {}
  }
  ```

## 2. Memory Optimization (Generators)
- **Zero Memory Bloat:** Use `yield` generators for large batch exports or stream processing to cap memory < 32MB:
  ```php
  function streamRows(PDOStatement $stmt): Generator {
      while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
          yield $row;
      }
  }
  ```

## 3. Database Transactions & PDO Security
- **Prepared Statements ONLY:** Never concatenate variables into SQL strings.
- **Transaction Scoping:** Explicitly wrap all mutation logic:
  ```php
  $this->db->beginTransaction();
  try {
      // mutations
      $this->db->commit();
  } catch (Throwable $e) {
      $this->db->rollBack();
      throw $e;
  }
  ```

## 4. Architecture & Security Baseline
- **Layer Separation:** Thin Controllers &rarr; Feature Services with Constructor Dependency Injection.
- **Security:** Use `PASSWORD_ARGON2ID` for hashing, mandatory CSRF validation on mutations, and unified JSON error output.


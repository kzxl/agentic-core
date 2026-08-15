---
desc: PHP PDO Prepared Statements, Explicit Transactions & Security Baseline
rules: [R_PHP, R_DB]
---
# 🔒 PHP Database Transactions & Security

## 1. Transactions & Prepared Statements
- Prepared Statements ONLY (Never concatenate variables into SQL strings).
- Explicit Transaction Scoping:
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

## 2. Security Baseline
- Use `PASSWORD_ARGON2ID` for hashing.
- Mandatory CSRF verification on all mutation endpoints.

---
desc: PHP Yield Generators for Large Dataset Batch Processing and Exports
rules: [R_PHP, R_CORE]
---
# ⚡ PHP Memory Optimization (Generators)

## 1. Zero Memory Bloat with Yield
- Use `yield` generators for large batch exports to cap memory < 32MB:
  ```php
  function streamRows(PDOStatement $stmt): Generator {
      while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
          yield $row;
      }
  }
  ```

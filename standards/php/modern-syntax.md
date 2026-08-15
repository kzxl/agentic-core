---
desc: PHP 8.2+ Modern Syntax, Readonly Classes, Constructor Promotion & Enums
rules: [R_PHP]
---
# 🐘 PHP 8.2+ Modern Syntax Standards

## 1. Strict Typing & Classes
- Mandatory `declare(strict_types=1);` as 1st line of every file.
- Use Constructor Property Promotion, `readonly` classes, `match`, and Backed Enums:
  ```php
  enum OrderStatus: string {
      case Pending = 'PENDING';
      case Completed = 'COMPLETED';
  }

  public readonly class OrderService {
      public function __construct(private PDO $db) {}
  }
  ```

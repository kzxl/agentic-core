---
desc: PHP 8+ Modern Standards (LiteORM / API)
rules: [R_PHP, R_DB]
---
# 🐘 PHP 8+ Modern Standards

## 1. Core Language Rules
- **Mandatory Strict Types:** `declare(strict_types=1);` as the first line of every `.php` file.
- **PSR-4 Autoloading:** Strict namespace-to-directory mapping.

## 2. Database & Data Access
- **Parameterized Queries:** Always use PDO `prepare()` and `execute()`.
- **Query Optimization:** Utilize `AsNoTracking` on read-only queries to minimize memory footprint.

## 3. Architecture & Security
- **Layer Separation:** Thin Controllers &rarr; Feature Services with Constructor Dependency Injection.
- **Error Boundaries:** Never expose raw stack traces. Return structured JSON: `{"status": "error", "message": "..."}`.

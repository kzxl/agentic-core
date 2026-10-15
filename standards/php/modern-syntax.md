---
desc: PHP 8.2+ Modern Syntax, Readonly Classes, Constructor Promotion & Enums
rules: [R_PHP]
---
# 🐘 PHP 8.2+ Modern Syntax & Type System Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Strict Type Enforcement** | `declare(strict_types=1);` in `100%` of `.php` files | PHP-CS-Fixer `declare_strict_types` & PHPStan |
| **Static Analysis Level** | PHPStan Level `8` (`0` untyped `mixed` parameters or returns) | `vendor/bin/phpstan analyse --level=8` |
| **Dynamic Properties** | `0` dynamic properties (`Deprecated` in PHP 8.2, fatal in 9.0) | `final readonly class` by default |
| **Loose Comparisons (`==`, `!=`)** | `0` instances; strictly use `===`, `!==`, and `in_array(..., true)` | PHPStan `strictRules` |
| **Coding & Autoloading Standard** | `100%` PSR-4 namespace mapping & PSR-12 / PER-CS2.0 formatting | `phpcs --standard=PSR12` |

---

## 2. `readonly class`, Constructor Property Promotion & Immutable Value Objects

Every Service, Command, Event, and DTO MUST be declared `final readonly class` unless explicit inheritance is required by an interface contract. Replace associative arrays (`array<string, mixed>`) with self-validating, immutable **Value Objects** using Constructor Property Promotion.

```php
<?php
declare(strict_types=1);

namespace App\Domain\Billing;

use InvalidArgumentException;

// ❌ BAD: Untyped associative array DTO, loose == checks, mutable public properties
class InvoiceBad {
    public $amount;
    public $currency;
    public $status;

    public function __construct(array $data) {
        if ($data['amount'] == 0) { // Loose comparison: "0" or false or null passes/fails unexpectedly!
            throw new InvalidArgumentException('Invalid amount');
        }
        $this->amount = $data['amount'];
        $this->currency = $data['currency'] ?? 'USD';
        $this->status = 'pending'; // Magic string state!
    }
}

// ✅ GOOD: Immutable Value Object with constructor property promotion and domain invariant guards
final readonly class Money {
    public function __construct(
        public int $amountMinorUnits,
        public CurrencyCode $currency,
    ) {
        if ($this->amountMinorUnits < 0) {
            throw new InvalidArgumentException("Monetary amount cannot be negative: {$this->amountMinorUnits}");
        }
    }

    public function add(self $other): self {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException('Cannot add Money across different currencies');
        }
        return new self($this->amountMinorUnits + $other->amountMinorUnits, $this->currency);
    }
}
```

---

## 3. Backed Domain Enums & Exhaustive `match` Expressions

Never represent finite domain states, roles, or event types as raw strings or class constants. Use **Backed Enums** (`enum Status: string`) coupled with exhaustive `match` expressions. Unlike `switch` (which performs loose `==` coercion and falls through silently on missing `break`), `match` performs strict `===` identity comparison and throws `UnhandledMatchError` if any enum case is omitted.

```php
<?php
declare(strict_types=1);

namespace App\Domain\Order;

enum CurrencyCode: string {
    case USD = 'USD';
    case EUR = 'EUR';
    case VND = 'VND';
}

enum OrderStatus: string {
    case Pending   = 'PENDING';
    case Paid      = 'PAID';
    case Shipped   = 'SHIPPED';
    case Cancelled = 'CANCELLED';

    public function canTransitionTo(self $next): bool {
        return match ($this) {
            self::Pending   => in_array($next, [self::Paid, self::Cancelled], strict: true),
            self::Paid      => in_array($next, [self::Shipped, self::Cancelled], strict: true),
            self::Shipped,
            self::Cancelled => false,
        };
    }

    public function slaHours(): int {
        return match ($this) {
            self::Pending   => 24,
            self::Paid      => 48,
            self::Shipped   => 120,
            self::Cancelled => 0,
        };
    }
}
```

---

## 4. Intersection Types, Named Arguments & Null-Safe Pipelines

- **Named Arguments:** Use named arguments (`setcookie(name: 'sid', value: $token, httponly: true, secure: true)`) for boolean flags and functions with more than `3` parameters to eliminate positional transposition bugs.
- **Null-Safe Operator (`?->`):** Replace deeply nested `if ($a !== null && $a->getB() !== null)` checks with null-safe chains (`$country = $order->getCustomer()?->getAddress()?->countryCode ?? 'US';`).


---
name: AgenticTestDrivenDevelopment
description: Test-driven development protocol for behaviour-level tests at agreed seams. Use when building a feature or fixing a bug test-first, when the user mentions TDD, red-green, unit or integration tests, mocking, or test seams, or when reviewing whether existing tests are worth keeping.
desc: Red-before-green TDD in vertical slices, tests through public interfaces at user-confirmed seams, mocks only at system boundaries.
rules: [R_TDD, R_CORE]
category: Agentic
---
# Agentic Test-Driven Development (TDD) Protocol

**Goal:** Produce tests that verify behaviour through public interfaces, read like specifications, and survive internal refactors. The loop is red then green, one vertical slice at a time.

Incorporates practices adapted from mattpocock/skills (MIT).

---

## 1. What a Good Test Is

| Property | Target | Threshold |
| :--- | :--- | :--- |
| **Behavioural** | Exercises the public interface only; the name states WHAT (`Checkout_WithValidCart_IsConfirmed`), not HOW | Survives any refactor that keeps behaviour |
| **Independent oracle** | Expected values are known-good literals, worked examples, or spec values | One logical assertion per test |
| **Boundary-aware** | Parameterised across partition edges: `min - 1`, `min`, nominal, `max`, `max + 1`, empty / `null` | $\ge 5$ boundary points per domain rule |
| **Deterministic** | Time via injected `TimeProvider` / clock function, randomness via seed | $0$ direct `DateTime.Now` / `Date.now()` / `Random.Shared` in domain logic |
| **Fast** | I/O behind in-memory adapters at boundaries | $\le 50\text{ ms}$ per unit test |

Typical boundary sets: collections (0, 1, exact batch size 500, overflow 501); money (`-0.01`, `0.00`, `99.99`, `100.00`, midpoint `2.005` to `2.00` under `ToEven`); time (leap day `2024-02-29`, UTC midnight rollover, exact expiry vs one second after).

## 2. Seams: Where Tests Go

A **seam** is the public boundary where behaviour is observed without reaching inside. Read [`skills/codebase-design/SKILL.md`](../codebase-design/SKILL.md) for the shared vocabulary (module, interface, depth, seam, adapter) when the shape of the interface itself is in question.

**Test only at pre-agreed seams.** Before writing the first test, list the seams under test with a one-line note on what each catches and misses, and confirm the list with the user:

| Seam | Catches | Misses |
| :--- | :--- | :--- |
| `IReservationService.ReserveAsync` (in-memory repository) | Allocation rules, partial-stock rejection, idempotency | SQL lock ordering, real transaction rollback |
| `POST /api/v1/inventory/reserve` (test DB) | Contract shape, auth, transaction rollback | UI double-submit handling |

**Done when** the user has confirmed the seam list. No test is written at an unconfirmed seam.

## 3. Rules of the Loop

1. **Red before green.** Write one failing test, run it, and observe the expected assertion failure (not a compile error or an unrelated exception).
2. **Green with the minimum.** Write only enough production code to pass that test. Features for imagined future tests are Speculative Generality.
3. **One vertical slice per cycle.** One seam, one test, one minimal implementation, then repeat. Each test is a **tracer bullet** that responds to what the previous cycle taught you.
4. **Suite proof.** At the end of each slice, the full suite (`dotnet test` / `node --test` / `pytest`) exits `0`.
5. **Refactoring belongs to review.** Clean-up happens after the slices are green, during review ([`adversarial-code-review.md`](adversarial-code-review.md)), not inside the red-green loop.

**Done when** (per cycle) the new test was observed red with the expected message, then green, and the full suite exits `0`.

## 4. Anti-Patterns and Their Targets

| Anti-pattern | Tell | Target |
| :--- | :--- | :--- |
| **Implementation-coupled** | Mocks internal collaborators, tests private methods, asserts call counts/order, or verifies through a side channel (querying the DB instead of the interface). Breaks on refactor with unchanged behaviour. | Assert returned values and state observable through the interface (`createUser` then `getUser`). |
| **Tautological** | Expected value is recomputed the way the code computes it, a constant is asserted equal to itself, or the test only checks that a mock returns what it was set up to return. | Independent literal expected values from the spec or a worked example; the real SUT is instantiated. |
| **Horizontal slicing** | All tests written first, then all implementation. Tests verify imagined shape and go insensitive to real changes. | Vertical slices: one test, one implementation, repeat. |

## 5. Mocking: System Boundaries Only

Mock or fake only at **system boundaries**: external APIs (payment, email, ERP), time, randomness, and sometimes the database or filesystem (prefer a test DB or temp dir). Your own classes, modules, and internal collaborators run for real.

- **Inject boundary dependencies** through constructors or parameters rather than creating them internally.
- **Prefer SDK-style interfaces over generic fetchers**, so each fake returns one shape and setup has no conditional logic:

```csharp
// GOOD: one method per external operation; each fake returns one shape
public interface IErpClient
{
    Task<Customer> GetCustomerAsync(int customerId, CancellationToken ct);
    Task<OrderId> CreateOrderAsync(OrderDraft draft, CancellationToken ct);
}

// BAD: generic fetcher forces endpoint-switching logic into every fake
public interface IErpGateway
{
    Task<string> SendAsync(string endpoint, string method, string? body, CancellationToken ct);
}
```

An interface earns its place with at least two adapters (production + in-memory test fake), per `AS-C4`.

## 6. Examples

### C# (xUnit): tautological mock vs real SUT with independent literals

```csharp
// BAD: the production class is never instantiated; the test verifies the mock framework
[Fact]
public void ApplyDiscount_CallsService_Bad()
{
    var mockCalc = new Mock<IDiscountCalculator>();
    mockCalc.Setup(x => x.Compute(100m)).Returns(90m);
    Assert.Equal(90m, mockCalc.Object.Compute(100m));
}

// GOOD: real SUT, injected FakeTimeProvider, boundary values, literal expectations
public sealed class PromotionalPricingEngineTests
{
    [Theory]
    [InlineData("2026-10-15T11:59:59Z", 100.00, 85.00)]  // 1s before expiry -> active
    [InlineData("2026-10-15T12:00:00Z", 100.00, 85.00)]  // exact boundary   -> active
    [InlineData("2026-10-15T12:00:01Z", 100.00, 100.00)] // 1s after expiry  -> expired
    [InlineData("2026-10-15T10:00:00Z", 0.00,   0.00)]   // zero boundary
    public void CalculateNetPrice_EnforcesExpiryBoundary(string nowUtc, double listPrice, double expectedNet)
    {
        var sut = new PromotionalPricingEngine(new FakeTimeProvider(DateTimeOffset.Parse(nowUtc)));

        decimal actual = sut.CalculateNetPrice((decimal)listPrice, DateTimeOffset.Parse("2026-10-15T12:00:00Z"));

        Assert.Equal((decimal)expectedNet, actual);
    }
}
```

### C# (NUnit): behaviour through the interface, not the database

```csharp
[TestCase(10, 5, 15)]
[TestCase(0, 0, 0)]
public async Task Reserve_ThenQuery_ReturnsReservedQuantity(int first, int second, int expectedTotal)
{
    var service = new ReservationService(new InMemoryReservationRepository());

    await service.ReserveAsync(materialId: 7, quantity: first, CancellationToken.None);
    await service.ReserveAsync(materialId: 7, quantity: second, CancellationToken.None);

    Assert.That(await service.GetReservedAsync(7, CancellationToken.None), Is.EqualTo(expectedTotal));
}
```

### JavaScript (`node:test`): tautological vs independent literal

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateTotal } = require('../src/cart');

// BAD: expected value recomputed the way the code computes it
test('calculateTotal sums line items (tautological)', () => {
  const items = [{ price: 10 }, { price: 5 }];
  assert.equal(calculateTotal(items), items.reduce((sum, i) => sum + i.price, 0));
});

// GOOD: independent, known literal
test('calculateTotal sums line items', () => {
  assert.equal(calculateTotal([{ price: 10 }, { price: 5 }]), 15);
});
```

---
name: AgenticTestDrivenDevelopment
desc: Rigorous Test-Driven Development (TDD) protocol for autonomous AI coding agents
rules: [R_TDD, R_CORE]
category: Agentic
---
# 🧪 Agentic Test-Driven Development (TDD) Protocol

**Goal:** Enforce a strict Red-Green-Refactor cycle with Boundary Value Analysis (BVA), deterministic clock/I/O seams, and zero tautological mock assertions to guarantee 100% behavioral correctness.

---

## 1. Quantitative TDD Invariants & Quality Thresholds
| Metric / Constraint | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Red-Before-Green Verification** | $100\%$ of new tests observed failing first | Run test runner to confirm expected assertion failure before coding |
| **Boundary Value Coverage (BVA)** | $\ge 5$ boundary points per domain rule | Test `min - 1`, `min`, `nominal`, `max`, `max + 1`, and empty/`null` |
| **Clock & Randomness Determinism** | $0$ direct calls to `DateTime.Now` / `Random.Shared` | Inject `TimeProvider` (.NET 8+) or deterministic seed clock |
| **Tautological Mock Tests** | $0$ tests asserting only that a mock called itself | Assert real domain output state, returned value, or in-memory DB delta |
| **Single-Test Execution Latency** | $\le 50\text{ ms}$ per unit test | Isolate network/disk via fast in-memory fakes at I/O boundaries |

---

## 2. The 4-Step Autonomous TDD Cycle

```text
[1. RED: Author Failing Test] ──► Encode requirement & BVA edge cases; run test runner to prove failure
                                       │
[2. GREEN: Minimal Pass Code] ──► Write the simplest production logic that satisfies the test assertions
                                       │
[3. REFACTOR: Clean & Optimize]──► Eliminate duplication and enforce SOLID invariants while keeping tests green
                                       │
[4. SUITE PROOF: Zero Regression]──► Execute full test suite (`dotnet test` / `pytest` / `vitest`) with exit code 0
```

### Step 1: Boundary Value Analysis (BVA) Test Matrix
Never write a single happy-path assertion. Parameterize tests (`[Theory]` / `[InlineData]` or `pytest.mark.parametrize`) across exact partition boundaries:
- **Collections:** Empty (`0` items), single item (`1`), exact batch size (`500`), batch overflow (`501`).
- **Financial / Numeric:** Negative (`-0.01`), zero (`0.00`), threshold boundary (`99.99`, `100.00`), midpoint rounding (`2.005` $\to$ `2.00` under `ToEven`).
- **Temporal:** Leap day (`2024-02-29`), UTC midnight rollover, expired vs exact-expiry timestamp.

### Step 2: Deterministic Clock & I/O Seam Injection
Flaky tests stem from hardcoding wall-clock time (`DateTime.UtcNow`, `Date.now()`) inside domain logic. Inject `TimeProvider` or a clock functor so expiration and retry windows can be tested deterministically at microsecond speed.

---

## 3. Code Comparison: Tautological Mock Test vs Deterministic Domain Test

```csharp
// ❌ BAD: Tautological mock test + hardcoded wall-clock dependency (tests the mock framework, not production code!)
[Fact]
public async Task ApplyDiscount_CallsService_Bad()
{
    var mockCalc = new Mock<IDiscountCalculator>();
    mockCalc.Setup(x => x.Compute(100m)).Returns(90m);
    var result = mockCalc.Object.Compute(100m);
    Assert.Equal(90m, result); // Tautology! Production class was never even instantiated!
}

// ✅ GOOD: Real domain SUT + injected FakeTimeProvider + Boundary Value Analysis ([Theory])
public sealed class PromotionalPricingEngine
{
    private readonly TimeProvider _timeProvider;
    public PromotionalPricingEngine(TimeProvider timeProvider) => _timeProvider = timeProvider;

    public decimal CalculateNetPrice(decimal listPrice, DateTimeOffset promoExpiresAtUtc)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(listPrice);
        bool isPromoActive = _timeProvider.GetUtcNow() <= promoExpiresAtUtc;
        return isPromoActive ? Math.Round(listPrice * 0.85m, 2, MidpointRounding.ToEven) : listPrice;
    }
}

public sealed class PromotionalPricingEngineTests
{
    [Theory]
    [InlineData("2026-10-15T11:59:59Z", 100.00, 85.00)] // 1s before expiry -> active
    [InlineData("2026-10-15T12:00:00Z", 100.00, 85.00)] // Exact boundary   -> active
    [InlineData("2026-10-15T12:00:01Z", 100.00, 100.00)] // 1s after expiry  -> expired
    [InlineData("2026-10-15T10:00:00Z", 0.00,   0.00)]   // Zero boundary
    public void CalculateNetPrice_EnforcesExpiryBoundaryDeterministically(
        string currentUtcIso, double rawPrice, double expectedNet)
    {
        var fakeClock = new FakeTimeProvider(DateTimeOffset.Parse(currentUtcIso));
        var sut = new PromotionalPricingEngine(fakeClock);
        var expiry = DateTimeOffset.Parse("2026-10-15T12:00:00Z");

        decimal actual = sut.CalculateNetPrice((decimal)rawPrice, expiry);

        Assert.Equal((decimal)expectedNet, actual);
    }
}
```


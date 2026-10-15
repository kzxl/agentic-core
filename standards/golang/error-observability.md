---
desc: Golang Error Wrapping & Structured Slog Observability
rules: [R_GO, R_CORE]
---
# 📊 Golang Error & Observability Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Discarded Errors (`_ = fn()`)** | `0` instances (except explicit `defer` cleanup where logged) | `errcheck` and `govet` CI linters |
| **Runtime `panic()` in Handlers/Libs** | `0` instances outside process `main()` bootstrap | `recover()` middleware at HTTP/gRPC/Worker boundaries |
| **Log Allocation Overhead** | `0` heap allocs for disabled levels; `<= 1` alloc via `slog.Attr` | `slog.Logger.LogAttrs(ctx, level, msg, ...)` |
| **Log-vs-Return Duplication** | Handle **once**: either wrap & return OR log at top boundary | Code review & trace error correlation |
| **Trace Context Propagation** | `100%` of logs & downstream calls carry `trace_id` & `span_id` | Custom `slog.Handler` extracting `otel/trace.SpanFromContext(ctx)` |

---

## 2. Sentinel Error Taxonomy & Structured Wrapping (`%w`, `errors.Is`, `errors.As`)

- **Domain Sentinels & Typed Errors:** Define package-level sentinels (`var ErrNotFound = errors.New(...)`) for control-flow branches and typed structs (`type DomainError struct`) for rich diagnostics.
- **Wrap vs. Opaque Boundary:** Use `%w` (`fmt.Errorf("op %s: %w", id, err)`) to preserve `errors.Is` / `errors.As` chains. Map internal driver errors (`sql.ErrNoRows`) to domain sentinels at repository boundaries. Never match error strings (`strings.Contains`).

```go
// ❌ BAD: String matching, raw driver error leakage, and duplicate log-and-return
func (s *OrderService) GetOrderBad(ctx context.Context, id string) (*Order, error) {
	ord, err := s.repo.FindByID(ctx, id)
	if err != nil {
		slog.Error("db error: " + err.Error()) // Double logging & string concat allocation
		if err == sql.ErrNoRows || strings.Contains(err.Error(), "not found") {
			return nil, fmt.Errorf("not found: %v", err) // %v strips unwrap chain!
		}
		panic(err) // FATAL: crashes process on transient DB timeout
	}
	return ord, nil
}

// ✅ GOOD: Domain sentinel mapping, %w wrapping, errors.Is/As inspection, zero panic
var ErrOrderNotFound = errors.New("order not found")

type DomainError struct {
	Code, Op string
	Wrapped  error
}

func (e *DomainError) Error() string { return fmt.Sprintf("%s [%s]: %v", e.Op, e.Code, e.Wrapped) }
func (e *DomainError) Unwrap() error { return e.Wrapped }

func (s *OrderService) GetOrderGood(ctx context.Context, id string) (*Order, error) {
	ord, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("get order %s: %w", id, ErrOrderNotFound)
		}
		return nil, &DomainError{Code: "DB_READ_ERR", Op: "OrderService.GetOrder", Wrapped: err}
	}
	return ord, nil
}
```

---

## 3. OpenTelemetry Span Propagation & Zero-Allocation `log/slog`

Standard `slog.Info(msg, "k", v)` boxes primitives into `any`, allocating on the heap. Services (`> 5,000 RPS`) MUST use `slog.LogAttrs` with typed `slog.String` / `slog.Int64` / `slog.Duration` attributes and pass `ctx` so the `slog.Handler` injects OpenTelemetry `trace_id` and `span_id`.

```go
// ❌ BAD: Untyped key-value pairs box primitives onto heap; missing context loses trace_id
func CheckoutHandlerBad(ctx context.Context, cartID string, totalCents int64) error {
	slog.Info(fmt.Sprintf("starting checkout %s", cartID), "total", totalCents)
	if err := chargeCard(ctx, cartID, totalCents); err != nil {
		slog.Error("checkout failed", "err", err)
		return err
	}
	return nil
}

// ✅ GOOD: OpenTelemetry span lifecycle + zero-allocation slog.LogAttrs with context propagation
func CheckoutHandlerGood(ctx context.Context, tracer trace.Tracer, logger *slog.Logger, cartID string, totalCents int64) (err error) {
	ctx, span := tracer.Start(ctx, "CheckoutHandler", trace.WithAttributes(
		attribute.String("cart.id", cartID),
		attribute.Int64("cart.total_cents", totalCents),
	))
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, err.Error())
		}
		span.End()
	}()

	start := time.Now()
	if err = chargeCard(ctx, cartID, totalCents); err != nil {
		return fmt.Errorf("charge card for cart %s: %w", cartID, err)
	}

	logger.LogAttrs(ctx, slog.LevelInfo, "checkout completed",
		slog.String("cart_id", cartID),
		slog.Int64("total_cents", totalCents),
		slog.Duration("duration", time.Since(start)),
	)
	return nil
}
```

---

## 4. Boundary Panic Recovery & Sensitive Data Redaction

- **Panic Boundary Guard:** Recover panics only at top-level HTTP/gRPC/Worker middleware (`debug.Stack()` + `500` response).
- **PII Redaction:** Implement `slog.LogValuer` (`LogValue() slog.Value`) on structs holding secrets/PII to mask values as `"[REDACTED]"`.

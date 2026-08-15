---
desc: Golang Enterprise Standards — High-Performance Concurrency, Memory & Microservices
rules: [R_GO, R_RES, R_CORE]
---
# 🔵 Golang Enterprise Standards

## 1. Concurrency & Goroutine Leak Defense
- **Mandatory Context:** Pass `ctx context.Context` as the 1st parameter to all I/O, DB, HTTP, and background tasks.
- **Leak Defense:** Every goroutine MUST listen to cancellation:
  ```go
  go func() {
      select {
      case <-ctx.Done():
          return
      case result := <-ch:
          process(result)
      }
  }()
  ```
- **GoFlow / Worker Pools:** Use `errgroup.WithContext(ctx)` or typed worker pools (`PoolWithFunc`) for bounded concurrency.

## 2. Channel Ownership & Mutex Safety
- **Ownership Rule:** The goroutine that writes/sends to a channel OWNS it and is solely responsible for calling `close(ch)`.
- **Mutex Lock Invariant:** Always `mu.Lock(); defer mu.Unlock()` immediately on the next line. Never leave unlocked branches.

## 3. Zero-Allocation & Memory Optimization
- **Slice Pre-allocation:** Always pre-allocate capacity: `items := make([]Item, 0, expectedCount)`.
- **String Building:** Use `strings.Builder` or `bytes.Buffer` for concatenation in loops (Never `+` in loops).
- **Buffer Recycling:** Recycle large byte slices and structs using `sync.Pool`.

## 4. Error Wrapping & Observability
- **Error Context:** Wrap errors explicitly: `fmt.Errorf("failed to execute %s: %w", op, err)`. NEVER ignore errors (`_`).
- **Structured Logging:** Use standard `log/slog` with typed attributes: `slog.Info("processed order", "orderId", id, "durationMs", dur)`.


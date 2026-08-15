---
desc: Golang Concurrency, Context Propagation & Channel Ownership
rules: [R_GO, R_RES]
---
# 🔵 Golang Concurrency Standards

## 1. Context & Goroutine Leak Defense
- Mandatory `ctx context.Context` as 1st parameter to all I/O and background tasks.
- Every goroutine MUST listen to cancellation:
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
- Use `errgroup.WithContext(ctx)` or `PoolWithFunc` for bounded worker pools.

## 2. Channel Ownership & Mutex Safety
- **Ownership:** The goroutine that writes/sends to a channel OWNS it and MUST call `close(ch)`.
- **Mutex:** Always `mu.Lock(); defer mu.Unlock()` immediately on next line.

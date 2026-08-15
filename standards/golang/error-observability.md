---
desc: Golang Error Wrapping & Structured Slog Observability
rules: [R_GO, R_CORE]
---
# 📊 Golang Error & Observability Standards

## 1. Error Context Wrapping
- Wrap errors explicitly: `fmt.Errorf("failed to execute %s: %w", op, err)`.
- NEVER ignore returned errors (`_`).

## 2. Structured Logging
- Use standard `log/slog` with typed attributes:
  ```go
  slog.Info("processed order", "orderId", id, "durationMs", dur)
  ```

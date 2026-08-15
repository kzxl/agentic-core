---
desc: Golang Zero-Allocation, Pre-allocation & Sync.Pool Optimization
rules: [R_GO]
---
# ⚡ Golang Memory & Allocation Standards

## 1. Slice Pre-Allocation
- Always pre-allocate capacity for known sizes:
  ```go
  items := make([]Item, 0, expectedCount)
  ```

## 2. String Concatenation & Buffers
- Use `strings.Builder` or `bytes.Buffer` in loops (Never `+`).
- Recycle large byte slices and structs with `sync.Pool`.

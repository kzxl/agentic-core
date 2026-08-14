---
desc: Golang Standards & Best Practices (GoFlow / gRPC)
rules: [R_GO]
---
**Concurrency:**
- ALWAYS use explicit wait mechanics (`sync.WaitGroup` or `errgroup.Group`).
- Avoid naked goroutines `go func() {}` if their lifecycle isn't managed.
- Use `GoFlow` toolkit (PoolWithFunc, Future, ErrorGroup) for high-performance concurrent batches.

**Error Handling:**
- Explicit `if err != nil { return err }`.
- NEVER ignore errors (`_`).
- Wrap errors with context: `fmt.Errorf("failed to process: %w", err)`.

**Project Layout:**
- `cmd/`: Entry points (main.go).
- `pkg/` or `internal/`: Shared libraries.
- `api/` or `proto/`: gRPC contracts.

**Performance:**
- Re-use buffers/structs via `sync.Pool`.
- Use typed worker pools to reduce GC overhead.

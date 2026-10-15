---
desc: Golang Concurrency, Context Propagation & Channel Ownership
rules: [R_GO, R_RES]
---
# 🔵 Golang Concurrency Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Unbounded Goroutine Spawning** | `0` instances allowed | Use `errgroup.Group` with `SetLimit(N)` or bounded worker pools |
| **Max Worker Pool Concurrency** | CPU-bound: `runtime.GOMAXPROCS(0)`; I/O-bound: `<= 64` per node | Explicit semaphore or `errgroup.SetLimit` |
| **Channel Send/Recv Timeout** | `100%` bound to `ctx.Done()` | `select` block with `<-ctx.Done()` branch |
| **Mutex Critical Section Duration** | `< 50 µs` (`0` network/disk I/O inside lock) | `go test -race` & `pprof` mutex profile (`contentions/sec`) |
| **Goroutine Leak Tolerance** | `0` leaked goroutines on test teardown | `go.uber.org/goleak.VerifyNone(t)` in test suites |

- **Context-First Signature:** Every function performing I/O, locking, or spawning goroutines MUST accept `ctx context.Context` as its first parameter.
- **Lifecycle Ownership:** No goroutine may outlive its parent request context unless explicitly attached to an application-level supervisor with a dedicated shutdown `context.Context` and `sync.WaitGroup`.
- **Single-Writer Channel Closure:** Only the producer goroutine (or `sync.Once` coordinator for multi-producer fan-in) owns the channel write lifecycle and is permitted to invoke `close(ch)`. Receivers MUST NEVER close channels.

---

## 2. Structured Concurrency & Bounded Worker Pools (`errgroup.WithContext`)

Spawning raw `go func()` inside loops without backpressure causes memory exhaustion and scheduler thrashing under traffic spikes. Always bind concurrent fan-out tasks to `errgroup.WithContext(ctx)` with an explicit concurrency cap (`g.SetLimit`).

```go
// ❌ BAD: Unbounded goroutines, unbuffered channel leak on early return, no panic/error propagation
func ProcessOrdersBad(ctx context.Context, ids []string) error {
	ch := make(chan Order) // Unbuffered: remaining senders block forever if first error returns early!
	for _, id := range ids {
		go func(orderID string) {
			ord, _ := fetchOrder(ctx, orderID)
			ch <- ord // Leaks goroutine when caller exits loop early
		}(id)
	}
	for range ids {
		ord := <-ch
		if err := saveOrder(ord); err != nil {
			return err // Abandoning remaining len(ids)-1 goroutines blocked on ch <- ord
		}
	}
	return nil
}

// ✅ GOOD: Bounded errgroup.WithContext, automatic sibling cancellation on first error, zero leaks
func ProcessOrdersGood(ctx context.Context, ids []string) error {
	g, gCtx := errgroup.WithContext(ctx)
	g.SetLimit(16) // Hard cap at 16 concurrent I/O workers

	results := make([]Order, len(ids))
	for i, id := range ids {
		i, id := i, id
		g.Go(func() error {
			ord, err := fetchOrder(gCtx, id)
			if err != nil {
				return fmt.Errorf("fetch order %s: %w", id, err) // Cancels gCtx for all sibling workers
			}
			results[i] = ord // Lock-free indexed slot assignment
			return nil
		})
	}
	if err := g.Wait(); err != nil {
		return err
	}
	return batchSaveOrders(ctx, results)
}
```

---

## 3. Channel Closure Invariants & `context.AfterFunc` Cancellation

When bridging blocking APIs (`net.Conn`, CGo descriptors) that do not poll `ctx.Done()`, use Go 1.21+ `context.AfterFunc` to register zero-goroutine teardown callbacks instead of spawning watcher goroutines per operation.

```go
// ❌ BAD: Spawns extra watcher goroutine per call and risks panic("send on closed channel")
func StreamEventsBad(ctx context.Context, conn net.Conn, out chan<- Event) {
	go func() {
		<-ctx.Done()
		_ = conn.Close()
		close(out) // DATA RACE: concurrent with main loop sending to out!
	}()
	for {
		ev, err := readEvent(conn)
		if err != nil {
			return
		}
		out <- ev
	}
}

// ✅ GOOD: Zero-overhead context.AfterFunc preemption and single-owner defer close(out)
func StreamEventsGood(ctx context.Context, conn net.Conn) <-chan Event {
	out := make(chan Event, 32)
	go func() {
		defer close(out) // Producer exclusively owns channel closure
		stop := context.AfterFunc(ctx, func() { _ = conn.SetReadDeadline(time.Now()) })
		defer stop()

		for {
			ev, err := readEvent(conn)
			if err != nil {
				return
			}
			select {
			case out <- ev:
			case <-ctx.Done():
				return
			}
		}
	}()
	return out
}
```

---

## 4. Mutex Contention Profiling & Sharded Locking

- **Zero I/O Under Lock:** Never execute network calls, SQL queries, or disk flushes while holding `sync.Mutex` or `sync.RWMutex`.
- **Avoid `RWMutex` for Tiny Critical Sections:** Use `sync.RWMutex` only when read critical sections exceed `200 ns` and read-to-write ratio exceeds `10:1`.
- **Contention Profiling:** Enable `runtime.SetMutexProfileFraction(5)` and `runtime.SetBlockProfileRate(10000)`. Refactor any lock exceeding `10 ms/sec` contention in `pprof/mutex` into cache-line padded shards (`[64]shard`) or `atomic.Pointer[T]`.

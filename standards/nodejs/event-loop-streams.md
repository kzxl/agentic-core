---
desc: Node.js Event Loop Non-Blocking, Stream Pipelines & Worker Threads
rules: [R_NODE, R_CORE]
---
# ⚡ Node.js Event Loop & Stream Processing

## 1. Event Loop Safety
- **Zero Sync I/O in Requests:** NEVER call `fs.readFileSync` or CPU-heavy loops in the request lifecycle.
- **CPU Offloading:** Offload heavy computations (Crypto hashing, image transformations) to `worker_threads`.

## 2. Stream Large Payloads
- Use Node.js Streams (`stream.pipeline`) for files > 5MB to keep RSS memory footprint low:
  ```javascript
  import { pipeline } from 'node:stream/promises';
  await pipeline(readStream, transformStream, res);
  ```

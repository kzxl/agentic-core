---
desc: Literature Synthesis & Prior-Art Analysis Standard — Systematic Review, Taxonomy Matrix, Citation & Gap Formulation
rules: [R_RESEARCH, R_LICENSE, R_CORE]
---
# 📚 Literature Synthesis & Prior-Art Analysis Standard

## 1. Objective & Scope

When proposing new software architectures, algorithms, or protocols, AI coding agents must ground their designs in **existing literature and industry state-of-the-art (SOTA)**. Reinventing existing wheels without attribution or claiming novelty over well-known techniques is strictly prohibited.

---

## 2. The Systematic Literature Review (SLR) Protocol

Before authoring architectural specifications or algorithm proposals:

```mermaid
graph LR
    Search["1. Keyword Query Formulation"] --> Filter["2. Inclusion / Exclusion Filtering"]
    Filter --> Extract["3. Multi-Dimensional Taxonomy Extraction"]
    Extract --> Gap["4. Research Gap & Novelty Formulation"]
```

### 2.1 Search Query Formulation
* Search across both academic indexing sources (arXiv, IEEE Xplore, ACM DL) and sovereign open-source codebases (GitHub, Linux Kernel, Chromium, ST/NXP HALs).
* Combine domain keywords, technical mechanics, and constraint modifiers:
  * Example: `"lock-free SPSC" AND ("embedded" OR "bare-metal") AND ("memory barrier" OR "Cortex-M")`.

### 2.2 Inclusion & Exclusion Criteria
* **Inclusion:** Peer-reviewed papers, official vendor technical references, open-source repositories with permissive OSI licenses (MIT, Apache 2.0, BSD), benchmarked production systems.
* **Exclusion:** Unverified blog posts, forum opinions without source code, GPL/copyleft code for sovereign commercial projects (per `R_LICENSE`).

---

## 3. Multi-Dimensional Prior-Art Comparative Matrix

Every architectural proposal must construct a structured comparative taxonomy against at least 2 established baseline solutions:

| Evaluation Axis | Baseline A (e.g., PostgreSQL) | Baseline B (e.g., Qdrant / Milvus) | Proposed Architecture (e.g., AME) |
| :--- | :--- | :--- | :--- |
| **Storage Substrate** | Relational B-Tree / Heap | HNSW Vector Index on Disk | Single-File Binary `.ame` (mmap) |
| **Lookup Latency** | $1.5 – 5.0\text{ ms}$ (Socket roundtrip) | $2.0 – 8.0\text{ ms}$ (Network RPC) | $< 0.15\text{ ms}$ (In-process SIMD / Shared Memory) |
| **In-Place Metric Mutation** | Heavy write-locks, WAL flush | Index rebuild / tombstones | Atomic in-place 32-byte struct update ($O(1)$) |
| **Episodic Decay Support** | None (manual batch crons) | None (metadata filter only) | Native Ebbinghaus decay runtime curve |
| **Deployment Footprint** | Multi-process daemon ($>100\text{ MB}$) | Docker container ($>500\text{ MB}$) | Zero-dependency static binary / DLL ($<5\text{ MB}$) |

---

## 4. Citation & Attribution Standard

1. **Academic Attribution:** Cite author, year, title, and DOI/arXiv identifier:
   * *Example:* "Vaswani et al. (2017), *Attention Is All You Need*, NeurIPS, arXiv:1706.03762."
2. **Open-Source Architectural Provenance:** Document the source project, commit hash/tag, author/organization, and original license:
   * *Example:* "Derived from Linux Kernel SPSC ringbuffer pattern (`include/linux/kfifo.h`), licensed under GPL-2.0. Clean-room reimplemented in Rust with zero copy-pasting per `R_LLM_GOV`."
3. **Strict License Boundary (`R_LICENSE`):** Never transcribe copyleft/GPL code lines verbatim into sovereign codebases. Extract mathematical concepts and algorithmic logic only.

---

## 5. Explicit Research Gap Formulation

Every research paper, design spec, or ADR (Architectural Decision Record) must define the **Research Gap**:

$$\text{Research Gap} = \text{Target Problem Requirements} \setminus \bigcup (\text{Prior Art Capabilities})$$

The gap must answer three questions:
1. **What did prior work fail to solve?** (e.g., "Existing vector databases incur $2\text{ ms}$ latency overhead due to TCP/IPC socket serialization.")
2. **Why was it unsolved?** (e.g., "They were architected as multi-tenant client-server databases rather than an in-process cognitive substrate for single-agent runtimes.")
3. **What is our novel trade-off?** (e.g., "We trade distributed clustering capability for sub-millisecond local mmap access and SIMD-accelerated 1-bit Hamming filtering.")

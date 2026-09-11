---
desc: Research Memory Schema Architecture — 8-Entity Cognitive Graph, Negative Knowledge Storage & Dual-Substrate Persistence
rules: [R_RES_MEM, R_RESEARCH, R_ENG_OS, R_CORE]
---
# 🏛️ Research Memory Schema Architecture

## 1. Architectural Vision: Beyond Ephemeral Chat History

Current AI coding agents operate predominantly over **ephemeral, linear chat histories**:

$$\text{Session} = [\text{User Message}_1 \longrightarrow \text{Assistant Reply}_1 \longrightarrow \text{User Message}_2 \longrightarrow \dots]$$

This conversational model has three catastrophic flaws in deep software engineering:
1. **Semantic Amnesia:** As conversations exceed 30–50 turns, context windows compact or truncate earlier reasoning steps. Critical breakthroughs, disproven hypotheses, and negative findings vanish.
2. **Lack of Invariant Structure:** Chat history stores text tokens, not **causal entities**. The LLM must continuously re-parse and re-infer what was an assumption, what was an empirical measurement, and what was a verified truth.
3. **The Repetition Failure Mode:** The agent cannot differentiate between an untried solution and an approach that failed 4 sessions ago. Humans succeed because they maintain an explicit **Negative Knowledge Cache**: *"We tried this already; it didn't work because of X. Do not repeat."*

The **Research Memory Schema Architecture** replaces transient text with a structured, persistent **8-Entity Cognitive Research Knowledge Graph**.

---

## 2. The 8-Entity Cognitive Graph

```text
                        ┌─────────────────────────────────────────────────────────┐
                        │                   RESEARCH KNOWLEDGE                    │
                        │       Structured Empirical & Negative Memory Graph       │
                        └────────────────────────────┬────────────────────────────┘
                                                     │
      ┌────────────────────┬─────────────────────────┼─────────────────────────┬────────────────────┐
      ▼                    ▼                         ▼                         ▼                    ▼
┌──────────────┐     ┌──────────────┐          ┌──────────────┐          ┌──────────────┐     ┌──────────────┐
│  HYPOTHESIS  │     │   EVIDENCE   │          │  EXPERIMENT  │          │    RESULT    │     │ FAILED APPR. │
│ Causal Claim │     │ Profiler/Logs│          │ Config/Vars  │          │ Metrics & p% │     │ "Tried this, │
│   & Status   │     │  & Telemetry │          │ & Hardware   │          │ Distributions│     │ do NOT do!"  │
└──────────────┘     └──────────────┘          └──────────────┘          └──────────────┘     └──────────────┘
      ▲                                              ▲                         ▲                    ▲
      │                                              │                         │                    │
      └────────────────────┬─────────────────────────┴─────────────────────────┴────────────────────┘
                           │
      ┌────────────────────┴─────────────────────────┬──────────────────────────────────────────────┐
      ▼                                              ▼                                              ▼
┌──────────────┐                               ┌──────────────┐                               ┌──────────────┐
│  ASSUMPTION  │                               │CONTRADICTION │                               │   DECISION   │
│  Unverified  │                               │  Divergent   │                               │Manager Gate: │
│ Precondition │                               │ Observations │                               │Continue/Kill │
└──────────────┘                               └──────────────┘                               └──────────────┘
```

---

## 3. Entity Specification

### 3.1 Hypothesis (`H`)
* **Definition:** A formal causal claim predicting that code change $X$ causes outcome $Y$ under conditions $Z$.
* **Lifecycle Status:** `proposed` $\to$ `testing` $\to$ `verified` $\mid$ `partially_verified` $\mid$ `falsified` $\mid$ `dead`.
* **Attributes:** `id`, `claim`, `causal_mechanism`, `status`, `target_metric`, `falsification_threshold`, `linked_evidence_ids`.

### 3.2 Evidence (`E`)
* **Definition:** Immutable, empirical verification artifacts produced during execution.
* **Attributes:** `id`, `type` (`benchmark_run`, `pmu_cache_log`, `assembly_diff`, `profiler_trace`, `test_run`), `raw_data_uri`, `hardware_profile_hash`, `timestamp`.

### 3.3 Experiment (`X`)
* **Definition:** The concrete controlled configuration under which a hypothesis was subjected to trial.
* **Attributes:** `id`, `hypothesis_id`, `independent_variable`, `dependent_variable`, `controlled_variables`, `git_commit_base`, `run_count_N`.

### 3.4 Result (`R`)
* **Definition:** Aggregated statistical outcomes derived from Evidence.
* **Attributes:** `experiment_id`, `sample_size`, `median`, `p90`, `p99`, `iqr`, `p_value`, `delta_percent`, `statistical_significance` (boolean).

### 3.5 Failed Approach (`F`) — *The First-Class Negative Knowledge Primitive*
* **Definition:** Explicit documentation of a disproven or regressive implementation path.
* **Invariant:** Every `falsified` or `dead` hypothesis automatically produces a `failed_approach` entry.
* **Attributes:**
  * `approach_name`: Human-readable identifier (e.g., "Loop unrolling in PopCount AVX2").
  * `tested_in_experiment`: Reference to Experiment ID.
  * `cause_of_death`: Deep causal explanation of why the approach failed (e.g., "Out-of-order execution engine already saturates port 0/1; manual unrolling adds code bloat without hiding instruction latency").
  * `forbidden_pattern`: Syntactic or architectural pattern signature to detect and block.
  * `scope_condition`: Constraints under which this failure holds (e.g., "x86_64 Skylake-AVX512 and newer").

### 3.6 Assumption (`A`)
* **Definition:** Underlying premises taken as true without direct proof.
* **Attributes:** `id`, `statement`, `risk_level`, `validation_status` (`assumed`, `validated`, `violated`).

### 3.7 Contradiction (`C`)
* **Definition:** Empirical divergence where results conflict across environments or runs.
* **Example:** "Hypothesis H-008 achieved $3.2\times$ throughput on Intel Core i7-13700K, but caused a $14\%$ regression on Apple M2 Silicon due to differing cache line widths."

### 3.8 Decision (`D`)
* **Definition:** The executive determination emitted by the **Research Manager**.
* **Values:** `Continue`, `Pivot`, `Merge`, `Discard`, `Stop`.
* **Attributes:** `manager_decision`, `timestamp`, `rationale`, `next_action_directive`.

---

## 4. Dual-Substrate Storage Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AGENT RUNTIME & TOOLS                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼                                                   ▼
┌───────────────────────────────────┐       ┌───────────────────────────────────┐
│   LOCAL REPOSITORY SUBSTRATE      │       │     COGNITIVE FAST SUBSTRATE      │
│     (`.research-memory.json`)     │       │        (AME Engine `.ame`)        │
│                                   │       │                                   │
│ • Git-tracked, human-readable     │       │ • Binary mmap, sub-50µs access    │
│ • Canonical Single Source of Truth│       │ • Vector + Lexical + CSR Graph    │
│ • Versioned alongside codebase    │       │ • Spreading activation retrieval  │
│ • Diffable across team branches   │       │ • Ebbinghaus decay & compaction   │
└───────────────────────────────────┘       └───────────────────────────────────┘
```

1. **Git Repository Layer (`.research-memory.json`):** Human-readable, transparent JSON stored directly in the repository root. Committed alongside code so team members and other AI agents inherit accumulated negative and positive knowledge.
2. **Binary Cognitive Layer (AME `.ame`):** In-process memory-mapped index facilitating sub-millisecond similarity queries and graph spreading activation for instant "Query-Before-Action" lookups.

---
desc: Autonomous Question Generator Architecture — Socratic Problem Decomposition, 6-Axis Epistemic Divergence & Dependency Graph Ranking
rules: [R_QGEN, R_RESEARCH, R_INFO_GAIN, R_ENG_OS, R_CORE]
---
# ❓ Autonomous Question Generator (Q-Gen) Architecture

## 1. Architectural Vision: The Epistemic Inversion

In conventional AI assistant interactions, the human engineer carries the entire burden of scientific problem decomposition:

```text
CONVENTIONAL PASSIVE AI:
Human (Decomposes Problem) ──► Asks Specific Question ──► AI (Generates Local Syntax)
```

This dynamic reduces the AI to a passive code-completion engine. When given a complex, high-level research directive (e.g. *"Build an embedded framework that is faster and safer than C"*), a naive agent immediately writes code, locks into arbitrary assumptions, and optimizes the wrong bottleneck.

A true **Autonomous Research Agent** executes an **Epistemic Inversion**:

```text
AUTONOMOUS RESEARCH AGENT:
Human (Provides High-Level Problem)
                 │
                 ▼
     AUTONOMOUS QUESTION GENERATOR (Q-GEN)
     [Socratic Problem Decomposition across 6 Orthogonal Axes]
                 │
                 ▼
     DIRECTED ACYCLIC QUESTION GRAPH (DAG)
     [Topological Dependency Sorting & eROI Ranking]
                 │
                 ▼
     HYPOTHESIS FORMULATION SPACE (H0 vs H1)
                 │
                 ▼
     OPTIMAL EXPERIMENTAL DESIGN & VERIFICATION
```

The agent's primary competitive superpower is its ability to **generate the right skeptical questions** before touching code.

---

## 2. The 6-Axis Socratic Question Generation Taxonomy

When an open research problem $P$ is ingested, the Q-Gen engine decomposes it across six orthogonal scientific axes:

```text
                       6-AXIS SOCRATIC QUESTION TAXONOMY
                                      │
     ┌──────────────┬──────────────┬──┴───────────┬──────────────┬──────────────┐
     ▼              ▼              ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  AXIS 1  │  │  AXIS 2  │  │  AXIS 3  │   │  AXIS 4  │   │  AXIS 5  │   │  AXIS 6  │
│ PREMISE  │  │COMPILER/ │  │COMPARAT- │   │TECHNOLOG-│   │REQUIRE-  │   │THEORETI- │
│CHALLENGE │  │ HARDWARE │  │   IVE    │   │ICAL SUBS.│   │   MENT   │   │CAL BOUNDS│
├──────────┤  ├──────────┤  ├──────────┤   ├──────────┤   ├──────────┤   ├──────────┤
│"Does the │  │"Can the  │  │"Where does│  │"Can other│   │"Is this  │   │"What is  │
│problem   │  │optimizer │  │the advan- │  │tools fix │   │constraint│   │the physi-│
│really    │  │eliminate │  │tage truly │  │this with-│   │artificial│   │cal/math  │
│exist?"   │  │this cost?│  │reside?"   │  │out rewri-│   │or unne-  │   │ceiling?" │
│          │  │          │  │           │  │ting?"    │   │cessary?" │   │          │
└──────────┘  └──────────┘  └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### Axis 1: Premise & Bottleneck Scrutiny ("Is the premise even true?")
* **Objective:** Challenge the user's fundamental assumption.
* *Example:* "Is C's runtime performance actually the bottleneck in this embedded system, or is execution dominated by I/O bus latency and flash memory wait-states?"

### Axis 2: Mechanistic & Compiler Primitives ("Can the toolchain solve this?")
* **Objective:** Interrogate the lower compiler and hardware layers.
* *Example:* "Can modern LLVM/GCC value range propagation (VRP) automatically elide memory bounds checks in release builds?"

### Axis 3: Comparative Disambiguation ("Where does the true difference lie?")
* **Objective:** Isolate specific algorithmic or semantic differentiators.
* *Example:* "Does Rust's strict mutable aliasing rule (`noalias`) give LLVM optimization passes an empirical throughput advantage over C `restrict` in embedded SIMD loops?"

### Axis 4: Technological Substitutes ("Can we solve this without a rewrite?")
* **Objective:** Explore non-invasive alternatives.
* *Example:* "Is formal verification via Frama-C / MISRA-C sufficient to match Rust's memory safety guarantees without migrating language toolchains?"

### Axis 5: Constraint & Requirement Scrutiny ("Do we actually need this?")
* **Objective:** Identify over-specified, non-essential constraints.
* *Example:* "Is dynamic heap runtime safety necessary if the embedded firmware allocates 100% of buffers statically at boot?"

### Axis 6: Theoretical Bounds & Extremes ("What is the theoretical limit?")
* **Objective:** Probe the asymptotic boundary.
* *Example:* "What is the absolute cycle overhead of hardware-enforced memory capabilities (e.g. ARM Morello / CHERI) compared to software fat pointers?"

---

## 3. Question Dependency Graph (DAG) & Topological Ranking

Questions are not independent; they form a **Directed Acyclic Graph (DAG)** of epistemic precedence:

```text
                     [Q1: Is C the true bottleneck?]
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼ (YES)                             ▼ (NO)
       [Q2: Can compiler eliminate           [ABORT PREMISE: Optimize
           safety checks?]                    I/O & Flash latency instead]
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
[Q3: Rust noalias   [Q6: Can Frama-C
    advantage?]         match safety?]
```

### 3.1 The Foundational Dependency Principle
If Question $Q_A$ is topologically upstream of $Q_B$, answering $Q_A$ might completely invalidate $Q_B$.
* Answering *"Is C the true bottleneck?"* with **NO** saves 100 hours of wasted compiler micro-benchmarking.

### 3.2 Topological Ranking Formula
The engine prioritizes questions by combining **Foundational Impact**, **Expected Information Gain (EIG)**, and **Investigation Cost**:

$$\text{Priority}(Q_i) = \text{DownstreamReach}(Q_i) \times \frac{\mathbb{E}[\text{IG}(Q_i)]}{\text{ResourceCost}(Q_i)}$$

Where:
* $\text{DownstreamReach}(Q_i)$ is the number of dependent questions in the DAG pruned or resolved by answering $Q_i$.
* $\mathbb{E}[\text{IG}(Q_i)]$ is the expected entropy reduction across the system hypothesis space.
* $\text{ResourceCost}(Q_i)$ is the estimated token/time budget required to answer $Q_i$ (e.g. theoretical literature lookup = cheap; custom hardware benchmark = expensive).

---

## 4. Question-to-Hypothesis Transformation Pipeline

```text
┌─────────────────────────┐
│  PRIORITIZED QUESTION   │ Q3: "Does Rust's noalias rule provide an empirical"
│                         │     "speedup over C in embedded DSP FIR filters?"
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ FORMAL HYPOTHESIS PAIR  │ H0 (Null): LLVM emits identical assembly for C (restrict)
│                         │            and Rust across all unrolled DSP loops.
│                         │ H1 (Alt) : Rust's compiler-enforced noalias enables
│                         │            LLVM SLP-vectorizer to generate 2x wider SIMD.
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ DECISIVE EXPERIMENT     │ EXP-031: Compile identical 64-tap FIR filter in C (Clang -O3)
│                         │          and Rust (rustc -O), diff assembly, and count cycles.
└─────────────────────────┘
```

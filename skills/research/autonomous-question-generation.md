---
desc: Autonomous Question Generation Protocol — Socratic Inquiry Playbook, Dependency Pruning & Question-to-Hypothesis Mapping
rules: [R_QGEN, R_RESEARCH, R_STATE]
---
# ❓ Autonomous Question Generation Protocol

## 1. The "Pause-and-Inquire" Mandate

When an AI agent receives a broad, ambitious research problem:
* *Bad Agent:* Immediately creates `framework/` directory and writes 2,000 lines of unverified code.
* *Senior Research Agent:* **Pauses immediately.** Decomposes the problem into foundational, skeptical research questions, ranks them by epistemic impact, and tests core assumptions first.

---

## 2. The 5-Step Socratic Generation Workflow

```text
[Input Research Problem]
         │
         ▼
[Step 1: 6-Axis Socratic Divergence] ──► Generate 7-10 diverse, skeptical questions
         │
         ▼
[Step 2: Build Dependency DAG]      ──► Identify root premise vs downstream leaves
         │
         ▼
[Step 3: Score by Priority Formula] ──► DownstreamReach * (EIG / Cost)
         │
         ▼
[Step 4: Rank Question Backlog]     ──► Select Rank #1 & #2 for immediate attack
         │
         ▼
[Step 5: Transform to Hypotheses]   ──► Formulate formal H0 vs H1 and decisive test
```

---

## 3. Case Study: "Làm embedded framework nhanh và safe hơn C"

### Step 1: Ingesting Problem
* **User Directive:** "Build an embedded framework faster and safer than C."

### Step 2: 6-Axis Divergence (Generating Q1–Q7)
1. **Q1 (Premise Challenge):** *Is C's computational speed truly the performance bottleneck in the target system, or is execution latency dominated by peripheral I/O and flash wait-states?*
2. **Q2 (Compiler Primitives):** *Can modern compiler optimizations (LLVM/GCC) eliminate runtime bounds checks completely via Value Range Propagation (VRP)?*
3. **Q3 (Comparative Mechanism):** *Does Rust's compiler-enforced `noalias` guarantee give LLVM an empirical optimization advantage over C in embedded DSP/SIMD routines?*
4. **Q4 (Toolchain Sharing):** *Can both languages compile through the identical LLVM backend with identical LTO passes, thereby isolating purely language-level deltas?*
5. **Q5 (Hardware Capabilities):** *Does hardware-enforced memory safety (CHERI / ARM Morello capabilities) solve this problem more cleanly than language rewrites?*
6. **Q6 (Technological Substitutes):** *Can static analysis tools (MISRA C:2023, Frama-C WP plugin) achieve 100% memory safety in C without introducing runtime overhead?*
7. **Q7 (Requirement Scrutiny):** *Is runtime safety actually required for all subsystems, or strictly for network-exposed peripheral parsers?*

### Step 3: Dependency Graph Mapping
```text
Root Premise: Q1 (Is C the bottleneck?)
    ├── If NO  ──► ABORT FRAMEWORK REWRITE. Focus on DMA & Flash prefetch.
    └── If YES ──► Branch into Mechanism:
            ├── Q6 (Can C + Static Analysis solve it without rewrite?)
            ├── Q2 (Can Compiler eliminate checks?)
            └── Q3 (Does Rust provide aliasing speedups?)
```

### Step 4: Epistemic Ranking
| Question | Downstream Reach | Estimated EIG | Cost | Priority Rank |
| :--- | :--- | :--- | :--- | :--- |
| **Q1** (Is C the bottleneck?) | 6 (Invalidates entire project) | 0.95 bits | Low (Profile trace) | **#1 (IMMEDIATE ATTACK)** |
| **Q6** (Can static analysis fix C?) | 4 (Avoids language migration) | 0.80 bits | Low (Tool survey) | **#2 (HIGH)** |
| **Q3** (Does Rust `noalias` beat C?) | 2 (Direct comparative kernel) | 0.65 bits | Med (Micro-bench) | **#3 (MEDIUM)** |
| **Q2** (Compiler VRP check removal) | 1 (Local optimization) | 0.40 bits | Med (Assembly diff) | **#4 (DEFERRED)** |
| **Q5** (CHERI hardware capability) | 0 (Requires custom silicon) | 0.30 bits | High (Emulation) | **#5 (LONG-TERM)** |

### Step 5: Transforming Rank #1 into Decisive Hypothesis
* **Target Question:** Q1 (*Is C the bottleneck?*)
* **Hypothesis $H_0$ (Null):** In the targeted firmware application, CPU instruction execution accounts for $< 20\%$ of frame latency, while flash bus contention and I/O polling account for $> 80\%$.
* **Hypothesis $H_1$ (Alternative):** CPU instruction execution accounts for $> 70\%$ of latency, meaning a faster language runtime will yield a measurable end-to-end speedup.
* **Decisive Experiment:** EXP-001 (Hardware trace profiler run on existing C firmware).

---

## 4. Standard Research Agenda Output Format

When receiving an open-ended goal, output the prioritized research agenda to the human user before writing code:

```text
╔══════════════════════════════════════════════════════════════════════╗
║  📋 AUTONOMOUS RESEARCH AGENDA GENERATED                             ║
╠══════════════════════════════════════════════════════════════════════╣
║ Research Problem: Build embedded framework faster and safer than C   ║
║ Socratic Questions Generated: 7 across 6 orthogonal axes             ║
╠══════════════════════════════════════════════════════════════════════╣
║ PRIORITIZED RESEARCH QUESTIONS:                                      ║
║ 1. [Rank #1] Q1: Is C truly the bottleneck in this embedded system?  ║
║    -> Foundational dependency: Answering this gates the entire path. ║
║ 2. [Rank #2] Q6: Can Frama-C / MISRA-C achieve memory safety in C    ║
║    without the cognitive and toolchain cost of a Rust rewrite?       ║
║ 3. [Rank #3] Q3: Does Rust's noalias aliasing rule yield measurable  ║
║    LLVM vectorization speedups over C restrict?                      ║
╠══════════════════════════════════════════════════════════════════════╣
║ NEXT ACTION: Execute EXP-001 to resolve Question #1 before coding.   ║
╚══════════════════════════════════════════════════════════════════════╝
```

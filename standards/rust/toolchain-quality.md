---
desc: Rust Micro-Crate Workspace Architecture, Zero-Warning Clippy Discipline, rustfmt & Automated Test Contracts
rules: [R_RUST, R_TDD, R_CORE]
---
# 🛠️ Rust Toolchain, Architecture & Engineering Quality Standards

## 1. Micro-Crate Workspace Architecture & Modularity

1. **Sovereign Single-Responsibility Crates**:
   - Decompose monolithic systems into focused micro-crates with explicit domain boundaries (e.g., capture, codec, input, transport, application host).
   - Core computational engines, wire protocols, and math algorithms should strive for `#![no_std]` compatibility (with `alloc` when necessary) to ensure portability to embedded systems, WASM, and bare-metal runtimes.
2. **File Size Limit (<450 LOC)**:
   - Source code files (`.rs`) MUST NOT exceed 450 lines of code.
   - Decompose sprawling modules into cohesive sub-modules or domain structs with dedicated files.
3. **Workspace Dependency Consolidation**:
   - Manage shared dependencies and versions centrally via the workspace root `Cargo.toml` using `[workspace.dependencies]`.
   - Micro-crates inherit workspace dependencies via `dep_name.workspace = true`.

---

## 2. Zero-Tolerance Clippy & Formatting Directives

1. **Mandatory Clippy Gate**:
   - All builds must compile cleanly against Clippy with all warnings denied:
     ```bash
     cargo clippy --all-targets -- -D warnings
     ```
   - Sweeping `#![allow(warnings)]` or indiscriminate module-level disables are strictly prohibited.
   - Isolated `#[allow(...)]` annotations are permitted ONLY when interfacing with legacy C-FFI naming conventions or specific SIMD algorithmic idioms, and MUST be accompanied by an explanatory code comment.
2. **Standard Formatting Enforcement**:
   - All code must adhere to official rustfmt guidelines:
     ```bash
     cargo fmt --all -- --check
     ```

---

## 3. Automated Testing & Verification Contracts

1. **Headless & Deterministic Mocking**:
   - Hardware- or OS-bound subsystems (screen grabbers, synthetic input injection, raw sockets, display servers) MUST define clean abstraction traits (e.g., `ScreenCapturer`, `InputInjector`).
   - Provide high-fidelity, deterministic mock implementations (e.g., `MockCapturer`, `MockInjector`) enabling automated headless test suites to run in CI/CD without physical monitors, GPUs, or user session state.
2. **Test Coverage & Verification Hierarchy**:
   - Unit Tests: Verify local invariants, state machine transitions, and buffer allocations.
   - Integration Tests: Validate end-to-end data pipelines across crate boundaries (e.g., Capture $\to$ SIMD Damage Scanner $\to$ Codec $\to$ Transport $\to$ Decoder).
   - Invariant Checks: Validate mathematical assertions and bounds checking across all permutations.
   - Run workspace verification via:
     ```bash
     cargo test --workspace
     ```

---

## 4. Dependency Governance & Lean Footprint

1. **Dependency Vetting & Minimal Surface**:
   - Favor the standard library and lightweight, audited primitives over heavy multi-layered frameworks.
   - Explicitly disable default features (`default-features = false`) on third-party crates to eliminate unused transitive dependencies and minimize compilation overhead.
2. **Binary Footprint Optimization**:
   - Release profiles should leverage link-time optimization (`lto = "fat"` or `"thin"`), symbol stripping (`strip = true`), and single codegen units (`codegen-units = 1`) when targeting minimal distribution footprint.

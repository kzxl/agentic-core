---
name: AgenticAdversarialCodeReview
description: Two-axis adversarial code review (Standards and Spec) run as parallel subagents, incorporating the Intended vs Implemented audit method, 13 Correctness Lenses, and an anti-slop lint for UI changes. Use before presenting or committing completed work, when the user asks to review a diff, branch, PR, or work-in-progress changes, or asks to "review since <ref>".
desc: Fail-fast two-axis review (Standards with Correctness Lenses, Spec fidelity via Intended vs Implemented audit) in parallel subagents, anti-slop lint for UI diffs.
rules: [R_CORE, R_NEV, R_PROOF, R_ANTI_SLOP]
category: Agentic
---
# Agentic Adversarial Code Review Protocol

**Goal:** Audit a candidate diff as a zero-trust reviewer along two independent axes, **Standards** (does the code follow this repo's standards?) and **Spec** (does it implement what was asked?), and trap concurrency races, N+1 queries, leaks, security bypasses, and negative Net Engineering Value (`NEV <= 0`) before completion.

Incorporates practices adapted from mattpocock/skills (MIT) and phuryn/pm-skills (MIT).

A change can pass one axis and fail the other (clean code that implements the wrong thing; correct behaviour that breaks conventions). Reporting the axes separately stops one from masking the other.

---

## 1. Pin the Fixed Point (fail fast)

Pick exactly one branch and capture its diff command once; that command is what the subagents receive.

| Branch | When | Validate | Diff command | Context |
| :--- | :--- | :--- | :--- | :--- |
| **(a) Committed work** | The user named a fixed point (commit, branch, tag, `main`, `HEAD~5`) | `git rev-parse --verify <ref>` | `git diff <ref>...HEAD` (three-dot, against the merge-base) | `git log <ref>..HEAD --oneline` |
| **(b) Uncommitted work** | Review of the working tree before commit | none | `git diff HEAD` (staged + unstaged) | `git ls-files --others --exclude-standard` lists new untracked files; include their contents |

Confirm the chosen diff is non-empty: `git diff <ref>...HEAD --stat` for (a); `git diff HEAD --stat` plus the untracked list for (b).

**Done when** the branch is chosen, the ref resolves (branch a), and the chosen diff is non-empty. A bad ref or empty diff stops the review here with a one-line report, before any subagent is spawned.

## 2. Gather Sources

- **Standards sources:** the `standards/` files matching the diff's languages, the project's `.project-rule.md`, and `CODING_STANDARDS.md` / `CONTRIBUTING.md` when present. Items enforced by tooling (formatter, analyzers, linters) are out of scope.
- **Spec source**, in order: issue references in commit messages, a path the user passed, an implementation plan or spec artifact for this task, else ask the user. If there is no spec, the Spec axis reports "no spec available".

**Done when** both source lists are written down (or "no spec available" is recorded).

## 3. Run the Axes in Parallel

Issue both subagent calls in the same tool block (read-only `research` subagents), each with the diff command, the commit list, and its brief. When subagents are unavailable, run the axes as two separate passes and still report them separately.

**Standards brief:** "Review the diff against the listed standards and the audit checklist in Section 4. For each finding, quote the hunk and cite the standard. Also flag any smell from the baseline in Section 5, labelled as a judgement call ('possible Feature Envy'). Hard violations of documented standards carry a severity (`P0` security/crash/corruption, `P1` N+1/leak/regression, `P2` nit); smells never do. A documented repo standard overrides the smell baseline. Skip anything tooling enforces. Under 400 words."

**Spec brief (Intended vs. Implemented Audit):** "Audit the gap between documented intent and code reality using the 5-step Intended vs. Implemented method (§5): (1) Treat spec claims as hypotheses to verify, not proof; (2) Locate cited enforcement lines in the diff; (3) Verify server-side boundaries, distrusting comments like `// internal only`; (4) Filter mismatches that cross trust, tenant, data, or financial boundaries; (5) For each finding, cite Documented Intent, Implemented Reality, Attacker/Victim, and Concrete Fix. Also flag missing requirements and unasked scope creep. Under 400 words."

**Anti-slop check (UI or comment changes):** when the diff touches UI files (`*.css`, `*.scss`, `*.xaml`, `*.tsx`, `*.jsx`, `*.vue`, `*.html`, `*.Designer.cs`) or adds comments, run in parallel with the subagents:
```bash
node tools/anti-slop-lint.js --diff
```
The path is relative to the AgentOption root; from another repository use `node "E:\16. AgentOption\tools\anti-slop-lint.js" --diff`. Exit code `1` means a MUST-severity `AS-xx` violation (hard finding); warnings are judgement calls.

**Done when** both axis reports (each under 400 words) and, when applicable, the lint output are in hand.

## 4. Standards Audit Checklist (repo baseline)

| Audit Dimension | Mandatory Invariant | Blocker Trigger (`P0` / `P1`) |
| :--- | :--- | :--- |
| **Net Engineering Value (`R_NEV`)** | $\text{NEV} > 0$; LOC inflation $\le +30\%$ | Speculative single-impl interfaces or wrapper bloat |
| **Concurrency & Race Safety** | $0$ unsynchronized shared mutations or TOCTOU gaps | Check-then-act without atomic lock / DB `UPDLOCK` |
| **I/O & Memory Efficiency** | $0$ N+1 loops; $100\%$ `IDisposable` / `AbortController` cleanup | SQL/HTTP call inside loop or unfreed event/stream |
| **Security Boundary** | $100\%$ parameterized SQL & RBAC/ownership check | String-interpolated SQL or missing tenant/user ID filter |
| **Backward Compatibility** | $0$ breaking public API / DTO contract changes | Renamed JSON property or removed method overload |

- **NEV:** $\text{NEV} = (\Delta \text{Correctness} + \Delta \text{Performance}) - (\Delta \text{LOC Bloat} + \Delta \text{Indirection Depth})$. A refactor that adds pass-through classes, raises cyclomatic complexity, or inflates lines by $> 30\%$ without fixing a verified bug or improving latency fails.
- **TOCTOU:** balance/stock checks and deductions happen in one atomic SQL statement or `UPDLOCK` transaction. Mutation handlers block duplicate triggers or abort prior in-flight requests.
- **N+1 and leaks:** any `for` / `foreach` / `.map()` / `.Select()` that awaits a query, network call, or file read is a `P0`. Every `SqlConnection`, `FileStream`, `Timer`, `GCHandle`, and DOM listener has a deterministic `using` or cleanup path.
- **Tenant isolation:** queries filter by the authenticated caller's `TenantId` / `UserId` (BOLA/IDOR); errors leak no credentials, JWTs, or stack traces.

```csharp
// BAD: TOCTOU race, N+1 query inside the loop, string-interpolated SQL, no tenant filter
public async Task ApproveVouchersBadAsync(List<int> voucherIds)
{
    foreach (var id in voucherIds)
    {
        var v = await _db.QuerySingleAsync<Voucher>($"SELECT * FROM Vouchers WHERE Id = {id}");
        if (v.Status == "PENDING")
            await _db.ExecuteAsync("UPDATE Vouchers SET Status = 'APPROVED' WHERE Id = @Id", new { Id = id });
    }
}

// GOOD: one atomic set-based update, parameterized, tenant-scoped, idempotent
public async Task<int> ApproveVouchersGoodAsync(IReadOnlyCollection<int> voucherIds, int tenantId, CancellationToken ct)
{
    if (voucherIds.Count == 0) return 0;

    const string sql = @"
        UPDATE tb_voucher
        SET Status = 'APPROVED', ApprovedAtUtc = SYSUTCDATETIME()
        WHERE TenantId = @TenantId AND Id IN @Ids AND Status = 'PENDING';";

    return await _db.ExecuteAsync(new CommandDefinition(sql, new { TenantId = tenantId, Ids = voucherIds }, cancellationToken: ct));
}
```

## 5. Intended vs. Implemented Audit Protocol

A linter checks internal consistency in a vacuum; it cannot verify whether code fulfills business intent. The highest-severity bugs live in the gap between documented specification and implemented code.

1. **Establish Intent:** Read spec or architecture documents as claims to verify, not trusted facts.
2. **Gather Implementation Evidence:** Locate the exact lines executing authorization, filtering, and sanitization. Code paths are evidence; developer comments like `// validated elsewhere` are not.
3. **Compare Claim to Code:** Audit boundaries one at a time. Ensure enforcement lives on the server on every reachable path.
4. **Filter Meaningful Mismatches:** Discard cosmetic differences. Retain mismatches that allow unauthorized data, financial loss, tenant crossing, or privilege escalation.
5. **Concrete Finding Contract:** Every finding MUST state:
   - **Documented Intent:** Quote the spec, doc, or permission requirement.
   - **Implemented Reality:** Cite the concrete file and line number.
   - **Attacker & Victim / Impact:** Identify the boundary crossed and who is affected.
   - **Concrete Fix:** Provide the precise diff or remediation pattern.

## 6. Thirteen Correctness Diagnostic Lenses

Reviewers frequently overlook relationship defects between components that individually appear sensible. Apply these 13 diagnostic lenses during standards and logic audits:

| # | Diagnostic Lens | What to Probe / Tell |
| :--- | :--- | :--- |
| **1** | **Authority Reconciliation** | "A requested value is not an applied value." State derived from the request instead of the authority's reply. Probe: construct a case where server response differs from proposed input. |
| **2** | **Identity & Correlation** | Key uniqueness, stability, and lifetime under concurrency, reordering, or slot reuse. |
| **3** | **Freshness & Generations** | Captured values across `await`, callbacks, yields, timers, or lock releases used after state has mutated. |
| **4** | **Lifecycle & Derived State** | Derived or cached state retained across reset/failure paths instead of recomputed. |
| **5** | **Atomicity & Partial Failure** | Multi-effect operations leaving durable partial state on exception or cancellation. |
| **6** | **Replay & Effect Cardinality** | Retries or duplicate triggers executing non-idempotent side effects (billing, notifications). |
| **7** | **Composition & Precedence** | Merges, reductions, and post-merge transformations silently re-ordering priority. |
| **8** | **Bounds, Units & Accounting** | Empty collections, off-by-one, integer overflow, and mismatched measurement units. |
| **9** | **Framing & Incremental Processing** | Buffer flushing, stream chunking, early termination, and final-item finalization. |
| **10** | **Representation & Information Loss** | **Nullish family collapse**: confusing *pending*, *absent*, *empty*, *zero*, *false*, and *failed*. **Projection drift**: dropped DTO fields. **Unresolved values**: persisting unsettled promises. |
| **11** | **State Machine Invariants** | Unchecked transitions between domain states (e.g. `Cancelled` transitioning to `Approved`). |
| **12** | **Exception Hygiene** | Swallowed errors, empty catch blocks, or catching `Exception` instead of specific fault types. |
| **13** | **Concurrency & Reentrancy** | Unsynchronized shared mutable state, lack of atomic Compare-And-Swap or DB `UPDLOCK`. |

> **Tell:** A type cast, an `any`, a non-null assertion (`!`), or a warning suppression (`#pragma warning disable`) at a boundary is where contracts go to die. Treat every boundary suppression as a primary defect candidate.

## 7. Fowler Smell Baseline (judgement calls)

Applies even when a repo documents nothing; a documented repo standard always overrides it.

| Smell | What it is | Fix |
| :--- | :--- | :--- |
| Mysterious Name | Name does not reveal what it does or holds | Rename; if no honest name comes, the design is murky |
| Duplicated Code | Same logic shape in more than one hunk or file | Extract the shared shape |
| Feature Envy | Method uses another object's data more than its own | Move it onto the data it envies |
| Data Clumps | Same fields or params travel together | Bundle into one type |
| Primitive Obsession | Primitive or string stands in for a domain concept | Give the concept a small type |
| Repeated Switches | Same `switch` / `if`-cascade on the same type recurs | Polymorphism or one shared map |
| Shotgun Surgery | One logical change forces scattered edits | Gather what changes together |
| Divergent Change | One module edited for unrelated reasons | Split by reason to change |
| Speculative Generality | Abstraction or hooks for needs the spec lacks | Delete and inline until a real need shows |
| Message Chains | Long `a.b().c().d()` navigation | Hide the walk behind one method |
| Middle Man | Class or function that mostly delegates | Cut it; call the real target |
| Refused Bequest | Subclass ignores most of what it inherits | Replace inheritance with composition |

## 8. Report and Verdict

Present the reports under `## Standards`, `## Spec`, and (when run) `## Anti-slop`, verbatim or lightly cleaned. Keep the axes separate: no merging or re-ranking across them. End with one summary line: findings per axis and the worst finding **within** each axis.

- **`[APPROVE]`:** $0$ hard `P0`/`P1` findings on any axis, no Spec "missing" or "wrong" findings, anti-slop lint exit `0` (when run), $\text{NEV} > 0$, compiler and test suite verified green.
- **`[REJECT & REMEDIATE]`:** any `P0`/`P1`, Spec "missing"/"wrong" finding, or lint exit `1`; fix before reporting completion. Judgement-call smells and scope-creep findings are surfaced for the user to decide.

**Done when** the side-by-side report, summary line, and verdict are delivered.

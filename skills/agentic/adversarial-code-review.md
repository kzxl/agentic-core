---
name: AgenticAdversarialCodeReview
desc: Self-critique and adversarial code review protocol for AI agents before presenting completed work
rules: [R_CORE]
category: Agentic
---
# 🔍 Agentic Adversarial Code Review Protocol

**Goal:** Act as an adversarial senior code reviewer against one's own changes to catch subtle bugs, race conditions, security vulnerabilities, and regression risks before marking tasks complete.

---

## 1. Adversarial Review Checklist

### A. Correctness & Edge Cases
- [ ] What happens if the input is `null`, `undefined`, empty string, or empty array?
- [ ] Are there potential off-by-one errors in pagination or loop index slicing?
- [ ] Is there an unhandled asynchronous rejection or un-awaited Promise?

### B. Concurrency & Race Conditions
- [ ] If two users perform this action concurrently, is there a race condition or deadlock?
- [ ] If a user navigates away or clicks a button twice rapidly, are pending requests aborted?

### C. Security & Data Integrity
- [ ] Are all database queries parameterized? (Zero SQL injection hazard).
- [ ] Is authentication and RBAC authorization enforced on all new/updated routes?
- [ ] Are sensitive tokens or passwords stripped from client responses and logs?

### D. Performance & Resource Leaks
- [ ] Are event listeners, timeouts, intervals, and database connections properly closed/disposed?
- [ ] Are there N+1 query patterns that will degrade performance under load?

---

## 2. Review Verdict Decision
- If ANY checklist item fails: Immediately rectify the code, re-build, and re-verify before reporting to the user.
- If all checklist items pass: Commit changes cleanly with a descriptive commit message and present walkthrough.

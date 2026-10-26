# Comment rule AS-C1 applies to changed lines only

AS-C1 (self-documenting names; a comment states a non-obvious why in one line) applies only to new or modified lines in a diff. A whole-file rule would push agents to rewrite untouched legacy comments on every edit, producing noisy diffs and deleting rationale that tooling cannot tell apart from narration. The linter enforces this scope by reading added lines from the staged or working diff.

## Considered Options

- Whole-file enforcement on every touched file: rejected for the diff noise and rationale loss described above.
- One-time repo-wide comment sweep: rejected, see [legacy-comment-sweep.md](../governance/out-of-scope/legacy-comment-sweep.md).

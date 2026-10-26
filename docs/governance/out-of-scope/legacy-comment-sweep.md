# Repo-wide comment removal in untouched files

A one-time sweep that strips comments from legacy files to make them conform to AS-C1 is out of scope. AS-C1 applies to new or modified lines only (see [ADR 0001](../../adr/0001-diff-scoped-comment-rule.md)).

## Why this is out of scope

A sweep produces large diffs that bury real changes and pollute blame history, touches code that often has no tests, and cannot tell narration apart from a comment that records a non-obvious why. Losing that rationale costs more than the noise it removes. Diff scope cleans legacy code gradually, exactly where someone is already working and reviewing.

## Revisit when

A specific module is being refactored under the `code-refactoring` skill with test coverage in place. That work already falls under AS-C1 through the diff, so it needs no rule change.

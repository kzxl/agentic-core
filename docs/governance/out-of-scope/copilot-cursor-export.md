# Copilot and Cursor export targets

Adding export targets that translate the anti-slop standard, motion rules, or skills into GitHub Copilot or Cursor rule formats is not planned.

## Why this is out of scope

No one on the team currently works in Copilot or Cursor on a project bound to this framework, so the proposal fails the observed-failure part of [SCOPE.md](../SCOPE.md). Each harness-specific target is permanent maintenance surface: its format changes on the harness's schedule and its output must stay in step with every rule edit.

## Revisit when

A team member uses Copilot or Cursor on a framework-bound project and reports a real session where missing rules produced the wrong output.

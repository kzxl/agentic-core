# Recursion guards written into skill prose

Skills do not carry guards against subagents recursively invoking skills or spawning nested agents. Requests to add leaf-agent instructions, depth limits, or "do not invoke this skill" lines to individual skills are out of scope.

## Why this is out of scope

The harness decides which tools and skills a subagent can reach and how deep nesting can go, so a limit set there holds for every skill at once. A guard in one skill's prose covers only that skill, costs tokens on every run, and still depends on the model choosing to obey it. Unbounded recursion or fan-out is reported to the harness.

## Revisit when

The harness offers no way to limit subagent depth and a recorded session shows unbounded fan-out. Even then, prefer one guard in the `multi-agent-teamwork` orchestration skill over lines in each skill.

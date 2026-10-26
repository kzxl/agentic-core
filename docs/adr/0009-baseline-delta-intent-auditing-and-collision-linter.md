# Baseline Delta, Intent Auditing, and Skill Collision Linter

Adapted from `mukul975/Anthropic-Cybersecurity-Skills`, `phuryn/pm-skills`, and `dotnet/skills`.

As AgentOption scales across sovereign workflow packages, language standards, and specialist personas, agent discovery entropy and review depth become critical failure modes. This ADR codifies four structural decisions:

1. **Skill Collision Detection (`tools/skill-lint.js`)**: An agent discovers skills exclusively from frontmatter `name` and `description`. When two descriptions have high lexical overlap without clear triggers, the model misroutes. We enforce TF-IDF cosine similarity checking with negative trigger stripping (`DISAMBIGUATION_RE`) and punctuation truncation canaries.
2. **Intended vs. Implemented Audit Protocol**: Generic linters check internal consistency in an intent vacuum. We mandate auditing the gap between documented specifications and actual code paths, focusing on trust, data, and financial boundaries.
3. **Thirteen Correctness Diagnostic Lenses**: High-leverage correctness bugs occur in relationships between components (authority reconciliation, identity/correlation, stale async captures, nullish family state collapse). We codify these lenses into adversarial code reviews.
4. **Writing for Delta Over Baseline**: Skill content that an unskilled foundation model already produces unaided is worth zero. We enforce "When A, do B, never C, verify D" decision tables and output contracts across all agent-facing documents.
5. **WinForms Designer Contract & MSBuild Anti-Patterns**: Strict separation between VS Designer serialization (`InitializeComponent`) and application behavior, alongside quantitative CRAP score assessment for legacy C# refactoring.

## Considered Options

- Relying solely on `rules.json` and `shortcuts.json` for routing: rejected because LLM agents dynamically interpret semantic intent from skill descriptions when executing autonomous steps.
- Performing code reviews based only on syntax linters and Fowler smells: rejected because linters miss unenforced permissions, broken authority reconciliation, and boundary leaks.
- Generic conversational skills with suggested alternatives: rejected because models hedge and degrade; decision tables force deterministic outcomes.

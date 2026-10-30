# Governance documents live under docs/

The change bar, out-of-scope records, and ADRs live in `docs/governance/` and `docs/adr/`. The validator treats `architecture/`, `standards/`, `skills/`, and `agents/` as the core registry, where every file needs frontmatter with rule IDs, shortcut coverage, a README Vital Metrics update, and (for standards) a minimum size; none of that fits short meta-documents. Under `docs/` these files stay outside the registry while the validator still verifies their relative links.

## Considered Options

- `standards/SCOPE.md`, `standards/.out-of-scope/`, and `architecture/adr/`: rejected for the registry cost above and for inflating the standard and blueprint counts.
- A hidden `.agents/` folder (upstream layout): rejected because it diverges from the existing `docs/` tier and is easy to miss.

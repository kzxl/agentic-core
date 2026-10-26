# An interface needs two adapters or a runtime plugin contract

Under AS-C4, an interface earns its place when something actually varies across the seam: two adapters exist (a production implementation plus an in-memory test fake counts as two), or plugin contracts load at runtime per [universe-plugin.md](../../architecture/universe-plugin.md). Otherwise the deletion test applies: if deleting the interface makes complexity vanish, inline it. This replaces an earlier "exempt at boundaries" clause, because *boundary* is an overloaded word and let single-implementation interfaces (Middle Man, Speculative Generality) pass review.

## Considered Options

- Blanket exemption at architectural boundaries: rejected as unverifiable.
- Ban every single-implementation interface: rejected because it breaks test fakes and runtime plugin contracts, which are real seams.

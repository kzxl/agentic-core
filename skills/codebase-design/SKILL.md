---
name: codebase-design
description: Deep-module design vocabulary and protocol. Use when designing or reviewing a module interface, deciding where a seam or plugin contract goes, judging whether an interface, wrapper, or abstraction earns its place (deletion test, AS-C4), deepening a cluster of shallow classes or services, making C#/.NET, Node, or React code testable through its interface, or comparing alternative interface designs in parallel (design it twice).
desc: Deep modules, seams, adapters, deletion test, dependency categories, and design-it-twice for interface decisions
rules: [R_CORE, R_UNIVERSE, R_TDD, R_REUSE, R_NEV]
---

# Codebase Design

**Goal:** Build **deep modules**: much behaviour behind a small interface, placed at a deliberate **seam**, tested through that interface. Depth gives callers **leverage** and maintainers **locality**.

## 1. Vocabulary

Use these terms exactly. Consistent words are the point.

| Term | Meaning | Avoid |
| :--- | :--- | :--- |
| **Module** | Anything with an interface and an implementation: method, class, assembly, Universe feature module, React feature plugin | unit, component, service (as design terms) |
| **Interface** | Everything a caller must know: signature, invariants, ordering, error modes, required config, performance | API, signature (too narrow) |
| **Implementation** | The code inside a module | |
| **Depth** | Behaviour a caller or test can exercise per unit of interface learned | line-count ratios |
| **Seam** (Feathers) | A place where behaviour changes without editing in place; where an interface lives | boundary (overloaded with bounded context) |
| **Adapter** | A concrete thing filling a seam; describes role, not size | |
| **Leverage** | What callers gain: one implementation pays back across N call sites and M tests | |
| **Locality** | What maintainers gain: change, bugs, and verification concentrate in one place | |

A module is **deep** when its interface is small relative to the behaviour behind it, **shallow** when the interface is nearly as complex as the body.

## 2. Principles

- **Depth is a property of the interface.** A deep module may be composed of small internal parts with **internal seams** used by its own tests; those parts stay out of the interface.
- **Deletion test.** Delete the module in thought. If complexity vanishes, it was a pass-through (*Middle Man*): inline it. If complexity reappears across N callers, it earns its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. Needing to test past the interface means the module has the wrong shape.
- **One adapter = hypothetical seam; two adapters = real seam.** An interface earns its place when two adapters exist (production + in-memory test fake counts as two) or a runtime plugin contract is loaded per `[AgentOption]/architecture/universe-plugin.md`. Otherwise it is *Speculative Generality*. This is guardrail `AS-C4` in `[AgentOption]/standards/universal/ui-anti-ai-slop-standard.md`.
- **Accept dependencies, return results.** Inject collaborators through the constructor; return values instead of mutating caller state.

## 3. Alignment with Universe Plugin Contracts

| Universe concept | Design reading |
| :--- | :--- |
| `IFeatureModule` / `IModule` | A real seam: many adapters (one per feature) loaded at runtime |
| `IServiceB` for cross-module data | A seam at a data-sovereignty line; earns its place when the owning module ships an in-memory fake for consumers' tests |
| EventBus / Mediator | A seam between modules; the event contract is the interface |
| Thin WinForms/WPF controller | Allowed pass-through by the platform layering rule; keep logic in the service so the service is the deep module |
| `IXxxRepository` with one SQL adapter and no test fake | Hypothetical seam: inline it, or add the in-memory adapter that makes it real |

## 4. Design Protocol

1. **Pre-fetch and survey.** Run `node E:\Tools\SemanticBrain\tools\context-fetch.js "<module purpose>"` and `rg` for existing modules that already own the behaviour. Done when you can name the module that will own it, or have confirmed none exists.
2. **Read the domain language.** If the target project has `GLOSSARY.md`, use its terms for module and method names. When a term is fuzzy or missing, read `skills/domain-modeling/SKILL.md` and follow it.
3. **Map the candidate.** List the modules involved, their interfaces, and their callers (`rg "\b<Type>\b"`). Done when every caller is listed with the interface members it uses.
4. **Apply the deletion test** to every interface and wrapper in the cluster. Done when each one is labelled *keeps* or *inline*, with the reason.
5. **Classify dependencies.** Read [references/deepening.md](references/deepening.md) when the cluster touches I/O (SQL Server, file system, HTTP, COM/OPC UA, third-party SDKs). Done when every dependency has a category and a test strategy.
6. **Choose the interface.** For a single obvious shape, write it directly. When the interface is hard to reverse (public contract, plugin contract, shared DTO) or two plausible shapes exist, read [references/design-it-twice.md](references/design-it-twice.md) and run it.
7. **Test at the interface.** Write tests through the chosen interface (`[AgentOption]/skills/agentic/test-driven-development.md`). Replace, don't layer: delete the old shallow tests the new ones supersede. Done when `dotnet test` / `node --test` exits 0 and no test references a removed internal type.
8. **Verify.** Build exit 0, tests exit 0, `node tools/anti-slop-lint.js --diff` reports zero MUST errors.

## 5. Interface Review Questions

- Can the number of members shrink without moving complexity to callers?
- Can parameters simplify (one options record instead of six primitives)?
- Can more complexity hide inside (retries, caching, lock ordering, DBNull mapping)?
- Does every error mode a caller must handle appear in the interface (exception types, result types)?
- Do tests describe behaviour, so they survive an internal refactor unchanged?

## 6. Rejected Framings

- **Depth as implementation lines / interface lines:** rewards padding.
- **Interface = the C# `interface` keyword:** too narrow; ordering rules and error modes are part of the interface.
- **"Boundary":** say **seam** or **interface**.

Adapted from mattpocock/skills (MIT).

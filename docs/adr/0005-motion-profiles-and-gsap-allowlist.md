# Motion profiles, GSAP allowlist, and anti-slop precedence

Each project declares `ui_profile: enterprise|expressive` in its `.project-rule.md` frontmatter, with `enterprise` as the default. Motion climbs a ladder (L0 none, L1 CSS transition, L2 CSS keyframes or WAAPI run once, L3 GSAP); the enterprise profile allows only an allowlisted GSAP subset, while `expressive` allows all of GSAP and stays bound by AS-03 and AS-08. R_ANTI_SLOP overrides third-party skill recommendations in the enterprise profile, and `greensock/gsap-skills` is installed per workspace only for expressive projects, so its scroll-driven and text-effect priors never load into enterprise work.

The ladder thresholds and the allowlist live in [ui-anti-ai-slop-standard.md](../../standards/universal/ui-anti-ai-slop-standard.md); durations live in [tokens.md](../../skills/ui-design-system/references/tokens.md).

## Considered Options

- One profile for every project: rejected because marketing and showcase projects legitimately need richer motion than ERP screens.
- Global install of gsap-skills: rejected, see [gsap-skills-global-install.md](../governance/out-of-scope/gsap-skills-global-install.md).

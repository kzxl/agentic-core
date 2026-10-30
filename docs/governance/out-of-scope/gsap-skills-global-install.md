# User-level install of gsap-skills

Installing `greensock/gsap-skills` into the user-level (global) skill directory is out of scope. It is installed per workspace, and only in projects that declare `ui_profile: expressive` (see [ADR 0005](../../adr/0005-motion-profiles-and-gsap-allowlist.md)).

## Why this is out of scope

A global skill loads into every workspace, including enterprise projects. Its recommendations (scroll-pinned sections, smooth scrolling, split-text effects) recruit exactly the priors the enterprise allowlist excludes, and every session pays the context load. R_ANTI_SLOP precedence resolves the conflict, but not loading the material at all is cheaper and more reliable than overriding it.

## Revisit when

The skill package supports profile-aware gating (it only triggers when the project declares `expressive`), or the majority of active projects declare `ui_profile: expressive`.

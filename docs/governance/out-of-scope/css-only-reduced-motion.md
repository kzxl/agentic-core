# Reduced motion handled in CSS alone

Proposals to satisfy reduced motion with only a `prefers-reduced-motion` CSS media query are out of scope. AS-03 requires the reduced-motion branch in CSS and in JavaScript.

## Why this is out of scope

CSS media queries do not reach script-driven animation. WAAPI and GSAP tweens run regardless of the stylesheet, so a CSS-only branch leaves every JS animation playing for users who asked for less motion. The JS branch (a `matchMedia` check or `gsap.matchMedia()`) is the only way those animations honour the preference.

## Revisit when

Browsers apply the reduced-motion preference to script-driven animation automatically. A project with no JS animation layer needs no rule change: the JS branch simply has nothing to cover.

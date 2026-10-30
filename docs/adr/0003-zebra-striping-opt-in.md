# Zebra striping is off by default

Data grids separate rows with hairline `--border-subtle` dividers plus a hover state; zebra striping is off by default. It is opt-in only for read-only grids with 8 or more visible columns, using `--bg-elevated`, where the eye needs help tracking across wide rows. Striping every grid competes with selection, hover, and validation states for the same visual channel and adds noise to dense screens.

## Considered Options

- Striping on every grid: rejected for the state-signal conflict above.
- Striping banned everywhere: rejected because wide read-only grids lose row tracking.

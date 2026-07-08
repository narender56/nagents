---
name: component-structure
description: Conventions for file layout, naming, and separation of concerns within components and modules. Use when creating new components/modules or reviewing structure, colocation, and the container-vs-presentational split. Framework-agnostic.
---

# Component & Module Structure

How a single component/module is organized internally, and how files sit next to each other. Complements atomic-design (which decides the *level*) — this decides the *shape*.

## Container vs. Presentational
Separate "how it looks" from "how it works".
- **Presentational**: renders from props/inputs, emits events, no data fetching, no global state, easily testable in isolation. (Most atoms/molecules/organisms.)
- **Container / Smart**: fetches data, holds/derives state, wires services, passes plain data down. (Most pages, or a `*Container` wrapping an organism.)
- Benefit: presentational components are trivially reusable and testable; logic changes don't ripple into markup.

## Colocation
Keep everything a component owns *next to it*:
```
Button/
  Button.<ext>          # the component
  Button.styles.<ext>   # styles (if not utility-based)
  Button.test.<ext>     # unit tests
  Button.stories.<ext>  # visual/story catalog (optional)
  index.<ext>           # public re-export (barrel)
  types.<ext>           # local types/interfaces (if sizeable)
```
Rule: a file used by only one component lives in that component's folder. Promote to a shared location only on the second real consumer (rule of three for premature sharing).

## Naming conventions
- Component files/folders: `PascalCase` (`ProductCard`).
- Hooks/composables/utilities: `camelCase`, intent-revealing (`useCart`, `formatCurrency`).
- Booleans read as predicates (`isLoading`, `hasError`, `canSubmit`).
- Event handlers: `handleX` internally, `onX` as the prop/input name.
- One primary export per file; the folder's `index` defines the public surface. Never import a component's internal files from outside the folder.

## Props / inputs discipline
- Keep the prop surface small and typed. Many optional booleans → consider splitting the component or using a variant/enum prop.
- Prefer explicit props over prop-drilling deep trees; reach for context/store when threading exceeds ~2–3 levels.
- Don't leak implementation types across the public boundary.

## State placement
- Keep state as local as possible; lift only when siblings must share it.
- Derive, don't duplicate — compute from source state instead of storing copies that can drift.
- Side effects (fetch, subscriptions) live in the smart layer, cleaned up on teardown.

## Module (non-UI) shape
- One module = one cohesive responsibility (see solid-principles/SRP).
- Public API via an explicit index/barrel; everything else is internal.
- Dependencies point inward toward the domain; infrastructure depends on domain, not vice versa (DIP).

## Review checklist
- [ ] Presentational and container concerns are separated.
- [ ] Files a component owns are colocated in its folder.
- [ ] Naming follows the conventions above and reveals intent.
- [ ] Public surface is a single index/barrel; no reaching into internals.
- [ ] Prop/input surface is minimal and typed; no boolean explosion.
- [ ] State lives at the lowest sensible level; no duplicated derived state.

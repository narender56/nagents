---
name: stack-profile
description: The project's CHOSEN tech stack and its best practices — generated per project by the solution-architect after the stack is agreed. Load this whenever writing or reviewing code so output matches the stack's real conventions. Starts empty; the architect fills references/ during onboarding.
---

# Stack Profile

> **Status: unconfigured.** This skill is populated by the **solution-architect** once the user agrees a tech stack. Until then it is intentionally empty — the developer/reviewer fall back to the generic skills (SOLID, design-patterns, atomic-design, component-structure, coding-standards).

This is the team's "trained" knowledge for the *specific* stack of the current project. The generic skills say what good code is in the abstract; this skill says what good code is **in this stack**.

## Chosen stack
_(architect fills this in — one line per layer)_
- **Platform(s):** <mobile / web / desktop / …>
- **Language(s):** <…>
- **Framework(s):** <…>
- **State / data:** <…>
- **UI / styling:** <…>
- **Testing:** <…>
- **Build / tooling / CI:** <…>
- **Hosting:** <…>

## Best-practice references
_(architect adds one file per technology under `references/`, then links them here)_
- `references/<tech-a>.md` — structure, idioms, do/don't, testing, pitfalls
- `references/<tech-b>.md` — …

## How the generic skills map onto this stack
_(architect fills in the concrete translation)_
- **atomic-design** → <e.g. "React function components under src/components/{atoms,molecules,…}; hooks for logic">
- **component-structure** → <e.g. "colocated .tsx + .test.tsx + .module.css; barrel index.ts">
- **design-patterns** → <e.g. "prefer hooks/composition over class inheritance; Repository via a data/ layer">
- **solid-principles** → <e.g. "DIP via injected services / context providers">
- **coding-standards** → <e.g. "ESLint config X, Prettier, Vitest, conventional commits">

## Usage
- **Developers:** read this + its references before implementing. When it conflicts with a generic skill's example, this stack profile wins (it's more specific).
- **Reviewer:** grade against the stack profile in addition to the generic skills.
- Keep it current: when the stack changes, the architect updates this file and `references/`.

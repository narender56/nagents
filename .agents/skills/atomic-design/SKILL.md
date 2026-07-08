---
name: atomic-design
description: Structure UI component libraries using Atomic Design (atoms → molecules → organisms → templates → pages). Use for any frontend component work in any framework (React, Angular, Vue, Web Components) or when reviewing component granularity and reuse.
---

# Atomic Design

Brad Frost's methodology for building UI as a hierarchy of reusable pieces. Classify every component into exactly one level. Lower levels never import higher levels.

## The five levels

### 1. Atoms
The smallest useful building blocks. A single HTML element or a tiny wrapper with no dependencies on other components.
- Examples: `Button`, `Input`, `Label`, `Icon`, `Badge`, `Spinner`.
- Rules: no business logic, no app state, fully controlled via props. Reusable in any context.

### 2. Molecules
A small group of atoms working together as a unit with one clear purpose.
- Examples: `SearchField` (Input + Button), `FormField` (Label + Input + ErrorText), `Card header` (Avatar + Title).
- Rules: still presentational; minimal internal state (e.g. focus). No knowledge of app domain.

### 3. Organisms
A distinct, self-contained section of an interface made of molecules and/or atoms.
- Examples: `NavigationBar`, `ProductCard`, `CommentList`, `CheckoutForm`.
- Rules: may hold local UI state and orchestrate molecules. Still receives data via props/inputs — doesn't fetch it directly (that's a container/page concern).

### 4. Templates
Page-level layout: arrange organisms into a structure with placeholder/sample content. Defines *where things go*, not *what the real data is*.
- Examples: `DashboardTemplate`, `ArticleTemplate`.
- Rules: layout and composition only; content is passed in.

### 5. Pages
A template filled with real data and wired to app state / routing / data fetching.
- Examples: `HomePage`, `ProductDetailPage`.
- Rules: this is where data fetching, routing params, and global state connect. Pages are the "smart" layer.

## Dependency direction (critical)
```
atoms  ←  molecules  ←  organisms  ←  templates  ←  pages
```
Import only downward. An atom must never import a molecule. This keeps the base reusable and prevents cycles.

## Folder layout (framework-agnostic)
```
src/components/
  atoms/
  molecules/
  organisms/
  templates/
  pages/            # or app/routes in some frameworks
```

## How to classify (decision test)
- Can it stand alone with no other custom component? → **atom**.
- Is it 2–4 atoms forming one small unit? → **molecule**.
- Is it a recognizable UI section? → **organism**.
- Is it a layout with slots and no real data? → **template**.
- Does it fetch/route/connect to global state? → **page**.

## Review checklist
- Every component lives at exactly one level, in the matching folder.
- No upward imports.
- Data fetching only in pages (or containers), never in atoms/molecules.
- Atoms/molecules are pure and reusable — no domain names leaking in (`UserSaveButton` at atom level is a smell; it's just `Button`).
- Duplicated markup across organisms signals a missing molecule/atom to extract.

## Note on scope
Atomic Design applies to UI. For non-UI code, use SOLID + design-patterns + component-structure instead.

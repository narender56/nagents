---
name: design-patterns
description: Choose and apply software design patterns (creational, structural, behavioral) appropriately. Use when structuring non-trivial logic or reviewing whether a pattern is the right fit. Emphasizes when NOT to use a pattern as much as when to.
---

# Design Patterns

Patterns are named solutions to recurring problems. Reach for one when you recognize its problem — never apply one to look clever. Over-patterning is as harmful as under-designing.

## Decision rule
1. Is there real, recurring variation or a real problem? If not, write the simple code.
2. Does a pattern's *intent* match the problem? Match on intent, not on shape.
3. Is the added indirection worth the flexibility? Pay for flexibility you'll actually use.

## Creational — how objects get made
- **Factory Method / Abstract Factory** — creation logic varies by type/config, and callers shouldn't know concrete classes. Use when: you `new` different implementations based on a condition. Avoid when: there's only ever one implementation.
- **Builder** — objects with many optional parameters; avoids telescoping constructors. Use for complex config objects. Avoid for 2–3 fields.
- **Singleton** — exactly one instance, global access. Use sparingly (config, logger). Warning: it's global state — hurts testability and hides dependencies. Prefer DI-provided single instances over hard singletons.

## Structural — how objects compose
- **Adapter** — make an incompatible interface fit what your code expects. Use to wrap third-party/legacy APIs.
- **Facade** — a simple front over a complex subsystem. Use to give callers one clean entry point.
- **Decorator** — add behavior without subclassing (logging, caching, auth around a call). Composable and open/closed friendly.
- **Composite** — treat individual objects and groups uniformly (trees, UI hierarchies).
- **Proxy** — stand-in controlling access (lazy load, remote, access control).

## Behavioral — how objects interact
- **Strategy** — swap interchangeable algorithms at runtime; the classic cure for a growing `switch`. Use for pricing rules, sorting, validation variants.
- **Observer / Pub-Sub** — one-to-many change notification. Use for events, reactive UI. Watch for hidden update storms.
- **Command** — encapsulate a request as an object (undo/redo, queues, transactions).
- **State** — behavior changes with internal state; replaces sprawling status conditionals.
- **Template Method** — fixed algorithm skeleton, subclasses fill steps.
- **Repository** — abstract data access behind a collection-like interface; decouples domain from persistence (pairs with DIP).

## Anti-patterns to catch in review
- Pattern for its own sake (a Factory that always returns the same class).
- Speculative generality — abstraction for a variation that doesn't exist yet.
- Singleton used as a global-variable smuggler.
- A `switch` on type that begs for Strategy/polymorphism (also an OCP violation).

## Review output format
Cite `file:line` → pattern that fits (or is misused) → why. Example:
> `pricing.ts:88` — growing `switch(tier)` with 5 branches; extract a `PricingStrategy` per tier (Strategy). Adding a tier then adds a class, not an edit (OCP).

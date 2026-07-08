---
name: solid-principles
description: Apply and review the five SOLID object-oriented design principles. Use when designing or reviewing classes, modules, services, or component boundaries in any language. Turns "this feels wrong" into a named principle and a concrete refactor.
---

# SOLID Principles

Apply these at every module/class boundary you create or review. For each: the rule, the smell that signals a violation, and the fix.

## S — Single Responsibility Principle
**A module should have one reason to change.**
- Smell: a class named `...Manager`/`...Service` that persists data AND formats output AND sends notifications; methods that touch unrelated concerns; a change in one feature forces edits across an unrelated part of the same class.
- Fix: split by *axis of change*. `OrderService` (business rules) → separate `OrderRepository` (persistence) + `OrderNotifier` (email). Each has one reason to change.
- Check: "If requirement X changes, how many classes change? If requirement Y changes, do the same classes change?" Different answers = different responsibilities.

## O — Open/Closed Principle
**Open for extension, closed for modification.**
- Smell: a growing `switch`/`if-else` on a type field that you edit every time a new case appears.
- Fix: replace conditionals with polymorphism (Strategy pattern), a registry, or dependency injection. Adding a case means adding a class, not editing existing code.
- Check: "To add a new variant, do I edit existing code or add new code?" Editing = violation.

## L — Liskov Substitution Principle
**Subtypes must be usable anywhere their base type is expected, without surprises.**
- Smell: an override that throws `NotSupportedException`; a subclass that tightens preconditions or weakens postconditions; `if (x instanceof Subtype)` checks scattered around.
- Fix: rethink the hierarchy. If a `Square` can't behave as a `Rectangle`, don't inherit — compose, or extract a shared interface both satisfy honestly.
- Check: "Can I pass this subtype to any function taking the base type and get correct behavior?" No = violation.

## I — Interface Segregation Principle
**No client should be forced to depend on methods it doesn't use.**
- Smell: a fat interface where implementers stub out half the methods; clients importing a huge interface to call one method.
- Fix: split into small, role-based interfaces (`Readable`, `Writable` instead of `Storage` with 12 methods). Clients depend only on what they call.
- Check: "Does every implementer meaningfully implement every method?" Empty stubs = violation.

## D — Dependency Inversion Principle
**Depend on abstractions, not concretions. High-level policy shouldn't depend on low-level detail.**
- Smell: business logic that `new`s a concrete `MySQLClient` or `StripeGateway` directly; hard to test because you can't substitute a fake.
- Fix: depend on an interface, inject the concrete implementation (constructor injection / DI container). Business logic knows `PaymentGateway`, not `Stripe`.
- Check: "Can I unit-test this class by passing in test doubles?" If not, it depends on concretions.

## Review output format
When reviewing, cite: `file:line` → principle → concrete failure → suggested fix. Example:
> `order_service.py:42` — **SRP**: `OrderService.checkout()` also renders the HTML receipt. Extract `ReceiptRenderer`; checkout should return data, not markup.

## Balance
SOLID serves maintainability, not the reverse. Don't create six interfaces and a factory for a two-line script. Apply proportionally to the code's expected lifespan and rate of change.

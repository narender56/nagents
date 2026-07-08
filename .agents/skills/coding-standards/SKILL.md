---
name: coding-standards
description: General code quality conventions — naming, functions, error handling, comments, and testing. Use while writing any code and when reviewing for readability, robustness, and test coverage. Framework- and language-agnostic baseline.
---

# Coding Standards

The baseline every piece of code is held to, regardless of stack. Match the surrounding codebase's existing conventions first; these apply where the codebase is silent.

## Naming
- Reveal intent: `elapsedDays` not `d`. A good name removes the need for a comment.
- Consistent vocabulary: one concept, one word (`fetch`/`get`/`load` — pick one per layer).
- No noise words (`data`, `info`, `manager`, `helper`) unless they carry real meaning.
- Constants for magic numbers/strings.

## Functions
- Small and single-purpose — do one thing at one level of abstraction.
- Few parameters (aim ≤ 3); bundle related args into an object.
- No hidden side effects — a function named `getUser` must not also mutate state.
- Return early to avoid deep nesting; prefer guard clauses over nested `if`.
- Command/query separation: a function either does something or returns something, not both.

## Error handling
- Fail loud, fail early. Validate inputs at boundaries.
- Never swallow errors silently (`catch {}`). Handle, wrap with context, or rethrow.
- Use the language's error type/exceptions — don't return magic error codes/`null` where an error is meant.
- Error messages state what failed and, where possible, how to fix it.
- Clean up resources deterministically (try/finally, using, defer, context managers).

## Comments
- Explain **why**, not **what** — the code says what. Comment the non-obvious decision, the workaround, the gotcha.
- Delete commented-out code; version control remembers it.
- Keep comments truthful — a stale comment is worse than none. Update them with the code.
- Public APIs get doc comments (params, returns, throws).

## Tests
- Every behavior change ships with tests. Bug fixes ship with a regression test.
- Test behavior and contracts, not implementation details — refactors shouldn't break good tests.
- Arrange–Act–Assert; one logical assertion per test.
- Cover happy path + boundaries + error paths + the empty/null case.
- Test names describe the scenario and expectation: `returns401_whenTokenExpired`.
- Tests must be deterministic — no reliance on real time, network, or ordering; inject those.

## General hygiene
- DRY, but not prematurely — duplicate twice before abstracting (rule of three).
- YAGNI — don't build for imagined future requirements.
- Keep the diff focused; unrelated cleanup goes in its own change.
- Leave code cleaner than you found it (boy-scout rule), within scope.

## Review checklist
- [ ] Names reveal intent; no magic values.
- [ ] Functions small, single-purpose, side-effect-honest.
- [ ] Errors handled explicitly and never swallowed.
- [ ] Comments explain why; none are stale; no dead code.
- [ ] Tests cover happy + edge + error paths and are deterministic.

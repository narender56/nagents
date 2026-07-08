# QA Report — TASK-<id>

**Tester:** qa-engineer · **Date:** <YYYY-MM-DD> · **Build/commit:** <ref>

## Acceptance criteria verification
| AC | Test (automated/manual) | Result | Evidence |
|----|-------------------------|--------|----------|
| AC-001.1 | `npm test -- checkout` | PASS | <output / observed behavior> |
| AC-001.2 | manual: <steps> | FAIL | expected X, got Y |

## Edge & negative cases probed
- <empty input / boundary / error / permission> → result

## Defects
### DEF-1 — <title> · Severity: <Critical/High/Medium/Low>
- **Repro:** <exact steps>
- **Expected:** <…>  · **Actual:** <…>
- **Against:** developer | product-owner (if criterion is untestable)

## Verdict
- [ ] **PASS** — all acceptance criteria met → task Done
- [ ] **FAIL** — defects above → back to developer

# nagents — Orchestrator Guide

**nagents** is a reusable software-engineering team of Codex subagents + skills. It doesn't assume a tech stack — it *discovers the platform, agrees a stack with the user, gets the team familiar with that stack, then builds*. You (the main session) are the **Orchestrator**: you route work through the role agents and enforce the gates. You don't write feature code yourself.

## The team (subagents in `.codex/agents/`)
1. **solution-architect** — SENIOR. Discovery → proposes/agrees the stack → generates the stack profile → onboards the team → confirms readiness.
2. **product-owner** — idea → PRD + user stories + acceptance criteria (`.nagents/prd.md`)
3. **scrum-master** — PRD → backlog + task files (`.nagents/backlog.md`, `.nagents/tasks/`)
4. **developer** — one task → implementation (applies stack profile + generic skills)
5. **code-reviewer** — reviews the diff against stack profile + generic skills (`.nagents/review.md`)
6. **qa-engineer** — verifies against acceptance criteria (`.nagents/qa-report.md`)

## Skills (canonical pack in `.claude/skills/`)
- **team-memory** — the shared-memory + conflict-avoidance protocol. EVERY agent follows it.
- **stack-profile** — the *chosen stack's* conventions. Generated per project by the architect. Empty until a stack is agreed. Loaded first by developer + reviewer; it wins over generic examples.
- Generic quality bar: **solid-principles · design-patterns · atomic-design · component-structure · coding-standards**.

## Shared memory & conflict-free execution
The team shares one brain on disk: `.nagents/memory/` — `project-memory.md` (conventions, glossary, gotchas), `decisions.md` (append-only ADR log), `state.md` (live task board + **file ownership locks**). The full protocol is the **team-memory** skill. As orchestrator you enforce:
- **Read before act:** every agent reads shared memory at the start of its turn.
- **Append, never overwrite:** entries are stamped `[date · agent]`; wrong info is *superseded*, not edited — so concurrent writes don't collide.
- **One writer per file:** a developer must *claim* files in `state.md` before editing and *release* them on handoff. Never dispatch a task whose files are claimed by another active task.
- **Sequential by default:** run one task fully (dev → review → QA) before the next — this alone makes file conflicts impossible. Only run tasks **in parallel** when the scrum-master has marked their file sets as disjoint, and then give each developer its own git **worktree** (`isolation: 'worktree'`).

## The full flow
```
IDEA
 └─▶ solution-architect + product-owner: DISCOVERY   → .nagents/discovery.md
        (asks user: mobile? web? desktop? other? + constraints)
 └─▶ solution-architect: PROPOSE STACK (2 options + rec) → .nagents/stack-decision.md
        └─▶ USER: accept / pick alternative / bring own stack   ⟵ human decision point
 └─▶ solution-architect: GENERATE STACK PROFILE (research best practices)
        → .claude/skills/stack-profile/{SKILL.md, references/*.md}
 └─▶ solution-architect: ONBOARD + READINESS CHECK   → .nagents/readiness.md
        └─ only proceed when READY
 └─▶ product-owner: PRD  → scrum-master: BACKLOG
 └─▶ per task:  developer → code-reviewer → qa-engineer → Done
                   ▲            │              │
                   └── changes ─┘              │
                   └─────────── defects ───────┘
```

## How you orchestrate
1. **New idea →** delegate to **solution-architect** for discovery. It (with the PO) asks the user the platform + constraint questions and writes `.nagents/discovery.md`.
2. **Stack →** architect writes `.nagents/stack-decision.md` with options + a recommendation, then **you present it to the user and wait**. The user accepts, picks the alternative, or supplies their own stack.
3. **Training →** architect researches and fills `.claude/skills/stack-profile/` for the agreed stack, then writes `.nagents/readiness.md`. Do not start building until readiness is **READY**.
4. **Product & plan →** delegate to **product-owner** (PRD), then **scrum-master** (backlog + tasks).
5. **Build loop →** for each task in `.nagents/backlog.md`: **developer** → **code-reviewer** (CHANGES REQUESTED loops back to developer) → **qa-engineer** (FAIL loops back to developer) → mark Done.

## Rules of engagement
- **Never skip the human decision point on the stack.** The user can always override the architect's recommendation — comply with their choice.
- Don't start implementation before the stack profile exists and readiness is green — that's what "the team gets familiar" means here.
- Respect role boundaries: architect owns *system/stack*, PO owns *what*, developer owns *task-level how*, reviewer/QA gate quality.
- `.nagents/` is the single source of truth. Copy templates from `.nagents/templates/` for new artifacts.
- For a hands-off run outside Claude Code, use `node orchestrator/run.mjs`. For Claude Code, use the workflow `.claude/workflows/nagents-pipeline.js`.

## Reusing across products
Every new product re-runs discovery → stack → profile, so the *same* six agents adapt to any stack. To reuse in another repo, copy `.claude/`, `.codex/`, and `.nagents/templates/` as needed, or package as a plugin. The `stack-profile` skill is regenerated per project — that's the adaptation mechanism.

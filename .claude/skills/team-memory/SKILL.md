---
name: team-memory
description: The shared-memory and coordination protocol for the nagents team. Load this in EVERY agent before acting. Defines how agents share knowledge via .nagents/memory/ and how they avoid conflicting when editing files (read-before-act, append-only writes, claim-before-edit). Use whenever an agent starts a turn or is about to write code or memory.
---

# Team Memory & Coordination Protocol

Subagents each run in their own context — the **only thing they share is the filesystem**. So "team memory" is a set of shared files, and "not conflicting" is a discipline. Every agent follows this protocol, every turn.

## The shared memory lives in `.nagents/memory/`
| File | Purpose | Who writes |
|------|---------|-----------|
| `project-memory.md` | Durable team brain: conventions, glossary, key facts, gotchas | all (append) |
| `decisions.md` | Append-only decision log (ADR-style) — why choices were made | architect, PO, devs |
| `state.md` | Live coordination board: task status + **file ownership / locks** | scrum-master + devs |

## Rule 1 — Read before you act
At the **start of every turn**, read `project-memory.md` and `state.md` (and `decisions.md` if you're making or reviewing a design choice). Never start work blind — someone may have recorded a convention, a decision, or a claim that changes what you do.

## Rule 2 — Append, never overwrite
Shared memory is **append-only**. Never edit or delete another agent's entry.
- Add entries with a stamp: `- [<date> · <agent>] <content>`.
- Wrong or outdated? Don't rewrite it — append a **superseding** entry that references the old one (`Supersedes ADR-003:` …). History stays intact; the latest entry wins.
- This makes concurrent writes safe: two agents appending different lines don't collide the way two agents rewriting the same paragraph would.

## Rule 3 — Claim before you edit (the anti-conflict lock)
Only ONE agent may edit a given source file at a time. Before a developer touches any code file:
1. Read the **File ownership** table in `state.md`.
2. If a file you need is **claimed by another active task**, STOP. Do not edit it. Report the conflict to the orchestrator so the tasks are serialized.
3. If it's free, **claim it**: append a row `| <path> | TASK-### | <agent> | claimed | <date> |`.
4. When you hand off (dev → review), **release** your claims: set status to `released`.

Reviewers and QA read code but do not edit it, so they never claim.

## Rule 4 — Record decisions others must respect
When you make a choice that constrains future work (a convention, a library, an architecture boundary, a naming rule), write it to `decisions.md` **and** the relevant section of `project-memory.md`. That's how the next agent avoids re-litigating or contradicting it.

## Rule 5 — One source of truth per fact
Don't duplicate a fact across files. Conventions → `project-memory.md`. Decisions & rationale → `decisions.md`. Live who-owns-what → `state.md`. Deliverables (PRD, backlog, code) stay in their own artifacts.

## Execution strategy (for the orchestrator)
- **Default: sequential build.** Run one task fully (dev → review → QA) before starting the next. With one writer at a time, file conflicts are impossible.
- **Parallel only for disjoint tasks.** Two tasks may run at once *only if their claimed file sets don't overlap* (check `state.md`). Run each such developer in its own git **worktree** (`isolation: 'worktree'`) so their edits are physically isolated, then integrate.
- Tasks with a `Depends on:` relationship are always sequential.

## Quick checklist (every turn)
- [ ] Read `project-memory.md` + `state.md` first.
- [ ] About to edit code? Claimed the files in `state.md`, and no one else owns them.
- [ ] Made a lasting decision? Appended it to `decisions.md` + `project-memory.md`.
- [ ] Writing memory? Appended with `[date · agent]`, didn't overwrite anyone.
- [ ] Handing off? Released my file claims.

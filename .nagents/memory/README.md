# `.nagents/memory/` — shared team memory

This is the team's common brain and coordination board. Every agent reads it before acting and appends to it (never overwrites). It's how six independent subagents stay consistent and avoid stepping on each other. The protocol is defined in the **team-memory** skill.

| File | What it holds |
|------|---------------|
| `project-memory.md` | Durable conventions, glossary, key facts, gotchas |
| `decisions.md` | Append-only decision log (ADR-style) with rationale |
| `state.md` | Live task board + **file ownership / locks** (the anti-conflict ledger) |

## Rules (summary)
1. **Read before you act** — start every turn here.
2. **Append, never overwrite** — stamp entries `[date · agent]`; supersede, don't rewrite.
3. **Claim before you edit** — record file ownership in `state.md`; one writer per file.
4. **Record decisions** others must respect in `decisions.md`.

## Version control
These files are generated per project. Only this README and the `templates/` copies are committed; the working memory is git-ignored (it belongs to *your* project, not the framework).

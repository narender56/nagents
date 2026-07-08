# Coordination Board — <project name>

> Live shared state. The scrum-master seeds the task board; developers update status and **claim files before editing**. Read this before you touch any code.

## Task board
| Task | Status | Owner (agent) | Notes |
|------|--------|---------------|-------|
| TASK-001 | Todo / In progress / In review / In QA / Done / Blocked | — | |
| TASK-002 | Todo | — | Depends on TASK-001 |

## File ownership (the lock table)
> One writer per file. Claim before editing; release on handoff. If a file you need is `claimed` by another **active** task, STOP and ask the orchestrator to serialize.

| File / path | Task | Agent | Status | Since |
|-------------|------|-------|--------|-------|
| <src/...> | TASK-### | developer | claimed / released | <date> |

## Active work (who's doing what right now)
- [<date> · <agent>] working on TASK-### — files: <list>

## Serialization notes
_Record any tasks that must NOT run in parallel because their file sets overlap._
- TASK-002 and TASK-004 both touch `src/api/client.ts` → run sequentially.

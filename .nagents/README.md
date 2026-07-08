# `.nagents/` — runtime artifacts

This folder is the **single source of truth** for a run of the team. The agents read the previous artifact and write the next one here, so the whole pipeline is inspectable and resumable.

| File | Written by | Contents |
|------|-----------|----------|
| `discovery.md` | solution-architect + product-owner | target platform + constraints |
| `stack-decision.md` | solution-architect | proposed/agreed tech stack + architecture |
| `readiness.md` | solution-architect | onboarding / "team is ready" checklist |
| `prd.md` | product-owner | user stories + acceptance criteria |
| `backlog.md` | scrum-master | ordered, estimated task list |
| `tasks/TASK-*.md` | scrum-master → all | one file per task, with a handoff log |
| `review.md` | code-reviewer | findings per review round |
| `qa-report.md` | qa-engineer | acceptance verification + defects |

## Version control
Everything here **except `templates/` and this README is git-ignored** — generated artifacts belong to *your* project, not the framework. The `templates/` folder defines the format each agent writes into and IS committed.

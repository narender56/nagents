# Contributing to nagents

Thanks for helping build nagents! This project is prompts and structure, not a compiled app — which makes it unusually easy to contribute to. You don't need to be a Claude Code expert.

## Ways to contribute

- **New stack profiles** — a `references/<stack>.md` capturing a stack's best practices (React, Angular/NestJS, Flutter, Go, Rust, …). Highest-value contribution.
- **Sharper skills** — better smell→fix examples in the generic skills (`.claude/skills/`).
- **New/upgraded agents** — improvements to a role's prompt, or a new role (e.g. a `security-reviewer`).
- **Example runs** — a real idea taken through the pipeline, checked into `examples/`.
- **Docs & bug reports** — clarity fixes, broken instructions, typos.

## Project structure (what lives where)

| Path | What it is |
|------|-----------|
| `.claude/agents/*.md` | One role per file. Front-matter (`name`, `description`, `tools`, `model`) + a system prompt. |
| `.claude/skills/*/SKILL.md` | One skill per folder. Front-matter (`name`, `description`) + the knowledge. |
| `.claude/workflows/*.js` | Deterministic orchestration scripts for the Workflow tool. |
| `.nagents/templates/*.md` | The artifact formats agents write into. |
| `.claude-plugin/` | Plugin + marketplace manifests. |

## Authoring guidelines

**Agents**
- Front-matter `description` must say *when to use* the agent — it's how the orchestrator routes.
- Keep each agent to a single clear responsibility and explicit handoffs.
- Grant the **minimum tools** the role needs (e.g. reviewers don't need `Write`).

**Skills**
- The `description` is a triggering signal — make it specific.
- Prefer concrete **smell → fix** examples over abstract prose. Show, don't lecture.
- Stack profiles: pin versions, cite official docs, cover structure · idioms · do/don't · testing · pitfalls.

**Style**
- Markdown, wrapped sensibly. American English. No secrets or personal data in examples.

## Development workflow

1. Fork and branch: `git checkout -b feat/<short-name>`.
2. Make your change.
3. **Validate**: `node scripts/validate.mjs` (CI runs this too).
4. If you added an agent or skill, add a line to the README table and `CHANGELOG.md` (Unreleased).
5. Open a PR using the template. Describe the motivation and, for behavior changes, a before/after.

## Testing a change locally

Open Claude Code in the repo and exercise the affected role directly, e.g.:

> "Act as the code-reviewer on this sample diff: …"

For workflow changes: `node --check .claude/workflows/nagents-pipeline.js`, then run it via the Workflow tool with a small idea.

## Commit messages

Use clear, imperative messages. [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`) are appreciated but not required.

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).

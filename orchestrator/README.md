# Tool-agnostic orchestrator

Run the nagents pipeline on **any coding-agent CLI** — not just Claude Code. Same roles, same skills, same memory protocol, same gates; only the engine underneath changes.

## Why this exists
Claude Code can natively fan out subagents and run the `.claude/workflows/*.js` Workflow. Most other tools (OpenAI Codex, Gemini CLI, Aider) are **single-agent** — they have no built-in way to orchestrate six roles with handoffs. This runner *is* that missing orchestration engine, written as a plain Node script.

It stays engine-agnostic because everything nagents needs is portable:
- **Roles + skills are markdown** → the runner inlines them into each prompt (other tools can't auto-load skills the way Claude Code does).
- **Memory + artifacts are files** in `.nagents/` → every tool reads/writes them identically.
- **Execution is sequential** → one writer at a time, so the no-conflict guarantee holds on every engine.

## Requirements
- Node.js 18+
- One agent CLI on your PATH: `claude`, `codex`, `gemini`, or `aider`.

## Usage
Run from the project you want built (usually this repo, or copy `.claude/` + `.nagents/` into your project):

```bash
# OpenAI Codex
node orchestrator/run.mjs --engine codex --idea "a habit-tracking app" --platform mobile

# Claude Code (headless)
node orchestrator/run.mjs --engine claude --idea "..." --stack "Flutter + Firebase"

# Gemini CLI
node orchestrator/run.mjs --engine gemini --idea "..."

# Resume at a later phase (artifacts already on disk)
node orchestrator/run.mjs --engine codex --from build

# Inspect the exact prompts without calling any CLI
node orchestrator/run.mjs --engine echo --idea "x" --dry-run
```

### Flags
| Flag | Meaning |
|------|---------|
| `--engine <name>` | Engine key from `engines.json` (default `claude`) |
| `--idea "<text>"` | The product idea (required unless resuming past discovery) |
| `--platform <p>` | Target-platform hint |
| `--stack "<s>"` | Pre-chosen stack; skips the proposal |
| `--from <phase>` | Start at `discovery\|stack\|training\|prd\|backlog\|build` |
| `--max-rework <n>` | Dev↔review rounds before giving up (default 3) |
| `--dry-run` | Compose and print prompts without invoking the engine |

## Adding / tuning an engine
Edit [`engines.json`](engines.json). Each engine is a command template; `{PROMPT}` is replaced with the composed role prompt. Flags differ across CLI versions — adjust to match yours:

```json
"codex": { "cmd": "codex", "args": ["exec", "--full-auto", "{PROMPT}"], "promptVia": "arg" }
```
`promptVia` is `"arg"` (prompt passed as an argument) or `"stdin"` (piped in).

## How gates work across engines
Claude's native Workflow reads structured verdicts. Here, the runner asks each gate role to **end its reply with `VERDICT: APPROVED` / `CHANGES_REQUESTED` / `PASS` / `FAIL`** and greps that from stdout. If an engine doesn't print a clean final message (e.g. Aider, which mainly edits files), gate detection is best-effort — prefer `claude`/`codex`/`gemini` for the review/QA roles.

## Known limits (honest)
- **Interactive stack decision** can't pause a headless run — pass `--stack` to decide up front, or let the architect pick its recommendation automatically.
- **Verdict parsing is text-based**, so it depends on the engine following the "end with VERDICT:" instruction.
- **Quality varies by model** — the orchestration is identical, but a weaker underlying model produces weaker code. The runner coordinates; it doesn't compensate.
- **Parallelism** isn't enabled here (sequential is the safe default). The Claude-native Workflow is where worktree-based parallelism lives.

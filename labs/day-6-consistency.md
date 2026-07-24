# Day 6 Lab — Module 2.F: CLAUDE.md, Skills & Consistency

**Time:** ~120 minutes hands-on · **Branch:** `day-6/<you>` (from `upstream/main`, the ideal Day-5 app) · **Track:** stay in the one you picked — `dotnet/` **or** `javascript/`

**What you leave with:** FleetLink's consistency toolkit — a grown `CLAUDE.md` backed by `docs/standards.md`, a **`new-endpoint`** skill, a **`/standards-check`** command, a deterministic **guardrail hook** that blocks secrets before they land, and a **`standards-reviewer`** subagent. The shift: consistency is **constrained up front**, not reviewed and fixed after.

> **The through-line:** five instruments, one job. `CLAUDE.md` = the always-on rules · a **skill** = a repeatable procedure · a **command** = a saved prompt · a **hook** = a deterministic guarantee · a **subagent** = an isolated big job. You build all five on FleetLink today.

---

## The map (keep this in view all lab)

```
rule that's always true      → CLAUDE.md          (+ docs/standards.md for the detail)
repeatable procedure         → skill              (.claude/skills/new-endpoint)
a prompt you run often       → slash command      (.claude/commands/standards-check)
a must-never / must-always   → hook               (.claude/settings.json + .claude/hooks/guard.mjs)
a big isolated job           → subagent           (.claude/agents/standards-reviewer)
```

**The one habit you build today:** when you notice yourself re-explaining a standard to Claude, stop and *encode it* — in the right instrument — so nobody has to explain it again.

---

## 0. Setup — branch from the Day-5 ideal, prove sign-in (10 min)

1. **Start from the ideal Day-5 app.**
   ```bash
   git fetch upstream
   git checkout -b day-6/<your-name> upstream/main
   ```
   *(Fresh machine? Clone your fork first: `git clone https://github.com/<your-name>/fleet-link-claude-level-2.git fleetlink && cd fleetlink && git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git`)*

2. **Launch Claude Code from the repo root** so it reads the project `CLAUDE.md` and both tracks:
   ```bash
   claude
   ```
   > "You are in the FleetLink repo. No changes yet: in a few lines, tell me what the current root `CLAUDE.md` already says, where the track `CLAUDE.md` files are, and whether there are any `.claude/` skills, commands, hooks or agents today. Just report."

**Checkpoint 0 — commit:** `git commit --allow-empty -m "Day 6: started day-6 branch, Claude Code signed in"`

---

## Part A — Grow CLAUDE.md into a standards instrument (25 min)

The root `CLAUDE.md` you first wrote in 2.B is thin. Grow it into the always-on standard, and put the depth in a `docs/standards.md` so `CLAUDE.md` stays short.

**Prompt (author the standard):**
> "Grow the root `CLAUDE.md` into a tight standards instrument and create `docs/standards.md` for the detail. In `CLAUDE.md` keep only the always-on rules — naming (FSD-exact), layering (business rule in the service citing `// FSD §5.x`, thin routes), the one error shape `{ error, code }` with the FSD status codes, logging (outcome + code, never payload/PII), DTOs at the edge, string enums, and UI styling from the design tokens — and link to `docs/standards.md`. In `docs/standards.md` write each rule with an **approved example AND the named anti-pattern**, for both tracks, plus the guardrails (no real data, PII, secrets, connection strings). Keep `CLAUDE.md` under ~120 lines. Show me the diff."

**Prompt (make the track files agree):**
> "Update `dotnet/CLAUDE.md` and `javascript/CLAUDE.md` so their build-stage note reads Module 2.F — Consistency and points at the root standards + `docs/standards.md`. Keep them short. Show me the diff."

**Checkpoint A — acceptance:**
- `CLAUDE.md` is short and readable, and links to `docs/standards.md`.
- `docs/standards.md` covers naming, layering, errors, logging, reusable patterns, branding, guardrails — each with an approved example **and** an anti-pattern.
- Commit: `git commit -am "Day 6 (2.F): grow CLAUDE.md into a standards instrument + docs/standards.md"`

---

## Part B — Package a skill: `new-endpoint` (25 min)

The right way to add a domain endpoint should not live in one person's head. Package it once.

**Prompt (build the skill):**
> "Create a skill at `.claude/skills/new-endpoint/SKILL.md` that captures the approved way to add a **domain** endpoint to FleetLink — the 2.D pattern. Its procedure: read `CLAUDE.md` + `docs/standards.md` + the closest existing endpoint first; put the DTO at the edge, the business rule in the service with a `// FSD §5.x` comment, a thin route/endpoint returning the FSD status codes, validation on the way in, and a test per rule; then show the diff and stop for review. Give it a `description` that says use it for domain endpoints and to use `add-slice` for non-domain probes. Show me the file."

**Prove it works — add a small endpoint *with* the skill:**
> "Use the `new-endpoint` skill to add `GET /api/work-orders/{id}/parts` — return the parts on a work order as DTOs (404 if the work order doesn't exist). Follow the skill exactly: DTO/mapper, a thin read in the service, a thin route/endpoint, a test. Show me the diff and how to run it. Don't commit."

**Checkpoint B — acceptance:**
- The skill exists and Claude invoked it (the new endpoint follows the layered pattern, rule/read in the service, thin route, a passing test).
- `npm test` / `dotnet test` still green.
- Commit: `git commit -am "Day 6 (2.F): new-endpoint skill + a work-order parts read built with it"`

---

## Part C — Save a prompt: the `/standards-check` command (15 min)

Turn "review this against our standards" into one shared command.

**Prompt (build the command):**
> "Create a slash command at `.claude/commands/standards-check.md` that reviews changes against `CLAUDE.md` + `docs/standards.md` and reports drift — read-only, no fixes. Scope from `$ARGUMENTS`: empty = uncommitted diff, `staged` = staged diff, `branch` = vs `main`, or a path. Check layering, error shape, status codes, naming, string-enums, DTOs, and that each rule cites its FSD §. Output grouped as Must fix / Should fix / OK with file, line and a one-line fix, then a verdict. Add `description`, `argument-hint` and `allowed-tools` frontmatter. Show me the file."

**Run it on your own change:**
```
/standards-check
```

**Checkpoint C — acceptance:**
- `/standards-check` appears and runs, and reports on your uncommitted changes with a verdict.
- Commit: `git commit -am "Day 6 (2.F): /standards-check command"`

---

## Part D — Make it a guarantee: the guardrail hook (20 min)

Instructions steer; a hook enforces. Wire a `PreToolUse` hook that blocks a secret or connection string on **every** write.

**Prompt (build the hook):**
> "Add a deterministic guardrail. Create `.claude/hooks/guard.mjs` (Node, so it runs on Windows too) that reads the hook JSON on stdin, looks at the text being written (`tool_input.content` for Write, `tool_input.new_string` for Edit, `edits[]` for MultiEdit), and if it finds a private key, an AWS/GitHub/Slack token, a `db://user:pass@` or SQL connection string with a password, or a hard-coded secret literal (allowing obvious placeholders / env vars), writes a clear reason to stderr and exits 2 to block it; otherwise exit 0. Then register it in `.claude/settings.json` as a `PreToolUse` hook matching `Edit|Write|MultiEdit`. Show me both files."

**Prove it blocks — then prove it allows:**
```bash
echo '{"tool_input":{"content":"var cs=\"Server=db;Database=fl;User Id=sa;Password=Hunter2xx;\";"}}' | node .claude/hooks/guard.mjs ; echo "exit=$?"   # expect a BLOCK message + exit 2
echo '{"tool_input":{"new_string":"export function total(p){return p.reduce((s,x)=>s+x.cost,0);}"}}' | node .claude/hooks/guard.mjs ; echo "exit=$?"   # expect exit 0
```
Then, in Claude Code, ask it to write a fake connection string into a file and watch the hook refuse:
> "Add a line to a scratch file `tmp/config.txt` that sets a SQL Server connection string with a password. (Expect the guardrail to block it.)"

**Checkpoint D — acceptance:**
- The CLI test **blocks** the secret (exit 2) and **allows** the clean code (exit 0).
- In-session, the hook stops Claude from writing the connection string and Claude reports why.
- Commit: `git commit -am "Day 6 (2.F): guardrail hook — blocks secrets/connection strings on every write"`

---

## Part E — Hand off a big job: the `standards-reviewer` subagent (15 min)

For a whole-layer or whole-branch review, use a fresh agent with its own context.

**Prompt (build the subagent):**
> "Create a subagent at `.claude/agents/standards-reviewer.md` — a **read-only** reviewer that audits a set of files against `CLAUDE.md` + `docs/standards.md` (layering, error shape, status codes, naming, string-enums, FSD-§ comments, guardrails) and returns a report grouped Must fix / Should fix / OK with a per-file verdict. Tools: Read, Grep, Glob, Bash (read-only). It never edits. Show me the file."

**Run it on a layer:**
> "Use the `standards-reviewer` subagent to review my track's `services/` layer against the standards and give me its report."

**Checkpoint E — acceptance:**
- The subagent exists and returns a grouped report with a verdict; it made no edits.
- Commit: `git commit -am "Day 6 (2.F): standards-reviewer subagent"`

---

## Part F — Bank the stage and push (10 min)

**Prompt (record the stage):**
> "Set `/api/meta` `buildStage` to `2.F — Consistency` and `version` to `0.6.0` on my track, and update the meta test if there is one. Show me the diff."

```bash
# run the app + tests to confirm green
npm start        # or: dotnet run --project src/FleetLink.Api   → GET /api/meta shows 2.F — Consistency
npm test         # or: dotnet test
git commit -am "Day 6 (2.F): record build stage 2.F — Consistency"
git push -u origin day-6/<your-name>
```

**Final acceptance — thumbs up on each:** grown `CLAUDE.md` + `docs/standards.md`; a working `new-endpoint` skill (you used it); a `/standards-check` command; a guardrail hook that blocks a test secret and allows clean code; a `standards-reviewer` subagent; app + tests green with `buildStage` `2.F — Consistency`; branch pushed.

---

## What you built (why it matters)

You moved consistency from *review-and-fix-later* to *constrained-up-front*. A new teammate who clones this repo inherits the standard, the recipe, the guardrail and the reviewer automatically — so their first generation is consistent on day one, and review time goes to design, not nitpicks. Tomorrow (2.G / 2.H) this same repo carries multi-team hand-offs and root-cause debugging.

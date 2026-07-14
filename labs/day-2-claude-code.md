# Day 2 Lab — Module 2.B: Spec-Driven Development

**Time:** ~120 minutes hands-on · **Branch:** `day-2/<you>` (from `upstream/main`, the shared ideal reference) · **Track:** stay in the one you picked — `dotnet/` **or** `javascript/`

**What you leave with:** a **build plan** for FleetLink that you derived from the FSD and confirmed yourself; the running project **scaffolded** — a layered structure and a sharper `CLAUDE.md` — with one thin, non-domain **`GET /api/meta`** slice that proves the frame runs; and your first **Claude Code skill** (`add-slice`) that captures the slice pattern so the team stays consistent — everything traceable to the spec, all reviewed, committed and pushed.

> Today is not "how to drive Claude Code" — you did that in Level 1. Today is the **method** you wrap around the tool to build a whole system: **spec-driven development.** Three parts. **Part A** turns the FSD into a build plan you confirm. **Part B** executes the plan's first step — scaffold the frame and prove one slice. **Part C** captures the slice procedure as a reusable **skill**. Everything traces back to the spec. You do **not** build FleetLink's entities or business rules today — those are designed deliberately from the same spec in **2.C tomorrow**.

---

## 0. Setup — branch, launch, prove sign-in (15 min)

1. **Start from the shared ideal reference — not your own Day-1 branch.** Every day begins from the same
   correct baseline on `upstream/main` (the facilitator's ideal build so far), so a missed step never
   cascades. Fetch it and branch today's work from it:
   ```bash
   git fetch upstream
   git checkout -b day-2/<your-name> upstream/main
   ```
   *(On a fresh machine? Clone your fork first: `git clone https://github.com/<your-name>/fleet-link-claude-level-2.git fleetlink && cd fleetlink && git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git`)*

   > You're starting from the **ideal completion of Day 1**, whatever happened in your own Day-1 session.
   > Take a moment to look at the baseline you're building on — then add today's layer on top.
2. **Confirm Claude Code is installed** (it is pre-installed on your VM). If you are setting it up on a real machine later, see [Windows install](#appendix--windows-install--login-hand-out).
   ```bash
   claude --version
   ```
3. **Launch Claude Code from the repo root** — not inside `dotnet/` or `javascript/` — so it reads the root `CLAUDE.md` and can see `docs/` and both tracks:
   ```bash
   claude
   ```
4. **Prove sign-in works before you rely on it.** Give it one throwaway prompt and confirm you get a normal reply:
   > "You are running inside the FleetLink repo. In one sentence, tell me what this project is, based on the files you can see."

   If that answers sensibly, you are signed in and good to go. If it errors or asks you to log in, sort that out **now** — calmly, at minute one — before the build depends on it.

**Checkpoint 0 — commit:** `git commit --allow-empty -m "Day 2: started day-2 branch, Claude Code signed in"`

---

## Part A — Plan from the FSD (35 min)

The work comes from the **spec**, not from ad-hoc prompts. So before any code, you turn the FSD into a **build plan** — the vertical slices to build, in order, with the human checkpoints — and you confirm it against the spec. **Plan first; the plan is the deliverable.**

### A1. Understand the spec (10 min)

**Prompt to start from:**
> "Read `docs/FSD-FleetLink.md`. In plain language, summarise what FleetLink is, who uses it, and the parts of the spec that will be hardest to build correctly. Do **not** write code or a plan yet — just show me you understand the spec, and ask me anything it leaves ambiguous."

**Do:** read its summary against the FSD. Where is it exactly right? Where did it add something the spec never says (an entity, a field, a rule)? Note one such "helpful hallucination" — catching it is the skill, and it's the same one you used on the entity list yesterday.

**Checkpoint A1 — commit** (an empty commit is fine; the real artifact comes next).

### A2. Turn the spec into a build plan, then confirm it (25 min)

**Prompt to start from:**
> "From `docs/FSD-FleetLink.md` and `docs/build-sequence.md`, draft a **build plan** for FleetLink as an ordered list of **vertical slices** — from the non-domain frame slices, through the read endpoints, to the write endpoints with business rules. For each slice give: what it builds, which FSD section/rule it satisfies, and the **human checkpoint** before it. Note which module (2.B–2.I) each slice belongs to. This is a **draft for me to confirm** — do not write any code."

**Do:**
- **Confirm the plan against the spec.** Does it cover the FSD's endpoints (§6) and rules (§5)? Is the order database-first, matching yesterday's decision? Did it invent a slice the spec never asked for? Reorder, cut, add until you'd put your name on it.
- Compare it to [`docs/build-sequence.md`](../docs/build-sequence.md) — they should broadly agree, which is a good sign the method isn't arbitrary.

**Deliverable:** save your confirmed plan as **`day2/plan.md`** — in your own words, the slices in order with checkpoints, and a one-line note on anything you cut because the spec didn't ask for it.

**Acceptance:** `day2/plan.md` exists, is yours (not raw Claude output), the order is database-first, and every slice traces to the FSD.

**Checkpoint A2 — commit:** `git commit -am "Day 2 (2.B): confirmed spec-to-build plan (day2/plan.md)"`

> **What you just practised:** read the spec → draft a plan → confirm it against the spec. That's the plan-first workflow you'll run at the start of every build from here on.

---

## Part B — Execute step one: scaffold + prove a slice (40 min)

Now execute the **first step of the plan you just confirmed**: stand up the frame the later slices fill, lock the conventions, and prove the frame with one thin slice. **Structure and standards first; then one slice — the smallest thing that runs end to end.**

### B1. Scaffold the layered structure (10 min)

**Prompt to start from:**
> "Read `<track>/build.md` section 'Module 2.B — scaffold' and the two `CLAUDE.md` files. Create **only** the empty layered folders that section lists for my track (models, data, services, endpoints/routes), each with a short `README.md` (or `.gitkeep`) naming what it will hold and which module fills it. **Do not** create any FleetLink entity, seed data, DTO or business rule — those are Module 2.C. Show me the diff."

**Do:** review the diff — yes, even scaffolding. Confirm it created folders only, no domain code. Commit.

**Checkpoint B1 — commit:** `git commit -am "Day 2 (2.B): greenfield — scaffold layer folders"`

### B2. Sharpen CLAUDE.md — conventions before code (10 min)

**Prompt to start from:**
> "Based on the conventions in the root and track `CLAUDE.md` and our Day-1 decisions, propose a short 'Project layout & build stage' section to add to the **track** `CLAUDE.md` that (1) records the folder layout we just scaffolded, (2) states the current build stage is '2.B — scaffold; domain arrives in 2.C', and (3) restates the layering and error-shape rules in one place. Keep it tight. Show me the diff."

**Do:** apply only the additions you actually believe in — keep it lean, you grow `CLAUDE.md` properly in 2.F. Commit.

**Checkpoint B2 — commit.**

### B3. Build the `GET /api/meta` slice (20 min)

One thin, **non-domain** vertical slice through the layers you just scaffolded — route/endpoint → service → response — to prove the frame is wired correctly. No business data.

**Prompt to start from:**
> "Build a single non-domain vertical slice: `GET /api/meta`. It must go through the proper layers for my track (a `metaService` in `services/`, and an endpoint or route in `endpoints/` or `routes/`), and return exactly:
> `{ "app": "FleetLink", "track": "<dotnet|javascript>", "version": "0.2.0", "buildStage": "2.B — scaffold", "plannedEntities": ["Depot","Vehicle","Driver","Part","WorkOrder","WorkOrderPart"] }`
> `plannedEntities` is a static list — do **not** create any of those entities. Wire it up in the app entry point, follow both `CLAUDE.md` files, and show me the diff and how to run it."

**Do:**
- Read the diff. Confirm the business rule count is **zero** — this slice has no logic, it just proves the layering.
- Run and hit the endpoint:
  - **.NET:** `dotnet run --project src/FleetLink.Api` → open `http://localhost:5080/api/meta`
  - **JavaScript:** `npm start` → open `http://localhost:5080/api/meta`; `npm test` still green.

**Acceptance:** `/api/meta` returns the JSON above through a service layer; `/health` still works; no FleetLink entity exists yet.

**Checkpoint B3 — commit:** `git commit -am "Day 2 (2.B): greenfield — /api/meta slice through route→service"`

---

## Part C — Capture the pattern as a skill (20 min)

You just built the `/api/meta` slice by hand. Now capture that *procedure* as a **Claude Code skill** so
anyone on the team can add a consistent slice on demand — the same way, every time — instead of
re-describing the convention. A skill is a small `SKILL.md` under `.claude/skills/`; because it lives in
the repo, **every teammate's Claude Code picks it up.** That is the whole point: consistency by
construction.

> This is a **first taste** of skills. Module **2.F** takes it much further — multiple skills, slash
> commands, hooks and subagents that *enforce* your standards. Today you make one simple skill and feel
> why it matters.

### C1. Create the skill (10 min)

**Prompt to start from:**
> "Create a Claude Code project skill at `.claude/skills/add-slice/SKILL.md` that captures the pattern we
> just used for `/api/meta`: given a route path, a slice name and a fixed non-domain response, it adds a
> new slice through the layers (a service holding no business logic, and a thin route/endpoint that calls
> it), detects my track (`dotnet`/`javascript`), follows both `CLAUDE.md` files and the `/api/meta`
> reference, and **stops at the diff for review**. It must refuse to build FSD entities or business rules
> (those are 2.C/2.D). Show me the diff."

**Do:** read the generated `SKILL.md`. Is the `description` clear about *when* to use it? Does it list the
guardrails (non-domain only, nothing invented, stop for review)? Tighten it in your own words — you own
it. Then commit.

**Checkpoint C1 — commit:** `git commit -am "Day 2 (2.B): add-slice skill — capture the slice pattern"`

### C2. Use your skill (10 min)

Restart Claude Code (so it picks up the new skill) and invoke it to add one more tiny non-domain slice —
proving the skill produces the *same layered shape* you built by hand.

**Prompt to start from:**
> "Use the add-slice skill to add `GET /api/status` returning `{ "status": "up", "track": "<mine>" }`
> through a service. Show me the diff and how to run it — don't commit."

**Do:** confirm the diff matches the `/api/meta` shape (service + thin route/endpoint, no logic in the
route). Run it, hit `/api/status`, then review and commit. That is the payoff: one instruction, a
consistent slice — and everyone on the team gets the same result.

**Acceptance:** `.claude/skills/add-slice/SKILL.md` exists; invoking it produced a `/api/status` slice in
the same layered shape; still no domain entities or rules.

**Checkpoint C2 — commit:** `git commit -am "Day 2 (2.B): use add-slice skill to add /api/status"`

---

## Done when…

- [ ] Claude Code launched from the repo root and sign-in confirmed.
- [ ] `day2/plan.md` exists, is **yours** (not raw Claude output), and every slice traces to the FSD.
- [ ] Scaffold: layer folders (folders only), `CLAUDE.md` sharpened, `/api/meta` slice runs and `/health` still green.
- [ ] Skill: `.claude/skills/add-slice/SKILL.md` exists and you used it to add a second slice (`/api/status`).
- [ ] **No** FleetLink entities, seed data or business rules were built (that's 2.C).
- [ ] You reviewed **every** diff before committing; commits say *what changed and why*.
- [ ] Your `day-2/<you>` branch is pushed.

**Push to your fork and (optionally) open a PR** — from your fork's branch against the shared repo's
`main` — so a facilitator can review your scaffold:
```bash
git push -u origin day-2/<your-name>      # origin = your fork
```

## Tomorrow (Day 3 · Module 2.C)

You branch `day-3/<you>` from `upstream/main` — which by then holds today's **ideal** scaffold — and design FleetLink's **data model** — entities, relationships and constraints — deliberately, **database-first**, straight from the FSD. The scaffold is exactly the frame that domain code slots into, and you start Day 3 from the ideal version of it, not your own.

---

## Appendix — Windows install & login (hand-out)

Install **Node.js (npm)** first, then:
```
install:   npm install -g @anthropic-ai/claude-code
find path: npm config get prefix
set PATH (PowerShell):
  [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\Users\<user>\AppData\Roaming\npm", "User")
```
Then **open a new terminal** so the PATH change takes effect, run `claude`, and sign in to your own Claude account. If `claude` "isn't found", it is almost always the new-terminal step.

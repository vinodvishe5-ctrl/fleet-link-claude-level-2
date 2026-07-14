# Day 2 Lab — Module 2.B: Claude Code Foundations (New & Existing)

**Time:** ~100 minutes hands-on · **Branch:** `day-2/<you>` (from your Day-1 branch) · **Track:** stay in the one you picked — `dotnet/` **or** `javascript/`

**What you leave with:** Claude Code installed, signed in and driven end to end; a **brownfield** change made on your own Day-1 skeleton in its existing style; a **greenfield** scaffold of FleetLink's layered structure with a sharper `CLAUDE.md`; and one thin, non-domain **`GET /api/meta`** slice that proves the frame runs — all reviewed, committed and pushed.

> Today is a **tool** day, in two halves. **Part A** onboards Claude Code onto an existing codebase — your Day-1 skeleton — the way you would onto a legacy app on a real account. **Part B** scaffolds the next layer of the running project from nothing. You do **not** build FleetLink's entities, seed data or business rules today — those are designed deliberately in **2.C tomorrow**. Hold that line.

---

## 0. Setup — branch, launch, prove sign-in (15 min)

1. **Continue from yesterday.** You already have your fork cloned as `fleetlink` from Day 1 (`origin` =
   your fork). Branch today's work from your Day-1 branch, so the project stays cumulative:
   ```bash
   git checkout day-1/<your-name>
   git checkout -b day-2/<your-name>
   ```
   *(On a fresh machine? Clone your fork first: `git clone https://github.com/<your-name>/fleet-link-claude-level-2.git fleetlink && cd fleetlink && git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git`)*
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

## Part A — Brownfield: onboard onto your Day-1 skeleton (35 min)

Your skeleton is small, but it is a **real existing codebase** — you treat it exactly the way you would treat a legacy app you have just been handed. The rule of the half: **understand before you touch.**

### A1. Map the skeleton (10 min)

**Prompt to start from:**
> "Do not change anything yet. Read my track's skeleton (`dotnet/` **or** `javascript/`, whichever I use) and explain it to me: the entry point, how the health endpoint is wired from request to response, how the app is configured, and how I run and test it. List the files involved."

**Do:** read its explanation against the actual files. Where is it exactly right? Did it add anything that isn't there? This is the same *catch-the-hallucination* habit from Day 1 — it does not go away just because the tool got more capable.

**Deliverable:** create `day2/00-skeleton-map.md` — in your own words, how the health endpoint flows end to end and where you would add a new endpoint.

**Checkpoint A1 — commit.**

### A2. Make one small, safe, conventional change (20 min)

You will add **one** tiny endpoint that mirrors the existing health pattern **exactly** — a `GET /version` (or `/health/version`) that returns the app name and a version string. It touches no business data. The point is to prove you can change this codebase safely and in its own style.

**Prompt to start from:**
> "Following the **existing pattern** used by the health endpoint — same file layout, same naming, same style — add a `GET /version` endpoint that returns `{ "app": "FleetLink", "version": "0.2.0" }`. Do not introduce new libraries, new folders, or a new way of doing things. Show me the diff before applying it, and tell me how to run and verify it."

**Do:**
- **Read the diff before you accept it.** Does it match the existing style? Does it add anything you didn't ask for? Reject or refine anything you don't understand — you own every line.
- Run your track and confirm **both** endpoints respond and health is still green:
  - **.NET:** `cd dotnet && dotnet run --project src/FleetLink.Api` → open `/health` and `/version`
  - **JavaScript:** `cd javascript && npm start` → open `/health` and `/version`; then `npm test` still green.

**Acceptance:** `/version` returns the JSON above; `/health` is unchanged and still green; the change is small and matches the existing style.

**Checkpoint A2 — commit:** `git commit -am "Day 2 (2.B): brownfield — add /version following the health pattern"`

> **What you just practised:** map → understand → one small safe change → verify. That is the brownfield loop you will run on real legacy code on Monday.

---

## Part B — Greenfield: scaffold the next layer (40 min)

Now switch hats — from *guest in existing code* to *author of new structure*. You scaffold the frame the coming days fill, lock the conventions, and prove the frame with one thin slice. **Structure and standards first; then one slice.**

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

**Acceptance:** `/api/meta` returns the JSON above through a service layer; `/health` and `/version` still work; no FleetLink entity exists yet.

**Checkpoint B3 — commit:** `git commit -am "Day 2 (2.B): greenfield — /api/meta slice through route→service"`

---

## Done when…

- [ ] Claude Code launched from the repo root and sign-in confirmed.
- [ ] `day2/00-skeleton-map.md` exists and is **yours** (not raw Claude output).
- [ ] Brownfield: `/version` added in the existing style; `/health` still green.
- [ ] Greenfield: layer folders scaffolded (folders only), `CLAUDE.md` sharpened, `/api/meta` slice runs.
- [ ] **No** FleetLink entities, seed data or business rules were built (that's 2.C).
- [ ] You reviewed **every** diff before committing; commits say *what changed and why*.
- [ ] Your `day-2/<you>` branch is pushed.

**Push to your fork and (optionally) open a PR** — from your fork's branch against the shared repo's
`main` — so a facilitator can review your scaffold:
```bash
git push -u origin day-2/<your-name>      # origin = your fork
```

## Tomorrow (Day 3 · Module 2.C)

You branch `day-3/<you>` from today's work and design FleetLink's **data model** — entities, relationships and constraints — deliberately, **database-first**, straight from the FSD. Today's scaffold is exactly the frame that domain code slots into.

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

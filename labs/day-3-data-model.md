# Day 3 Lab — Module 2.C: Building with Claude Code — where everything lives

**Time:** ~120 minutes hands-on · **Branch:** `day-3/<you>` (from `upstream/main`, the shared ideal reference) · **Track:** stay in the one you picked — `dotnet/` **or** `javascript/`

**What you leave with:** FleetLink's first real layer — the **data model** — placed into its **right homes** in the repo. The **shapes** (entities + enums) in `models/`, the **state** (store + seed) in `data/`, and the **design record** (a confirmed data-model note + the schema) in `docs/`. The app still runs; `/api/meta` now reports the real **seed counts**. Everything traces to the FSD, reviewed for **correct placement**, committed and pushed.

> **Today's lens is Claude Code, not database theory.** You already know how to model data. The skill today is **structure**: how a team works with Claude Code, why the **repo layout is the interface** Claude reads, and deciding **which file holds what**. The data model is just the concrete thing you place. Three parts. **Part A** — confirm the model and decide each piece's home. **Part B** — place the shapes in `models/`, the state in `data/`. **Part C** — record the design in `docs/` and prove the seed loaded. You do **not** build any business rules, DTOs or domain endpoints today — those are **2.D tomorrow**, and their folders stay **empty on purpose**.

---

## The placement map (keep this in view all lab)

Five kinds of thing, five homes. Name which kind something is and you know where it goes.

```
docs/          human-owned truth   → FSD, + TODAY: data-model.md + schema.sql
  models/      SHAPES              → entities + enums          (fill TODAY — no logic, no data)
  data/        STATE               → store + seed              (fill TODAY — the actual data)
  services/    RULES               → (stays EMPTY — Module 2.D)
  dtos/        CONTRACT            → (stays EMPTY — Module 2.D)   [.NET]
  endpoints|routes/  WIRING        → Health, Meta exist; domain wiring in 2.D
```

**The one rule you enforce all day:** a piece of code goes in exactly **one** home. A *rule* never sneaks into a *model*; *data* never sneaks into a *shape*. If you have to think hard about where something goes, re-read this map.

---

## 0. Setup — branch from the Day-2 ideal, prove sign-in (15 min)

1. **Start from the shared ideal reference — not your own Day-2 branch.** Every day begins from the same correct baseline on `upstream/main` (the ideal Day-2 frame: scaffold + `/api/meta` + the `add-slice` skill), so a rough Day 2 never cascades.
   ```bash
   git fetch upstream
   git checkout -b day-3/<your-name> upstream/main
   ```
   *(Fresh machine? Clone your fork first: `git clone https://github.com/<your-name>/fleet-link-claude-level-2.git fleetlink && cd fleetlink && git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git`)*

2. **Launch Claude Code from the repo root** (not inside `dotnet/`/`javascript/`) so it reads the root `CLAUDE.md`, `docs/`, and both tracks:
   ```bash
   claude
   ```
3. **Prove sign-in before you rely on it** — and, today, prove it *reads the structure*:
   > "You are in the FleetLink repo. List the folders under my track's `src/` and tell me, in one line each, what each folder is **for** and which are still empty. Don't write any code."

   A sensible answer means you're signed in **and** that the structure is already telling Claude where things go — which is the whole point of today.

**Checkpoint 0 — commit:** `git commit --allow-empty -m "Day 3: started day-3 branch, Claude Code signed in"`

---

## Part A — Confirm the model, and decide where each piece lives (35 min)

The model comes from the **spec**, and its pieces go into **specific homes**. So first you confirm *what* the model is, then you decide *where* each part of it belongs.

### A1. Have Claude propose the model (10 min)

**Prompt to start from:**
> "Read `docs/FSD-FleetLink.md` sections 3 and 4. Propose FleetLink's data model — the entities, their attributes with types, and the relationships — grounded in what the spec actually states. For each thing, cite the **FSD line** that supports it. Do **not** write code yet, and do **not** invent anything the spec doesn't state."

**Do:** read the proposal as a **reviewer**. Asking it to cite the spec exposes the inferences — anything it can't cite a line for is a candidate to cut.

### A2. Confirm it — accept, cut, question (15 min)

Interrogate the draft against the FSD and **cut the plausible extras**. On FleetLink these are predictable:
- a **driver → vehicle** link the FSD never states (drivers link to *work orders*, optionally) — **cut**
- **stock per depot** / a `DepotPart` table (stock is a single `QuantityInStock` on Part, §3.4) — **cut**
- stored **`TotalCost` / `PartsCost`** columns (these are *derived*, computed in 2.D — **not stored**) — **cut**
- **over-normalising `City`** into its own table (it's a plain string on Depot, §3.1) — **keep as a column**
- a **`User` / `Role`** model (auth is out of scope, FSD §9) — **cut**

### A3. Write the confirmed design into `docs/` (10 min)

The confirmed design is a **design record → it lives in `docs/`**, the human-owned truth.

**Prompt to start from:**
> "Write the **confirmed** data model to `docs/data-model.md`: a table of the six entities with keys, attributes and the FSD section each traces to; the relationships; a 'derived, not stored' note for `PartsCost`/`TotalCost`; and a **'What I rejected and why'** section listing the cuts above. Then write the agreed schema to `docs/schema.sql` (tables, keys, unique business keys, foreign keys, the `WorkOrderPart` composite key, enums as strings/checks — **no** derived columns). These are design records; do not touch any code."

**Deliverable:** `docs/data-model.md` (the agreed design **and** the rejects) + `docs/schema.sql`. The **rejects section is the tell of a real confirmation** — if it's empty, you rubber-stamped Claude's draft.

**Acceptance:** both files exist in `docs/`, match the FSD, and record what you cut and why.

**Checkpoint A — commit:** `git commit -am "Day 3 (2.C): confirm data model → docs/data-model.md + docs/schema.sql"`

---

## Part B — Place the shapes in `models/`, the state in `data/` (45 min)

Now you place the code. Two folders get filled; three stay empty. Review every diff for **one thing above all: did anything land in the wrong home?**

### B1. Shapes → `models/` (20 min)

**Prompt to start from:**
> "From `docs/data-model.md` and `<track>/build.md` section 2.1, generate the **shapes only** into my track's `models/` folder: the six entities (`Depot`, `Vehicle`, `Driver`, `Part`, `WorkOrder`, `WorkOrderPart`) and the five enums, names matching the FSD **exactly**. **No business logic, no validation, no derived fields** — a model defines form, nothing else. Enums are represented as **strings**. Show me the diff."

**Do:** review the diff for placement. Every file in `models/`? **Zero** `if`-statements, calculations or rules? No `TotalCost`/`PartsCost`? If a rule tried to sneak into a model, that's the exact thing to catch — it belongs in `services/`, which stays empty today.

**Checkpoint B1 — commit:** `git commit -am "Day 3 (2.C): shapes → models/ (entities + enums, no logic)"`

### B2. State → `data/` (20 min)

**Prompt to start from:**
> "From `docs/data-model.md`, `docs/FSD-FleetLink.md` §7 and `<track>/build.md` section 2.2, generate the **state only** into my track's `data/` folder: the in-memory **store** (holds lists of each entity, one source everything reads from) and the **seed** (the FSD §7 sample — 2 depots, 4 vehicles incl. one `Retired` + one `InMaintenance`, 3 drivers, 4 parts, 3 work orders). Use **fixed ids** (Guids/uuids) so both tracks share them. **Data only — no shapes redefined, no rules.** Show me the diff."

**Do:** confirm the store + seed are in `data/`, not mixed into `models/`. Confirm the ids are fixed (not random per run) — that's what keeps both tracks in lock-step.

**Checkpoint B2 — commit:** `git commit -am "Day 3 (2.C): state → data/ (FleetStore + FSD seed, fixed ids)"`

### B3. Keep the empty folders honest (5 min)

Quick check — the folders you did **not** fill today:
> "List anything in my track's `services/`, `dtos/` (or routes beyond health/meta) that references a FleetLink entity or rule. There should be **none** — confirm the rules/contract folders are still empty, ready for 2.D."

If anything leaked, move it back. **Empty labelled folders are doing their job** — they hold the space for tomorrow's code so nothing gets misplaced now.

---

## Part C — Record the stage in `docs`/`CLAUDE.md` and prove it loaded (25 min)

### C1. Surface the seed through the existing frame (15 min)

You barely touch the API — the frame from 2.B already surfaces the data. Just update the meta slice.

**Prompt to start from:**
> "Update the existing `/api/meta` slice: set `buildStage` to `"2.C — data model"`, and add a `seedCounts` object reporting the counts from the store (`depots`, `vehicles`, `drivers`, `parts`, `workOrders`). Read the counts from the `data/` store — **no business logic in the meta service**. Show me the diff and how to run it."

**Do:** run it and confirm the counts flow up from `data/` through the structure you respected:
```bash
# .NET
dotnet run --project src/FleetLink.Api
# JavaScript
npm start        # then, in another shell: npm test
```
Open `http://localhost:5080/api/meta` → you should see `"seedCounts": { "depots": 2, "vehicles": 4, "drivers": 3, "parts": 4, "workOrders": 3 }`. **Visible proof the layer is placed and wired.**

**Checkpoint C1 — commit:** `git commit -am "Day 3 (2.C): /api/meta reports seed counts (proves the layer loaded)"`

### C2. Write the map down in CLAUDE.md (10 min)

The structure only holds if it's written where the team and Claude both read it.

**Prompt to start from:**
> "Add a short **'Data model (2.C)'** note to my **track** `CLAUDE.md`: record that `models/` (shapes) and `data/` (state) are now filled, that `services/`/`dtos/` remain empty until 2.D, and set the current build stage to `2.C — data model; API is 2.D`. Keep it tight. Show me the diff."

**Do:** apply only what's true and lean — `CLAUDE.md` grows into a full instrument in 2.F. Commit.

**Checkpoint C2 — commit:** `git commit -am "Day 3 (2.C): record layout + stage in CLAUDE.md"`

---

## Done when…

- [ ] Branched `day-3/<you>` from `upstream/main`; Claude Code signed in and reading the structure.
- [ ] `docs/data-model.md` exists, matches the FSD, and has a **non-empty "rejected and why"** section; `docs/schema.sql` expresses the agreed design (no derived columns).
- [ ] **`models/`** holds the six entities + five enums — **shapes only, zero logic, no derived fields**.
- [ ] **`data/`** holds the store + the FSD seed with **fixed ids**.
- [ ] **`services/` and `dtos/` are still empty** (no rules, no DTOs, no domain endpoints — that's 2.D).
- [ ] App runs, `/health` green, `/api/meta` reports the real **seed counts** (JS: `npm test` green).
- [ ] Every diff was reviewed **for correct placement** before commit; messages say *what went where and why*.
- [ ] Your `day-3/<you>` branch is pushed.

**Push to your fork and (optionally) open a PR** against the shared repo's `main`:
```bash
git push -u origin day-3/<your-name>      # origin = your fork
```

## Tomorrow (Day 4 · Module 2.D)

You branch `day-4/<you>` from `upstream/main` — which by then holds today's ideal data-model layer — and **fill the folders you left empty**: `services/` (the business rules), `dtos/` (the contract), and the domain `endpoints`/`routes` (the wiring) — building the API straight onto the shapes and state you placed today. Because everything is in its right home, tomorrow's code has an obvious place to go.

---

## Appendix — Windows install & login (hand-out)

Install **Node.js (npm)** first, then:
```
install:   npm install -g @anthropic-ai/claude-code
find path: npm config get prefix
set PATH (PowerShell):
  [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\Users\<user>\AppData\Roaming\npm", "User")
```
Then **open a new terminal** so the PATH change takes effect, run `claude`, and sign in. If `claude` "isn't found", it's almost always the new-terminal step.

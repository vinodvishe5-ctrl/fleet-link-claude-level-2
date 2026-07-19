# Day 5 Lab — Module 2.E: UI / UX & Front-End Generation

**Time:** ~120 minutes hands-on · **Branch:** `day-5/<you>` (from `upstream/main`, the shared ideal Day-4 API) · **Track:** stay in the one you picked — `dotnet/` **or** `javascript/`

**What you leave with:** a working **UI for FleetLink**, generated from the **two right inputs — the 2.D API contract and a design system** — not from free-form prompts. A design-token stylesheet, a small API client with one method per endpoint, and four screens (vehicles → vehicle detail → new work order → work order detail) wired to the API, with client-side validation that **mirrors the FSD §5 rules** you enforced yesterday.

> **Today's lens is inputs.** Ask for "a nice screen" and you get a generic screen that fits no application and no brand. The module's whole answer: feed generation a **concrete API contract** (so the UI binds to real shapes and routes) **plus a design system** (so branding and components stay consistent). You built the contract yesterday; today you add a small design system and generate the UI from both. Capgemini uses **Figma** — the same move applies: the Figma reference becomes design tokens, and those tokens drive every screen.

---

## The two inputs (keep this in view all lab)

```
API contract (2.D)  →  js/api.js  →  the shapes + routes the UI binds to (FSD §6, the DTOs)
design system       →  design-system.css (tokens)  →  the colour / spacing / type / status every screen uses
                    ↘  app.js (screens)  ↙
```

**The one rule you enforce all day:** a screen is built **only** from the design tokens and the API client. No hand-picked colour, no shape the contract doesn't define. If a screen needs a colour that isn't a token, add the token — don't inline it.

---

## 0. Setup — branch from the Day-4 ideal, prove sign-in (10 min)

1. **Start from the shared ideal reference — the Day-4 API is your foundation.**
   ```bash
   git fetch upstream
   git checkout -b day-5/<your-name> upstream/main
   ```
   *(Fresh machine? Clone your fork first: `git clone https://github.com/<your-name>/fleet-link-claude-level-2.git fleetlink && cd fleetlink && git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git`)*

2. **Launch Claude Code from the repo root:**
   ```bash
   claude
   ```
3. **Prove sign-in — and confirm the contract you'll bind to:**
   > "You are in the FleetLink repo. From my track's API, list the endpoints the UI can call and the fields on the Vehicle and WorkOrder response DTOs. Don't write any code — I want to see the contract the UI will be generated from."

**Checkpoint 0 — commit:** `git commit --allow-empty -m "Day 5: started day-5 branch, Claude Code signed in"`

---

## Part A — The design system and the API client (35 min)

The two inputs, made concrete before any screen exists.

### A1. A design system as tokens (20 min)

**Prompt to start from:**
> "Create a design system for FleetLink as **design tokens** in `<public|wwwroot>/css/design-system.css`: CSS custom properties for a clean enterprise palette, spacing scale, type, radius and elevation, plus **status and priority tokens mapped to the FSD enums** (vehicle `Active`/`InMaintenance`/`Retired`; work-order `Open`/`InProgress`/`OnHold`/`Completed`/`Cancelled`; priority `Low`..`Critical`). Then component classes built only from those tokens: card, table, badge, button, form field, alert. No screens yet — just the system. Show me the diff."

**Do:** review that **every colour is a token** and the status/priority values map to the FSD enums — that mapping is what keeps a badge's colour identical on every screen. *(Using Figma? Extract its tokens here instead of inventing them.)*

**Checkpoint A1 — commit:** `git commit -am "Day 5 (2.E): design system → tokens + component classes"`

### A2. An API client from the contract (15 min)

**Prompt to start from:**
> "Generate a thin API client in `<public|wwwroot>/js/api.js` with **one method per endpoint** in the 2.D contract (FSD §6): `listVehicles`, `getVehicle`, `listVehicleWorkOrders`, `getWorkOrder`, `listParts`, `createWorkOrder`, `changeStatus`, `addParts`, `updateOdometer`. Use jQuery `$.ajax`. Each call resolves the response DTO, or rejects with the one `{ status, error, code }` shape the API returns. No UI yet. Show me the diff."

**Do:** confirm the client is generated **from the contract** — the routes and shapes match FSD §6 exactly, and it surfaces the one error shape from 2.D.

**Checkpoint A2 — commit:** `git commit -am "Day 5 (2.E): API client (one method per 2.D endpoint)"`

---

## Part B — The read screens, wired to the API (40 min)

Build reads first, same as yesterday: they prove the UI binds to real data before any write.

### B1. The shell + the vehicles list (20 min)

**Prompt to start from:**
> "Create `<public|wwwroot>/index.html` — an app shell that loads jQuery, the design system, then `api.js` and `app.js`, with a header showing the live `buildStage` from `/api/meta`. Then start `app.js` with a tiny **hash-router** and the first screen: **Vehicles** — a table of `GET /api/vehicles` (registration, make/model, odometer, a status badge), each row linking to the vehicle. Build it only from the design-system classes. Then wire the static server — `express.static('public')` (JS) / `app.UseDefaultFiles(); app.UseStaticFiles();` (.NET) — and run it. Show me the diff and how to run it."

**Do:** run it and open `http://localhost:5080/` — real seed vehicles, status badges in the token colours.
```bash
# .NET
dotnet run --project src/FleetLink.Api
# JavaScript
npm start
```

**Checkpoint B1 — commit:** `git commit -am "Day 5 (2.E): app shell + vehicles list (read, design system)"`

### B2. Vehicle detail + its work orders (20 min)

**Prompt to start from:**
> "Add a **Vehicle detail** screen (route `#/vehicles/:id`): the vehicle info from `GET /api/vehicles/{id}`, and its work orders from `GET /api/vehicles/{id}/work-orders` as a table (title, type, priority badge, status badge, total cost), each row linking to the work order. Add a **Work order detail** screen (route `#/work-orders/:id`) showing the description, dates, and the derived **LabourCost / PartsCost / TotalCost** from the DTO. Reads only for now. Build only from the design tokens. Show me the diff."

**Do:** click through vehicle → work order. Confirm the **derived costs** the service computed in 2.D show up unchanged — the UI just binds to the contract.

**Checkpoint B2 — commit:** `git commit -am "Day 5 (2.E): vehicle detail + work order detail (reads)"`

---

## Part C — The write screens + consistent validation (30 min)

### C1. Create a work order, with validation that mirrors the rules (15 min)

**Prompt to start from:**
> "Add a **New work order** screen (route `#/vehicles/:id/new`): a form (title, description, type, priority, opened date, due date, labour cost) that POSTs to `/api/vehicles/{id}/work-orders`. Add **client-side validation that mirrors the FSD §5 rules** — due date on/after opened date (rule 4), opened date not in the past (rule 5), Critical due within 2 days (rule 6), labour ≥ 0 — showing inline messages. The server stays authoritative: on a rejected request, show the friendly message mapped from the `code` in the one error shape. On success, go to the new work order. Show me the diff."

**Do:** prove the mirror. Try to create Critical work due 5 days out → the **client** stops it; then try opening work on the **retired** `FL-1004` → the **server** stops it with the mapped message. Same rule, both sides.

**Checkpoint C1 — commit:** `git commit -am "Day 5 (2.E): new work order form + validation mirroring FSD §5"`

### C2. Status actions, add parts, odometer (10 min)

**Prompt to start from:**
> "On the work order screen, add **status action** buttons showing only the transitions the state machine allows from the current status (mirror of rule 10), calling `PATCH /api/work-orders/{id}/status`; and an **Add parts** form (part dropdown from `GET /api/parts` + quantity) calling `POST /api/work-orders/{id}/parts`, with a client stock check (rule 8). On the vehicle screen, add an **odometer update** (rule 12) calling `PATCH /api/vehicles/{id}/odometer`. Re-render on success; show the mapped error message on failure. Show me the diff."

**Do:** complete a seed work order that has an assignee (e.g. `FL-1001`'s open service), then try an illegal transition on a completed one → the server's 409 surfaces as a friendly line.

**Checkpoint C2 — commit:** `git commit -am "Day 5 (2.E): status actions + add parts + odometer (write side)"`

### C3. Record the stage (5 min)

**Prompt to start from:**
> "Set `/api/meta` `buildStage` to `"2.E — UI"`. Add a short **'UI (2.E)'** note to my track `CLAUDE.md` recording that the front-end lives under `public/` (JS) / `wwwroot/` (.NET), is generated from the API contract + the design system, and that branding comes only from the tokens. Keep it tight. Show me the diff."

**Checkpoint C3 — commit:** `git commit -am "Day 5 (2.E): record UI stage in /api/meta + CLAUDE.md"`

---

## Done when…

- [ ] Branched `day-5/<you>` from `upstream/main` (the ideal Day-4 API); Claude Code signed in.
- [ ] A **design system** exists as tokens; every screen colour is a token; status/priority map to the FSD enums.
- [ ] An **API client** with one method per 2.D endpoint; it surfaces the one `{ error, code }` shape.
- [ ] Screens: **vehicles list → vehicle detail → work order detail** bind to real DTOs (derived costs shown).
- [ ] **Create / status / add-parts / odometer** work against the API; a rule violation shows the mapped message.
- [ ] Client validation **mirrors the FSD §5 rules** — the same rule fires on the client and, authoritatively, on the server.
- [ ] `/api/meta` reads `2.E — UI`; `CLAUDE.md` records the stage; (JS) `npm test` still green.
- [ ] Your `day-5/<you>` branch is pushed.

**Push to your fork and (optionally) open a PR** against the shared repo's `main`:
```bash
git push -u origin day-5/<your-name>      # origin = your fork
```

## Tomorrow (Day 6 · Module 2.F)

You take `CLAUDE.md` from a short note into a full **standards instrument**, and build **Skills, slash commands and hooks** so the team's conventions — including the design tokens and component rules you set today — are enforced **up front**, not fixed in review.

---

## Appendix — Windows install & login (hand-out)

Install **Node.js (npm)** first, then:
```
install:   npm install -g @anthropic-ai/claude-code
find path: npm config get prefix
set PATH (PowerShell):
  [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\Users\<user>\AppData\Roaming\npm", "User")
```
Then **open a new terminal**, run `claude`, and sign in.

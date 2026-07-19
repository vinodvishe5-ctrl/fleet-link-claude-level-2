# Day 4 Lab — Module 2.D: API & Business Logic

**Time:** ~120 minutes hands-on · **Branch:** `day-4/<you>` (from `upstream/main`, the shared ideal Day-3 reference) · **Track:** stay in the one you picked — `dotnet/` **or** `javascript/`

**What you leave with:** the three folders you left empty yesterday — the **contract**, the **rules** and the **wiring** — now filled. FleetLink stops being a seeded skeleton and becomes a real, layered **API**: response/request **DTOs**, the twelve **FSD §5 business rules** in the **services**, thin **endpoints/routes** returning the exact FSD **status codes**, **validation** kept consistent on both sides, one **error shape**, and a **test per rule**, all green.

> **Today's lens is layering and rules.** Getting an API that *runs* is the easy part now — Claude can produce CRUD in minutes. The skill is generating one that is **layered** (so it can be maintained), enforces the **right rules** (in the one place they belong — the service), and **validates** consistently. Build in a deliberate order: **contract first**, then the safe **read side**, then the **rules + write side**, then **validation + proof**. Review every diff against the FSD — the rule Claude invents is caught by asking it to cite the rule number.

---

## The layering map (keep this in view all lab)

```
dtos/         CONTRACT   → response + request shapes; the API exposes DTOs, never entities (fill TODAY)
services/     RULES      → every FSD §5 rule, one method per use case, rule number in a comment (fill TODAY)
endpoints|routes/  WIRING → thin: parse → validate → call service → map to a status code (fill TODAY)
validation/   BOUNDARY   → mirrors the service rules exactly; backend stays authoritative (fill TODAY)
models/ data/            → placed in 2.C; you build ON them, you don't change their shape
```

**The one rule you enforce all day:** a business rule lives in **exactly one place — the service** — and cites its FSD §5 number. Nothing in an endpoint, nothing in a model. If a check can't point to an FSD rule number, it comes out.

---

## 0. Setup — branch from the Day-3 ideal, prove sign-in (10 min)

1. **Start from the shared ideal reference — not your own Day-3 branch.**
   ```bash
   git fetch upstream
   git checkout -b day-4/<your-name> upstream/main
   ```
   *(Fresh machine? Clone your fork first: `git clone https://github.com/<your-name>/fleet-link-claude-level-2.git fleetlink && cd fleetlink && git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git`)*

2. **Launch Claude Code from the repo root** so it reads the root `CLAUDE.md`, `docs/`, and both tracks:
   ```bash
   claude
   ```
3. **Prove sign-in — and confirm where you start:**
   > "You are in the FleetLink repo. In one line each, tell me what my track's `src/` folders currently hold: which are filled (models, data) and which are still empty (services, dtos, endpoints/routes). Don't write any code."

   Models and data are full from yesterday; services, the contract and the wiring are empty and waiting. That's the whole shape of today.

**Checkpoint 0 — commit:** `git commit --allow-empty -m "Day 4: started day-4 branch, Claude Code signed in"`

---

## Part A — The contract and the read side (35 min)

Build reads first: a read carries no business rule, so it proves data flows cleanly through every layer before any logic that can be wrong exists.

### A1. The contract — response DTOs + mapping (15 min)

**Prompt to start from:**
> "Read `docs/data-model.md` and my track's `models/`. Generate the READ response DTOs / contract shapes: `DepotDto`, `VehicleDto`, `DriverDto`, `PartDto`, and `WorkOrderDto` (with the derived `PartsCost` and `TotalCost`). The API exposes DTOs, never entities. Add one mapping per entity kept in a single place — an AutoMapper profile on .NET, a small `toXDto` function on JavaScript — following my track's `build.md` and the existing `/api/meta` DTO. **No business logic** — the derived costs are computed later in the service. Show me the diff."

**Do:** review for one thing — is this just **shape and mapping**, with no rule smuggled in? `PartsCost`/`TotalCost` are declared but **not computed yet** (correct — they get computed in the service in Part B).

**Checkpoint A1 — commit:** `git commit -am "Day 4 (2.D): contract → response DTOs + mapping (no rules)"`

### A2. The read side — services + GET endpoints (20 min)

**Prompt to start from:**
> "Following the exact shape of the existing `/api/meta` slice (endpoint → service → DTO, no logic in the endpoint), generate the READ side from `docs/FSD-FleetLink.md` section 6 and my track's `build.md`: read services that fetch from the `data/` store, and the read endpoints — `GET /api/depots`, `/api/depots/{id}`, `/api/vehicles`, `/api/vehicles/{id}`, `/api/depots/{id}/vehicles`, `/api/vehicles/{id}/work-orders`, `/api/work-orders/{id}`, `/api/parts`. Return DTOs, not entities. Keep the endpoints thin. Show me the diff and how to run it."

**Do:** review placement — reads live in a service, the endpoint just wires and returns a DTO. Run it and watch real seed data come up through all the layers:
```bash
# .NET
dotnet run --project src/FleetLink.Api
# JavaScript
npm start
```
Open `http://localhost:5080/api/vehicles` → the four seed vehicles, as DTOs. No business rule exists yet — that's the point of doing reads first.

**Checkpoint A2 — commit:** `git commit -am "Day 4 (2.D): read side → services + GET endpoints (DTOs, thin wiring)"`

---

## Part B — The rules and the write side (45 min)

The heart of the module: the business logic, all of it in the **service layer**, built against the confirmed FSD §5 rules.

### B1. Request DTOs (10 min)

**Prompt to start from:**
> "Generate the WRITE request DTOs from `docs/FSD-FleetLink.md` section 6 and my track's `build.md`: `CreateWorkOrderRequest`, `ChangeStatusRequest`, `AddWorkOrderPartsRequest`, `UpdateOdometerRequest` — each carrying only the fields its call needs. No validation attributes yet — that's Part C. Show me the diff."

**Checkpoint B1 — commit:** `git commit -am "Day 4 (2.D): write request DTOs (shapes only)"`

### B2. The business rules, in the services (20 min) — the key review of the day

**Prompt to start from:**
> "From `docs/FSD-FleetLink.md` section 5 (the twelve business rules) and my track's `build.md`, generate the domain services in my track's `services/` folder, behind interfaces where the track uses them: `workOrderService` (create — rules 2–6; status transitions — the rule 9–11 state machine; add parts + stock decrement — rule 8; cost derivation for `PartsCost`/`TotalCost`) and `vehicleService` (odometer update — rule 12; breakdown auto-status — rule 7). One method per use case. Every business rule lives here — nothing in the endpoints, nothing in the models. **Put the FSD rule number in a comment on each check.** Show me the diff."

**Do:** read it as a **reviewer**, rule by rule against its numbered line in the FSD. Name what Claude tends to invent so you catch it: an extra date window the spec never set, a status transition the state machine forbids, a "helpful" default. **If a check can't cite an FSD rule number, it comes out.** Also check placement — every rule in the service, nothing leaked up or down.

**Checkpoint B2 — commit:** `git commit -am "Day 4 (2.D): business rules → services (FSD §5, one method per use case)"`

### B3. The write endpoints (15 min)

**Prompt to start from:**
> "Following the meta slice's shape, generate the WRITE endpoints from `docs/FSD-FleetLink.md` section 6 into my track's endpoints/routes folder: `POST /api/vehicles/{vehicleId}/work-orders` (201/400/404/409), `PATCH /api/work-orders/{id}/status` (200/409), `POST /api/work-orders/{id}/parts` (200/409), `PATCH /api/vehicles/{id}/odometer` (200/400). Thin endpoints only: parse the request DTO, call the service, map the result to the exact FSD status code. No rules in the endpoint. Show me the diff and how to run it."

**Do:** prove a rule fires. Run it and try to open a work order on the **retired** vehicle `FL-1004` → refused with **409**; the same create on an active vehicle → **201**. That's the rule enforcing itself, surfaced as the right status code.

**Checkpoint B3 — commit:** `git commit -am "Day 4 (2.D): write side → endpoints returning the FSD status codes"`

---

## Part C — Validation, and prove it green (30 min)

### C1. Validation on both sides + one error shape (15 min)

**Prompt to start from:**
> "Add boundary validation to the write request DTOs that mirrors the service rules exactly — coherent dates (`DueDate >= OpenedDate`), no back-dating, the critical-SLA two-day window, non-negative quantities — using DataAnnotations/FluentValidation on .NET and a small validator on JavaScript. The backend is authoritative; the same rule must be enforced at the boundary **and** in the service, never one without the other. Then add ONE global exception/error handler returning a consistent `{ error, code }` body for every failure. Show me the diff."

**Do:** check each boundary check is backed by the same rule in the service (so they can't drift), and that there is exactly **one** error shape, not a different body per endpoint.

**Checkpoint C1 — commit:** `git commit -am "Day 4 (2.D): validation both sides (consistent) + one error shape"`

### C2. Prove every rule with tests (10 min)

**Prompt to start from:**
> "From `docs/FSD-FleetLink.md` section 5 and my track's `build.md`, generate tests: one test per business rule asserting the correct status code (retired → 409, missing vehicle → 404, incoherent dates → 400, over-stock → 409, illegal transition → 409, odometer decrease → 400, and so on), plus read-side tests for the GET endpoints. Make them runnable and green. Show me how to run them."

```bash
# .NET
dotnet test
# JavaScript
npm test
```
Green is the definition of done — every rule proven, every status code checked.

**Checkpoint C2 — commit:** `git commit -am "Day 4 (2.D): tests — one per rule + read side, all green"`

### C3. Record the stage (5 min)

**Prompt to start from:**
> "Update the `/api/meta` slice: set `buildStage` to `"2.D — API & business logic"`. Then add a short **'API (2.D)'** note to my track `CLAUDE.md` recording that `dtos/`, `services/` and endpoints/routes are now filled, that the API enforces the FSD §5 rules with validation kept consistent on both sides, and set the current build stage to `"2.D — API; UI is 2.E"`. Keep it tight. Show me the diff."

**Checkpoint C3 — commit:** `git commit -am "Day 4 (2.D): record API stage in /api/meta + CLAUDE.md"`

---

## Done when…

- [ ] Branched `day-4/<you>` from `upstream/main`; Claude Code signed in.
- [ ] The **contract** is DTOs, not entities; `PartsCost`/`TotalCost` are **derived in the service**, not stored.
- [ ] The **read side** flows through thin endpoints (`GET /api/vehicles` returns seed DTOs).
- [ ] The **twelve rules** live in the **services**, each traced to its FSD §5 line; nothing in endpoints or models.
- [ ] The **write endpoints** return the exact FSD status codes (retired → 409, missing vehicle → 404, …).
- [ ] **Validation is consistent** on both sides; every failure returns the one `{ error, code }` shape.
- [ ] **Tests green** — one per rule + the read side (`dotnet test` / `npm test`).
- [ ] `/api/meta` reads `2.D — API & business logic`; `CLAUDE.md` records the stage.
- [ ] Your `day-4/<you>` branch is pushed.

**Push to your fork and (optionally) open a PR** against the shared repo's `main`:
```bash
git push -u origin day-4/<your-name>      # origin = your fork
```

## Tomorrow (Day 5 · Module 2.E)

You branch `day-5/<you>` from `upstream/main` — which by then holds today's ideal API layer — and build the **UI**. The theme rhymes with today: just as the API was generated from the model, the **UI is generated from the API contract you just built**, plus the design system. The DTOs you defined today are exactly what the front-end will bind to.

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

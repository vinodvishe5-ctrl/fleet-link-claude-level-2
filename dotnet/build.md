# build.md — FleetLink (.NET track)

**Audience for this file:** Claude Code.
**What this is:** the build brief for the **.NET** build of FleetLink, the Level 2 running project.
Read it top to bottom together with [`../docs/FSD-FleetLink.md`](../docs/FSD-FleetLink.md) (the source
of truth), [`../CLAUDE.md`](../CLAUDE.md) and [`CLAUDE.md`](CLAUDE.md) before generating anything.

You do **not** build all of this at once. The running project is built **one layer per day**, on a new
branch each day (see [`../BRANCHING.md`](../BRANCHING.md)). Each day's lab guide in
[`../labs/`](../labs/) tells you which slice to build. This file is the **whole target** so you always
know where the current slice fits.

---

## 0. Guardrails (apply to everything you generate)

Sandbox only · in-memory / sample data only · **no real client data, no PII, no secrets, no connection
strings.** All sample data is fictional and clearly labelled. Business rules live in the service layer.
The API never exposes domain models directly — always via DTOs. Return the FSD's status codes. Stop at
each checkpoint for human review before moving on.

## 1. Current state (the seed)

```
dotnet/
├─ FleetLink.sln
└─ src/FleetLink.Api/
   ├─ FleetLink.Api.csproj        (net8.0, web SDK)
   ├─ Program.cs                  (maps only the health endpoints)
   ├─ Endpoints/HealthEndpoints.cs
   └─ appsettings*.json
```

Runs with `dotnet run --project src/FleetLink.Api`; `GET /health` returns `{status:"ok"}`. This is all
that exists on Day 1.

## 2. The target application (built across the modules)

### 2.0 Plan + scaffold + first slice (Module 2.B — Spec-Driven Development) — **TODAY**

Module 2.B is **spec-driven development**: turn the FSD into a confirmed build plan, then execute its
first step — scaffold the frame the later slices fill and prove it with **one non-domain slice** — and
capture the slice procedure as a **skill**. Everything traces to the FSD.
**Do not build any FleetLink entity, seed data, DTO or business rule here — that is 2.C.**

**Plan (human-owned, no code):** the trainee has Claude draft a build plan from `../docs/FSD-FleetLink.md`
and `../docs/build-sequence.md` (the vertical slices, in order, with checkpoints) and **confirms it**,
saving it as `day2/plan.md`. Claude Code does not generate this — it is the human deliverable of Part A.

**Scaffold the layered structure:** create the empty layer folders, each with a short
`README.md` naming what it holds and which module fills it — **folders only, no domain code**:
```
src/FleetLink.Api/
  Models/     README.md   → "FSD entities — filled in Module 2.C"
  Data/       README.md   → "in-memory store + SeedData — filled in Module 2.C"
  Dtos/       README.md   → "request/response DTOs — filled in Module 2.D"
  Services/   README.md   → "business rules behind interfaces — filled in Module 2.D"
  Endpoints/  (exists)    → already holds HealthEndpoints; MetaEndpoints added below
```

**The one non-domain vertical slice — `GET /api/meta`** (proves route → service layering):
- `Dtos/MetaDto.cs` — `App`, `Track`, `Version`, `BuildStage`, `PlannedEntities` (string[]).
- `Services/IMetaService.cs` + `Services/MetaService.cs` — returns a `MetaDto`; **no business logic**.
  `PlannedEntities` is a **static list** of the FSD entity names — do **not** create those types.
- `Endpoints/MetaEndpoints.cs` — maps `GET /api/meta` → `IMetaService.GetMeta()`.
- Register `IMetaService` in `Program.cs` via DI and map the endpoint. Response body, exactly:
  ```json
  { "app": "FleetLink", "track": "dotnet", "version": "0.2.0", "buildStage": "2.B — scaffold",
    "plannedEntities": ["Depot","Vehicle","Driver","Part","WorkOrder","WorkOrderPart"] }
  ```

**Also (2.B):** add a short **"Project layout & build stage"** section to `dotnet/CLAUDE.md` recording the
scaffolded layout and stating "current stage: 2.B — scaffold; domain arrives in 2.C". Keep it tight.

**Skill (2.B, both tracks — repo root):** create a Claude Code project skill at
`.claude/skills/add-slice/SKILL.md` that captures the `/api/meta` layered pattern — given a route path,
name and fixed non-domain response it adds a slice (service with no logic + thin endpoint), detects the
track, follows both `CLAUDE.md` files and the `/api/meta` reference, and **stops at the diff**. It must
refuse FSD entities / business rules (2.C/2.D). This is a first taste; 2.F builds the full skills/hooks
toolkit. (Skill lives at the repo root so it applies to both tracks.)

**Definition of done (2.B):** `day2/plan.md` exists (human-confirmed, traces to the FSD); `dotnet run`
works; `/health` and `/api/meta` respond; the `add-slice` skill exists and produces a slice in the same
layered shape;
`/api/meta` flows through a service; **zero** business rules and **zero** FSD entities exist yet.

### 2.C Data model & seed (Module 2.C — Building with Claude Code: where everything lives) — **TODAY**

Module 2.C fills the **first real layer** into the frame 2.B scaffolded. The teaching lens is
**Claude Code and file structure**, not data-modelling theory: the skill today is deciding **which
file holds what** and placing each piece in its **one right home**, so both the team and Claude find
things where they expect. You build the *shapes* and the *state* only — **no rules, no DTOs, no
endpoints** (those are 2.D and their folders stay empty on purpose).

**Placement map — the five kinds of thing, and where each goes:**
```
docs/                       human-owned truth  → design record + schema go here TODAY
src/FleetLink.Api/
  Models/     SHAPES         → entities + enums          (fill TODAY — no logic, no data)
  Data/       STATE          → FleetStore + SeedData      (fill TODAY — the actual data)
  Dtos/       CONTRACT       → (stays empty — Module 2.D)
  Services/   RULES          → (stays empty — Module 2.D)
  Endpoints/  WIRING         → (exists: Health, Meta — domain endpoints in 2.D)
```

**Confirm first (human-owned):** the trainee has Claude read `../docs/FSD-FleetLink.md` §3–§4, propose
the entities/attributes/relationships, and **confirms** the draft — accepting what the spec states,
cutting what Claude inferred (a driver→vehicle link, a stock-per-depot table, stored `TotalCost`/
`PartsCost` columns, an over-normalised `City` table, a `User`/`Role` model — all out per FSD §9).
The confirmed design is written to **`../docs/data-model.md`** (what was agreed **and** what was
rejected and why) and the agreed schema to **`../docs/schema.sql`**. These are **design records → they
live in `docs/`**, the human-owned truth Claude reads but never rewrites.

Then place the code (see the detail in 2.1–2.2 below):
- **`Models/`** — the six entities + five enums, FSD names exactly. **Shapes only** — no rules, no
  derived columns (`PartsCost`/`TotalCost` are computed in the service layer in 2.D, **not stored**).
- **`Data/`** — `FleetStore` (the in-memory holder) + `SeedData` (FSD §7 sample, **fixed Guids** shared
  with the JS track). **State only.**
- Update `/api/meta` so `buildStage` reads `"2.C — data model"` and it reports the **seed counts**
  (2 depots, 4 vehicles, 3 drivers, 4 parts, 3 work orders) as proof the layer loaded.
- Add a **"Data model (2.C)"** note to `dotnet/CLAUDE.md` recording that `Models/` and `Data/` are now
  filled and the current stage is `2.C — data model; API is 2.D`.

**Definition of done (2.C):** `docs/data-model.md` + `docs/schema.sql` exist and match the FSD;
`Models/` holds the six entities + five enums (no logic); `Data/` holds `FleetStore` + `SeedData`
(fixed Guids); `dotnet run` works, `/health` green, `/api/meta` reports the real seed counts;
`Services/`, `Dtos/` remain **empty**; every diff reviewed for **correct placement** before commit.

### 2.1 Models (`src/FleetLink.Api/Models/`) — Module 2.C
One class per FSD entity, names matching the FSD exactly:
`Depot`, `Vehicle`, `Driver`, `Part`, `WorkOrder`, `WorkOrderPart`, and the enums
`VehicleStatus`, `DriverStatus`, `WorkOrderType`, `WorkOrderPriority`, `WorkOrderStatus`.

### 2.2 In-memory data (`src/FleetLink.Api/Data/`) — Module 2.C
- `FleetStore` — a thread-safe in-memory store holding lists of each entity, registered as a singleton.
- `SeedData` — the fixed sample set from FSD §7: 2 depots (`DEP-LDN`, `DEP-MAN`), 4 vehicles
  (`FL-1001`..`FL-1004`, one `Retired`, one `InMaintenance`), 3 drivers (Ravi Menon, Sofia Alvarez,
  Tom Becker — fictional), 4 parts (`PN-BRK-01`, `PN-OIL-05`, `PN-TYR-02`, `PN-BAT-01`), 3 work orders.
  Use **fixed Guids** so both tracks and all trainees share ids.

### 2.3 DTOs (`src/FleetLink.Api/Dtos/`) — Module 2.D
`DepotDto`, `VehicleDto`, `DriverDto`, `PartDto`, `WorkOrderDto` (with derived `PartsCost`,
`TotalCost`), plus requests: `CreateWorkOrderRequest`, `AddWorkOrderPartsRequest`,
`ChangeStatusRequest`, `UpdateOdometerRequest`.

### 2.4 Services (`src/FleetLink.Api/Services/`) — Module 2.D
Interfaces + implementations holding **all business rules** (FSD §5):
- `IVehicleService` / `VehicleService` — vehicle reads, odometer update (rule 12), breakdown
  auto-status (rule 7).
- `IWorkOrderService` / `WorkOrderService` — create (rules 2–6), status transitions (rules 9–11 state
  machine), add parts + stock decrement (rule 8), cost derivation.
- `IReportService` / `ReportService` — open-work-by-depot, overdue, cost-per-vehicle.

### 2.5 Endpoints (`src/FleetLink.Api/Endpoints/`) — Module 2.D
Group by resource, matching FSD §6:
`DepotEndpoints`, `VehicleEndpoints`, `WorkOrderEndpoints`, `PartEndpoints`, `ReportEndpoints`.
Read endpoints first, then the write side with the rules. Centralise the error response shape.

### 2.6 Validation — Module 2.D
Boundary validation on requests (DataAnnotations or FluentValidation) **and** rule enforcement in the
services, deliberately consistent with each other. A rule is never enforced in one place and forgotten
in the other.

### 2.7 Tests (`src/FleetLink.Tests/`) — Modules 2.D & 2.I
xUnit project. One test class per service; one test per business rule in FSD §5, plus endpoint tests
for the status codes. Tests must be runnable with `dotnet test` and green before a layer is "done".

### 2.8 Cross-cutting — Modules 2.D & 2.F
Structured logging, a global exception handler mapping to the problem shape, and (2.F) a richer
`CLAUDE.md`, a Skill / slash command, and a hook that enforce the conventions above automatically.

### 2.E UI / front-end (Module 2.E — generate the UI from the API contract + a design system)

Generate the UI from **two inputs — the 2.D API contract and a design system** — never from free-form
prompts. The reference build serves a small **static** front-end from `wwwroot/`, wired to the same-origin
minimal API — the **same design-system + contract drives the UI regardless of stack** (Razor Pages or
Blazor are equally valid for teams that prefer server-rendered; the point is the two inputs, not the
framework). Build these files under `src/FleetLink.Api/wwwroot/`:

- `wwwroot/css/design-system.css` — the design system as **design tokens** (CSS custom properties): colour,
  spacing, type, radius, elevation, plus **status/priority tokens mapped to the FSD enums**. Component
  classes only. Re-skinning changes tokens here, not screens.
- `wwwroot/js/api.js` — a thin client with **one method per 2.D endpoint** (FSD §6), generated FROM the
  contract; resolves the DTO or rejects with the one `{ status, error, code }` shape. jQuery `$.ajax`.
- `wwwroot/js/app.js` — a hash-router rendering **Vehicles → Vehicle detail (info + odometer + work orders)
  → New work order → Work order detail (costs + status actions + add parts)**. Client validation **mirrors
  the FSD §5 rules** (dates, state machine, stock); the server stays authoritative.
- `wwwroot/index.html` — the app shell; shows the live `buildStage` from `/api/meta`.
- Wire `app.UseDefaultFiles(); app.UseStaticFiles();` into `Program.cs` (before the endpoints) and set
  `/api/meta` `BuildStage` to `"2.E — UI"`.

**Verify visually (the 2.E technique):** don't trust "it rendered". For each screen, run the **screenshot
loop** — Claude captures the running page with the pre-installed Playwright, opens the PNG, critiques it
against the design tokens (alignment, spacing, overflow, off-brand), fixes, and re-screenshots until it
matches. Do the awkward **states** too: empty list, the 404/409/validation error, a narrow width, a long value.

**Definition of done (2.E):** `dotnet run` serves the UI at `/`; the list/detail/create/status/parts flows
work against the real API; a rule violation shows the friendly message from the one error shape; branding
comes only from the tokens; every screen (and its states) was screenshot-checked against the design.

## 3. Build order (follow the labs, not this list, day to day)

0. **2.B** confirm a spec-to-build plan + scaffold empty layer folders + `/api/meta` slice + `add-slice` skill → frame runs, no domain.
1. **2.C** Models + `FleetStore` + `SeedData` + read endpoints → app lists real seed data.
2. **2.D** DTOs → services with rules → write endpoints → validation → tests green.
3. **2.E** UI against the API contract (separate front-end; see the JavaScript track or a Razor/Blazor
   front end as the team prefers).
4. **2.F** consistency instruments. **2.H** debugging/RCA. **2.I** full test suite.
   **2.J** RAG over `docs/` + code. **2.K** a small agent over FleetLink.

## 4. Definition of done per layer

- Builds and runs (`dotnet run`), health still green.
- New endpoints return exactly the FSD status codes.
- Every business rule touched has a passing test.
- The diff was reviewed by a human before commit; the commit message says what changed and why.

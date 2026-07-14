# build.md — FleetLink (JavaScript track)

**Audience for this file:** Claude Code.
**What this is:** the build brief for the **JavaScript** build of FleetLink, the Level 2 running
project. Read it top to bottom together with [`../docs/FSD-FleetLink.md`](../docs/FSD-FleetLink.md)
(the source of truth), [`../CLAUDE.md`](../CLAUDE.md) and [`CLAUDE.md`](CLAUDE.md) before generating
anything.

You do **not** build all of this at once. The running project is built **one layer per day**, on a new
branch each day (see [`../BRANCHING.md`](../BRANCHING.md)). Each day's lab guide in
[`../labs/`](../labs/) tells you which slice to build. This file is the **whole target** so you always
know where the current slice fits.

---

## 0. Guardrails (apply to everything you generate)

Sandbox only · in-memory / sample data only · **no real client data, no PII, no secrets, no connection
strings.** All sample data is fictional and clearly labelled. Business rules live in the service layer.
Routes stay thin. Return the FSD's status codes. Stop at each checkpoint for human review before moving
on.

## 1. Current state (the seed)

```
javascript/
├─ package.json
├─ src/
│  ├─ server.js     (wires middleware + the health routes only)
│  └─ health.js
└─ test/health.test.js
```

Runs with `npm install && npm start`; `GET /health` returns `{status:"ok"}`; `npm test` is green. This
is all that exists on Day 1.

## 2. The target application (built across the modules)

### 2.0 Scaffold & first slice (Module 2.B) — **TODAY**

Module 2.B is **spec-driven development**: turn the FSD into a confirmed build plan, then execute its
first step — scaffold the frame the later slices fill and prove it with **one non-domain slice** — and
capture the slice procedure as a **skill**. Everything traces to the FSD.
**Do not build any FleetLink entity, seed data or business rule here — that is 2.C.**

**Plan (human-owned, no code):** the trainee has Claude draft a build plan from `../docs/FSD-FleetLink.md`
and `../docs/build-sequence.md` (the vertical slices, in order, with checkpoints) and **confirms it**,
saving it as `day2/plan.md`. Claude Code does not generate this — it is the human deliverable of Part A.

**Scaffold the layered structure:** create the empty layer folders, each with a short
`README.md` (or `.gitkeep`) naming what it holds and which module fills it — **folders only, no domain code**:
```
src/
  models/    README.md   → "FSD entity shapes/factories — filled in Module 2.C"
  data/      README.md   → "in-memory store + seed — filled in Module 2.C"
  services/  README.md   → "business rules — filled in Module 2.D"
  routes/    README.md   → "one Express router per resource — filled in Module 2.D"
```

**The one non-domain vertical slice — `GET /api/meta`** (proves route → service layering):
- `src/services/metaService.js` — exports a function returning the meta object; **no business logic**.
  `plannedEntities` is a **static list** of the FSD entity names — do **not** create those shapes.
- `src/routes/meta.js` — an Express router mapping `GET /api/meta` → `metaService`.
- Wire the router into `server.js`. Response body, exactly:
  ```json
  { "app": "FleetLink", "track": "javascript", "version": "0.2.0", "buildStage": "2.B — scaffold",
    "plannedEntities": ["Depot","Vehicle","Driver","Part","WorkOrder","WorkOrderPart"] }
  ```

**Also (2.B):** add a short **"Project layout & build stage"** section to `javascript/CLAUDE.md` recording
the scaffolded layout and stating "current stage: 2.B — scaffold; domain arrives in 2.C". Keep it tight.

**Skill (2.B, both tracks — repo root):** create a Claude Code project skill at
`.claude/skills/add-slice/SKILL.md` that captures the `/api/meta` layered pattern — given a route path,
name and fixed non-domain response it adds a slice (service with no logic + thin route), detects the
track, follows both `CLAUDE.md` files and the `/api/meta` reference, and **stops at the diff**. It must
refuse FSD entities / business rules (2.C/2.D). This is a first taste; 2.F builds the full skills/hooks
toolkit. (Skill lives at the repo root so it applies to both tracks.)

**Definition of done (2.B):** `day2/plan.md` exists (human-confirmed, traces to the FSD); `npm start`
works; `/health` and `/api/meta` respond;
the `add-slice` skill exists and produces a slice in the same layered shape;
`/api/meta` flows through a service; `npm test` green; **zero** business rules and **zero** FSD entities exist yet.

### 2.1 Models (`src/models/`) — Module 2.C
A shape/factory per FSD entity, names matching the FSD exactly:
`depot`, `vehicle`, `driver`, `part`, `workOrder`, `workOrderPart`, plus the allowed enum values for
vehicle status, driver status, work-order type, priority and status.

### 2.2 In-memory data (`src/data/`) — Module 2.C
- `store.js` — a module-level in-memory store holding arrays of each entity.
- `seed.js` — the fixed sample set from FSD §7: 2 depots (`DEP-LDN`, `DEP-MAN`), 4 vehicles
  (`FL-1001`..`FL-1004`, one `Retired`, one `InMaintenance`), 3 drivers (Ravi Menon, Sofia Alvarez,
  Tom Becker — fictional), 4 parts (`PN-BRK-01`, `PN-OIL-05`, `PN-TYR-02`, `PN-BAT-01`), 3 work orders.
  Use **fixed uuids** so both tracks and all trainees share ids.

### 2.3 Services (`src/services/`) — Module 2.D
Modules holding **all business rules** (FSD §5):
- `vehicleService` — vehicle reads, odometer update (rule 12), breakdown auto-status (rule 7).
- `workOrderService` — create (rules 2–6), status transitions (rules 9–11 state machine), add parts +
  stock decrement (rule 8), cost derivation (`partsCost`, `totalCost`).
- `reportService` — open-work-by-depot, overdue, cost-per-vehicle.

### 2.4 Routes (`src/routes/`) — Module 2.D
One Express router per resource, matching FSD §6: `depots`, `vehicles`, `workOrders`, `parts`,
`reports`. Read routes first, then the write side with the rules. Routes validate input, call a
service, map to a status code. Centralise the error shape in error middleware.

### 2.5 Validation — Module 2.D
Validate request bodies at the route boundary **and** enforce the rules in the services, deliberately
consistent with each other. A rule is never enforced in one place and forgotten in the other.

### 2.6 Tests (`test/`) — Modules 2.D & 2.I
`node --test` files. One suite per service; one test per business rule in FSD §5, plus route tests for
the status codes. `npm test` must be green before a layer is "done".

### 2.7 Cross-cutting — Modules 2.D & 2.F
Structured logging, error-handling middleware mapping to the shared error shape, and (2.F) a richer
`CLAUDE.md`, a Skill / slash command, and a hook that enforce the conventions above automatically.

## 3. Build order (follow the labs, not this list, day to day)

0. **2.B** confirm a spec-to-build plan + scaffold empty layer folders + `/api/meta` slice + `add-slice` skill → frame runs, no domain.
1. **2.C** models + store + seed + read routes → app lists real seed data.
2. **2.D** services with rules → write routes → validation → tests green.
3. **2.E** UI against the API contract (jQuery / vanilla / a light framework, per the team's design
   system).
4. **2.F** consistency instruments. **2.H** debugging/RCA. **2.I** full test suite.
   **2.J** RAG over `docs/` + code. **2.K** a small agent over FleetLink.

## 4. Definition of done per layer

- Runs (`npm start`), health still green; `npm test` green.
- New routes return exactly the FSD status codes.
- Every business rule touched has a passing test.
- The diff was reviewed by a human before commit; the commit message says what changed and why.

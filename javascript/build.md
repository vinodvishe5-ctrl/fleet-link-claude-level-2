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

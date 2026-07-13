# Functional Specification — FleetLink

**Project:** FleetLink — Fleet & Field-Service Work-Order Management
**Programme:** Claude AI Practical Training for ADM (Capgemini) · **Level 2 — the running project**
**Status:** Source of truth. Human-owned. Claude reads this; Claude does not rewrite it.
**Guardrails:** Non-production sandbox only · sample/in-memory data only · **no real client data, no PII, no secrets, no connection strings.** All names and registrations below are fictional and clearly labelled.

> This one document drives the whole of Level 2. In Module 2.A you decide the *approach* from it.
> In 2.B you scaffold from it. In 2.C you design the database from it. 2.D builds the API and rules
> from it, 2.E the UI, and the later modules test, ground (RAG) and automate (agent) around it.
> Every entity, attribute and rule below is deliberately the **same across the .NET and the
> JavaScript track** — only the syntax differs.

---

## 1. Purpose & context

FleetLink is the back-office system a regional operations team uses to keep a fleet of vehicles on the
road. It tracks the **vehicles**, the **drivers** who operate them, the **depots** they are based at,
and — the heart of the system — the **work orders** that record every service, inspection and
breakdown repair, including the **parts** consumed to complete them.

It is a deliberately ordinary enterprise application: shared data, clear business rules, reporting, a
long maintenance life, and multiple integrations down the line. That ordinariness is the point — it is
exactly the kind of application an ADM team maintains, and exactly the kind for which a deliberate
data model pays back over years.

## 2. Actors

- **Fleet Coordinator** — creates and assigns work orders, moves them through their lifecycle, records
  parts used.
- **Depot Manager** — views the depot's vehicles, drivers and open work, signs off completions.
- **Maintenance Reviewer** — reads reports; does not edit operational data.
- **System** — enforces the business rules and keeps derived state (vehicle status, stock, cost)
  consistent.

## 3. Domain entities (candidate — a draft for the architect to confirm)

> In Module 2.C, Claude will read this section and propose entities, attributes and relationships.
> This list is the **starting draft**, not the authority. The architect and BA confirm it.

### 3.1 Depot
The location a vehicle is based at and a work order is carried out at.
- `Id` (Guid / uuid)
- `Code` (string, unique, e.g. `DEP-LDN`, fictional)
- `Name` (string)
- `City` (string)

### 3.2 Vehicle
An asset in the fleet.
- `Id` (Guid / uuid)
- `Registration` (string, unique, fictional plate, e.g. `FL-1001`)
- `Make` (string) · `Model` (string) · `Year` (int)
- `DepotId` (FK → Depot) — a vehicle belongs to exactly **one** depot
- `OdometerKm` (int, ≥ 0)
- `Status` (enum): `Active`, `InMaintenance`, `Retired`

### 3.3 Driver
A person who operates vehicles and can be assigned to a work order.
- `Id` (Guid / uuid)
- `Name` (string, fictional)
- `LicenceNumber` (string, unique, fictional)
- `DepotId` (FK → Depot)
- `Status` (enum): `Active`, `Inactive`

### 3.4 Part
A stock item consumed by work orders.
- `Id` (Guid / uuid)
- `PartNumber` (string, unique, e.g. `PN-BRK-01`)
- `Name` (string)
- `UnitCost` (decimal, ≥ 0)
- `QuantityInStock` (int, ≥ 0)

### 3.5 WorkOrder
The central record: a unit of maintenance work on one vehicle.
- `Id` (Guid / uuid)
- `VehicleId` (FK → Vehicle)
- `Title` (string) · `Description` (string)
- `Type` (enum): `Scheduled`, `Inspection`, `Breakdown`
- `Priority` (enum): `Low`, `Medium`, `High`, `Critical`
- `Status` (enum): `Open`, `InProgress`, `OnHold`, `Completed`, `Cancelled`
- `OpenedDate` (date) · `DueDate` (date) · `CompletedDate` (date, nullable)
- `AssignedDriverId` (FK → Driver, nullable)
- `LabourCost` (decimal, ≥ 0)
- **Derived:** `PartsCost` = Σ(`WorkOrderPart.Quantity` × `Part.UnitCost`); `TotalCost` = `LabourCost` + `PartsCost`

### 3.6 WorkOrderPart (line item)
The parts used on a work order.
- `WorkOrderId` (FK → WorkOrder)
- `PartId` (FK → Part)
- `Quantity` (int, ≥ 1)

## 4. Relationships (candidate)

- Depot **1—*** Vehicle · Depot **1—*** Driver
- Vehicle **1—*** WorkOrder
- Driver **1—*** WorkOrder (optional assignment)
- WorkOrder **1—*** WorkOrderPart **\*—1** Part

## 5. Business rules (the spine of Modules 2.C–2.H)

These are **not all built on Day 1.** They are the confirmed rules the running project enforces by the
time it is complete. Each is written so it can be turned into a test.

1. **Vehicle depot integrity** — a Vehicle references exactly one existing Depot.
2. **Work order needs a real vehicle** — creating a WorkOrder for a missing Vehicle → `404`.
3. **No work on a retired vehicle** — opening a WorkOrder on a `Retired` Vehicle → `409`.
4. **Coherent dates** — `DueDate >= OpenedDate` → else `400`.
5. **No back-dating** — `OpenedDate` must be today or later (server "today") → else `400`.
6. **Critical SLA** — a `Critical` WorkOrder must have `DueDate` within **2 days** of `OpenedDate` → else `400`.
7. **Breakdown auto-status** — while a Vehicle has an `Open`/`InProgress` WorkOrder of type `Breakdown`,
   its Status is `InMaintenance`; it returns to `Active` when no such work order remains open.
8. **Stock cannot go negative** — adding a `WorkOrderPart` for `Quantity` greater than the part's
   `QuantityInStock` → `409`. On save, stock is decremented by the quantity used.
9. **Completion requires an assignee** — completing a WorkOrder whose `Type` is not `Inspection`
   requires an `AssignedDriverId` → else `409`.
10. **Status state machine** — allowed transitions only: `Open → InProgress | OnHold | Cancelled`;
    `InProgress → OnHold | Completed | Cancelled`; `OnHold → InProgress | Cancelled`;
    `Completed`/`Cancelled` are terminal. Any other transition → `409`.
11. **Completion stamps the record** — moving to `Completed` sets `CompletedDate` to server "today"
    and freezes `TotalCost`.
12. **Odometer is monotonic** — a Vehicle's `OdometerKm` may only stay the same or increase on update
    → else `400`.

## 6. Endpoints (the target API — built across 2.D)

Read side (built early):
- `GET /api/depots` · `GET /api/depots/{id}`
- `GET /api/vehicles` · `GET /api/vehicles/{id}` · `GET /api/depots/{id}/vehicles`
- `GET /api/vehicles/{id}/work-orders` · `GET /api/work-orders/{id}`
- `GET /api/parts`

Write side (built with the rules):
- `POST /api/vehicles/{vehicleId}/work-orders` → create (`201` / `400` / `404` / `409`)
- `PATCH /api/work-orders/{id}/status` → transition (`200` / `409`)
- `POST /api/work-orders/{id}/parts` → add parts used (`200` / `409` on stock)
- `PATCH /api/vehicles/{id}/odometer` → update odometer (`200` / `400`)

Reporting (2.D / later):
- `GET /api/reports/open-work-by-depot`
- `GET /api/reports/overdue-work-orders`
- `GET /api/reports/cost-per-vehicle`

## 7. Seed data (identical across both tracks)

Two depots, four vehicles, three drivers, four parts, three work orders — small enough to reason
about, large enough to exercise the rules. Exact ids and values are fixed in
`labs/day-1-architecture.md` and generated in Module 2.B so both tracks stay in lock-step.

- Depots: `DEP-LDN` (London), `DEP-MAN` (Manchester)
- Vehicles: `FL-1001` (Active), `FL-1002` (Active), `FL-1003` (InMaintenance), `FL-1004` (Retired)
- Drivers: Ravi Menon, Sofia Alvarez, Tom Becker (all fictional)
- Parts: `PN-BRK-01` brake pad set, `PN-OIL-05` oil filter, `PN-TYR-02` tyre, `PN-BAT-01` battery

## 8. Non-functional & delivery constraints

- Runs as a containerisable service; **in-memory store** for the training build (a real database is
  introduced deliberately in 2.C — the module teaches database-first on purpose).
- All existing Capgemini controls remain in force: peer review, branch discipline, SAST/DAST, Azure
  pipelines. Claude slots **inside** that practice; it does not route around it.
- Every generation starts from `CLAUDE.md`, so output is consistent across people and days.

## 9. Out of scope (for the training build)

Authentication/authorisation beyond a stubbed actor, real payments, real telematics feeds, and
production deployment. These are named so the model stays focused; some are added as stretch goals in
later modules.

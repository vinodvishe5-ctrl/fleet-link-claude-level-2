# Day 1 (2.A) — Candidate entity list (confirmed against the FSD)

Claude drafted this from `docs/FSD-FleetLink.md`; I confirmed it **field by field against §3 and §4**.
Status per item: **confirmed** (in the FSD), **rejected** (Claude inferred it; FSD does not state it), or
**open** (worth asking the BA before 2.C). This is the *draft the architect confirms* — the exact input
Module 2.C builds on.

## Entities

### Depot — **confirmed**
`Id` (Guid), `Code` (unique, e.g. `DEP-LDN`), `Name`, `City`. ✔ matches §3.1.

### Vehicle — **confirmed**
`Id`, `Registration` (unique), `Make`, `Model`, `Year`, `DepotId` (FK→Depot, exactly one), `OdometerKm`
(≥0), `Status` (`Active`/`InMaintenance`/`Retired`). ✔ matches §3.2.

### Driver — **confirmed**
`Id`, `Name`, `LicenceNumber` (unique), `DepotId` (FK→Depot), `Status` (`Active`/`Inactive`). ✔ matches §3.3.

### Part — **confirmed** (with one flag, below)
`Id`, `PartNumber` (unique), `Name`, `UnitCost` (≥0), `QuantityInStock` (≥0). ✔ matches §3.4.

### WorkOrder — **confirmed**
`Id`, `VehicleId` (FK), `Title`, `Description`, `Type` (`Scheduled`/`Inspection`/`Breakdown`),
`Priority` (`Low`/`Medium`/`High`/`Critical`), `Status` (`Open`/`InProgress`/`OnHold`/`Completed`/
`Cancelled`), `OpenedDate`, `DueDate`, `CompletedDate` (nullable), `AssignedDriverId` (FK→Driver,
nullable), `LabourCost` (≥0). **Derived:** `PartsCost`, `TotalCost`. ✔ matches §3.5 — derived fields are
computed, **not stored**.

### WorkOrderPart (line item) — **confirmed**
`WorkOrderId` (FK), `PartId` (FK), `Quantity` (≥1). ✔ matches §3.6. Composite key on (WorkOrderId, PartId)
is a design choice to confirm in 2.C.

## Relationships (confirmed against §4)

- Depot 1—* Vehicle ✔ · Depot 1—* Driver ✔
- Vehicle 1—* WorkOrder ✔
- Driver 1—* WorkOrder (optional assignment) ✔
- WorkOrder 1—* WorkOrderPart *—1 Part ✔

## Flagged — things Claude inferred that the FSD does NOT state

- **Depot → Part ("stock per depot") — REJECTED.** Claude drew this; the FSD gives `Part.QuantityInStock`
  as a single global number and lists no Part–Depot relationship (§3.4, §4). Do not build it. → **open**
  question for the BA (is stock really global, or per depot?).
- **Driver → Vehicle direct link — REJECTED.** The FSD links a Driver to a Depot and (optionally) to a
  WorkOrder, never directly to a Vehicle. Do not add a "driver's vehicle" relationship.
- **Audit fields (`CreatedDate`, `ModifiedBy`, …) — OPEN.** The FSD lists none. Don't invent them; ask
  the BA whether reporting/support need them before we fix the schema in 2.C.

## Summary for 2.C

Six entities, all confirmed. Zero invented columns carried forward. Two rejected relationships and one
open audit question handed to the BA. This is the confirmed starting point for the database design.

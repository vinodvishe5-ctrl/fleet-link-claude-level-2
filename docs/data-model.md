# Day 3 (2.C) — FleetLink data model (confirmed against the FSD)

Claude read `docs/FSD-FleetLink.md` §3–§4 and proposed the entities, attributes and relationships below.
I reviewed the draft against the spec and **confirmed** it — this is the agreed design, not Claude's
first output. It is the source the schema (`docs/schema.sql`) and the data model are generated from,
database-first (per ADR-001 and `docs/build-sequence.md`).

> **How to read this:** the entity table is the confirmed schema in words; `docs/schema.sql` is the same
> thing as SQL. The "what I rejected" section is the important part — it records the drafts I did **not**
> accept, so the reasoning is visible.

## Entities (confirmed)

| Entity | Key | Attributes | Notes |
|---|---|---|---|
| **Depot** | `Id` (Guid) | `Code` (unique), `Name`, `City` | FSD §3.1 |
| **Vehicle** | `Id` (Guid) | `Registration` (unique), `Make`, `Model`, `Year`, `DepotId` (FK), `OdometerKm` (≥0), `Status` (enum) | FSD §3.2 · one depot per vehicle |
| **Driver** | `Id` (Guid) | `Name`, `LicenceNumber` (unique), `DepotId` (FK), `Status` (enum) | FSD §3.3 |
| **Part** | `Id` (Guid) | `PartNumber` (unique), `Name`, `UnitCost` (decimal ≥0), `QuantityInStock` (int ≥0) | FSD §3.4 |
| **WorkOrder** | `Id` (Guid) | `VehicleId` (FK), `Title`, `Description`, `Type`, `Priority`, `Status` (enums), `OpenedDate`, `DueDate`, `CompletedDate?`, `AssignedDriverId?` (FK), `LabourCost` (decimal ≥0) | FSD §3.5 |
| **WorkOrderPart** | (`WorkOrderId`,`PartId`) | `Quantity` (int ≥1) | FSD §3.6 · composite key |

**Enums (stored as strings):** VehicleStatus `Active|InMaintenance|Retired` · DriverStatus
`Active|Inactive` · WorkOrderType `Scheduled|Inspection|Breakdown` · WorkOrderPriority
`Low|Medium|High|Critical` · WorkOrderStatus `Open|InProgress|OnHold|Completed|Cancelled`.

## Relationships (confirmed — FSD §4)

```
Depot 1───* Vehicle          Depot 1───* Driver
Vehicle 1───* WorkOrder      Driver 1───* WorkOrder   (optional assignment)
WorkOrder 1───* WorkOrderPart *───1 Part
```

## Derived, not stored (FSD §3.5)

`PartsCost = Σ(WorkOrderPart.Quantity × Part.UnitCost)` and `TotalCost = LabourCost + PartsCost` are
**computed in the service layer (Module 2.D)** — they are **not columns**. Storing them would duplicate
state that can drift out of sync with the line items.

## What I rejected from Claude's draft (the pitfalls)

- **Stock held per depot.** Claude proposed a `DepotPart` / stock-per-depot table. The FSD models stock
  as a single `Part.QuantityInStock` (§3.4) — there is no per-depot stock. **Cut** (inferred relationship
  the FSD never states). Flag for the BA if multi-depot stock is ever wanted.
- **A direct Driver → Vehicle link.** Claude inferred drivers "own" vehicles. The FSD only links a driver
  to a **work order** (optional assignment, §3.5), and both to a depot. **Cut.**
- **Stored `TotalCost` / `PartsCost` columns.** Hallucinated columns for derived values. **Cut** — derive
  in the service layer.
- **Over-normalising `City`** into a `Cities`/`Locations` table. The FSD treats `City` as a plain string
  on Depot (§3.1). **Kept as a column.**
- **A `User`/`Role` table for the actors.** Auth is **out of scope** for the training build (FSD §9,
  stubbed actor). **Cut.**

## Confirmed decisions carried forward

- **Ids are server-generated Guids** (root CLAUDE.md); clients never supply an `Id`.
- **Enums are strings** in the schema and the API, never magic integers.
- **Unique business keys:** `Depot.Code`, `Vehicle.Registration`, `Driver.LicenceNumber`, `Part.PartNumber`.
- **The store is the spine, the schema is the record** (FSD §8): the running app keeps the in-memory
  store as its runtime so Module 2.D can build the API on it, while `docs/schema.sql` records how the same
  model maps to a real relational database (SQL Server / Azure SQL) when the app is persisted.

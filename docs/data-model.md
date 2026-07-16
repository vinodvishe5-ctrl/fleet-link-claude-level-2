# FleetLink data model — design record (Module 2.C)

**Status:** Draft for architect/BA review. Not yet built (that's the Step 3 checkpoint in
[`build-sequence.md`](build-sequence.md)). This record turns the Section 3–4 proposal already agreed
in chat into a physical design, and — per this module's purpose — writes down every decision made
**beyond what the FSD states literally**, and what was considered and rejected.

Source of truth: [`FSD-FleetLink.md`](FSD-FleetLink.md) Sections 3–4, read together with
[`FSD-clarifications.md`](FSD-clarifications.md) (Section 3 is confirmed, not a draft — clarification #1).
Every entity/attribute below cites its FSD line. Everything past that citation is a design decision,
labelled as such.

---

## 1. Entities

### 1.1 Depot (FSD:42-48)

| Column | Type | Nullable | Constraint | FSD basis |
|---|---|---|---|---|
| `Id` | uniqueidentifier | No | PK | FSD:44 |
| `Code` | nvarchar(20) | No | UNIQUE | FSD:45 |
| `Name` | nvarchar(100) | No | — | FSD:46 |
| `City` | nvarchar(100) | No | — | FSD:47 |

### 1.2 Vehicle (FSD:49-57)

| Column | Type | Nullable | Constraint | FSD basis |
|---|---|---|---|---|
| `Id` | uniqueidentifier | No | PK | FSD:51 |
| `Registration` | nvarchar(20) | No | UNIQUE | FSD:52 |
| `Make` | nvarchar(100) | No | — | FSD:53 |
| `Model` | nvarchar(100) | No | — | FSD:53 |
| `Year` | int | No | — | FSD:53 |
| `DepotId` | uniqueidentifier | No | FK → Depot.Id | FSD:54 ("exactly one") |
| `OdometerKm` | int | No | CHECK ≥ 0 | FSD:55 |
| `Status` | nvarchar(20) | No | CHECK IN ('Active','InMaintenance','Retired') | FSD:56 |

### 1.3 Driver (FSD:58-64)

| Column | Type | Nullable | Constraint | FSD basis |
|---|---|---|---|---|
| `Id` | uniqueidentifier | No | PK | FSD:60 |
| `Name` | nvarchar(200) | No | — | FSD:61 |
| `LicenceNumber` | nvarchar(30) | No | UNIQUE | FSD:62 |
| `DepotId` | uniqueidentifier | No | FK → Depot.Id | FSD:63 |
| `Status` | nvarchar(20) | No | CHECK IN ('Active','Inactive') | FSD:64 |

### 1.4 Part (FSD:66-72)

| Column | Type | Nullable | Constraint | FSD basis |
|---|---|---|---|---|
| `Id` | uniqueidentifier | No | PK | FSD:68 |
| `PartNumber` | nvarchar(30) | No | UNIQUE | FSD:69 |
| `Name` | nvarchar(200) | No | — | FSD:70 |
| `UnitCost` | decimal(18,2) | No | CHECK ≥ 0 | FSD:71 |
| `QuantityInStock` | int | No | CHECK ≥ 0 | FSD:72 |

### 1.5 WorkOrder (FSD:74-85)

| Column | Type | Nullable | Constraint | FSD basis |
|---|---|---|---|---|
| `Id` | uniqueidentifier | No | PK | FSD:76 |
| `VehicleId` | uniqueidentifier | No | FK → Vehicle.Id | FSD:77 |
| `Title` | nvarchar(200) | No | — | FSD:78 |
| `Description` | nvarchar(2000) | No | — | FSD:78 |
| `Type` | nvarchar(20) | No | CHECK IN ('Scheduled','Inspection','Breakdown') | FSD:79 |
| `Priority` | nvarchar(20) | No | CHECK IN ('Low','Medium','High','Critical') | FSD:80 |
| `Status` | nvarchar(20) | No | CHECK IN ('Open','InProgress','OnHold','Completed','Cancelled') | FSD:81 |
| `OpenedDate` | date | No | — | FSD:82 |
| `DueDate` | date | No | CHECK ≥ `OpenedDate`; CHECK ≤ `OpenedDate`+2 days when `Priority`='Critical' | FSD:82, Rules 4 & 6 (FSD:108, 110) |
| `CompletedDate` | date | **Yes** | — | FSD:82 (explicitly "nullable") |
| `AssignedDriverId` | uniqueidentifier | **Yes** | FK → Driver.Id | FSD:83 (explicitly "nullable") |
| `LabourCost` | decimal(18,2) | No | CHECK ≥ 0 | FSD:84 |
| `PartsCostAtCompletion` | decimal(18,2) | **Yes** | — | *Design decision, see §2.3 — not an FSD column* |
| `TotalCostAtCompletion` | decimal(18,2) | **Yes** | — | *Design decision, see §2.3 — not an FSD column* |

`PartsCost` and `TotalCost` (FSD:85) are **not** persisted as live columns — see §2.3 for why, and why two
differently-named frozen columns exist instead.

### 1.6 WorkOrderPart (FSD:87-91)

| Column | Type | Nullable | Constraint | FSD basis |
|---|---|---|---|---|
| `Id` | uniqueidentifier | No | PK | *Design decision, see §2.1 — not an FSD column* |
| `WorkOrderId` | uniqueidentifier | No | FK → WorkOrder.Id | FSD:89 |
| `PartId` | uniqueidentifier | No | FK → Part.Id | FSD:90 |
| `Quantity` | int | No | CHECK ≥ 1 | FSD:91 |

---

## 2. Design decisions (beyond what the FSD states)

The FSD deliberately stops at business-level attributes and rules. Turning that into a schema requires
choices the FSD doesn't make. Each one below is flagged as a decision, not a spec fact, with the
alternative that was rejected and why.

### 2.1 `WorkOrderPart` gets a surrogate `Id`

**Decision:** add an `Id` primary key, even though FSD:87-91 lists only `WorkOrderId`, `PartId`,
`Quantity`.

**Rejected alternative:** composite primary key `(WorkOrderId, PartId)`.

**Why:** Section 6 exposes `POST /api/work-orders/{id}/parts` as an *add* operation (FSD:136), and
Rule 8 (FSD:113-114) describes it as decrementing stock "on save" with no mention of merging into an
existing line. A composite key on `(WorkOrderId, PartId)` would silently forbid adding the same part to
the same work order twice (e.g. two separate top-ups of the same brake-pad set), which nothing in the
FSD rules out. A surrogate key keeps each add-parts call an independent line, matching the literal
wording of Rule 8. If the architect confirms parts should merge into one line per part per work order,
switch to the composite key and change the service to increment `Quantity` instead of inserting.

### 2.2 Which rules become DB constraints vs. stay service-layer-only

The root `CLAUDE.md` says business rules live in the service layer, never in controllers/routes — this
project extends that to mean **never in DB triggers either**: a trigger silently encoding a rule is as
hidden from reviewers as one in a controller. Constraints are used only for structural invariants that
are true for any single row, independent of "today" or the row's previous state.

**Enforced as DB constraints** (deterministic, single-row, so safe as a backstop):
- Rule 4, coherent dates (FSD:108): `CHECK (DueDate >= OpenedDate)`.
- Rule 6, Critical SLA (FSD:110, resolved as calendar days by clarification #2): `CHECK (Priority <>
  'Critical' OR DueDate <= DATEADD(day, 2, OpenedDate))`.
- Rule 9, completion needs an assignee (FSD:115-116, and clarification #3 — exempts `Cancelled`):
  `CHECK (Status <> 'Completed' OR Type = 'Inspection' OR AssignedDriverId IS NOT NULL)`.
- All the plain numeric/enum bounds already listed per-column above (`OdometerKm >= 0`, `UnitCost >=
  0`, enum lists, etc.).
- Rule 1, vehicle depot integrity (FSD:105): the `Vehicle.DepotId` foreign key.

**Rejected as DB constraints — left to the service layer**, with the reason each can't be a constraint:
- Rule 3, no work on a retired vehicle (FSD:107): requires reading `Vehicle.Status` from a different
  table at `WorkOrder` insert time — not expressible in a single-row `CHECK`, and a cross-table trigger
  was rejected for the reason above.
- Rule 5, no back-dating (FSD:109): needs server "today", which SQL Server's `CHECK` constraints
  cannot reference (`GETDATE()` is non-deterministic and disallowed in a `CHECK`).
- Rule 7, breakdown auto-status (FSD:111-112): `Vehicle.Status` is *derived* from the existence of open
  `Breakdown` work orders elsewhere — the FSD itself assigns this to "the System" (FSD:34-35), i.e. the
  service layer recomputes it whenever a relevant `WorkOrder` changes status.
- Rule 10, status state machine (FSD:117-119): a `CHECK` sees only the new row, not the row's previous
  `Status`, so the transition table can't be expressed as a constraint at all.
- Rule 12, monotonic odometer (FSD:122-123): same problem — comparing new vs. previous value needs an
  `UPDATE` trigger, which is exactly the hidden-business-logic pattern being avoided here.
- Rule 8's stock decrement (FSD:113-114) is an *action* (write to `Part.QuantityInStock`), not an
  invariant — the `>= 0` bound is enforced by the `CHECK`, but performing the decrement is service code.

### 2.3 `PartsCost` / `TotalCost` are not stored as live columns — but a frozen snapshot is

FSD:85 marks both as **Derived**, and the natural reading is "compute, don't store" — so no live
`PartsCost`/`TotalCost` columns exist. But Rule 11 (FSD:120-121) says completion "freezes `TotalCost`."
A purely computed value can't be frozen: if `Part.UnitCost` changes later, a live computation of a
completed work order's cost would silently drift, which contradicts "freezes."

**Decision:** add two nullable columns, `PartsCostAtCompletion` and `TotalCostAtCompletion`, written
**once**, by the service, at the moment `Status` transitions to `Completed`. While a work order is not
`Completed`, both stay `NULL` and the API computes `PartsCost`/`TotalCost` live from
`WorkOrderPart`/`Part`, exactly as FSD:85 states.

**Rejected alternatives:**
- *Pure computed value, never stored* — rejected because it cannot satisfy Rule 11's "freezes" once
  `UnitCost` is mutable.
- *Always-live cached columns, recalculated on every parts change* — rejected because it duplicates
  derivable data as a mutable cache (a sync-bug risk) and still wouldn't be a "freeze" — it would keep
  changing right up to completion and need special-casing there anyway. The two-nullable-column design
  is the smallest change that satisfies Rule 11 without caching anywhere else.
- Naming them `PartsCost`/`TotalCost` directly on the row — rejected to keep it visually obvious in the
  schema that these are a stamped snapshot, not the live FSD:85 figures, so a future reader doesn't
  read them as always-current.

### 2.4 No audit columns, no soft delete

**Decision:** no `CreatedAt`, `UpdatedAt`, `CreatedBy`, `IsDeleted`, or equivalent, on any table.

**Rejected because:** none of these appear in Section 3, Section 6 defines no `DELETE` endpoint for any
entity, and the root `CLAUDE.md` and FSD guardrails both say not to invent columns the spec doesn't
state (FSD's own framing, "do not invent entities, columns or rules the FSD does not state"). If
auditability is needed later, that's an FSD change, not a schema-only addition made unilaterally here.

### 2.5 Foreign keys default to `ON DELETE NO ACTION`

**Decision:** every FK (`Vehicle.DepotId`, `Driver.DepotId`, `WorkOrder.VehicleId`,
`WorkOrder.AssignedDriverId`, `WorkOrderPart.WorkOrderId`, `WorkOrderPart.PartId`) is `NO ACTION`
(SQL Server's default) rather than `CASCADE`.

**Rejected alternative:** `ON DELETE CASCADE` from `Vehicle`/`Depot` down to `WorkOrder`/`WorkOrderPart`.

**Why:** Section 6 defines no delete endpoint anywhere (FSD:125-142) — the FSD doesn't anticipate rows
being deleted at all, only status-transitioned. A cascade default would mean that *if* a delete were
ever added carelessly, whole work-order history could vanish silently. Restrict is the safer default
given the FSD is silent on deletion; this can be revisited the day a delete requirement is actually
specified.

### 2.6 Enums stored as constrained strings, not lookup tables

**Decision:** `Status`, `Type`, `Priority` columns are `nvarchar` with a `CHECK ... IN (...)` constraint,
not a foreign key to a separate lookup table.

**Rejected alternative:** normalized lookup tables (`VehicleStatus`, `WorkOrderType`, etc.) with FK
references.

**Why:** every enum in Section 3 is a small, closed, named list given directly in the FSD text
(FSD:56, 64, 79, 80, 81) — there's no stated requirement to add, rename, or configure values at
runtime. Lookup tables would add joins and an extra layer of indirection the FSD gives no reason to need,
and root `CLAUDE.md`'s "names match the FSD exactly" is easiest to keep true for the *values* too when
they're literal strings that are diffable against the spec, not opaque foreign keys into another table.

### 2.7 No DB default for `WorkOrder.Status` at creation

**Decision:** `Status` has no column default (e.g. no `DEFAULT 'Open'`); the value must be supplied on
insert.

**Why:** the FSD never states that new work orders start `Open` as a schema-level default — Section 6's
create endpoint (FSD:134) is the place that decides the initial value, and putting it there keeps the
one statement of "new work orders are Open" in the service/API layer instead of splitting it across two
layers that could drift apart.

### 2.8 Nullability inferred from the FSD's own "nullable" annotations

**Decision:** a column is nullable only where FSD:74-91 explicitly says "nullable" — `CompletedDate`
(FSD:82) and `AssignedDriverId` (FSD:83). Every other attribute, including `Description` (FSD:78), is
`NOT NULL`.

**Why:** the FSD calls out "nullable" exactly twice in the entity list, which reads as a deliberate
signal — everywhere else, silence means required. Treating unannotated fields as optional-by-default
would have been a guess the FSD doesn't support.

### 2.9 Indexes limited to what Section 6 already asks for

**Decision:** beyond the `UNIQUE` constraints (which SQL Server indexes automatically), the only
explicit non-unique indexes added are `Vehicle(DepotId)` and `WorkOrder(VehicleId)`.

**Rejected alternative:** indexing every foreign key (`Driver.DepotId`, `WorkOrder.AssignedDriverId`,
`WorkOrderPart.WorkOrderId`, `WorkOrderPart.PartId`) pre-emptively.

**Why:** `GET /api/depots/{id}/vehicles` and `GET /api/vehicles/{id}/work-orders` are named endpoints in
Section 6 (FSD:129-130), so those two access paths are confirmed. The other FKs have no listed endpoint
yet to justify an index — adding one on a guess is speculative tuning with no stated query to size it
against. Add the rest when the endpoint or report that needs them is confirmed (Section 6's reporting
endpoints, FSD:139-142, are likely candidates once their query shape is known).

---

## 3. Relationships (FSD:93-98)

| Relationship | Cardinality | FSD basis |
|---|---|---|
| Depot → Vehicle | 1—* | FSD:95 |
| Depot → Driver | 1—* | FSD:95 |
| Vehicle → WorkOrder | 1—* | FSD:96 |
| Driver → WorkOrder | 1—* (optional; `AssignedDriverId` nullable) | FSD:97 |
| WorkOrder → WorkOrderPart | 1—* | FSD:98 |
| Part → WorkOrderPart | 1—* | FSD:98 |

`WorkOrder ↔ Part` is many-to-many, realised through `WorkOrderPart` — the FSD states this by giving
that entity both FKs (FSD:89-90) rather than a direct link.

---

## 4. Open items for architect/BA sign-off

1. §2.1 — confirm whether repeat additions of the same part to the same work order should be separate
   lines (current design) or merged into one line with an incremented quantity.
2. §2.3 — confirm the frozen-cost-snapshot approach satisfies the intent of Rule 11; the FSD doesn't
   say what should happen if `UnitCost` changes after completion, and this design assumes "freeze"
   means the completed order's cost never moves again.
3. §2.9 — confirm which of Section 6's reporting endpoints (FSD:139-142) are being built next, so their
   indexes can be added deliberately rather than guessed.

Nothing above changes Section 3–4's entities, attributes, or relationships — only how they're
physically realised.

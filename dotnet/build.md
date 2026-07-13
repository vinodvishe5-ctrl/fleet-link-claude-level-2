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

## 3. Build order (follow the labs, not this list, day to day)

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

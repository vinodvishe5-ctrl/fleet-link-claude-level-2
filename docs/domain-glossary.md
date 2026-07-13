# FleetLink domain glossary

Shared vocabulary so both tracks and every team member mean the same thing.

- **Depot** — a location where vehicles are based and work is carried out.
- **Vehicle** — a fleet asset. Has a status: `Active`, `InMaintenance`, `Retired`.
- **Driver** — a person who operates vehicles and may be assigned to a work order.
- **Part** — a stock item consumed by work orders; has a unit cost and a quantity in stock.
- **Work order** — the central record of a unit of maintenance work on one vehicle.
  - **Type** — `Scheduled` (planned service), `Inspection` (check only), `Breakdown` (unplanned repair).
  - **Priority** — `Low`, `Medium`, `High`, `Critical`.
  - **Status** — `Open`, `InProgress`, `OnHold`, `Completed`, `Cancelled`.
- **WorkOrderPart** — a line recording a quantity of one part used on one work order.
- **Labour cost / parts cost / total cost** — total cost = labour + Σ(part quantity × unit cost).
- **Critical SLA** — a `Critical` work order must be due within 2 days of being opened.
- **Breakdown auto-status** — a vehicle with an open breakdown work order is automatically
  `InMaintenance`.
- **Monotonic odometer** — a vehicle's odometer reading may only increase or stay equal on update.
- **Server "today"** — the date the system treats as now, used for back-dating and SLA checks.

# Day 1 (2.A) — Understanding the FleetLink spec

*My own words, after reading `docs/FSD-FleetLink.md` with Claude and checking its summary against the spec.*

## What FleetLink is

A back-office system a regional operations team uses to keep a fleet of vehicles on the road. It tracks
**depots** (where vehicles are based), the **vehicles** themselves, the **drivers** who operate them, and
the **parts** used to repair them — and at the centre, the **work orders** that record every service,
inspection and breakdown repair, including the parts consumed. It is a deliberately ordinary enterprise
app: shared data, clear rules, reporting, a long life, integrations later.

## Who uses it

- **Fleet Coordinator** — creates/assigns work orders, moves them through their lifecycle, records parts.
- **Depot Manager** — views a depot's vehicles/drivers/open work, signs off completions.
- **Maintenance Reviewer** — reads reports only; does not edit operational data.
- **System** — enforces the rules and keeps derived state (vehicle status, stock, cost) consistent.

## The five rules I think are hardest to get right

1. **Breakdown auto-status (rule 7)** — a vehicle flips to `InMaintenance` while it has an open/in-progress
   `Breakdown` work order, and back to `Active` only when none remain. Derived state that has to stay
   consistent across multiple work orders — easy to get subtly wrong.
2. **Stock cannot go negative (rule 8)** — adding parts must reject over-stock (`409`) *and* decrement
   stock atomically on save. Ordering and concurrency matter.
3. **Status state machine (rule 10)** — only specific transitions are allowed; `Completed`/`Cancelled`
   are terminal. Needs one authoritative definition, not scattered `if`s.
4. **Completion requires an assignee (rule 9)** — completing a non-`Inspection` work order needs an
   `AssignedDriverId`. A cross-field rule that's easy to forget on the UI side.
5. **Critical SLA (rule 6)** — a `Critical` work order must be due within 2 days of `OpenedDate`. Small
   but exact; interacts with the date rules (4, 5).

## Questions I'd take back to the BA

1. **Is part stock global, or per depot?** The FSD gives `Part.QuantityInStock` as a single number with
   **no** Part→Depot link — so stock is global. Worth confirming, because a real fleet often stocks parts
   *per depot*. If it should be per-depot, that changes the data model materially (this is exactly the
   kind of thing to settle before 2.C, not after).
2. **Do we need audit fields** (created/modified timestamps, who changed a work order)? The FSD lists
   none. Reporting and support usually want them — confirm before we design the schema.

## The "helpful hallucination" I caught

When Claude summarised the spec it described parts as being **"stocked at each depot"** and drew a
Depot → Part relationship. **The FSD never says that** — `Part` has a single global `QuantityInStock`
and §4 lists no Part–Depot relationship. It's a completely plausible addition (real fleets do stock per
depot), which is exactly what makes it dangerous: if we'd built it in, we'd have designed a relationship
the spec doesn't ask for. Noted as a **question for the BA**, not a fact.

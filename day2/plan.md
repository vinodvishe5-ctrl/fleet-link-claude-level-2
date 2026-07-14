# Day 2 (2.B) — FleetLink build plan (confirmed against the FSD)

Claude drafted this from `docs/FSD-FleetLink.md` and `docs/build-sequence.md`; I confirmed it against the
spec. The order is **database-first** (per ADR-001). Every slice traces to an FSD section or rule, and
each has a **human checkpoint** before it. This is the plan we execute across 2.B–2.I — today (2.B) we
build only the first two, non-domain slices.

> **How to read this:** each slice is the *smallest thing that runs end to end* and proves one increment.
> "Owner" = who confirms the checkpoint before the slice is accepted.

## The slices, in order

| # | Slice | Builds | Traces to | Checkpoint owner | Module |
|---|-------|--------|-----------|------------------|--------|
| 0 | **Frame folders** | Empty layered folders (models, data, services, endpoints/routes) | build sequence | Developer | **2.B** |
| 1 | **`GET /api/meta`** (non-domain) | Route/endpoint → service, returns app metadata; proves the layering | — (frame proof) | Developer | **2.B** |
| 2 | **Domain model + seed** | Entities + enums + in-memory store + fixed seed data | FSD §3, §7 | Architect + BA | 2.C |
| 3 | **Read endpoints** | `GET /api/depots`, `/vehicles`, `/vehicles/{id}/work-orders`, `/parts`, … | FSD §6 (read side) | Developer | 2.C→2.D |
| 4 | **Create work order** | `POST /vehicles/{id}/work-orders` with rules 2–6 (real vehicle, no retired, coherent/critical dates) | FSD §5.2–5.6, §6 | Developer | 2.D |
| 5 | **Status transitions** | `PATCH /work-orders/{id}/status` state machine + completion rules | FSD §5.9–5.11 | Developer | 2.D |
| 6 | **Parts + stock** | `POST /work-orders/{id}/parts`, stock cannot go negative, decrement, cost derivation | FSD §5.8, §3.5 | Developer | 2.D |
| 7 | **Odometer + breakdown status** | `PATCH /vehicles/{id}/odometer` (monotonic) + breakdown auto-status | FSD §5.12, §5.7 | Developer | 2.D |
| 8 | **Validation (client + backend)** | Boundary validation kept consistent with the service rules | FSD §5 | Developer | 2.D |
| 9 | **Reporting** | `open-work-by-depot`, `overdue-work-orders`, `cost-per-vehicle` | FSD §6 (reporting) | Developer | 2.D+ |
| 10 | **UI** | Screens from the API contract + design system | FSD §6 | UI/UX | 2.E |
| 11 | **Tests across layers** | One test per FSD §5 rule + endpoint status-code tests | FSD §5, §6 | Test | 2.I |

## Today (2.B) — slices 0 and 1 only

- **Slice 0 — frame folders:** `models/ data/ services/ routes|endpoints/` (folders only, READMEs).
- **Slice 1 — `GET /api/meta`:** a service returning `{ app, track, version, buildStage, plannedEntities }`,
  a thin route/endpoint calling it. No business logic — it proves the layering so slices 2+ slot straight in.
- Plus: sharpen `CLAUDE.md`, and capture the slice procedure as the `add-slice` skill.

## What I cut from Claude's draft (not in the spec)

- Claude's draft added an **authentication/login slice** early on. The FSD §9 puts auth **out of scope**
  for the training build (stubbed actor only) — cut it, noted as a later stretch goal.
- Claude's draft inferred a **notifications/email slice** on work-order completion. The FSD never mentions
  notifications — cut; question for the BA if it's ever wanted.

## Human checkpoints (non-negotiable)

Nothing flows to the next slice until its owner confirms the last one against the spec. Claude accelerates
the work *between* checkpoints; it never removes them. (Same rule as the build sequence and ADR-001.)

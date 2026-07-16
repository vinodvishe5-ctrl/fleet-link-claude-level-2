# FleetLink slice plan — module → slice (reviewed)

Source: `docs/FSD-FleetLink.md` (what), `docs/build-sequence.md` + `labs/README.md` (when/order),
`docs/FSD-clarifications.md` (ambiguity resolutions). This is a planning artifact — no code.

## What changed from the first draft, and why

| # | Flag on v1 | Fix applied in this version |
|---|------------|------------------------------|
| 1 | Rule 7 (breakdown auto-status) was filed only under 2.D's "status-transition slice." It actually fires on **creation** too (opening a Breakdown WorkOrder must flip the vehicle to `InMaintenance` immediately, not just on a later status change). | Rule 7 is now called out as its own cross-cutting concern, implemented alongside *both* the create-WorkOrder slice and the status-transition slice in 2.D. |
| 2 | Reporting endpoints were hedged as "2.D, or 2.I if not done already" — no real decision. | Committed: reporting endpoints are built in **2.D** (they're read-only and low-risk, matching the FSD's "2.D / later" wording). 2.I only tests what already exists; it does not build new endpoints. |
| 3 | 2.G and 2.H were compressed into one row even though they're two distinct modules sharing a calendar day. | Split into two explicit rows. |
| 4 | Nothing recorded what's permanently out of scope (§9), risking someone in 2.K inventing auth or payments for the agent lab. | Added an explicit "Out of scope — never built" section. |
| 5 | No mention that removing/editing a `WorkOrderPart` line has no endpoint in §6 (only adding parts exists), which is easy to assume-in during 2.D or 2.E. | Added as a named gap under 2.D, consistent with [[FSD-clarifications]] #4 (no stock restore). |
| 6 | 2.E UI slice didn't say explicitly that "Depot Manager sign-off" is just the existing Completed-transition button, risking an invented "Approve" feature. | Added a one-line tie-back to clarification #6 under 2.E. |
| 7 | 2.J's RAG corpus was vague ("own docs and code"). | Named the actual corpus: FSD, clarifications, domain glossary, build-sequence, CLAUDE.md files, plus code once it exists. |
| 8 | 2.K's agent example was presented as a decided feature, but it's five modules away and shouldn't be pre-committed. | Reworded as a guardrail *principle* (rules 1–12 become the agent's constraints), with the concrete feature explicitly marked TBD at day 10. |
| 9 | 2.B's description was generic; the actual lab guide (`labs/day-2-claude-code.md`) is more specific (brownfield `/version` + greenfield `/api/meta` with a static `plannedEntities` list). | Tightened 2.B's row to match the real lab deliverables, and marked it **in progress** (today), not done. |

## Module → slice plan

| Module | Day | Slice — what gets built | FSD source |
|---|---|---|---|
| **2.A** Approach & Architecture — done | Day 1 | Decide DB-first vs software-first; draft the candidate entity list; set `CLAUDE.md` baseline. No running code. | §3 (draft entities), §8 |
| **2.B** Claude Code Foundations — in progress (today) | Day 2 | Brownfield: `GET /version` added to the Day-1 skeleton in its existing style. Greenfield: scaffold empty layered folders (models/data/services/endpoints), sharpen `CLAUDE.md`, then one non-domain slice `GET /api/meta` returning a static `plannedEntities` list. **Zero business rules, zero real entities.** | none — deliberately pre-domain |
| **2.C** Database & Domain Model | Day 3 | Confirm schema from §3/§4 (locked per clarification #1); generate `Depot`, `Vehicle`, `Driver`, `Part`, `WorkOrder`, `WorkOrderPart` database-first; migrations; seed data per §7 (2 depots, 4 vehicles, 3 drivers, 4 parts, 3 work orders). | §3, §4, §7 |
| **2.D** API & Business Logic | Day 4 | Sliced by aggregate, in this order: <br>1. **Read slice** — all `GET` endpoints in §6 <br>2. **Create-WorkOrder slice** — `POST /vehicles/{id}/work-orders`, rules 1–6, **and** rule 7's creation-time trigger (opening a Breakdown WO flips the vehicle to `InMaintenance` immediately) <br>3. **Status-transition slice** — `PATCH /work-orders/{id}/status`, rules 9, 10, 11, **and** rule 7's transition-time re-check (vehicle reverts to `Active` once no Open/InProgress Breakdown WO remains) <br>4. **Parts-usage slice** — `POST /work-orders/{id}/parts`, rule 8. *Known gap:* no endpoint exists to remove/edit a `WorkOrderPart` line — matches clarification #4 (no stock restore), don't invent one. <br>5. **Odometer slice** — `PATCH /vehicles/{id}/odometer`, rule 12, allowed regardless of vehicle status (clarification #5) <br>6. **Reporting slice** — the 3 `GET /reports/*` endpoints, built here (not deferred to 2.I) <br>Client + backend validation kept consistent across all six. | §5 (rules 1–12), §6 |
| **2.E** UI/UX & Front-End | Day 5 | Screens from the §6 contract: depot/vehicle list+detail, work-order list/create/detail with status actions, parts-used entry, odometer update, report views. "Depot Manager signs off" (§2) is just the existing Completed-transition action — no separate Approve screen or field (clarification #6). | §6, §2 |
| **2.F** CLAUDE.md, Skills & Consistency | Day 6 | No domain slice. Grows `CLAUDE.md` and adds a Skill/slash-command/hook that enforces the Conventions section (layering, DTOs, status codes) automatically on future generations. | CLAUDE.md conventions (meta-slice) |
| **2.G** Multi-Team | Day 7 (am) | Role hand-off across the chain — one person's Coordinator-side work picked up and extended by another acting as Depot Manager or Reviewer, exercising the same rules under a different actor. | §2 (actors) |
| **2.H** Debugging & RCA | Day 7 (pm) | A bug is planted in one of the 12 business rules; diagnose and fix it with a written root-cause analysis. | §5 |
| **2.I** System & Integration Testing | Day 8 | Test coverage for all 12 rules, all §6 endpoints (including the reporting endpoints already built in 2.D), and seed data (§7) as fixtures. Triage and fix failures. **Builds no new endpoints.** | §5, §6, §7 |
| **2.J** RAG | Day 9 (am) | Developer Q&A assistant grounded in FleetLink's own corpus — `FSD-FleetLink.md`, `FSD-clarifications.md`, `domain-glossary.md`, `build-sequence.md`, both `CLAUDE.md` files, and the code once it exists — with citations back to source. | whole FSD + clarifications + code |
| **2.K** MCP & Agentic Lab | Day 10 (pm) | One small, guard-railed agent acting over FleetLink, with rules 1–12 as its hard constraints (not suggestions). Concrete feature is **TBD** at day 10 — not pre-committed here. | §5 as guardrails |
| **2.L** Consolidation & Q&A | Day 10 (pm) | Open clinic — no new slice. | — |

## Out of scope — never built (§9)

Authentication/authorisation beyond a stubbed actor, real payments, real telematics feeds, production
deployment. Named explicitly so 2.K's agent lab (or any later module) doesn't quietly grow one of
these — if it looks required, that's a signal to stop and ask, not to build it.

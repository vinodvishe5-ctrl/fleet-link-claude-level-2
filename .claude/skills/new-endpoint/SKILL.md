---
name: new-endpoint
description: >-
  Add a new DOMAIN endpoint to FleetLink the approved way — DTO at the edge, the rule in a service
  citing its FSD §5 number, a thin route/endpoint returning the FSD status codes, validation on the
  way in, and a test per rule. Use when asked to add or extend a FleetLink API endpoint that touches
  the domain (vehicles, work orders, parts, depots). This packages the Module 2.D pattern so every
  endpoint comes out identical no matter who adds it. For a NON-domain probe/status slice with no
  rules, use `add-slice` instead.
---

# new-endpoint — add a domain endpoint the FleetLink way

This skill captures the layered, rules-first pattern established in **Module 2.D** so any teammate can
add a *consistent* domain endpoint on demand instead of re-deciding the shape each time. It is the
"recipe" half of the Module 2.F consistency toolkit — CLAUDE.md holds the standing rules, this skill
holds the procedure.

## When to use / when NOT to
- **Use for:** a new or extended **domain** endpoint — a read or a write on `Vehicle`, `WorkOrder`,
  `Part`, `Depot`, or a new action on one of them (e.g. "add an endpoint to cancel a work order").
- **Do NOT use for:** a non-domain status/probe slice with no business rules → use `add-slice`.
  New entities, seed data or schema → those are designed database-first in Module 2.C. If asked for
  those, stop and say where they belong.

## Ask for these if the request doesn't state them
1. The **resource and action** (e.g. `POST /api/work-orders/{id}/cancel`).
2. The **FSD §5 rule(s)** it must enforce (quote the number, e.g. §5.9). If none is cited, find it in
   [`docs/FSD-FleetLink.md`](../../../docs/FSD-FleetLink.md) and confirm before writing.
3. The **request and response shape** (which existing DTOs it reuses or extends).

## Procedure — follow in this order, stop at the diff
1. **Read first — do not write yet.** Read the root [`CLAUDE.md`](../../../CLAUDE.md), the track
   `CLAUDE.md`, [`docs/standards.md`](../../../docs/standards.md), and the closest existing endpoint as
   the reference (e.g. `WorkOrderEndpoints` / `routes/workOrders.js`). Match them exactly.
2. **Detect the track** from the working directory — `dotnet/` or `javascript/` — and follow that
   track's layout. Both tracks stay in lock-step; only the language differs.
3. **Restate the plan** in one or two lines: the route, the FSD §5 rule(s) it enforces, the DTOs in and
   out, and the status codes it can return. Wait for nothing — just make it visible in the diff header.
4. **Build through the layers — the rule lives in the SERVICE, never in the route/endpoint:**
   - **DTO (the contract):** reuse an existing request/response DTO if one fits; only add a field the
     FSD names. `.NET` → `Dtos/RequestDtos.cs` / `Dtos/ResponseDtos.cs` (records) + a mapper in
     `Dtos/Mappers.cs`. `JavaScript` → `src/dtos/mappers.js`.
   - **Service (the rule):** put the business rule in the domain service
     (`WorkOrderService` / `workOrderService.js`, …). **Add a comment citing the FSD §5 number** on the
     rule, exactly like the existing rules. Derive costs in the service, never in the route.
   - **Validation (on the way in):** validate the request in the validator layer
     (`Validation/RequestValidators.cs` / `src/validation/validators.js`); return `400` on bad input.
   - **Route / endpoint (thin):** map the route to the service in `Endpoints/*Endpoints.cs` /
     `src/routes/*.js`. The route only validates, calls the service, and maps the result to a status
     code. No logic here.
5. **Honour the conventions (from CLAUDE.md / standards.md):**
   - The **one error shape** `{ "error": "...", "code": "..." }` via the central handler — never hand-roll.
   - The FSD **status codes**: `400` bad input, `404` missing, `409` rule violation, `201` created, `200` ok.
   - **String enums**, **server-generated ids**, **FSD-matching names**.
6. **Add a test per rule.** `.NET` → a test in `FleetLink.Tests` (mirror `WorkOrderServiceTests`).
   `JavaScript` → a `node --test` test under `test/`. Cover the happy path AND each rule violation
   (the `409`). Do not mark done until the new tests pass and the suite is still green.
7. **Show the diff and how to run it, then STOP for human review.** Do not commit — the person reviews
   the diff (they own every line) and commits at the checkpoint.

## Guardrails
- **Domain rules come from the FSD only.** Do not invent rules, fields, or status codes the FSD does
  not state. If the spec is ambiguous, ask.
- Add **nothing** the request didn't ask for — no new libraries, no new folder layout, no speculative
  fields.
- Sandbox rules apply and are also enforced by the guardrail hook: no real client data, PII, secrets or
  connection strings.

---
name: add-slice
description: >-
  Add a new NON-DOMAIN API slice (route/endpoint → service) to FleetLink, following the /api/meta
  reference pattern and the project CLAUDE.md conventions, stopping at the diff for review. Use when
  asked to add a simple new read endpoint the "FleetLink way" (e.g. a status/info/probe endpoint).
  Do NOT use for FSD entities, seed data or business rules — those are designed database-first in
  Module 2.C and generated with their rules in 2.D.
---

# add-slice — add a new API slice the FleetLink way

This skill captures the layered pattern established by the `/api/meta` slice in **Module 2.B**, so any
teammate can add a *consistent* slice on demand instead of re-describing the convention every time.
It is the first taste of what Module **2.F** turns into a full standards-enforcement toolkit.

## When to use / when NOT to
- **Use for:** a simple, **non-domain** read slice — a status page, an info/meta endpoint, a static
  list, a health-style probe. Something with no business rules.
- **Do NOT use for:** FleetLink entities (`Vehicle`, `WorkOrder`, …), seed data, or business rules.
  If asked for those, stop and say they belong to Modules 2.C / 2.D — do not generate them here.

## Ask for these if the request doesn't state them
1. The **route path** (e.g. `/api/status`).
2. A short **slice name** (e.g. `status`).
3. The **fixed, non-domain shape** it should return.

## Procedure
1. **Read first — do not write yet.** Read the root `CLAUDE.md`, the track `CLAUDE.md`, and the existing
   `/api/meta` slice (the reference). Match it exactly.
2. **Detect the track** from the working directory — `dotnet/` or `javascript/` — and follow that track's
   layout. The two tracks stay in lock-step; only the language differs.
3. **Generate the slice through the layers — never put logic in the route/endpoint:**
   - **.NET** (mirror `MetaEndpoints` / `MetaService` / `MetaDto`):
     - `Dtos/<Name>Dto.cs` — a record for the response (only if it's a shaped object).
     - `Services/I<Name>Service.cs` + `Services/<Name>Service.cs` — returns the response; **no rules**.
     - `Endpoints/<Name>Endpoints.cs` — `Map<Name>Endpoints` mapping the route to the service.
     - Register the service in `Program.cs` (DI) and call `Map<Name>Endpoints`.
   - **JavaScript** (mirror `metaService` / `routes/meta`):
     - `src/services/<name>Service.js` — returns the response; **no rules**.
     - `src/routes/<name>.js` — an Express router calling the service.
     - Wire it into `src/server.js`.
4. **Honour the conventions:** thin route/endpoint, the service holds any logic, the one error shape
   `{ "error": "...", "code": "..." }`, the FSD status codes, and FSD-matching names where relevant.
5. **Show the diff and how to run it, then STOP for human review.** Do not commit — the person reviews
   the diff (they own every line) and commits at the checkpoint.

## Guardrails
- **Non-domain only.** No FSD entities, seed data, or business rules.
- Add **nothing** the request didn't ask for — no invented fields, no new libraries, no new folder layout.
- Sandbox rules apply: no real client data, PII, secrets or connection strings.

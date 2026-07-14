# CLAUDE.md — FleetLink (shared project standards)

**Every Claude Code session on this repository reads this file first.** It is the shared instruction
set that keeps generated code consistent across people, tracks and days. In Module 2.F you will grow
it into a full standards-enforcement instrument; today it already sets the baseline.

## What this project is

FleetLink — a fleet & field-service work-order system. The functional spec in
[`docs/FSD-FleetLink.md`](docs/FSD-FleetLink.md) is the **source of truth**. Read it before generating
anything. Do not invent entities, columns or rules that the FSD does not state; if something is
ambiguous, ask rather than assume.

## Guardrails (non-negotiable)

- **Sandbox only.** In-memory / sample data only. **No real client data, no PII, no secrets, no
  connection strings** in code, comments, commits or prompts.
- All sample data (names, registrations, licences) is **fictional and clearly labelled**.
- Existing controls remain in force: peer review, branch discipline, SAST/DAST, pipelines. Generate
  code that fits inside that practice.

## How we work

- **Database-first for FleetLink.** The data model is designed deliberately from the FSD before the
  API is generated. See [`docs/build-sequence.md`](docs/build-sequence.md).
- **Human checkpoints are not skipped.** Claude drafts and accelerates; a human reviews and confirms at
  each step. Architecture decisions stay with the architect.
- **Branch per day.** See [`BRANCHING.md`](BRANCHING.md). Review every diff before committing.

## Conventions (both tracks)

- Layer the code: presentation (controllers/routes) → service (business rules) → repository/data.
  Keep business rules in the service layer, never in controllers/routes.
- Use DTOs at the API boundary; never expose internal models directly.
- Validate on the way in; return the FSD's status codes (`400` bad input, `404` missing, `409` rule
  violation, `201` created).
- Keep cross-cutting concerns — validation, error handling, logging — consistent and centralised, not
  copy-pasted per endpoint.
- Names match the FSD exactly (`WorkOrder`, `Depot`, `OdometerKm`, …) so both tracks and all people
  stay aligned.

## Conventions confirmed on Day 1 (2.A)

Three concrete rules we agreed while deciding the approach. Kept tight on purpose — `CLAUDE.md` grows
properly in Module 2.F.

- **One error shape, everywhere:** errors return `{ "error": "<message>", "code": "<SHORT_CODE>" }` with
  the FSD's status code (`400`/`404`/`409`). Centralise it — never hand-roll an error body per endpoint.
- **Enums are stored and exposed as strings** (`"Active"`, `"Breakdown"`, …), never as magic integers,
  so data and API payloads stay readable and stable.
- **Ids are server-generated** (Guid/uuid). Clients never supply an `Id` on create; the API assigns it.

## Track-specific standards

- .NET: see [`dotnet/CLAUDE.md`](dotnet/CLAUDE.md)
- JavaScript: see [`javascript/CLAUDE.md`](javascript/CLAUDE.md)

## When you generate

1. Restate what you are about to build and which FSD rules it covers.
2. Generate the smallest reviewable slice.
3. Show how to run/verify it.
4. Stop at the checkpoint for human review before moving on.

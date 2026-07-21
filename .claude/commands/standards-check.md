---
description: Review changes against the FleetLink CLAUDE.md + docs/standards.md and report any drift.
argument-hint: "[path or 'staged' or 'branch'; default = uncommitted changes]"
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep, Glob
---

You are running the FleetLink **standards check**. Review the code under review against the project
standards and report where it drifts — do **not** fix anything, just report.

## Scope
Target = `$ARGUMENTS`.
- empty → review the **uncommitted** changes: `git diff` (plus `git diff --staged`).
- `staged` → review `git diff --staged`.
- `branch` → review this branch vs `main`: `git diff main...HEAD`.
- a path → review that file or folder.

## What to check (from CLAUDE.md and docs/standards.md)
1. **Layering** — business rules live in the **service**, not in the route/endpoint or the controller.
   Routes stay thin (validate → call service → map status). Flag any rule that leaked into a route.
2. **Error handling** — the one error shape `{ "error", "code" }` via the central handler. Flag any
   hand-rolled error body or ad-hoc status code.
3. **Status codes** — `400` bad input, `404` missing, `409` rule violation, `201` created, `200` ok.
4. **Naming** — types/fields match the FSD names exactly (`WorkOrder`, `OdometerKm`, …).
5. **Enums** — stored/exposed as **strings**, never magic integers. Flag magic-int status/priority.
6. **DTOs** — the API exposes DTOs, never internal models directly.
7. **Rules cite the FSD** — each business rule in a service has a comment with its FSD §5 number.
8. **Front-end (if touched)** — styling comes from the design tokens, not hand-picked values; screens
   are built from the API contract.
9. **Guardrails** — no real client data, PII, secrets or connection strings (the hook blocks these, but
   report anything that slipped in as a comment/string).

## Output
A short report, grouped by severity:
- **Must fix** — a broken standard (rule in a route, hand-rolled error, magic-int enum, wrong status code).
- **Should fix** — a convention miss (name off, missing FSD § comment, token not used).
- **OK** — one line confirming what is consistent.

For each finding give the file, the line, the rule it breaks, and the one-line fix. End with a verdict:
**consistent** / **drift found**. Keep it tight — this runs often.

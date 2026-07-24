# CLAUDE.md — FleetLink JavaScript track conventions

Read together with the root [`../CLAUDE.md`](../CLAUDE.md) and the FSD. These are the JavaScript-specific
standards so every session generates code the same way.

## Stack

- Node.js 18+, Express, ES modules (`"type": "module"`).
- **In-memory store** for the training build (a module-level store seeded from `src/data/seed.js`).
  The agreed relational schema is recorded in Module 2.C (`../docs/schema.sql`); persistence to a real
  database (SQL Server / Azure SQL) is built with the API in Module 2.D.
- Tests: the built-in `node --test` runner (no extra framework needed).

## Structure & layering

```
src/
  models/     entity shapes / factory functions (match the FSD names exactly)
  data/       in-memory store + seed
  services/   business rules live here (workOrderService, vehicleService, ...)
  routes/     Express routers, one per resource; routes stay thin
  server.js   wires routers + middleware
```

- Business rules go in **services**, never in routes.
- Routes validate input, call a service, and map the result to a status code — nothing more.
- Keep functions small and pure where you can, so they are easy to test.

## API conventions

- Return the FSD's status codes: `201` created, `400` bad input, `404` missing, `409` rule violation.
- Use one consistent error shape (`{ error, code }`) from shared middleware — do not hand-roll error
  bodies per route.
- `camelCase` for variables and functions; keep entity property names identical to the FSD.
- Prefer async/await; centralise error handling with an Express error middleware.

## Project layout & build stage

**Current stage: Module 2.H — Debugging & RCA (Day 7 also adds the 2.G parts hand-off endpoint). The app is complete through the 2.E UI; 2.F adds the
consistency instruments (grown root `CLAUDE.md` + [`docs/standards.md`](../docs/standards.md); the
`new-endpoint` skill, the `/standards-check` command, the guardrail hook, the `standards-reviewer`
subagent — all in [`../.claude/`](../.claude/)). Build stage: `2.H — Debugging & RCA`.**

Consistency is constrained **up front** here: add domain endpoints with the `new-endpoint` skill so the
DTO → service-rule (with `// FSD §5.x`) → thin route → validation → test pattern is identical every time.
The guardrail hook blocks secrets/connection strings on every write. See the root `CLAUDE.md` "Consistency
instruments" section.

- `public/` — the front-end: `css/design-system.css` (design tokens = the single styling source),
  `js/api.js` (one method per 2.D endpoint), `js/app.js` (hash-router screens), `index.html` (shell).
  Generated from the **API contract + the design system**, never free-form. Served via `express.static`.

```
src/
  server.js       wires routers + the ONE error handler (registered last); seeds the store at startup
  health.js       registerHealthRoutes  (seed)
  dtos/           mappers.js — response DTOs (the API exposes DTOs, never entities); costs derived in the service
  services/       business rules (workOrderService = FSD §5.2–5.11, vehicleService = §5.7/§5.12, costing); metaService (non-domain)
  routes/         thin routers: depots, vehicles, work-orders, parts, meta — validate, call service, map to a status code
  validation/     boundary validators mirroring the service rules (Part C)
  middleware/     errorHandler (one { error, code } shape) + asyncHandler
  models/         FSD entity factories + enums (2.C) — shapes only
  data/           store.js + seed.js, in-memory, fixed uuids (2.C)
```

Every business rule lives in a **service** and cites its FSD §5 rule number in a comment; routes stay thin
and the `/api/meta` slice is still the reference layering pattern. Reads were built before writes on
purpose (a read carries no rule). Reports (`GET /api/reports/...`) are a later stretch (FSD §6).

## Guardrails

Sandbox only · in-memory/sample data only · **no real client data, PII, secrets or connection
strings.** All seed data is fictional and labelled.

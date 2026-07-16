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

**Current stage: Module 2.C — data model. `models/` (shapes) and `data/` (state) are now filled;
`services/` and domain `routes/` stay empty until Module 2.D. Build stage: `2.C — data model; API is 2.D`.**

```
src/
  server.js   wires routers + middleware; seeds the store at startup
  health.js   registerHealthRoutes  (seed)
  routes/     meta.js (non-domain; now reports the seed counts) — domain routers in 2.D
  services/   metaService.js (non-domain) — domain services in 2.D
  models/     FSD entity factories + enums (2.C) — shapes only, no logic
  data/       store.js + seed.js, in-memory, fixed uuids (2.C)
```

Endpoints so far (all non-domain): `GET /health` (seed), `GET /api/meta` (now reports the seed counts).
The `/api/meta` slice is the reference pattern for layering: router → service, no rules in the route.
Follow it when the domain API is generated in 2.D.

## Guardrails

Sandbox only · in-memory/sample data only · **no real client data, PII, secrets or connection
strings.** All seed data is fictional and labelled.

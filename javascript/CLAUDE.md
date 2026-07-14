# CLAUDE.md — FleetLink JavaScript track conventions

Read together with the root [`../CLAUDE.md`](../CLAUDE.md) and the FSD. These are the JavaScript-specific
standards so every session generates code the same way.

## Stack

- Node.js 18+, Express, ES modules (`"type": "module"`).
- **In-memory store** for the training build (a module-level store seeded from `src/data/seed.js`).
  A real database is introduced deliberately in Module 2.C — do not add one before then.
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

**Current stage: Module 2.B — scaffold. Domain arrives in Module 2.C — do not create entities yet.**

```
src/
  server.js   wires routers + middleware
  health.js   registerHealthRoutes  (seed)
  routes/     meta.js (2.B, non-domain) — domain routers in 2.D
  services/   metaService.js (2.B, non-domain) — domain services in 2.D
  models/     (empty — FSD entity shapes in 2.C)
  data/       (empty — store + seed in 2.C)
```

Endpoints so far (all non-domain): `GET /health` (seed), `GET /api/meta`. The `/api/meta` slice is the
reference pattern for layering: router → service, no rules in the route. Follow it when the domain
arrives.

## Guardrails

Sandbox only · in-memory/sample data only · **no real client data, PII, secrets or connection
strings.** All seed data is fictional and labelled.

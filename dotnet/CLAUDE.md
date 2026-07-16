# CLAUDE.md — FleetLink .NET track conventions

Read together with the root [`../CLAUDE.md`](../CLAUDE.md) and the FSD. These are the .NET-specific
standards so every session generates code the same way.

## Stack

- .NET 8, ASP.NET Core Web API. C# with nullable + implicit usings enabled.
- **In-memory store** for the training build (a singleton repository seeded from `Data/SeedData`).
  The agreed relational schema is recorded in Module 2.C (`../docs/schema.sql`); a real EF Core +
  SQL Server / Azure SQL model is built with the API in Module 2.D.
- Tests: xUnit in a sibling `FleetLink.Tests` project.

## Structure & layering

```
src/FleetLink.Api/
  Models/        domain entities (match the FSD names exactly)
  Dtos/          request/response DTOs — the API never exposes Models directly
  Data/          in-memory store + SeedData
  Services/      business rules live here, behind interfaces (IWorkOrderService, ...)
  Endpoints/     minimal-API endpoint groups (or Controllers/ if the team prefers MVC)
```

- Business rules go in **Services**, never in endpoints/controllers.
- One service method = one use case; keep them small and testable.
- Register services and the store in `Program.cs` via DI.

## API conventions

- Return the FSD's status codes: `201` created, `400` bad input, `404` missing, `409` rule violation.
- Use `Results.Ok/Created/NotFound/BadRequest/Conflict(...)` with a consistent problem shape for errors
  (`{ error, code }`). Centralise it — do not hand-roll error bodies per endpoint.
- Validate at the boundary (DataAnnotations or FluentValidation) **and** enforce rules in the service.
- `PascalCase` for public members, `camelCase` for locals, DTO suffix `...Dto`, request suffix
  `...Request`.

## Project layout & build stage

**Current stage: Module 2.C — data model. `Models/` (shapes) and `Data/` (state) are now filled;
`Services/` and `Dtos/` stay empty until Module 2.D. Build stage: `2.C — data model; API is 2.D`.**

```
src/FleetLink.Api/
  Models/     FSD entities + Enums (2.C) — shapes only, no logic, no derived fields
  Data/       FleetStore + SeedData, in-memory, fixed Guids (2.C)
  Endpoints/  HealthEndpoints (seed), MetaEndpoints (2.B; now reports the seed counts)
  Services/   IMetaService/MetaService (non-domain) — domain services in 2.D
  Dtos/       MetaDto (+ SeedCountsDto) — domain DTOs in 2.D
  Program.cs  wires DI + maps the endpoint groups; logs the loaded seed counts
```

Endpoints so far (all non-domain): `GET /health` (seed), `GET /api/meta` (now reports the seed counts).
The `/api/meta` slice is the reference pattern for layering: endpoint → service → DTO, no rules in the
endpoint. Follow it when the domain API is generated in 2.D.

## Guardrails

Sandbox only · in-memory/sample data only · **no real client data, PII, secrets or connection
strings.** All seed data is fictional and labelled.

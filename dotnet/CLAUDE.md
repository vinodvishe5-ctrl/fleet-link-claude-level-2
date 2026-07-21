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

**Current stage: Module 2.F — Consistency. The app is complete through the 2.E UI; 2.F adds the
consistency instruments (grown root `CLAUDE.md` + [`docs/standards.md`](../docs/standards.md); the
`new-endpoint` skill, the `/standards-check` command, the guardrail hook, the `standards-reviewer`
subagent — all in [`../.claude/`](../.claude/)). Build stage: `2.F — Consistency`.**

Consistency is constrained **up front** here: add domain endpoints with the `new-endpoint` skill so the
DTO → service-rule (with `// FSD §5.x`) → thin endpoint → validation → test pattern is identical every
time. The guardrail hook blocks secrets/connection strings on every write. See the root `CLAUDE.md`
"Consistency instruments" section.

- `wwwroot/` — the front-end: `css/design-system.css` (design tokens), `js/api.js` (one method per 2.D
  endpoint), `js/app.js` (hash-router screens), `index.html` (shell). Generated from the **API contract +
  the design system**, never free-form.

```
src/FleetLink.Api/
  Models/      FSD entities + Enums (2.C); WorkOrder gained CompletedTotalCost — the rule-11 completion snapshot
  Data/        FleetStore + SeedData, in-memory, fixed Guids (2.C)
  Dtos/        ResponseDtos + RequestDtos + Mappers (the API exposes DTOs, never Models; enums as strings)
  Services/    IWorkOrderService (FSD §5.2–5.11), IVehicleService (§5.7/§5.12), IDepotService, IPartService, Costing
  Endpoints/   Depot/Vehicle/WorkOrder/Part endpoint groups — thin: validate, call service, map to a status code
  Validation/  RequestValidators mirroring the service rules (Part C)
  Common/      DomainException, Errors, IClock, Dates, Enums, ExceptionHandlingMiddleware (the one error shape)
  Program.cs   registers store + IClock + the domain services; adds the exception middleware; maps the groups
src/FleetLink.Tests/   xUnit — one test per FSD §5 rule + read side (dotnet test)
```

Every business rule lives in a **service** and cites its FSD §5 rule number in a comment; endpoints stay
thin. Reads were built before writes on purpose (a read carries no rule). The hand-written `Mappers` are
the dependency-light stand-in for an AutoMapper profile. Reports (`GET /api/reports/...`) are a later
stretch (FSD §6).

## Guardrails

Sandbox only · in-memory/sample data only · **no real client data, PII, secrets or connection
strings.** All seed data is fictional and labelled.

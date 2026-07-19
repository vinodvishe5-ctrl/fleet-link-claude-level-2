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

**Current stage: Module 2.D — API & business logic. `Dtos/`, `Services/` and the domain `Endpoints/` are
now filled: the API enforces the FSD §5 rules in the services (behind interfaces), with boundary
validation kept consistent with them, and every failure returns the one `{ error, code }` shape via
`Common/ExceptionHandlingMiddleware`. Build stage: `2.D — API; UI is 2.E`.**

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

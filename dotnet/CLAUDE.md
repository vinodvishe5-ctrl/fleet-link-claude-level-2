# CLAUDE.md — FleetLink .NET track conventions

Read together with the root [`../CLAUDE.md`](../CLAUDE.md) and the FSD. These are the .NET-specific
standards so every session generates code the same way.

## Stack

- .NET 8, ASP.NET Core Web API. C# with nullable + implicit usings enabled.
- **In-memory store** for the training build (a singleton repository seeded from `Data/SeedData`).
  A real EF Core + SQL Server model is introduced deliberately in Module 2.C — do not add a database
  before then.
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

## Guardrails

Sandbox only · in-memory/sample data only · **no real client data, PII, secrets or connection
strings.** All seed data is fictional and labelled.

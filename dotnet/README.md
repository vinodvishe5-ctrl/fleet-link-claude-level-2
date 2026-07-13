# FleetLink — .NET track

ASP.NET Core (.NET 8) Web API. This folder is the **.NET** build of the FleetLink running project.

## Prerequisites (already on your VM)

- .NET 8 SDK — check with `dotnet --version` (expect `8.x`)
- Your IDE: Visual Studio, VS Code (C# Dev Kit) or Rider
- Claude Code, signed into your own account

## Run the skeleton (Day 1)

```bash
cd dotnet
dotnet run --project src/FleetLink.Api
```

Then open **http://localhost:5080/health** — you should see:

```json
{ "status": "ok", "app": "FleetLink", "track": ".NET", "utc": "..." }
```

That is the whole seed: one health endpoint that proves your toolchain works. From Day 2 you grow this
into the full application.

## What Claude Code builds here

The complete brief is in [`build.md`](build.md) — read it before generating. The functional spec it
builds toward is [`../docs/FSD-FleetLink.md`](../docs/FSD-FleetLink.md), and the standards every
session must follow are in [`CLAUDE.md`](CLAUDE.md) and [`../CLAUDE.md`](../CLAUDE.md).

## Layout

```
dotnet/
├─ FleetLink.sln
├─ build.md                 ← Claude Code build brief (.NET)
├─ CLAUDE.md                ← .NET conventions
└─ src/FleetLink.Api/
   ├─ FleetLink.Api.csproj
   ├─ Program.cs
   ├─ Endpoints/HealthEndpoints.cs
   └─ appsettings*.json
```

As you build, the intended shape is `Models/`, `Dtos/`, `Data/` (in-memory store + seed),
`Services/` (business rules), `Endpoints/` or `Controllers/`, and a sibling `FleetLink.Tests/`
project. `build.md` spells this out.

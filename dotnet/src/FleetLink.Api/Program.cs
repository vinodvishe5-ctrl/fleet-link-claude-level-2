using FleetLink.Api.Endpoints;
using FleetLink.Api.Services;

// FleetLink — Level 2 running project (.NET track).
// Grown one module at a time from a tiny skeleton. Source of truth: ../../docs/FSD-FleetLink.md.
// Module 2.B (spec-driven): confirmed plan → layered scaffold + the /api/meta proving slice.
// No domain entities yet — those are designed database-first in Module 2.C.

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();

// Services (the FSD business rules will live here from Module 2.D). Meta is non-domain scaffolding.
builder.Services.AddSingleton<IMetaService, MetaService>();

var app = builder.Build();

app.MapHealthEndpoints();
app.MapMetaEndpoints();

app.Run();

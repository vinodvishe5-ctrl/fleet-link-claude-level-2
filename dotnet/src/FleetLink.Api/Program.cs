using FleetLink.Api.Data;
using FleetLink.Api.Endpoints;
using FleetLink.Api.Services;

// FleetLink — Level 2 running project (.NET track).
// Grown one module at a time from a tiny skeleton. Source of truth: ../../docs/FSD-FleetLink.md.
// Module 2.C (data model): the FSD entities + enums placed in Models/, the in-memory FleetStore + fixed
// SeedData placed in Data/. No DTOs, services, business rules or REST endpoints on the domain yet —
// the API on top of this data is Module 2.D.

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();

// The in-memory store is the runtime the domain API is built on in Module 2.D.
builder.Services.AddSingleton<FleetStore>();

// Services (the FSD business rules will live here from Module 2.D). Meta is non-domain scaffolding.
builder.Services.AddSingleton<IMetaService, MetaService>();

var app = builder.Build();

app.MapHealthEndpoints();
app.MapMetaEndpoints();

// Prove the Module 2.C seed loaded (FSD §7).
var store = app.Services.GetRequiredService<FleetStore>();
app.Logger.LogInformation(
    "FleetLink seeded: {Depots} depots, {Vehicles} vehicles, {Drivers} drivers, {Parts} parts, {WorkOrders} work orders.",
    store.Depots.Count, store.Vehicles.Count, store.Drivers.Count, store.Parts.Count, store.WorkOrders.Count);

app.Run();

using FleetLink.Api.Common;
using FleetLink.Api.Data;
using FleetLink.Api.Endpoints;
using FleetLink.Api.Services;

// FleetLink — Level 2 running project (.NET track).
// Grown one module at a time from a tiny skeleton. Source of truth: ../../docs/FSD-FleetLink.md.
// Module 2.C (data model): the FSD entities + enums (Models/) and the in-memory FleetStore + fixed
// SeedData (Data/).
// Module 2.D (API & business logic): the read side and the write side of the API — response/request
// DTOs (Dtos/), the business rules behind interfaces (Services/), thin endpoints grouped by resource
// (Endpoints/), boundary validation (Validation/) and ONE error shape (Common/ExceptionHandlingMiddleware).

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();

// The in-memory store is the runtime the domain API reads and writes.
builder.Services.AddSingleton<FleetStore>();

// The server "today" behind an interface, so the date rules (5, 6) can be tested deterministically.
builder.Services.AddSingleton<IClock, SystemClock>();

// Domain services — every FSD §5 rule lives here (Module 2.D). Meta is non-domain scaffolding.
builder.Services.AddScoped<IDepotService, DepotService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IPartService, PartService>();
builder.Services.AddScoped<IWorkOrderService, WorkOrderService>();
builder.Services.AddSingleton<IMetaService, MetaService>();

var app = builder.Build();

// The one error shape for every failure — registered before the endpoints so it wraps them all.
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.MapHealthEndpoints();
app.MapMetaEndpoints();

// Module 2.D — the domain API (read side + write side). Rules live in the services these endpoints call.
app.MapDepotEndpoints();
app.MapVehicleEndpoints();
app.MapWorkOrderEndpoints();
app.MapPartEndpoints();

// Prove the seed loaded (FSD §7).
var store = app.Services.GetRequiredService<FleetStore>();
app.Logger.LogInformation(
    "FleetLink seeded: {Depots} depots, {Vehicles} vehicles, {Drivers} drivers, {Parts} parts, {WorkOrders} work orders.",
    store.Depots.Count, store.Vehicles.Count, store.Drivers.Count, store.Parts.Count, store.WorkOrders.Count);

app.Run();

// Exposed so the integration test project (FleetLink.Tests) can spin up the API with WebApplicationFactory.
public partial class Program { }

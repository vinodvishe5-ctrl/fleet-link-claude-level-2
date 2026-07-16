using FleetLink.Api.Endpoints;
using FleetLink.Api.Services;

// FleetLink — Level 2 running project (.NET track).
// This is a deliberately tiny, runnable skeleton. On Day 1 (Module 2.A) you only confirm it runs.
// From Day 2 onward you grow it into the full application described in ../../docs/FSD-FleetLink.md.

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSingleton<IMetaService, MetaService>();

var app = builder.Build();

app.MapHealthEndpoints();
app.MapMetaEndpoints();

app.Run();

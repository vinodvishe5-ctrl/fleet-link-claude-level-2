using FleetLink.Api.Endpoints;

// FleetLink — Level 2 running project (.NET track).
// This is a deliberately tiny, runnable skeleton. On Day 1 (Module 2.A) you only confirm it runs.
// From Day 2 onward you grow it into the full application described in ../../docs/FSD-FleetLink.md.

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.MapHealthEndpoints();

app.Run();

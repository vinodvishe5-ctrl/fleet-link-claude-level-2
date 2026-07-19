using FleetLink.Api.Common;
using FleetLink.Api.Services;

namespace FleetLink.Api.Endpoints;

/// <summary>Depot read endpoints (Module 2.D, Part A). Thin: call the service, map to a status code.</summary>
public static class DepotEndpoints
{
    public static IEndpointRouteBuilder MapDepotEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/depots", (IDepotService s) => Results.Ok(s.ListDepots()));

        app.MapGet("/api/depots/{id:guid}", (Guid id, IDepotService s) =>
            s.GetDepot(id) is { } depot ? Results.Ok(depot) : throw Errors.DepotNotFound());

        app.MapGet("/api/depots/{id:guid}/vehicles", (Guid id, IDepotService s) =>
            Results.Ok(s.ListVehiclesForDepot(id)));

        return app;
    }
}

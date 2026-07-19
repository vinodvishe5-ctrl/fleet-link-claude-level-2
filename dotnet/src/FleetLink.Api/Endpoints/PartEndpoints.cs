using FleetLink.Api.Services;

namespace FleetLink.Api.Endpoints;

/// <summary>Part read endpoint (Module 2.D). Read-only; stock changes only through the work-order parts endpoint (rule 8).</summary>
public static class PartEndpoints
{
    public static IEndpointRouteBuilder MapPartEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/parts", (IPartService s) => Results.Ok(s.ListParts()));
        return app;
    }
}

using FleetLink.Api.Services;

namespace FleetLink.Api.Endpoints;

/// <summary>
/// One non-domain vertical slice (Module 2.B) — proves route → service layering.
/// No business rules, no FSD entities.
/// </summary>
public static class MetaEndpoints
{
    public static IEndpointRouteBuilder MapMetaEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/meta", (IMetaService metaService) => Results.Ok(metaService.GetMeta()));

        return app;
    }
}

using FleetLink.Api.Services;

namespace FleetLink.Api.Endpoints;

/// <summary>
/// The one non-domain vertical slice built in Module 2.B: GET /api/meta, routed through a service.
/// It proves the endpoint → service layering end to end so the real domain (2.C/2.D) slots straight in.
/// </summary>
public static class MetaEndpoints
{
    public static IEndpointRouteBuilder MapMetaEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/meta", (IMetaService meta) => Results.Ok(meta.GetMeta()));
        return app;
    }
}

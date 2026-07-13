namespace FleetLink.Api.Endpoints;

/// <summary>
/// The only endpoints that exist in the seed. Health proves the toolchain works on Day 1;
/// the real FleetLink endpoints are generated from the FSD across Modules 2.C–2.D.
/// </summary>
public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/health", () => Results.Ok(new
        {
            status = "ok",
            app = "FleetLink",
            track = ".NET",
            utc = DateTime.UtcNow
        }));

        app.MapGet("/", () => Results.Text(
            "FleetLink API (seed). See /health. Build the running project from docs/FSD-FleetLink.md."));

        return app;
    }
}

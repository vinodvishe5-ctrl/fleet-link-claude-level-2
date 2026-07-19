using FleetLink.Api.Common;
using FleetLink.Api.Dtos;
using FleetLink.Api.Services;
using FleetLink.Api.Validation;

namespace FleetLink.Api.Endpoints;

/// <summary>
/// Vehicle endpoints (Module 2.D): reads, plus the two write endpoints that land on a vehicle — create a
/// work order (FSD §6) and update the odometer. Thin: validate the body, call the service, map to the FSD
/// status code. The rules themselves live in the services.
/// </summary>
public static class VehicleEndpoints
{
    public static IEndpointRouteBuilder MapVehicleEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/vehicles", (IVehicleService s) => Results.Ok(s.ListVehicles()));

        app.MapGet("/api/vehicles/{id:guid}", (Guid id, IVehicleService s) =>
            s.GetVehicle(id) is { } vehicle ? Results.Ok(vehicle) : throw Errors.VehicleNotFound());

        app.MapGet("/api/vehicles/{id:guid}/work-orders", (Guid id, IVehicleService s) =>
            Results.Ok(s.ListWorkOrdersForVehicle(id)));

        // POST /api/vehicles/{vehicleId}/work-orders → 201 / 400 / 404 / 409
        app.MapPost("/api/vehicles/{vehicleId:guid}/work-orders",
            (Guid vehicleId, CreateWorkOrderRequest request, IWorkOrderService workOrders, IClock clock) =>
            {
                RequestValidators.ValidateCreateWorkOrder(request, clock);
                var created = workOrders.CreateWorkOrder(vehicleId, request);
                return Results.Created($"/api/work-orders/{created.Id}", created);
            });

        // PATCH /api/vehicles/{id}/odometer → 200 / 400
        app.MapPatch("/api/vehicles/{id:guid}/odometer",
            (Guid id, UpdateOdometerRequest request, IVehicleService s) =>
            {
                RequestValidators.ValidateUpdateOdometer(request);
                return Results.Ok(s.UpdateOdometer(id, request.OdometerKm!.Value));
            });

        return app;
    }
}

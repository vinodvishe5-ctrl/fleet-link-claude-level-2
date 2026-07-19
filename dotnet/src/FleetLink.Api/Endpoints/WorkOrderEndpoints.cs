using FleetLink.Api.Common;
using FleetLink.Api.Dtos;
using FleetLink.Api.Services;
using FleetLink.Api.Validation;

namespace FleetLink.Api.Endpoints;

/// <summary>
/// Work-order endpoints (Module 2.D): read one, transition its status, record parts used. Thin wiring —
/// validate the body, call the service, map to the FSD status code. Every rule is in WorkOrderService.
/// </summary>
public static class WorkOrderEndpoints
{
    public static IEndpointRouteBuilder MapWorkOrderEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/work-orders/{id:guid}", (Guid id, IWorkOrderService s) =>
            s.GetWorkOrder(id) is { } workOrder ? Results.Ok(workOrder) : throw Errors.WorkOrderNotFound());

        // PATCH /api/work-orders/{id}/status → 200 / 409
        app.MapPatch("/api/work-orders/{id:guid}/status",
            (Guid id, ChangeStatusRequest request, IWorkOrderService s) =>
            {
                RequestValidators.ValidateChangeStatus(request);
                return Results.Ok(s.ChangeStatus(id, request.Status));
            });

        // POST /api/work-orders/{id}/parts → 200 / 409 (stock)
        app.MapPost("/api/work-orders/{id:guid}/parts",
            (Guid id, AddWorkOrderPartsRequest request, IWorkOrderService s) =>
            {
                RequestValidators.ValidateAddParts(request);
                return Results.Ok(s.AddParts(id, request.Parts!));
            });

        return app;
    }
}

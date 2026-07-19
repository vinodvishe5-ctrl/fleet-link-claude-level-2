using FleetLink.Api.Dtos;

namespace FleetLink.Api.Services;

/// <summary>
/// The heart of FleetLink's business logic (Module 2.D). Every method enforces the numbered FSD §5 rules
/// and nothing here lives in an endpoint or a model.
/// </summary>
public interface IWorkOrderService
{
    WorkOrderDto? GetWorkOrder(Guid id);
    WorkOrderDto CreateWorkOrder(Guid vehicleId, CreateWorkOrderRequest request);   // rules 2–6 (+7)
    WorkOrderDto ChangeStatus(Guid workOrderId, string? newStatus);                 // rules 9, 10, 11 (+7)
    WorkOrderDto AddParts(Guid workOrderId, IReadOnlyList<WorkOrderPartLine> lines); // rule 8
}

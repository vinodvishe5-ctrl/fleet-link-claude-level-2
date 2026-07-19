namespace FleetLink.Api.Dtos;

// The request shapes the API accepts (Module 2.D, Part B) — each carries only the fields its call needs.
// Enums and dates arrive as strings and are validated/parsed at the boundary (Validation/RequestValidators)
// so a malformed value fails as a clean 400 through the one error shape rather than an opaque bind error.

public record CreateWorkOrderRequest(
    string? Title, string? Description, string? Type, string? Priority,
    string? OpenedDate, string? DueDate, Guid? AssignedDriverId, decimal? LabourCost);

public record ChangeStatusRequest(string? Status);

public record WorkOrderPartLine(Guid PartId, int Quantity);

public record AddWorkOrderPartsRequest(List<WorkOrderPartLine>? Parts);

public record UpdateOdometerRequest(int? OdometerKm);

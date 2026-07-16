namespace FleetLink.Api.Models;

public class WorkOrder
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public WorkOrderType Type { get; set; }
    public WorkOrderPriority Priority { get; set; }
    public WorkOrderStatus Status { get; set; }
    public DateOnly OpenedDate { get; set; }
    public DateOnly DueDate { get; set; }
    public DateOnly? CompletedDate { get; set; }
    public Guid? AssignedDriverId { get; set; }
    public decimal LabourCost { get; set; }

    // Stamped once, by the service, when Status transitions to Completed — see docs/data-model.md §2.3.
    // Null until then; PartsCost/TotalCost are otherwise derived live (FSD:85), not stored here.
    public decimal? PartsCostAtCompletion { get; set; }
    public decimal? TotalCostAtCompletion { get; set; }
}

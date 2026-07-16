namespace FleetLink.Api.Models;

/// <summary>
/// WorkOrder — FSD §3.5. The central record: a unit of maintenance work on one vehicle.
/// PartsCost and TotalCost are DERIVED (FSD §3.5) — they are computed in the service layer (Module 2.D)
/// from the line items, NOT stored here. Storing them would duplicate state (a 2.C pitfall).
/// </summary>
public class WorkOrder
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public WorkOrderType Type { get; set; }
    public WorkOrderPriority Priority { get; set; }
    public WorkOrderStatus Status { get; set; }
    public DateOnly OpenedDate { get; set; }
    public DateOnly DueDate { get; set; }
    public DateOnly? CompletedDate { get; set; }           // nullable — set only on completion
    public Guid? AssignedDriverId { get; set; }            // nullable — optional assignment
    public decimal LabourCost { get; set; }                // >= 0

    public Vehicle? Vehicle { get; set; }
    public Driver? AssignedDriver { get; set; }
    public ICollection<WorkOrderPart> WorkOrderParts { get; set; } = new List<WorkOrderPart>();
}

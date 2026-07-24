namespace FleetLink.Api.Models;

/// <summary>WorkOrderPart — FSD §3.6. Line item: parts used on a work order. Composite key (WorkOrderId, PartId).</summary>
public class WorkOrderPart
{
    // Surrogate key — not an FSD column; see docs/data-model.md §2.1 for why.
    public Guid Id { get; set; }
    public Guid WorkOrderId { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }                      // >= 1

    public WorkOrder? WorkOrder { get; set; }
    public Part? Part { get; set; }
}

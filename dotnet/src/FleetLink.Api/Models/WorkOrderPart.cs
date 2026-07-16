namespace FleetLink.Api.Models;

public class WorkOrderPart
{
    // Surrogate key — not an FSD column; see docs/data-model.md §2.1 for why.
    public Guid Id { get; set; }
    public Guid WorkOrderId { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }
}

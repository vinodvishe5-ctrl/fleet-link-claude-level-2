using FleetLink.Api.Data;

namespace FleetLink.Api.Services;

/// <summary>
/// Cost derivation (FSD §3.5) lives in the service layer, computed from the line items on demand and
/// never stored. PartsCost for a work order = Σ(WorkOrderPart.Quantity × Part.UnitCost). TotalCost is
/// finished in the DTO mapper (LabourCost + PartsCost, or the frozen completion total for rule 11).
/// </summary>
public static class Costing
{
    public static decimal PartsCostFor(FleetStore store, Guid workOrderId) =>
        store.WorkOrderParts
            .Where(wp => wp.WorkOrderId == workOrderId)
            .Sum(wp => wp.Quantity * (store.Parts.FirstOrDefault(p => p.Id == wp.PartId)?.UnitCost ?? 0m));
}

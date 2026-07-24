namespace FleetLink.Api.Models;

/// <summary>Part — FSD §3.4. A stock item consumed by work orders.</summary>
public class Part
{
    public Guid Id { get; set; }
    public string PartNumber { get; set; } = default!;     // unique, e.g. PN-BRK-01
    public string Name { get; set; } = default!;
    public decimal UnitCost { get; set; }                  // >= 0
    public int QuantityInStock { get; set; }               // >= 0
}

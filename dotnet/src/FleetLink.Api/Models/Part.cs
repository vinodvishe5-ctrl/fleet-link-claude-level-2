namespace FleetLink.Api.Models;

public class Part
{
    public Guid Id { get; set; }
    public string PartNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public int QuantityInStock { get; set; }
}

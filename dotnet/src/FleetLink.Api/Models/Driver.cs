namespace FleetLink.Api.Models;

/// <summary>Driver — FSD §3.3. Operates vehicles; can be assigned to a work order.</summary>
public class Driver
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string LicenceNumber { get; set; } = default!;  // unique, fictional
    public Guid DepotId { get; set; }
    public DriverStatus Status { get; set; }

    public Depot? Depot { get; set; }
}

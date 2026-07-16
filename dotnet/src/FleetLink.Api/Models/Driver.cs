namespace FleetLink.Api.Models;

public class Driver
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string LicenceNumber { get; set; } = string.Empty;
    public Guid DepotId { get; set; }
    public DriverStatus Status { get; set; }
}

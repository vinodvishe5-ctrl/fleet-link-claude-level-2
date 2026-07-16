namespace FleetLink.Api.Models;

public class Vehicle
{
    public Guid Id { get; set; }
    public string Registration { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public Guid DepotId { get; set; }
    public int OdometerKm { get; set; }
    public VehicleStatus Status { get; set; }
}

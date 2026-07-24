namespace FleetLink.Api.Models;

/// <summary>Vehicle — FSD §3.2. An asset in the fleet; belongs to exactly one Depot.</summary>
public class Vehicle
{
    public Guid Id { get; set; }
    public string Registration { get; set; } = default!;   // unique, fictional plate e.g. FL-1001
    public string Make { get; set; } = default!;
    public string Model { get; set; } = default!;
    public int Year { get; set; }
    public Guid DepotId { get; set; }
    public int OdometerKm { get; set; }                    // >= 0
    public VehicleStatus Status { get; set; }

    public Depot? Depot { get; set; }
    public ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}

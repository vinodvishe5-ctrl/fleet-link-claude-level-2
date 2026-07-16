namespace FleetLink.Api.Models;

/// <summary>Depot — FSD §3.1. Where a vehicle is based and a work order is carried out.</summary>
public class Depot
{
    public Guid Id { get; set; }
    public string Code { get; set; } = default!;   // unique business key, e.g. DEP-LDN
    public string Name { get; set; } = default!;
    public string City { get; set; } = default!;

    // Navigation (FSD §4: Depot 1—* Vehicle, Depot 1—* Driver).
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<Driver> Drivers { get; set; } = new List<Driver>();
}

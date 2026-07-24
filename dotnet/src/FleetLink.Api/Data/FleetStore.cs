using FleetLink.Api.Models;

namespace FleetLink.Api.Data;

/// <summary>
/// In-memory store for the training build (FSD §8 · dotnet/CLAUDE.md). A singleton holding a list of
/// each entity, loaded from <see cref="SeedData"/>. This is the runtime the API is built on in Module
/// 2.D. The agreed schema (../../../docs/schema.sql) records how the same model maps to a real
/// relational database (SQL Server / Azure SQL); the API on top of this store is Module 2.D.
/// </summary>
public sealed class FleetStore
{
    public List<Depot> Depots { get; } = SeedData.Depots();
    public List<Vehicle> Vehicles { get; } = SeedData.Vehicles();
    public List<Driver> Drivers { get; } = SeedData.Drivers();
    public List<Part> Parts { get; } = SeedData.Parts();
    public List<WorkOrder> WorkOrders { get; } = SeedData.WorkOrders();
    public List<WorkOrderPart> WorkOrderParts { get; } = SeedData.WorkOrderParts();

    /// <summary>Row counts — used by the startup log and by /api/meta to prove the seed loaded.</summary>
    public object Counts() => new
    {
        depots = Depots.Count,
        vehicles = Vehicles.Count,
        drivers = Drivers.Count,
        parts = Parts.Count,
        workOrders = WorkOrders.Count,
    };
}

using FleetLink.Api.Models;

namespace FleetLink.Api.Data;

/// <summary>
/// FleetLink seed data — FSD §7. IDENTICAL to the JavaScript track: same fixed Guids, same values, so
/// both tracks and every trainee share one dataset. All names/registrations/licences are FICTIONAL.
/// This one source feeds the in-memory <see cref="FleetStore"/>. The agreed schema
/// (../../../docs/schema.sql) shows how the same model maps to SQL Server / Azure SQL — the API on top is Module 2.D.
/// </summary>
public static class SeedData
{
    // Fixed Guids (match javascript/src/data/seed.js exactly).
    static Guid G(string s) => new(s);
    static readonly Guid LDN = G("11111111-0000-0000-0000-000000000001");
    static readonly Guid MAN = G("11111111-0000-0000-0000-000000000002");

    public static List<Depot> Depots() => new()
    {
        new() { Id = LDN, Code = "DEP-LDN", Name = "London Central Depot", City = "London" },
        new() { Id = MAN, Code = "DEP-MAN", Name = "Manchester North Depot", City = "Manchester" },
    };

    static readonly Guid V1 = G("22222222-0000-0000-0000-000000000001");
    static readonly Guid V2 = G("22222222-0000-0000-0000-000000000002");
    static readonly Guid V3 = G("22222222-0000-0000-0000-000000000003");
    static readonly Guid V4 = G("22222222-0000-0000-0000-000000000004");

    public static List<Vehicle> Vehicles() => new()
    {
        new() { Id = V1, Registration = "FL-1001", Make = "Ford", Model = "Transit", Year = 2021, DepotId = LDN, OdometerKm = 45000, Status = VehicleStatus.Active },
        new() { Id = V2, Registration = "FL-1002", Make = "Mercedes-Benz", Model = "Sprinter", Year = 2020, DepotId = LDN, OdometerKm = 78200, Status = VehicleStatus.Active },
        new() { Id = V3, Registration = "FL-1003", Make = "Volkswagen", Model = "Crafter", Year = 2019, DepotId = MAN, OdometerKm = 120500, Status = VehicleStatus.InMaintenance },
        new() { Id = V4, Registration = "FL-1004", Make = "Renault", Model = "Master", Year = 2016, DepotId = MAN, OdometerKm = 210000, Status = VehicleStatus.Retired },
    };

    static readonly Guid D1 = G("33333333-0000-0000-0000-000000000001");
    static readonly Guid D2 = G("33333333-0000-0000-0000-000000000002");
    static readonly Guid D3 = G("33333333-0000-0000-0000-000000000003");

    public static List<Driver> Drivers() => new()
    {
        new() { Id = D1, Name = "Ravi Menon", LicenceNumber = "LIC-4417", DepotId = LDN, Status = DriverStatus.Active },
        new() { Id = D2, Name = "Sofia Alvarez", LicenceNumber = "LIC-8823", DepotId = LDN, Status = DriverStatus.Active },
        new() { Id = D3, Name = "Tom Becker", LicenceNumber = "LIC-2251", DepotId = MAN, Status = DriverStatus.Inactive },
    };

    static readonly Guid P1 = G("44444444-0000-0000-0000-000000000001");
    static readonly Guid P2 = G("44444444-0000-0000-0000-000000000002");
    static readonly Guid P3 = G("44444444-0000-0000-0000-000000000003");
    static readonly Guid P4 = G("44444444-0000-0000-0000-000000000004");

    public static List<Part> Parts() => new()
    {
        new() { Id = P1, PartNumber = "PN-BRK-01", Name = "Brake pad set", UnitCost = 42.50m, QuantityInStock = 20 },
        new() { Id = P2, PartNumber = "PN-OIL-05", Name = "Oil filter", UnitCost = 9.75m, QuantityInStock = 60 },
        new() { Id = P3, PartNumber = "PN-TYR-02", Name = "Tyre", UnitCost = 88.00m, QuantityInStock = 16 },
        new() { Id = P4, PartNumber = "PN-BAT-01", Name = "Battery", UnitCost = 130.00m, QuantityInStock = 8 },
    };

    static readonly Guid W1 = G("55555555-0000-0000-0000-000000000001");
    static readonly Guid W2 = G("55555555-0000-0000-0000-000000000002");
    static readonly Guid W3 = G("55555555-0000-0000-0000-000000000003");

    // WO-1 is an OPEN Breakdown on FL-1003 — which is why that vehicle is InMaintenance (FSD rule 7).
    public static List<WorkOrder> WorkOrders() => new()
    {
        new() { Id = W1, VehicleId = V3, Title = "Clutch replacement", Description = "Clutch slipping under load; replace assembly.", Type = WorkOrderType.Breakdown, Priority = WorkOrderPriority.High, Status = WorkOrderStatus.InProgress, OpenedDate = new(2026, 7, 13), DueDate = new(2026, 7, 16), CompletedDate = null, AssignedDriverId = D1, LabourCost = 150.00m },
        new() { Id = W2, VehicleId = V1, Title = "Scheduled 45k service", Description = "Routine 45,000 km service.", Type = WorkOrderType.Scheduled, Priority = WorkOrderPriority.Medium, Status = WorkOrderStatus.Open, OpenedDate = new(2026, 7, 15), DueDate = new(2026, 7, 20), CompletedDate = null, AssignedDriverId = D1, LabourCost = 80.00m },
        new() { Id = W3, VehicleId = V2, Title = "Annual inspection", Description = "Statutory annual inspection.", Type = WorkOrderType.Inspection, Priority = WorkOrderPriority.Low, Status = WorkOrderStatus.Completed, OpenedDate = new(2026, 7, 1), DueDate = new(2026, 7, 5), CompletedDate = new(2026, 7, 4), AssignedDriverId = null, LabourCost = 60.00m },
    };

    public static List<WorkOrderPart> WorkOrderParts() => new()
    {
        new() { WorkOrderId = W1, PartId = P1, Quantity = 2 },
        new() { WorkOrderId = W1, PartId = P2, Quantity = 1 },
        new() { WorkOrderId = W3, PartId = P2, Quantity = 1 },
    };

}

using FleetLink.Api.Common;
using FleetLink.Api.Data;
using FleetLink.Api.Dtos;
using FleetLink.Api.Services;

namespace FleetLink.Tests;

/// <summary>A clock the tests pin, so the date rules (FSD 5, 6) are deterministic on any day they run.</summary>
public sealed class FakeClock : IClock
{
    public DateOnly Today { get; set; }
    public FakeClock(DateOnly today) => Today = today;
}

/// <summary>
/// Builds a fresh store + services for each test and holds the fixed seed ids (FSD §7, identical on both
/// tracks). Every test starts from the same known dataset, so a rule test reads as "call the service,
/// assert the FSD status code".
/// </summary>
public sealed class TestContext
{
    public FleetStore Store { get; } = new();
    public FakeClock Clock { get; } = new(new DateOnly(2026, 7, 19));
    public IVehicleService Vehicles { get; }
    public IWorkOrderService WorkOrders { get; }
    public IDepotService Depots { get; }
    public IPartService Parts { get; }

    public TestContext()
    {
        var vehicles = new VehicleService(Store);
        Vehicles = vehicles;
        WorkOrders = new WorkOrderService(Store, Clock, vehicles);
        Depots = new DepotService(Store);
        Parts = new PartService(Store);
    }

    // Fixed seed ids (match javascript/src/data/seed.js and Data/SeedData.cs).
    public static readonly Guid DepotLdn = new("11111111-0000-0000-0000-000000000001");
    public static readonly Guid VehicleActive = new("22222222-0000-0000-0000-000000000001");   // FL-1001
    public static readonly Guid VehicleRetired = new("22222222-0000-0000-0000-000000000004");  // FL-1004
    public static readonly Guid Driver = new("33333333-0000-0000-0000-000000000001");          // Ravi Menon
    public static readonly Guid PartBrake = new("44444444-0000-0000-0000-000000000001");        // PN-BRK-01, stock 20
    public static readonly Guid PartBattery = new("44444444-0000-0000-0000-000000000004");      // PN-BAT-01, stock 8
    public static readonly Guid WoOpen = new("55555555-0000-0000-0000-000000000002");          // WO-2, Open, has driver
    public static readonly Guid WoInProgress = new("55555555-0000-0000-0000-000000000001");    // WO-1, InProgress Breakdown
    public static readonly Guid WoCompleted = new("55555555-0000-0000-0000-000000000003");     // WO-3, Completed (terminal)

    // A valid create request against the active vehicle, dated so rules 4/5/6 all pass.
    public CreateWorkOrderRequest ValidCreate(
        string type = "Scheduled", string priority = "Medium",
        string? openedDate = "2026-07-19", string? dueDate = "2026-07-22",
        Guid? assignedDriverId = null, decimal labourCost = 100m) =>
        new("Brake inspection", "Front brake check.", type, priority, openedDate, dueDate, assignedDriverId, labourCost);
}

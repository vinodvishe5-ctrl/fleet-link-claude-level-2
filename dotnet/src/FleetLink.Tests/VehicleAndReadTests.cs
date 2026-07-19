using FleetLink.Api.Common;
using Xunit;

namespace FleetLink.Tests;

/// <summary>Vehicle write rule (FSD 12) and the read side (Part A) — reads carry no rule and prove the
/// data flows store → service → DTO with the derived costs computed.</summary>
public class VehicleAndReadTests
{
    [Fact]
    public void Rule12_odometer_may_not_decrease_but_may_increase()
    {
        var ctx = new TestContext();
        var down = Assert.Throws<DomainException>(() => ctx.Vehicles.UpdateOdometer(TestContext.VehicleActive, 44000));
        Assert.Equal(400, down.Status);
        Assert.Equal("odometer_decrease", down.Code);   // FL-1001 starts at 45000

        var up = ctx.Vehicles.UpdateOdometer(TestContext.VehicleActive, 46000);
        Assert.Equal(46000, up.OdometerKm);
    }

    [Fact]
    public void Rule12_updating_a_missing_vehicle_is_404()
    {
        var ctx = new TestContext();
        var ex = Assert.Throws<DomainException>(() => ctx.Vehicles.UpdateOdometer(Guid.NewGuid(), 50000));
        Assert.Equal(404, ex.Status);
        Assert.Equal("vehicle_not_found", ex.Code);
    }

    [Fact]
    public void Read_all_vehicles_returns_the_four_seed_vehicles_as_dtos()
    {
        var ctx = new TestContext();
        var vehicles = ctx.Vehicles.ListVehicles();
        Assert.Equal(4, vehicles.Count);
    }

    [Fact]
    public void Read_depot_vehicles_404s_on_a_missing_depot()
    {
        var ctx = new TestContext();
        Assert.Equal(2, ctx.Depots.ListVehiclesForDepot(TestContext.DepotLdn).Count);   // FL-1001, FL-1002
        var ex = Assert.Throws<DomainException>(() => ctx.Depots.ListVehiclesForDepot(Guid.NewGuid()));
        Assert.Equal("depot_not_found", ex.Code);
    }

    [Fact]
    public void Read_work_order_includes_derived_parts_and_total_cost()
    {
        var ctx = new TestContext();
        // WO-1 uses 2×PN-BRK-01 (42.50) + 1×PN-OIL-05 (9.75) = 94.75; labour 150 → total 244.75.
        var wo = ctx.WorkOrders.GetWorkOrder(TestContext.WoInProgress)!;
        Assert.Equal(94.75m, wo.PartsCost);
        Assert.Equal(244.75m, wo.TotalCost);
    }
}

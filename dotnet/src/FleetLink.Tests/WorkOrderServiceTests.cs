using FleetLink.Api.Common;
using FleetLink.Api.Dtos;
using FleetLink.Api.Models;
using Xunit;

namespace FleetLink.Tests;

/// <summary>One test per FSD §5 rule on the write side, each asserting the exact status code. A rule is
/// not "done" until a test proves it — this class is that proof.</summary>
public class WorkOrderServiceTests
{
    [Fact]
    public void HappyPath_create_on_active_vehicle_is_Open_with_derived_costs()
    {
        var ctx = new TestContext();
        var dto = ctx.WorkOrders.CreateWorkOrder(TestContext.VehicleActive, ctx.ValidCreate());
        Assert.Equal("Open", dto.Status);
        Assert.Equal(0m, dto.PartsCost);
        Assert.Equal(100m, dto.TotalCost);   // labour only, no parts yet
    }

    [Fact]
    public void Rule2_create_for_missing_vehicle_is_404()
    {
        var ctx = new TestContext();
        var ex = Assert.Throws<DomainException>(() => ctx.WorkOrders.CreateWorkOrder(Guid.NewGuid(), ctx.ValidCreate()));
        Assert.Equal(404, ex.Status);
        Assert.Equal("vehicle_not_found", ex.Code);
    }

    [Fact]
    public void Rule3_create_on_retired_vehicle_is_409()
    {
        var ctx = new TestContext();
        var ex = Assert.Throws<DomainException>(() => ctx.WorkOrders.CreateWorkOrder(TestContext.VehicleRetired, ctx.ValidCreate()));
        Assert.Equal(409, ex.Status);
        Assert.Equal("vehicle_retired", ex.Code);
    }

    [Fact]
    public void Rule4_due_before_opened_is_400()
    {
        var ctx = new TestContext();
        var req = ctx.ValidCreate(openedDate: "2026-07-22", dueDate: "2026-07-19");
        var ex = Assert.Throws<DomainException>(() => ctx.WorkOrders.CreateWorkOrder(TestContext.VehicleActive, req));
        Assert.Equal(400, ex.Status);
        Assert.Equal("incoherent_dates", ex.Code);
    }

    [Fact]
    public void Rule5_back_dated_opened_is_400()
    {
        var ctx = new TestContext();   // clock is 2026-07-19
        var req = ctx.ValidCreate(openedDate: "2026-07-18", dueDate: "2026-07-22");
        var ex = Assert.Throws<DomainException>(() => ctx.WorkOrders.CreateWorkOrder(TestContext.VehicleActive, req));
        Assert.Equal(400, ex.Status);
        Assert.Equal("back_dated", ex.Code);
    }

    [Fact]
    public void Rule6_critical_due_too_far_is_400_but_within_two_days_is_ok()
    {
        var ctx = new TestContext();
        var tooFar = ctx.ValidCreate(priority: "Critical", openedDate: "2026-07-19", dueDate: "2026-07-24");
        var ex = Assert.Throws<DomainException>(() => ctx.WorkOrders.CreateWorkOrder(TestContext.VehicleActive, tooFar));
        Assert.Equal("critical_sla", ex.Code);

        var inSla = ctx.ValidCreate(priority: "Critical", openedDate: "2026-07-19", dueDate: "2026-07-21");
        var ok = ctx.WorkOrders.CreateWorkOrder(TestContext.VehicleActive, inSla);
        Assert.Equal("Open", ok.Status);
    }

    [Fact]
    public void Rule7_breakdown_sets_InMaintenance_and_closing_returns_to_Active()
    {
        var ctx = new TestContext();
        var created = ctx.WorkOrders.CreateWorkOrder(TestContext.VehicleActive, ctx.ValidCreate(type: "Breakdown"));
        Assert.Equal("InMaintenance", ctx.Vehicles.GetVehicle(TestContext.VehicleActive)!.Status);

        ctx.WorkOrders.ChangeStatus(created.Id, "Cancelled");
        Assert.Equal("Active", ctx.Vehicles.GetVehicle(TestContext.VehicleActive)!.Status);
    }

    [Fact]
    public void Rule8_over_stock_is_409_and_a_valid_add_decrements_stock()
    {
        var ctx = new TestContext();
        var over = Assert.Throws<DomainException>(() =>
            ctx.WorkOrders.AddParts(TestContext.WoOpen, new List<WorkOrderPartLine> { new(TestContext.PartBattery, 100) }));
        Assert.Equal(409, over.Status);
        Assert.Equal("insufficient_stock", over.Code);

        var dto = ctx.WorkOrders.AddParts(TestContext.WoOpen, new List<WorkOrderPartLine> { new(TestContext.PartBrake, 2) });
        Assert.Equal(85m, dto.PartsCost);   // 2 × 42.50
        Assert.Equal(18, ctx.Store.Parts.First(p => p.Id == TestContext.PartBrake).QuantityInStock);   // 20 − 2
    }

    [Fact]
    public void Rule9_completing_non_inspection_without_assignee_is_409_inspection_may_complete()
    {
        var ctx = new TestContext();
        var wo = ctx.WorkOrders.CreateWorkOrder(TestContext.VehicleActive, ctx.ValidCreate(type: "Scheduled", assignedDriverId: null));
        ctx.WorkOrders.ChangeStatus(wo.Id, "InProgress");
        var ex = Assert.Throws<DomainException>(() => ctx.WorkOrders.ChangeStatus(wo.Id, "Completed"));
        Assert.Equal(409, ex.Status);
        Assert.Equal("completion_requires_assignee", ex.Code);

        var insp = ctx.WorkOrders.CreateWorkOrder(TestContext.VehicleActive, ctx.ValidCreate(type: "Inspection", assignedDriverId: null));
        ctx.WorkOrders.ChangeStatus(insp.Id, "InProgress");
        var done = ctx.WorkOrders.ChangeStatus(insp.Id, "Completed");
        Assert.Equal("Completed", done.Status);
    }

    [Fact]
    public void Rule10_illegal_transition_is_409()
    {
        var ctx = new TestContext();
        var ex = Assert.Throws<DomainException>(() => ctx.WorkOrders.ChangeStatus(TestContext.WoCompleted, "InProgress"));
        Assert.Equal(409, ex.Status);
        Assert.Equal("illegal_transition", ex.Code);
    }

    [Fact]
    public void Rule11_completing_stamps_date_and_freezes_total_cost()
    {
        var ctx = new TestContext();
        var wo = ctx.WorkOrders.CreateWorkOrder(TestContext.VehicleActive,
            ctx.ValidCreate(type: "Scheduled", assignedDriverId: TestContext.Driver, labourCost: 100m));
        ctx.WorkOrders.ChangeStatus(wo.Id, "InProgress");
        var done = ctx.WorkOrders.ChangeStatus(wo.Id, "Completed");
        Assert.Equal(new DateOnly(2026, 7, 19), done.CompletedDate);
        Assert.Equal(100m, done.TotalCost);   // labour 100 + 0 parts, frozen at completion
    }
}

using FleetLink.Api.Common;
using FleetLink.Api.Dtos;
using Xunit;

namespace FleetLink.Tests;

/// <summary>
/// Module 2.G — the hand-off read endpoint (list a work order's parts) — and Module 2.H — the
/// authoritative quantity guard and its regression. Mirrors the JavaScript track's workOrderParts +
/// partsQuantityGuard tests, one assertion per behaviour.
/// </summary>
public class WorkOrderPartsAndGuardTests
{
    [Fact]
    public void ListWorkOrderParts_returns_recorded_lines_with_derived_line_cost()
    {
        var ctx = new TestContext();
        ctx.WorkOrders.AddParts(TestContext.WoOpen, new[] { new WorkOrderPartLine(TestContext.PartBrake, 2) });
        var lines = ctx.WorkOrders.ListWorkOrderParts(TestContext.WoOpen);
        Assert.Single(lines);
        Assert.Equal(TestContext.PartBrake, lines[0].PartId);
        Assert.Equal(2, lines[0].Quantity);
        Assert.Equal(lines[0].UnitCost * 2, lines[0].LineCost);   // derived, not stored (FSD §3.5)
    }

    [Fact]
    public void ListWorkOrderParts_for_missing_work_order_is_404()
    {
        var ctx = new TestContext();
        var ex = Assert.Throws<DomainException>(() => ctx.WorkOrders.ListWorkOrderParts(Guid.NewGuid()));
        Assert.Equal(404, ex.Status);
        Assert.Equal("work_order_not_found", ex.Code);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    public void AddParts_refuses_non_positive_quantity_and_leaves_stock_untouched(int badQty)
    {
        var ctx = new TestContext();
        var before = ctx.Store.Parts.First(p => p.Id == TestContext.PartBrake).QuantityInStock;
        var ex = Assert.Throws<DomainException>(() =>
            ctx.WorkOrders.AddParts(TestContext.WoOpen, new[] { new WorkOrderPartLine(TestContext.PartBrake, badQty) }));
        Assert.Equal(400, ex.Status);
        Assert.Equal("invalid_quantity", ex.Code);
        Assert.Equal(before, ctx.Store.Parts.First(p => p.Id == TestContext.PartBrake).QuantityInStock);
    }
}

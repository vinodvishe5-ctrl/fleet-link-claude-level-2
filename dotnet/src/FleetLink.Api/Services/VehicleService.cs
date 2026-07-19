using FleetLink.Api.Common;
using FleetLink.Api.Data;
using FleetLink.Api.Dtos;
using FleetLink.Api.Models;

namespace FleetLink.Api.Services;

public sealed class VehicleService : IVehicleService
{
    private readonly FleetStore _store;
    public VehicleService(FleetStore store) => _store = store;

    public IReadOnlyList<VehicleDto> ListVehicles() =>
        _store.Vehicles.Select(v => v.ToDto()).ToList();

    public VehicleDto? GetVehicle(Guid id) =>
        _store.Vehicles.FirstOrDefault(v => v.Id == id)?.ToDto();

    public IReadOnlyList<WorkOrderDto> ListWorkOrdersForVehicle(Guid vehicleId)
    {
        if (_store.Vehicles.All(v => v.Id != vehicleId)) throw Errors.VehicleNotFound();      // rule 2
        return _store.WorkOrders
            .Where(w => w.VehicleId == vehicleId)
            .Select(w => w.ToDto(Costing.PartsCostFor(_store, w.Id)))
            .ToList();
    }

    // FSD rule 12 — odometer may only stay the same or increase.
    public VehicleDto UpdateOdometer(Guid vehicleId, int odometerKm)
    {
        var v = _store.Vehicles.FirstOrDefault(x => x.Id == vehicleId) ?? throw Errors.VehicleNotFound(); // rule 2
        if (odometerKm < v.OdometerKm) throw Errors.OdometerDecrease();                        // rule 12
        v.OdometerKm = odometerKm;
        return v.ToDto();
    }

    // FSD rule 7 — derive the vehicle's status from its open breakdown work, without ever touching a
    // Retired vehicle. Called after any create/status change that could open or close a Breakdown.
    public void RecomputeBreakdownStatus(Guid vehicleId)
    {
        var v = _store.Vehicles.FirstOrDefault(x => x.Id == vehicleId);
        if (v is null || v.Status == VehicleStatus.Retired) return;
        var hasOpenBreakdown = _store.WorkOrders.Any(w =>
            w.VehicleId == vehicleId && w.Type == WorkOrderType.Breakdown &&
            (w.Status == WorkOrderStatus.Open || w.Status == WorkOrderStatus.InProgress));
        v.Status = hasOpenBreakdown ? VehicleStatus.InMaintenance : VehicleStatus.Active;
    }
}

using FleetLink.Api.Dtos;

namespace FleetLink.Api.Services;

/// <summary>
/// Vehicle reads plus the two vehicle-owned rules: odometer is monotonic (rule 12) and breakdown
/// auto-status (rule 7). RecomputeBreakdownStatus is called by IWorkOrderService whenever a breakdown
/// opens or closes, so a vehicle's status is always a consequence of its work, never set by hand.
/// </summary>
public interface IVehicleService
{
    IReadOnlyList<VehicleDto> ListVehicles();
    VehicleDto? GetVehicle(Guid id);
    IReadOnlyList<WorkOrderDto> ListWorkOrdersForVehicle(Guid vehicleId);   // 404 when the vehicle is missing
    VehicleDto UpdateOdometer(Guid vehicleId, int odometerKm);             // rule 12
    void RecomputeBreakdownStatus(Guid vehicleId);                         // rule 7
}

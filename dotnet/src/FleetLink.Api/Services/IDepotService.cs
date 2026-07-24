using FleetLink.Api.Dtos;

namespace FleetLink.Api.Services;

/// <summary>Depot reads (Module 2.D, Part A). No business rule carries on a read.</summary>
public interface IDepotService
{
    IReadOnlyList<DepotDto> ListDepots();
    DepotDto? GetDepot(Guid id);
    IReadOnlyList<VehicleDto> ListVehiclesForDepot(Guid depotId);   // 404 when the depot is missing
}

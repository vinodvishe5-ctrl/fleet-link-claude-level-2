using FleetLink.Api.Common;
using FleetLink.Api.Data;
using FleetLink.Api.Dtos;

namespace FleetLink.Api.Services;

public sealed class DepotService : IDepotService
{
    private readonly FleetStore _store;
    public DepotService(FleetStore store) => _store = store;

    public IReadOnlyList<DepotDto> ListDepots() =>
        _store.Depots.Select(d => d.ToDto()).ToList();

    public DepotDto? GetDepot(Guid id) =>
        _store.Depots.FirstOrDefault(d => d.Id == id)?.ToDto();

    // 404 when the depot itself is missing (distinguish "no such depot" from "a real depot with no vehicles").
    public IReadOnlyList<VehicleDto> ListVehiclesForDepot(Guid depotId)
    {
        if (_store.Depots.All(d => d.Id != depotId)) throw Errors.DepotNotFound();
        return _store.Vehicles.Where(v => v.DepotId == depotId).Select(v => v.ToDto()).ToList();
    }
}

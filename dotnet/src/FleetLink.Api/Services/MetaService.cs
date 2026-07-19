using FleetLink.Api.Data;
using FleetLink.Api.Dtos;

namespace FleetLink.Api.Services;

/// <summary>
/// Returns app metadata. Deliberately contains NO business logic: its job is to prove the endpoint →
/// service layering works. In Module 2.C it also reports the loaded seed counts from the
/// <see cref="FleetStore"/> so /api/meta shows the data model is really there. The domain services
/// (with the FSD §5 rules) arrive in Module 2.D and live alongside this one.
/// </summary>
public sealed class MetaService : IMetaService
{
    private readonly FleetStore _store;

    public MetaService(FleetStore store) => _store = store;

    public MetaDto GetMeta() => new(
        App: "FleetLink",
        Track: "dotnet",
        Version: "0.5.0",
        BuildStage: "2.E — UI",
        PlannedEntities: new[] { "Depot", "Vehicle", "Driver", "Part", "WorkOrder", "WorkOrderPart" },
        Seed: new SeedCountsDto(
            Depots: _store.Depots.Count,
            Vehicles: _store.Vehicles.Count,
            Drivers: _store.Drivers.Count,
            Parts: _store.Parts.Count,
            WorkOrders: _store.WorkOrders.Count));
}

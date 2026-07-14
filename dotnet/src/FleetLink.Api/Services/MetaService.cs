using FleetLink.Api.Dtos;

namespace FleetLink.Api.Services;

/// <summary>
/// Returns static app metadata. Deliberately contains NO business logic: its only job in Module 2.B is
/// to prove the endpoint → service layering works. The domain services (with the FSD §5 rules) arrive
/// in Module 2.D and live alongside this one.
/// </summary>
public sealed class MetaService : IMetaService
{
    public MetaDto GetMeta() => new(
        App: "FleetLink",
        Track: "dotnet",
        Version: "0.2.0",
        BuildStage: "2.B — scaffold",
        PlannedEntities: new[] { "Depot", "Vehicle", "Driver", "Part", "WorkOrder", "WorkOrderPart" });
}

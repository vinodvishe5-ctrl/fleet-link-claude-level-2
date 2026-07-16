using FleetLink.Api.Dtos;

namespace FleetLink.Api.Services;

public class MetaService : IMetaService
{
    private static readonly string[] PlannedEntities =
    [
        "Depot", "Vehicle", "Driver", "Part", "WorkOrder", "WorkOrderPart"
    ];

    public MetaDto GetMeta() => new(
        App: "FleetLink",
        Track: "dotnet",
        Version: "0.2.0",
        BuildStage: "2.B — scaffold",
        PlannedEntities: PlannedEntities);
}

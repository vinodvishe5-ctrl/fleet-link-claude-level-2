namespace FleetLink.Api.Dtos;

public record MetaDto(
    string App,
    string Track,
    string Version,
    string BuildStage,
    string[] PlannedEntities);

namespace FleetLink.Api.Dtos;

/// <summary>
/// Non-domain metadata about the running app. Introduced in Module 2.B to exercise the DTO + service
/// layering; in Module 2.C the <see cref="Seed"/> counts are added purely to PROVE the data model
/// loaded (metadata about the build â€” the real domain read endpoints arrive in 2.D).
/// Serialised camelCase by the default web JSON options: app, track, version, buildStage, plannedEntities, seed.
/// </summary>
public record MetaDto(
    string App,
    string Track,
    string Version,
    string BuildStage,
    string[] PlannedEntities,
    SeedCountsDto Seed);

/// <summary>Row counts of the loaded seed (FSD §7), reported by /api/meta as a Module 2.C proof.</summary>
public record SeedCountsDto(int Depots, int Vehicles, int Drivers, int Parts, int WorkOrders);

namespace FleetLink.Api.Dtos;

/// <summary>
/// Non-domain metadata about the running app. Introduced in Module 2.B to exercise the DTO + service
/// layering before any FleetLink entity exists (the domain DTOs arrive in Module 2.D).
/// Serialised camelCase by the default web JSON options: app, track, version, buildStage, plannedEntities.
/// </summary>
public record MetaDto(
    string App,
    string Track,
    string Version,
    string BuildStage,
    string[] PlannedEntities);

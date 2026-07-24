namespace FleetLink.Api.Dtos;

// The response CONTRACT (Module 2.D, Part A). The API exposes these DTOs, never the stored entities.
// Enums are exposed as STRINGS (root CLAUDE.md) — the mapper passes enum.ToString() — and dates as
// 'yyyy-MM-dd' (DateOnly). Serialised camelCase by the default web JSON options.

public record DepotDto(Guid Id, string Code, string Name, string City);

public record VehicleDto(
    Guid Id, string Registration, string Make, string Model, int Year,
    Guid DepotId, int OdometerKm, string Status);

public record DriverDto(Guid Id, string Name, string LicenceNumber, Guid DepotId, string Status);

public record PartDto(Guid Id, string PartNumber, string Name, decimal UnitCost, int QuantityInStock);

/// <summary>
/// WorkOrderDto carries the DERIVED PartsCost and TotalCost (FSD §3.5). PartsCost is computed by the
/// service from the line items; TotalCost = LabourCost + PartsCost, unless the order was completed, in
/// which case the total frozen at completion (FSD rule 11) is returned instead.
/// </summary>
public record WorkOrderDto(
    Guid Id, Guid VehicleId, string Title, string Description,
    string Type, string Priority, string Status,
    DateOnly OpenedDate, DateOnly DueDate, DateOnly? CompletedDate,
    Guid? AssignedDriverId, decimal LabourCost, decimal PartsCost, decimal TotalCost);

/// <summary>
/// A work order's part line joined to its Part (Module 2.G hand-off endpoint). Read-only projection —
/// LineCost is derived (Quantity × UnitCost), never stored.
/// </summary>
public record WorkOrderPartLineDto(
    Guid PartId, string PartNumber, string Name, int Quantity, decimal UnitCost, decimal LineCost);

using FleetLink.Api.Models;

namespace FleetLink.Api.Dtos;

/// <summary>
/// The single place a stored entity becomes a response DTO (Module 2.D, Part A) — the hand-written
/// equivalent of one AutoMapper profile, kept dependency-light so the reference build restores with no
/// extra package. Mapping ONLY: no business rule lives here. A work order's derived PartsCost is computed
/// by the service and passed in; TotalCost is the frozen completion total when present (FSD rule 11),
/// otherwise LabourCost + PartsCost.
/// </summary>
public static class Mappers
{
    public static DepotDto ToDto(this Depot d) => new(d.Id, d.Code, d.Name, d.City);

    public static VehicleDto ToDto(this Vehicle v) =>
        new(v.Id, v.Registration, v.Make, v.Model, v.Year, v.DepotId, v.OdometerKm, v.Status.ToString());

    public static DriverDto ToDto(this Driver d) =>
        new(d.Id, d.Name, d.LicenceNumber, d.DepotId, d.Status.ToString());

    public static PartDto ToDto(this Part p) =>
        new(p.Id, p.PartNumber, p.Name, p.UnitCost, p.QuantityInStock);

    public static WorkOrderDto ToDto(this WorkOrder w, decimal partsCost)
    {
        var totalCost = w.CompletedTotalCost ?? (w.LabourCost + partsCost);
        return new WorkOrderDto(
            w.Id, w.VehicleId, w.Title, w.Description,
            w.Type.ToString(), w.Priority.ToString(), w.Status.ToString(),
            w.OpenedDate, w.DueDate, w.CompletedDate,
            w.AssignedDriverId, w.LabourCost, partsCost, totalCost);
    }
}

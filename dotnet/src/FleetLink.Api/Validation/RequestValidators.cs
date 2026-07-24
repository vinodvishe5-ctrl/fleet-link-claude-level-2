using FleetLink.Api.Common;
using FleetLink.Api.Dtos;
using FleetLink.Api.Models;

namespace FleetLink.Api.Validation;

/// <summary>
/// Boundary validation (Module 2.D, Part C). These run at the endpoint edge and DELIBERATELY MIRROR the
/// service rules: coherent dates (rule 4), no back-dating (rule 5), the Critical two-day SLA (rule 6),
/// non-negative amounts and quantities. The service remains authoritative — every rule checked here is
/// also enforced there — so a rule is never enforced in one place and forgotten in the other. The
/// alternative wiring is DataAnnotations / FluentValidation on the request DTOs; kept explicit here so
/// the boundary/service mirror is obvious in one file.
/// </summary>
public static class RequestValidators
{
    private static void Require(bool condition, string message)
    {
        if (!condition) throw Errors.Validation(message);
    }

    public static void ValidateCreateWorkOrder(CreateWorkOrderRequest? req, IClock clock)
    {
        Require(req is not null, "Request body is required.");
        Require(!string.IsNullOrWhiteSpace(req!.Title), "title is required.");
        Require(req.Description is not null, "description is required.");
        Require(Enums.IsValid<WorkOrderType>(req.Type), $"type must be one of {string.Join(", ", Enum.GetNames<WorkOrderType>())}.");
        Require(Enums.IsValid<WorkOrderPriority>(req.Priority), $"priority must be one of {string.Join(", ", Enum.GetNames<WorkOrderPriority>())}.");
        Require(Dates.TryParseIso(req.OpenedDate, out var openedDate), "openedDate must be an ISO date (yyyy-MM-dd).");
        Require(Dates.TryParseIso(req.DueDate, out var dueDate), "dueDate must be an ISO date (yyyy-MM-dd).");
        Require(req.LabourCost is >= 0m, "labourCost must be a number >= 0.");

        // The same date rules the service enforces (rules 4–6), mirrored at the boundary.
        if (dueDate < openedDate) throw Errors.IncoherentDates();                                    // rule 4
        if (openedDate < clock.Today) throw Errors.BackDated();                                      // rule 5
        if (req.Priority == nameof(WorkOrderPriority.Critical) && dueDate.DayNumber - openedDate.DayNumber > 2)
            throw Errors.CriticalSla();                                                              // rule 6
    }

    public static void ValidateChangeStatus(ChangeStatusRequest? req)
    {
        Require(req is not null, "Request body is required.");
        Require(Enums.IsValid<WorkOrderStatus>(req!.Status), $"status must be one of {string.Join(", ", Enum.GetNames<WorkOrderStatus>())}.");
    }

    public static void ValidateAddParts(AddWorkOrderPartsRequest? req)
    {
        Require(req?.Parts is { Count: > 0 }, "parts must be a non-empty array.");
        foreach (var line in req!.Parts!)
            Require(line.Quantity >= 1, "each part line needs a quantity >= 1.");                     // rule 8 (boundary)
    }

    public static void ValidateUpdateOdometer(UpdateOdometerRequest? req)
    {
        Require(req is not null, "Request body is required.");
        Require(req!.OdometerKm is >= 0, "odometerKm must be an integer >= 0.");
    }
}

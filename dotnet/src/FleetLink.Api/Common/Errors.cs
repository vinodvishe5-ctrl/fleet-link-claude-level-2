namespace FleetLink.Api.Common;

/// <summary>
/// Named factories — one per FSD §5 failure — so the service layer and the boundary validators throw
/// the SAME code for the SAME rule and can never drift apart. Mirrors the JavaScript track's Errors.
/// </summary>
public static class Errors
{
    public static DomainException VehicleNotFound() => new(404, "vehicle_not_found", "Vehicle not found.");            // rule 2
    public static DomainException DepotNotFound() => new(404, "depot_not_found", "Depot not found.");
    public static DomainException WorkOrderNotFound() => new(404, "work_order_not_found", "Work order not found.");
    public static DomainException PartNotFound() => new(404, "part_not_found", "Part not found.");
    public static DomainException DriverNotFound() => new(404, "driver_not_found", "Assigned driver not found.");
    public static DomainException VehicleRetired() => new(409, "vehicle_retired", "Cannot open work on a retired vehicle."); // rule 3
    public static DomainException IncoherentDates() => new(400, "incoherent_dates", "DueDate must be on or after OpenedDate."); // rule 4
    public static DomainException BackDated() => new(400, "back_dated", "OpenedDate cannot be before today.");          // rule 5
    public static DomainException CriticalSla() => new(400, "critical_sla", "Critical work must be due within 2 days of OpenedDate."); // rule 6
    public static DomainException InsufficientStock() => new(409, "insufficient_stock", "Not enough stock for the requested quantity."); // rule 8
    public static DomainException CompletionRequiresAssignee() => new(409, "completion_requires_assignee", "A non-inspection work order needs an assigned driver to complete."); // rule 9
    public static DomainException IllegalTransition(string from, string to) => new(409, "illegal_transition", $"Illegal status transition {from} → {to}."); // rule 10
    public static DomainException OdometerDecrease() => new(400, "odometer_decrease", "Odometer may only stay the same or increase."); // rule 12
    public static DomainException Validation(string message) => new(400, "validation_error", message);
}

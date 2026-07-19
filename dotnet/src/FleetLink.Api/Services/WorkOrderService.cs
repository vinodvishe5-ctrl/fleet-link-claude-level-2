using FleetLink.Api.Common;
using FleetLink.Api.Data;
using FleetLink.Api.Dtos;
using FleetLink.Api.Models;

namespace FleetLink.Api.Services;

/// <summary>
/// The work-order service — FleetLink's business logic. EVERY check below traces to a numbered line in
/// FSD §5; the rule number is in a comment so a reviewer can read this file against the spec.
/// </summary>
public sealed class WorkOrderService : IWorkOrderService
{
    private readonly FleetStore _store;
    private readonly IClock _clock;
    private readonly IVehicleService _vehicles;

    public WorkOrderService(FleetStore store, IClock clock, IVehicleService vehicles)
    {
        _store = store;
        _clock = clock;
        _vehicles = vehicles;
    }

    // FSD rule 10 — the allowed status transitions. Completed and Cancelled are terminal (empty arrays).
    private static readonly IReadOnlyDictionary<WorkOrderStatus, WorkOrderStatus[]> Transitions =
        new Dictionary<WorkOrderStatus, WorkOrderStatus[]>
        {
            [WorkOrderStatus.Open] = new[] { WorkOrderStatus.InProgress, WorkOrderStatus.OnHold, WorkOrderStatus.Cancelled },
            [WorkOrderStatus.InProgress] = new[] { WorkOrderStatus.OnHold, WorkOrderStatus.Completed, WorkOrderStatus.Cancelled },
            [WorkOrderStatus.OnHold] = new[] { WorkOrderStatus.InProgress, WorkOrderStatus.Cancelled },
            [WorkOrderStatus.Completed] = Array.Empty<WorkOrderStatus>(),
            [WorkOrderStatus.Cancelled] = Array.Empty<WorkOrderStatus>(),
        };

    public WorkOrderDto? GetWorkOrder(Guid id)
    {
        var w = _store.WorkOrders.FirstOrDefault(x => x.Id == id);
        return w?.ToDto(Costing.PartsCostFor(_store, w.Id));
    }

    // Create — FSD rules 2–6 (plus rule 7 as a consequence when the new order is a Breakdown).
    public WorkOrderDto CreateWorkOrder(Guid vehicleId, CreateWorkOrderRequest request)
    {
        var vehicle = _store.Vehicles.FirstOrDefault(v => v.Id == vehicleId) ?? throw Errors.VehicleNotFound(); // rule 2
        if (vehicle.Status == VehicleStatus.Retired) throw Errors.VehicleRetired();                             // rule 3

        var type = Enums.Parse<WorkOrderType>(request.Type, "type");
        var priority = Enums.Parse<WorkOrderPriority>(request.Priority, "priority");
        var openedDate = Dates.ParseIso(request.OpenedDate);
        var dueDate = Dates.ParseIso(request.DueDate);

        if (dueDate < openedDate) throw Errors.IncoherentDates();                                               // rule 4
        if (openedDate < _clock.Today) throw Errors.BackDated();                                                // rule 5
        if (priority == WorkOrderPriority.Critical && dueDate.DayNumber - openedDate.DayNumber > 2)
            throw Errors.CriticalSla();                                                                         // rule 6
        if (request.AssignedDriverId is Guid drv && _store.Drivers.All(d => d.Id != drv))
            throw Errors.DriverNotFound();

        var workOrder = new WorkOrder
        {
            Id = Guid.NewGuid(),
            VehicleId = vehicleId,
            Title = request.Title ?? string.Empty,
            Description = request.Description ?? string.Empty,
            Type = type,
            Priority = priority,
            Status = WorkOrderStatus.Open,
            OpenedDate = openedDate,
            DueDate = dueDate,
            CompletedDate = null,
            AssignedDriverId = request.AssignedDriverId,
            LabourCost = request.LabourCost ?? 0m,
            CompletedTotalCost = null,                       // set only on completion (rule 11)
        };
        _store.WorkOrders.Add(workOrder);
        if (type == WorkOrderType.Breakdown) _vehicles.RecomputeBreakdownStatus(vehicleId);                     // rule 7
        return workOrder.ToDto(Costing.PartsCostFor(_store, workOrder.Id));
    }

    // Change status — FSD rules 9, 10, 11 (and rule 7 when a breakdown closes).
    public WorkOrderDto ChangeStatus(Guid workOrderId, string? newStatusRaw)
    {
        var w = _store.WorkOrders.FirstOrDefault(x => x.Id == workOrderId) ?? throw Errors.WorkOrderNotFound();
        var newStatus = Enums.Parse<WorkOrderStatus>(newStatusRaw, "status");
        if (!Transitions[w.Status].Contains(newStatus))
            throw Errors.IllegalTransition(w.Status.ToString(), newStatus.ToString());                          // rule 10

        if (newStatus == WorkOrderStatus.Completed)
        {
            if (w.Type != WorkOrderType.Inspection && w.AssignedDriverId is null)
                throw Errors.CompletionRequiresAssignee();                                                      // rule 9
            w.CompletedDate = _clock.Today;                                                                     // rule 11
            w.CompletedTotalCost = w.LabourCost + Costing.PartsCostFor(_store, w.Id);                           // rule 11 — freeze TotalCost
        }
        w.Status = newStatus;
        _vehicles.RecomputeBreakdownStatus(w.VehicleId);                                                        // rule 7
        return w.ToDto(Costing.PartsCostFor(_store, w.Id));
    }

    // Add parts used — FSD rule 8. Validate the whole request against current stock BEFORE mutating
    // anything, so a bad line never half-applies.
    public WorkOrderDto AddParts(Guid workOrderId, IReadOnlyList<WorkOrderPartLine> lines)
    {
        var w = _store.WorkOrders.FirstOrDefault(x => x.Id == workOrderId) ?? throw Errors.WorkOrderNotFound();

        var requested = new Dictionary<Guid, int>();
        foreach (var line in lines)
        {
            if (_store.Parts.All(p => p.Id != line.PartId)) throw Errors.PartNotFound();
            requested[line.PartId] = requested.GetValueOrDefault(line.PartId) + line.Quantity;
        }
        foreach (var (partId, qty) in requested)
        {
            var part = _store.Parts.First(p => p.Id == partId);
            if (qty > part.QuantityInStock) throw Errors.InsufficientStock();                                   // rule 8
        }
        foreach (var (partId, qty) in requested)
        {
            var part = _store.Parts.First(p => p.Id == partId);
            part.QuantityInStock -= qty;                                                                        // rule 8 — decrement on save
            var existing = _store.WorkOrderParts.FirstOrDefault(wp => wp.WorkOrderId == workOrderId && wp.PartId == partId);
            if (existing is not null) existing.Quantity += qty;
            else _store.WorkOrderParts.Add(new WorkOrderPart { WorkOrderId = workOrderId, PartId = partId, Quantity = qty });
        }
        return w.ToDto(Costing.PartsCostFor(_store, w.Id));
    }
}

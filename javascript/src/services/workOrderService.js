// Work-order service (Module 2.D) — the heart of FleetLink's business logic. EVERY rule below traces to
// a numbered line in FSD §5; the rule number is in a comment on each check so a reviewer can read the
// service against the spec. Nothing here lives in a route or a model.
import { randomUUID } from 'node:crypto';
import store from '../data/store.js';
import { Errors } from '../errors.js';
import { toWorkOrderDto, toWorkOrderPartLineDto } from '../dtos/mappers.js';
import { partsCostFor } from './costing.js';
import { recomputeBreakdownStatus } from './vehicleService.js';
import { todayIso, diffDays } from '../dates.js';

// FSD rule 10 — the allowed status transitions. Completed and Cancelled are terminal (empty lists).
const TRANSITIONS = {
  Open: ['InProgress', 'OnHold', 'Cancelled'],
  InProgress: ['OnHold', 'Completed', 'Cancelled'],
  OnHold: ['InProgress', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

const findWorkOrder = (id) => store.workOrders.find((w) => w.id === id);
const dto = (w) => toWorkOrderDto(w, partsCostFor(w.id));

export function getWorkOrder(id) {
  const w = findWorkOrder(id);
  return w ? dto(w) : null;
}

// Read the parts recorded on a work order (Module 2.G hand-off endpoint) — 404 if the work order is
// unknown. Pure read: joins each WorkOrderPart line to its Part and projects to the line DTO.
export function listWorkOrderParts(workOrderId) {
  const w = findWorkOrder(workOrderId);
  if (!w) throw Errors.workOrderNotFound();
  const partsById = new Map(store.parts.map((p) => [p.id, p]));
  return store.workOrderParts
    .filter((wp) => wp.workOrderId === workOrderId)
    .map((wp) => toWorkOrderPartLineDto(wp, partsById.get(wp.partId)));
}

// Create — FSD rules 2–6 (plus rule 7 as a consequence when the new order is a Breakdown).
export function createWorkOrder(vehicleId, req, clock) {
  const vehicle = store.vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) throw Errors.vehicleNotFound();                                  // rule 2
  if (vehicle.status === 'Retired') throw Errors.vehicleRetired();              // rule 3
  if (req.dueDate < req.openedDate) throw Errors.incoherentDates();             // rule 4
  if (req.openedDate < todayIso(clock)) throw Errors.backDated();               // rule 5
  if (req.priority === 'Critical' && diffDays(req.openedDate, req.dueDate) > 2) throw Errors.criticalSla(); // rule 6
  if (req.assignedDriverId && !store.drivers.some((d) => d.id === req.assignedDriverId)) throw Errors.driverNotFound();

  const workOrder = {
    id: randomUUID(),
    vehicleId,
    title: req.title,
    description: req.description,
    type: req.type,
    priority: req.priority,
    status: 'Open',
    openedDate: req.openedDate,
    dueDate: req.dueDate,
    completedDate: null,
    assignedDriverId: req.assignedDriverId ?? null,
    labourCost: req.labourCost,
    completedTotalCost: null,       // set only on completion (rule 11)
  };
  store.workOrders.push(workOrder);
  if (workOrder.type === 'Breakdown') recomputeBreakdownStatus(vehicleId);      // rule 7
  return dto(workOrder);
}

// Change status — FSD rules 9, 10, 11 (and rule 7 when a breakdown closes).
export function changeStatus(workOrderId, newStatus, clock) {
  const w = findWorkOrder(workOrderId);
  if (!w) throw Errors.workOrderNotFound();
  if (!Object.prototype.hasOwnProperty.call(TRANSITIONS, newStatus)) {
    throw Errors.validation(`Unknown status '${newStatus}'.`);
  }
  if (!TRANSITIONS[w.status].includes(newStatus)) throw Errors.illegalTransition(w.status, newStatus); // rule 10

  if (newStatus === 'Completed') {
    if (w.type !== 'Inspection' && !w.assignedDriverId) throw Errors.completionRequiresAssignee();     // rule 9
    w.completedDate = todayIso(clock);                                          // rule 11
    w.completedTotalCost = w.labourCost + partsCostFor(w.id);                   // rule 11 — freeze TotalCost
  }
  w.status = newStatus;
  recomputeBreakdownStatus(w.vehicleId);                                        // rule 7
  return dto(w);
}

// Add parts used — FSD rule 8 (stock cannot go negative; decrement on save). Validate the whole request
// against current stock BEFORE mutating anything, so a bad line never half-applies. The quantity floor is
// re-checked here AUTHORITATIVELY (Module 2.H): the service never trusts the edge validator, so a caller
// that skipped it can still not record a zero or negative quantity.
export function addParts(workOrderId, items) {
  const w = findWorkOrder(workOrderId);
  if (!w) throw Errors.workOrderNotFound();

  const requested = new Map();       // partId → total requested across the request
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) throw Errors.invalidQuantity(); // rule 8 — authoritative quantity floor
    const part = store.parts.find((p) => p.id === item.partId);
    if (!part) throw Errors.partNotFound();
    requested.set(item.partId, (requested.get(item.partId) ?? 0) + item.quantity);
  }
  for (const [partId, qty] of requested) {
    const part = store.parts.find((p) => p.id === partId);
    if (qty > part.quantityInStock) throw Errors.insufficientStock();          // rule 8
  }

  for (const [partId, qty] of requested) {
    const part = store.parts.find((p) => p.id === partId);
    part.quantityInStock -= qty;                                               // rule 8 — decrement on save
    const line = store.workOrderParts.find((wp) => wp.workOrderId === workOrderId && wp.partId === partId);
    if (line) line.quantity += qty;
    else store.workOrderParts.push({ workOrderId, partId, quantity: qty });
  }
  return dto(w);
}

// Vehicle service (Module 2.D). Reads on the vehicle, plus the two vehicle-owned business rules:
//   • rule 12 — odometer is monotonic (may stay the same or increase, never decrease).
//   • rule 7  — breakdown auto-status: a vehicle is InMaintenance exactly while it has an Open/InProgress
//               Breakdown work order, and returns to Active when none remain. A Retired vehicle is never
//               auto-changed. This recompute is called by workOrderService whenever a breakdown opens or
//               closes, so the vehicle's status is always a consequence of its work, not set by hand.
import store from '../data/store.js';
import { Errors } from '../errors.js';
import { toVehicleDto, toWorkOrderDto } from '../dtos/mappers.js';
import { partsCostFor } from './costing.js';

const findVehicle = (id) => store.vehicles.find((v) => v.id === id);

export function listVehicles() {
  return store.vehicles.map(toVehicleDto);
}

export function getVehicle(id) {
  const v = findVehicle(id);
  return v ? toVehicleDto(v) : null;
}

export function listWorkOrdersForVehicle(vehicleId) {
  if (!findVehicle(vehicleId)) throw Errors.vehicleNotFound();               // rule 2 (distinguish 404 from empty)
  return store.workOrders
    .filter((w) => w.vehicleId === vehicleId)
    .map((w) => toWorkOrderDto(w, partsCostFor(w.id)));
}

// FSD rule 12 — odometer may only stay the same or increase.
export function updateOdometer(vehicleId, odometerKm) {
  const v = findVehicle(vehicleId);
  if (!v) throw Errors.vehicleNotFound();                                    // rule 2
  if (typeof odometerKm !== 'number' || odometerKm < v.odometerKm) throw Errors.odometerDecrease(); // rule 12
  v.odometerKm = odometerKm;
  return toVehicleDto(v);
}

// FSD rule 7 — derive the vehicle's status from its open breakdown work, without ever touching a
// Retired vehicle. Called after any create/status change that could open or close a Breakdown.
export function recomputeBreakdownStatus(vehicleId) {
  const v = findVehicle(vehicleId);
  if (!v || v.status === 'Retired') return;
  const hasOpenBreakdown = store.workOrders.some(
    (w) => w.vehicleId === vehicleId && w.type === 'Breakdown'
      && (w.status === 'Open' || w.status === 'InProgress'));
  v.status = hasOpenBreakdown ? 'InMaintenance' : 'Active';
}

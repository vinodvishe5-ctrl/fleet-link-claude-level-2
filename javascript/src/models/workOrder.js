// WorkOrder — FSD §3.5. The central record: a unit of maintenance work on one vehicle.
// PartsCost and TotalCost are DERIVED (FSD §3.5) — they are computed in the service layer in 2.D,
// not stored, so they are intentionally absent from the stored shape.
import { WorkOrderType, WorkOrderPriority, WorkOrderStatus } from './enums.js';
export function makeWorkOrder({
  id, vehicleId, title, description, type, priority, status,
  openedDate, dueDate, completedDate = null, assignedDriverId = null, labourCost,
}) {
  return {
    id, vehicleId, title, description, type, priority, status,
    openedDate, dueDate, completedDate, assignedDriverId, labourCost,
  };
}
export { WorkOrderType, WorkOrderPriority, WorkOrderStatus };

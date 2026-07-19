// Cost derivation (FSD §3.5) lives in the service layer, not the model or the store — the value is
// computed from the line items on demand, never stored (a 2.C decision we hold to). PartsCost for a
// work order = Σ(WorkOrderPart.Quantity × Part.UnitCost). TotalCost is finished in the DTO mapper.
import store from '../data/store.js';

export function partsCostFor(workOrderId) {
  const partsById = new Map(store.parts.map((p) => [p.id, p]));
  return store.workOrderParts
    .filter((wp) => wp.workOrderId === workOrderId)
    .reduce((sum, wp) => sum + wp.quantity * (partsById.get(wp.partId)?.unitCost ?? 0), 0);
}

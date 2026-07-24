// WorkOrderPart — FSD §3.6. The line item: parts used on a work order (composite key WorkOrderId+PartId).
export function makeWorkOrderPart({ workOrderId, partId, quantity }) {
  return { workOrderId, partId, quantity };
}

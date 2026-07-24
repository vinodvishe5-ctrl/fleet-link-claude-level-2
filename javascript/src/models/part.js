// Part — FSD §3.4. A stock item consumed by work orders.
export function makePart({ id, partNumber, name, unitCost, quantityInStock }) {
  return { id, partNumber, name, unitCost, quantityInStock };
}

// Depot — FSD §3.1. A location a vehicle is based at and a work order is carried out at.
// Factory only: it names the shape. No persistence and no business rules here (those are 2.D).
export function makeDepot({ id, code, name, city }) {
  return { id, code, name, city };
}

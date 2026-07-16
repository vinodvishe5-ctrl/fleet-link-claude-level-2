// In-memory store for the training build (FSD §8 · javascript/CLAUDE.md). A module-level store holding
// arrays of each entity, loaded from the fixed seed. This is the runtime the API is built on in 2.D.
// The agreed schema (../../docs/schema.sql) records how the same model maps to a real relational
// database (SQL Server / Azure SQL); the API on top of this store is Module 2.D.
import seed from './seed.js';

function clone(rows) {
  return rows.map((r) => ({ ...r }));
}

// Fresh, independent collections each time load() runs, so tests never leak state into each other.
function build() {
  return {
    depots: clone(seed.DEPOTS),
    vehicles: clone(seed.VEHICLES),
    drivers: clone(seed.DRIVERS),
    parts: clone(seed.PARTS),
    workOrders: clone(seed.WORK_ORDERS),
    workOrderParts: clone(seed.WORK_ORDER_PARTS),
  };
}

let collections = build();

export const store = {
  get depots() { return collections.depots; },
  get vehicles() { return collections.vehicles; },
  get drivers() { return collections.drivers; },
  get parts() { return collections.parts; },
  get workOrders() { return collections.workOrders; },
  get workOrderParts() { return collections.workOrderParts; },
  // Counts — used by the startup log and by /api/meta to prove the seed loaded.
  counts() {
    return {
      depots: collections.depots.length,
      vehicles: collections.vehicles.length,
      drivers: collections.drivers.length,
      parts: collections.parts.length,
      workOrders: collections.workOrders.length,
    };
  },
  // Reset to the fixed seed (used by tests and at startup).
  reset() { collections = build(); return store; },
};

export default store;

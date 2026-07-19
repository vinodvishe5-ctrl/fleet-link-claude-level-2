// Depot reads (Module 2.D, Part A — the read side). No business rule carries on a read, which is why we
// build reads first: they prove data flows store → service → DTO cleanly before any rule exists.
import store from '../data/store.js';
import { Errors } from '../errors.js';
import { toDepotDto, toVehicleDto } from '../dtos/mappers.js';

export function listDepots() {
  return store.depots.map(toDepotDto);
}

export function getDepot(id) {
  const depot = store.depots.find((d) => d.id === id);
  return depot ? toDepotDto(depot) : null;
}

// GET /api/depots/{id}/vehicles — 404 when the depot itself is missing (distinguish "no such depot"
// from "a real depot with no vehicles", which is an empty list).
export function listVehiclesForDepot(depotId) {
  const depot = store.depots.find((d) => d.id === depotId);
  if (!depot) throw Errors.depotNotFound();
  return store.vehicles.filter((v) => v.depotId === depotId).map(toVehicleDto);
}

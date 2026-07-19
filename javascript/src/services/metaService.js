// Non-domain app metadata. Introduced in Module 2.B to exercise the route → service layering before
// any FleetLink entity exists. Deliberately NO business logic here — the `seed` counts below are read
// straight from the store purely to PROVE the data model loaded. As of Module 2.D the real domain read
// endpoints (GET /api/depots, /api/vehicles, …) exist; buildStage now records that the API layer landed.
import store from '../data/store.js';

export function getMeta() {
  return {
    app: 'FleetLink',
    track: 'javascript',
    version: '0.5.0',
    buildStage: '2.E — UI',
    plannedEntities: ['Depot', 'Vehicle', 'Driver', 'Part', 'WorkOrder', 'WorkOrderPart'],
    seed: store.counts(),
  };
}

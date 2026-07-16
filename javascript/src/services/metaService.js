// Non-domain app metadata. Introduced in Module 2.B to exercise the route → service layering before
// any FleetLink entity exists. Deliberately NO business logic here — the `seed` counts below are read
// straight from the store purely to PROVE the Module 2.C data model loaded (they are metadata about
// the build, not a domain operation; the real read endpoints — GET /api/depots, … — arrive in 2.D).
import store from '../data/store.js';

export function getMeta() {
  return {
    app: 'FleetLink',
    track: 'javascript',
    version: '0.3.0',
    buildStage: '2.C — data model',
    plannedEntities: ['Depot', 'Vehicle', 'Driver', 'Part', 'WorkOrder', 'WorkOrderPart'],
    seed: store.counts(),
  };
}

// Non-domain app metadata. Introduced in Module 2.B to exercise the route → service layering before
// any FleetLink entity exists (the domain services with the FSD §5 rules arrive in Module 2.D).
// Deliberately NO business logic here.
export function getMeta() {
  return {
    app: 'FleetLink',
    track: 'javascript',
    version: '0.2.0',
    buildStage: '2.B — scaffold',
    plannedEntities: ['Depot', 'Vehicle', 'Driver', 'Part', 'WorkOrder', 'WorkOrderPart'],
  };
}

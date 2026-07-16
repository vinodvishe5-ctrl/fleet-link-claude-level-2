// FleetLink seed data — FSD §7. Identical across the .NET and JavaScript tracks: SAME ids, SAME values.
// Fixed uuids so both tracks and every trainee share the same data. All names/registrations/licences
// are FICTIONAL and clearly labelled (root CLAUDE.md guardrails).
//
// This one seed source feeds BOTH the in-memory store (src/data/store.js) and the database-first
// demonstration (db/loadSeed.js), so the store and the SQLite schema hold exactly the same rows.

export const DEPOTS = [
  { id: '11111111-0000-0000-0000-000000000001', code: 'DEP-LDN', name: 'London Central Depot', city: 'London' },
  { id: '11111111-0000-0000-0000-000000000002', code: 'DEP-MAN', name: 'Manchester North Depot', city: 'Manchester' },
];

export const VEHICLES = [
  { id: '22222222-0000-0000-0000-000000000001', registration: 'FL-1001', make: 'Ford', model: 'Transit', year: 2021, depotId: DEPOTS[0].id, odometerKm: 45000, status: 'Active' },
  { id: '22222222-0000-0000-0000-000000000002', registration: 'FL-1002', make: 'Mercedes-Benz', model: 'Sprinter', year: 2020, depotId: DEPOTS[0].id, odometerKm: 78200, status: 'Active' },
  { id: '22222222-0000-0000-0000-000000000003', registration: 'FL-1003', make: 'Volkswagen', model: 'Crafter', year: 2019, depotId: DEPOTS[1].id, odometerKm: 120500, status: 'InMaintenance' },
  { id: '22222222-0000-0000-0000-000000000004', registration: 'FL-1004', make: 'Renault', model: 'Master', year: 2016, depotId: DEPOTS[1].id, odometerKm: 210000, status: 'Retired' },
];

export const DRIVERS = [
  { id: '33333333-0000-0000-0000-000000000001', name: 'Ravi Menon', licenceNumber: 'LIC-4417', depotId: DEPOTS[0].id, status: 'Active' },
  { id: '33333333-0000-0000-0000-000000000002', name: 'Sofia Alvarez', licenceNumber: 'LIC-8823', depotId: DEPOTS[0].id, status: 'Active' },
  { id: '33333333-0000-0000-0000-000000000003', name: 'Tom Becker', licenceNumber: 'LIC-2251', depotId: DEPOTS[1].id, status: 'Inactive' },
];

export const PARTS = [
  { id: '44444444-0000-0000-0000-000000000001', partNumber: 'PN-BRK-01', name: 'Brake pad set', unitCost: 42.50, quantityInStock: 20 },
  { id: '44444444-0000-0000-0000-000000000002', partNumber: 'PN-OIL-05', name: 'Oil filter', unitCost: 9.75, quantityInStock: 60 },
  { id: '44444444-0000-0000-0000-000000000003', partNumber: 'PN-TYR-02', name: 'Tyre', unitCost: 88.00, quantityInStock: 16 },
  { id: '44444444-0000-0000-0000-000000000004', partNumber: 'PN-BAT-01', name: 'Battery', unitCost: 130.00, quantityInStock: 8 },
];

// Work orders exercise every enum: types Breakdown/Scheduled/Inspection, priorities High/Medium/Low,
// statuses InProgress/Open/Completed. WO-1 is an OPEN Breakdown on FL-1003, which is why that vehicle's
// status is InMaintenance (FSD rule 7 — the coherence is baked into the seed; the rule is enforced in 2.D).
export const WORK_ORDERS = [
  { id: '55555555-0000-0000-0000-000000000001', vehicleId: VEHICLES[2].id, title: 'Clutch replacement', description: 'Clutch slipping under load; replace assembly.', type: 'Breakdown', priority: 'High', status: 'InProgress', openedDate: '2026-07-13', dueDate: '2026-07-16', completedDate: null, assignedDriverId: DRIVERS[0].id, labourCost: 150.00 },
  { id: '55555555-0000-0000-0000-000000000002', vehicleId: VEHICLES[0].id, title: 'Scheduled 45k service', description: 'Routine 45,000 km service.', type: 'Scheduled', priority: 'Medium', status: 'Open', openedDate: '2026-07-15', dueDate: '2026-07-20', completedDate: null, assignedDriverId: DRIVERS[0].id, labourCost: 80.00 },
  { id: '55555555-0000-0000-0000-000000000003', vehicleId: VEHICLES[1].id, title: 'Annual inspection', description: 'Statutory annual inspection.', type: 'Inspection', priority: 'Low', status: 'Completed', openedDate: '2026-07-01', dueDate: '2026-07-05', completedDate: '2026-07-04', assignedDriverId: null, labourCost: 60.00 },
];

// Line items — FSD §3.6. Composite key (workOrderId, partId).
export const WORK_ORDER_PARTS = [
  { workOrderId: WORK_ORDERS[0].id, partId: PARTS[0].id, quantity: 2 },
  { workOrderId: WORK_ORDERS[0].id, partId: PARTS[1].id, quantity: 1 },
  { workOrderId: WORK_ORDERS[2].id, partId: PARTS[1].id, quantity: 1 },
];

export const seed = { DEPOTS, VEHICLES, DRIVERS, PARTS, WORK_ORDERS, WORK_ORDER_PARTS };
export default seed;

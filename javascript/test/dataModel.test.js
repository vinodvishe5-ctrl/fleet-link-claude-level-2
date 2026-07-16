import { test } from 'node:test';
import assert from 'node:assert/strict';
import store from '../src/data/store.js';
import { VehicleStatus, WorkOrderStatus } from '../src/models/enums.js';

test('seed loads the FSD §7 sample set with the right counts', () => {
  store.reset();
  assert.deepEqual(store.counts(), { depots: 2, vehicles: 4, drivers: 3, parts: 4, workOrders: 3 });
});

test('every vehicle references a real depot (relationship integrity)', () => {
  store.reset();
  const depotIds = new Set(store.depots.map((d) => d.id));
  for (const v of store.vehicles) assert.ok(depotIds.has(v.depotId), `${v.registration} depot missing`);
});

test('enum values are the FSD strings (no magic integers)', () => {
  store.reset();
  for (const v of store.vehicles) assert.ok(VehicleStatus.includes(v.status));
  for (const w of store.workOrders) assert.ok(WorkOrderStatus.includes(w.status));
});

test('the seed is coherent: FL-1003 is InMaintenance and has the open Breakdown work order (FSD rule 7)', () => {
  store.reset();
  const v = store.vehicles.find((x) => x.registration === 'FL-1003');
  assert.equal(v.status, 'InMaintenance');
  const openBreakdown = store.workOrders.find(
    (w) => w.vehicleId === v.id && w.type === 'Breakdown' && w.status === 'InProgress');
  assert.ok(openBreakdown, 'expected an open Breakdown on FL-1003');
});

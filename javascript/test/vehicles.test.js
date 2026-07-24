// Vehicle write-side test (Module 2.D) — FSD rule 12, odometer is monotonic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, get, patch, json, IDS } from './helpers.js';

test('rule 12 — odometer may increase or stay the same, but never decrease', async () => {
  const { server, base } = startServer();
  try {
    // FL-1001 starts at 45000. A decrease must be refused with 400.
    const down = await json(await patch(base, `/api/vehicles/${IDS.vehicleActive}/odometer`, { odometerKm: 44000 }));
    assert.equal(down.status, 400);
    assert.equal(down.body.code, 'odometer_decrease');

    // An increase is accepted and persisted.
    const up = await json(await patch(base, `/api/vehicles/${IDS.vehicleActive}/odometer`, { odometerKm: 46000 }));
    assert.equal(up.status, 200);
    assert.equal(up.body.odometerKm, 46000);
    const reread = await json(await get(base, `/api/vehicles/${IDS.vehicleActive}`));
    assert.equal(reread.body.odometerKm, 46000);
  } finally { server.close(); }
});

test('rule 12 — updating a missing vehicle → 404', async () => {
  const { server, base } = startServer();
  try {
    const { status, body } = await json(await patch(base, '/api/vehicles/00000000-0000-0000-0000-000000000000/odometer', { odometerKm: 50000 }));
    assert.equal(status, 404);
    assert.equal(body.code, 'vehicle_not_found');
  } finally { server.close(); }
});

// Read-side tests (Module 2.D, Part A). The GET endpoints return DTOs from the seed and flow store →
// service → DTO. No business rule is exercised here — that is the whole point of building reads first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, get, json, IDS } from './helpers.js';

test('GET /api/vehicles returns the four seed vehicles as DTOs', async () => {
  const { server, base } = startServer();
  try {
    const { status, body } = await json(await get(base, '/api/vehicles'));
    assert.equal(status, 200);
    assert.equal(body.length, 4);
    assert.ok(body.every((v) => 'registration' in v && !('depot' in v)), 'DTOs, not entities');
  } finally { server.close(); }
});

test('GET /api/vehicles/{id} returns one vehicle; unknown id → 404', async () => {
  const { server, base } = startServer();
  try {
    const ok = await json(await get(base, `/api/vehicles/${IDS.vehicleActive}`));
    assert.equal(ok.status, 200);
    assert.equal(ok.body.registration, 'FL-1001');
    const missing = await json(await get(base, '/api/vehicles/00000000-0000-0000-0000-000000000000'));
    assert.equal(missing.status, 404);
    assert.equal(missing.body.code, 'vehicle_not_found');
  } finally { server.close(); }
});

test('GET /api/depots/{id}/vehicles lists the depot vehicles; unknown depot → 404', async () => {
  const { server, base } = startServer();
  try {
    const ok = await json(await get(base, `/api/depots/${IDS.depotLdn}/vehicles`));
    assert.equal(ok.status, 200);
    assert.equal(ok.body.length, 2);            // FL-1001, FL-1002 at DEP-LDN
    const missing = await json(await get(base, '/api/depots/00000000-0000-0000-0000-000000000000/vehicles'));
    assert.equal(missing.status, 404);
    assert.equal(missing.body.code, 'depot_not_found');
  } finally { server.close(); }
});

test('GET /api/work-orders/{id} includes derived partsCost and totalCost', async () => {
  const { server, base } = startServer();
  try {
    // WO-1 uses 2×PN-BRK-01 (42.50) + 1×PN-OIL-05 (9.75) = 94.75; labour 150 → total 244.75.
    const { status, body } = await json(await get(base, `/api/work-orders/${IDS.woInProgress}`));
    assert.equal(status, 200);
    assert.equal(body.partsCost, 94.75);
    assert.equal(body.totalCost, 244.75);
  } finally { server.close(); }
});

test('GET /api/parts returns the four seed parts', async () => {
  const { server, base } = startServer();
  try {
    const { status, body } = await json(await get(base, '/api/parts'));
    assert.equal(status, 200);
    assert.equal(body.length, 4);
  } finally { server.close(); }
});

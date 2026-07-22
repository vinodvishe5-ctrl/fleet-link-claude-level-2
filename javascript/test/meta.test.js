import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';

test('GET /api/meta returns scaffold metadata through the service', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const res = await fetch(`http://localhost:${port}/api/meta`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.app, 'FleetLink');
    assert.equal(body.track, 'javascript');
    assert.equal(body.version, '0.7.0');
    assert.equal(body.buildStage, '2.H — Debugging & RCA');
    assert.equal(body.plannedEntities.length, 6);
    // Module 2.C proof: the meta payload reports the loaded seed counts (FSD §7).
    assert.deepEqual(body.seed, { depots: 2, vehicles: 4, drivers: 3, parts: 4, workOrders: 3 });
  } finally {
    server.close();
  }
});

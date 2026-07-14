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
    assert.equal(body.version, '0.2.0');
    assert.equal(body.buildStage, '2.B — scaffold');
    assert.equal(body.plannedEntities.length, 6);
  } finally {
    server.close();
  }
});

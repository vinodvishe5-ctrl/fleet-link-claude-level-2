import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';

test('GET /health returns ok', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const res = await fetch(`http://localhost:${port}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.app, 'FleetLink');
    assert.equal(body.track, 'JavaScript');
  } finally {
    server.close();
  }
});

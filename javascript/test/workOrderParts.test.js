// Module 2.G — the BA→dev hand-off endpoint, built with the shared new-endpoint skill: GET the parts
// recorded on a work order. One test proving the read, one proving the 404 — the same shape every
// FleetLink read already has, so a fifth teammate would build it identically.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, get, post, json, IDS } from './helpers.js';

test('GET /api/work-orders/{id}/parts → 200 with the recorded line(s)', async () => {
  const { server, base } = startServer();
  try {
    await post(base, `/api/work-orders/${IDS.woOpen}/parts`, { parts: [{ partId: IDS.partBrake, quantity: 2 }] });
    const { status, body } = await json(await get(base, `/api/work-orders/${IDS.woOpen}/parts`));
    assert.equal(status, 200);
    assert.equal(body.length, 1);
    assert.equal(body[0].partId, IDS.partBrake);
    assert.equal(body[0].quantity, 2);
    assert.equal(body[0].lineCost, body[0].unitCost * 2);   // derived, not stored (FSD §3.5)
  } finally { server.close(); }
});

test('GET parts for a missing work order → 404', async () => {
  const { server, base } = startServer();
  try {
    const { status, body } = await json(await get(base, '/api/work-orders/00000000-0000-0000-0000-000000000000/parts'));
    assert.equal(status, 404);
    assert.equal(body.code, 'work_order_not_found');
  } finally { server.close(); }
});

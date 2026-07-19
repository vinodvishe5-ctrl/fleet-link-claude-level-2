// Work-order rule tests (Module 2.D). One test per FSD §5 rule, each asserting the exact status code.
// A rule is not "done" until a test proves it — this file is that proof for the write side.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, get, post, patch, json, IDS, validCreate, today, dayOffset } from './helpers.js';

test('happy path — create on an active vehicle → 201, Open, costs derived', async () => {
  const { server, base } = startServer();
  try {
    const { status, body } = await json(await post(base, `/api/vehicles/${IDS.vehicleActive}/work-orders`, validCreate()));
    assert.equal(status, 201);
    assert.equal(body.status, 'Open');
    assert.equal(body.partsCost, 0);
    assert.equal(body.totalCost, 100);          // labour only, no parts yet
  } finally { server.close(); }
});

test('rule 2 — create for a missing vehicle → 404', async () => {
  const { server, base } = startServer();
  try {
    const { status, body } = await json(await post(base, '/api/vehicles/00000000-0000-0000-0000-000000000000/work-orders', validCreate()));
    assert.equal(status, 404);
    assert.equal(body.code, 'vehicle_not_found');
  } finally { server.close(); }
});

test('rule 3 — create on a retired vehicle → 409', async () => {
  const { server, base } = startServer();
  try {
    const { status, body } = await json(await post(base, `/api/vehicles/${IDS.vehicleRetired}/work-orders`, validCreate()));
    assert.equal(status, 409);
    assert.equal(body.code, 'vehicle_retired');
  } finally { server.close(); }
});

test('rule 4 — DueDate before OpenedDate → 400', async () => {
  const { server, base } = startServer();
  try {
    const body = validCreate({ openedDate: dayOffset(3), dueDate: today() });
    const { status, body: res } = await json(await post(base, `/api/vehicles/${IDS.vehicleActive}/work-orders`, body));
    assert.equal(status, 400);
    assert.equal(res.code, 'incoherent_dates');
  } finally { server.close(); }
});

test('rule 5 — back-dated OpenedDate → 400', async () => {
  const { server, base } = startServer();
  try {
    const body = validCreate({ openedDate: dayOffset(-1), dueDate: dayOffset(3) });
    const { status, body: res } = await json(await post(base, `/api/vehicles/${IDS.vehicleActive}/work-orders`, body));
    assert.equal(status, 400);
    assert.equal(res.code, 'back_dated');
  } finally { server.close(); }
});

test('rule 6 — Critical due more than 2 days out → 400; within 2 days → 201', async () => {
  const { server, base } = startServer();
  try {
    const tooFar = validCreate({ priority: 'Critical', openedDate: today(), dueDate: dayOffset(5) });
    const bad = await json(await post(base, `/api/vehicles/${IDS.vehicleActive}/work-orders`, tooFar));
    assert.equal(bad.status, 400);
    assert.equal(bad.body.code, 'critical_sla');

    const inSla = validCreate({ priority: 'Critical', openedDate: today(), dueDate: dayOffset(2) });
    const ok = await json(await post(base, `/api/vehicles/${IDS.vehicleActive}/work-orders`, inSla));
    assert.equal(ok.status, 201);
  } finally { server.close(); }
});

test('rule 7 — opening a Breakdown sets the vehicle InMaintenance; closing it returns it to Active', async () => {
  const { server, base } = startServer();
  try {
    const created = await json(await post(base, `/api/vehicles/${IDS.vehicleActive}/work-orders`,
      validCreate({ type: 'Breakdown' })));
    assert.equal(created.status, 201);
    let v = await json(await get(base, `/api/vehicles/${IDS.vehicleActive}`));
    assert.equal(v.body.status, 'InMaintenance');

    const cancelled = await json(await patch(base, `/api/work-orders/${created.body.id}/status`, { status: 'Cancelled' }));
    assert.equal(cancelled.status, 200);
    v = await json(await get(base, `/api/vehicles/${IDS.vehicleActive}`));
    assert.equal(v.body.status, 'Active');
  } finally { server.close(); }
});

test('rule 8 — over-stock → 409; a valid add decrements stock and raises partsCost', async () => {
  const { server, base } = startServer();
  try {
    const over = await json(await post(base, `/api/work-orders/${IDS.woOpen}/parts`, { parts: [{ partId: IDS.partBattery, quantity: 100 }] }));
    assert.equal(over.status, 409);
    assert.equal(over.body.code, 'insufficient_stock');

    const ok = await json(await post(base, `/api/work-orders/${IDS.woOpen}/parts`, { parts: [{ partId: IDS.partBrake, quantity: 2 }] }));
    assert.equal(ok.status, 200);
    assert.equal(ok.body.partsCost, 85);        // 2 × 42.50
    const parts = await json(await get(base, '/api/parts'));
    const brake = parts.body.find((p) => p.partNumber === 'PN-BRK-01');
    assert.equal(brake.quantityInStock, 18);    // 20 − 2
  } finally { server.close(); }
});

test('rule 9 — completing a non-inspection order without an assignee → 409; an inspection may complete', async () => {
  const { server, base } = startServer();
  try {
    // Non-inspection, no assignee: Open → InProgress → Completed must fail with 409.
    const wo = await json(await post(base, `/api/vehicles/${IDS.vehicleActive}/work-orders`,
      validCreate({ type: 'Scheduled', assignedDriverId: null })));
    await patch(base, `/api/work-orders/${wo.body.id}/status`, { status: 'InProgress' });
    const complete = await json(await patch(base, `/api/work-orders/${wo.body.id}/status`, { status: 'Completed' }));
    assert.equal(complete.status, 409);
    assert.equal(complete.body.code, 'completion_requires_assignee');

    // Inspection, no assignee: the same path is allowed.
    const insp = await json(await post(base, `/api/vehicles/${IDS.vehicleActive}/work-orders`,
      validCreate({ type: 'Inspection', assignedDriverId: null })));
    await patch(base, `/api/work-orders/${insp.body.id}/status`, { status: 'InProgress' });
    const done = await json(await patch(base, `/api/work-orders/${insp.body.id}/status`, { status: 'Completed' }));
    assert.equal(done.status, 200);
  } finally { server.close(); }
});

test('rule 10 — an illegal transition → 409 (Completed is terminal)', async () => {
  const { server, base } = startServer();
  try {
    const { status, body } = await json(await patch(base, `/api/work-orders/${IDS.woCompleted}/status`, { status: 'InProgress' }));
    assert.equal(status, 409);
    assert.equal(body.code, 'illegal_transition');
  } finally { server.close(); }
});

test('rule 11 — completing stamps CompletedDate (today) and freezes TotalCost', async () => {
  const { server, base } = startServer();
  try {
    const wo = await json(await post(base, `/api/vehicles/${IDS.vehicleActive}/work-orders`,
      validCreate({ type: 'Scheduled', assignedDriverId: IDS.driver, labourCost: 100 })));
    await patch(base, `/api/work-orders/${wo.body.id}/status`, { status: 'InProgress' });
    const done = await json(await patch(base, `/api/work-orders/${wo.body.id}/status`, { status: 'Completed' }));
    assert.equal(done.status, 200);
    assert.equal(done.body.completedDate, today());
    assert.equal(done.body.totalCost, 100);     // labour 100 + 0 parts, frozen at completion
  } finally { server.close(); }
});

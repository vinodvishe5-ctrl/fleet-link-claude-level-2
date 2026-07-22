// Module 2.H — the regression that guards the fix. The debugging lab plants a bug by relaxing the
// boundary quantity check; the durable fix is an AUTHORITATIVE quantity floor in the service, so a
// non-positive (or non-integer) quantity is refused even by a caller that skipped the edge validator.
// This test calls the service directly — the edge a bypassing caller would skip — and proves the guard
// holds and stock is untouched. It is the failing test written when the bug was reproduced, kept as the
// regression so the same failure can never return silently.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import store from '../src/data/store.js';
import { addParts } from '../src/services/workOrderService.js';
import { IDS } from './helpers.js';

for (const bad of [0, -3, 1.5]) {
  test(`service refuses a part line with quantity ${bad} → invalid_quantity, stock unchanged`, () => {
    store.reset();
    const before = store.parts.find((p) => p.id === IDS.partBrake).quantityInStock;
    assert.throws(
      () => addParts(IDS.woOpen, [{ partId: IDS.partBrake, quantity: bad }]),
      (err) => err.status === 400 && err.code === 'invalid_quantity',
    );
    assert.equal(store.parts.find((p) => p.id === IDS.partBrake).quantityInStock, before); // nothing half-applied
  });
}

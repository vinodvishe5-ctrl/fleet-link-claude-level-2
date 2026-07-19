// Test helpers (Module 2.D). Start the app on an ephemeral port and offer tiny fetch wrappers so each
// rule test reads as "call the endpoint, assert the FSD status code". Dates are relative to the real
// server "today" (rules 5 and 6 are enforced against it), so tests stay valid on any day they run.
import app from '../src/server.js';
import store from '../src/data/store.js';

export function startServer() {
  store.reset();                       // isolate each test from the fixed seed
  const server = app.listen(0);
  const { port } = server.address();
  const base = `http://localhost:${port}`;
  return { server, base };
}

export const json = async (res) => ({ status: res.status, body: await res.json() });

export const get = (base, path) => fetch(`${base}${path}`);
export const post = (base, path, body) =>
  fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
export const patch = (base, path, body) =>
  fetch(`${base}${path}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

// Fixed ids from the shared seed (FSD §7) — the same on both tracks.
export const IDS = {
  depotLdn: '11111111-0000-0000-0000-000000000001',
  vehicleActive: '22222222-0000-0000-0000-000000000001',   // FL-1001, Active
  vehicleRetired: '22222222-0000-0000-0000-000000000004',  // FL-1004, Retired
  vehicleBreakdown: '22222222-0000-0000-0000-000000000003',// FL-1003, InMaintenance (open Breakdown)
  driver: '33333333-0000-0000-0000-000000000001',          // Ravi Menon, Active
  partBrake: '44444444-0000-0000-0000-000000000001',       // PN-BRK-01, stock 20
  partBattery: '44444444-0000-0000-0000-000000000004',     // PN-BAT-01, stock 8
  woOpen: '55555555-0000-0000-0000-000000000002',          // WO-2, Open, has assigned driver
  woInProgress: '55555555-0000-0000-0000-000000000001',    // WO-1, InProgress Breakdown on FL-1003
  woCompleted: '55555555-0000-0000-0000-000000000003',     // WO-3, Completed (terminal)
};

// ISO date offsets from the real server "today".
export function dayOffset(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const today = () => dayOffset(0);

// A valid create-work-order body against the active vehicle, dated so rules 4/5/6 all pass.
export const validCreate = (over = {}) => ({
  title: 'Brake inspection',
  description: 'Front brake check.',
  type: 'Scheduled',
  priority: 'Medium',
  openedDate: today(),
  dueDate: dayOffset(3),
  assignedDriverId: null,
  labourCost: 100,
  ...over,
});

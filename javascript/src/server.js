// FleetLink — Level 2 running project (JavaScript track).
// Grown one module at a time from a tiny skeleton. Source of truth: ../docs/FSD-FleetLink.md.
// Module 2.C (data model): the FSD entities + enums (models/) and the in-memory store + fixed seed
// (data/). The API on top of this data arrives in Module 2.D.
import express from 'express';
import { registerHealthRoutes } from './health.js';
import metaRouter from './routes/meta.js';
import store from './data/store.js';

const app = express();
app.use(express.json());

registerHealthRoutes(app);
app.use('/api/meta', metaRouter);

const PORT = process.env.PORT || 5080;

if (process.env.NODE_ENV !== 'test') {
  store.reset(); // load the fixed FSD §7 seed into the in-memory store
  const c = store.counts();
  app.listen(PORT, () => {
    console.log(`FleetLink API listening on http://localhost:${PORT} — see /health, /api/meta`);
    console.log(
      `FleetLink seeded: ${c.depots} depots, ${c.vehicles} vehicles, ${c.drivers} drivers, ` +
      `${c.parts} parts, ${c.workOrders} work orders.`);
  });
}

export default app;

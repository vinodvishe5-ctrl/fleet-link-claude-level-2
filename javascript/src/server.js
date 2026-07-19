// FleetLink — Level 2 running project (JavaScript track).
// Grown one module at a time from a tiny skeleton. Source of truth: ../docs/FSD-FleetLink.md.
// Module 2.C (data model): the FSD entities + enums (models/) and the in-memory store + fixed seed (data/).
// Module 2.D (API & business logic): the read side and the write side of the API — DTOs (dtos/), the
// business rules (services/), thin routers (routes/), boundary validation (validation/) and ONE error
// shape (middleware/errorHandler.js). Routers are wired below; the error handler is registered LAST.
import express from 'express';
import { fileURLToPath } from 'url';
import { registerHealthRoutes } from './health.js';
import metaRouter from './routes/meta.js';
import depotsRouter from './routes/depots.js';
import vehiclesRouter from './routes/vehicles.js';
import workOrdersRouter from './routes/workOrders.js';
import partsRouter from './routes/parts.js';
import { errorHandler } from './middleware/errorHandler.js';
import store from './data/store.js';

const app = express();
app.use(express.json());

// Module 2.E — serve the front-end (design system + screens) from public/. It is generated FROM the API
// contract below and calls it over the same origin. Static files are matched first; /api/* falls through.
const publicDir = fileURLToPath(new URL('../public', import.meta.url));
app.use(express.static(publicDir));

registerHealthRoutes(app);
app.use('/api/meta', metaRouter);

// Module 2.D — the domain API (read side + write side). Rules live in the services these routers call.
app.use('/api/depots', depotsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/work-orders', workOrdersRouter);
app.use('/api/parts', partsRouter);

// The one error shape for every failure — registered after the routes so it catches what they throw.
app.use(errorHandler);

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

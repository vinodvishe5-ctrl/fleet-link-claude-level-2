// FleetLink — Level 2 running project (JavaScript track).
// Grown one module at a time from a tiny skeleton. Source of truth: ../docs/FSD-FleetLink.md.
// Module 2.B (spec-driven): confirmed plan → layered scaffold + the /api/meta proving slice.
// No domain entities yet — those are designed database-first in Module 2.C.
import express from 'express';
import { registerHealthRoutes } from './health.js';
import metaRouter from './routes/meta.js';

const app = express();
app.use(express.json());

registerHealthRoutes(app);
app.use('/api/meta', metaRouter);

const PORT = process.env.PORT || 5080;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`FleetLink API listening on http://localhost:${PORT} — see /health, /api/meta`);
  });
}

export default app;

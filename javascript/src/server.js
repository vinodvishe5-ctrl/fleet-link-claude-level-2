// FleetLink — Level 2 running project (JavaScript track).
// A deliberately tiny, runnable skeleton. On Day 1 (Module 2.A) you only confirm it runs.
// From Day 2 onward you grow it into the full application described in ../docs/FSD-FleetLink.md.
import express from 'express';
import { registerHealthRoutes } from './health.js';

const app = express();
app.use(express.json());

registerHealthRoutes(app);

const PORT = process.env.PORT || 5080;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`FleetLink API (seed) listening on http://localhost:${PORT} — see /health`);
  });
}

export default app;

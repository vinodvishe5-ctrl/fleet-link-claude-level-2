import { Router } from 'express';
import { getMeta } from '../services/metaService.js';

// The one non-domain vertical slice built in Module 2.B: GET /api/meta, routed through a service.
// It proves the route → service layering so the real domain routers (2.D) follow the same shape.
const router = Router();

router.get('/', (_req, res) => {
  res.json(getMeta());
});

export default router;

// Depot routes (Module 2.D). Thin: call the service, map to a status code. No business rule here.
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Errors } from '../errors.js';
import { listDepots, getDepot, listVehiclesForDepot } from '../services/depotService.js';

const router = Router();

router.get('/', asyncHandler((_req, res) => res.json(listDepots())));

router.get('/:id', asyncHandler((req, res) => {
  const depot = getDepot(req.params.id);
  if (!depot) throw Errors.depotNotFound();
  res.json(depot);
}));

router.get('/:id/vehicles', asyncHandler((req, res) => res.json(listVehiclesForDepot(req.params.id))));

export default router;

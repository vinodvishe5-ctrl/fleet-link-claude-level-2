// Vehicle routes (Module 2.D). Reads, plus the two write endpoints that land on a vehicle: create a
// work order (FSD §6) and update the odometer. Thin: validate the body, call the service, map the
// result to the FSD status code — the rules themselves live in the services.
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Errors } from '../errors.js';
import { listVehicles, getVehicle, listWorkOrdersForVehicle, updateOdometer } from '../services/vehicleService.js';
import { createWorkOrder } from '../services/workOrderService.js';
import { validateCreateWorkOrder, validateUpdateOdometer } from '../validation/validators.js';

const router = Router();

router.get('/', asyncHandler((_req, res) => res.json(listVehicles())));

router.get('/:id', asyncHandler((req, res) => {
  const vehicle = getVehicle(req.params.id);
  if (!vehicle) throw Errors.vehicleNotFound();
  res.json(vehicle);
}));

router.get('/:id/work-orders', asyncHandler((req, res) => res.json(listWorkOrdersForVehicle(req.params.id))));

// POST /api/vehicles/{vehicleId}/work-orders → 201 / 400 / 404 / 409
router.post('/:vehicleId/work-orders', asyncHandler((req, res) => {
  validateCreateWorkOrder(req.body);
  const created = createWorkOrder(req.params.vehicleId, req.body);
  res.status(201).json(created);
}));

// PATCH /api/vehicles/{id}/odometer → 200 / 400
router.patch('/:id/odometer', asyncHandler((req, res) => {
  validateUpdateOdometer(req.body);
  res.json(updateOdometer(req.params.id, req.body.odometerKm));
}));

export default router;

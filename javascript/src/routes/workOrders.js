// Work-order routes (Module 2.D). Read one, list its parts, transition its status, and record parts used.
// Thin wiring: validate the body, call the service, map to the FSD status code. Every rule is in
// workOrderService.
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Errors } from '../errors.js';
import { getWorkOrder, changeStatus, addParts, listWorkOrderParts } from '../services/workOrderService.js';
import { validateChangeStatus, validateAddParts } from '../validation/validators.js';

const router = Router();

router.get('/:id', asyncHandler((req, res) => {
  const workOrder = getWorkOrder(req.params.id);
  if (!workOrder) throw Errors.workOrderNotFound();
  res.json(workOrder);
}));

// GET /api/work-orders/{id}/parts → 200 (the parts recorded on the order) / 404 (Module 2.G hand-off)
router.get('/:id/parts', asyncHandler((req, res) => {
  res.json(listWorkOrderParts(req.params.id));
}));

// PATCH /api/work-orders/{id}/status → 200 / 409
router.patch('/:id/status', asyncHandler((req, res) => {
  validateChangeStatus(req.body);
  res.json(changeStatus(req.params.id, req.body.status));
}));

// POST /api/work-orders/{id}/parts → 200 / 409 (stock)
router.post('/:id/parts', asyncHandler((req, res) => {
  validateAddParts(req.body);
  res.json(addParts(req.params.id, req.body.parts));
}));

export default router;

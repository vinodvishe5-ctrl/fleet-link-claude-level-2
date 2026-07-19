// Part routes (Module 2.D). Read-only; stock changes only through the work-order parts endpoint (rule 8).
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { listParts } from '../services/partService.js';

const router = Router();

router.get('/', asyncHandler((_req, res) => res.json(listParts())));

export default router;

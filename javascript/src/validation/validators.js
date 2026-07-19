// Boundary validation (Module 2.D, Part C). These run at the route edge and DELIBERATELY MIRROR the
// service rules: coherent dates (rule 4), no back-dating (rule 5), the Critical two-day SLA (rule 6),
// non-negative amounts and quantities. The backend service remains authoritative — every rule checked
// here is also enforced there — so a rule is never enforced in one place and forgotten in the other.
import { Errors } from '../errors.js';
import { isIsoDate, todayIso, diffDays } from '../dates.js';
import { WorkOrderType, WorkOrderPriority, WorkOrderStatus } from '../models/enums.js';

const req = (cond, message) => { if (!cond) throw Errors.validation(message); };

export function validateCreateWorkOrder(body, clock) {
  req(body && typeof body === 'object', 'Request body is required.');
  req(typeof body.title === 'string' && body.title.trim() !== '', 'title is required.');
  req(typeof body.description === 'string', 'description is required.');
  req(WorkOrderType.includes(body.type), `type must be one of ${WorkOrderType.join(', ')}.`);
  req(WorkOrderPriority.includes(body.priority), `priority must be one of ${WorkOrderPriority.join(', ')}.`);
  req(isIsoDate(body.openedDate), 'openedDate must be an ISO date (YYYY-MM-DD).');
  req(isIsoDate(body.dueDate), 'dueDate must be an ISO date (YYYY-MM-DD).');
  req(typeof body.labourCost === 'number' && body.labourCost >= 0, 'labourCost must be a number >= 0.');
  // The same date rules the service enforces (rules 4–6), mirrored at the boundary.
  if (body.dueDate < body.openedDate) throw Errors.incoherentDates();                          // rule 4
  if (body.openedDate < todayIso(clock)) throw Errors.backDated();                             // rule 5
  if (body.priority === 'Critical' && diffDays(body.openedDate, body.dueDate) > 2) throw Errors.criticalSla(); // rule 6
}

export function validateChangeStatus(body) {
  req(body && typeof body === 'object', 'Request body is required.');
  req(WorkOrderStatus.includes(body.status), `status must be one of ${WorkOrderStatus.join(', ')}.`);
}

export function validateAddParts(body) {
  req(body && Array.isArray(body.parts) && body.parts.length > 0, 'parts must be a non-empty array.');
  for (const line of body.parts) {
    req(line && typeof line.partId === 'string', 'each part line needs a partId.');
    req(Number.isInteger(line.quantity) && line.quantity >= 1, 'each part line needs an integer quantity >= 1.'); // rule 8 (boundary)
  }
}

export function validateUpdateOdometer(body) {
  req(body && typeof body === 'object', 'Request body is required.');
  req(Number.isInteger(body.odometerKm) && body.odometerKm >= 0, 'odometerKm must be an integer >= 0.');
}

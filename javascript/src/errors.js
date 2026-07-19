// One error type for the whole API (Module 2.D). Services THROW a DomainError carrying the exact FSD
// status code and a stable machine-readable `code`; the error middleware (middleware/errorHandler.js)
// turns any DomainError into the ONE response shape `{ error, code }`. This is how a rule enforced in a
// service surfaces as the right HTTP status without the route knowing the rule.
export class DomainError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'DomainError';
    this.status = status;
    this.code = code;
  }
}

// Named factories — one per FSD §5 failure — so the service layer and the boundary validators throw the
// SAME code for the SAME rule and can never drift apart.
export const Errors = {
  vehicleNotFound: () => new DomainError(404, 'vehicle_not_found', 'Vehicle not found.'),            // rule 2
  depotNotFound: () => new DomainError(404, 'depot_not_found', 'Depot not found.'),
  workOrderNotFound: () => new DomainError(404, 'work_order_not_found', 'Work order not found.'),
  partNotFound: () => new DomainError(404, 'part_not_found', 'Part not found.'),
  driverNotFound: () => new DomainError(404, 'driver_not_found', 'Assigned driver not found.'),
  vehicleRetired: () => new DomainError(409, 'vehicle_retired', 'Cannot open work on a retired vehicle.'), // rule 3
  incoherentDates: () => new DomainError(400, 'incoherent_dates', 'DueDate must be on or after OpenedDate.'), // rule 4
  backDated: () => new DomainError(400, 'back_dated', 'OpenedDate cannot be before today.'),          // rule 5
  criticalSla: () => new DomainError(400, 'critical_sla', 'Critical work must be due within 2 days of OpenedDate.'), // rule 6
  insufficientStock: () => new DomainError(409, 'insufficient_stock', 'Not enough stock for the requested quantity.'), // rule 8
  completionRequiresAssignee: () => new DomainError(409, 'completion_requires_assignee', 'A non-inspection work order needs an assigned driver to complete.'), // rule 9
  illegalTransition: (from, to) => new DomainError(409, 'illegal_transition', `Illegal status transition ${from} → ${to}.`), // rule 10
  odometerDecrease: () => new DomainError(400, 'odometer_decrease', 'Odometer may only stay the same or increase.'), // rule 12
  validation: (message) => new DomainError(400, 'validation_error', message),
};

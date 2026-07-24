// The ONE error shape for the whole API (Module 2.D, Part C). Every failure — a rule thrown from a
// service, a boundary validation error, or an unexpected fault — leaves through here as the same body:
// `{ error, code }`, with the DomainError's status. There is not a different error shape per endpoint.
import { DomainError } from '../errors.js';

// eslint-disable-next-line no-unused-vars — Express needs the 4-arg signature to recognise this as error middleware.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof DomainError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }
  // Anything not modelled as a domain rule is a 500 — never leaked as a rule failure.
  return res.status(500).json({ error: 'Internal server error.', code: 'internal' });
}

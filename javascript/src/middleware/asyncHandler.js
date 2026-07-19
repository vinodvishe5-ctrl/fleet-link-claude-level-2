// Express 4 does not forward a rejected promise from an async handler to the error middleware, so we
// wrap each async route handler to catch and pass errors to next(). This keeps every route a thin
// parse → call service → send, with all failures routed to the one error handler.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

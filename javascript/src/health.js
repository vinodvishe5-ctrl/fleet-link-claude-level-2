// The only routes that exist in the seed. Health proves the toolchain works on Day 1;
// the real FleetLink routes are generated from the FSD across Modules 2.C–2.D.
export function registerHealthRoutes(app) {
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'FleetLink',
      track: 'JavaScript',
      utc: new Date().toISOString(),
    });
  });

  app.get('/', (_req, res) => {
    res
      .type('text')
      .send('FleetLink API (seed). See /health. Build the running project from docs/FSD-FleetLink.md.');
  });
}

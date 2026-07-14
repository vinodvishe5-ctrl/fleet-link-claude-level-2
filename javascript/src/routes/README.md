# src/routes/

One Express router per resource; routes validate input, call a service, map to a status code.

As of Module 2.B this holds only `meta.js` (non-domain `/api/meta` scaffold slice). The domain routers
(`vehicles`, `workOrders`, …) arrive in **Module 2.D**.

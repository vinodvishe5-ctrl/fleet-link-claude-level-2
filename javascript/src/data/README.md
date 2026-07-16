# data — in-memory store & seed (Module 2.C)

This folder holds the **state** — the actual data — for the running build:

- `store.js` — the in-memory store (module-level arrays of each entity). One source of truth that
  everything reads from; it is the runtime the domain API is built on in Module 2.D.
- `seed.js` — the fixed FSD §7 sample (2 depots, 4 vehicles, 3 drivers, 4 parts, 3 work orders) with
  **fixed uuids** identical to the .NET track, so both tracks share one dataset.

The agreed relational schema lives in [`../../../docs/schema.sql`](../../../docs/schema.sql) — the
"how this maps to SQL Server / Azure SQL" record. Persisting the store to that database is built out with
the API in **Module 2.D**. Shapes (entity factories + enums) live next door in `../models/`; services and
routes on the domain stay empty until 2.D.

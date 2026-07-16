# Data — in-memory store & seed (Module 2.C)

This folder holds the **state** — the actual data — for the running build:

- `FleetStore.cs` — the in-memory store (a singleton holding a list of each entity). One source of truth
  that everything reads from; it is the runtime the domain API is built on in Module 2.D.
- `SeedData.cs` — the fixed FSD §7 sample (2 depots, 4 vehicles, 3 drivers, 4 parts, 3 work orders) with
  **fixed Guids** identical to the JavaScript track, so both tracks share one dataset.

The agreed relational schema lives in [`../../../../docs/schema.sql`](../../../../docs/schema.sql) — the
"how this maps to SQL Server / Azure SQL" record. Persisting the store to that database is built out with
the API in **Module 2.D**. Shapes (entities + enums) live next door in `../Models/`; rules and DTOs stay
empty here until 2.D.

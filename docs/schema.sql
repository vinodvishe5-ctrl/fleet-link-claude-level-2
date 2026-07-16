-- ============================================================================
-- FleetLink — agreed relational schema (Module 2.C)
-- ============================================================================
-- This is the DATABASE DESIGN deliverable of Module 2.C: the schema the architect
-- and BA confirmed from the FSD (docs/FSD-FleetLink.md §3–§4), expressed as SQL.
-- It records how the confirmed model maps to a real relational database. When the
-- app is persisted in Module 2.D, both tracks target the SAME schema — only the
-- language mapping (EF Core on .NET, the JS data layer) differs.
--
-- Dialect shown: portable SQL. In the Capgemini estate the same design maps to
-- SQL Server / Azure SQL — the
-- column types change (uniqueidentifier, decimal(18,2), datetime2) but the tables,
-- keys, uniques, foreign keys and check constraints are identical.
--
-- Naming: tables and columns are snake_case (a common DB convention). The models
-- map them to camelCase (JS) and PascalCase (.NET). The names still trace 1:1 to
-- the FSD — e.g. odometer_km ↔ OdometerKm ↔ odometerKm.
--
-- DELIBERATELY NOT MODELLED (these are the pitfalls Module 2.C teaches):
--   • parts_cost / total_cost are NOT columns — they are DERIVED (FSD §3.5) and are
--     computed in the service layer (2.D). Storing them would duplicate state.
--   • there is NO stock-per-depot table and NO driver→vehicle table — the FSD never
--     states either; they are relationships Claude may *infer* but must not invent.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ---- Depot (FSD §3.1) -------------------------------------------------------
CREATE TABLE IF NOT EXISTS depots (
    id    TEXT PRIMARY KEY,                 -- Guid / uuid (server-generated)
    code  TEXT NOT NULL UNIQUE,             -- e.g. DEP-LDN (unique business key)
    name  TEXT NOT NULL,
    city  TEXT NOT NULL
);

-- ---- Vehicle (FSD §3.2) -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id            TEXT PRIMARY KEY,
    registration  TEXT NOT NULL UNIQUE,     -- fictional plate, e.g. FL-1001
    make          TEXT NOT NULL,
    model         TEXT NOT NULL,
    year          INTEGER NOT NULL,
    depot_id      TEXT NOT NULL,            -- a vehicle belongs to exactly ONE depot
    odometer_km   INTEGER NOT NULL CHECK (odometer_km >= 0),
    status        TEXT NOT NULL CHECK (status IN ('Active','InMaintenance','Retired')),
    FOREIGN KEY (depot_id) REFERENCES depots(id)
);

-- ---- Driver (FSD §3.3) ------------------------------------------------------
CREATE TABLE IF NOT EXISTS drivers (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    licence_number  TEXT NOT NULL UNIQUE,
    depot_id        TEXT NOT NULL,
    status          TEXT NOT NULL CHECK (status IN ('Active','Inactive')),
    FOREIGN KEY (depot_id) REFERENCES depots(id)
);

-- ---- Part (FSD §3.4) --------------------------------------------------------
CREATE TABLE IF NOT EXISTS parts (
    id                 TEXT PRIMARY KEY,
    part_number        TEXT NOT NULL UNIQUE,
    name               TEXT NOT NULL,
    unit_cost          NUMERIC NOT NULL CHECK (unit_cost >= 0),        -- decimal(18,2) in SQL Server
    quantity_in_stock  INTEGER NOT NULL CHECK (quantity_in_stock >= 0)
);

-- ---- WorkOrder (FSD §3.5) — the central record ------------------------------
CREATE TABLE IF NOT EXISTS work_orders (
    id                  TEXT PRIMARY KEY,
    vehicle_id          TEXT NOT NULL,
    title               TEXT NOT NULL,
    description         TEXT NOT NULL,
    type                TEXT NOT NULL CHECK (type IN ('Scheduled','Inspection','Breakdown')),
    priority            TEXT NOT NULL CHECK (priority IN ('Low','Medium','High','Critical')),
    status              TEXT NOT NULL CHECK (status IN ('Open','InProgress','OnHold','Completed','Cancelled')),
    opened_date         TEXT NOT NULL,       -- ISO date (server "today" on create)
    due_date            TEXT NOT NULL,
    completed_date      TEXT,                -- nullable — set only when Completed
    assigned_driver_id  TEXT,                -- nullable — optional assignment
    labour_cost         NUMERIC NOT NULL CHECK (labour_cost >= 0),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (assigned_driver_id) REFERENCES drivers(id)
    -- parts_cost / total_cost are DERIVED (FSD §3.5) — never stored here.
);

-- ---- WorkOrderPart (FSD §3.6) — line item, composite key --------------------
CREATE TABLE IF NOT EXISTS work_order_parts (
    work_order_id  TEXT NOT NULL,
    part_id        TEXT NOT NULL,
    quantity       INTEGER NOT NULL CHECK (quantity >= 1),
    PRIMARY KEY (work_order_id, part_id),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    FOREIGN KEY (part_id) REFERENCES parts(id)
);

-- Helpful read indexes for the FK lookups the API will do in 2.D.
CREATE INDEX IF NOT EXISTS ix_vehicles_depot        ON vehicles(depot_id);
CREATE INDEX IF NOT EXISTS ix_drivers_depot         ON drivers(depot_id);
CREATE INDEX IF NOT EXISTS ix_work_orders_vehicle   ON work_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS ix_work_orders_driver    ON work_orders(assigned_driver_id);
CREATE INDEX IF NOT EXISTS ix_work_order_parts_part ON work_order_parts(part_id);

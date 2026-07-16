-- FleetLink physical schema (Module 2.C)
-- Target: SQL Server (T-SQL) — the engine named in dotnet/CLAUDE.md for the EF Core model.
-- Source of truth: docs/FSD-FleetLink.md Sections 3-4 (see docs/data-model.md for every design
-- decision this file encodes and what was rejected instead — read that alongside this file).
--
-- Sandbox / training schema only. No real data. All FK basis and rule numbers below reference
-- docs/FSD-FleetLink.md by line number.

-- ============================================================================
-- Depot (FSD:42-48)
-- ============================================================================
CREATE TABLE Depot (
    Id      UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Code    NVARCHAR(20)     NOT NULL,
    Name    NVARCHAR(100)    NOT NULL,
    City    NVARCHAR(100)    NOT NULL,
    CONSTRAINT UQ_Depot_Code UNIQUE (Code)
);

-- ============================================================================
-- Vehicle (FSD:49-57)
-- ============================================================================
CREATE TABLE Vehicle (
    Id           UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Registration NVARCHAR(20)     NOT NULL,
    Make         NVARCHAR(100)    NOT NULL,
    Model        NVARCHAR(100)    NOT NULL,
    Year         INT              NOT NULL,
    DepotId      UNIQUEIDENTIFIER NOT NULL,
    OdometerKm   INT              NOT NULL,
    Status       NVARCHAR(20)     NOT NULL,
    CONSTRAINT UQ_Vehicle_Registration UNIQUE (Registration),
    CONSTRAINT FK_Vehicle_Depot FOREIGN KEY (DepotId)
        REFERENCES Depot (Id) ON DELETE NO ACTION,                       -- data-model.md §2.5
    CONSTRAINT CK_Vehicle_OdometerKm CHECK (OdometerKm >= 0),             -- FSD:55
    CONSTRAINT CK_Vehicle_Status CHECK (Status IN ('Active', 'InMaintenance', 'Retired'))  -- FSD:56
);

CREATE INDEX IX_Vehicle_DepotId ON Vehicle (DepotId);                    -- data-model.md §2.9, FSD:129

-- ============================================================================
-- Driver (FSD:58-64)
-- ============================================================================
CREATE TABLE Driver (
    Id             UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Name           NVARCHAR(200)    NOT NULL,
    LicenceNumber  NVARCHAR(30)     NOT NULL,
    DepotId        UNIQUEIDENTIFIER NOT NULL,
    Status         NVARCHAR(20)     NOT NULL,
    CONSTRAINT UQ_Driver_LicenceNumber UNIQUE (LicenceNumber),
    CONSTRAINT FK_Driver_Depot FOREIGN KEY (DepotId)
        REFERENCES Depot (Id) ON DELETE NO ACTION,                       -- data-model.md §2.5
    CONSTRAINT CK_Driver_Status CHECK (Status IN ('Active', 'Inactive'))  -- FSD:64
);

-- ============================================================================
-- Part (FSD:66-72)
-- ============================================================================
CREATE TABLE Part (
    Id               UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    PartNumber       NVARCHAR(30)     NOT NULL,
    Name             NVARCHAR(200)    NOT NULL,
    UnitCost         DECIMAL(18, 2)   NOT NULL,
    QuantityInStock  INT              NOT NULL,
    CONSTRAINT UQ_Part_PartNumber UNIQUE (PartNumber),
    CONSTRAINT CK_Part_UnitCost CHECK (UnitCost >= 0),                   -- FSD:71
    CONSTRAINT CK_Part_QuantityInStock CHECK (QuantityInStock >= 0)      -- FSD:72, Rule 8 (FSD:113-114)
);

-- ============================================================================
-- WorkOrder (FSD:74-85)
-- PartsCostAtCompletion / TotalCostAtCompletion are a design decision, not FSD columns
-- — see data-model.md §2.3. NULL until the service stamps them on transition to Completed.
-- ============================================================================
CREATE TABLE WorkOrder (
    Id                     UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    VehicleId              UNIQUEIDENTIFIER NOT NULL,
    Title                  NVARCHAR(200)    NOT NULL,
    Description            NVARCHAR(2000)   NOT NULL,
    Type                   NVARCHAR(20)     NOT NULL,
    Priority               NVARCHAR(20)     NOT NULL,
    Status                 NVARCHAR(20)     NOT NULL,
    OpenedDate             DATE             NOT NULL,
    DueDate                DATE             NOT NULL,
    CompletedDate          DATE             NULL,
    AssignedDriverId       UNIQUEIDENTIFIER NULL,
    LabourCost             DECIMAL(18, 2)   NOT NULL,
    PartsCostAtCompletion  DECIMAL(18, 2)   NULL,
    TotalCostAtCompletion  DECIMAL(18, 2)   NULL,

    CONSTRAINT FK_WorkOrder_Vehicle FOREIGN KEY (VehicleId)
        REFERENCES Vehicle (Id) ON DELETE NO ACTION,                     -- data-model.md §2.5, Rule 1 (FSD:105)
    CONSTRAINT FK_WorkOrder_Driver FOREIGN KEY (AssignedDriverId)
        REFERENCES Driver (Id) ON DELETE NO ACTION,                      -- data-model.md §2.5

    CONSTRAINT CK_WorkOrder_Type
        CHECK (Type IN ('Scheduled', 'Inspection', 'Breakdown')),        -- FSD:79
    CONSTRAINT CK_WorkOrder_Priority
        CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical')),       -- FSD:80
    CONSTRAINT CK_WorkOrder_Status
        CHECK (Status IN ('Open', 'InProgress', 'OnHold', 'Completed', 'Cancelled')),  -- FSD:81
    CONSTRAINT CK_WorkOrder_LabourCost CHECK (LabourCost >= 0),           -- FSD:84

    -- Rule 4, coherent dates (FSD:108)
    CONSTRAINT CK_WorkOrder_DueDate_NotBeforeOpened CHECK (DueDate >= OpenedDate),

    -- Rule 6, Critical SLA, calendar days per FSD-clarifications.md #2 (FSD:110)
    CONSTRAINT CK_WorkOrder_CriticalSla
        CHECK (Priority <> 'Critical' OR DueDate <= DATEADD(day, 2, OpenedDate)),

    -- Rule 9, completion needs an assignee unless Inspection; Cancelled exempt per
    -- FSD-clarifications.md #3 (FSD:115-116) — a backstop, not the primary enforcement point
    -- (the service still returns 409 before attempting the write; see data-model.md §2.2)
    CONSTRAINT CK_WorkOrder_CompletionAssignee
        CHECK (Status <> 'Completed' OR Type = 'Inspection' OR AssignedDriverId IS NOT NULL)
);

CREATE INDEX IX_WorkOrder_VehicleId ON WorkOrder (VehicleId);            -- data-model.md §2.9, FSD:130

-- ============================================================================
-- WorkOrderPart (FSD:87-91)
-- Surrogate Id is a design decision, not an FSD column — see data-model.md §2.1.
-- ============================================================================
CREATE TABLE WorkOrderPart (
    Id          UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    WorkOrderId UNIQUEIDENTIFIER NOT NULL,
    PartId      UNIQUEIDENTIFIER NOT NULL,
    Quantity    INT              NOT NULL,

    CONSTRAINT FK_WorkOrderPart_WorkOrder FOREIGN KEY (WorkOrderId)
        REFERENCES WorkOrder (Id) ON DELETE NO ACTION,                   -- data-model.md §2.5
    CONSTRAINT FK_WorkOrderPart_Part FOREIGN KEY (PartId)
        REFERENCES Part (Id) ON DELETE NO ACTION,                        -- data-model.md §2.5

    CONSTRAINT CK_WorkOrderPart_Quantity CHECK (Quantity >= 1)           -- FSD:91
);

-- ============================================================================
-- NOT implemented here — deliberately left to the service layer.
-- See docs/data-model.md §2.2 for why each can't be a DB constraint or trigger:
--   Rule 3  — no work on a retired vehicle (cross-table read at insert time)
--   Rule 5  — no back-dating vs. server "today" (non-deterministic, disallowed in CHECK)
--   Rule 7  — breakdown auto-status (derived state across WorkOrder -> Vehicle)
--   Rule 10 — status state machine (needs the row's *previous* Status)
--   Rule 12 — monotonic odometer (needs the row's *previous* OdometerKm)
--   Rule 8's stock decrement (an action, not an invariant — the >= 0 bound above is the
--             only part of Rule 8 that is a constraint)
-- ============================================================================

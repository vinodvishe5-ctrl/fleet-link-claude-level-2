# Models — FleetLink domain entities (Module 2.C)

One class per FSD §3 entity, names matching the FSD exactly: `Depot`, `Vehicle`, `Driver`, `Part`,
`WorkOrder`, `WorkOrderPart`, plus the enums in `Enums.cs`. Shape only — the business rules that use
them live in the service layer (Module 2.D). `PartsCost`/`TotalCost` are derived (FSD §3.5), not stored.

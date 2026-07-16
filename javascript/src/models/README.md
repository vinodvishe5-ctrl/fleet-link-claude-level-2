# models — FleetLink domain shapes (Module 2.C)

A factory per FSD §3 entity, names matching the FSD exactly: `depot`, `vehicle`, `driver`, `part`,
`workOrder`, `workOrderPart`, plus the allowed enum values in `enums.js`. Shape only — the business
rules that use them live in the service layer (Module 2.D). `partsCost`/`totalCost` are derived
(FSD §3.5), not stored.

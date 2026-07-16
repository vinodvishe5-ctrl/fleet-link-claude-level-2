// FleetLink domain enums (Module 2.C). Values match the FSD §3 exactly and are stored/exposed as
// strings (root CLAUDE.md: "enums are stored and exposed as strings", never magic integers).
export const VehicleStatus = Object.freeze(['Active', 'InMaintenance', 'Retired']);
export const DriverStatus = Object.freeze(['Active', 'Inactive']);
export const WorkOrderType = Object.freeze(['Scheduled', 'Inspection', 'Breakdown']);
export const WorkOrderPriority = Object.freeze(['Low', 'Medium', 'High', 'Critical']);
export const WorkOrderStatus = Object.freeze(['Open', 'InProgress', 'OnHold', 'Completed', 'Cancelled']);

// Convenience set-membership check used by the model factories (boundary shape only — the business
// rules that USE these enums, e.g. the status state machine in FSD §5.10, arrive in Module 2.D).
export const isMember = (allowed, value) => allowed.includes(value);

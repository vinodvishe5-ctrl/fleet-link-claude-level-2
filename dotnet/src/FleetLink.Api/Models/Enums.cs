namespace FleetLink.Api.Models;

// FleetLink domain enums — FSD §3. Stored and exposed as STRINGS (root CLAUDE.md), never magic
// integers; the string mapping is applied when the model is persisted (Module 2.D).
public enum VehicleStatus { Active, InMaintenance, Retired }
public enum DriverStatus { Active, Inactive }
public enum WorkOrderType { Scheduled, Inspection, Breakdown }
public enum WorkOrderPriority { Low, Medium, High, Critical }
public enum WorkOrderStatus { Open, InProgress, OnHold, Completed, Cancelled }

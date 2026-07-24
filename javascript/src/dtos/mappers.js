// The CONTRACT (Module 2.D, Part A). The API exposes DTOs, never the stored entities — this is the one
// place a stored shape becomes a response shape. Mapping only: no business rule lives here. The derived
// costs on a WorkOrderDto are COMPUTED in the service (Part B) and passed in, so the mapper stays a pure
// projection. Kept together in one file so every response shape is defined in a single, reviewable place
// (the JS equivalent of a single AutoMapper profile).

export const toDepotDto = (d) => ({
  id: d.id, code: d.code, name: d.name, city: d.city,
});

export const toVehicleDto = (v) => ({
  id: v.id, registration: v.registration, make: v.make, model: v.model, year: v.year,
  depotId: v.depotId, odometerKm: v.odometerKm, status: v.status,
});

export const toDriverDto = (d) => ({
  id: d.id, name: d.name, licenceNumber: d.licenceNumber, depotId: d.depotId, status: d.status,
});

export const toPartDto = (p) => ({
  id: p.id, partNumber: p.partNumber, name: p.name, unitCost: p.unitCost, quantityInStock: p.quantityInStock,
});

// WorkOrderDto carries the DERIVED PartsCost and TotalCost (FSD §3.5). `partsCost` is computed by the
// service from the line items; TotalCost = LabourCost + PartsCost, unless the order was completed, in
// which case the frozen total taken at completion (FSD rule 11) is returned instead.
export const toWorkOrderDto = (w, partsCost) => {
  const totalCost = w.completedTotalCost != null ? w.completedTotalCost : w.labourCost + partsCost;
  return {
    id: w.id, vehicleId: w.vehicleId, title: w.title, description: w.description,
    type: w.type, priority: w.priority, status: w.status,
    openedDate: w.openedDate, dueDate: w.dueDate, completedDate: w.completedDate,
    assignedDriverId: w.assignedDriverId, labourCost: w.labourCost,
    partsCost, totalCost,
  };
};

// A work order's part lines, joined to their Part (Module 2.G hand-off endpoint). Read-only projection —
// no rule here; the line cost is quantity x the part's current unit cost, derived on the fly like the
// other costs (FSD §3.5), never stored.
export const toWorkOrderPartLineDto = (wp, part) => ({
  partId: wp.partId,
  partNumber: part ? part.partNumber : null,
  name: part ? part.name : null,
  quantity: wp.quantity,
  unitCost: part ? part.unitCost : 0,
  lineCost: wp.quantity * (part ? part.unitCost : 0),
});

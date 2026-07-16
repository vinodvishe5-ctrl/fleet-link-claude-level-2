// Vehicle — FSD §3.2. An asset in the fleet; belongs to exactly one Depot.
import { VehicleStatus } from './enums.js';
export function makeVehicle({ id, registration, make, model, year, depotId, odometerKm, status }) {
  return { id, registration, make, model, year, depotId, odometerKm, status };
}
export { VehicleStatus };

// Driver — FSD §3.3. A person who operates vehicles and can be assigned to a work order.
import { DriverStatus } from './enums.js';
export function makeDriver({ id, name, licenceNumber, depotId, status }) {
  return { id, name, licenceNumber, depotId, status };
}
export { DriverStatus };

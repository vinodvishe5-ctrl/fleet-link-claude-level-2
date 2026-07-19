/* FleetLink API client (Module 2.E). One method per endpoint in the 2.D contract (FSD §6) — the UI is
   generated FROM this contract, so the front-end and the back-end can never disagree about shapes or
   routes. Every call resolves the response DTO, or rejects with the ONE error shape the API returns:
   { status, error, code }. Uses jQuery $.ajax to match the team's front-end stack. */
window.FleetLinkApi = (function () {
  function request(method, url, body) {
    return $.ajax({
      url,
      method,
      contentType: 'application/json',
      data: body !== undefined ? JSON.stringify(body) : undefined,
      dataType: 'json',
    }).then(
      (data) => data,
      (jqXHR) => {
        const payload = jqXHR.responseJSON || { error: 'Network or server error.', code: 'network' };
        return $.Deferred().reject({ status: jqXHR.status, error: payload.error, code: payload.code }).promise();
      }
    );
  }

  return {
    // Reads (FSD §6, built first in 2.D)
    listDepots: () => request('GET', '/api/depots'),
    getDepot: (id) => request('GET', `/api/depots/${id}`),
    listVehicles: () => request('GET', '/api/vehicles'),
    getVehicle: (id) => request('GET', `/api/vehicles/${id}`),
    listVehicleWorkOrders: (id) => request('GET', `/api/vehicles/${id}/work-orders`),
    getWorkOrder: (id) => request('GET', `/api/work-orders/${id}`),
    listParts: () => request('GET', '/api/parts'),
    // Writes (FSD §6, enforce the §5 rules on the server)
    createWorkOrder: (vehicleId, body) => request('POST', `/api/vehicles/${vehicleId}/work-orders`, body),
    changeStatus: (id, status) => request('PATCH', `/api/work-orders/${id}/status`, { status }),
    addParts: (id, parts) => request('POST', `/api/work-orders/${id}/parts`, { parts }),
    updateOdometer: (id, odometerKm) => request('PATCH', `/api/vehicles/${id}/odometer`, { odometerKm }),
  };
})();

/* FleetLink UI (Module 2.E). Built ONLY from the design-system tokens/components and the API contract
   (js/api.js). A tiny hash-router renders four screens — vehicles, vehicle detail, new work order, work
   order detail — each wired to the 2.D API. Client-side validation here DELIBERATELY MIRRORS the server
   rules (FSD §5): same date rules, same state machine, same stock check — the 2.D discipline ("a rule
   enforced in one place is half-enforced") carried onto the client. The server stays authoritative; the
   client checks are only to fail fast with a friendly message. */
(function () {
  const $app = () => $('#app');

  // ---- small helpers (presentation only) ----
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '£' + Number(n).toFixed(2);
  const badge = (status) => `<span class="fl-badge" data-status="${esc(status)}">${esc(status)}</span>`;
  const prio = (p) => `<span class="fl-badge" data-priority="${esc(p)}">${esc(p)}</span>`;
  const todayIso = () => new Date().toISOString().slice(0, 10);
  const diffDays = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

  // The status state machine — a mirror of FSD rule 10, used to show only the allowed action buttons.
  const TRANSITIONS = {
    Open: ['InProgress', 'OnHold', 'Cancelled'],
    InProgress: ['OnHold', 'Completed', 'Cancelled'],
    OnHold: ['InProgress', 'Cancelled'],
    Completed: [], Cancelled: [],
  };

  // Friendly copy for each server error code (the one { error, code } shape from 2.D).
  const MESSAGES = {
    vehicle_retired: 'That vehicle is retired — no new work can be opened on it.',
    incoherent_dates: 'Due date must be on or after the opened date.',
    back_dated: 'Opened date can’t be in the past.',
    critical_sla: 'Critical work must be due within 2 days of the opened date.',
    insufficient_stock: 'Not enough stock for that quantity.',
    completion_requires_assignee: 'A non-inspection work order needs an assigned driver before it can be completed.',
    illegal_transition: 'That status change isn’t allowed from the current status.',
    odometer_decrease: 'Odometer can only stay the same or increase.',
    validation_error: 'Please check the form and try again.',
    vehicle_not_found: 'Vehicle not found.', work_order_not_found: 'Work order not found.', part_not_found: 'Part not found.',
  };
  const msg = (err) => MESSAGES[err && err.code] || (err && err.error) || 'Something went wrong.';
  const showError = (err) => $app().prepend(`<div class="fl-alert fl-alert--error">${esc(msg(err))}</div>`);

  // ---- screens ----
  function renderVehicles() {
    FleetLinkApi.listVehicles().then((vehicles) => {
      const rows = vehicles.map((v) => `
        <tr data-id="${v.id}">
          <td><strong>${esc(v.registration)}</strong></td>
          <td>${esc(v.make)} ${esc(v.model)} <span class="fl-muted">(${v.year})</span></td>
          <td class="num">${v.odometerKm.toLocaleString()} km</td>
          <td>${badge(v.status)}</td>
        </tr>`).join('');
      $app().html(`
        <h1 class="fl-page-title">Vehicles</h1>
        <p class="fl-page-sub">${vehicles.length} vehicles in the fleet</p>
        <div class="fl-card" style="padding:0">
          <table class="fl-table">
            <thead><tr><th>Registration</th><th>Make / model</th><th class="num">Odometer</th><th>Status</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`);
      $app().find('tbody tr').on('click', function () { location.hash = `#/vehicles/${$(this).data('id')}`; });
    }, showError);
  }

  function renderVehicle(id) {
    $.when(FleetLinkApi.getVehicle(id), FleetLinkApi.listVehicleWorkOrders(id)).then((v, workOrders) => {
      const woRows = workOrders.length ? workOrders.map((w) => `
        <tr data-id="${w.id}">
          <td><strong>${esc(w.title)}</strong></td>
          <td>${esc(w.type)}</td>
          <td>${prio(w.priority)}</td>
          <td>${badge(w.status)}</td>
          <td class="num">${money(w.totalCost)}</td>
        </tr>`).join('') : `<tr><td colspan="5" class="fl-empty">No work orders yet.</td></tr>`;
      $app().html(`
        <div class="fl-crumbs"><a href="#/vehicles">Vehicles</a> / ${esc(v.registration)}</div>
        <h1 class="fl-page-title">${esc(v.registration)} — ${esc(v.make)} ${esc(v.model)}</h1>
        <p class="fl-page-sub">${badge(v.status)}</p>
        <div class="fl-card">
          <div class="fl-grid">
            <div class="fl-kv"><div class="k">Year</div><div class="v">${v.year}</div></div>
            <div class="fl-kv"><div class="k">Odometer</div><div class="v">${v.odometerKm.toLocaleString()} km</div></div>
            <div class="fl-kv"><div class="k">Status</div><div class="v">${esc(v.status)}</div></div>
          </div>
        </div>
        <div class="fl-card">
          <h2>Update odometer</h2>
          <div class="fl-row2">
            <div class="fl-field">
              <label for="odo">New odometer (km)</label>
              <input id="odo" class="fl-input" type="number" min="${v.odometerKm}" value="${v.odometerKm}">
              <div class="fl-error" id="odo-err"></div>
            </div>
            <div style="align-self:end"><button id="odo-save" class="fl-btn fl-btn--primary">Save odometer</button></div>
          </div>
        </div>
        <div class="fl-card" style="padding:0">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-5)">
            <h2 style="margin:0">Work orders</h2>
            <a class="fl-btn fl-btn--primary" href="#/vehicles/${v.id}/new">+ New work order</a>
          </div>
          <table class="fl-table">
            <thead><tr><th>Title</th><th>Type</th><th>Priority</th><th>Status</th><th class="num">Total</th></tr></thead>
            <tbody>${woRows}</tbody>
          </table>
        </div>`);
      $app().find('tbody tr[data-id]').on('click', function () { location.hash = `#/work-orders/${$(this).data('id')}`; });

      // Odometer update — client mirror of rule 12 (may not decrease), then the authoritative server call.
      $('#odo-save').on('click', function () {
        const km = parseInt($('#odo').val(), 10);
        $('#odo-err').text('');
        if (!Number.isInteger(km) || km < v.odometerKm) { $('#odo-err').text('Odometer can only stay the same or increase.'); return; }
        FleetLinkApi.updateOdometer(v.id, km).then(() => renderVehicle(id), (err) => $('#odo-err').text(msg(err)));
      });
    }, showError);
  }

  function renderNewWorkOrder(vehicleId) {
    FleetLinkApi.getVehicle(vehicleId).then((v) => {
      $app().html(`
        <div class="fl-crumbs"><a href="#/vehicles">Vehicles</a> / <a href="#/vehicles/${v.id}">${esc(v.registration)}</a> / New work order</div>
        <h1 class="fl-page-title">New work order</h1>
        <p class="fl-page-sub">On ${esc(v.registration)} — ${esc(v.make)} ${esc(v.model)}</p>
        <div class="fl-card">
          <div id="form-alert"></div>
          <div class="fl-field"><label for="f-title">Title</label><input id="f-title" class="fl-input"><div class="fl-error" id="e-title"></div></div>
          <div class="fl-field"><label for="f-desc">Description</label><input id="f-desc" class="fl-input"></div>
          <div class="fl-row2">
            <div class="fl-field"><label for="f-type">Type</label>
              <select id="f-type" class="fl-select"><option>Scheduled</option><option>Inspection</option><option>Breakdown</option></select></div>
            <div class="fl-field"><label for="f-priority">Priority</label>
              <select id="f-priority" class="fl-select"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
          </div>
          <div class="fl-row2">
            <div class="fl-field"><label for="f-opened">Opened date</label><input id="f-opened" class="fl-input" type="date" value="${todayIso()}"><div class="fl-error" id="e-opened"></div></div>
            <div class="fl-field"><label for="f-due">Due date</label><input id="f-due" class="fl-input" type="date" value="${todayIso()}"><div class="fl-error" id="e-due"></div></div>
          </div>
          <div class="fl-field" style="max-width:220px"><label for="f-labour">Labour cost (£)</label><input id="f-labour" class="fl-input" type="number" min="0" step="0.01" value="0"><div class="fl-error" id="e-labour"></div></div>
          <div class="fl-actions">
            <button id="f-submit" class="fl-btn fl-btn--primary">Create work order</button>
            <a class="fl-btn" href="#/vehicles/${v.id}">Cancel</a>
          </div>
        </div>`);

      $('#f-submit').on('click', function () {
        $('.fl-error').text(''); $('#form-alert').empty();
        const body = {
          title: $('#f-title').val().trim(), description: $('#f-desc').val().trim(),
          type: $('#f-type').val(), priority: $('#f-priority').val(),
          openedDate: $('#f-opened').val(), dueDate: $('#f-due').val(),
          assignedDriverId: null, labourCost: parseFloat($('#f-labour').val()),
        };
        // Client-side validation — a mirror of FSD rules 4, 5, 6 (the server enforces them too).
        let ok = true;
        if (!body.title) { $('#e-title').text('Title is required.'); ok = false; }
        if (!body.openedDate) { $('#e-opened').text('Opened date is required.'); ok = false; }
        if (!body.dueDate) { $('#e-due').text('Due date is required.'); ok = false; }
        if (body.openedDate && body.dueDate && body.dueDate < body.openedDate) { $('#e-due').text('Due date must be on or after the opened date.'); ok = false; }   // rule 4
        if (body.openedDate && body.openedDate < todayIso()) { $('#e-opened').text('Opened date can’t be in the past.'); ok = false; }                             // rule 5
        if (body.priority === 'Critical' && body.openedDate && body.dueDate && diffDays(body.openedDate, body.dueDate) > 2) { $('#e-due').text('Critical work must be due within 2 days.'); ok = false; } // rule 6
        if (!(body.labourCost >= 0)) { $('#e-labour').text('Labour cost must be 0 or more.'); ok = false; }
        if (!ok) return;

        FleetLinkApi.createWorkOrder(v.id, body).then(
          (created) => { location.hash = `#/work-orders/${created.id}`; },
          (err) => $('#form-alert').html(`<div class="fl-alert fl-alert--error">${esc(msg(err))}</div>`));
      });
    }, showError);
  }

  function renderWorkOrder(id) {
    $.when(FleetLinkApi.getWorkOrder(id), FleetLinkApi.listParts()).then((w, parts) => {
      const actions = (TRANSITIONS[w.status] || []).map((s) =>
        `<button class="fl-btn" data-to="${s}">${s === 'Completed' ? 'Complete' : s === 'Cancelled' ? 'Cancel' : 'Move to ' + s}</button>`).join('');
      const partOptions = parts.map((p) => `<option value="${p.id}">${esc(p.partNumber)} — ${esc(p.name)} (${p.quantityInStock} in stock)</option>`).join('');
      $app().html(`
        <div class="fl-crumbs"><a href="#/vehicles">Vehicles</a> / <a href="#/vehicles/${w.vehicleId}">Vehicle</a> / Work order</div>
        <h1 class="fl-page-title">${esc(w.title)}</h1>
        <p class="fl-page-sub">${badge(w.status)} &nbsp; ${prio(w.priority)} &nbsp; <span class="fl-muted">${esc(w.type)}</span></p>
        <div class="fl-card">
          <p>${esc(w.description) || '<span class="fl-muted">No description.</span>'}</p>
          <div class="fl-grid">
            <div class="fl-kv"><div class="k">Opened</div><div class="v">${esc(w.openedDate)}</div></div>
            <div class="fl-kv"><div class="k">Due</div><div class="v">${esc(w.dueDate)}</div></div>
            <div class="fl-kv"><div class="k">Completed</div><div class="v">${w.completedDate ? esc(w.completedDate) : '—'}</div></div>
            <div class="fl-kv"><div class="k">Labour</div><div class="v">${money(w.labourCost)}</div></div>
            <div class="fl-kv"><div class="k">Parts</div><div class="v">${money(w.partsCost)}</div></div>
            <div class="fl-kv"><div class="k">Total</div><div class="v">${money(w.totalCost)}</div></div>
          </div>
        </div>
        <div class="fl-card">
          <h2>Change status</h2>
          <div id="status-alert"></div>
          <div class="fl-actions">${actions || '<span class="fl-muted">This work order is ' + esc(w.status) + ' — no further changes.</span>'}</div>
        </div>
        <div class="fl-card">
          <h2>Add parts used</h2>
          <div id="parts-alert"></div>
          <div class="fl-row2">
            <div class="fl-field"><label for="p-part">Part</label><select id="p-part" class="fl-select">${partOptions}</select></div>
            <div class="fl-field"><label for="p-qty">Quantity</label><input id="p-qty" class="fl-input" type="number" min="1" value="1"><div class="fl-error" id="e-qty"></div></div>
          </div>
          <button id="p-add" class="fl-btn fl-btn--primary">Add parts</button>
        </div>`);

      // Status change — buttons come from the client mirror of the state machine; the server re-checks rules 9/10/11.
      $app().find('button[data-to]').on('click', function () {
        FleetLinkApi.changeStatus(w.id, $(this).data('to')).then(
          () => renderWorkOrder(id),
          (err) => $('#status-alert').html(`<div class="fl-alert fl-alert--error">${esc(msg(err))}</div>`));
      });

      // Add parts — client mirror of rule 8 (quantity >= 1, not over stock), then the authoritative call.
      $('#p-add').on('click', function () {
        $('#e-qty').text(''); $('#parts-alert').empty();
        const partId = $('#p-part').val(); const quantity = parseInt($('#p-qty').val(), 10);
        const part = parts.find((p) => p.id === partId);
        if (!Number.isInteger(quantity) || quantity < 1) { $('#e-qty').text('Quantity must be 1 or more.'); return; }
        if (part && quantity > part.quantityInStock) { $('#e-qty').text('Not enough stock (' + part.quantityInStock + ' available).'); return; }
        FleetLinkApi.addParts(w.id, [{ partId, quantity }]).then(
          () => renderWorkOrder(id),
          (err) => $('#parts-alert').html(`<div class="fl-alert fl-alert--error">${esc(msg(err))}</div>`));
      });
    }, showError);
  }

  // ---- router ----
  function router() {
    const path = (location.hash.slice(1) || '/vehicles').split('/').filter(Boolean);
    if (path[0] === 'vehicles' && path.length === 1) return renderVehicles();
    if (path[0] === 'vehicles' && path[2] === 'new') return renderNewWorkOrder(path[1]);
    if (path[0] === 'vehicles' && path.length === 2) return renderVehicle(path[1]);
    if (path[0] === 'work-orders' && path.length === 2) return renderWorkOrder(path[1]);
    return renderVehicles();
  }

  $(window).on('hashchange', router);
  $(router);
})();

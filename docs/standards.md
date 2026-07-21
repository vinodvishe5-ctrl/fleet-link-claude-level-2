# FleetLink standards (the detail behind CLAUDE.md)

`CLAUDE.md` is the short, always-on version every session reads. **This file is the depth** it points
to — the approved patterns and the named anti-patterns, for both tracks. Keep `CLAUDE.md` tight; put the
long examples here. Both files are checked in and reviewed like code: a change here changes what everyone
generates next.

The rule of thumb for where a standard lives:

| Kind of standard | Where it goes |
|---|---|
| A rule that is always true (naming, layering, error shape) | `CLAUDE.md` (short) + this file (detail) |
| A repeatable procedure (add an endpoint, add a screen) | a **skill** (`.claude/skills/`) |
| A prompt you run often (review a diff) | a **slash command** (`.claude/commands/`) |
| A must-never / must-always (no secrets) | a **hook** (`.claude/settings.json` + `.claude/hooks/`) |
| A big isolated job (branch-wide review) | a **subagent** (`.claude/agents/`) |

---

## 1. Naming

- Types and fields match the **FSD names exactly** — `WorkOrder`, `WorkOrderPart`, `Depot`,
  `OdometerKm`, `RegistrationNo`. See [`docs/domain-glossary.md`](domain-glossary.md).
- Enum **values** are the FSD strings: `"Active"`, `"InRepair"`, `"Retired"`, `"Open"`, `"InProgress"`,
  `"Completed"`, `"Cancelled"`, priorities `"Low" | "Medium" | "High"`.
- .NET: `PascalCase` types and members. JavaScript: `camelCase` members, `PascalCase` model factories.

**Anti-pattern:** renaming a field on the way out (`vehicleReg` instead of `registrationNo`), or
inventing a field the FSD does not name. If the UI needs a display label, derive it — do not rename the data.

---

## 2. Layering — the rule lives in the service

Every change follows **presentation → service → data**:

- **route / endpoint** — thin. Validate the request, call one service method, map the result to a status
  code. **No business rules here.**
- **service** — all business rules. Each rule cites its **FSD §5 number** in a comment. Costs are
  derived here.
- **data** — the in-memory store (2.C); DTOs are mapped at the boundary, models never leak out.

**Approved (JavaScript):**
```js
// src/routes/workOrders.js — thin
router.post('/:id/parts', asyncHandler(async (req, res) => {
  const dto = validateAddParts(req.body);              // 400 on bad input
  const wo = workOrderService.addParts(req.params.id, dto.lines); // rule lives in the service
  res.status(200).json(toWorkOrderDto(wo));            // DTO out, one shape
}));
```
```js
// src/services/workOrderService.js — the rule, citing the FSD
function addParts(id, lines) {
  const wo = store.workOrders.get(id) ?? throwNotFound('WORK_ORDER_NOT_FOUND');
  // FSD §5.9 — parts can only be added while the work order is Open or InProgress.
  if (wo.status !== 'Open' && wo.status !== 'InProgress')
    throwConflict('Cannot add parts to a ' + wo.status + ' work order', 'WORK_ORDER_NOT_EDITABLE');
  // FSD §5.10 — a part draw cannot exceed the part's stock on hand.
  ...
}
```

**Approved (.NET):** the same shape — `WorkOrderEndpoints` maps the route, `WorkOrderService` holds the
rule with the `// FSD §5.9` comment, `Mappers` returns the DTO.

**Anti-pattern:** an `if (wo.status === 'Completed') return res.status(409)...` **in the route**. The
route now knows a business rule; the next endpoint will get it slightly different. Move it to the service.

---

## 3. Error handling — one shape, centralised

Every error is the **one object**, produced by the central handler, with the FSD status code:

```json
{ "error": "Cannot add parts to a Completed work order", "code": "WORK_ORDER_NOT_EDITABLE" }
```

- .NET: throw `DomainException` (see `Common/DomainException.cs`); `ExceptionHandlingMiddleware` maps it
  to the shape + status. JavaScript: `throwConflict/throwNotFound/throwBadRequest` (see `src/errors.js`);
  `middleware/errorHandler.js` (registered **last**) maps it.
- Status codes: **400** bad input · **404** missing · **409** rule violation · **201** created · **200** ok.

**Anti-pattern:** `res.status(409).json({ message: 'nope' })` in a route — a second error shape and a
hand-picked field name. Always throw the domain error and let the one handler format it.

---

## 4. Logging

- Log at the **boundary and on rule violations**, not in tight loops. One line per request outcome and
  one per rejected rule, including the `code` — never the payload, never PII.
- Use the track's logger (`ILogger<T>` on .NET; the shared logger on JavaScript), never `Console.WriteLine`
  / bare `console.log` in committed code.

**Anti-pattern:** `console.log(req.body)` — logs client data and clutters output. Log the outcome and the
error `code`, not the body.

---

## 5. Reusable patterns

- **Add an endpoint** → use the **`new-endpoint`** skill. It walks the DTO → service-rule (with FSD §) →
  thin route → validation → test, so every endpoint comes out identical.
- **Add a non-domain slice** (status/probe, no rules) → use the **`add-slice`** skill.
- **Add a screen** → build it from the **API contract + the design tokens** (Module 2.E), and verify it
  with the screenshot loop. Never free-form a screen.

**Anti-pattern:** re-describing "how we add an endpoint" in a fresh prompt each time. Invoke the skill so
the procedure is identical for everyone.

---

## 6. Branding & UI

- All styling comes from the **design tokens** in `design-system.css` (colour, spacing, type, radius,
  status/priority tokens mapped to the FSD enums). A badge colour is a token, never hand-picked per screen.
- Screens are wired to the real API through the generated client (`js/api.js`), one method per endpoint.

**Anti-pattern:** `style="color:#c0392b"` on a status badge. Use the status token so a re-skin changes one
place, not twenty screens.

---

## 7. Guardrails (non-negotiable — enforced by the hook)

- **No real client data, PII, secrets, connection strings** in code, comments, commits or prompts.
- Sample data (names, registrations, licences) is **fictional and clearly labelled**.
- The `PreToolUse` guardrail hook (`.claude/hooks/guard.mjs`) blocks a write that contains a secret or a
  connection string **before it lands**. If it blocks you, use an env var or a fake placeholder — do not
  work around it.

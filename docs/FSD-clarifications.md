# FSD Clarifications — FleetLink

**Purpose:** [`FSD-FleetLink.md`](FSD-FleetLink.md) is the source of truth and is not rewritten by
Claude. This file records ambiguities in the FSD that have been explicitly resolved with the
architect/BA, so future Claude Code sessions don't re-ask or re-guess. If the FSD is later amended to
cover any of these directly, remove the corresponding entry here.

| # | Ambiguity | Resolution |
|---|-----------|------------|
| 1 | Section 3 entities/attributes are marked "candidate — draft for the architect to confirm." | **Treat as confirmed.** Build the DB/API from Section 3 as-is from 2.C onward; only flag it if a real gap turns up. |
| 2 | Rule 6 (Critical SLA) doesn't define how the 2-day window is counted. | **Calendar days:** `DueDate <= OpenedDate + 2 calendar days` (inclusive of the opened day). |
| 3 | Rule 9 requires an `AssignedDriverId` to complete a non-Inspection WorkOrder; unclear if this also applies to `Cancelled`. | **Cancelled is exempt.** The assignee requirement applies only to the `Completed` transition, as literally stated. |
| 4 | Rule 8 decrements stock when parts are added; the FSD doesn't say what happens to that stock if the WorkOrder is later `Cancelled`. | **No restore.** Stock stays decremented even after cancellation. Do not invent a restore rule unless the FSD is updated. |
| 5 | Rule 12 (odometer monotonic) doesn't say whether updates are blocked on `Retired`/`InMaintenance` vehicles. | **Allowed on any status.** Rule 12 only constrains the value (monotonic), not vehicle status — no additional status check. |
| 6 | Section 2 says the Depot Manager "signs off completions," but Section 6 has no separate approval endpoint/field. | **Descriptive only.** Sign-off = the Depot Manager performing the existing `Completed` transition (Rules 9/10). No separate approval step or field exists. |

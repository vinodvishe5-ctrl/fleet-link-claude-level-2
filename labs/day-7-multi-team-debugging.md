# Day 7 — Multi-Team Hand-off, Debugging & RCA (Modules 2.G + 2.H)

**Branch:** `day-7/<you>` off `upstream/main` (the Day-6 consistency toolkit).
**Goal:** feel the shared standard do the coordinating across roles, then take a bug from a noisy log all
the way to a guarded, tested fix — all in your track, both moves on the same FleetLink repo.

> You drive Claude Code with this guide — you review every diff and own every commit. Stay in your track
> (`dotnet` or `javascript`); swap `<you>` for your name.

## Setup

```bash
git fetch upstream
git checkout -b day-7/<you> upstream/main
claude                     # launch from the repo ROOT so it reads the root + track CLAUDE.md
```

Prove sign-in and orient (no changes yet):

```
You are in the FleetLink repo. In a few lines: what build stage does /api/meta report, what does the
new-endpoint skill do, and where do the FSD §5 business rules live? Just report.
```

---

## Part 1 — Module 2.G: one role hand-off, on the shared standard (≈40 min)

The whole chain runs FSD → entities (BA) → model/API (dev) → UI → tests. You will play the **BA→dev→test**
hop: a confirmed entity relationship (a work order *has* parts) becomes a real read endpoint, built with
the **shared** `new-endpoint` skill so it comes out in the same shape everyone else's endpoints have.

**Prompt — build the hand-off endpoint with the shared skill:**

```
Use the new-endpoint skill to add GET /api/work-orders/{id}/parts — return the parts recorded on a work
order as DTOs (partId, partNumber, name, quantity, unitCost, derived lineCost), 404 if the work order
doesn't exist. Follow the skill exactly: DTO/mapper, a thin read in the service, a thin route/endpoint, a
test for the 200 and the 404. Show me the diff. Don't commit yet.
```

**Checkpoint — this is convergence you can see:** the read is in the service, the route/endpoint is thin,
there is a DTO at the edge, `lineCost` is derived not stored, and the shape matches the existing reads.
Run the tests, then commit.

```bash
npm test            # or: dotnet test
git commit -am "Day 7 (2.G): work-order parts hand-off endpoint, built with the new-endpoint skill"
```

> **Discuss:** the artifact the BA handed the dev was the confirmed *entity relationship*; the artifact
> the dev hands the tester is this *contract*. Nobody re-decided the shape — the shared standard did.

---

## Part 2 — Module 2.H: reproduce, root-cause, fix, guard (≈60 min)

The facilitator has planted a bug that shipped in "v0.6.1" (see `labs/day-7/symptom.md`). You get the
**symptom** and a **noisy log** — not a clean repro. Work it like production.

### 2.1 — Read the symptom, cluster the log

```
Read labs/day-7/incident-sample.log. It is noisy on purpose. Cluster it by signature, tell me which
cluster is the real incident (volume + when it started), and give me a candidate root cause that points
at specific log lines as evidence. Don't change any code yet.
```

**Checkpoint:** Claude should surface the `addParts` / non-positive-quantity cluster, tie it to the
v0.6.1 validator change, and note the divide-by-zero in the report is a *downstream* effect, not the
cause.

### 2.2 — Confirm the cause, then reproduce it as a failing test

```
Confirm that hypothesis against the code: trace how a quantity of 0 or a negative quantity reaches the
data today. Then write the smallest failing test that reproduces it — prefer a service-level test, since
a caller that skips the edge validator is exactly how a negative quantity gets in. Show me the test
failing before any fix.
```

**Checkpoint:** you have a **red** test that pins the bug (non-positive quantity is accepted / stock not
decremented). Do not fix anything until you have it.

### 2.3 — Fix it properly and add the guardrail

```
Fix it so it can't come back: (1) restore the boundary quantity check to >= 1 in the validator, and
(2) add the AUTHORITATIVE floor in workOrderService.addParts / WorkOrderService.AddParts — reject a
non-integer or < 1 quantity with a 400 invalid_quantity, citing FSD rule 8, before anything mutates.
Keep the failing test as the regression. Show me the diff; then run all tests.
```

**Checkpoint — the fix is auditable:** the guard is one explicit, named line in the service with a
`rule 8` comment; it logs a code, not a payload; the regression test is green and every other test still
passes.

```bash
npm test            # or: dotnet test   — all green
git commit -am "Day 7 (2.H): reproduce + fix non-positive parts quantity; authoritative service guard + regression"
```

### 2.4 — Record the stage and push

```
Set /api/meta buildStage to "2.H — Debugging & RCA" and version to 0.7.0 on my track, and update the
meta test. Show me the diff.
```

```bash
npm test            # or: dotnet test
git commit -am "Day 7: record build stage 2.H — Debugging & RCA"
git push -u origin day-7/<you>
```

---

## Acceptance criteria (thumbs up on each)

- **2.G:** `GET /api/work-orders/{id}/parts` returns the recorded lines with a derived `lineCost`; 404 for
  a missing work order; built via the `new-endpoint` skill; a 200 + a 404 test pass.
- **2.H:** you clustered the log to the right cause; you have a regression test that was **red** before the
  fix; the fix restores the edge check **and** adds the authoritative service floor (`invalid_quantity`,
  400, cites rule 8); stock never moves on a rejected line.
- App runs, `/api/meta` shows `2.H — Debugging & RCA` (v0.7.0), and the whole suite is green.
- Every diff was reviewed before commit.

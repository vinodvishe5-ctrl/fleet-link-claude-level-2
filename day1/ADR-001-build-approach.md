# ADR-001: Build approach for FleetLink

- **Status:** Accepted
- **Decision:** **Database-first.** We design the data model deliberately from the FSD and confirm it as
  humans *before* generating the code on top of it.
- **Context:** FleetLink has the four signals that point to database-first: **shared data** (many
  users/roles touch the same vehicles, work orders and stock), **reporting** built on top
  (open-work-by-depot, overdue, cost-per-vehicle), **integrations** expected later, and a **long
  maintenance life**. Its hardest logic (derived vehicle status, stock decrement, cost derivation, the
  status state machine) all hangs off a correct data model. For this system the data model is the most
  expensive thing to get wrong and the hardest to change once data and integrations exist.
- **Consequences:**
  - *Makes easy:* a stable, deliberate foundation for the API, reporting and integrations; the schema is
    designed on purpose, not accreted; the business rules have one clear place to live (the service layer
    over a known model).
  - *Makes harder:* slightly slower to the very first demo — we design the model before we build features.
  - *What we watch for:* over-normalisation, and "helpful" schema additions the FSD never asked for
    (hallucinated columns, inferred relationships). We treat Claude's entity list as a **draft to confirm**,
    not an authority — see `entities-draft.md`.
- **When we would decide differently (software-first):** a genuine throwaway prototype/PoC; requirements
  still honestly unknown; or simple, local data that no other system reports on or integrates with. None
  of those describe FleetLink — so database-first it is. The skill is *choosing* deliberately, not always
  picking the same one.

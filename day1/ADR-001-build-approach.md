# ADR-001: Build approach for FleetLink

- Status: Accepted
- Decision: database-first
- Context: FleetLink is a shared-data enterprise system, not a throwaway prototype. Multiple actors
  (Fleet Coordinator, Depot Manager, Maintenance Reviewer) read and write the same Vehicle, Driver,
  Part and WorkOrder records; the FSD already specifies reporting endpoints (open work by depot,
  overdue work orders, cost per vehicle) that depend on a consistent, queryable schema; and the
  domain carries real referential and business-rule constraints (vehicle-depot integrity, stock
  levels, status state machines) that are far cheaper to enforce at the data layer than to patch in
  after the fact. Given the long maintenance life called out in FSD §1, getting the schema right
  before building the API reduces expensive rework later.
- Consequences:
  - Easier: business rules (§5 of the FSD) map directly onto schema constraints and are enforced
    consistently across both the .NET and JavaScript tracks; reporting queries are straightforward
    once the schema is settled; onboarding a new engineer is simpler because the data model is the
    single reference point.
  - Harder: no visible UI or working demo until the schema and API layers are in place, so
    stakeholder feedback comes later than it would with a software-first spike; schema mistakes made
    early are more expensive to unwind once seed data and integrations depend on them.
  - Watch for: relationships (Depot–Vehicle–Driver–WorkOrder–Part) breaking under real usage
    patterns, and all entities/attributes being confirmed against the FSD *before* API work starts —
    not discovered mid-build.
- When we would decide differently: if FleetLink were a short-lived proof of concept with no shared
  data, no reporting requirement, and a lifespan measured in days rather than years — i.e. the
  opposite of the constraints in FSD §1. In that case, a software-first spike to validate the
  concept quickly would outweigh the cost of an imperfect schema.

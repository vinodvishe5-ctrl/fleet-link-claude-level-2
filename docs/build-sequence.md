# The FleetLink build sequence (database-first)

FleetLink is built in the order below — the best-practice flow for enterprise ADM work. Each step has a
clear owner and ends with a **human review checkpoint** before the next begins. Claude accelerates
every step; it does not skip the checkpoints.

| # | Step | Owner | Claude's role | Module |
|---|------|-------|---------------|--------|
| 1 | **Requirements / FSD** | Human | — (the FSD is the source of truth) | 2.A |
| 2 | **Domain & database design** | Architect + BA confirm | Reads the FSD, proposes entities/attributes/relationships (a *draft*) | 2.C |
| 3 | **Data model** (EF Core / equivalent) | Reviewed | Generated database-first from the agreed schema | 2.C |
| 4 | **APIs** | Reviewed | Controller/route → service → repository, with DTOs | 2.D |
| 5 | **Business logic** | Human-assisted | Built on the service layer against confirmed rules | 2.D |
| 6 | **Validations** | Human-assisted | Client **and** backend, deliberately kept consistent | 2.D |
| 7 | **UI** | Human-assisted | Generated from the API contract + design system | 2.E |
| 8 | **Testing** | Human-assisted | Cases from requirements; automated across layers | 2.I |

## Why database-first for FleetLink

For an application with shared data, reporting, integrations and a long maintenance life, the **data
model is the most expensive thing to get wrong and the hardest to change** once data and integrations
exist. Designing it deliberately, up front, pays back across the whole life of the application. That is
the case FleetLink is built to demonstrate — and Module 2.A teaches the trade-off so the team can make
the call deliberately, case by case.

## The two input questions (answered by this project)

- **Database design is driven from the FSD** — Claude extracts a strong candidate entity list from it,
  but that list is a *draft for the architect and BA to confirm*, not an authority.
- **UI is driven from a concrete API contract plus the design system** — not from free-form prompts
  alone. Prompts alone yield generic screens; a contract and design tokens yield UI that fits.

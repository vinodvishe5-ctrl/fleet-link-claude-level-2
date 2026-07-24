# Day 1 (2.A) — Build plan for FleetLink

Claude proposed a build sequence; I compared it to `docs/build-sequence.md`. They broadly agree — a good
sign the method isn't just one tool's opinion. This is the order we build in, database-first, with a
**human review checkpoint between every step.**

| # | Step | Owner | Claude's role | Module |
|---|------|-------|---------------|--------|
| 1 | Requirements / FSD | Human | source of truth — read, not written | 2.A (done) |
| 2 | Domain & database design | Architect + BA **confirm** | proposes entities/attributes/relationships (a draft) | 2.C |
| 3 | Data model | Reviewed | generated database-first from the agreed schema | 2.C |
| 4 | APIs | Reviewed | controller/route → service → repository, with DTOs | 2.D |
| 5 | Business logic | Human-assisted | built on the service layer against the confirmed §5 rules | 2.D |
| 6 | Validations | Human-assisted | client **and** backend, kept deliberately consistent | 2.D |
| 7 | UI | Human-assisted | from the API contract + design system, not free-form prompts | 2.E |
| 8 | Testing | Human-assisted | cases from requirements; automated across layers | 2.I |

**Before 2.C we also need the scaffold (2.B):** bring Claude Code into the project, establish the layered
structure and conventions, and prove one thin non-domain slice runs — so the domain generated in 2.C
slots into a frame that already works.

## The human checkpoints (non-negotiable)

Nothing flows to the next step until a person confirms the last one: the **architect** confirms the design
(steps 2–3), the **developer** reads and owns every diff (steps 4–6), the **tester** owns the tests
(step 8). Claude accelerates the work *between* the checkpoints; it never removes them.

## CLAUDE.md additions I made today

See the root `CLAUDE.md` "Conventions confirmed on Day 1 (2.A)" section — a concrete error shape, enums
stored as strings, and server-generated ids. Kept tight on purpose; we grow `CLAUDE.md` properly in 2.F.

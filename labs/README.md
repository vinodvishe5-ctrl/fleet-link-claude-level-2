# Level 2 labs — the running project, day by day

Every Level 2 day adds one layer to FleetLink on a new branch. This is the map. Only **Day 1** is a
full lab guide today; the later entries are previews so you can see where the project is heading — each
becomes a full guide on its day.

> **First-time setup (once):** you work on **your own fork**. Fork this repo on github.com, then
> `git clone https://github.com/<you>/fleet-link-claude-level-2.git fleetlink && cd fleetlink` and
> `git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git`.
>
> **Every day** you start from the **shared ideal reference** on `upstream/main` — not from your own
> previous day — so a missed step never cascades: `git fetch upstream && git checkout -b day-N/<you> upstream/main`.
> You push your day's branch to your fork (`origin`) and open PRs against the shared repo for review.
> See [`../BRANCHING.md`](../BRANCHING.md).

| Day | Date | Module | Branch | You build |
|-----|------|--------|--------|-----------|
| **1** | Tue 14 Jul | **2.A** Approach & Architecture | `day-1/<you>` | **[Full guide →](day-1-architecture.md)** — run the skeleton, analyse the FSD, decide DB-first vs software-first, draft the entity list, set the project's `CLAUDE.md`. |
| **2** | Wed 15 Jul | **2.B** Claude Code Foundations (new & existing) | `day-2/<you>` | **[Full guide →](day-2-claude-code.md)** — install & drive Claude Code; onboard onto your Day-1 skeleton (brownfield); scaffold the layered structure + a `GET /api/meta` slice (greenfield). No domain yet. |
| **3** | Thu 16 Jul | **2.C** Building with Claude Code: where everything lives (Data model) | `day-3/<you>` | **[Full guide →](day-3-data-model.md)** — the Claude-Code lens: how teams change, why repo structure is Claude's interface, and *which file holds what*. Place the data-model layer — shapes in `models/`, state in `data/`, design record in `docs/`. No rules yet. |
| **4** | Fri 17 Jul | **2.D** API & Business Logic | `day-4/<you>` | **[Full guide →](day-4-api.md)** — fill the empty folders: response/request DTOs (the contract), the twelve FSD §5 business rules in the services, thin write endpoints returning the exact status codes, validation consistent on both sides + one error shape, a test per rule. |
| **5** | Mon 20 Jul | **2.E** UI / UX & Front-End | `day-5/<you>` | **[Full guide →](day-5-ui.md)** — generate the UI from the API contract + a design system (not free-form prompts): design tokens, list + detail screens for vehicles and work-orders, wired to the 2.D API and kept consistent. |
| 6 | Tue 21 Jul | 2.F CLAUDE.md, Skills & Consistency | `day-6/<you>` | Grow `CLAUDE.md`; build a Skill / slash command / hook to enforce standards up front. |
| 7 | Wed 22 Jul | 2.G Multi-Team + 2.H Debugging & RCA | `day-7/<you>` | Role hand-off across the chain; diagnose and fix a planted bug with RCA. |
| 8 | Thu 23 Jul | 2.I System & Integration Testing | `day-8/<you>` | Generate and run tests across layers; triage failures. |
| 9 | Fri 24 Jul (am) | 2.J RAG | `day-9/<you>` | A developer Q&A assistant grounded in FleetLink's own docs and code, with citations. |
| 10 | Fri 24 Jul (pm) | 2.K MCP & Agentic Lab + 2.L Q&A | `day-10/<you>` | One small, guard-railed agent over FleetLink; consolidation and open clinic. |

> Dates follow the Level 2 window (14–24 July, weekdays only). Sequencing is indicative and can be
> re-balanced by the facilitator; the *order of layers* is what matters.

## How to use a lab guide

Each guide is written for you **and** for your Claude Code. It gives the goal, the exact prompts to
start from, the checkpoints where you stop and review, and the acceptance criteria for "done". Drive
Claude Code with it — do not paste it and walk away. You review every diff; you own every commit.

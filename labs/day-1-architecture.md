# Day 1 Lab — Module 2.A: The End-to-End Project, Approach & Architecture

**Time:** ~90 minutes hands-on · **Branch:** `day-1/<you>` · **Track:** pick `dotnet/` **or** `javascript/`

**What you leave with:** a running FleetLink skeleton, a written **architecture decision** (database-first
vs software-first), a **confirmed candidate entity list**, a **build-sequence plan**, and a refined
**`CLAUDE.md`** — the foundation every later day builds on.

> Today is deliberately **not** a big coding day. Module 2.A is about *deciding how you will build*
> before you build it. You will use Claude Code as an analysis and drafting partner, and **you** make
> the calls. Everything you produce today is committed to your Day-1 branch.

---

## 0. Setup (10 min)

1. **Fork** the repo on github.com (the **Fork** button), then **clone your fork** into a folder named
   `fleetlink` and open it in your IDE (Visual Studio / VS Code / Rider). You push to your fork; you
   never push to the shared repo — see [`../BRANCHING.md`](../BRANCHING.md).
   ```bash
   git clone https://github.com/<your-name>/fleet-link-claude-level-2.git fleetlink
   cd fleetlink
   git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git
   ```
2. **Create your branch:**
   ```bash
   git checkout main && git pull upstream main
   git checkout -b day-1/<your-name>
   ```
3. **Run the skeleton** for your track and confirm the health check responds:
   - **.NET:** `cd dotnet && dotnet run --project src/FleetLink.Api` → open `http://localhost:5080/health`
   - **JavaScript:** `cd javascript && npm install && npm start` → open `http://localhost:5080/health`

   You should see `{"status":"ok","app":"FleetLink",...}`. If you do, your environment is good. **This
   is the only "run it" step today** — the point is to prove the toolchain works before you rely on it.
4. **Launch Claude Code** in the repo root so it reads the root `CLAUDE.md` and can see `docs/`.

**Checkpoint 0 — commit:** `git commit -am "Day 1: confirmed skeleton runs on my VM"`

---

## 1. Understand the FSD with Claude Code (15 min)

You cannot choose an approach for a system you do not understand. Use Claude Code to build that
understanding fast — then verify it against the FSD yourself.

**Prompt to start from:**
> "Read `docs/FSD-FleetLink.md`. In plain language, summarise what FleetLink does, who uses it, and the
> five business rules you think are hardest to get right. Do not write code. Ask me anything the FSD
> leaves ambiguous."

**Do:** read Claude's summary against the FSD. Where does it match? Where did it *add* something the
FSD never said (an invented rule, a column, a relationship)? Note one such "helpful hallucination" —
you will see more of them in 2.C, and catching them is the skill.

**Deliverable:** create `day1/00-understanding.md` capturing, in your own words, what FleetLink is and
the two or three questions you would take back to the BA.

**Checkpoint 1 — commit.**

---

## 2. The decision: database-first vs software-first (25 min)

This is the heart of Module 2.A. FleetLink has shared data, reporting, integrations and a long
maintenance life. Decide the approach **deliberately**, and write down *why*.

**Prompt to start from:**
> "For FleetLink as specified in the FSD, compare a **database-first** and a **software-first** build
> approach. Give me the trade-offs as a table: cost of getting the data model wrong, ease of change
> later, fit for reporting and integrations, and speed to a first demo. Then recommend one for this
> system and justify it in three sentences. Remember: the recommendation is a draft for me to confirm."

**Do:** challenge the answer. Ask "when would software-first actually be the right call here?" so you
understand the *boundary*, not just the recommendation. The architect owns this decision — Claude
informs it.

**Deliverable — write an ADR** at `day1/ADR-001-build-approach.md` using this shape:

```markdown
# ADR-001: Build approach for FleetLink
- Status: Accepted
- Decision: <database-first | software-first>
- Context: <one paragraph — what about FleetLink drives this>
- Consequences: <what this makes easy; what it makes harder; what we watch for>
- When we would decide differently: <the boundary case>
```

> The programme's recommendation for enterprise ADM work like FleetLink is **database-first** — the
> data model is the most expensive thing to get wrong. If you land somewhere else, your ADR must say
> why. There is no single right answer for every system; there *is* a right way to decide.

**Checkpoint 2 — commit the ADR.**

---

## 3. Draft the candidate entity list (15 min)

**Prompt to start from:**
> "From `docs/FSD-FleetLink.md`, produce a candidate entity list for the database: each entity, its key
> attributes, and its relationships. Flag anything you inferred that the FSD does not state explicitly,
> and list any entity you are unsure about. This is a draft for human confirmation, not a final design."

**Do:** confirm it against Section 3 of the FSD. Cross out anything invented; add anything missed. This
is the *draft the architect confirms* — the exact pattern Module 2.C builds on.

**Deliverable:** `day1/entities-draft.md` — the confirmed list, with a short "confirmed / rejected /
open" note against each item.

**Checkpoint 3 — commit.**

---

## 4. Set the build sequence and sharpen CLAUDE.md (15 min)

**Prompt to start from:**
> "Based on our database-first decision and the confirmed entities, lay out the build sequence for
> FleetLink from here: what we build in what order, who reviews each step, and where the human
> checkpoints are. Then suggest 3–5 concrete additions to the root `CLAUDE.md` that would keep the whole
> team's generated code consistent as we build this project."

**Do:** compare Claude's sequence to [`docs/build-sequence.md`](../docs/build-sequence.md) — they should
broadly agree. Then apply the two or three `CLAUDE.md` additions you actually believe in (e.g. a
naming rule, a layering rule, an error-format rule). Keep it tight; you grow it properly in 2.F.

**Deliverables:** `day1/build-plan.md` and an edited `CLAUDE.md`.

**Checkpoint 4 — commit.**

---

## Done when…

- [ ] The skeleton ran on your VM (health check green).
- [ ] `day1/00-understanding.md`, `ADR-001-build-approach.md`, `entities-draft.md`, `build-plan.md` exist and are yours (not raw Claude output).
- [ ] You caught at least one thing Claude inferred that the FSD did not state.
- [ ] Your Day-1 branch is committed and pushed.

**Push to your fork and (optionally) open a PR** — from your fork's branch against the shared repo's
`main` — so a facilitator can review your architecture decision:
```bash
git push -u origin day-1/<your-name>      # origin = your fork
```

## Tomorrow (Day 2 · Module 2.B)

You branch `day-2/<you>` from today's work and use Claude Code to **scaffold FleetLink from the FSD** —
turning today's decisions into the first real slice of the running project.

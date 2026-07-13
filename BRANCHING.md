# Branching — how the running project moves through Level 2

FleetLink is built **one branch per day**. Each day you branch from the previous day's work, do that
day's layer with Claude Code, commit, and (optionally) open a pull request so a facilitator can review
the diff — exactly the peer-review discipline you keep at Capgemini.

## The model

```
main
 └─ day-1/<you>     Module 2.A  — approach & architecture kick-off
     └─ day-2/<you> Module 2.B  — scaffold the project with Claude Code
         └─ day-3/<you> Module 2.C — database & domain model
             └─ day-4/<you> Module 2.D — API & business logic
                 └─ ...      (2.E UI, 2.F CLAUDE.md/Skills, 2.H debugging, 2.I testing, 2.J RAG, 2.K agent)
```

- `main` holds the **seed**: the FSD, this guide, the shared `CLAUDE.md`, the lab guides, and a
  runnable skeleton for each track. **Do not commit your work directly to `main`.**
- `<you>` is your name or initials, so a shared repo stays untangled (e.g. `day-1/rutwik`).

## Each day

```bash
# Day 1 (from the seed)
git checkout main
git pull
git checkout -b day-1/<you>
#   ...do the lab with Claude Code, commit as you go...
git add -A && git commit -m "Day 1 (2.A): FleetLink architecture kick-off"
git push -u origin day-1/<you>

# Day 2 (continue from your Day-1 work)
git checkout -b day-2/<you>      # branched from day-1/<you>, so it carries yesterday forward
#   ...do Day 2's lab...
```

> **Why branch from yesterday, not from `main`?** Because the project is cumulative. Day 3 designs the
> database for the API you scaffolded on Day 2. Branching from your previous day keeps the whole build
> in one line of history you can walk end to end in Module 2.L.

## Commit discipline (taught, not optional)

- Commit at each **checkpoint** in the lab, not once at the end — small diffs review better.
- Write the message as *what changed and why*, not "wip".
- Review Claude Code's diff **before** you commit it. You own every line you commit; Claude assists,
  it does not absolve.

## If you fall behind

Each day's lab guide starts from a known-good state, and the facilitator can hand you a reference
branch to catch up from. Missing a day hurts because the project is connected — tell the facilitator
and pick up from the reference rather than skipping the layer.

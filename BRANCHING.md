# Branching — how the running project moves through Level 2

FleetLink is built **one branch per day**, and you work on **your own fork** of the repo. Each day you
branch from the previous day's work, do that day's layer with Claude Code, commit, push to **your fork**,
and (optionally) open a pull request against the shared repo so a facilitator can review the diff —
exactly the peer-review discipline you keep at Capgemini.

> **Why a fork?** Thirty people cannot all push to one repo without either collaborator invites for
> everyone or trampling each other's branches. A fork gives each of you full write access to your own
> copy, no admin, no waiting — and the branch-per-day + pull-request flow below is unchanged.

## Two remotes

You clone **your fork** — that is `origin`, and you have full write access to it — and you add the shared
canonical repo as `upstream`, which is the read-only source of the seed and any reference branches:

```
origin    = https://github.com/<you>/fleet-link-claude-level-2.git                  (your fork — you push here)
upstream  = https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git  (the shared seed — read only)
```

## First-time setup (once)

```bash
# 1. On github.com, click "Fork" on the shared repo → creates github.com/<you>/fleet-link-claude-level-2
# 2. Clone YOUR fork into a folder named fleetlink (so the cd paths below match):
git clone https://github.com/<you>/fleet-link-claude-level-2.git fleetlink
cd fleetlink
# 3. Add the shared repo as upstream:
git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git
```

## The model

```
upstream/main       the seed: FSD, lab guides, shared CLAUDE.md, runnable skeleton
 └─ your fork (origin)
     └─ day-1/<you>     Module 2.A  — approach & architecture kick-off
         └─ day-2/<you> Module 2.B  — scaffold the project with Claude Code
             └─ day-3/<you> Module 2.C — database & domain model
                 └─ day-4/<you> Module 2.D — API & business logic
                     └─ ...      (2.E UI, 2.F CLAUDE.md/Skills, 2.H debugging, 2.I testing, 2.J RAG, 2.K agent)
```

- The seed lives on `upstream/main`. **You never push to `upstream`** — you push to your fork (`origin`).
- `<you>` is your name or initials, so your own branches stay tidy (e.g. `day-1/rutwik`).

## Each day

```bash
# Day 1 (from the seed)
git checkout main
git pull upstream main            # pull the latest seed from the shared repo
git checkout -b day-1/<you>
#   ...do the lab with Claude Code, commit as you go...
git add -A && git commit -m "Day 1 (2.A): FleetLink architecture kick-off"
git push -u origin day-1/<you>    # push to YOUR fork

# Day 2 (continue from your Day-1 work)
git checkout -b day-2/<you>       # branched from day-1/<you>, so it carries yesterday forward
#   ...do Day 2's lab...
git push -u origin day-2/<you>
```

> **Open a pull request** from your fork's `day-N/<you>` branch → the shared repo's `main`, so a
> facilitator can review. That is the same peer-review gate you already run; Claude Code sits inside it.

> **Why branch from yesterday, not from `main`?** Because the project is cumulative. Day 3 designs the
> database for the scaffold you built on Day 2. Branching from your previous day keeps the whole build
> in one line of history you can walk end to end in Module 2.L.

## Commit discipline (taught, not optional)

- Commit at each **checkpoint** in the lab, not once at the end — small diffs review better.
- Write the message as *what changed and why*, not "wip".
- Review Claude Code's diff **before** you commit it. You own every line you commit; Claude assists,
  it does not absolve.

## Keeping your fork current / if you fall behind

Each day's lab guide starts from a known-good state. To pull the latest lab guides or a reference branch
the facilitator publishes, fetch from `upstream`:

```bash
git fetch upstream
git checkout main && git merge upstream/main      # refresh your fork's main with the latest seed
```

Missing a day hurts because the project is connected — tell the facilitator and pick up from the
reference branch on `upstream` rather than skipping the layer.

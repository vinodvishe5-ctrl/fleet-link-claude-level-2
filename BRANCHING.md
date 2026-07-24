# Branching — how the running project moves through Level 2

FleetLink is built **one day at a time on a shared, ideal reference**. Every day you start from the
**same correct baseline** — the facilitator's ideal build so far, which lives on the shared repo's
`main` — and add that day's layer on top. You do **not** carry your own previous day's work forward.

> **Why re-baseline every day?** So a missed step never cascades. If something went wrong in your Day-2
> work, Day 3 still starts from the *correct* Day-2 code — you see the ideal version, then extend it.
> Everyone in the room builds the next layer on identical, known-good ground.

## Two remotes

You work on **your own fork** (`origin`, full write) and read the shared repo as `upstream`:

```
origin    = https://github.com/<you>/fleet-link-claude-level-2.git                  (your fork — you push here)
upstream  = https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git  (the shared ideal reference — read only)
```

`upstream/main` always holds the facilitator's **ideal, cumulative build through the previous day.** It
is advanced by the facilitator at the end of each day, so each morning it is the perfect starting point.

## First-time setup (once)

```bash
# 1. On github.com, click "Fork" on the shared repo → creates github.com/<you>/fleet-link-claude-level-2
# 2. Clone YOUR fork into a folder named fleetlink (so the cd paths in the labs match):
git clone https://github.com/<you>/fleet-link-claude-level-2.git fleetlink
cd fleetlink
# 3. Add the shared repo as upstream:
git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git
```

## The model

```
upstream/main   ── advanced by the facilitator each evening to the ideal state ──►
   Day 1 start ─────► Day 2 start ─────► Day 3 start ─────► …
   (seed)            (+ ideal 2.A)      (+ ideal 2.B scaffold)

Each day you branch YOUR work off the current upstream/main:
   upstream/main ──┬─ day-1/<you>   (your Module 2.A work)   → push to your fork, PR for review
                   ├─ day-2/<you>   (your Module 2.B work)   → push to your fork, PR for review
                   └─ day-3/<you>   (your Module 2.C work)   → …
```

- **You never push to `upstream`.** You push your day's branch to your fork (`origin`).
- **Your branch is not the next day's starting point** — `upstream/main` is. Start every day fresh from it.
- `<you>` is your name/initials (e.g. `day-2/rutwik`).

## Each day (the routine)

```bash
# Start the day from the shared ideal reference — NOT from your own previous branch:
git fetch upstream
git checkout -b day-2/<you> upstream/main     # day-2 example; use the day's number
#   ...do that day's lab with Claude Code, committing at each checkpoint...
git push -u origin day-2/<you>                 # push to YOUR fork
```

> **Open a pull request** from your fork's `day-N/<you>` branch → the shared repo's `main` so a
> facilitator can review your work against the ideal. Your PR is for review; it is **not** what advances
> `main` — the facilitator owns the reference line.

## Commit discipline (taught, not optional)

- Commit at each **checkpoint** in the lab, not once at the end — small diffs review better.
- Write the message as *what changed and why*, not "wip".
- Review Claude Code's diff **before** you commit it. You own every line you commit; Claude assists,
  it does not absolve.

## If you fall behind

You can't fall behind on the *starting point* — every day begins from the same `upstream/main`, so a
rough day never carries over. Just `git fetch upstream` and branch the new day from `upstream/main` as
above. If you want to study the ideal build, the facilitator publishes each day's reference on a
`solution/day-N` branch (see below).

---

## Facilitator process (how `main` advances)

The trainee routine above only works because `upstream/main` is kept as the ideal reference. As the
facilitator you maintain that:

1. Each day's **ideal, completed** build is staged on a `solution/day-N` branch (Novel Vista provides
   these; `solution/day-2` = the ideal Module-2.B scaffold, and so on).
2. **At the end of day N** — after the class has done that day themselves — advance `main` to that day's
   ideal so the next morning everyone starts from it:
   ```bash
   git fetch origin
   git checkout main
   git merge --ff-only origin/solution/day-2     # promote the day you just finished
   git push origin main
   ```
   (Use `--no-ff` if you prefer an explicit merge commit; `solution/day-N` is built on the previous
   day's ideal, so it fast-forwards cleanly.)
3. Do **not** advance `main` to a day's solution *before* the class does that day — otherwise they pull
   `main` and find the work already done. `main` should always equal "the ideal starting point for the
   day we are about to run."

Day 1 starts from the seed (`main` as first shipped). After Day 1 you promote `solution/day-1`, after
Day 2 `solution/day-2`, and so on.

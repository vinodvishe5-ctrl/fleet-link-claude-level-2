# Push FleetLink to GitHub (facilitator, one-time)

This repo is already initialised locally with the seed committed (branch `master`). Do this once to put
it on GitHub and share the link with trainees.

## 0. Clear stale lock files (one command)

The repo was initialised in a sandbox whose filesystem left two empty git lock files behind. Clear them
once from inside `fleetlink/` before running any git command:

```bash
rm -f .git/HEAD.lock .git/index.lock .git/objects/maintenance.lock
git status        # should now work cleanly and show "nothing to commit, working tree clean"
```

If `git status` still complains about a lock, run: `find .git -name '*.lock' -delete`.

## 1. Create an empty repo on GitHub

Create a new **empty** repository (no README, no .gitignore, no licence) named e.g. `fleetlink-l2` under
your org or account. Copy its URL, e.g. `https://github.com/<you>/fleetlink-l2.git`.

## 2. Point this repo at it and push

From inside this `fleetlink/` folder:

```bash
git remote add origin https://github.com/<you>/fleetlink-l2.git
git branch -M main
git push -u origin main
```

## 3. (Optional) protect main

In GitHub → Settings → Branches, add a rule so trainees cannot push to `main` directly — they work on
`day-N/<name>` branches and open PRs, exactly as in [`BRANCHING.md`](BRANCHING.md).

## 4. Share with trainees

Send them the repo URL and this one line:

> Clone it, then follow `labs/day-1-architecture.md`.

That's it — the seed on `main` is everything they need to start Day 1.

---

### Verify what you're pushing

```bash
git log --oneline           # should show the seed commit(s) on main
git ls-files | wc -l        # the tracked files (node_modules/bin/obj are ignored)
```

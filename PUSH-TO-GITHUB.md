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

## 3. Access model — trainees **fork** (no collaborators needed)

Trainees do **not** get write access to this repo, and you do **not** add 30 collaborators. Each trainee
**forks** it to their own account and pushes to their fork; they open pull requests back to this repo for
review. This is why a trainee pushing straight to this repo gets `403 Permission denied` — that is
expected, and the fork flow is the fix. See [`BRANCHING.md`](BRANCHING.md).

Keep this repo public (so everyone can fork/clone) and, optionally, protect `main` in
GitHub → Settings → Branches so nobody force-pushes the seed.

## 4. Share with trainees

Send them the repo URL and these lines:

> 1. Click **Fork** on this repo (creates `github.com/<you>/fleet-link-claude-level-2`).
> 2. Clone **your fork** into a folder named `fleetlink`, then add this repo as `upstream`:
> ```bash
> git clone https://github.com/<you>/fleet-link-claude-level-2.git fleetlink
> cd fleetlink
> git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git
> ```
> 3. Follow `labs/day-1-architecture.md`. You push to **your fork** (`origin`) and open PRs against this repo.

That's it — the seed on `main` is everything they need to start Day 1, and they push to their own fork.

## 5. Your own pushes as facilitator

You push the seed and reference branches to this repo directly, so authenticate as the account that
**owns** it (or has write on it). If a push is denied for the wrong account (e.g. a cached identity),
clear the cached credential and re-authenticate as the owner, or use a fine-grained Personal Access
Token (scope: this repo, Contents = Read/Write) as the password at the HTTPS prompt:

```
Windows: Control Panel → Credential Manager → Windows Credentials → remove "git:https://github.com", push again, sign in as owner
Mac:     printf "protocol=https\nhost=github.com\n\n" | git credential-osxkeychain erase
```

---

### Verify what you're pushing

```bash
git log --oneline           # should show the seed commit(s) on main
git ls-files | wc -l        # the tracked files (node_modules/bin/obj are ignored)
```

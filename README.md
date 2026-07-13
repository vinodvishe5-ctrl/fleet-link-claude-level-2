# FleetLink — the Level 2 running project

**Claude AI Practical Training for ADM (Capgemini) · Level 2 — Applied Engineering with Claude**

This repository is the single **running project** you build, end to end, across Level 2. You do not
start a new exercise each day — you carry *this* project forward, one layer at a time, using **Claude
Code** on your own VM. By the end of Level 2 you will have designed its database, generated its API and
business logic, built its UI, tested it, grounded a RAG assistant on it, and wired a small agent to it.

> **FleetLink** is a fleet & field-service work-order system: depots, vehicles, drivers, work orders
> and parts. The full functional spec is in [`docs/FSD-FleetLink.md`](docs/FSD-FleetLink.md) — the
> source of truth for everything you generate.

## Two tracks, one project

The room has both **.NET** and **JavaScript / jQuery** developers, so FleetLink ships in two parallel
tracks that build the *same* application with the *same* FSD, rules and seed data — only the language
differs. **Pick the stack you are most fluent in and stay in it.**

| Track | Folder | Run it | Brief for Claude Code |
|------|--------|--------|-----------------------|
| .NET 8 (ASP.NET Core) | [`dotnet/`](dotnet/) | `dotnet run` | [`dotnet/build.md`](dotnet/build.md) |
| JavaScript (Node + Express) | [`javascript/`](javascript/) | `npm start` | [`javascript/build.md`](javascript/build.md) |

## How the days connect (branch-per-day)

You work on a **new branch each day**, branched from the previous day's work, so the project
accumulates and every day's diff is reviewable. The full workflow is in
[`BRANCHING.md`](BRANCHING.md). In short:

```
main  ──► day-1/<you>  ──► day-2/<you>  ──► day-3/<you>  ──► ...
        (2.A kick-off)  (2.B scaffold)  (2.C database)
```

## Start here (Day 1 — Module 2.A)

1. **Clone** this repository onto your VM.
2. **Run the skeleton** for your track to confirm your environment (see the track's `README.md`).
3. Create your Day-1 branch: `git checkout -b day-1/<your-name>`.
4. Open [`labs/day-1-architecture.md`](labs/day-1-architecture.md) and drive Claude Code through it.

## What lives where

```
fleetlink/
├─ README.md            ← you are here
├─ BRANCHING.md         ← the day-by-day branch workflow
├─ CLAUDE.md            ← shared project standards (every Claude Code session reads this)
├─ docs/
│  ├─ FSD-FleetLink.md      ← the functional spec (source of truth)
│  ├─ build-sequence.md     ← the recommended database-first build order
│  └─ domain-glossary.md    ← shared vocabulary
├─ labs/
│  ├─ README.md            ← the full day → module → branch map
│  └─ day-1-architecture.md ← today's lab (Module 2.A)
├─ dotnet/             ← .NET track (runnable skeleton + build.md)
└─ javascript/         ← JavaScript track (runnable skeleton + build.md)
```

## Ground rules

Sandbox only. In-memory / sample data only. **No real client data, no PII, no secrets, no connection
strings.** All controls you use at Capgemini — peer review, branching, SAST/DAST, pipelines — stay in
force. Claude accelerates the work inside that practice; it does not skip the checkpoints.

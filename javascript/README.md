# FleetLink — JavaScript track

Node.js + Express. This folder is the **JavaScript** build of the FleetLink running project — the same
application, same FSD, same rules and seed data as the .NET track, in JavaScript.

## Prerequisites (already on your VM)

- Node.js 18+ — check with `node --version`
- Your IDE: VS Code (or your preference)
- Claude Code, signed into your own account

## Run the skeleton (Day 1)

```bash
cd javascript
npm install
npm start
```

Then open **http://localhost:5080/health** — you should see:

```json
{ "status": "ok", "app": "FleetLink", "track": "JavaScript", "utc": "..." }
```

Run the smoke test with:

```bash
npm test
```

That is the whole seed: one health route and one test. From Day 2 you grow this into the full
application.

## What Claude Code builds here

The complete brief is in [`build.md`](build.md) — read it before generating. The functional spec it
builds toward is [`../docs/FSD-FleetLink.md`](../docs/FSD-FleetLink.md), and the standards every
session must follow are in [`CLAUDE.md`](CLAUDE.md) and [`../CLAUDE.md`](../CLAUDE.md).

## Layout

```
javascript/
├─ package.json
├─ build.md                ← Claude Code build brief (JavaScript)
├─ CLAUDE.md               ← JavaScript conventions
├─ src/
│  ├─ server.js            (Express app; maps only the health routes)
│  └─ health.js
└─ test/health.test.js
```

As you build, the intended shape is `src/models/`, `src/data/` (in-memory store + seed),
`src/services/` (business rules), `src/routes/`, and tests under `test/`. `build.md` spells this out.

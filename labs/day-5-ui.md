# Day 5 Lab — Module 2.E: UI / UX & Front-End Generation

**Time:** ~120 minutes hands-on · **Branch:** `day-5/<you>` (from `upstream/main`, the ideal Day-4 API) · **Track:** stay in the one you picked — `dotnet/` **or** `javascript/`

**What you leave with:** the FleetLink UI, built the way that actually works with Claude — a screen generated **blind** first (so you feel the problem), then corrected with the **screenshot feedback loop**: Claude captures the running page, critiques its own output against the design, fixes, and re-screenshots until it's right.

> **This is not a front-end lesson — it's a directing lesson.** You know CSS. What's new is getting Claude to build a screen and *verify it visually*, because Claude writes markup it can't see. It will hand you a misaligned, off-brand screen with total confidence — no error, no failing test. The fix is to give it eyes: let it screenshot the page, judge it against a reference, and iterate. You build one screen blind, then with the loop, and the difference is the whole point.

---

## The loop (keep this in view all lab)

```
generate  →  screenshot the running page  →  critique it vs the design  →  fix  →  screenshot again  →  …until it matches
```

**The one rule you enforce all day:** don't accept a screen you (or Claude) haven't *looked at*. "It rendered" is not "it's right". Every screen gets screenshotted and checked against the design system before it's done.

**Tooling:** the loop uses **Playwright** (already on your VM — no install). Claude Code writes a tiny script that opens the running app in headless Chromium, saves a PNG, and reads it back.

---

## 0. Setup — branch from the Day-4 ideal, prove sign-in + the screenshot path (10 min)

1. **Start from the ideal Day-4 API.**
   ```bash
   git fetch upstream
   git checkout -b day-5/<your-name> upstream/main
   ```
   *(Fresh machine? Clone your fork first: `git clone https://github.com/<your-name>/fleet-link-claude-level-2.git fleetlink && cd fleetlink && git remote add upstream https://github.com/rutwikshete-novelvista/fleet-link-claude-level-2.git`)*

2. **Confirm Playwright is available** (the screenshot tool the loop depends on — no install):
   ```bash
   npx playwright --version
   npx playwright install chromium   # only if the browser isn't already there
   ```

3. **Launch Claude Code from the repo root** and prove sign-in + the screenshot path:
   ```bash
   claude
   ```
   > "You are in the FleetLink repo. Two things, no app code yet: (1) in one line, confirm my track's API from Module 2.D that the UI will call. (2) Confirm you can screenshot a web page — check `npx playwright --version` and tell me how you'd capture `http://localhost:5080/` to a PNG and read it back. Don't build anything."

**Checkpoint 0 — commit:** `git commit --allow-empty -m "Day 5: started day-5 branch, Claude Code signed in, screenshot path confirmed"`

---

## Part A — Build a screen BLIND, and feel the problem (30 min)

You'll build one screen with **no** loop, on purpose, to see the blind default.

### A1. The inputs — a design system and a client (15 min)

The screen needs a reference to match and a client to call.

**Prompt (design system):**
> "Create a design system for FleetLink as design tokens in my track's front-end folder (`public/css/design-system.css` on JS, `src/FleetLink.Api/wwwroot/css/design-system.css` on .NET): CSS custom properties for palette, spacing, type, radius, elevation, and status/priority tokens mapped to the FSD enums. Then component classes built only from those tokens: card, table, badge, button, form field, alert. No screens yet. Show me the diff."

**Prompt (client):**
> "Generate a thin API client in my track's front-end `js/api.js` with one method per 2.D endpoint (FSD §6). Use jQuery `$.ajax`. Each call resolves the DTO or rejects with the one `{ status, error, code }` shape. No UI yet. Show me the diff."

**Checkpoint A1 — commit:** `git commit -am "Day 5 (2.E): design system + API client (the inputs)"`

### A2. One screen, generated from the design IMAGE — blind (15 min)

There's a **design reference** in the repo (from the Day-4 baseline) at `docs/design/vehicles-list.png` — an exported-Figma-style mockup. You generate the screen **from that image** — this is how you add an image as context and generate UI from it — but with **no screenshot loop**, so Claude builds from the picture yet never sees its own result.

**Prompt:**
> "Open the design reference at `docs/design/vehicles-list.png` and look at it. Build the app shell (index.html loading jQuery, the design system, api.js, app.js) and the Vehicles screen to **match that image** — header, page title, the table (registration, make/model, odometer, status badge), the status pill colours, the primary button — wiring the table to `GET /api/vehicles` and using the design tokens. Wire the static server (`express.static('public')` on JS; `app.UseDefaultFiles()` + `app.UseStaticFiles()` on .NET). Build it in one pass. **Do NOT screenshot your own result or check it — just generate it from the image.** Show me how to run it."

**Do:** run it and look — but **don't fix it by hand.**
```bash
# .NET
dotnet run --project src/FleetLink.Api
# JavaScript
npm start
```
Open `http://localhost:5080/`. Even though you gave it the design picture, it's plausibly off — badges not quite aligned, spacing uneven, drifted from the reference. **Claude built from the image but never checked its own render against it.** That's the blind default. Commit it as the "before".

**Checkpoint A2 — commit:** `git commit -am "Day 5 (2.E): vehicles screen — BLIND first pass (before the loop)"`

---

## Part B — Give Claude eyes: the screenshot loop (45 min)

Same screen, but now Claude looks at it. Leave the app running.

### B1. Screenshot and critique — no fixing yet (15 min)

**Prompt:**
> "The app is running at `http://localhost:5080/`. Give yourself eyes: write a small Playwright script (headless Chromium) that opens that URL and saves a screenshot to `tmp/vehicles.png`, run it, then **open** `tmp/vehicles.png` and look at it. Now open the design reference `docs/design/vehicles-list.png` alongside it and **compare the two** — list exactly where your screenshot differs from the reference: misalignment, spacing, overflow, wrong colours, anything not matching the design or tokens. Don't fix anything yet — just tell me the differences."

**Do:** read the critique. This was impossible before — the model is perceiving its own output *and the target picture*, and naming the gap.

### B2. Fix, re-shoot, iterate until it matches the reference (20 min)

**Prompt:**
> "Now run the loop: fix the differences you listed, re-run the screenshot, and open the new PNG. Compare it again to `docs/design/vehicles-list.png`. Show me before and after. Keep iterating — fix, screenshot, compare to the reference — until your screenshot **matches** `docs/design/vehicles-list.png` and nothing's misaligned. Stop when a screenshot matches the reference, and tell me why you stopped."

**Do:** watch it converge over a few passes. Refresh your own browser and confirm you agree. **This is the difference** between the blind version and the looped one — produce it yourself.

**Checkpoint B2 — commit:** `git commit -am "Day 5 (2.E): vehicles screen — AFTER the loop (screenshot-iterated)"`

### B3. Screenshot the awkward states (10 min)

**Prompt:**
> "Build the vehicle detail and work order detail screens, then screenshot and check these states specifically: the work-order list when empty; the create form after a rejected submit against the retired vehicle `FL-1004` (the 409 message); a work order with a very long title; and the vehicles table at 375px width. For each — capture, open the screenshot, critique against the design, fix. Show me the screenshots."

**Do:** the empty list, the error, the narrow width, the long value — the states blind generation forgets. The loop looks at each.

**Checkpoint B3 — commit:** `git commit -am "Day 5 (2.E): detail screens + the awkward states, checked by screenshot"`

---

## Part C — Level it up, scale it, bank it (25 min)

### C1. Level up: install a UI / motion skill (5 min)

A lever most people don't know: Claude Code has **plugins** — bundles of skills you install from a GitHub marketplace — and a front-end/motion skill changes what Claude produces **by default**. Prove it with a before/after, the same way you proved the loop.

**Before (no skill):**
> "On the vehicles screen, add a subtle loading state and a hover effect on the table rows — whatever you'd do by default. Screenshot the result to `tmp/before-skill.png` and show me."

**Install a skill** (Claude Code commands — browse `/plugin` to see what's available; in an enterprise, use your **vetted/internal** marketplace):
```
/plugin marketplace add <owner/repo>
/plugin install <frontend-or-motion-skill>@<marketplace>
/plugin
```

**After (skill loaded):**
> "Now that the front-end/motion skill is installed, do the same thing again — add the loading state and row hover the way the skill recommends (motion, transitions, micro-interactions, accessible states). Screenshot to `tmp/after-skill.png` and show me before-skill.png and after-skill.png side by side. Tell me what the skill changed."

**Do:** same prompt, different result — the skill's instructions steer the generation. A **skill raises the baseline**; the **loop makes it match your reference**. Install once and the whole team inherits the better default. *(A Claude Code plugin is pulled over the network — not software installed on the machine.)*

### C2. A second screen, matched to the first (15 min)

**Prompt:**
> "Add the write screens — create work order (client validation mirroring the FSD §5 rules), change status through the state machine, add parts against stock, update odometer. Then screenshot each new screen AND the vehicles screen you already finished, put them side by side, and make the new screens **match** the finished one — same spacing, components, tokens. Iterate with screenshots until they're consistent. Show me the comparison."

**Do:** notice consistency became a screenshot comparison against a screen you trust — not a written rule to remember.

**Checkpoint C2 — commit:** `git commit -am "Day 5 (2.E): write screens, matched to the reference by screenshot"`

### C3. Bank the loop + record the stage (10 min)

**Prompt:**
> "Add a short 'UI (2.E)' note to my track `CLAUDE.md`: the UI lives under `public/` (JS) / `wwwroot/` (.NET), is built from the API contract + design tokens, and **every screen is verified with the screenshot loop** — capture, critique against the design (alignment, spacing, overflow, states, tokens), fix, repeat. List that checklist. Then set `/api/meta` `buildStage` to `2.E — UI`. Keep it tight. Show me the diff."

**Do:** that checklist is the seed of tomorrow (2.F turns it into a skill + hook).

**Checkpoint C3 — commit:** `git commit -am "Day 5 (2.E): bank the screenshot-loop checklist in CLAUDE.md + record stage"`

---

## Done when…

- [ ] Branched `day-5/<you>` from `upstream/main`; sign-in + screenshot path confirmed (Playwright available).
- [ ] You generated the vehicles screen **from the design image** (`docs/design/vehicles-list.png`) and saw it come out plausibly wrong blind — committed as the "before".
- [ ] You gave Claude eyes: it **screenshotted**, **compared against the reference image**, and **fixed it over several passes** until it matched — committed as the "after".
- [ ] You pushed the UI through the **awkward states** (empty, error, narrow, long value) with the loop.
- [ ] You saw a **skill change Claude's default output** (before/after installing a UI/motion plugin).
- [ ] A **second screen** was kept consistent by matching a screenshot of the first.
- [ ] The **screenshot-loop checklist** is banked in `CLAUDE.md`; `/api/meta` reads `2.E — UI`.
- [ ] Your `day-5/<you>` branch is pushed.

**Push and (optionally) open a PR** against the shared repo's `main`:
```bash
git push -u origin day-5/<your-name>
```

## Tomorrow (Day 6 · Module 2.F)

You turn today's checklist and reference into the team's **default** — `CLAUDE.md` standards, a Skill and a hook so the screenshot loop and the design rules run automatically, for everyone, on every screen.

---

## Appendix — the screenshot script (reference)

Claude Code writes and runs this itself during the loop; shown so you know what it's doing. Playwright is already on the VM.

```js
// tmp/shot.mjs — capture a running page to a PNG (headless Chromium via Playwright)
import { chromium } from 'playwright';
const [url = 'http://localhost:5080/', out = 'tmp/vehicles.png', width = 1280] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('saved', out);
```
```bash
node tmp/shot.mjs http://localhost:5080/ tmp/vehicles.png 1280      # wide
node tmp/shot.mjs http://localhost:5080/ tmp/vehicles-narrow.png 375 # narrow
```

## Windows install & login (hand-out)

Install **Node.js (npm)** first, then:
```
install:   npm install -g @anthropic-ai/claude-code
find path: npm config get prefix
set PATH (PowerShell):
  [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\Users\<user>\AppData\Roaming\npm", "User")
```
Then **open a new terminal**, run `claude`, and sign in.

# FleetLink — design reference (for Module 2.E, UI generation)

These images are the **design reference** for the FleetLink UI — the "how it should look" that the
front-end is generated from and checked against in **Module 2.E**. They stand in for an **exported Figma
frame**: in a real project you would export the relevant frames from the team's Figma file as PNGs and
drop them here; the workflow downstream is identical.

| File | Screen it specifies |
|------|---------------------|
| `vehicles-list.png` | The **Vehicles** list — header, page title, the vehicles table, and the status pill badges (green `Active`, amber `In Maintenance`, grey `Retired`), the primary action button. |
| `work-order-detail.png` | The **Work order detail** — breadcrumb, title, status + priority pills, the derived cost grid (Labour / Parts / Total), the "Change status" and "Add parts used" cards. |

## How these are used (2.E)

The UI is generated from **two inputs — the API contract and this design reference** — and then verified
with the **screenshot feedback loop**: Claude builds the screen, screenshots the running page, compares the
screenshot to the matching image here, fixes the differences, and re-screenshots until they match. Pass the
image to Claude Code as **context in the prompt** (e.g. "build the vehicles screen to match
`docs/design/vehicles-list.png`") — that is how you generate UI **from an image**.

## Notes

- These are **illustrative mockups** (AI-generated). Match the **visual design** — layout, spacing, card
  style, colours, badge treatment, typography — **not** the exact sample data in the picture (the real data
  comes from the seed / API). A couple of labels in the mockups are cosmetic filler.
- The palette matches the design tokens built in 2.E: indigo primary (`#2F5FED`), light-grey canvas, and the
  status/priority colours mapped to the FSD enums.
- Swap these for your own exported Figma frames to retarget the UI to a different brand.

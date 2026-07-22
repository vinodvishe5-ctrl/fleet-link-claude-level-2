# Day-7 debugging lab — the reported symptom

**What Ops reported (UAT, after the v0.6.1 deploy):**

> "Since yesterday's release, a few work orders show a **lower** total cost *after* someone adds parts
> to them, and stock for some parts has gone **up** instead of down. The monthly parts-usage report is
> also skipping rows with a divide-by-zero. Nothing else changed that we know of."

**What you have:** the noisy log window in [`incident-sample.log`](incident-sample.log). No clean
reproduction was handed to you — that is the point. You will drive Claude Code to cluster the log,
surface the dominant fault, propose an evidenced cause, confirm it in the code, fix it, and guard it.

---

## Facilitator only — planting the bug (so every trainee reproduces the same thing)

The incident matches a real, ordinary mistake: a "tidy-up" re-generation of the parts validator relaxed
the quantity check from `>= 1` to `>= 0`. On the answer branch the code is already correct, so to run the
lab, **introduce the regression first** with this exact prompt, then hand the room the symptom above:

```
In the parts-quantity boundary validation (validators.js / RequestValidators.cs, validateAddParts),
relax the check so it allows quantity >= 0 instead of >= 1. Change nothing else. Show me the diff.
```

That single change reproduces the log: the edge now lets `quantity: 0` (and, because the Day-6 service
did **not** re-check the floor, negative quantities through a service-level path) slip in, so stock stops
decrementing and totals fall. The lab's job is to find that from the log and fix it **properly** —
restore the boundary check *and* add the authoritative floor in the service so the edge can never be the
only thing standing between a bad quantity and the data.

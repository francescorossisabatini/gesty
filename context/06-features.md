# Feature Map: Ledger

This file defines *what Ledger does* — the functional scope, organized into a
core ring and a value-add ring. It sits between the product brief (why Ledger
exists) and the design-system work (how it gets built). When a feature decision
is unclear, the design principles in `03-design-principles.md` are the tiebreaker,
and the platform rules in `04-platform-constraints.md` are the boundary.

Scope is deliberately small. Ledger has one user and one purpose: exploring
personal finances on a desktop screen. Features are included only when they serve
that, and explicitly excluded when they belong to a different kind of product
(operational banking app, multi-user SaaS, normative budgeting tool).

## Three data sources, kept distinct

Ledger draws from inputs with different natures, and the design must never blur
them (per principle 2, *honest, not flattering*):

- **Spending** enters primarily via **CSV import** (Curve exports). The CSV contains
  **expenses only — no income**. Automatic flow: drop the file, Ledger parses and
  categorizes. Each spending transaction also
  carries a **derived `base` vs `variable` flag** (recurring vs discretionary) — not
  entered, inferred from a recurrence heuristic (see the data contract / project state
  for the full spec). This feeds the fixed-vs-margin view in Analytics.
- **Manual spending** (added s.21) — the user can also **hand-add an expense** for
  what Curve never sees: cash, a card not aggregated by Curve, a repayment to a friend.
  This is the **exception, not the default** — the import flow stays the low-effort
  norm. A manual expense is real spending in every analytic (totals, category, the
  recurrence heuristic, the fixed-vs-margin and equivalence engine all treat it like
  any other transaction), with three differences from an imported one:
  (1) **origin is marked** — a discreet badge in the table (shape + label, never colour
  alone — same family as the ½ shared marker) distinguishes *fact-you-declared* from
  *fact-imported*. This is the honest-not-flattering principle applied to verifiability:
  an imported row is reconstructible from a bank record, a hand-typed one is only as
  right as your memory, so the interface never dresses the latter up as a measurement.
  (2) **split is chosen at entry** — 100% yours by default, or 50/50 if you mark it
  shared (the one case where split does not come from a card, because there is no card).
  (3) **it lives outside the CSV merge** — re-imports never touch, dedupe, or overwrite
  manual expenses, so there is no doubling. Category is **picked by the user at entry**
  (category chips) — the only case of truly manual categorization rather than
  merchant-derived. Entry point: a **"+ Aggiungi spesa"** modal (same input family as
  "+ Aggiungi entrata" 5a / "+ Aggiungi pack" 5b), reached from Spending.
- **Income** is entered and updated **manually** by the user (salary, gifts,
  refunds) — it is never in the CSV. Each entry can be **recurring** (e.g.
  monthly salary) or **one-off / extraordinary** (e.g. a gift). This is the twin
  of investments: a hand-entered fact source.
- **Investments** are created and maintained **manually** by the user. There is no
  investment CSV. The user records what they are investing and in which "pack";
  a pack's current value is either **live** (units × live price from a price API,
  for quotable assets) or **hand-entered** (manual packs). Contributions are always
  hand-entered.

This split drives everything below: spending is imported fact; income and
investment contributions are hand-entered fact; projections are clearly-marked
estimate. Because Gesty knows both income and spending, it can show a **net
balance** — but only as a descriptive fact, never as a budget verdict or a
spending cap.

## The shared-card model (decided in session 2)

The Curve card ending **••8480 is a shared account** with the user's partner: most
spend on it is theirs together (≈50/50). Curve has no balance and no top-up
records, so Gesty can only model the **split of each expense**, not any pool or
transfer. The rule is **per card**, read from `Card Last 4`:

- Card **••8480 → shared 50/50.** Each expense counts as **half the user's**
  ("your share").
- Every **other card → personal 100%.** Your share = gross.
- **New / unverified cards default to personal 100%** (never assume shared — the
  wrong split would silently distort totals), flagged "new — check split".

Every expense therefore carries **two amounts, both kept**: gross (what left the
card) and your share. **Category totals, the net balance, and projections all run
on your share, not gross.** The transaction table shows both. Split is set once in
a new **Cards settings** screen and applied automatically on every import;
changing it recalculates retroactively.

**The net balance is `manual income − your share of spending`** (gross would wrongly
include the partner's half). Still descriptive only.

### Three row types in the CSV

- **Spend** — positive EUR, money out. Counts at your share (card split applies).
- **Refund** — money back (a returned product). **Follows the split of the card it
  lands on** (½ on ••8480, full on a personal card), so a return cancels its
  purchase symmetrically. Shows as a green "+" inflow. *(Exact CSV shape still to
  be confirmed against a real refund row — observed exports contain none.)*
- **Cashback / points (CPT)** — non-EUR points on the Curve Cash card. Cashback the
  user earns, shown **only as points**, **not spend, not income** — excluded from
  all totals, surfaced separately as "points earned".

See `data-contract-curve-csv.md` for the full parsing contract.

## Ring 1 — Core (spending)

The minimum for Ledger to exist and be useful. With only this ring, Ledger
already answers the Owner's central question ("how much did I spend on X this
month?") and serves the Glancer's 30-second check.

### App scaffold

Persistent left sidebar with the primary navigation; main content area capped at
~1440px and centered in wider viewports. Pointer-driven, desktop-only. This is
not a feature area but the frame every screen lives in.

Sidebar navigation (eight entries): Overview, Spending, Analytics, Categories,
Income, Investments, Import, and **Settings** (set apart at the bottom — config,
not content navigation). Overview and Analytics are deliberately distinct —
Overview is the Glancer's 30-second home (headline + status); Analytics is the
visual environment where charts take over (see Ring 2).

**Settings → Cards** (added session 2): lists every card auto-discovered from CSV
imports, each with a Personal | Shared 50/50 toggle that sets its split. Cashback
cards (Curve Cash / CPT) appear marked "excluded from totals" and are not
splittable. This is where the shared-card model is configured.

### Import CSV

The entry point for all spending data. Without it, every other screen is empty.

- Drop or select a Curve CSV export. The dropzone stays at the top of the screen;
  a history of past imports sits below it (date, file, count) for continuity.
- Parse the real shape of Curve's exports; handle EUR and dd/mm/yyyy.
- Before merging, show a **preview/confirm** step: what will be added, how many
  duplicates were detected, the date range — the user confirms before anything is
  committed (honest; never silently merges).
- Merge into one continuous history across cards, without duplicating
  transactions already imported.
- States: empty (first use), parsing (skeleton screen, not a spinner),
  preview/confirm (review before merge), done (summary: how many added, how many
  duplicates skipped, date range), error (parse failure, clearly explained with
  an icon, not colour alone).

### Spending

The exploratory heart, tuned to the Owner.

- Unified, categorized transaction history in a dense table — tabular figures,
  reduced visual noise, every other row shaded for horizontal scanning.
- Filter by **category** and by **period**, with ready-made period presets
  (this month, last month, last quarter, etc.) so the user never has to "learn
  how to filter".
- Sortable columns and search.
- Automatic categorization, with the ability to correct a transaction's category
  by hand (correctness matters because every insight derives from it).
- Descriptive month-over-month comparison ("this month vs. your average"),
  **not** a normative budget. Ledger shows how it went; it never says "you went
  over".

### Analytics affordance in Spending

Spending stays a clean explorable register — the table is the protagonist, no
dashboard. But at the top it carries a thin **anomaly strip**: 1–2 notable
findings surfaced by importance (e.g. "dining +100% vs last month") plus a "See
analysis" link into Analytics. This is *headline first* applied to insight (the
notable thing is surfaced, not buried) and *depth on demand* (one click opens the
visual environment). The strip is a teaser/gateway, not a dashboard — the rich
analysis lives in Analytics, not here.

### Overview

The opening screen, tuned to the Glancer and embodying *headline first*.

- The single most important figure — current-month spend — large and immediately
  visible, with no click required.
- A few supporting metrics (e.g. weekly average, top category, total this
  month, net balance income − spending). **Observed facts only** — the hero
  never shows projections or a "remaining budget". Smart-but-descriptive is
  welcome (e.g. "12% above your monthly norm" — a fact, not a verdict);
  forward-looking estimates ("at this pace you'll reach…") live in Analytics,
  never in the Overview hero.
- A clear sense of whether things are normal or notable; surface anomalies
  rather than burying them under controls.

Overview is the fast headline (Glancer); deep visual analysis lives in Analytics
(Ring 2), not here. Overview may link into Analytics for the full picture.

### Categories in Ring 1

Not a dedicated screen yet. In the core ring, "categories" means: every
transaction carries its category with a consistent color + icon (already
tokenized in the design system), and the user can filter by category inside
Spending. Color is never the sole carrier of meaning — always paired with label
and icon (principle 5).

## Ring 2 — Value-add

What differentiates Ledger from a plain aggregator. Built after the core ring
works.

### Income (manual)

Income is hand-entered (the CSV has none). Twin of investments in mechanics.

- **Income is always 100% the user's — NO split ever** (corrected session 8). The
  per-card 50/50 split applies ONLY to spending, where the point is isolating the
  user's share of joint expenses. Income has no "your share", no gross, no ½ badge:
  the user records only their own income and does not track the partner's income.
- Each entry: amount, source/label (salary, gift, refund…), date, and a
  **recurring vs one-off** flag. Recurring entries (e.g. €1.500 salary on the
  27th) repeat; one-off entries (e.g. €50 gift) stand alone.
- **Recurring sources live only as cards** (the source), not as a repeated row per
  month — the monthly occurrence is not duplicated as a list entry.
- **Refunds split by origin:** a refund from the **CSV** stays in **Spending** and
  follows the card's split (data-contract rule, unchanged). A refund the user enters
  **by hand** is a normal 100%-theirs income entry in **Income**.
- Income appears (in the one-off list) as an inflow (green, "+" sign — the variant
  already in Transaction Row), kept visually distinct from expenses.
- A single **"+ Add income"** action; the form chooses recurring vs one-off.
- Enables the **net balance** view: `income (100% theirs) − the user's share of
  spending`. Two homogeneous, fully-theirs quantities. Shown as a descriptive fact
  only — never a budget verdict, never a "you can still spend €X" cap. Positive is
  green; negative stays **neutral, never red**.
- A summary of income sources and the month's total in.

### Investments (manual entry, live or manual value)

- Track a small number of packs (2–4), each created and maintained by hand. The
  euro contributions are always hand-entered (no investment CSV exists).
- **Two kinds of pack** (decided session 9):
  - **Live pack** — a quotable asset (e.g. an all-world ETF, Bitcoin). The user
    enters **units/shares** and a ticker; Ledger shows the **live current value =
    units × live price** from an external price API, plus a small daily change.
    Marked with a "● LIVE" badge.
  - **Manual pack** — value not quotable or not wired to a feed; the user enters
    the **current value by hand** (the older model). No live badge.
- Per pack: name, recurring contribution (e.g. €300/month), frequency, optional
  start date, one-off top-ups, and — depending on kind — **units + ticker (live)**
  or **hand-entered current value (manual)**.
- The current value (live or manual) is a **fact**, shown as a transparent raw
  **difference in euro** (current value − contributed), **never** as a flattering
  headline percentage. Up/down uses the success/error tokens. The live value is a
  present-moment fact and groups with the other facts; the projection family stays
  visually separate.
- **Crypto is honestly volatile:** for crypto live packs the projection's scenario
  band will be much wider, and an expected crypto rate is never presented as
  stable as an ETF's.
- **Allocation (descriptive fact, not advice):** show the current mix across packs
  (e.g. ETF/crypto), with an optional target and threshold. A drift past the
  threshold is **highlighted, never actioned** — Ledger does not tell the user to
  rebalance (that would be normative and amount to automated financial advice,
  out of scope per principle 2). The user sees and decides.
- A summary view of the packs.

### Projection

- From the entered pack data, project plausible future outcomes. The projection is
  **aggregated** (one curve across all packs) but computed **per pack then summed**
  (an ETF and crypto grow differently; a single blended rate on the total would be
  less honest).
- The solid history curve is **cumulative contributed capital** (each contribution
  month is a point: €300/mo → 300, 600, 900…). The **current value sits as a point
  above the end of the contributed line** — the vertical gap *is* the raw
  difference. The dashed projection starts from that current-value point.
- **Math shown:** per-pack FV = V0·(1+r)^t + C·[((1+r)^t − 1)/r], summed across
  packs. Exposed in an expandable "show the math" panel (closed by default).
- **Confidence band = ± rate scenarios** (e.g. central 6%, band 4–8%), labelled
  with the rates — a scenario range, not a statistical interval.
- Assumptions (contribution amount, growth rate, horizon 10/20y) are visible and
  editable. Chart with solid recorded history and a dashed/patterned projection
  over the band — fact and estimate always visually distinct.
- Scenarios can be compared.

### Analytics (visual environment)

The home of analysis, distinct from Overview. Where Overview is the Glancer's
30-second headline, Analytics is the Planner's space: charts take over and
support understanding of trends rather than individual transactions.

- Accumulated spend over time, comparisons across periods (this month vs.
  previous, vs. same month last year), moving averages.
- Spending-pace projections ("at this pace the month closes around €Y"), always
  marked as estimate (estimate token family, math shown) — never presented as
  fact, never as a budget verdict.
- Descriptive what-if relations between the user's own numbers (e.g. "food
  averages €320/month, your largest category; trimming it frees that amount for
  elsewhere"). Illuminates a real relationship; never prescribes.
- Category breakdown and trend per category, surfaced visually.
- **Fixed-vs-variable spend and margin** ("Spese fisse e margine"): splits spending
  into a recurring **base** (rent, subscriptions, bills) and a **variable** part, so the
  remaining **margin** (income − base) is visible. Base is **derived**, not entered — see
  the recurrence heuristic below. Margin low → stays neutral, never red (descriptive, not
  a budget). On thin history (< 3 months) the band shows an explicit "in apprendimento"
  state rather than a misleading figure.
- Notable findings / anomalies highlighted by importance — the same ones teased
  in Spending's anomaly strip link here for the full picture.
- Reached from Spending via the anomaly strip's "See analysis" link, and from the
  sidebar directly.
- Comparisons stay descriptive, never normative (no budget verdicts).

### Spending enrichments

- Smart charts: category breakdown, month-over-month, weekly-average sparkline.
- Fluid drill-down: click a category to see its transactions; change the period
  to see the trend; hover tooltips on chart data points.
- **Merchant enrichment**: read and group spending by merchant (from the Curve
  description), not only by category — often closer to how the user recognizes
  their own activity.

### Categories (dedicated)

A standalone categories view with totals, share-of-spend percentages, and trend
per category — if it proves useful beyond the basic filter in Spending.

## Out of scope (and why)

These appear in generic "personal finance dashboard" best-practice lists but do
not belong in Ledger:

- **Normative budgets and goal tracking** ("budget vs. actual", goal progress
  bars, "you can still spend €X"). Ledger is an exploration tool, not a budgeting
  authority; the Owner distrusts opinionated apps. The net balance (income −
  spending) is shown as a descriptive fact, never as a cap or verdict.
- **Real-time notifications, quick actions, money transfers** — operational
  banking patterns. Ledger does not move money and does not nag.
- **Login, multi-user accounts, data-security product features, mobile/tablet
  handoff** — Ledger is a single-user, desktop-only tool reading local CSV
  files. No mobile or responsive-down requirement exists.
- **Internationalization beyond EUR / European formatting** — single user,
  single locale.

## Build order

Ring 1 first, by foundations: app scaffold and UI primitives (button, category
badge/chip, input, filter chip, period selector) before composites (transaction
row, metric card with the headline figure, CSV dropzone, feedback banner,
skeleton). Ring 2 follows once the core screens stand.

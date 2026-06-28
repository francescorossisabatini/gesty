# User Personas: Ledger

> Note: Ledger has exactly one real user — the builder. The Primary persona below
> is that real user and is the one that matters. The Secondary and Tertiary personas
> are **design pressure-test variants**: not real people, but plausible "modes" the
> same user falls into, used to make sure the design holds up under different
> intensities of use (a quick glance vs. a deep planning session). They keep the
> design from being tuned only to one mood.

---

## Primary Persona: The Owner

**Age:** Adult, working
**Location:** Eurozone (EUR, dd/mm/yyyy)
**Role:** The builder and sole user — manages their own money, several cards consolidated through Curve, and a regular investment habit
**Devices:** Desktop (the only target surface). Comfortable with a large screen and a mouse/keyboard.
**Tech comfort:** High. Builds the tool, exports and imports CSVs, reads charts fluently, understands that projections rest on assumptions.

### Who they are

The Owner runs their financial life across multiple cards but doesn't want to think across multiple apps. They already pull everything into Curve, export it as CSV, and want a single desktop place where those rows become understanding. They invest regularly — a fixed monthly contribution into a broad, all-world ETF — and they're not chasing a live performance ticker; they want to know, in plain math, what steady contributions could become over time. They're the kind of person who'd rather see the formula than a flashy "+12.4%" with no context.

They sit down with Ledger deliberately, on a real screen, to explore — not to be nagged by notifications. The point is clarity and agency over their own numbers.

### Goals

- See all spending across every card in one merged, categorized history.
- Quickly answer concrete questions: average weekly spend, this month's spend in a given category, how a category is trending.
- Track how much they've actually put into investments, separate from spending.
- Get a transparent, math-based sense of where regular investing could lead — without false precision.
- Explore freely, following curiosity, rather than reading a fixed report.

### Pain Points

- Spending data is scattered across several card apps; even Curve consolidates but doesn't *explain*.
- Existing budgeting apps are opinionated, subscription-based, and weak on forward-looking investment math.
- "Performance" dashboards show a number without showing the reasoning, which they don't trust.
- Manual categorization and report-building is tedious; they want answers, not spreadsheet labor.

### How they use Ledger

Periodic sessions at the desktop: export fresh CSV from Curve, import it, let Ledger categorize, then move through the charts — checking the month so far, scanning category breakdowns, and occasionally opening the investments view to update contributions and look at the projection. Sessions are exploratory and can run long when they're in a planning mood.

### What matters to them in the experience

- **Fluid exploration** — moving between categories, periods, and views without friction or report-building.
- **Honest numbers** — real spending shown as fact; projections clearly marked as estimates with visible assumptions.
- **Calm density** — a lot of information, but legible and unhurried, never a wall of figures.
- **Trustworthy import** — CSV from Curve in EUR / dd-mm-yyyy gets parsed and merged correctly every time.
- **Smart, not just descriptive** — charts that estimate and summarize, not only plot.

---

## Secondary Persona: The Glancer (quick-check mode)

**Age:** Same user, different mode
**Location:** Eurozone
**Role:** The same owner, but here in a "30-second check" frame of mind
**Devices:** Desktop
**Tech comfort:** High

### Who they are

This is the Owner on a normal day, not a planning day. They open Ledger to answer exactly one question — "how much have I spent this month?" or "am I over on dining?" — and then close it. They don't want to dig; they want the headline number to be the first thing their eye lands on. This mode exists to keep the design honest: if the dashboard only rewards deep exploration and buries the headline, it fails this mode.

### Goals

- Get the single most important number (current month spend, vs. typical) at a glance.
- Confirm nothing is wildly off without analyzing anything.

### Pain Points

- Dashboards that force navigation before showing the basic state.
- Headline numbers buried under controls, filters, or charts that need setup.

### How they uses Ledger

Opens, reads the top-of-dashboard summary, closes. Under a minute. No imports, no filtering.

### What matters to them in the experience

- **Immediate headline** — key figures visible without a click.
- **At-a-glance status** — clear whether things are normal or notable.
- **No setup tax** — the default view is already useful.

---

## Tertiary Persona: The Planner (deep-session mode)

**Age:** Same user, different mode
**Location:** Eurozone
**Role:** The same owner in a deliberate, long planning session
**Devices:** Desktop
**Tech comfort:** High

### Who they are

This is the Owner with an hour and a question about the future: "if I keep putting €300/month into the all-world ETF, where could that be in ten years?" They want to adjust assumptions, compare scenarios, cross-reference spending trends against what they can afford to invest, and sit with the projections. This mode pressure-tests the *other* end of the spectrum: the design must reward depth — adjustable assumptions, visible math, multi-series charts — without becoming overwhelming.

### Goals

- Model future investment outcomes under stated, adjustable assumptions.
- Relate spending trends to investing capacity.
- Explore scenarios and understand the math behind each projection.

### Pain Points

- Projection tools that hide their assumptions or won't let you change them.
- No clear separation between factual history and estimated future.
- Shallow tools that can't go deeper when you want them to.

### How they uses Ledger

Long, focused session: imports the latest data, reviews spending trends, opens investments, tweaks projection assumptions, compares scenarios. Deep and unhurried.

### What matters to them in the experience

- **Adjustable, transparent projections** — assumptions visible and editable, math shown.
- **Fact vs. estimate kept distinct** — never confuse spent with projected.
- **Depth on demand** — the interface goes as deep as the question without clutter when it isn't needed.
- **Connected views** — spending and investing legible against each other.

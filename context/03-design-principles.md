# Design Principles: Ledger

These principles guide every design decision in Ledger. They describe how the
experience should *feel* and how to resolve tradeoffs — not how it should look.
Colors, fonts, spacing values, and other visual direction are decided separately
(in the platform constraints and through the design work itself). When a design
choice is unclear, these principles are the tiebreaker.

## 1. Explorable, not reportable

Ledger is for moving through your money, not reading a fixed printout. Every view should invite the next question — click a category to see its transactions, change the period to see the trend, follow curiosity without building anything. The Owner's core want is fluid exploration; if a task requires assembling a report before getting an answer, the design has failed. Default to direct manipulation over configuration.

## 2. Honest, not flattering

Real spending is shown as fact; projections are shown as estimates, and the two must never blur. The Owner explicitly distrusts a confident "+12.4%" with no reasoning behind it. Forward-looking investment numbers must wear their uncertainty openly — assumptions visible, math shown, estimates visually distinct from recorded history. Never dress an assumption up as a measurement.

## 3. Calm, not crowded

Personal finance data is dense by nature — many transactions, many categories, several time horizons. A desktop screen has room, but room is not permission to cram. Information density should feel unhurried and legible: clear hierarchy, generous spacing, restraint with color. The Glancer must find the headline instantly; the Planner must be able to go deep — neither should meet a wall of figures.

## 4. Headline first, depth on demand

The single most important number should be the first thing the eye lands on, with no click required (the Glancer mode), while deeper analysis stays one step away for when it's wanted (the Planner mode). Surface the summary by default; reveal detail progressively. The interface should be useful in thirty seconds and rewarding for an hour.

## 5. Meaning beyond color

Categories, fact-vs-estimate, and trends are easier to read with color — but color is never the *sole* carrier of meaning. Pair it with labels, icons, shape, or position so the interface stays legible and accessible regardless of how color is perceived or rendered. This keeps a category-coded, chart-heavy interface trustworthy.

## 6. One tool, one feeling

Spending history and investment projection live by different rules — one backward and factual, one forward and assumption-based — but they belong to the same calm, coherent surface. Charts, tables, summaries, and the import flow should feel like parts of one instrument, not separate apps stitched together. Consistency across these surfaces is what makes a single dense dashboard feel like a reading room rather than a control panel.

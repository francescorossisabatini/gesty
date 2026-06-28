# Platform Constraints: Ledger

## Platforms

Ledger is **desktop-first and desktop-only**. There is a single user on a single surface — a real desktop screen with a mouse and keyboard. There is no mobile, tablet, or responsive-down-to-phone requirement. Design for the desktop experience without compromising it for smaller screens that won't exist.

- **Desktop (web or app, large screen)** — the only target. Primary and sole surface.
- **Mobile / tablet** — out of scope.

## Layout Model

Ledger is a single-surface dashboard, not a multi-page mobile app. Use a persistent layout built for wide screens:

- **Persistent left sidebar** for primary navigation (overview, spending, categories, investments, import).
- **Main content area** for the active view (summary, charts, transaction tables, projections).
- Primary actions live in the sidebar and in-context within views — no bottom navigation, no thumb-zone constraints (this is a pointer-driven interface).
- Hover interactions are welcome here (tooltips on chart data points, hover states on rows) because the surface is pointer-driven, not touch.

**Design implications:**
- Layouts are designed for wide viewports first; there is no mobile-width fallback to honor.
- Make use of horizontal space: side-by-side panels, multi-column summaries, charts beside their controls.
- Cap the maximum content width so wide monitors don't stretch content into illegibility.

## Screen Sizes

Design target is the desktop range. Lay out for these widths:

- **Compact desktop:** 1024–1280px (smaller laptops) — supported, the floor.
- **Standard desktop:** 1280–1440px — the primary design target.
- **Wide desktop:** 1440px+ — common; content max-width caps here, the rest becomes margin. Don't stretch infinitely.

## Spacing System

Use a 4px base unit. All spacing values should be multiples of 4.

**Recommended scale:**
- 4px (micro: icon-to-label gaps)
- 8px (tight: within compact components)
- 12px (small: padding inside cards, list/table row gaps)
- 16px (base: standard padding, gaps between elements)
- 20px (medium: between related groups)
- 24px (comfortable: section padding, card padding)
- 32px (large: between major dashboard sections)
- 40px (extra large: page-level spacing)
- 48px (jumbo: major separations between panels)
- 64px (max: top-level page margins / sidebar-to-content separation)

Given the "calm, not crowded" principle, lean toward the generous end of this scale for section separation, even though the data is dense.

## Grid

Desktop dashboard grid:

- **Sidebar + main content** layout. Sidebar a fixed/comfortable width; main content fluid up to the cap.
- **Max content width:** ~1440px for the main content area, centered within wider viewports.
- Outer margins: 32–64px.
- 12-column grid with 24px gutters within the main content area, so summary cards, charts, and tables align to a shared rhythm.
- Multi-column arrangements are encouraged (e.g. summary cards in a row, chart beside its filters) — this is what the desktop surface is for.

## Typography Constraints

- Minimum body text: 16px (this is a desktop reading surface).
- Minimum caption / helper text / dense table text: 12px — used sparingly, only where density genuinely demands it (e.g. axis labels, secondary table columns).
- Numeric data (amounts, dates, axis values) should use **tabular / lining figures** so columns of numbers align — important for a finance dashboard with many transaction rows.
- Line height: 1.4–1.6 for body text (keeps dense dashboards legible and unhurried).
- Maximum line length: 65–75 characters for any prose (rare here, but applies to explanatory text on projections).
- Font loading: system fonts as fallback; any custom fonts should be subset and preloaded.

## Color Constraints

- All color combinations must meet WCAG 2.1 AA contrast ratios (4.5:1 for body text, 3:1 for large text and UI components).
- **Color is never the sole indicator of meaning.** Spending categories, the fact-vs-estimate distinction, and chart series must each be distinguishable by label, icon, shape, or pattern as well as color (per design principle 5). This matters especially in charts and category-coded views.

## Performance Constraints

- The interface must stay responsive while parsing and rendering large CSV imports and many transaction rows — virtualize long tables rather than rendering thousands of rows at once.
- Chart rendering should remain smooth when switching periods/categories during fluid exploration.
- Animations should respect `prefers-reduced-motion`.
- Skeleton screens preferred over loading spinners while a CSV import is parsed and categorized.
- No offline/sync concerns: data comes from local CSV imports, not a live backend.

## Data & Localization

- **Currency:** EUR throughout. Format amounts in European convention.
- **Dates:** European format, dd/mm/yyyy. CSV import (from Curve) must parse this format reliably; all displayed dates follow it.
- **Numbers:** locale-appropriate decimal/thousands separators for the Eurozone.
- **CSV import contract:** the primary import source is Curve CSV exports (multiple cards consolidated). The parser must tolerate the real shape of Curve's exports and merge multiple imports into one continuous history without duplicating transactions.
- Internationalization beyond EUR / European formatting is **not** a requirement — single user, single locale.

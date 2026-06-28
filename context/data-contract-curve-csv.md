# Data Contract — Curve CSV (real export, observed)

> Correction note based on the actual `Transactions.csv` export. Supersedes the
> earlier assumptions in `01-product-brief.md`, `04-platform-constraints.md`, and
> `06-features.md` about the CSV shape. Fold these points into those files.

## Real column structure (14 columns)

| # | Column | Notes |
|---|--------|-------|
| 1 | Export Format | Always "CSV" — ignorable. |
| 2 | **Date (YYYY-MM-DD as UTC)** | **ISO format, UTC — not dd/mm/yyyy.** |
| 3 | Time (HH:MM:SS as UTC) | Separate time column, UTC. |
| 4 | Merchant | Raw merchant string (e.g. "Cafe+co At 311175", "SPAR"). Basis for merchant enrichment. |
| 5 | Txn Amount (Funding Card) | The amount. Decimal point (e.g. 8.45). |
| 6 | Txn Currency (Funding Card) | Mostly EUR, but **not always** — e.g. "CPT" (Curve points / cashback). |
| 7 | Txn Amount (Foreign Spend) | Often empty; populated only for foreign-currency spend. |
| 8 | Txn Currency (Foreign Spend) | Often empty. |
| 9 | Card Name | e.g. "Visa Debit", "Curve Cash". Multi-card is real. |
| 10 | Card Last 4 Digits | e.g. 8480. Empty for Curve Cash. |
| 11 | Type | e.g. "Personal". Can be empty. |
| 12 | **Category** | **Curve provides a native category** (e.g. "Food & Drink", "Groceries"). Can be empty. |
| 13 | Notes | Usually empty. |
| 14 | Fees | Usually empty. |

## Corrections to the context files

1. **Dates are ISO `YYYY-MM-DD` (UTC), with a separate time column** — NOT
   dd/mm/yyyy. The parser reads ISO. The app still *displays* dates in European
   dd/mm/yyyy convention. (Fix in `01` "Key Numbers" and `04` "Data & Localization".)

2. **Category is provided by Curve, not derived from scratch.** Gesty's job is to
   **map** Curve's category strings (e.g. "Food & Drink", "Groceries") onto its own
   8 category tokens, and to handle **empty** categories (fallback → "Other" /
   uncategorized). The earlier "automatic categorization" framing should read as
   "map + normalize Curve's category, with a fallback for blanks." (Fix in `01`
   "Automatic categorization" and `06`.)

3. **Not every row is EUR.** Currency column can hold non-EUR values like "CPT"
   (Curve points / cashback). The parser must decide how to treat non-EUR rows
   (e.g. exclude cashback/points from spend totals, or surface them separately).
   The "EUR throughout" assumption needs a caveat. (Fix in `04` "Data &
   Localization" and `06` "three data sources".)

4. **Merchant is a first-class raw field** (col 4) — already messy ("Cafe+co At
   311175"). Confirms merchant enrichment (Ring 2) reads this column. (Note in `06`.)

5. **Foreign Spend columns exist** (7–8) but are usually empty — only populated
   for foreign-currency transactions. Useful later, ignorable for Ring 1.

## Shared-card split (the "couple" model)

Some of these cards are a **shared account** between the user and their partner —
both top it up, and most spend on it is theirs together (≈50/50). Curve has **no
balance and no top-up records** (it routes transactions between cards and tracks
cashback only), so Gesty never sees who funded what. The only honest thing Gesty
can model is therefore the **split of each expense**, not any pool or transfer.

**The rule is per card, read from `Card Last 4` (col 10):**

- Card ending **8480** → **shared, 50/50.** Each expense on it counts as **half
  the user's** ("your share").
- Every **other card** → **personal, 100%.** Your share = gross.

This is a card→split **mapping** applied at import time. It is derived from a real
CSV field, not from manual per-transaction tagging (keeps it honest and low-effort).
**Exception (s.21):** a manually-added expense has no card, so its split is **chosen
at entry** (100% default, or 50/50 if marked shared) rather than mapped from col 10.

**Two amounts per transaction, both kept:**
- **Gross** — what actually left the card (the hard fact; never hidden).
- **Your share** — gross × your-split (50% on ••8480, 100% elsewhere).

**Which one analytics use:** category totals, the net balance, and projections all
run on **your share**, not gross. The transaction table shows both (your share as
the primary figure, gross as a smaller "di €…" above) and marks shared rows with a
**½ split** badge — shape + label, never colour alone.

**Net balance** is then `manual income − your share of spending` (gross would wrongly
include the partner's half). Still descriptive only, never a budget verdict.

**Open items for later:**
- A small **card → split settings** view (map each Card Last 4 to its split %).
  For now ••8480 = 50/50 is the single rule; settings UI is not yet in the feature map.
- Per-transaction **override** for rare exceptions (a personal purchase made on the
  shared card, or vice-versa) — out of scope for the first pass.

## Row types: spend, refund, cashback

A CSV row is one of three kinds, distinguished by sign and currency:

**1. Spend** — positive EUR amount, money leaving the card. Counts toward the
category total at **your share** (card split applies: ½ on ••8480, full elsewhere).

**2. Refund** — money coming back (a returned product). **CSV shape still
unconfirmed:** the observed exports contain no refund row — amounts are all
positive, `Type` is only "Personal" or blank, and no sign/flag marks a return. So
the parser's refund-detection rule (negative amount? a `Type`/Notes keyword? a
merchant pattern?) **must be determined from a real refund row when one appears.**
Provisional assumption: a negative EUR amount. A refund **reduces** the total of
the *same category* it relates to and shows in the table as an inflow (green, "+"
sign — the inflow variant of Transaction Row).

> **Refunds follow the split of the card they land on** — same rule as spend.
> A refund onto the shared card ••8480 is split 50/50 (mirrors the original shared
> purchase); a refund onto a personal card is 100% the user's. This keeps the books
> clean: a return cancels its purchase symmetrically, leaving no phantom credit for
> either person. (This supersedes an earlier draft that made refunds always 100%
> the user's — that asymmetry was rejected.)

> **CSV refund vs hand-entered refund (clarified session 8).** The split rule above
> applies to refunds that arrive **in the CSV** — they belong to Spending and follow
> the card's split. A refund the user enters **by hand** is not a CSV row at all: it
> is an ordinary **Income** entry, 100% the user's (Income never splits). So origin
> decides: CSV refund → Spending (card split); manual refund → Income (100%).

**3. Cashback / points (CPT)** — non-EUR currency "CPT" on the "Curve Cash" card
(merchants often prefixed "Curve Cash: …"). These are **cashback points the user
earns**, later converted to real euros — but Gesty treats them **only as points**,
never as euros. **Not spend, not income.** Excluded from category totals, net
balance, and projections. Surface them **separately as "points earned"** (a points
tally, distinct from the EUR spend world), never mixed into spend math. Observed
values vary widely (e.g. 2, 7, 21, 23, 168 CPT) and do not track the EUR amount of
any related purchase, confirming they are a separate points stream.

**Card-settings implication:** the cashback card (Curve Cash) appears in the
card→split settings list but is **marked "cashback · excluded from totals"** and is
**not** assignable a personal/shared split — it isn't real spend, so a split would
be meaningless.

**New / unverified cards** default to **personal 100%** (never assume shared —
assuming the wrong split would silently distort totals), flagged "new — check split"
until the user confirms.

## What stays true
- Multi-card aggregation via Curve is real (Card Name + Last 4).
- Expenses-only in the CSV (no income) — income stays manual. Confirmed: no income rows.
- **Spending is fact, but of two origins (s.21):** **imported** (the norm, from the
  Curve CSV — reconstructible from a bank record) or **hand-added** (the exception —
  cash, non-aggregated cards, repayments Curve cannot see). A manual expense counts as
  real spending everywhere (totals, your-share, category, recurrence, Analytics), but
  its **origin is marked** in the table (discreet badge, shape + label, never colour
  alone — same family as the ½ marker), so a declared fact is never shown as a measured
  one. Manual expenses live **outside the CSV merge** — a re-import never touches or
  dedupes them. Split is chosen at entry (100% / 50-50), category is picked at entry.
- **Income is always 100% the user's — it never splits.** The per-card 50/50 split
  applies ONLY to spending (and to CSV refunds, which belong to Spending and follow
  the card's split). Income has no "your share", no gross, no ½ badge. Origin decides:
  a **CSV refund → Spending** (card split); a **hand-entered refund → Income** (100%).
  The net balance is therefore `income (100% theirs) − your share of spending` — two
  homogeneous, fully-theirs quantities.
- Amounts use a decimal point in the raw file; display still follows EUR convention.

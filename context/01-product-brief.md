# Product Brief: Ledger

## What is Ledger?

Ledger is a desktop dashboard for exploring your own personal finances. You drop in CSV exports of your spending — primarily from Curve, which aggregates several cards into one feed — and Ledger categorizes the transactions, surfaces the patterns, and turns the raw rows into charts you can move through fluidly. Alongside spending it tracks money you've put into investments — for quotable assets it shows the **live current value** (units × live price), as a plain fact — and projects plausible future outcomes using simple, transparent math rather than opaque "performance" numbers.

Think of it as a calm reading room for your money: instead of logging into five apps, you sit in one place and actually *understand* where it goes and where it's heading.

## The Origin Story

Ledger is a personal project, built in 2026 by and for a single user. It exists because the everyday alternatives — bank apps, card apps, budgeting SaaS — each show a sliver of the picture and none of them let you *explore* freely. The transactions live across multiple cards (collected through Curve), the investments live somewhere else, and nothing connects spending habits to a forward-looking view. Ledger is the attempt to put all of it under one roof, on a real desktop screen, with charts smart enough to answer questions instead of just displaying numbers.

## Key Numbers

- **Users:** 1 (the builder is the only user — this is a tool for personal use, not a product with an audience).
- **Primary data source:** CSV exports from Curve (multi-card aggregation).
- **Currency:** EUR.
- **Date format:** European (dd/mm/yyyy).
- **Platform:** Desktop, single surface.

## What You Can Do

- **Import spending via CSV:** Drop Curve CSV exports into an import section. Ledger parses them, handles the EUR / dd-mm-yyyy format, and merges them into one transaction history across all your cards.
- **Automatic categorization:** Transactions are sorted into spending categories (groceries, transport, dining, subscriptions, etc.) so you don't tag everything by hand.
- **Fluid exploration:** Move through your finances by category, by time period, and by trend — answering questions like "how much did I spend on category X this month" or "what's my average weekly spend" without building a report each time.
- **Smart charts:** Visualizations that summarize (averages, category breakdowns, month-over-month) and that estimate where things are heading, not just where they've been.
- **Investment tracking:** Record money you've invested (e.g. €300/month into an all-world ETF). A pack can be **live** (you enter units/shares and a ticker, and Ledger shows the live current value = units × live price, pulled from an external price API) or **manual** (you enter the current value by hand). Either way the live/current value is shown as a **fact** — a plain figure, never a celebratory "+12.4%". The euro contributions you've made are always kept (they drive the contributed-capital curve). Distinct from the forward projection, which is clearly marked as estimate.
- **Forward projections:** For tracked investments, project plausible future outcomes using transparent mathematical assumptions (e.g. what regular contributions into a broad ETF could grow into under stated growth assumptions), with the math shown rather than hidden.

## Business Model

None. Ledger is a personal tool with no monetization, no users to acquire, and no pricing. The only "cost" is the builder's time and the discipline of keeping CSV imports current.

## The Design Challenge

The hard part isn't audience spread — there's one user. It's **density done calmly**. Personal finance data is inherently busy: many transactions, many categories, multiple time horizons, plus a forward-looking investment view that lives by different rules than spending history. On a desktop screen there's room to show a lot at once, and the temptation is to cram. The challenge is to make a dense, multi-faceted dataset feel *explorable* — where one glance gives the headline and one click goes deeper — without it becoming a wall of numbers or a toy that hides the real figures.

A second tension: spending (backward-looking, factual) and investment projection (forward-looking, assumption-based) must coexist without blurring. A live pack value sits between them — a present-moment fact, not a forecast — so it groups with the facts, never with the estimate. The user should never confuse "what I spent" or "what my investments are worth now" with "what they might become." The design has to keep certainty and estimation visually distinct.

The design system needs to:
- Support a **desktop-first, single-surface** layout with a persistent sidebar + main content area, built for wide screens (1280px+), capping content width so it doesn't stretch infinitely.
- Handle **data-dense displays**: tables of many transactions, multi-series charts, category breakdowns — legibly, with clear hierarchy.
- Provide a **visual language that distinguishes fact from estimate** (actual spending vs. projected investment outcomes).
- Support a **category token system** rich enough to color-code spending categories and an investments view consistently.
- Make charts the primary medium, so chart styling, axis/label typography, and color-coding are first-class parts of the system, not an afterthought.
- Stay calm and readable through high information density — generous spacing, restrained color, color never the *sole* carrier of meaning.

## Competitors & Context

Ledger sits in the gap between three things the user already has access to: card/bank apps (accurate but siloed and read-only), aggregators like Curve (consolidate transactions but don't explore or project), and budgeting SaaS (opinionated, subscription-based, and weak on investment projection). What differentiates Ledger is that it's a personal desktop *exploration* tool: it owns no data of its own, makes no money, and optimizes purely for one person understanding their own money — combining real spending history with transparent, math-based forward projection in a single calm interface.

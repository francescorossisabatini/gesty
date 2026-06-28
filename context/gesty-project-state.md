# Gesty — Project State (living document)

**Single source of truth for project status.** Update this file at the end of every
session instead of creating a new handoff. Re-upload to the Claude project after each
update (outputs are not auto-synced). Pairs with `06-features.md` (functional scope)
and the context files (brief, personas, principles, constraints, data contract).

- **Figma file:** "Gesty", fileKey `hQGAgeXPxRATvpen8gE9d2`. Two pages: **"Design System"**
  (tokens + component library) and **"Screens"** (assembled screens).
- **Last updated:** Session 21.

---

## How we work

Decision-driven. Claude presents options (HTML previews via `visualize:show_widget`
+ `ask_user_input_v0`), runs a UX audit before building, and builds in Figma only
after explicit confirmation. Design principles in `03-design-principles.md` are the
tiebreaker; platform rules in `04-platform-constraints.md` are the boundary.

**MCP caution:** the figma-console connection is fragile. Always verify with a
lightweight query (`figma.root.name`) before any write. Timeouts of 5–7s are often
false negatives — the op usually completed; verify before retrying. Bridge
occasionally lands on the wrong file ("Yummy Labs…" `omzFVUv3jp3Sf75pziblwK`); if so,
`figma_navigate` to
`https://www.figma.com/design/hQGAgeXPxRATvpen8gE9d2/Untitled?node-id=0-1`.
For `str_replace`, always pass the path explicitly (silent failures otherwise).

---

## Where we are

Giro 1 design system complete (all token-bound, zero hardcoded). Component library
complete. **EVERY sidebar entry now has a screen.** Built screens on the "Screens" page:

- **`Overview / Default`** (`47:515`) — session 4.
- **`Spending / Default`** (`49:622`) — session 5.
- **`Settings / Cards`** (`49:1023`) — session 5.
- **`Overview / Empty`** (`49:1197`) — session 5, first-use empty state.
- **`Import / Preview`** (`53:1320`) — session 6, preview/confirm step. **Ring 1 complete.**
- **`Analytics / Default`** (`55:1696`) — session 7, revised session 11, **rebuilt session 20** (4 nuove bande, riconcettualizzazione completa).
- **`Income / Default`** (`64:1200`) — session 8.
- **`Investments / Default`** (`67:1523`) — session 9.
- **`Categories / Default`** (`70:1886`) — session 11, last Ring 2 screen. **All sidebar
  entries now covered.**

Token system verified AI-readable at session 11 start: 232 vars across 3 collections,
zero missing descriptions / code-syntax / broken aliases / bad scopes; 10 text styles +
4 effect styles all described. Fully clean.

The only known colour defect (`accent/category-other` 2.48:1) was **fixed in
session 5**: primitive `category/other` darkened #94A1AE → **#7E8B98**, contrast on
the page background now **3.27:1** (AA pass). The colour system is now fully clean.

**Token system is COMPLETE and in use** — see "Design system / tokens" below.

---

## Component library (built, on the Design System page)

All token-bound, with native Dev Mode annotations + component-set descriptions.

**Pagina "Design System" RIORDINATA (session 14)** per presentazione a stakeholder:
8 Section nominate in colonna (gap 160), dal generale al particolare, zero nodi orfani
(da 66 nodi sparsi + detriti a 8 sezioni pulite): **00 · Overview** (frame Reference token:
background/foreground con ratio AA, accent categoria, typography in contesto, spacing/radius/
elevation, fatto-vs-stima) · **01 · Foundations** (card esplicativa: 232 var / 3 collezioni,
brand teal, 10 text + 4 effect style, AA — le variabili vivono nel pannello Variables, non sul
canvas) · **02 · Primitives** (Button, Icons raggruppate nav/category/action, Category Badge,
Filter Chip, Input, Period Selector ×3) · **03 · Data display** (Transaction Row/Header, Metric
Card, Net Balance, Card, Import History, Card Settings, Income Source, Investment Pack) ·
**04 · Charts** (Chart Container) · **05 · Feedback & states** (Feedback Banner, Table Skeleton,
CSV Dropzone, Anomaly Strip) · **06 · Navigation & brand** (Sidebar Nav Item, Sidebar, Gesty
Logo) · **07 · Dev Notes** (Button, Anomaly Strip). Ogni componente con etichetta, ogni sezione
con titolo teal. Detriti rimossi: frame `plot`, 2 `Vector` orfani, testo "Not split" — tutti a
(0,0). `Income Source Card` (era orfano a 0,0) riposizionato in Data display.

**Primitives:** Button · Category Badge · Filter Chip (`95:3234`, **refactor s.16**) · Input ·
Period Selector (Trigger / Menu / Popover).

**Filter Chip (`95:3234`, REFACTOR session 16).** Rifattorizzato da 24 varianti (8 Category ×
3 State, categoria cablata) a **architettura `State`-only** = default / hover / selected /
**disabled** (4 varianti) + **component property testo `label`**. La categoria (label + colore
pallino) è ora impostata **per istanza** → il set si adatta a qualunque categoria emerga dal
labeling del CSV importato (motivazione utente). **Larghezza hug-content** (era FIXED 120px →
"subscriptions"/"Abbonamenti" sforava; ora il pill si adatta alla label, ~72–121px). Fill/stroke
di ogni stato sono categoria-indipendenti (vivono nelle 4 varianti); il SOLO override per-istanza
è il colore del pallino (`accent/category-{cat}`, gemello `-on-dark` nello stato selected).
**`State=disabled`** (categoria senza transazioni nel periodo): pallino neutro `foreground/disabled`
+ testo `foreground/disabled` + opacità 0.6, niente barrato — mai colore da solo. **12 istanze
ricablate** (4 su Spending Filter Bar, 8 su Categories selettore) con **label italianizzate**
(Spesa · Ristoranti · Trasporti · Abbonamenti · Acquisti · Salute · Casa · Altro) e pallini
legati ai token categoria; i contenitori sono in auto-layout, ridistribuiti da soli. **Vecchio
set a 24 varianti (`12:1129`) ELIMINATO** (0 istanze live verificate). Il "+N overflow" su
Spending resta un chip bespoke (audit [BASSA], non promosso). Nota selected: il fill è neutro
scuro (`background/inverse`), NON il colore categoria pieno — il colore-categoria nel selected è
portato dal solo pallino (`-on-dark`). Token-bound, descrizione sul set.

**Icon set (~32 components, `icon/{group}/{name}`):** nav, category, action groups.
Inner SVG frames are `SCALE/SCALE`. `icon/nav/tag` (`47:887`) and `icon/nav/coin`
(`47:890`) added session 4.

**Composites:** Transaction Row (+ Table Header) · Metric Card (Hero / Support) ·
CSV Dropzone · Feedback Banner · Table Skeleton · Anomaly Strip (`32:482`) ·
Sidebar Nav Item (`33:531`) · Card (`34:548`) · Import History Row (`36:577`) ·
Chart Container (`38:652`) · Net Balance Display (`38:665`) · Card Settings Row
(`45:632`) · **Income Source Card (`64:1434`, session 8)** · **Investment Pack Card
(`73:2373`, session 11)** · **Gesty Logo (`80:2540`, session 12)** · **Sidebar (`86:2976`, session 14)** · **Curiosity Card (`93:3114`, session 15)**.

Notable component behaviours:
- **Transaction Row** (`20:1348`) carries the shared-card model: your share as the
  primary figure, gross floating above ("di €…") on shared rows, a ½ split marker
  after the merchant, single amount on personal rows. Gross is absolute-positioned
  so all primary figures align across shared + personal rows.
  **Structural limit RESOLVED session 11:** the `State=alt` (shaded) variant now
  carries the full shared structure (`split-marker` + absolute `gross`), cloned from
  `default` so the token bindings match. A shared row can now sit on ANY stripe
  (shaded or not) in a zebra table — the per-stripe constraint is gone. (Screens
  built before s.11 still follow the old "shared on default rows only" pattern, which
  remains valid; the rule is simply no longer mandatory.)
- **Chart Container** carries the signature fact-vs-estimate treatment: solid
  history (accent/brand) + dashed projection (accent/estimate) over a confidence
  band, dashed "Today" divider; legend distinguishes by colour + label + stroke.
  Shared master (`38:652`), used in Analytics (`55:1803`) and Investments. ⚠ **The
  Investments instance was detached s.13** (now bespoke frame `85:2798`) to build a
  decomposed ETF-vs-crypto projection — see the projection note below. Analytics still
  uses the live master, untouched.
- **Net Balance Display** (`sign`: positive/negative): positive = success-subtle +
  green; negative = neutral, **deliberately no red**. Breakdown reads "Income −
  your share".
- **Card Settings Row** (`state`: shared/personal/new/cashback): Personal | Shared
  50/50 toggle; auto-discovered from CSV; new cards default Personal; cashback shown
  excluded, not splittable.
- **Investment Pack Card** (`73:2373`, session 11): promoted from the bespoke pack
  cards on Investments. Component set `Kind` (live/manual) × `Change` (up/down) = 4
  variants. `Kind=live`: ● LIVE badge, units/quote × price-per-unit, current value
  (units × live price), daily change. `Kind=manual`: no badge/price, hand-entered
  current value, raw € difference from contributed. `Change=up` → `foreground/success`;
  `Change=down` → `foreground/error` (for investments the negative IS red — a real
  loss on a fact, unlike Net Balance which stays neutral). Value is always a present
  fact, never a celebratory % headline. ✓ **Swap done s.13:** the Investments screen now
  uses 3 instances of this master (`84:2643` ETF up · `84:2656` BTC down · `84:2669` ETH up)
  in the pack column (`67:1674`), replacing the old bespoke cards (`69:1807` etc., removed).
  Each instance carries the correct variant + token-bound change colour (up → success,
  down → error), validated structurally; bespoke cards fully removed, no orphans.
  ✓ **7-day change added s.13:** the two `live` variants now carry a "7g ±X%" figure next
  to "oggi", separated by a thin `border/subtle` divider, in the value row. **Live only** —
  manual packs have no live daily price, so a 7-day delta would be invented data (omitted by
  design). The 7g colour is independent of "oggi" (a pack can be down today but up over 7
  days — BTC: oggi −2,3% on `error`, 7g +4,1% on `success`), so it is NOT governed by the
  `Change` variant: master stays 4 variants, the 7g colour is set per-instance via paint
  override (`setBoundVariableForPaint`). Card height unchanged (108px). Per-pack 7g: ETF
  +1,6% · BTC +4,1% · ETH +2,8%.
- **Gesty Logo** (`80:2540`, session 12): wordmark "punto fermo", taglio C geometrico
  squadrato. Component set `Type` = lockup / mark / favicon. `Type=lockup`: segno G come
  INIZIALE (grande) + testo "esty" più piccolo (18px) appoggiato in BASSO accanto alla G
  = "Gesty" con UNA sola G, il segno è la lettera. **Fix s.14:** prima mostrava segno-G +
  parola intera "Gesty" → doppia G; corretto a "esty". Layout reso STATICO (auto-layout off,
  62×24): il wordmark è posizionato a mano (x 24, baseline bassa) per stare sotto e a destra
  del segno; tutti i binding token intatti (G stroke accent/brand, punto+testo foreground/brand).
  Stato sidebar ESPANSO, header. `Type=mark`: solo segno G su sfondo
  trasparente (stato sidebar COLLASSATO, uso inline). **`Type=favicon` (`86:2826`,
  session 14):** mark INVERTITO — contenitore quadrato (`radius/small`) con fill
  `background/brand` (teal), segno G + punto in `foreground/on-brand` (bianco);
  glifo ricentrato e ridotto al 70%% per padding d'aria (il clip del contenitore
  tagliava la G a piena scala). Per favicon / app icon / dock. Tratto G legato ad `accent/brand`, testo + tacca
  quadrata a `foreground/brand`; zero hardcoded; descrizione sul set. Sostituisce il
  vecchio placeholder testuale "Gesty" nello scaffold. Le 9 sidebar ora portano
  un'istanza del lockup (stato espanso = canonico). ⚠ Opzionale NON fatto: variante
  favicon su sfondo teal pieno (colori invertiti) per il `mark`.

- **Sidebar** (`86:2976`, session 14): component set `State` = expanded / collapsed.
  **expanded** (256px): logo lockup (G+esty) + 7 voci nav icona+label + Settings in fondo.
  **collapsed** (64px): **favicon** (mark invertito su quadrato teal = ancora di brand;
  scelta confermata vs G trasparente — "sembra più icona") + sole icone nav centrate +
  Settings. Clonato dalla sidebar assemblata di Overview (`47:516`); le 9 schermate restano
  assemblaggi locali nello stato espanso (decisione s.12), il componente dà i due capisaldi
  expanded/collapsed per lo sviluppo. Animazione di transizione nei Dev Notes · Sidebar
  (`81:2620`), non mostrata.

- **Curiosity Card** (`93:3114`, session 15): scheda-curiosità dell'Overview. Component set
  `tone` = neutral / down / up. Una scheda = icona (34px in box `radius/medium` su sfondo tonale)
  + testo fatto (`type/label`, foreground/primary) + cifra di contesto (`type/caption`,
  foreground/secondary). Parente dell'**Anomaly Strip** (`32:482`) — STESSO motore di insight —
  ma voce CALMA, non urgente: accompagna, non allerta. `tone` governa SOLO il colore di
  icona+sfondo-icona: **neutral** = `foreground/brand` su `background/brand-subtle` (icona
  calendar, fatti puri) · **down** = `foreground/success` su `background/success-subtle` (icona
  arrow-down-right, categoria SOTTO il solito) · **up** = `foreground/warning` su
  `background/warning-subtle` (icona arrow-up-right, categoria SOPRA il solito). **Mai colore da
  solo** (principio 5): icona+testo+cifra sempre presenti. Sempre DESCRITTIVA, mai verdetto
  (principio 2): −% ≠ "bravo", +% ≠ "attenzione". Sempre su quota tua, mai gross; solo fatti
  osservati, **nessuna proiezione** (vivono in Analytics/Investments). Token-bound, descrizione
  sul set, nella sezione "05 · Feedback & states". ⚠ Nota build: icone Gesty a TRATTO (stroke su
  VECTOR, frame interno trasparente) — ricolorare `tone` = bindare lo STROKE dei VECTOR a
  `foreground/{tone}` + svuotare il fill del frame interno (riempire il frame copre le glifi).

**Master micro-copy is now Italian** (session 6): Transaction Row "½ split" → **"½ condivisa"**
(default + hover variants); Card Settings Row → "Personale", "Condivisa 50/50", "nuova — verifica
split", "cashback · esclusa dai totali", "Non divisibile — non è spesa reale". Screen copy and
master copy are now consistent Italian. Open decision RESOLVED.

**Category Badge italianizzato (session 16):** master `Category Badge` (`11:1040`, 32 varianti)
— tutte e 32 le label da inglese a italiano (Spesa · Trasporti · Ristoranti · Abbonamenti ·
Acquisti · Salute · Casa · Altro), allineate alle Filter Chip. Istanze auto-aggiornate (0
override locali in inglese trovati sulle schermate). Decisione utente: coerenza con le chip,
chiusa l'incongruenza chip-IT / badge-EN. **Nav e titoli di schermata restano INGLESE** (decisione
cross-screen invariata) — l'italiano ora copre chip + badge categoria, non la navigazione.

---

## Design system / tokens (COMPLETE — this is settled, do not re-decide)

Three collections, all aliased primitive→semantic, every variable described.

- **Primitives** (1 mode "Value", 95 vars): neutral 0–950, **teal** (brand) 50–700,
  green, estimate, amber, red, blue ramps; the 8 category hues each with three roles
  (`category/*`, `category-subtle/*`, `category-dark/*`, plus `category-on-dark/*`);
  type-size / spacing / radius / weight / family scales.
- **Color** (1 mode "Light", 79 vars): semantic background / foreground / border /
  accent, including the 8 category families and the estimate family.
- **Dimensions** (1 mode "Web", 58 vars): type properties (feeding text styles),
  spacing, radius, layout (`sidebar-width`, `max-content-width`, grid).
- **Text styles** (10): display, display-headline, heading-1/2/3, body, body-small,
  label, caption, numeric.
- **Effect styles** (4): elevation none / low / medium / high.

**The brand decision is MADE — teal.** `accent/brand` #1F8C84 · `foreground/brand`
#0E5C56 · `background/brand-subtle` #ECF7F6. Page #F6F8FA, card #FFFFFF. **Three
families kept perceptually separate:** brand (teal) ≠ success (green #2F8F4E) ≠
estimate (violet #8E8AB0). Net balance negative stays **neutral, never red**.

**Accessibility:** full AA. The one former failure (`accent/category-other`) was
fixed session 5 — primitive `category/other` = **#7E8B98**, 3.27:1 on page bg.

---

## The data model (the spine of the product)

Curve has **no balance / no top-ups** — only outgoing spend + cashback. So Gesty
models the **split of each expense**, not any pool.

- **Split is per card**, read from `Card Last 4`: **••8480 = shared 50/50**, every
  other card = personal 100%, new/unverified cards default personal ("new — check
  split").
- **Two amounts per transaction:** gross (what left the card) + your share. **Category
  totals, net balance, and projections all run on your share**, not gross. The table
  shows both.
- **Net balance = manual income − your share of spending** (income is hand-entered;
  the CSV has none). Descriptive only, never a budget verdict / cap.
- **Three CSV row types:** Spend (positive EUR) · Refund (follows the card's split;
  shown as green "+" inflow; exact CSV shape still unconfirmed — no real refund row
  observed yet) · Cashback/CPT (non-EUR points, shown **only as points**, excluded
  from all spend/net/projection math).
- **Dates** are ISO `YYYY-MM-DD` UTC in the file; displayed as dd/mm/yyyy.
- **Category** comes from Curve; Gesty maps Curve's strings onto its 8 tokens, with
  a fallback ("Other") for blanks.

Three data sources kept distinct: **Spending** (CSV, expenses only) · **Income**
(manual, recurring vs one-off flag) · **Investments** (manual).

**Sidebar (eight entries):** Overview · Spending · Analytics · Categories · Income ·
Investments · Import · **Settings** (set apart at the bottom; holds the Cards section
that configures card→split).

**Sidebar collassabile (comportamento, session 12).** A riposo la sidebar è STRETTA
(solo icone nav + segno G = `Gesty Logo Type=mark`). Si apre ESPANSA (icone + label +
lockup "Gesty") per PROSSIMITÀ: quando il cursore entra in una hot-zone lungo il bordo
sinistro (~24–32px), PRIMA di toccare la barra. Resta aperta finché il mouse è sopra;
alla mouseleave si richiude. La G fa emergere "esty" con typing sobrio (~200ms, ease-out)
sincronizzato con l'apertura. Le 9 schermate del file mostrano lo stato ESPANSO
(canonico) — il collasso vive solo come comportamento, documentato in **`Dev Notes ·
Sidebar`** (`81:2620`, 7 note: prossimità, G→Gesty, label, tempi/easing,
prefers-reduced-motion, accessibilità tastiera, desktop-only). NON è un secondo set di
schermate (decisione: non regredire i layout approvati).

### Recurrence heuristic — `base` (DEFINED s.13)

Adds the missing **recurrence notion** to the spending model. Each spending transaction
gets a derived flag: **`base`** (recurring / hard-to-compress) vs **`variable`**. This is
what Analytics Band 4 ("Spese fisse e margine") and Band 3's smart equivalences run on.
There is no native recurrence field in the Curve CSV — it must be **derived**.

**Model = hybrid** (category prior + merchant-pattern confirmation), chosen via option
round over two rejected alternatives (category-only = too coarse; merchant-only = misses
the prior). The mapped **Curve category** raises the *suspicion* (housing, subscriptions
lean base); the **merchant pattern** confirms or denies it. This correctly handles the two
trap cases: a one-off in a "fixed" category stays `variable`; a recurring charge in a
"free" category (e.g. a monthly gym billed under Shopping) becomes `base`.

**Confidence thresholds (conservative — under-declare rather than inflate the base):**
- **History window:** ≥ 3 months of data. Below it, no base is derived.
- **Occurrence count:** same (normalized) merchant in ≥ 3 distinct months; tolerates 1
  skipped month out of 4.
- **Amount tolerance:** within **±20%** of the merchant's median (bills vary; a fixed
  subscription is tighter — the band just has to contain it).
- **Cadence tolerance:** monthly = **±5 days** from the expected date.

A merchant clearing all thresholds → its transactions are `base`; everything else is
`variable`. Margin (Band 4) = income − base; if low it stays **neutral, never red** (not a
budget).

**Prerequisites (implementation, not design):**
- **Merchant normalization** of the raw col-4 string (e.g. "Cafe+co At 311175" / "Cafe+co
  At 998211" → "Cafe+co") BEFORE clustering — without it the same merchant fragments and
  never reaches the occurrence threshold.
- Runs on **your share, never gross** (consistent with all other math).

**Thin history (< 3 months):** Band 4 shows an explicit **"in apprendimento · servono ~3
mesi"** state — it does NOT silently disappear (decision s.13; sibling of the "vs norm
hides on thin history" rule, but with a stated reason rather than a blank). Once ≥ 3 months
exist, the bar renders normally.

**Status:** feature DEFINED; derivation logic + merchant normalization are implementation
work. The *visual* (Band 4 income bar, Band 3 equivalences) was already built s.11.

See `data-contract-curve-csv.md` for the full parsing contract.

---

## Overview screen — BUILT (session 4, `Overview / Default`, `47:515`)

Glancer's 30-second home. *Headline first*, observed facts only, no projections.
Four bands: **Hero** (current-month spend, your-share undeclared, neutral comparison
below the figure, hidden on thin history) · **4 cells** (weekly average · top
category · n° transactions · Net Balance Display, last completed month, "Maggio ·
chiuso") · **Mini category breakdown** (clean token-bound container, 5 inline rows) ·
**Gateway** ("Vedi analisi →" → Analytics). Data-freshness indicator in the page
header. No period selector (deliberate). Dev-note: hero comparison must not render
until there's enough history.

**Banda Curiosità aggiunta s.15** (`Band 2.5 / Curiosità`, `93:3115`, tra Metrics e
"Dove sono andati i soldi"): header "LO SAPEVI" + un'istanza di **Curiosity Card** + riga
nav (frecce ‹ › + 4 dots, primo dot attivo). Mostra UN fatto descrittivo alla volta sui
dati reali, **autoplay ~75s** + override manuale. Decisa via esplorazione interattiva
(forma A "una che ruota" su B "pila" e C "cambia al refresh"). Motore, 7 ricette, scoring,
regole di principio e storia-sottile documentati nei **Dev Notes · Overview** (`79:2514`,
+7 note s.15). Costruita coi soli token (zero hardcoded).

---

## Spending screen — BUILT (session 5, `Spending / Default`, `49:622`)

The exploratory register: the table is the protagonist. Decisions locked at design
time (option round): **selection summary always visible** · **chips = top 3–4 + "+N"
overflow** · **flat table** (date column, no day grouping).

Structure, top to bottom (Main, 1056 wide, section-gap 32):
- **Page header** — "Spending" + data-freshness + **Period Selector** (Trigger
  component). Unlike Overview, the period is an exploration tool here.
- **Anomaly Strip** (instance, full width) — Italian copy ("Ristoranti +100% vs mese
  scorso", "Vedi analisi"). Annotated: 1–2 findings by importance on the current
  period (your share); **not rendered** when no relevant anomaly or thin history;
  descriptive only.
- **Filter Bar** — search Input (280px, "Cerca transazioni…") + 4 Filter Chips +
  bespoke token-bound **"+ 4" overflow chip** (padding/radius mirrored from the chip
  master). Annotated: visible chips = top-4 categories by your-share spend in the
  selected period, order recalculated **only on period change** (calm); "+N" opens a
  popover with remaining categories; "all" = no chip selected; search filters
  merchant + notes, ~200ms debounce.
- **Selection Summary** — "47 transazioni · giugno 2026" | "€ 1.243,80 *quota tua*",
  subtle bottom border. Annotated: always visible, live with search+chips+period,
  total is always your share (never gross), descriptive only.
- **Transaction Table** — Table Header + 8 Transaction Rows (zebra default/alt):
  2 shared rows (SPAR, Zalando reso) with gross "di €…" + ½ marker, 1 refund inflow
  (green "+€29,95", + sign as second carrier), varied categories/cards. Annotated:
  default sort date ↓, sortable columns, virtualize rows, hover state, click badge →
  category filter, click row → detail/category correction.

## Settings → Cards — BUILT (session 5, `Settings / Cards`, `49:1023`)

Page header "Impostazioni" + section "Carte" with the honest explainer ("split
applied on every import; changing it recalculates retroactively"). A token-bound
card container (card bg, subtle border, radius/large, card-padding) holds 4 Card
Settings Rows with subtle dividers: **Visa Debit ••8480 shared** · **Mastercard
••4582 personal** · **N26 ••7731 new** ("new — check split") · **Curve Cash
cashback** (excluded, not splittable). Annotated: per-card context numbers are
placeholders → wire to real per-card aggregates; split change recalculates your
share / category totals / net balance / projections retroactively, with a confirm
step; new cards default Personal.

**Sezione "Informazioni" aggiunta s.16** (`Section / Informazioni` `96:3307`, terzo figlio del Main
sotto "Carte"). Card (`96:3310`) token-bound con: **header versione** (logo G teal `background/brand`
+ "Gesty" + numero versione **1.0.0**) · divider `border/subtle` · **changelog statico a righe**
(versione `54px` fissi · data · testo novità) con 3 voci segnaposto (1.0.0 giugno · 0.9.0 maggio ·
0.8.0 aprile 2026). Puramente **informativo**: Gesty è desktop-locale, legge CSV → **NON c'è
auto-update da backend**, il changelog è incluso nella build (microcopy esplicita). Versione + testi
sono PLACEHOLDER, da aggiornare a ogni release. È la voce "aggiornamento" chiarita con l'utente s.15.
La card è un FRAME (non componente) → niente `.description`; auto-documentata dalla microcopy.

## Overview empty state — BUILT (session 5, `Overview / Empty`, `49:1197`)

First-use state (no CSV ever imported). Decision: **minimal centered card** (no
ghost skeleton, no onboarding — the only user built the tool). Scaffold intact,
page header "Overview" **without** the freshness indicator (nothing to declare).
Centered card: upload icon in a brand-subtle circle · "Nessun dato ancora" ·
"Importa il primo export CSV da Curve: l'Overview si popola da sé." · primary
Button "Vai a Import". Annotated: rendered only when zero transactions exist; CTA →
Import; the same pattern (centered card + Import CTA) applies to Spending and
Analytics without data; respect prefers-reduced-motion.

---

## Import screen — BUILT (session 6, `Import / Preview`, `53:1320`)

**Completes Ring 1.** Shown in the preview/confirm state (the richest, most honest moment).
Decisions locked via option round: **inline preview panel below the dropzone** · **preview shows
a table of the first rows** (not just numeric summary). Structure, top to bottom:
- **Page header** — "Import", no data-freshness indicator (Import is the source, not a consumer).
- **CSV Dropzone** (real component, `State=empty`) — entry point, stays at top. Copy fixed:
  "EUR · export CSV da Curve" (dropped the "dd/mm/yyyy" promise — the real Curve file is **ISO
  YYYY-MM-DD** and not all EUR; the parser reads ISO + maps Curve categories).
- **Preview Panel** (bespoke, token-bound) — the honest core (principle 2): appears after parsing,
  **before** the merge. 3 summary cells (38 nuove · 6 duplicati ignorati · periodo 12/06–24/06/2026)
  + info Feedback Banner (duplicates) + preview table (Table Header + 3 Transaction Rows, incl. one
  shared with gross "di €…" + ½ marker) + "… e altre 35 righe" footer + actions (Annulla / Conferma
  e unisci; spurious inherited button icons hidden). **Merge happens ONLY on "Conferma e unisci".**
- **Section "Import recenti"** — Import History Row ×2: one success (142 righe, "importate
  11/06/2026"), one failed (formato non riconosciuto).
- Annotated: full state machine (empty → parsing/skeleton → preview/confirm → done → error) on the
  dropzone; preview/dedup/merge-only-on-confirm on the panel; read-only history with both states.



## Analytics — RICONCETTUALIZZAZIONE (session 19, concept; non ancora costruito in Figma)

**Origine:** l'utente, esplorando il prototipo, ha rilevato che Analytics **non rispondeva
alle domande giuste**: il grafico "spesa accumulata + proiezione" era sterile (output, non
insight); "Esplora i compromessi" era astratto e demotivante (il frame "investi in ETF fra
10 anni" è troppo lontano); e la barra what-if rappresentava male il problema (mostrava i
soldi risparmiati invece di partire da quanto spendi al massimo). **Concept approvato via
giro di domande + framework di behavioral economics; il ridisegno Figma è DA FARE.**

**Scopo di Analytics, ridefinito (lo scopo era sbagliato in testa):** Analytics non è un
cruscotto che *mostra*. Fa due lavori psicologici distinti:
- **"mh, ah, ok"** (informativo) → far *capire* qualcosa che non si vedeva, su più dimensioni.
- **"proviamo a fare così"** (educativo/comportamentale) → far *ragionare su come gestire
  meglio*, senza mai essere normativo.

**Framework applicati** (structured reasoning, non ricerca empirica — l'utente È l'unico
utente, il suo modello mentale è la verità): **Mental Accounting** (Thaler — ragionare per
conti mentali, non per totale aggregato), **Reference points & framing** (Kahneman — ogni
cifra contro "tu di solito", non una media astratta), **Concreteness & temporal discounting**
(le equivalenze restano nel presente concreto e nella lingua reale dell'utente, mai proiezioni
lontane).

**Needs Landscape di Analytics** (anchor needs, divisi nei due lavori):
- *Capire:* N1 vedere cosa è cambiato vs me stesso · N2 distinguere segnale da rumore
  (eccezione o pattern?) · N3 vedere la stessa spesa da dimensioni diverse · N4 capire quanto
  è sotto il mio controllo (margine comprimibile).
- *Ragionare:* N5 simulare un cambiamento su una leva che controllo davvero (parte variabile,
  non un numero inventato) · N6 vedere dove andrebbero i soldi in equivalenze concrete e mie ·
  N7 il sistema mi fa la domanda giusta, non l'ordine.

**Le 4 bande ridisegnate (sostituiscono le attuali Band 1+3):**
1. **Cosa è cambiato — vs il tuo solito** (capire). Ogni categoria di giugno contro la sua
   *banda abituale* (min–max ultimi 3 mesi). Fuori dalla banda = evidenziato. Sostituisce il
   grafico spesa-accumulata (che rispondeva a "niente").
2. **Eccezione o pattern?** (capire — segnale vs rumore). Quel +100% è un caso isolato (una
   cena da €96 che pesa il 38%) o un ritmo nuovo (7 conti tutti sopra la media)? Guarda la
   distribuzione delle transazioni. È la banda che fa l'"ah".
3. **La stessa spesa, da angoli diversi** (capire — multidimensione). Tab: **per merchant ·
   nel tempo · fisso vs scelto**. Tab confermati dall'utente (non sempre-visibili). L'insight
   nasce dal cambio di lente.
4. **E se spostassi parte di [categoria]?** (ragionare). **La barra parte da quanto spendi
   davvero** (es. €256), e lo slider scorre **solo la parte variabile** (le fisse — il caffè
   ricorrente — sono escluse dalla leva). Mostra **dove vivrebbero quei soldi in equivalenze
   concrete e tue**: cene fuori (✓ tenuta), mesi di palestra (merchant ricorrente reale), %
   dei tuoi Trasporti. **Via "ETF fra 10 anni"** — l'investimento futuro, se tenuto, è UNA
   equivalenza tra le tante con un link, non il protagonista. Mai "dovresti".

**Onestà fatto-vs-derivato (principio 2):** le parti "fisso vs scelto" e "eccezione vs
pattern" dipendono dalla recurrence `base` (definita, non implementata) → marcate
esplicitamente come **derivate**, non fatto osservato.

### Motore di insight UNIFICATO — "un motore, tre voci" (decisione s.19)

Anomaly Strip + Curiosity Card + Equivalenze di Analytics **condividono lo stesso motore**.
Oggi sembrano separati ma fanno lo stesso lavoro: prendono i dati grezzi, trovano un fatto
notevole, lo dicono. **Architettura in due fasi condivise:**
1. **Pattern detection** — trova i fatti notevoli (categoria fuori dal solito, merchant
   ricorrente, concentrazione). Stessa logica della recurrence `base`.
2. **Scoring di rilevanza** — sceglie i più significativi (scostamento × importo × recenza).

**Cosa cambia tra i tre output: SOLO il tono e dove appaiono.** Il fatto sottostante e la
matematica sono identici.
- **Anomaly Strip** → voce *allerta*, in Spending ("+100% vs mese").
- **Curiosity Card** → voce *calma*, in Overview ("lo sapevi che…").
- **Equivalenze** → voce *ragiona*, in Analytics ("≈ 2 mesi palestra").

**Vantaggio per Claude Code:** si scrive il motore UNA volta, i tre elementi UI ne consumano
l'output con un parametro di tono. Niente tripla manutenzione; coerenza garantita (la stessa
anomalia non può esistere in Spending e sparire in Overview). Le equivalenze "intelligenti"
richieste dall'utente SONO questo: il pattern detection trova i merchant ricorrenti reali +
medie categoria, e le equivalenze si *costruiscono* da lì — **niente hardcoded, niente modello
da addestrare** per le equivalenze.

### Livello di "intelligenza" — decisione (s.19)

Esplorato il confine "ha senso l'AI?". Tre livelli; la scelta è **deterministico, locale,
ispezionabile** ovunque possibile (fedele a desktop-locale + honest-not-flattering):
- **Equivalenze → Livello 1+2 (regole sui dati + scoring). NIENTE modello.** Sarebbe
  ingegneria sprecata: la relazione importo→equivalenza è una trasformazione esplicita, non
  una funzione nascosta da imparare. Un modello aggiungerebbe solo opacità e non-determinismo.
- **AI vera (LLM) → SCARTATA per ora.** Gira non-in-locale (manderebbe dati finanziari a un
  server, contro il modello prodotto), è non-deterministica (mina la fiducia), può inventare
  (anti honest-not-flattering). Avrebbe senso solo se un giorno si volesse far *parlare* Gesty
  — decisione di prodotto diversa, non ora.

### Percorso modelli — categorizzazione + recurrence (decisione s.19)

Due problemi DOVE un modello dell'utente avrebbe valore reale (classificazione con ambiguità
vera, diversamente dalle equivalenze):

**Categorizzazione merchant** (stringa Curve → 8 token). Spettro a 4 livelli:
- L0: mappa categoria-Curve → token (già nel piano, copre ~70-80%).
- **L1 (punto dolce): dizionario merchant + fuzzy match che CRESCE dalle correzioni manuali.**
  Non è ML ma "impara nel tempo" — ogni correzione arricchisce il dizionario. Copre ~90%+.
- L2: classificatore di testo leggero (Naive Bayes / logistic regression) sulle correzioni —
  generalizza a merchant nuovi ("bar/café/osteria → Ristoranti"). Locale, niente GPU. **Ha
  senso SOLO se** si continua a correggere merchant nuovi mai visti.
- L3: embeddings semantici — overkill per 1 utente.

**Recurrence `base`** — qui un modello ha **più** senso (l'euristica a soglie attuale è già
una mini-classificazione a mano, e le regole rigide danno sì/no secco coi casi-limite dalla
parte sbagliata: bolletta variabile €60-95 → sfora ±20% → erroneamente "variabile"; palestra
con 2 mesi saltati → erroneamente "variabile"). Un **modello probabilistico** darebbe
**confidenza graduata** invece di sì/no — usabile onestamente: alta → base, zona grigia (50-75%)
→ "sembra ricorrente, confermi?" (recognition non recall, honest-not-flattering applicato
all'incertezza).

**PERCORSO DECISO — "soglie → dati → modello":**
1. **Parti dalle soglie attuali** (già definite s.13) come baseline — funzionano sui casi facili.
2. Ogni correzione manuale dell'utente **accumula un dato etichettato** (merchant fisso: sì/no).
3. Quando i dati bastano (mesi d'uso), **un modello semplice** (logistic regression su poche
   feature: varianza importo, regolarità cadenza, n° mesi presenti, categoria) impara i pattern
   dell'utente e batte le soglie sui casi-limite.
Il modello è la **destinazione**, non il punto di partenza: partire col modello sarebbe mettere
il carro davanti ai buoi (nessun dato di training). **Tutto locale, deterministico dove possibile.**

**Stato:** CONCEPT approvato. Da fare: (1) ridisegnare le 4 bande Analytics in Figma + Dev
Notes "motore unico"; (2) propagare il percorso modelli quando si arriva all'implementazione.
Aggiornare anche `06-features.md` (sezione Analytics) quando il ridisegno Figma è fatto.

---

## On the horizon (registered, not yet designed)

- ~~**"Recurring" notion on spending (`base`)**~~ ✓ **DEFINED in s.13** — see
  "Recurrence heuristic" below under the data model. The derivation is now a specified
  feature (hybrid model + confidence thresholds); the *visual* of base/margine was
  already BUILT (s.11). Remaining work is implementation (parser + merchant
  normalization), not design.
- **Smart-equivalences engine (Analytics Band 3)** — picks the 2 most relevant
  equivalences from real data (investment FV projection as protagonist; spend-pattern
  and margin effect on rotation). Mostly dev logic; designed + annotated s.11.
  ⚠ **RICONCETTUALIZZATO s.19:** non più "FV ETF come protagonista" — ora le equivalenze
  sono concrete/presenti/tue (cene, mesi palestra, % categorie), parte del **motore di
  insight unificato** (Anomaly + Curiosity + Equivalenze). Vedi "Analytics —
  RICONCETTUALIZZAZIONE" sopra. La vecchia formulazione FV-protagonista è superata.

- **Settings — espansione (registrato s.15).** Oggi Settings ha solo la sezione "Carte"
  (`Settings / Cards`, `49:1023`). Tre aree richieste dall'utente, ordinate per dipendenza:
  - **Versione app + changelog (informativo) — DA FARE, coerente col prodotto.** Una sezione
    "Informazioni" in Settings: versione corrente + changelog leggibile (cosa è cambiato).
    Puramente informativo: NON è un auto-update da backend (Gesty è un'app desktop locale che
    legge CSV — non c'è server da cui scaricare aggiornamenti, vedi Out-of-scope in `06`). Il
    "changelog" è statico, incluso nella build. Questa è la voce "aggiornamento" chiarita con
    l'utente (s.15): non re-import, non prezzi live, ma versione+novità.
  - **TEMI / dark mode — RIMANDATO a DOPO il prototipo (decisione utente s.15).** Ragionamento
    salvato: il dark mode NON è lavoro di UI ma di **token architecture**. La collezione Color
    ha oggi 1 solo modo "Light" (79 var semantiche aliasate ai primitivi). Il dark vero richiede:
    (1) aggiungere un modo "Dark" alla collezione Color; (2) ri-aliasare le 79 semantiche a
    primitivi diversi nel modo Dark (es. `background/page` → neutral scuro, `foreground/primary`
    → neutral chiaro); (3) verificare AA su entrambi i modi; (4) le 8 famiglie categoria +
    estimate + brand vanno ricalibrate per il fondo scuro (category-on-dark esiste già nei
    primitivi — già previsto in parte!). È l'espansione esplicitamente prevista da
    `07-design-system-building-practices.md` ("expandable to Light/Dark later by adding a Dark
    mode column"). Il selettore in Settings (chiaro/scuro/sistema) è la parte facile; il dark
    token-level è il grosso. Si fa quando i layout sono fermi (dopo il prototipo), per non
    ri-auditare due modi a ogni cambio schermata.
  - **LINGUA (it/en) — RIMANDATO, solo registrato (decisione utente s.15).** Ragionamento
    salvato + tensione di principio: `04-platform-constraints.md` dice esplicitamente
    "Internationalization beyond EUR / European formatting is NOT a requirement — single user,
    single locale". Oggi la microcopy master è italiana e la nav/label categoria sono inglesi
    per coerenza cross-screen (decisione registrata). Un vero switch it/en richiederebbe
    estrarre TUTTE le stringhe in un layer di traduzione — lavoro grosso che il brief non
    chiede. Da ripensare più avanti; se si farà, è probabile si limiti a it/en delle label
    (nav + category badge), non i18n completa. Non costruire controlli lingua finché la portata
    non è confermata.

---

## UI Audit — Filter Chip (`12:1129`, session 15)

Audit completo del component set richiesto dall'utente. **Stati ben fatti e token-bound**
(default = card bg + border/default · hover = bg più scuro + border/hover · selected = fill
categoria pieno `accent/category-*` + testo invertito `foreground/on-*`); selected NON si affida
al colore da solo (cambia fill + contrasto testo + il pallino). Radius `pill` (999, bound). Zero
hardcoded. **Difetti trovati, da correggere:**
- **[ALTA] Larghezza FIXED 120px su tutte le 24 varianti.** Le label variano da "other" (36px) a
  "subscriptions" (91px): con padding 14+14 + pallino 10 + gap 7, "subscriptions" arriva a ~136px
  e **sfora i 120px**, mentre "other" ha spazio morto. → Portare a hug-content
  (`primaryAxisSizingMode = AUTO`), il pill si adatta alla label.
- **[MEDIA] Categoria cablata nelle varianti** (8 Category × 3 State = 24 componenti). Rigido: ogni
  nuova categoria = 3 nuovi componenti, label dentro il master. Tollerabile per 8 categorie Curve
  stabili, ma è il punto meno flessibile del sistema. Decisione aperta: rifattorizzare a `State`-only
  + property testo/colore, oppure lasciare (8 cat. stabili).
- **[MEDIA] Manca lo stato `disabled`** (utile quando una categoria non ha transazioni nel periodo).
- **[BASSA] "+N overflow"** resta un chip bespoke su Spending, non una variante del set — valutare
  se promuoverlo a stato/variante.
- **[INFO] Label inglesi** — coerente con la decisione cross-screen registrata, non un bug.
- **Nota positiva:** il pallino-categoria 10px è il carrier visivo; verificato come colore + label
  insieme (mai colore da solo, principio 5). Coerente con la nuova Curiosity Card (icona+testo+cifra).

**Stato: ✓ FIX APPLICATE s.16 — refactor completo.** Scelta utente: **opzione A**
(`State`-only + property), motivata dall'adattamento al labeling del CSV. Risolti: larghezza
hug-content (era FIXED 120px), stato `disabled` aggiunto, categoria scablata dalle varianti
(ora per-istanza). Le 24 varianti vecchie eliminate, 12 istanze ricablate + label italiane.
Vedi la voce "Filter Chip (`95:3234`, REFACTOR session 16)" nella sezione componenti. Resta
non promosso il "+N overflow" bespoke ([BASSA], accettato).

---

## Open items / to confirm

- ~~**Net Balance cell label**~~ ✓ **RISOLTO s.16** — il breakdown "Income … − Your share …"
  italianizzato a **"Entrate … − quota tua …"** sul master Net Balance Display (varianti
  positive `38:658` + negative `38:664`) e sull'istanza Overview (`I47:647;38:658`, override
  locale corretto a mano). (La cella "Maggio · chiuso" resta da decidere se allargare per il
  full "mese chiuso" — voce separata sotto.)
- **Net Balance cell wording** — la cella è "Maggio · chiuso" (accorciato per stare in 246px).
  Decidere se il full "mese chiuso" via cella più larga o label master a due righe.
- **Refund CSV shape** — unconfirmed; define the parser's detection rule when a real
  refund row appears.
- **Card-context numbers** in Settings / Cards are placeholders — wire to real
  per-card aggregates at build time (annotated in Figma).
- ~~**Investments pack cards → swap to master**~~ ✓ **DONE s.13** — the Investments screen
  now uses 3 instances of the `Investment Pack Card` master (`73:2373`); bespoke cards
  removed. See the component note above.
- ~~**Category badge label**~~ ✓ **RISOLTO s.16** — i Category Badge (master `11:1040`, 32
  varianti) italianizzati (Spesa, Trasporti, Ristoranti, Abbonamenti, Acquisti, Salute, Casa,
  Altro), allineati alle Filter Chip. Nav + titoli di schermata restano inglese (decisione
  cross-screen invariata).
- ~~**`layout/grid-columns` scope vuoto**~~ ✓ **RISOLTO s.16** — confermato DELIBERATO: un
  conteggio di colonne (=12) non mappa ad alcuna proprietà di layer Figma (non esiste scope
  "numero di colonne"), resta nascosto dal picker come token di riferimento per il dev.
  Descrizione aggiornata con la nota "Non è un difetto d'audit".
- ~~**`base` recurrence heuristic**~~ ✓ **DEFINED s.13** — hybrid model (category prior
  + merchant-pattern confirmation), conservative confidence thresholds, "in apprendimento"
  state on thin history. Full spec under the data model. Implementation pending.
- Per-transaction **split override** for rare exceptions — out of scope for now.

*Resolved session 11: Categories screen built (last sidebar entry) · Analytics Band 3
+ Band 4 revised · Transaction Row `alt` shared-structure limit fixed · Investment
Pack Card promoted to master.*
*Resolved session 5: `accent/category-other` AA fix · Overview empty state
designed and built · Spending designed and built (3 decisions locked) · Settings →
Cards built.*

---

## Next session

**STATO USER FLOW MAPPING (COMPLETO, s.18):** TUTTI E 5 i flussi mappati e CHIUSI — First-run/Empty ·
Owner/esplorazione spese · Planner/proiezione · Import (s.17) · **Flusso 5 input (s.18)**. Il
Flusso 5 (i 3 flussi di INPUT: +Aggiungi entrata 5a · +Aggiungi pack 5b · configura split 5c) è
chiuso in s.18 con frame statici token-bound + Dev Notes nella sezione "05 · Feedback & states"
(dettaglio nel Changelog s.18). **Non resta più user-flow mapping.** Unica fase rimasta: **Motion &
Prototipo** (motion spec con `/ux-motion` + prototipo React con `/interactive-prototype`).

**TUTTE le schermate di Ring 1 + Ring 2 sono costruite** e ogni voce di sidebar ha la
sua schermata (Categories chiuso in s.11). Restano solo **lavori trasversali**, nessuno
blocca gli altri:
- ~~**Logo Gesty (testuale)**~~ ✓ **FATTO in s.12** — component set `Gesty Logo`
  (`80:2540`), concept "punto fermo" taglio C squadrato, varianti lockup/mark,
  propagato alle 9 sidebar; comportamento sidebar collassabile documentato in
  `Dev Notes · Sidebar` (`81:2620`). ✓ Variante favicon aggiunta s.14 (`86:2826`).
- ~~**Schede-curiosità di Overview**~~ ✓ **FATTO in s.15** — component set `Curiosity Card`
  (`93:3114`) + banda `Band 2.5 / Curiosità` (`93:3115`) nell'Overview, forma A (una che ruota,
  autoplay ~75s), 7 ricette + scoring + regole documentate nei Dev Notes · Overview. Resta solo
  l'implementazione del motore (parser/scoring + merchant enrichment + heuristic base), non design.
- ~~**`base` recurrence heuristic**~~ ✓ **DEFINITA in s.13** — modello ibrido + soglie +
  stato "in apprendimento". Spec nel modello dati. Resta solo l'implementazione (parser +
  normalizzazione merchant), non è lavoro di design.
- ~~**Investments pack cards → istanze del master**~~ ✓ **FATTO s.13** (vedi Open items).

**Lavori aggiunti s.15 (richiesta utente) — ordinati per quando affrontarli:**
- ~~**[ORA / breve] Fix Filter Chip**~~ ✓ **FATTO s.16** — refactor a `State`-only + property
  label (opzione A), larghezza hug-content, stato `disabled`, 12 istanze ricablate + label IT,
  vecchio set eliminato (`95:3234`).
- ~~**[ORA / media] Settings — sezione "Informazioni"**~~ ✓ **FATTO s.16** — `Section /
  Informazioni` (`96:3307`) sotto "Carte": header versione 1.0.0 + changelog statico a 3 voci,
  informativo (no auto-update backend).
- **[DOPO IL PROTOTIPO] Settings — selettore TEMI + dark mode reale** — rimandato per decisione
  utente: il dark è token architecture (modo Dark + ri-alias 79 var + AA su 2 modi), si fa a layout
  fermi. Ragionamento completo salvato in "On the horizon → Settings espansione".
- **[DOPO, da ripensare] Settings — LINGUA (it/en)** — solo registrato; tensione col vincolo
  single-locale del brief. Portata da confermare prima di costruire. Vedi "On the horizon".

**FASE FINALE — Motion & Prototipo (dopo che TUTTE le schermate + i lavori trasversali
sono chiusi e stabili).** Da affrontare per ultima, dipende da layout fermi:
- **Motion spec con la skill `/ux-motion`** — definire le animazioni in modo
  sistematico (non ad-hoc): token di durata/easing + inventario completo. Raccogliere
  tutte le note di movimento sparse nei Dev Notes (Sidebar collassabile + G→Gesty,
  Investments, Analytics slider/banda, Import skeleton/state-machine, hover righe,
  "Mostra la matematica", deep-link Anomaly Strip, **Curiosity Card autoplay ~75s + fade ~200ms tra schede**…) in un unico motion file. Coerenza
  coi principi: calmo, mai vezzoso, `prefers-reduced-motion` sempre rispettato.
- **Prototipo finale con la skill `/interactive-prototype`** — prototipo React ad alta
  fedeltà che assembla le schermate in un flusso navigabile (3 ingressi Analytics,
  drill-down Categories, import, ecc.) con le animazioni reali applicate. È il
  deliverable che Figma non può dare.

**✓ Propagazioni completate (sessione 10):** entrambi i debiti registrati da s.8/s.9
sono stati propagati ai file di contesto:
- *Revisione brief prezzo live* → `01-product-brief.md` (frase intro + bullet
  Investment tracking + "second tension" qualificati: pack live vs manuale, valore
  live = fatto) e `06-features.md` (Investments + Projection riscritte: due tipi di
  pack, unità/quote, banda Allocazione descrittiva, curva=versato cumulato, formula FV,
  banda=scenari ±).
- *Modello dati Income* → `data-contract-curve-csv.md` ("What stays true" ora esplicita
  Income sempre 100% / mai split; rimborso CSV→Spending, rimborso manuale→Income 100%).

Always verify MCP with `figma.root.name` first. Screens live on the **"Screens"**
page (left → right: Overview / Default · Spending / Default · Settings / Cards ·
Overview / Empty · Import / Preview · Analytics / Default (+ Dev Notes `73:2413`
below it) · Income / Default · Investments / Default (`67:1523`, + Dev Notes `67:1751`) ·
**Categories / Default** (`70:1886`, + Dev Notes `70:2253`)); components on
**"Design System"** (incl. Investment Pack Card `73:2373`).

---

## Files to keep re-uploaded to the project (outputs not auto-synced)
- `gesty-project-state.md` — **this file. The living source of truth.** (updated s.12)
- `06-features.md` — functional scope (**updated s.10**: Investments + Projection
  allineate al prezzo live — due tipi di pack, unità/quote, banda Allocazione
  descrittiva, formula FV).
- `data-contract-curve-csv.md` — CSV parsing contract (**updated s.10**: "What stays
  true" esplicita Income 100% / mai split; CSV vs manual refund già chiarito s.8).
- `01-product-brief.md` — **updated s.10**: rivisto il "without pretending to report
  live performance" — i pack live mostrano valore in tempo reale come fatto (revisione
  accettata dall'utente, vedi sezione Investments).

> Supersedes the per-session handoffs (`session-2-handoff.md`, `session-3-handoff.md`),
> whose content is folded in here. Those can be removed.

---

## Changelog
- **Session 21** — **DECISIONE DI PRODOTTO: spesa manuale** (sollevata ripensando il
  prototipo). Il data contract diceva "the user does not hand-enter spending"; rivisto:
  la spesa è **importata** (default, norma low-effort) **o** **aggiunta a mano**
  (eccezione, per ciò che Curve non vede — contanti, carte non aggregate, prestiti).
  Nodi decisi via giro di domande: (1) **origine marcata** anche nella tabella (badge
  discreto, forma+label, mai colore da solo, famiglia del ½) — scelta verso più
  trasparenza dopo sparring sul principio honest-not-flattering (il punto è la
  *verificabilità*: la riga importata è ricostruibile da un record bancario, quella
  digitata è giusta quanto la memoria → non va mostrata come misurata); (2) **split
  scelto all'inserimento** 100%/50-50 (unico caso senza carta); (3) **categoria scelta
  dall'utente** al momento (unico caso di categorizzazione davvero manuale); (4) **fuori
  dal merge CSV** (re-import non le tocca, niente doppioni); (5) entry **"+ Aggiungi
  spesa"**, stessa famiglia di 5a/5b, da Spending. **Le manuali entrano nei pattern di
  ricorrenza/equivalenze come le altre** (confermato). Propagato a `06-features.md`
  (blocco Spending) + `data-contract-curve-csv.md` (nota split + "What stays true").
  **Da costruire:** badge origine su Transaction Row + master; modale "+ Aggiungi spesa";
  riflesso nel prototipo. **In corso:** ripensamento prototipo post-s20 (preview HTML
  Analytics 4 bande — dataset Ristoranti coerente fissato; fix barre Band 3 + chiarire
  natura template-da-dati-reali ancora aperti).
- **Session 20** — **Analytics / Default RICOSTRUITA in Figma** (4 nuove bande, riconcettualizzazione s.19 portata a schermo). Flusso: preview HTML → conferma → build Figma → screenshot, una banda alla volta. Decisioni chiave: (1) le 4 bande = schermata completa (Band 4 "Spese fisse e margine", Band 5 "Per categoria", Chart Container e "Esplora i compromessi" **rimossi**); (2) Band 1 → frase-protagonista (la banda+tick non si leggeva a primo colpo, cambiata dopo il primo preview); (3) Band 2 → dot-plot per ogni categoria fuori-banda, badge eccezione/pattern (ocra vs neutro); (4) Band 3 → 3 tab come frame statici di riferimento a destra (pattern Flusso 5a); (5) Band 4 → equivalenze **solo del presente**, riga ETF rimossa a scelta utente (concreteness over temporal discounting). **Nodi costruiti:** `57:1836` Band 1 · `144:4019` Band 2 · `144:4069` Band 3 (tab "Per merchant") · `144:4137` ref tab "Nel tempo" · `144:4170` ref tab "Fisso vs scelto" · `144:4197` Band 4 stato a riposo · `144:4218` ref stato slider trascinato. **Dev Notes · Analytics** (`73:2413`) riscritto da zero: motore unico 3 lavori, logica banda-per-banda, euristica `base`, rimosso sezione con motivazioni. Icone equivalenze: placeholder `→` (emoji non disponibili nel plugin sandbox; upgrade a `icon/*` vettoriali = task [BASSA] aperta). Token audit pulito a inizio sessione (232 var, 0 difetti). Un bridge dropout a metà Dev Notes — recovery senza perdite (svuotamento non commitato). **Prossimo:** Motion spec (`/ux-motion`) → prototipo React aggiornato con le 4 nuove bande (`/interactive-prototype`). Temi/dark mode e lingua: rimandati a dopo il prototipo.
- **Session 19** — **RICONCETTUALIZZAZIONE di Analytics (concept, no Figma) + motore di insight
  unificato + percorso modelli.** Nessun build in Figma: sessione di concept/prodotto innescata
  dall'esplorazione del prototipo da parte dell'utente. **(1) Analytics ridefinito:** non un
  cruscotto che mostra, ma due lavori psicologici — "mh ah ok" (capire) + "proviamo così"
  (ragionare per migliorare, mai normativo). Applicati framework di behavioral economics (Mental
  Accounting, reference points, concreteness/temporal discounting) come structured reasoning
  (l'utente è l'unico utente → il suo modello mentale è la verità). Needs Landscape a 7 anchor
  needs. **4 bande ridisegnate** (sostituiscono Band 1+3): *Cosa è cambiato vs il tuo solito*
  (banda abituale min-max 3 mesi) · *Eccezione o pattern?* (segnale vs rumore sulla distribuzione)
  · *Stessa spesa da angoli diversi* (tab merchant/tempo/fisso-scelto, confermati dall'utente) ·
  *E se spostassi* RIBALTATO (barra parte dalla spesa reale, slider scorre solo la parte
  variabile, equivalenze concrete e tue — via "ETF fra 10 anni"). Prototipo HTML interattivo
  mostrato e approvato. **(2) Motore di insight UNIFICATO "un motore, tre voci":** Anomaly Strip
  + Curiosity Card + Equivalenze condividono pattern-detection + scoring; cambia solo tono
  (allerta/calma/ragiona) e dove appaiono. Si scrive una volta, coerenza garantita. Le
  equivalenze "intelligenti" = pattern detection sui merchant ricorrenti reali, niente hardcoded.
  **(3) Livello intelligenza:** equivalenze → regole+scoring (L1+2), NIENTE modello (trasformazione
  esplicita, non funzione da imparare); AI/LLM scartata (non-locale, non-deterministica,
  anti-honest). **(4) Percorso modelli categorizzazione + recurrence:** dove un modello ha valore
  vero (classificazione con ambiguità). Categorizzazione → dizionario che cresce dalle correzioni
  (L1, punto dolce), classificatore solo se servono merchant nuovi. Recurrence → **"soglie → dati
  → modello"**: soglie attuali come baseline, ogni correzione accumula dati etichettati, poi
  logistic regression batte le soglie sui casi-limite con confidenza graduata (zona grigia →
  "confermi?", honest-not-flattering applicato all'incertezza). Modello = destinazione non
  partenza. Tutto locale/deterministico dove possibile. **Spec completa** nella nuova sezione
  "Analytics — RICONCETTUALIZZAZIONE". **Da fare:** ridisegno 4 bande in Figma + Dev Notes motore
  unico; propagare a `06-features.md`. MCP non usato (sessione di solo concept); un timeout sul
  visualizer a fine sessione (falso negativo probabile, widget reso comunque).
- **Session 18** — **Flusso 5 CHIUSO (i trasversali brevi / flussi di INPUT).** Ultimo flusso
  prima della fase Motion & Prototipo. Metodo invariato (mappa-buchi in chat → decisioni utente →
  build in Figma). Tutti e 3 i sotto-flussi mappati, decisi e **costruiti come frame statici
  token-bound** nella sezione **"05 · Feedback & states"**, ciascuno con etichetta teal + pannello
  Dev Notes. Token ri-verificati AI-readable a inizio sessione (232 var / 3 collezioni, 0
  descrizioni/code-syntax/alias mancanti; 10 text + 4 effect style; scope vuoti tutti deliberati
  = primitivi nascosti + `layout/grid-columns`). MCP verificato (`figma.root.name` → "Gesty").
  - **5a · Aggiungi entrata** — modale centrata a **2 stati** (scelta tipo a due card → compilazione),
    deciso via preview HTML (toggle vs due card → **due card**). Frame: scelta tipo (`126:3686`),
    compilazione ramo ricorrente (`126:3702`), Dev Notes · Income flusso 5a (`128:3738`, 9 note).
    Principio inchiodato: entrata sempre **100% tua, nessun selettore carta/split**. "← indietro"
    come escape route tra i due stati. Stesso form fa anche **edit** (menu ⋯ → salta a stato 2,
    "Modifica entrata" + "Elimina"). Atterraggio: ricorrente → Income Source Card; una-tantum → riga
    verde nella tabella.
  - **5b · Aggiungi pack** — stesso schema a due card (LIVE / MANUALE → compila). Frame: scelta kind
    (`133:3768`), compilazione **ramo LIVE** di riferimento (`133:3784`, con stato ticker validato
    ✓ success), Dev Notes · Investments flusso 5b (`133:3823`, 10 note). Ramo LIVE: nome · ticker
    (validato sul feed) · unità · contributo ricorrente; NESSUN campo valore (derivato = unità ×
    prezzo live). Ramo MANUALE: valore a mano. **Edit non cambia il kind** (cambiare kind = nuovo
    pack). Atterraggio: Investment Pack Card master (`73:2373`).
  - **5c · Configura split (Settings → Cards)** — non un form di creazione ma **modifica con
    ricalcolo retroattivo**. Deciso: **conferma PRIMA** (poi applica) · **modale centrata** · carta
    NUOVA = azione leggera (prima assegnazione, niente confirm pesante). Frame: modale conferma
    ricalcolo (`134:3856`, dichiara N transazioni + cosa cambia: quota tua/totali/saldo/proiezioni),
    Dev Notes · Settings flusso 5c (`134:3873`, 8 note). Honest-not-flattering: l'azione retroattiva
    mostra la sua portata. Cashback senza toggle; split reversibile (ogni cambio ri-ricalcola).
  - **Layout pagina Design System:** sezione "05" estesa da h≈1428 a **h=4190** per contenere i 3
    blocchi del flusso; sezioni "06" e "07" rifluite verso il basso mantenendo il gap 160 (06 → y
    18144, 07 → y 20166). Zero sovrapposizioni, zero orfani.
  - **MCP:** un blocco del Desktop Bridge a metà sessione (timeout su resize sezione, falso negativo
    poi confermato non applicato — verificato con read leggera prima di ritentare, nessun duplicato
    creato). Riaperto il plugin + verifica `figma.root.name`, ripreso senza perdite.
  **Resta:** SOLO la **fase finale Motion & Prototipo** (motion spec con `/ux-motion` + prototipo
  React con `/interactive-prototype`). Voci Settings rimandate invariate (temi/dark post-prototipo,
  lingua da confermare). Tutti i 5 flussi utente ora chiusi.
- **Session 17** — **Fase USER FLOW MAPPING** (richiesta utente: verificare la completezza
  funzionale mappando i flussi prima di Motion & Prototipo). Metodo a 2 fasi: mappa-flusso in
  chat come CHECKLIST di buchi (stati, transizioni, escape route ad ogni passo) → decisioni
  utente → build/documentazione in Figma. Skill `ux-designer` consultata (gate persona già
  passato; "design the flow not the screen"; "mai un flusso senza escape route"). **3 dei 5
  flussi mappati e chiusi** + **micro-item residui chiusi** + **pulizia pagina Design System**.

  **Micro-item chiusi:** (1) Net Balance label "Net balance"→**"Saldo netto"** (master `38:655`+
  `38:661` + istanza Overview ereditata pulita); "Maggio · chiuso" tenuto compatto. (2)
  **Card-context numbers** chiusi col nuovo **`Dev Notes · Settings`** (`105:3451`, 5 note:
  placeholder da cablare · ricalcolo retroattivo · nuove carte default Personale · cashback non
  divisibile · refund detection provvisoria). Scoperto che Settings/Cards non aveva Dev Notes
  (lo stato lo dava per annotato — non lo era). (3) **Refund CSV shape**: regola provvisoria
  (importo EUR negativo → inflow, segue split carta) ora scritta in Figma, non solo nei file di
  contesto.

  **Pulizia Design System:** Filter Chip orfana a (0,0) — residuo refactor s.16 — **ricollocata
  dentro "02 · Primitives"** sotto la sua label (non si sovrappone più a "00"). 8 Section, zero
  orfani top-level, gap uniforme 160 mantenuto. Gli "empty frame" trovati (divider/spacer dentro
  componenti) sono strutturali, lasciati intatti.

  **Flusso 1 — First-run/Empty (CHIUSO):** decisione utente = **sidebar "gated"** invece di
  costruire 5 schermate empty. Pre-import solo Overview + Import attivi; le altre 5 voci DISABILITATE
  con tooltip "Importa un CSV per attivare" (recognition, non recall; mai colore/stato da solo).
  Documentato in `Dev Notes · Sidebar` (8ª nota). Nessun frame empty nuovo. Stati transitori
  dropzone (empty/parsing/done/error) = state-machine, non frame.

  **Flusso 2 — Owner/esplorazione spese (CHIUSO, 3 buchi):** (#1) **ponte "vedi trend →"**
  Spending→Categories: link in Selection Summary (visibile solo con categoria attiva), propaga
  categoria+periodo (deep-link con stato); creato **`Dev Notes · Spending`** (`114:3586`, 6 note —
  Spending era senza pannello). (#2) **ritorno contestuale "← torna a …"**: appare solo dopo un
  deep-link con stato (mai da sidebar), riporta all'origine con stato preservato, UNA origine (no
  browser-stack); frame di riferimento "Return link" in "06 · Navigation & brand" (`116:3607`) +
  nota in `Dev Notes · Sidebar` (9ª). (#3) **correzione categoria** = **riga espandibile** (pattern
  B, scelto via preview HTML A/B/C): click sulla RIGA (badge filtra) → pannello dettaglio (merchant
  grezzo · data·ora · carta+½ · lordo·quota tua) + selettore categoria a chip; UNA riga aperta;
  override che SOPRAVVIVE ai re-import; ricalcola su quota tua; no-conferma; a11y+reduced-motion.
  Costruito **frame di riferimento "Transaction Row · espansa"** (`110:3525`, in "03 · Data display")
  + spec nella description del componente Transaction Row + nota in `Dev Notes · Categories` (11ª).

  **Flusso 3 — Planner/proiezione (CHIUSO, 3 buchi; il flusso più completo di partenza):** (#1)
  ritorno "← torna ad Analytics" esteso anche al ponte Band 3→Investments (nota Analytics estesa).
  (#2) **ponte inverso Investments→Analytics**: link "Dove trovare margine? → Esplora i compromessi"
  (`121:3620`) sotto la proiezione + nota in `Dev Notes · Investments` (speculare, con ritorno
  contestuale). (#3) **confronto scenari** (modalità A scelta dall'utente, "preciso e inconfutabile"):
  nuovo **toggle "Per asset | Confronta scenari"** (`122:3624`, token puliti) in **riga controlli
  dedicata** (Opzione 2 via preview HTML) con l'orizzonte spostato lì dal titolo. **Spec ESEGUIBILE**
  in 5 note ancorate alla geometria reale del plot (origine "Oggi" x=350, proiezione 282px, dash
  [6,5] ETF vs [2,4] scenario B, collasso ETF/crypto→aggregata, storico condiviso, distinzione
  tratto+etichetta, slot A/B con tasso editabile, risultati, onestà descrittiva). Plot del 2° stato
  reso dal prototipo. **Fix debito:** selettore orizzonte aveva fill bianco hardcoded → bindato a
  `background/page` + `foreground/on-brand`.

  **Flusso 4 — Import (CHIUSO, 4 buchi):** creato **`Dev Notes · Import`** (`123:3660`, 8 note —
  Import era senza pannello). (#1) **state-machine completa** documentata (empty→parsing→preview→
  done→Overview; rami Annulla/error) + merge-SOLO-su-conferma. (#2) **stato "done" esplicito**
  post-merge (riepilogo "✓ Uniti N · M duplicati · periodo", → Overview, registrato in Import
  recenti). (#3) **duplicati ispezionabili**: regola dedup DEFINITA (data+ora+merchant+importo+carta,
  Curve non ha ID univoco) + affordance **"vedi →"** (`123:3659`) sulla cella duplicati in preview.
  (#4) **uscita dall'errore** definita (messaggi specifici per causa + "riprova" + hint Curve, mai
  vicolo cieco). Più note su parsing ISO+mapping categorie, CPT/non-EUR, split all'import, aggancio
  sidebar gated.

  **Restano:** Flusso 5 (trasversali brevi: +Aggiungi entrata · +Aggiungi pack · split Settings) —
  i flussi di INPUT, non ancora mappati. Poi fase finale Motion & Prototipo. Voci Settings rimandate
  (temi/dark post-prototipo, lingua da confermare) invariate. MCP: un blocco bridge a metà sessione
  (timeout durante un build, falso negativo — frame parziale rimosso e ricostruito in passi più
  piccoli; nessun duplicato); riconnesso con verifica `figma.root.name`.
- **Session 16** — **Chiusi i 3 lavori "ORA"** (Filter Chip · Settings Informazioni · micro-label),
  nessun lavoro di schermata nuovo. (1) **Filter Chip refactor** (`95:3234`): da 24 varianti
  (Category×State, categoria cablata) ad **architettura `State`-only** (default/hover/selected/
  **disabled**) + **property testo `label`** — opzione A, scelta dall'utente per adattare il chip
  al labeling del CSV. Larghezza **hug-content** (era FIXED 120px, "Abbonamenti" sforava); colore
  categoria ora **per-istanza** (pallino su `accent/category-{cat}`, `-on-dark` nel selected); stato
  **disabled** = pallino+testo `foreground/disabled` + opacità 0.6. **12 istanze ricablate** (4
  Spending + 8 Categories) con **label italiane** (Spesa/Ristoranti/Trasporti/Abbonamenti/Acquisti/
  Salute/Casa/Altro); contenitori auto-layout → ridistribuiti da soli. **Vecchio set `12:1129`
  eliminato** (0 istanze live). (2) **Settings → "Informazioni"** (`96:3307`/`96:3310`): nuova
  sezione sotto "Carte" — header versione (logo teal + Gesty + 1.0.0) + changelog statico a 3 voci,
  informativo (Gesty è desktop-locale, **no auto-update backend**; changelog incluso nella build).
  Testi placeholder. (3) **Micro-label:** Net Balance "Income/Your share" → **"Entrate/quota tua"**
  (master `38:658`+`38:664` + istanza Overview); **Category Badge italianizzato** (master `11:1040`,
  32 varianti → label IT, istanze auto-aggiornate, 0 override stale); **`layout/grid-columns`**
  confermato scope-vuoto **deliberato** (descrizione aggiornata, non è un difetto d'audit). Effetto:
  chip + badge ora coerentemente IT; nav + titoli restano EN (decisione cross-screen invariata).
  **Due blocchi del bridge MCP** durante la sessione (timeout su read leggere, non falsi negativi);
  risolti con riavvio del Desktop Bridge plugin + verifica `figma.root.name` prima di riprendere.
  Nessun duplicato creato (scan di verifica dopo ogni timeout). Resta: fase finale Motion & Prototipo
  + voci Settings rimandate (temi/dark post-prototipo, lingua da confermare).
  (resta solo la fase Motion & Prototipo). Esplorazione interattiva di 3 forme → scelta **forma A**
  (una scheda che ruota, **autoplay ~75s** + frecce/dots). Creato component set **`Curiosity Card`**
  (`93:3114`, sezione "05 · Feedback & states") con varianti `tone`=neutral/down/up (il tone colora
  solo icona+sfondo-icona; mai colore da solo; sempre descrittivo, mai verdetto). Assemblata la
  **banda `Band 2.5 / Curiosità`** (`93:3115`) nell'Overview tra Metrics e "Dove sono andati i soldi":
  header "LO SAPEVI" + Curiosity Card + nav (‹ • • • • ›). **Spec motore data ai dev** nei **Dev Notes ·
  Overview** (`79:2514`, +7 note): 7 ricette (categoria-vs-solito, mese-vs-anno, giorno più caro,
  concentrazione, peso ricorrenti, top merchant, ponte margine→investimenti), scoring per rilevanza
  (scostamento × significatività importo), autoplay/override/reduced-motion, link "Vedi analisi →"
  con deep-link pertinente, regola storia-sottile (<3 mesi → ricette dipendenti dal solito si
  silenziano; nessuna ricetta sopra soglia → banda non renderizzata). Tutto token-bound, zero
  hardcoded. Nota build: icone Gesty a tratto (stroke su VECTOR) — recolor del tone via binding
  stroke + frame interno svuotato. Token ri-auditati AI-readable a inizio sessione (232 var, 0
  descrizioni/code-syntax/alias mancanti; 10 text + 4 effect styles descritti; unico scope vuoto
  `layout/grid-columns` — da confermare se deliberato). MCP verificato (`figma_get_status` probe 53ms,
  file "Gesty"). Resta: micro-pulizie aperte (label Net Balance "Your share"→"quota tua", refund CSV
  shape, label badge categoria, scope grid-columns) + fase finale Motion & Prototipo.
  **Anche s.15 — audit UI Filter Chip + aggiunte al piano (richiesta utente):** audit completo
  del component set Filter Chip (`12:1129`) — stati ben fatti e token-bound, ma 3 difetti: larghezza
  FIXED 120px ("subscriptions" sfora), categoria cablata nelle 24 varianti, manca `disabled` (vedi
  sezione "UI Audit — Filter Chip"; fix non ancora applicate). Registrate 3 voci Settings: (1)
  "Informazioni" versione+changelog informativo → DA FARE ora (no backend update); (2) TEMI/dark mode
  → RIMANDATO post-prototipo, è token architecture (modo Dark + ri-alias 79 var), ragionamento salvato;
  (3) LINGUA it/en → solo registrato, tensione col vincolo single-locale del brief, portata da
  confermare. Tutto in "On the horizon → Settings espansione" + lista "Next session".
- **Session 14** — **Added `Type=favicon` variant to `Gesty Logo`** (`86:2826`), closing
  the last logo debt. Cloned the `mark` COMPONENT, inverted the colour relationship:
  container fill → `background/brand` (teal) + `radius/small` (quadrato netto, scelto via
  option round su squircle/cerchio per coerenza con la tacca quadrata del wordmark), G
  stroke + punto → `foreground/on-brand` (bianco). Glyph ricentrato e scalato al 70%% per
  padding d'aria — a piena scala il `clipsContent` del contenitore tagliava la G. Tutti i
  binding verificati intatti dopo il rescale (fill/radius/stroke), 24×24, validato a 4×.
  Set description aggiornata a 3 varianti. **Anche s.14 — fix lockup doppia-G:** il
  `Type=lockup` mostrava segno-G + parola intera "Gesty" (due G affiancate, segnalato
  dall'utente). Corretto: wordmark → "esty", il segno-G fa da iniziale, itemSpacing 8→2,
  larghezza 92→70; propagato alle 9 istanze sidebar automaticamente. **Rifinito s.14**
  (feedback utente): "esty" ridotto a 18px (più piccolo del segno) e appoggiato in basso
  (non centrato), spostato a destra per respiro; auto-layout del lockup disattivato (statico
  62×24) per posizionare il wordmark a mano. Binding token verificati intatti. **Anche s.14 — component set `Sidebar`** (`86:2976`):
  `State`=expanded (256px, lockup + voci complete) / collapsed (64px, favicon + sole icone). Lo stato chiuso esisteva solo come
  nota: ora c'è un componente di riferimento per lo sviluppo. expanded clonato dalla sidebar di Overview; collapsed derivato
  (favicon, testi nav nascosti, righe 40×40). Larghezze ripristinate dopo combineAsVariants.
  **Anche s.14 — riordino pagina Design System** per presentazione a stakeholder: pulizia detriti
  (frame `plot`, 2 `Vector` orfani, testo "Not split", tutti a 0,0) + `Income Source Card` orfano
  riposizionato; create 8 Section nominate (00 Overview → 07 Dev Notes) in colonna con gap 160,
  ogni componente con etichetta e ogni sezione con titolo teal; sezione 01 Foundations con card
  esplicativa token. Da 66 nodi top-level sparsi a 8 sezioni, zero orfani. MCP verificato (`figma_get_status` probe 8ms,
  file "Gesty"); token ri-auditati AI-readable a inizio sessione (232 var, 0 descrizioni/
  code-syntax/alias/scope mancanti; 10 text + 4 effect styles tutti descritti). Resta: schede-
  curiosità Overview + fase finale Motion & Prototipo.
- **Session 6** — **Built `Import / Preview`** (`53:1320`), completing **Ring 1**: real CSV
  Dropzone (copy fixed to drop the dd/mm/yyyy promise — file is ISO), bespoke token-bound
  preview/confirm panel (3 summary cells + info banner + preview table reusing Transaction Row
  with a shared row + "altre 35 righe" footer + Annulla/Conferma actions, merge only on confirm),
  "Import recenti" section with success + failed Import History Rows; 3 dev annotations incl. the
  full state machine. Two design decisions locked (inline panel · preview table). **Italianized
  master micro-copy** across Transaction Row ("½ condivisa") and Card Settings Row (4 states) —
  the open micro-copy decision is now resolved; screen + master copy consistently Italian.
- **Session 5** — **Fixed the last AA defect** (`category/other` → #7E8B98, 3.27:1).
  **Built `Spending / Default`** (`49:622`): period selector in the header, Anomaly
  Strip, filter bar (search + top-4 chips + "+N" overflow), always-visible selection
  summary ("quota tua"), flat zebra table with shared/refund rows; 4 dev annotations.
  Three design decisions locked via option round (summary always visible · top 3–4
  chips + overflow · flat table). **Built `Settings / Cards`** (`49:1023`) from Card
  Settings Row (4 states) with the retroactive-recalculation explainer + annotation.
  **Built `Overview / Empty`** (`49:1197`) as a minimal centered card (decision via
  option round), no freshness indicator, CTA → Import. Discovered + logged the
  Transaction Row `alt`-variant structural limit; logged the English master
  micro-copy as an open decision.
- **Session 4** — **Built the Overview in Figma** on a new "Screens" page (app
  scaffold + 4 bands), from real components + tokens. Created two missing nav icons
  (`icon/nav/tag`, `icon/nav/coin`). Rebuilt Band 3 as a clean container (not a
  detached Card). Resolved Hero=your-share and no-period-selector. **Corrected a
  factual error in this doc:** the colour/token system was wrongly listed as "not yet
  established" — it has been complete and in use all along; added a full "Design
  system / tokens" section. Ran an AA audit on the real tokens (all pass except
  `accent/category-other`, logged to fix).
- **Session 3** — Designed the Overview framework (4 bands) in lo-fi; locked it.
  Net-balance-completed-months rule; comparison moved below hero + hides on thin
  history; data-freshness indicator. Registered Analytics "Spesa di base & margine".
  Consolidated all handoffs into this single living document.
- **Session 2** — Finished the component library; reworked the data model around the
  real shared-card reality (per-card split from `Card Last 4`, two amounts per txn,
  three CSV row types, refunds follow the card split, cashback as points only); added
  the eighth sidebar entry (Settings → Cards). Built Anomaly Strip, Sidebar Nav Item,
  Card, Import History Row, Chart Container, Net Balance Display, Card Settings Row;
  updated Transaction Row for the shared-card model.

## Analytics screen — BUILT (session 7, `Analytics / Default`, `55:1696`)
Planner's visual environment. Voce DESCRITTIVA (decisa in sessione: mostra la
leva + equivalenze, mai lode/permesso/tetto). 5 bande, tutte token-bound:
1. Dove sei/dove vai — Chart Container (55:1803), firma storico/proiezione/banda/
   "Oggi"; legenda ITALIANIZZATA (Storico/Proiezione·stima/Oggi).
2. Cosa è cambiato (movers, 57:1836) — per importanza, quota tua, segno+testo.
3. Esplora i compromessi (57:1876) — what-if: chip=leva, slider, "liberi €X" +
   equivalenze (€/anno, contributi ETF, cene fuori). Interattivo → annotato.
4. Spesa di base · margine (57:1903) — base=ricorrente, margine=entrate−base,
   neutro mai rosso.
5. Per categoria · quota tua (57:1920) — breakdown ordinato, click→filtra Spending.
Dev annotations su tutte e 5 le bande + Chart Container. Nav resta INGLESE
(decisione: coerenza cross-screen). Numeri mock annotati.

## Income screen — BUILT (session 8, `Income / Default`, `64:1200`)
Prima schermata di Ring 2 e prima schermata di INSERIMENTO (non solo lettura).
Struttura **Opzione A — registro di fonti** (decisa via giro di opzioni). 3 bande:
1. **Saldo (hero)** — banda success-subtle dedicata (NON il componente Net Balance
   Display): "+€ 1.207,20" + breakdown "entrate − quota tua di spesa" + nota "fatto
   descrittivo, non un tetto". Positivo verde; negativo resterà NEUTRO mai rosso.
2. **Fonti ricorrenti** — griglia 2-col di **Income Source Card** (componente NUOVO),
   solo le ricorrenti come schede (nessun doppione dell'occorrenza mensile).
3. **Una tantum · giugno** — tabella token-bound (righe bespoke leggere: sorgente ·
   data · importo verde "+"), niente category badge (non è spesa).
Header: titolo + sottotitolo "100% tue" + bottone unico **"+ Aggiungi entrata"**
(icona upload ereditata nascosta). 6 dev annotations (`64:1495`).

**Modello dati Income (CORREZIONE sessione 8 — ✓ propagato ai file di contesto in s.10):**
- **Income = solo entrate dell'utente, sempre 100%.** Nessuno split, nessuna "quota
  tua", nessun gross, nessun badge ½. Lo split 50/50 vale SOLO per le spese.
- **Net balance invariato ma più pulito:** `entrate (100% tue) − quota tua di spesa`.
  Due grandezze omogenee, entrambe interamente tue.
- **Rimborsi divisi per provenienza:** rimborso da CSV → resta in **Spending**, segue
  lo split della carta (regola data-contract invariata). Rimborso inserito **a mano**
  → entrata 100% tua in **Income**.
- **Ricorrenti = solo schede** (Modo 1): l'occorrenza mensile non compare come riga.
- **Aggiungi entrata:** bottone unico; il form sceglie ricorrente vs una-tantum.

**Componente nuovo:** **Income Source Card** (`64:1434`, Design System page) — chip €,
nome + cadenza ("↻ mensile · il N"), importo verde, prossima occorrenza, menu ⋯
gestisci. Token-bound, con descrizione.

## Investments screen — BUILT (session 9, `Investments / Default`, `67:1523`)
Seconda schermata di Ring 2 e casa del Chart Container (firma fact-vs-estimate).
Struttura **Framework B — due colonne** (deciso via giro di opzioni: proiezione
aggregata su tutti i pack). Schermata costruita clonando `Income / Default` (eredita
scaffold/sidebar/token), poi svuotato il Main. Sidebar: voce **Investments attiva**.
Header "Investments" + "I tuoi investimenti · inseriti a mano · 100% tuoi", bottone
"+ Aggiungi pack", niente data-freshness (non consuma CSV, come Income).

Bande, top→bottom:
1. **Hero (fatto)** — valore portafoglio + versato + **differenza grezza in euro**
   (valore − versato). MAI % headline. Positivo `foreground/success`; **NEGATIVO
   `foreground/error`** (perdita reale su un fatto — diverso dal net balance che
   resta neutro; decisione sessione 9).
2. **Allocazione (fatto descrittivo)** — barra ETF/Crypto (mock 58/42) + "attuale
   58/42 · target 50/50 · scarto +8 pt" + footnote "fatto descrittivo, non un
   suggerimento di operazione; scarto oltre soglia (10 pt) → evidenziato, non
   azionato". **NON è un alert di ribilanciamento** (vedi decisione sotto).
3. **Due colonne allineate in ALTO** (nessuno stiramento forzato):
   - *Sinistra · Pack (fatto):* schede pack bespoke token-bound. Mock = 3 pack LIVE
     (ETF MSCI All-World, Bitcoin, Ethereum) con badge "● LIVE", unità/quote, prezzo
     live /unità, valore corrente, variazione giornaliera (success/error). Ghost row
     "+ Aggiungi pack". Max 4 pack → oltre, la colonna scrolla.
   - *Destra · Proiezione (stima):* istanza Chart Container `loaded` (testi
     italianizzati su questa istanza), tag "stima", selettore orizzonte **10/20 anni
     default 10**, riga risultato, pannello **"Mostra la matematica" chiuso** (default,
     espandibile).

**Dev Notes · Investments** (`67:1751`, accanto alla schermata): **25 note** che
coprono ogni logica non-rappresentabile in Figma (vedi "Decisioni Investments").

**Componente candidato:** schede pack sono bespoke token-bound, NON un master.
Se reggono → candidate a **"Investment Pack Card"** sulla Design System page (stesso
percorso dell'Income Source Card).

### Decisioni Investments (sessione 9)
- **Proiezione = aggregata** su tutti i pack (una sola curva), MA calcolata
  **per-pack poi sommata** (ETF e crypto crescono diversamente; tasso unico sul
  totale sarebbe meno onesto).
- **Curva storica solida = versato cumulato.** Ogni mese di contributo = un punto
  (€300/mese → 300, 600, 900…). Cambiare il contributo cambia la pendenza da quel
  mese; punti passati invariati. Fatto puro, nessuna crescita retro-proiettata.
- **Valore corrente = punto sopra la fine della linea-versato.** La distanza
  verticale È la differenza grezza. La proiezione tratteggiata parte da QUESTO
  punto, non dal versato.
- **Formula proiezione (per pack):** FV = V0·(1+r)^t + C·[((1+r)^t − 1)/r].
  Somma dei FV per-pack = curva aggregata. È la "matematica mostrata".
- **Banda di confidenza = scenari ± sul tasso** (es. centrale 6%, banda 4–8%), NON
  statistica. Tre curve sommate; banda = area basso↔alto, etichettata coi tassi.
- **Orizzonte:** selettore 10/20, default 10.
- **Matematica:** pannello espandibile, default chiuso (principio 4).

### ✓ REVISIONE BRIEF — prezzo live (sessione 9, propagato in s.10)
Il brief diceva *"holds the contributions… without pretending to report live
performance"* e i principi *"non insegue un performance ticker"*. **Rivisto con
consenso esplicito dell'utente:** i pack quotabili mostrano **valore LIVE**
(unità × prezzo da API esterna). ✓ Propagato a **`01-product-brief.md`** e
**`06-features.md`** (s.10). Resta lo spirito onesto: niente celebrazione del +/−,
fact-vs-estimate distinto, il valore live è un FATTO (separato dalla stima).
- **Modello pack arricchito:** pack LIVE (ticker + unità/quote) vs pack MANUALE
  (valore a mano, modello vecchio). I contributi in € restano per la curva-versato.
- **Crypto come asset class:** volatilità alta → la banda di scenario per i pack
  crypto sarà onestamente molto larga; non spacciare un tasso atteso crypto come
  stabile come un ETF.
  ✓ **REALIZZATO s.13 — curva proiezione scomposta ETF vs crypto.** La proiezione
  ora mostra **due curve** invece di una aggregata: ETF (`accent/success`, dashed) e
  crypto-aggregata (`accent/warning`, dashed), ciascuna **con la propria banda di
  scenario** — banda crypto **visibilmente più larga** (~2× quella ETF: 125px vs 65px
  d'altezza al termine), che rende visibile a colpo d'occhio l'incertezza superiore.
  BTC+ETH **aggregati in un'unica curva "crypto"** (deciso via giro di opzioni: 3 linee
  sarebbero troppo affollate; il messaggio vero è stabile-vs-volatile a due voci).
  Scomposizione = opzione B (due curve, due bande) su A (banda combinata, scartata: media
  l'incertezza, meno onesta) e C (toggle, rimandata). Crypto su `warning`/ambra, **non
  rosso** — la volatilità non è una perdita realizzata. Lo **storico resta una sola curva**
  (`accent/brand`): i contributi passati sono euro versati, non si scompongono per asset.
  Legenda a 3 voci (Storico · ETF · stima · Crypto · stima), distinta per colore + label +
  tratteggio. Sottotitolo header e frase di stima aggiornati ai tassi distinti (ETF 6%,
  crypto 15% con banda ampia; per-pack poi sommati). Costruita come **plot bespoke** dopo
  detach dell'istanza Chart Container (vettori token-bound, giunzione al punto "Oggi"
  validata a (350,145); Analytics intatto). Resta calcolata per-pack poi sommata.

### Ribilanciamento → reso DESCRITTIVO (decisione di principio, sessione 9)
L'utente aveva chiesto una **notifica prescrittiva** "ribilancia per tornare al
50/50". **Rifiutata** perché normativa: viola principio 2 (*honest, not flattering*
— descrittivo mai normativo) e la sezione Out-of-scope di `06` ("real-time
notifications", "opinionated apps", "you can still spend €X"). Sarebbe inoltre
consulenza finanziaria automatizzata. **Sostituita** dalla banda Allocazione
descrittiva: target + soglia editabili; scarto oltre soglia → evidenziato, MAI
azionato. L'utente vede e decide (explorable, headline-first). Decisione accettata
dall'utente.

## Categories screen — BUILT (session 11, `Categories / Default`, `70:1886`)
Ultima schermata di Ring 2. **Tutte le voci di sidebar ora hanno una schermata.**
Clonata dallo scaffold (sidebar + token), voce **Categories attiva**. Struttura
decisa via giro di opzioni: **B+ — "una categoria aperta" con drill-down** (l'utente
ha scelto di approfondire UNA categoria alla volta, ed esplorarne le transazioni
reali). NON un registro panoramico (quello è Analytics Banda 5) né la tabella di
Spending — il lavoro distinto di Categories è *entrare dentro* una categoria.

Bande, top→bottom (Main 1056, gap 32):
1. **Page header** — "Categories" + **freshness indicator** (Categories consuma dati
   CSV, quindi è rilevante — diverso da Income/Investments) + Period Selector.
2. **Selettore categoria** — Filter Chip riusate come selettore (dining/Ristoranti
   attiva = `State=selected`, le altre default). Una categoria alla volta.
3. **Hero** — totale quota tua "€256,00" + confronto descrittivo "+100% sopra il tuo
   solito" (si nasconde su storia sottile, regola Overview). Mai gross.
4. **Cifre di supporto** — scontrino medio · n° transazioni · quota sul mese (Metric
   Card Support ×3).
5. **Andamento** — grafico a barre **SOLO storico** (quota tua per mese), barre legate
   ad `accent/category-{cat}`. **NON usa il Chart Container** (la cui firma è la
   proiezione tratteggiata): mostrare un chart "che proietta" qui confonderebbe fatto e
   stima — le proiezioni vivono solo in Analytics/Investments (principio 2).
6. **Top merchant** — 3–5 esercenti più frequenti dal merchant enrichment (col 4 Curve),
   con n° volte + totale quota tua.
7. **Transazioni della categoria** — il drill-down: Transaction Row filtrate sulla
   categoria, con quota tua/gross + ½ condivisa (riga ••8480; costruita su rigo non
   ombreggiato, anche se ora il limite `alt` è caduto).

**Dev Notes · Categories** (`70:2253`): 10 note (filtro categoria, periodo che
ricalcola tutto, regola confronto, perché niente proiezione, merchant enrichment,
limite `alt` storico, scelta label badge inglese coerente cross-screen, niente
normatività, freshness rilevante).

**Decisioni Categories (sessione 11):**
- Impostazione **una-categoria-aperta + drill-down transazioni** (giro di opzioni).
- Aggiunte richieste dall'utente: **top merchant** + **Period Selector**. Escluso lo
  split quota/gross dedicato (non scelto) e — per principio — la "ricorrente vs
  occasionale" per categoria (resta in Analytics "Spese fisse & margine", per non
  sdoppiare la logica).
- Trend = **solo storico** (decisione di principio: niente Chart Container qui).

## Analytics — REVISED (session 11, `Analytics / Default`, `55:1696`)
Revisione di due bande dopo che l'utente ha segnalato fraintendimenti, + user flow di
navigazione (disegnato inline, non in Figma) + **nuovo pannello Dev Notes · Analytics
(`73:2413`)** con 11 note che coprono TUTTA la logica nascosta (era assente).

**Band 4 — RICOSTRUITA come "barra del reddito" + RINOMINATA "Spese fisse e margine":**
- Rinominata perché "Spesa di base" era ambiguo con la categoria cibo. Ora "Spese" =
  spesa GENERALE.
- Forma A (scelta dall'utente): barra del reddito divisa in **Fisse / Variabili /
  Margine** (teal scuro / teal chiaro / neutro). Il margine è ciò che "avanza"
  visivamente. Margine = entrate − base, in `foreground/success`; se basso resta
  NEUTRO, mai rosso (non è un budget).
- **DERIVAZIONE BASE (la logica più nascosta):** base = parte ricorrente/incomprimibile,
  spese che si ripetono in modo STABILE mese su mese (stesso merchant, cadenza, importo
  simile → affitto, abbonamenti, bollette), stimata sulle MEDIE dei mesi precedenti.
  ✓ **DEFINITA in s.13** — modello ibrido (categoria prior + conferma merchant) + soglie
  di confidenza + stato "in apprendimento" su storia sottile. Spec completa sotto
  "Recurrence heuristic" nel modello dati. Resta da implementare (parser + normalizzazione
  merchant).

**Band 3 — slider reso CHIARAMENTE trascinabile + equivalenze SMART:**
- L'utente non aveva capito che fosse interattivo: lo slider sembrava statico.
  Ricostruito con track + thumb circolare evidente + etichette €0/€max + readout grande.
- **Equivalenze agganciate ai DATI REALI** (richiesta esplicita: "deve essere
  intelligente"), gerarchia decisa dall'utente:
  - **PROTAGONISTA = proiezione investimenti reale:** €Y/mese liberati → aggiunti al
    pack ETF reale → FV a 10/20 anni con la STESSA formula della pagina Investments
    [FV = V0·(1+r)^t + C·((1+r)^t−1)/r]. È il ponte forte verso Investments.
  - **A ROTAZIONE per rilevanza (secondarie):** pattern di spesa reale (categorie/merchant
    veri, es. "≈ il tuo mese di Trasporti") · effetto sul margine (Band 4).
  - Il motore sceglie le 2 più significative per l'importo liberato. Gran parte è
    logica di sviluppo → annotata.
- What-if resta **descrittivo, mai normativo** (nessun "dovresti", nessun tetto).

**User flow di navigazione (confermato, sessione 11):**
- **3 ingressi:** sidebar diretto · Overview "Vedi analisi" · Spending Anomaly Strip.
  Da Anomaly Strip → **DEEP-LINK alla banda pertinente** (scroll + eventuale stato
  preselezionato; es. "Ristoranti +100%" apre Band 5 già su Ristoranti). Scelta
  dell'utente: atterraggio diretto, non in cima. Sviluppo.
- **5 bande** scorse dall'alto; il **periodo** (header) ricalcola tutto e resta dentro
  Analytics (loop, non un'uscita).
- **3 uscite:** Band 5 → Spending filtrato per categoria · Band 3 → Investments via
  equivalenza-proiezione (**invito, non obbligo** — confermato) · ↻ cambio periodo.

## On the horizon (registered, session 8)
- **Logo Gesty (testuale)** — creare un logo più piacevole, definito e **testuale**
  a partire dal nome "Gesty". Oggi nello scaffold il logo è solo il testo "Gesty" in
  `type/heading-3`/brand nella sidebar (placeholder). Obiettivo: un wordmark con
  personalità coerente coi principi (calmo, onesto, legibile ad alta densità) e con
  la palette teal del brand. Da esplorare in un giro di opzioni (preview HTML →
  scelta → eventuale build in Figma come componente sostituibile nello scaffold).
- **Schede-curiosità in Overview** (decise sessione 8): elemento dinamico che RUOTA,
  mostra fatti descrittivi + insight comparativi ("categoria X +Y% vs il tuo solito"),
  mai normativi/giudizi. Parente dell'**Anomaly Strip** di Spending → **stessa famiglia
  di insight, probabilmente stesso componente + motore condiviso** (gran parte della
  logica è lavoro di sviluppo, non Figma). Da progettare quando si torna su Overview.

## Changelog
- **Session 13** — **DEFINED the `base` recurrence heuristic** (no Figma work; feature
  definition closing the last data-model gap). Chosen via option round: **hybrid model**
  (category prior + merchant-pattern confirmation) over category-only (too coarse) and
  merchant-only (misses the prior). Handles both trap cases (one-off in a "fixed" category
  → variable; recurring in a "free" category → base). **Confidence thresholds** (conservative,
  under-declare not inflate): history ≥ 3 months · same normalized merchant in ≥ 3 distinct
  months (tolerates 1 skip / 4) · amount within ±20% of merchant median · monthly cadence
  ±5 days. **Thin history (< 3 months):** Band 4 shows an explicit "in apprendimento ·
  servono ~3 mesi" state, never a silent blank. Prerequisites = merchant normalization of
  raw col-4 + runs on your-share not gross. Full spec written into the data-model section
  ("Recurrence heuristic — `base`"); the stale "recurring notion absent" warning in Band 4
  (s.11) updated; both open items (`On the horizon` + `Open items`) marked resolved.
  Propagated to `gesty-project-state.md` + `06-features.md` (Analytics fixed-vs-margin
  bullet + Spending derived-flag note). Token system re-verified AI-readable at session
  start (232 vars, 0 missing descriptions/code-syntax/broken-aliases/bad-scopes; 10 text +
  4 effect styles all described). MCP verified (`figma_get_status` probe 93ms, file "Gesty").
  Remaining: implementation only (parser + normalization), plus the other cross-cutting
  jobs (Overview curiosity cards, pack-card swap, favicon variant) and the final Motion &
  Prototype phase.
  **Also s.13 — swapped Investments pack cards to the master:** the 3 bespoke pack cards on
  `Investments / Default` replaced with instances of `Investment Pack Card` (`73:2373`) —
  `84:2643` ETF (live/up) · `84:2656` BTC (live/down) · `84:2669` ETH (live/up). Validated
  structurally (same 440×108, identical text, correct variant + token-bound change colour:
  up → `foreground/success`, down → `foreground/error`); bespoke cards removed, no orphans.
  Closes the pack-card-swap debt registered s.9/s.11.
  **Also s.13 — projection decomposition + 7-day change (user request).** (1) **7g on pack
  cards:** added a "7g ±X%" figure beside "oggi" on the two `live` variants of the Investment
  Pack Card master (divider `border/subtle`), then per-instance overrides for ETF/BTC/ETH.
  Live-only (manual packs have no live price → omitted, not invented). 7g colour is
  independent of the `Change` variant (BTC down-today/up-7d), set via paint override; master
  stays 4 variants; card stays 108px. (2) **Decomposed projection curve:** the Investments
  Chart Container instance was **detached** (`67:1712` → bespoke frame `85:2798`) — chosen
  over adding a master variant (the plot is static vectors, not parametric; a variant would
  bloat the shared master used by Analytics too). Built a bespoke plot: two dashed projection
  curves (ETF `accent/success`, crypto-aggregated `accent/warning`) each with its own
  scenario band, crypto band ~2× wider (honest volatility); single solid history
  (`accent/brand`); 3-voice legend; updated header subtitle + estimate line to distinct
  rates. BTC+ETH aggregated to one "crypto" curve. Analytics' Chart Container untouched.
  Note: all validation this session was structural (Figma renders egress via S3, outside the
  bash allowlist — PNG and SVG both); geometry + token bindings verified by API. Propagated
  to `gesty-project-state.md`.
- **Session 12** — **Built component set `Gesty Logo`** (`80:2540`, Design System page),
  chiudendo il primo lavoro trasversale (logo). Giro di opzioni completo: 3 direzioni →
  3 concept elaborati (mark + lockup) → concept "Il punto fermo" → 3 tagli → scelto il
  taglio **C geometrico squadrato** (G a terminali squadrati + tacca quadrata = "dato
  certo"). Component set `Type`=lockup/mark, tutto token-bound (`accent/brand` tratto,
  `foreground/brand` testo+tacca), descritto. **Sostituito il placeholder testuale
  "Gesty"** con istanza del lockup in tutte e 9 le sidebar (stato espanso = canonico).
  **Definito il comportamento sidebar collassabile** (deciso via preview HTML
  interattive): a riposo stretta (solo G), apertura per **prossimità** al bordo sinistro
  (resta aperta finché il mouse è sopra, poi si richiude), G→Gesty con **typing sobrio
  ~200ms**. Le schermate restano espanse (decisione: non regredire i layout approvati);
  il collasso vive come comportamento in nuovo **`Dev Notes · Sidebar`** (`81:2620`,
  7 note). **Registrata la FASE FINALE Motion & Prototipo** (dopo schermate stabili):
  motion spec con skill `/ux-motion` (inventario animazioni dai Dev Notes + token
  durata/easing) + prototipo React navigabile con skill `/interactive-prototype`.
  Token riverificati AI-readable a inizio sessione (232 var, 0 difetti). Opzionale non
  fatto: variante favicon su sfondo teal pieno per il `mark`.
- **Session 11** — **Built `Categories / Default`** (`70:1886`), l'ultima schermata di
  Ring 2: **ogni voce di sidebar ora ha una schermata.** Impostazione "una-categoria-
  aperta + drill-down transazioni" (giro di opzioni); 7 bande incl. selettore a Filter
  Chip, hero, cifre supporto, trend SOLO storico (no Chart Container — niente proiezione
  qui), top merchant (merchant enrichment), tabella transazioni filtrate. Dev Notes
  (`70:2253`, 10 note). **Due lavori brevi chiusi:** (1) **fix variante `alt` del
  Transaction Row** — ora porta la struttura shared (split-marker + gross), il limite
  per-stripe è caduto; (2) **Investment Pack Card promossa a master** (`73:2373`,
  4 varianti Kind×Change, descritta). **Revisione Analytics** dopo fraintendimenti
  segnalati dall'utente: Band 4 ricostruita come "barra del reddito" e rinominata
  "Spese fisse e margine" (forma A; base = ricorrente stimata sulle medie — ⚠ nozione
  "recurring" ancora assente dal modello dati); Band 3 con slider chiaramente
  trascinabile + **equivalenze smart sui dati reali** (protagonista = proiezione
  investimenti FV; secondarie a rotazione). **User flow di navigazione** disegnato
  inline (3 ingressi con deep-link da Anomaly Strip · 5 bande · 3 uscite, incl.
  Investments come invito). **Nuovo Dev Notes · Analytics** (`73:2413`, 11 note) che
  copre tutta la logica nascosta. Token riverificati AI-readable a inizio sessione.
  Prossimo: solo lavori trasversali (logo, schede-curiosità Overview, recurrence
  heuristic, swap pack card).
- **Session 10** — **Propagazioni ai file di contesto** (chiusi i due ⚠ di s.8/s.9):
  rivisto `01-product-brief.md` (prezzo live come fatto, pack live vs manuale, second
  tension qualificata); riscritte le sezioni Investments + Projection in `06-features.md`
  (due tipi di pack, unità/quote, banda Allocazione descrittiva, curva=versato cumulato,
  formula FV, banda=scenari ±); esplicitata in `data-contract-curve-csv.md` la regola
  Income 100% / mai split. Verificata la connessione MCP + leggibilità AI dei token
  (232 var, descrizioni/alias/scope/code-syntax tutti intatti, AA clean). Prossimo:
  Categories.
- **Session 9** — **Built `Investments / Default`** (`67:1523`), seconda schermata di
  Ring 2, framework B (due colonne, deciso via giro di opzioni). Clonata da Income.
  Bande: hero (differenza grezza, negativo→error) · Allocazione descrittiva · due
  colonne (pack a sx, Chart Container per la proiezione a dx, testi italianizzati).
  Selettore orizzonte 10/20, "Mostra la matematica" espandibile chiuso. **25 dev
  note** che coprono ogni logica (curva=versato cumulato, valore corrente come punto,
  aggregazione per-pack, formula FV, banda=scenari ±). **⚠ REVISIONE BRIEF: prezzo
  live** (pack quotabili = unità × prezzo da API; pack LIVE vs manuale; modello dati
  da euro → unità/quote) — accettata dall'utente, DA PROPAGARE a `01` e `06`. Il
  **ribilanciamento prescrittivo richiesto è stato reso descrittivo** (banda
  Allocazione: target+soglia, evidenziato non azionato) per fedeltà a principio 2 +
  Out-of-scope. Schede pack candidate a "Investment Pack Card". Prossimo: Categories.
- **Session 8** — **Built `Income / Default`** (`64:1200`), prima schermata di Ring 2.
  Struttura registro-di-fonti (Opzione A) con 3 bande: saldo hero (success-subtle
  bespoke) + fonti ricorrenti (griglia di **Income Source Card**, componente nuovo
  `64:1434`) + una tantum (tabella bespoke). **Corretto il modello dati Income:
  entrate sempre 100% tue, niente split** (lo split vale solo per le spese); rimborsi
  da CSV restano in Spending, rimborsi manuali sono entrate in Income; ricorrenti solo
  come schede (no doppione). Bottone unico "+ Aggiungi entrata" (form sceglie il tipo).
  6 dev annotations. Registrate le **schede-curiosità di Overview** (rotanti,
  descrittive) come parenti dell'Anomaly Strip → motore di insight condiviso, da
  affrontare con Overview. Prossimo: Investimenti → Categorie.
- **Session 7** — Confermati voce descrittiva + struttura a 5 bande per Analytics;
  schermata completata (annotazioni Bande 3/4/5, legenda grafico in IT). Nav lasciata
  inglese di proposito. Prossimo: Entrate → Investimenti → Categorie (assemblaggio Ring 2).

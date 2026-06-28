# Motion Spec: Gesty

> The single source of truth for **how Gesty moves**. Pairs with the design system
> (tokens, components) and the per-screen Dev Notes. This file collects every motion
> annotation scattered across the Dev Notes into one reconciled inventory, defines the
> duration/easing scale they all draw from, and prepares the values for the React
> prototype (`/interactive-prototype`).
>
> **Figma does not animate.** These tokens live as CSS custom properties + a JS/TS
> export, NOT as a 4th Figma variable collection (decision: keep the variable system at
> 232; motion is a dev-layer concern). Everything here is meant to be read by Claude
> Code at build time — hence both a human-readable table and copy-paste-ready code.

---

## 1. Motion principles & profile

Gesty is a **fintech + SaaS/productivity hybrid**, desktop-only, single-user. Both
profiles demand the same motion personality: **precise, restrained, trustworthy**.

- **Easing:** `ease-out` only for enters; **no bounce, no overshoot, no spring.** The
  one exception is the loading spinner (linear, by nature). This is a deliberate match
  to the product principles — *calmo non affollato*, *honest not flattering*. Motion
  that bounces would read as "flattering"; motion that lingers would break "calm".
- **Duration:** micro-interactions **100–260ms**; the single large movement (sidebar
  width) is the only thing allowed up to ~400ms.
- **Every animation serves one of four functions** — feedback, spatial, state,
  attention. If a movement communicates nothing, it does not ship.
- **Exit = 60–70% of enter.** The user has already seen the element leaving.
- **Hierarchy of speed:** hover/feedback < tooltip/menu < panel/expand < modal <
  sidebar width. Quick things feel instant; context shifts get a beat.
- **GPU-only:** animate `transform`, `opacity`, `filter`. Never `width`/`height`/
  `top`/`left`/`margin`/`padding` (the sidebar width is handled via transform-safe
  technique — see §3).
- **Reduced motion is per-component, not a global kill switch** — instant state or
  crossfade, never a broken-feeling freeze. Full matrix in §5.

---

## 2. Motion tokens

The contribution this spec adds to the system: one small, shared scale every component
draws from. Numbers chosen to absorb the values already annotated in the Dev Notes
(150 for button, 200 for typing/fade, 260 for label slide, 400 for sidebar width).

### Durations

| Token | Value | Use for |
|---|---|---|
| `motion/duration/instant` | 100ms | Button press, toggle feedback — below conscious perception |
| `motion/duration/fast` | 150ms | Button hover, tooltip, menu, chevron rotate |
| `motion/duration/base` | 200ms | Card hover, typing G→esty, Curiosity fade, expand panels |
| `motion/duration/moderate` | 260ms | Sidebar label fade+slide |
| `motion/duration/slow` | 400ms | Sidebar width 72→232px, modal entrance |

Loops sit outside the scale (they are not transitions): **spinner ~700ms linear**,
**skeleton shimmer ~1.5–2s linear**, **Curiosity autoplay ~75s**.

### Easing

| Token | cubic-bezier | Feel | Use for |
|---|---|---|---|
| `motion/ease/out` | `(0.4, 0, 0.2, 1)` | Gentle decelerate | **Default** for enters, hovers, expands |
| `motion/ease/in` | `(0.4, 0, 1, 1)` | Accelerate away | Exits, dismissals |
| `motion/ease/standard` | `(0.4, 0, 0.2, 1)` | Smooth both ends | On-screen repositioning |
| `motion/ease/decelerate` | `(0.22, 0.8, 0.2, 1)` | Arrives with energy, settles | Sidebar width (existing annotated value) |
| `motion/ease/linear` | `(0, 0, 1, 1)` | Constant rate | Spinner, shimmer, opacity-only fades |

No overshoot curve is defined on purpose — there is no context in Gesty that calls for
playfulness over trust.

### CSS (`:root`)

```css
:root {
  /* durations */
  --motion-duration-instant: 100ms;
  --motion-duration-fast: 150ms;
  --motion-duration-base: 200ms;
  --motion-duration-moderate: 260ms;
  --motion-duration-slow: 400ms;
  /* loops */
  --motion-loop-spinner: 700ms;
  --motion-loop-shimmer: 1800ms;
  --motion-loop-curiosity: 75s;
  /* easing */
  --motion-ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --motion-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --motion-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --motion-ease-decelerate: cubic-bezier(0.22, 0.8, 0.2, 1);
  --motion-ease-linear: linear;
}
```

### JS/TS export (for the React prototype + Motion)

```ts
export const motion = {
  duration: { instant: 0.1, fast: 0.15, base: 0.2, moderate: 0.26, slow: 0.4 }, // seconds
  loop: { spinner: 0.7, shimmer: 1.8, curiosity: 75 },
  ease: {
    out: [0.4, 0, 0.2, 1],
    in: [0.4, 0, 1, 1],
    standard: [0.4, 0, 0.2, 1],
    decelerate: [0.22, 0.8, 0.2, 1],
    linear: "linear",
  },
} as const;
```

---

## 3. Component motion inventory

Every row reconciles a real Dev Notes annotation with the token scale. Properties are
**transform/opacity/filter only** unless noted.

| # | Component / interaction | Trigger | Animates | Duration · Easing | Function | Reduced-motion |
|---|---|---|---|---|---|---|
| 1 | **Sidebar — width** | Pointer in left hot-zone (~24–32px); or keyboard focus on any item | `transform`/inline-size 72→232px (see note) | `slow` · `decelerate` | Spatial | Width reduced or instant |
| 2 | **Sidebar — logo G→Gesty** | Sidebar expands | "esty" letters fade in (G never moves) | `base` · `out` | State | Static "Gesty" already complete |
| 3 | **Sidebar — nav labels** | Sidebar expands | opacity 0→1, translateX −6→0, stagger ≤20ms | `moderate` · `out` | Spatial | Appear/disappear, no slide |
| 4 | **Button — hover** | Pointer enter | shadow lift (no scale — finance restraint) | `fast` · `out` | Feedback | Instant color/shadow |
| 5 | **Button — press** | Pointer down | scale 0.98, shadow reduce; release faster | `instant` · `out` | Feedback | Instant |
| 6 | **Button — focus ring** | Keyboard focus | `border/focus` teal ring via `:focus-visible` | `fast` · `out` | Feedback | Ring appears instantly |
| 7 | **Button — loading spinner** | `state=loading` | ring rotation, continuous | `loop/spinner` · `linear` | State | **No rotation** — disabled + "Caricamento…" label |
| 8 | **Curiosity Card (Overview)** | Autoplay ~75s, or ‹ › / dots | crossfade between cards | `base` · `out` (fade ~200ms) | Attention | Autoplay OFF; manual only; or no transition |
| 9 | **Anomaly Strip — hover** | Pointer enter | border→default, surface→elevated, subtle shadow, link underline | `fast` · `out` | Feedback | No transition |
| 10 | **Anomaly Strip — focus** | Keyboard focus | 2px `border/focus` ring, 2px offset | `fast` · `out` | Feedback | Ring instant |
| 11 | **Transaction Row — expand** | Click row (not badge) | chevron 0°→90° rotate; detail panel reveals below | `base` · `out` | Spatial | Panel opens without slide; chevron snaps |
| 12 | **Filter Chip — select/hover** | Click / pointer enter | fill + text-color + dot color change | `fast` · `out` | State | Instant |
| 13 | **Import — state machine** | empty→parsing→preview→done | crossfade between states; parsing = **skeleton shimmer** | states: `base` · `out`; shimmer: `loop/shimmer` · `linear` | State | Crossfade only; shimmer becomes static placeholder |
| 14 | **Import — duplicates "vedi →"** | Click affordance | rows reveal below (same expand pattern as #11) | `base` · `out` | Spatial | Reveal without slide |
| 15 | **Table skeleton** | Loading | gradient sweep L→R | `loop/shimmer` · `linear` | State | Static placeholder, no sweep |
| 16 | **Analytics — what-if slider** | Drag thumb 0→category spend | thumb follows pointer; readout updates live (no transition on the number) | drag is 1:1, no eased duration | Feedback | Unchanged (functional, not decorative) |
| 17 | **Analytics — deep-link scroll** | Anomaly Strip / Overview entry | scroll to relevant band | `moderate`–`slow` · `standard` | Spatial | `scroll-behavior: auto` (jump) |
| 18 | **Analytics / Investments — "Mostra la matematica"** | Click | accordion expand (grid-rows 0fr→1fr + opacity) | `base` · `out` | Spatial | Instant open |
| 19 | **Investments — assumptions slider** | Drag rate/contribution/horizon | projection recomputes; curve redraws | recompute instant; redraw ≤`base` | Feedback | Curve updates without redraw animation |
| 20 | **Investments — per-asset ↔ scenarios toggle** | Click toggle | **direct replacement, NO morphing** (annotated) | `fast` crossfade · `out` | State | Instant swap |
| 21 | **Modal (Add income / pack / split 5a-c)** | "+ Aggiungi…" / edit | scale 0.96→1 + fade; backdrop fades in parallel | enter `slow` · `out`; backdrop `base` · `linear`; exit 60–70% · `in` | Spatial | Instant appear, no scale |
| 22 | **Split recalc (5c)** | Confirm retroactive recalc | non-blocking progress (skeleton, not spinner) | `loop/shimmer` · `linear` | State | Static progress indicator |
| 23 | **Return link** | After stateful deep-link only | fade in/out | `fast` · `out` | Attention | Appear/disappear instant |
| 24 | **Card hover** (generic) | Pointer enter | translateY −2px, shadow increase (no scale) | `base` · `out` | Feedback | Shadow only, no lift |

**Note on #1 (sidebar width):** animating `inline-size`/`width` is normally banned.
Two acceptable techniques for the prototype: (a) Motion's `layout` animation, which uses
a transform-based FLIP under the hood; or (b) animate a `transform: translateX` on the
content + a fixed-width track. Do **not** transition raw `width` with CSS. Flagged for
the implementer.

---

## 4. Choreography

Only three interactions are orchestrated sequences; everything else is a single
transition. Total budget ≤500ms each.

**Sidebar open** (the signature sequence):
1. Width 72→232px starts immediately (`slow` · `decelerate`).
2. At ~50% (≈200ms in), labels begin fade+slide (`moderate` · `out`), stagger ≤20ms.
3. In parallel with labels, logo "esty" types in (`base` · `out`).
Overlap is intentional — the labels don't wait for the width to finish. Close reverses,
slightly faster.

**Modal open:**
1. Backdrop fades (`base` · `linear`).
2. Overlapping at ~50%, panel scales 0.96→1 + fades (`slow` · `out`).
Parent (backdrop) before child (panel), per the parent-child rule.

**Import state machine:**
Sequential, not staggered — each state crossfades to the next (`base` · `out`). Parsing
holds on the skeleton shimmer loop until data is ready, then crossfades to preview. No
state blocks interaction longer than its own transition.

---

## 5. Accessibility

`prefers-reduced-motion` is handled **per component** (the right-hand column of §3), not
with a global `* { animation: none }`. Principles:

- **Replace, don't remove.** Slide → instant appear. Crossfade stays (a fade is not a
  vestibular trigger). Width animation → reduced or instant. Functional motion that
  isn't decorative (proximity open, slider drag) **stays** — it carries meaning.
- **Vestibular:** the sidebar width change is the only large-viewport movement; it is
  contained to the left edge, not full-screen, and is reducible. No parallax, no zoom,
  no spin anywhere in Gesty.
- **WCAG:** nothing flashes >3×/s (2.3.1). Motion is disableable via the OS preference
  (2.3.3); a future in-app motion toggle can map to the same media query — registered,
  not built (post-prototype, with the themes/language Settings work).
- **Keyboard parity:** the sidebar's pointer hot-zone has a keyboard equivalent (focus
  any nav item opens it); the spinner's reduced-motion fallback keeps a text label so
  loading state is never conveyed by motion alone.

```css
@media (prefers-reduced-motion: reduce) {
  /* Prefer per-component fallbacks above; this is the safety net. */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. Implementation notes

| Scenario | Tool | Why |
|---|---|---|
| Hover, focus, press, chip, button states | **CSS transitions** | Zero overhead, native 60fps |
| Skeleton shimmer, spinner | **CSS @keyframes** (linear loop) | Declarative, no JS |
| Sidebar open, modal, Curiosity crossfade, row expand | **Motion (Framer Motion)** | Springs not needed, but layout + orchestration + reduced-motion variants are cleaner declaratively |
| Per-asset↔scenarios, projection redraw | React state + Motion `AnimatePresence` | Direct replacement, no morph |
| Deep-link scroll | `scrollIntoView({behavior})` gated on the media query | Native |

Rules carried from the skill: animate only `transform`/`opacity`/`filter`; `will-change`
only on elements about to animate, removed after; all animations **interruptible** (never
block the path through a task); test the redraw-heavy charts on a throttled CPU.

**This spec feeds `/interactive-prototype`.** The prototype is where these values become
real animations on the assembled, navigable screens — the deliverable Figma can't give.

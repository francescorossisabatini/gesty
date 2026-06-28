# Design System Building Practices

This file tells you how to architect and build design tokens in Figma. It covers the structure, naming, scoping, and implementation details so you can build a production-quality, cross-platform design system.

You are not given specific values (no hex codes, no font sizes, no spacing numbers). Those come from the designer through conversation — informed by the product brief, personas, and style tile. This file teaches you how to structure whatever values the designer decides on.

## Token Architecture

Use a three-collection structure with effect styles for shadows. This follows the industry-standard Primitive → Semantic model used by Shopify Polaris, IBM Carbon, Google Material 3, and Adobe Spectrum.

### Collection 1: Primitives

**Purpose:** Raw values with no semantic meaning. The color palette, the type size scale, the spacing scale. These are the building blocks that semantic tokens reference.

**Modes:** 1 mode called "Value". Primitives don't change between platforms or themes — they're the library.

**Visibility:** Hidden from Figma property pickers by default (scopes = []). Selectively open mid-range values (200–400 for colors, mid-range for spacing/radius) as fallbacks for one-off design needs. This follows Shopify Polaris's approach: "When no semantic token is a good fit, a primitive token should be used instead."

**Contains:**
- Color scales (e.g., purple/50 through purple/950, neutral/0 through neutral/950, plus accent color families)
- Type size scale (e.g., size/100=11, size/200=12, size/300=14, etc.)
- Spacing scale (e.g., space/100=4, space/200=8, space/300=12, etc.)
- Radius scale (e.g., radius/100=4, radius/200=8, radius/300=12, etc.)
- Font weights (e.g., weight/regular=400, weight/medium=500, weight/semibold=600, weight/bold=700)
- Font families (string variables, e.g., family/primary="Inter", family/mono="JetBrains Mono")

**Naming:** Simple scale naming. `{category}/{step}` for numbered scales. `{category}/{name}` for named values.

### Collection 2: Color

**Purpose:** Semantic color tokens that tell designers what to use where. Grouped by the element being colored (background, foreground, border) so the right tokens appear in the right Figma picker context.

**Modes:** Start with 1 mode called "Light". This is expandable to Light/Dark later by adding a Dark mode column and re-aliasing to different primitives.

**Naming convention — property-first, then intent:**

```
background/{context}       → what surface am I coloring?
foreground/{context}        → what text or icon am I coloring?
border/{context}            → what edge or divider am I coloring?
accent/{context}            → what badge, icon fill, or indicator am I coloring?
```

**Scopes (critical for picker usability):**

| Token group    | Figma scopes                | Why                                                    |
|----------------|-----------------------------|---------------------------------------------------------|
| background/*   | FRAME_FILL, SHAPE_FILL      | Shows in fill picker for frames and shapes              |
| foreground/*   | TEXT_FILL, SHAPE_FILL        | Shows in text color picker AND icon/shape fills         |
| border/*       | STROKE_COLOR                 | Shows only in stroke picker                             |
| accent/*       | FRAME_FILL, SHAPE_FILL       | Shows in fill picker for badges, indicators, rings      |

This scoping ensures designers see only relevant tokens in each context. When you select a text layer, you only see foreground tokens. When you fill a frame, you only see backgrounds and accents.

**Recommended semantic tokens:**

Backgrounds: page, card, input, elevated, overlay, inverse, brand, brand-subtle, action, action-hover, action-pressed, destructive, destructive-hover, success, warning, error, info, disabled. Add more for product-specific needs — for Ledger this means spending-category colors (e.g., category/groceries, category/transport, category/dining, category/subscriptions), an estimate/projected family distinct from actuals (e.g., estimate, estimate-subtle), and chart-series backgrounds.

Foregrounds: primary, secondary, tertiary, inverse, on-brand, on-action, brand, success, warning, error, info, disabled. Add more matching any custom background categories.

Borders: default, subtle, strong, focus, brand, success, warning, error, info. Add more matching any custom background categories.

Accents: brand, success, warning, error, info. Add more for product-specific categories.

**Every token MUST have a description.** Descriptions should lead with concrete component examples, not abstract role language:
- Good: "Card and container surfaces — the white panels that hold content. Use for cards, modals, bottom sheets, and any elevated content container."
- Bad: "The default surface color."
- Good: "Error messages, wrong answer feedback, validation failures. Supportive tone — 'Try again' not 'You failed'."
- Bad: "Text color for error states."

Where relevant, include pairing guidance in descriptions: "Pair with foreground/on-action for button text."

### Collection 3: Dimensions

**Purpose:** All non-color tokens that define sizing, spacing, and layout. This is where cross-platform adaptation happens.

**Modes:** 2 modes — "Mobile" and "Web". Switching a frame's mode updates typography, spacing, and layout simultaneously. This is the power move: one mode switch adapts the entire design to a different platform.

**Contains four categories:**

#### Typography variables

Individual properties that Text Styles will reference. Figma doesn't support composite typography variables — you create individual variables for each property, then combine them into Text Styles.

| Property        | Variable type | Figma scope      | Varies by mode? | Notes                                        |
|-----------------|---------------|------------------|-----------------|----------------------------------------------|
| Font size       | FLOAT         | FONT_SIZE        | Yes             | Mobile sizes are typically smaller than web   |
| Line height     | FLOAT         | LINE_HEIGHT      | Yes             | Tighter on mobile, more generous on web       |
| Letter spacing  | FLOAT         | LETTER_SPACING   | Rarely          | Usually same across platforms                 |
| Font weight     | FLOAT         | FONT_WEIGHT      | No              | Same weight regardless of platform            |
| Font family     | STRING        | FONT_FAMILY      | Possible        | Same if using a custom font like Inter; different if using platform-native fonts (SF Pro vs Roboto) |

**Naming:** `type/{role}/{property}`

```
type/display/size           → Mobile: 28  | Web: 36
type/display/line-height    → Mobile: 34  | Web: 42
type/display/weight         → 700 (same both modes)
type/display/letter-spacing → -0.5 (same both modes)
type/heading-1/size         → Mobile: 24  | Web: 28
type/body/size              → Mobile: 15  | Web: 16
type/body/line-height       → Mobile: 22  | Web: 26
type/caption/size           → Mobile: 12  | Web: 12
type/label/size             → Mobile: 14  | Web: 14
```

Don't over-specify the type scale. 8–12 semantic roles is sufficient for most products:
- display — hero headings, splash screens
- heading-1 — page titles
- heading-2 — section headers, card titles
- heading-3 — subsections, list group titles
- body — default reading text
- body-small — secondary content, compact layouts
- caption — timestamps, metadata, helper text
- label — button text, input labels, navigation items
- label-small — badges, chips, tab labels
- overline — section markers, category labels (optional)

#### Text Styles

After creating typography variables, create Figma Text Styles that reference them. Each text style is a composite that pulls font family, size, weight, line height, and letter spacing from variables.

Name text styles to match the variable roles: `type/display`, `type/heading-1`, `type/body`, etc.

When a frame's mode switches from Mobile to Web, all text styles automatically update because the underlying variables change. No duplicate styles needed.

#### Spacing variables

All spacing values should follow a base unit (typically 4px). The primitive scale provides the full range. Semantic spacing tokens give meaning to specific values.

| Variable type | Figma scope | Varies by mode? |
|---------------|-------------|-----------------|
| FLOAT         | GAP         | Yes — mobile uses tighter spacing, web has more room |

**Naming:** `spacing/{context}`

```
spacing/page-margin         → Mobile: 16  | Web: 32
spacing/card-padding        → Mobile: 16  | Web: 24
spacing/section-gap         → Mobile: 24  | Web: 32
spacing/content-gap         → Mobile: 12  | Web: 16
spacing/inline-gap          → Mobile: 8   | Web: 8
spacing/component-padding   → Mobile: 12  | Web: 16
```

Keep semantic spacing tokens focused on the most common use cases. Designers can fall back to primitive spacing values for one-offs.

#### Border radius variables

| Variable type | Figma scope    | Varies by mode? |
|---------------|----------------|-----------------|
| FLOAT         | CORNER_RADIUS  | Rarely — usually consistent across platforms |

**Naming:** `radius/{context}`

```
radius/small       → 4 (subtle rounding for small elements)
radius/medium      → 8 (standard rounding for cards, inputs)
radius/large       → 12 (prominent rounding for modals, sheets)
radius/xl          → 16 (strong rounding for feature cards)
radius/pill        → 999 (fully rounded for chips, badges, tags)
```

Values are the same in Mobile and Web modes unless the designer specifically wants platform-specific rounding.

#### Layout variables

| Variable type | Figma scope    | Varies by mode? |
|---------------|----------------|-----------------|
| FLOAT         | WIDTH_HEIGHT or ALL_SCOPES | Yes |

**Naming:** `layout/{property}`

```
layout/max-content-width    → Mobile: 100%* | Web: 1200
layout/grid-columns         → Mobile: 4     | Web: 12
layout/grid-margin          → Mobile: 16    | Web: 32
layout/grid-gutter          → Mobile: 8     | Web: 24
```

*Note: Figma number variables can't express percentages. For mobile, you may omit max-content-width or use a large placeholder value. The key use is the web max-width constraint.

### Effect Styles (Elevation / Shadows)

Figma does not support shadow/blur values as variables. Elevation must be defined as Effect Styles.

**Naming:** `elevation/{level}`

```
elevation/none     → No shadow (flat surface)
elevation/low      → Subtle shadow for cards resting on a surface
elevation/medium   → Moderate shadow for dropdowns, popovers
elevation/high     → Strong shadow for modals, dialogs, command palettes
```

Keep it to 3–4 levels. Most design systems work well with 4–6 elevation levels — more than that creates decision fatigue.

## Figma Implementation Rules

These rules apply to every variable and style created:

1. **Every variable gets a description.** No exceptions. The description is what makes the system AI-readable and designer-friendly. Lead with component examples, include pairing guidance where relevant.

2. **Every variable gets scopes.** Never use ALL_SCOPES on semantic tokens. Primitives get empty scopes (hidden) by default, with mid-range values selectively opened. Semantic tokens get targeted scopes matching their role.

3. **Every variable gets WEB code syntax.** Use the `var(--token-name)` format. This ensures clean handoff in Figma's Dev Mode. Example: `var(--background-card)`, `var(--type-body-size)`.

4. **Semantic tokens alias to primitives.** Never duplicate raw values in the semantic layer. Use `{ type: 'VARIABLE_ALIAS', id: primitiveVar.id }`. The one exception is tokens requiring transparency (like overlays), which need raw RGBA values.

5. **Build in small sequential steps.** Never try to create everything in one Figma Plugin call. Break work into: create collection → create primitives batch by batch → create semantic tokens batch by batch → validate.

6. **Validate after each batch.** Check counts, missing descriptions, missing code syntax, and broken aliases before proceeding.

## Naming Convention Summary

| Category           | Pattern                        | Examples                              |
|--------------------|---------------------------------|---------------------------------------|
| Primitive colors   | `{hue}/{step}`                  | purple/400, neutral/900, cobalt/50    |
| Primitive scales   | `{category}/{step}`             | size/400, space/200, radius/300       |
| Primitive weights  | `weight/{name}`                 | weight/regular, weight/bold           |
| Primitive families | `family/{role}`                 | family/primary, family/mono           |
| Color tokens       | `{element}/{context}`           | background/card, foreground/primary   |
| Type tokens        | `type/{role}/{property}`        | type/body/size, type/heading-1/weight |
| Spacing tokens     | `spacing/{context}`             | spacing/card-padding, spacing/page-margin |
| Radius tokens      | `radius/{context}`              | radius/medium, radius/pill            |
| Layout tokens      | `layout/{property}`             | layout/grid-margin, layout/max-content-width |
| Elevation styles   | `elevation/{level}`             | elevation/low, elevation/high         |
| Text styles        | `type/{role}`                   | type/body, type/heading-1, type/display |

## What This File Does NOT Decide

The following are creative decisions made by the designer in conversation with Claude, informed by the product brief, personas, style tile, and design principles:

- Which colors to use (palette, accents, brand colors)
- Which typeface(s) to use
- What font sizes and line heights to set
- How much spacing to use
- How rounded corners should be
- How many accent colors the product needs
- Whether the type scale should be tight or generous
- Whether shadows should be subtle or dramatic

This file ensures that whatever the designer decides, it gets built correctly — with the right structure, naming, scoping, and descriptions to make a production-quality, cross-platform design system.

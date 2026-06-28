
# Visual Standards for Token Displays in Figma

When you create visual reference frames for design tokens in Figma, treat them as portfolio-quality work. These should look like something a designer would be proud to share.

## Presentation rules

* Use auto-layout on everything. No manually positioned elements.
* Group related tokens together with clear section titles.
* Every swatch or sample should show: the token name, the value, and the description.
* Give tokens generous spacing. Cramped displays are hard to scan and look unfinished.
* Use the design system's own typography and colors for labels and frames. The token display should feel like it belongs to the system it's documenting.
* Align everything to a consistent grid. No orphaned elements floating in space.
* Size frames intentionally. A color swatch that's 20x20px communicates nothing. Make them large enough to actually evaluate the color.
* Use visual hierarchy in the labels. Token name should be most prominent, value secondary, description tertiary.
* Keep backgrounds clean. Use the system's surface tokens for the frame background, not Figma's default white or grey.

## What to avoid

* Walls of tiny rectangles with hex codes. That's a spreadsheet, not a design system.
* Inconsistent sizing between similar tokens.
* Missing labels or descriptions on any token.
* Text that's too small to read at normal zoom.
* Flat, lifeless layouts that don't reflect the quality of the system itself.

## Go further

Don't just show tokens in isolation. Bring them to life:

* **Usage examples.** Show tokens in context where it helps. A color swatch is useful, but a mini preview of that color as a button background or a card surface tells a better story. Add these where they make the token easier to understand.
* **Accessibility pairings.** For color tokens, show which text colors pass contrast on which backgrounds. Display the actual contrast ratio next to each pairing.
* **Type in context.** Don't just list type sizes in a scale. Show a realistic content block (heading + subheading + body + caption) to demonstrate how the type scale works together.
* **Do / don't examples.** For tokens where misuse is common (like using a feedback color as a brand accent), show a correct and incorrect pairing side by side.
* **Token relationship maps.** Show how primitive tokens (raw hex values) map to semantic tokens (color/text/primary). Visualize the connection so the system's logic is visible.
* **Spacing in action.** Don't just list spacing values. Show them applied to a real layout: padding inside a card, gap between list items, margin between sections.
* **Personality annotations.** Add short notes next to key tokens describing the feeling or intent: "This surface color keeps long reading sessions comfortable" or "This accent draws attention without competing with content."

The goal: someone looking at these frames should understand the system AND feel excited about using it.

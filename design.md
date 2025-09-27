# Zen Minimalist Design System

Status: Draft v0.2  
Scope: Site-wide frontend (Next.js + Tailwind + static export)

Summary

- A calm, ultra-fast, black-and-white interface that prioritizes clarity and breathing room. No gradients, no shadows, minimal lines. Whitespace and typography carry the hierarchy.
- Typography is the primary visual system; interaction cues are subtle but accessible.
- Mobile-first, PHT-aware, and WCAG 2.2 AA-aligned.

Design Principles

1. Remove the non-essential

- Prefer plain background (white) and black text. Avoid decorative elements.
- Use whitespace instead of borders and boxes to separate content.
- Keep iconography minimal and meaningful; no illustrative art.

2. Typography over chrome

- Roboto only (weights 300, 400, 500). No other typefaces.
- Quiet headings; body text is comfortable and readable.
- Numeric information uses tabular figures for stability (countdowns, dates).

3. Consistent rhythm

- Use a small, repeatable spacing scale to create flow and predictability.
- Avoid ad-hoc paddings/margins; stick to tokens.

4. Accessible by default

- Clear focus states; links are obviously interactive.
- Respect reduced motion preferences.
- Maintain strong color contrast (minimum WCAG 2.2 AA).
- Use dark text on colored backgrounds; avoid white text unless with adequate shadows/contrast.
- Provide immediate context (legends, labels) for color-coded information.

Foundations
Color palette (strict, neutral + functional accents):

- Background: #FFFFFF
- Ink (primary text): #111111
- Ink-2 (muted): #6E6E6E
- Hairline (rare): #E5E5E5 (use sparingly; prefer spacing over lines)
- Accent: #CC7722 (functional highlights, CTAs, interactive elements)
- Accent-light: #E09A55 (secondary highlights, badges, suggestions)
- Accent-muted: #AA6600 (subtle accents, hover states)

Typography:

- Family: Roboto (300, 400, 500)
- Base size: 16px; line-height: 1.6
- Headline (H1): 24–32px (clamp)
- Section title (H2): 16px, medium
- Kicker/eyebrow: 12px uppercase, letter-spacing +0.08em
- Numerals: tabular-nums for countdowns and dates

Spacing scale (px):

- 2, 4, 6, 8, 12, 16, 24, 32, 40, 56
- Use these values consistently for margins, paddings, and gaps.

Layout:

- Container max-width: 720px (desktop), full-width on mobile
- Horizontal padding: 24px desktop, 16px mobile
- Left alignment by default; center only for the top menu link

Accessibility

- Focus states: dotted outline (1px) with 2px offset on interactive elements.
- Countdown: role="timer", aria-live="polite", aria-atomic="true". Provide labels for each segment (Days/Hours/Minutes/Seconds).
- Reduced motion: slow down or limit interval updates when prefers-reduced-motion is on.
- Links: hover underline; avoid reliance on color alone to indicate interactivity.

Components
Toolbar (menu bar):

- Content: Single link centered at the top; label is uppercase, small caps feel via letter spacing.
- States: underline on hover; dotted outline on focus.
- Example: “long weekend visualizer” → links to the visualizer route.

Countdown:

- Single line of large numerals with separators (:) between groups; no boxes.
- Use tabular numbers for stability; align baselines.
- When it reaches zero, show a quiet line: “Today is [Holiday]”.

Upcoming list:

- Semantic UL with each row as name (left) and date (right).
- No bullets, no borders; vertical spacing separates rows.
- Muted date color; use tabular-nums.

Holiday table (site-wide pattern guidance):

- Prefer borderless table with subtle row spacing.
- If lines are necessary, use hairlines (#E5E5E5) and keep density low.
- Left-align text; reserve right alignment for dates/quantities when needed.

Calendar visualization:

- Mini-calendar grid format with CSS Grid (7-column layout)
- Day headers in muted gray (#6E6E6E), uppercase, small
- Weekend days: light gray background (#F9F9F9)
- Holiday days: accent background (#CC7722) with dark text (#111111)
- Suggested leave: accent-light background (#E09A55) with dark text and star indicator
- Long weekend ranges: light accent tint (#FFF3E6) with left accent border
- Month headers: centered, uppercase, medium weight

Legend component:

- Position at top for immediate context
- Horizontal flex layout with color swatches
- 12px color squares with 2px border-radius
- Light gray background container (#FAFAFA)
- Clear, concise labels matching visual elements

Navigation sidebar:

- Sticky positioning with scroll-spy highlighting
- Minimal link styling with hover background states
- Month abbreviation + day format for quick scanning
- Smooth scroll behavior for section jumping

Performance & Delivery

- Roboto via Google Fonts with display=swap; weights 300/400/500 only.
- Avoid web libraries for display logic; vanilla JS where possible.
- No gradients, shadows, heavy background images, or CSS animations.

Implementation Guidelines
CSS variables (vanilla CSS):

- Declare once in :root.

Example (variables and base rules):

```css
:root {
  --bg: #ffffff;
  --ink: #111111;
  --ink-2: #6e6e6e;
  --accent: #cc7722;
  --accent-light: #e09a55;
  --accent-muted: #aa6600;
  --hairline: #e5e5e5;
  --container: 720px;
}
html,
body {
  height: 100%;
}
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: "Roboto", system-ui, -apple-system, Segoe UI, Roboto, Arial,
    sans-serif;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
```

Tailwind alignment (if applying in the Next.js app):

- Add Roboto as first font in theme.fontFamily.sans
- Constrain colors to neutral; avoid brand palettes
- Prefer tracking-wider for menu labels; underline on hover
- Use prose-like spacing through consistent utilities (gap/mx/my/p)

Example tailwind.config.js excerpt:

```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Roboto",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#111111",
        "ink-2": "#6e6e6e",
        hairline: "#e5e5e5",
        bg: "#ffffff",
      },
      maxWidth: {
        container: "720px",
      },
    },
  },
};
```

Responsive rules

- Mobile-first CSS; scale type with clamp().
- Breakpoints (guidance):
  - ≤480px: tighter paddings (16px), countdown digits scale down
  - 481–768px: container up to 720px, normal paddings (24px)
  - ≥769px: maintain 720px max width, generous whitespace

Interactive states

- Hover: underline links (do not rely on color shift)
- Focus-visible: 1px dotted outline, 2px offset
- Active: optional subtle opacity reduction (no color inversion)

Do’s and Don’ts
Do

- Keep screens sparse. One primary action or focal datum per view.
- Prefer text over icons. Prefer whitespace over lines.
- Use consistent spacing and type scale.
- Use dark text on colored backgrounds for maximum readability.
- Position legends and context immediately visible, not buried below fold.

Don’t

- Add color accents, gradients, drop shadows, or ornamental dividers.
- Introduce secondary fonts or heavy icon sets.
- Use dense borders or zebra-striping unless absolutely necessary.

Reference

- Prototype implementation in design4/ demonstrates the core patterns (toolbar link, countdown, upcoming list) using only HTML/CSS/JS.
- Long Weekend Visualizer (longweekendvisualizer.html) showcases advanced patterns: calendar grids, color-coded information, sidebar navigation, and scroll-spy behavior.

Changelog

- v0.1 (Initial): Principles, tokens, components, and implementation guidance.
- v0.2 (Long Weekend Visualizer): Added functional accent colors, calendar visualization patterns, improved text contrast principles, legend/sidebar components, and scroll interaction patterns.

# Blog Asset Rules

This document defines the visual rules for blog cover images used across the MyDesigner blog.

---

## Cover Image Specs

| Property     | Value                        |
|--------------|------------------------------|
| Format       | SVG                          |
| Width        | 1200px                       |
| Height       | 630px                        |
| ViewBox      | `0 0 1200 630`               |
| File location| `assets/images/blog/<slug>-cover.svg` |

---

## Background

- Base fill: `#FFFFFF`
- Dot pattern overlay: `<circle r="1.6" fill="#E4E4E4"/>` on a `36x36` grid (`patternUnits="userSpaceOnUse"`)
- The dot pattern sits on top of the white base as a second `<rect>` using `fill="url(#dots)"`

---

## Brand Decoration (required on every cover)

Four concentric rings anchored at the **top-right corner** (`cx=1110, cy=80`), always present, always subtle:

| Ring | Radius | Stroke color | Stroke width |
|------|--------|--------------|--------------|
| 1    | 170    | `#F0F0F0`    | 38           |
| 2    | 240    | `#F0F0F0`    | 28           |
| 3    | 310    | `#EFEFEF`    | 20           |
| 4    | 380    | `#EEEEEE`    | 14           |

All rings: `fill="none"`, decorative only, never overlap or distract from the illustration.

---

## Accent Color

Each post gets **one accent color** expressed as a `linearGradient`. The color is chosen to match the emotional tone of the topic:

| Tone         | Example use case       | Gradient                          |
|--------------|------------------------|-----------------------------------|
| Urgency/risk | Design debt, warnings  | `#FF5252` → `#C0392B` (red)       |
| Energy/signal| AI, emerging trends    | `#FFA848` → `#FF640D` (orange)    |
| Trust/growth | Accessibility, process | `#4EA8DE` → `#1A6FAD` (blue)      |
| Calm/neutral | Strategy, planning     | `#6BCB77` → `#2D9E44` (green)     |

The gradient is defined in `<defs>` and referenced throughout the illustration.

---

## Illustration

- **Abstract and conceptual** — no photos, no text labels, no logos embedded in the SVG
- Built from simple SVG primitives: `<rect>`, `<circle>`, `<line>`, `<path>`
- Visually represents the post's core metaphor (e.g. misaligned blocks for design debt, radar signal for AI signal vs. noise)
- Uses **low opacity layering** (`opacity: 0.40–0.90`) to create depth without visual noise
- Illustration occupies roughly the **left 70%** of the canvas; the right side remains lighter

---

## Accent Lines

Two thin diagonal lines using the accent color, always at very low opacity:

- Line 1: lower-left toward upper-center (e.g. `x1="100" y1="580" x2="550" y2="200"`)
- Line 2: mid-right toward far-right edge (e.g. `x1="820" y1="560" x2="980" y2="460"`)
- Stroke width: `1`
- Opacity: `0.14–0.22`
- `stroke-linecap="round"`

---

## What to Avoid

- No text, titles, or labels inside the SVG
- No photographs or raster image embeds
- No more than one accent color per cover
- No dark or filled backgrounds — always white base
- No brand rings repositioned or removed
- Do not use high-opacity fills that make the dot pattern invisible

---

## Naming Convention

```
assets/images/blog/<post-slug>-cover.svg
```

The `coverImage` field in the post's frontmatter must match:

```yaml
coverImage: /assets/images/blog/<post-slug>-cover.svg
```

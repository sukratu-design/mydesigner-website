# Blog Cover Image Rules — MyDesigner

## Canvas
- **Dimensions:** 1200 × 630 px (OG image standard)
- **Format:** SVG (vector, scales perfectly)
- **Aspect ratio:** ~1.9:1

---

## Color Palette
| Role | Value | Usage |
|---|---|---|
| Background base | `#FFF8EF` → `#FEF0D8` | Warm cream gradient |
| Primary accent | `#FFA848` | Blobs, strokes, dots |
| Light tint | `#FFD4A0` | Secondary curves, soft fills |
| Faded tint | `#FFCB87` | Tertiary wave fills |
| Stroke on white | `#FFA848` @ 15–35% opacity | Grid, lines, arcs |

**Rules:**
- Background is always warm cream — never pure white or dark
- Orange fills use low opacity (5–28%) to stay soft
- Stroke elements use 0.5–2px width at 15–40% opacity
- No hard, saturated fills — everything should feel airy

---

## Composition
```
┌─────────────────────────────────────┐
│  arcs + dots   │                    │
│                │    blob (top-rt)   │
│   blob (bot-   │                    │
│    left)       │                    │
│                │  ← NEGATIVE SPACE  │
│                │    (center/mid)    │
│                │                    │
│   curves       │         dots grid  │
│                │         + arcs     │
└─────────────────────────────────────┘
```
- **Center is always empty** — this is where post titles/text are overlaid
- Decorative elements live in the four corners and edges
- No element should cross the center 400×200 px zone

---

## Required Elements (use all)

### 1. Background gradient
- Linear gradient from top-left `#FFF6E8` → bottom-right `#FEF0D8`

### 2. Subtle grid
- 60×60 grid lines, `#FFA848` @ 12% opacity, 0.5px stroke
- Full canvas coverage — acts as a quiet structure layer

### 3. Flowing wave blobs (2 total)
- Bottom-left: large organic bezier fill, `#FFA848` gradient, 10–28% opacity
- Top-right: mirrored organic bezier fill, `#FFA848` gradient, 8–22% opacity
- Use smooth cubic bezier curves (C commands in SVG path)

### 4. Thin flowing curves (3 per side = 6 total)
- Left side: 3 curves sweeping from bottom-left to top-right
- Right side: 3 curves sweeping from top-right to bottom-left
- Widths: 2px / 1.5px / 0.8px at 30% / 35% / 20% opacity
- Color: alternate `#FFA848` and `#FFD4A0`
- `stroke-linecap: round`

### 5. Dot pattern (2 regions)
- Grid of 1.2px radius circles, 20×20 spacing
- `#FFA848` @ 25% opacity
- Place in: top-left corner (300×200 area) + bottom-right corner (400×280 area)

### 6. Concentric arc accents (2 sets)
- Top-left corner: 3 quarter-circle arcs, radii 180 / 230 / 280
- Bottom-right corner: 3 quarter-circle arcs (mirrored), same radii
- Stroke width: 1px / 0.7px / 0.5px at 30% / 20% / 15% opacity

### 7. Small geometric accents (scattered)
- 2× rotated squares (diamonds): `#FFA848` @ 35% fill
- 2–3× small double-circle accents: `5px` + `9px` radius, stroke only
- 2–3× tiny dot clusters (3 dots, staggered)

### 8. Center clarity overlay
- Radial gradient from center, `#FFF8EE` fading out — keeps center readable

---

## What to Avoid
- No text of any kind
- No logos or brand marks
- No dark colors or high-contrast fills
- No sharp geometric shapes (triangles, polygons with hard edges)
- No photographic elements or raster fills
- No more than 3 distinct element types per corner
- No elements crossing the center negative space zone

---

## Mood / Tone
> Calm, premium, airy, editorial. Think high-end SaaS marketing page — not loud, not playful. The image should feel like a warm, confident blank canvas.

---

## File Naming
```
/assets/images/blog/[post-slug]-cover.svg
```

---

## Checklist Before Saving
- [ ] Background is warm cream (not white, not grey)
- [ ] Center area is visually empty
- [ ] All fills are semi-transparent (no solid orange blocks)
- [ ] Grid is subtle — barely visible
- [ ] Dot patterns only in corners
- [ ] Concentric arcs only in corners
- [ ] Wave blobs are smooth and organic
- [ ] Curves have `stroke-linecap: round`
- [ ] No text or logos
- [ ] File saved as SVG, named `[slug]-cover.svg`

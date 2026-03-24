# Design Audit — mydesigner.gg
**Date:** 2026-03-24
**Scope:** Homepage (full)
**Branch:** main
**Auditor:** Hermes Agent (gstack/design-review)

---

## First Impression

The site communicates **competence and restraint**.

I notice the serif/sans-serif pairing works immediately — it signals "premium agency" without screaming it. The orange concentric-circle graphic in the hero is a strong, memorable brand element. The monochromatic base with orange as the single accent color is disciplined.

The first 3 things my eye goes to are: **(1)** the H1 headline "Your On-Demand Design Team", **(2)** the orange circular graphic to the right, **(3)** the "Book a call" CTA button.

If I had to describe this in one word: **Credible.**

---

## Design Score: B+
## AI Slop Score: A−

---

## Category Grades

| Category | Grade | Notes |
|---|---|---|
| Visual Hierarchy | A- | Strong top-down flow; "how it works" background numbers low contrast |
| Typography | B+ | Good pairing, but decorative label pattern is unconventional |
| Color & Contrast | B | Palette disciplined; some low-contrast grays in footer |
| Spacing & Layout | B+ | Generous spacing; blog cards misalign at row bottom |
| Interaction States | C+ | Touch targets are the biggest issue |
| Responsive | Not tested | (browser tool limitation) |
| Content Quality | A- | Copy is specific, active voice, no filler |
| AI Slop | A- | Avoids most patterns; comparison table is formulaic |
| Motion | Not tested | — |
| Performance Feel | B | Clean lightweight page; logo sizes unbalanced |

---

## Inferred Design System

**Fonts:**
- Serif (appears to be Cormorant Garamond or similar) — headings and display use
- Sans-serif (appears to be Inter or similar) — body, nav, labels, buttons
- Font count: 2 ✓ (excellent discipline)

**Color Palette:**
- Background: #FFFFFF / #F8F8F6 (off-white for alternating sections)
- Primary text: #1A1A1A / near-black
- Accent: Orange (#E8673A or similar) — hero graphic, logo, select highlights
- Decorative headings: Deep pink/magenta for section labels ("Why MyDesigner", "How It Works")
- Black: CTAs (#000000) — "Book a call" primary button
- Unique colors: ~5 total ✓ (disciplined)

**Heading Scale:**
- H1: Very large serif — clear primary
- H2: Large serif — section headers
- H3: Medium serif — subsection headers
- Labels/eyebrows: Small pink caps above sections (non-semantic — these are paragraphs, not actual headings)
- Scale appears systematic ✓

---

## Findings

### FINDING-001 — Touch targets below 44px minimum
**Impact: HIGH**
**Category: Interaction States**

Multiple interactive elements are below the 44px minimum touch target size:
- Nav "Book a call" button: **32px height** (should be ≥44px)
- Blog "Read →" link buttons: **32px height** (should be ≥44px)
- Blog carousel Previous/Next buttons: **32×32px** (should be ≥44×44px)
- Footer social media icons (X, LinkedIn, Instagram): **20×20px** (should be ≥44px touch area via padding)

This directly fails WCAG 2.5.5 (Target Size) on mobile and matters especially for a B2B service where decision-makers are frequently on phones.

**Fix:** Add `min-height: 44px` and appropriate padding to these elements. For social icons, wrap with a block-level element with `padding: 12px`.

---

### FINDING-002 — Blog card "Read →" buttons misalign vertically
**Impact: MEDIUM**
**Category: Spacing & Layout**

The four blog cards in the "Latest Insights" section have varying excerpt lengths, causing the "Read →" buttons to sit at different vertical positions. The effect is a jagged bottom row.

**Fix:** Use CSS flexbox column layout on each card with `justify-content: space-between`, so the button is always pushed to the bottom of the card regardless of content length.

```css
.blog-card {
  display: flex;
  flex-direction: column;
}
.blog-card-body {
  flex: 1;
}
```

---

### FINDING-003 — Testimonials lack visual anchoring (no photos or logos)
**Impact: MEDIUM**
**Category: Content Quality / Visual Hierarchy**

The two testimonials (Rajat Kabade/ScanO and Taapsi R./Poocho) are text-only. No headshots, no company logos within the cards. For a design service selling on quality and trust, this is a missed opportunity — especially since you have real clients with recognizable names (Dentsu is in your trusted-by bar but ScanO and Poocho are less well-known to visitors).

**Fix option A (preferred):** Add a small company logo next to the name (since you have these in your assets already — they're in the ticker above).
**Fix option B:** Add a 48×48px avatar/headshot. Even an illustrated avatar beats a plain name.

---

### FINDING-004 — Nav CTA button height is 32px (not matching hero CTA)
**Impact: MEDIUM**
**Category: Interaction States / Consistency**

The nav "Book a call" is 32px tall while hero "Book a call" and "See pricing" are 48px. This is inconsistent. More importantly, 32px is below touch target minimum.

**Fix:** Increase nav CTA to `min-height: 40px` (a reasonable compact variant without breaking nav layout). Apply equivalent vertical padding.

---

### FINDING-005 — Pre-footer "Last updated" text has very low contrast
**Impact: MEDIUM**
**Category: Color & Contrast**

The small paragraph near the footer ("Last updated March 2024") appears in very small, light gray text on a light gray background. This may fail WCAG AA contrast ratio of 4.5:1 for small text.

**Fix:** Either darken the text to at least `#767676` (the minimum for WCAG AA on white) or remove it if it adds no user value. "Last updated" metadata on a landing page can also inadvertently signal the site hasn't been updated recently — worth reconsidering.

---

### FINDING-006 — Comparison table uses red text for competitors (jarring against soft palette)
**Impact: POLISH**
**Category: Color & Contrast**

The comparison table uses bright red for competitor values (e.g., "8-12 weeks", "Employment"). The rest of the site uses a muted, sophisticated palette. The high-saturation red feels jarring in context — like it belonged to a different design system.

**Fix:** Use a muted red (e.g., `#C0392B` desaturated → `#A05050`) or swap the red text for a medium gray with an ✗ symbol. The ✗ alone communicates "bad" without needing color to pile on.

---

### FINDING-007 — Logo ticker has uneven visual weight
**Impact: POLISH**
**Category: Spacing & Layout**

In the "Trusted by" logo bar, some logos (Dentsu) appear significantly heavier/larger than others (ScanO). The grayscale treatment is correct but the size variation breaks the visual rhythm.

**Fix:** Constrain all logos to the same height (e.g., `max-height: 28px`) with consistent `opacity: 0.6` for visual uniformity. Use `object-fit: contain` to prevent distortion.

---

### FINDING-008 — How It Works background numbers have low contrast
**Impact: POLISH**
**Category: Visual Hierarchy**

The large "1", "2", "3" decorative numerals behind the "How It Works" steps are very light (appear to be ~10% opacity on white). On some screens and in bright light they become nearly invisible — losing a visual element that's supposed to reinforce hierarchy.

**Fix:** Increase to ~15-18% opacity or use a slightly warmer/colored tint (matching the off-white section background) to make them feel intentional rather than accidentally washed out.

---

### FINDING-009 — AI Slop: Comparison table is formulaic
**Impact: POLISH**
**Category: AI Slop**

"Us vs. them" comparison tables (with green ✓ / red ✗) are one of the most overused SaaS landing page patterns — alongside the hero/features/testimonials/pricing rhythm. The table is well-executed here and the data is honest, but the format is recognizable as a template.

**Observation only** — not recommending removing the table since it serves a real conversion purpose. But consider giving it a more distinctive visual treatment (e.g., the "MyDesigner" column has a subtle highlight background to stand out as the recommended option).

---

## Quick Wins (< 30 min each)

1. **FINDING-001 (partial):** Fix blog "Read →" and carousel nav buttons — just add `min-height: 44px` and padding. ~10 min.
2. **FINDING-002:** Fix blog card button alignment with flexbox. ~10 min.
3. **FINDING-005:** Either darken or remove the "Last updated" pre-footer text. ~5 min.
4. **FINDING-006:** Soften the red in the comparison table. ~5 min.
5. **FINDING-007:** Normalize logo ticker heights to `max-height: 28px`. ~10 min.

---

## What This Site Does Really Well

- **AI Slop Score A-:** No purple gradients, no 3-column icon-in-circle feature grid, no emoji in headings, no wavy SVG dividers. Clean and restrained.
- **Copy quality:** Specific, active voice, benefits-first. "Webflow & Framer development ships with every plan. You get a live, working website — not a Figma file." That's good.
- **Color discipline:** Limiting accent to orange + black with a clean white/off-white base is a confident, correct choice.
- **The serif/sans combination:** Tasteful, premium without being pretentious. Signals craft — appropriate for a design service.
- **No lorem ipsum, no placeholder content:** Everything real and specific.
- **Pricing transparency:** Showing actual dollar amounts ($1,400/$2,600/$3,800) directly is a trust signal most competitors avoid.

---

## Screenshots

- `screenshots/hero-above-fold.png` — Hero section, nav, trusted-by bar
- `screenshots/mid-page-sections.png` — Value props, how it works, services, portfolio
- `screenshots/pricing-testimonials.png` — Pricing cards, testimonials, comparison table
- `screenshots/blog-cta-footer.png` — Blog, final CTA, footer

---

## Deferred / Needs Follow-Up

- **Responsive/mobile audit:** Run a separate mobile review (375px viewport). Several of the touch target issues (Finding-001) will be more visible there.
- **Contrast ratio measurement:** Finding-005 needs an actual contrast ratio tool (e.g., browser DevTools accessibility audit) to confirm WCAG pass/fail.
- **Interaction states (hover):** Button hover states not visually tested — worth checking that all interactive elements have hover feedback.
- **Performance:** Lighthouse score not run. Given the portfolio images, check LCP.

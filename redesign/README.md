# SIGNAL / NOISE — MyDesigner reimagined (Concept 01)

A complete creative-direction rethink of mydesigner.gg, built as a single
self-contained page: `redesign/index.html`. The production site is untouched.

## The idea

The brand's core argument — *AI makes infinite average; human taste decides
what ships* — is dramatized instead of stated:

- **Three.js hero**: 9,000 particles drift as noise, then assemble into the
  three MyDesigner orbital rings as the page loads (signal emerging from
  noise). Scrolling pulls them apart again. Mouse moves the formation in
  parallax.
- **Pinned manifesto** that lights up word by word as you scroll.
- **Instrument-grade aesthetic**: the brand orange gradient (`#FFA848` →
  `#FF640D`, straight from the logo) on warm ink. Headings are set in
  TheSeasons (the brand serif, self-hosted from `assets/fonts/`); italic
  accent words fall back to Fraunces since TheSeasons ships no italic cut.
  IBM Plex Mono labels and Space Grotesk body — "lab equipment meets
  literary magazine." The nav uses the real logo via `logo-dark.svg`, a copy
  of `assets/images/mydesigner-logo.svg` with the wordmark recolored for
  dark backgrounds.
- Custom cursor with a lagging ring ("View" state over work), magnetic
  buttons, Lenis smooth scroll, GSAP/ScrollTrigger choreography, film grain,
  animated process line, counter stats.

All content is real — client names, the two real testimonials, FAQ answers,
and six projects pulled from `data/projects.js` with their existing
portfolio images — with one deliberate repositioning: **pricing is per week**
("Hire a creative team by the week"). The weekly rates are derived from the
current live pricing ($2,500 sprint → $1,250 Ship Week; $1,400/mo → $350/wk
Growth Weeks; $3,800/mo → $950/wk Partner Weeks), priced by the week but
billed monthly for ongoing plans. Tune the numbers before any production use.

## Preview

Serve the **project root** (image paths are absolute, e.g.
`/assets/images/portfolio/...`):

```bash
python3 -m http.server 4173
# open http://localhost:4173/redesign/
```

## Tech

- Three.js 0.160 (ES module via importmap, jsdelivr CDN) — custom
  ShaderMaterial point cloud, additive blending, DPR capped at 2, render
  paused when the tab is hidden.
- GSAP 3.12 + ScrollTrigger, Lenis 1.1 (CDN).
- No build step. `prefers-reduced-motion` collapses all animation to a
  static, fully readable page; the page also works if WebGL is unavailable.

# ORBIT — MyDesigner as a scrollytelling story (Concept 02)

A complete reimagining of mydesigner.gg as a **guided story**: one
self-contained page (`story/index.html`) that walks the visitor from the
problem (infinite AI average) to the solution (a weekly creative engine),
conducted by a single Three.js particle field. The production site is
untouched. Builds on Concept 01 (SIGNAL/NOISE) — same palette, type system,
and the three-ring logo mark — but expands them into nine chapters.

## The story

One particle system plays every character. The same ~13,000 particles are
rearranged by scroll — which *is* the brand argument: everyone has the same
particles now; taste is the arrangement.

| Chapter | Name | The field becomes |
|---|---|---|
| 00 | Prologue | The three rings assemble out of noise (hero) |
| 01 | The Noise | Rings dissolve → chaos → a dead, drained **lattice** (infinite average) |
| 02 | The Old Maps | The lattice shatters into turbulent **debris** (agency / hire / freelancer) |
| 03 | The Signal | Debris reassembles into the **three rings**; each ignites per discipline (UI · Web · Brand), color floods back |
| 04 | The Orbit | Three rings become **one orbit** — one revolution = one week; a comet sweeps Mon→Fri with a fire trail |
| 05 | The Evidence | Field dims to starfield; six real projects scroll past |
| 06 | Flight Plans | Faint rings behind weekly pricing (Ship / Growth / Partner Weeks) |
| 07 | Transmissions | Two real client testimonials as incoming radio transmissions |
| 08 | First Orbit | FAQ ("docking questions") + finale CTA; rings return at full signal |

Fixed left rail (chapter index, click to jump), bottom-left HUD readout
(`STATE — NOISE/DEBRIS/SIGNAL/ORBIT…` + scroll %), film grain, custom
cursor, magnetic buttons, Lenis smooth scroll.

## Humans | Agents

Top-right nav tabs switch editions:

- **Humans** — the full WebGL scrollytelling experience.
- **Agents** — the entire site as one refined markdown document: visible
  `#`/`##` heading glyphs, a YAML frontmatter block, pricing as a table,
  zero images, zero WebGL. Typeset for machines but pleasant for people.
  Linkable via `?view=agents` (state persists in the URL); also reachable
  from the footer. Switching pauses the render loop and Lenis; humans
  scroll position is restored on return.

## Tech

- Three.js 0.160 (ES module via importmap, jsdelivr CDN). One
  ShaderMaterial point cloud with **four morph targets** as vertex
  attributes (rings / chaos / grid / orbit) blended by a `uW` vec4 —
  per-particle staggered weights so formations assemble organically.
  Separate twinkling starfield. Additive blending, DPR capped at 2,
  render paused when the tab is hidden or agents view is active.
- GSAP 3.12 + ScrollTrigger: one scrubbed timeline per chapter drives both
  the DOM beats and the GL state object. Sticky stages use CSS
  `position: sticky` (no ScrollTrigger pinning) for robustness with Lenis.
- `prefers-reduced-motion` or missing WebGL → `html.static`: chapters
  collapse into a readable column, all beats visible, canvas hidden.
  Works without JS at all via `<noscript>` fallback styles.

## Preview

Serve the **project root** (asset paths are absolute):

```bash
python3 -m http.server 4173
# open http://localhost:4173/story/          (humans)
# open http://localhost:4173/story/?view=agents  (agents)
```

## Notes

- Weekly pricing ($1,250 Ship Week / $350 Growth / $950 Partner, billed
  monthly for ongoing plans) carries over from Concept 01 — derived from
  current live pricing, **not founder-confirmed**. Tune before production.
- `logo-dark.svg` is the production logo with the wordmark recolored
  `#f4efe9` for dark backgrounds (same file as Concept 01).

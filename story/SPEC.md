# ORBIT — Implementation Spec & Handoff Doc

**Concept 02 for mydesigner.gg** — the site reimagined as a scrollytelling story
that guides the visitor from problem (infinite AI average) to solution (a weekly
creative engine), conducted by a single Three.js particle field. Includes a
**Humans | Agents** tab switch where the Agents edition renders the whole site
as one refined markdown document (no images, no WebGL).

> **Status: ~95% implemented and browser-verified.** The page exists at
> `story/index.html` (self-contained, no build step) and chapters 01–09 plus the
> Agents edition have been verified in a live preview. See §11 for the verified
> log and §12 for the remaining polish backlog. This doc is written so a fresh
> agent can finish, tune, or rebuild from scratch without any other context.

---

## 1. Files

| File | Role |
|---|---|
| `story/index.html` | The entire experience — CSS + HTML + JS in one file. No build step. |
| `story/logo-dark.svg` | Production logo (`assets/images/mydesigner-logo.svg`) with wordmark recolored `#f4efe9` for dark bg. |
| `story/README.md` | Short concept overview. |
| `story/SPEC.md` | This doc. |
| `.claude/launch.json` | Preview server config: `python3 -m http.server 4173` from **project root**. |

Asset paths are absolute (`/assets/fonts/...`, `/assets/images/portfolio/...`,
`/story/logo-dark.svg`) — always serve the **repo root**, then open
`http://localhost:4173/story/` (humans) or `http://localhost:4173/story/?view=agents`.

Production site is untouched. Concept 01 (SIGNAL/NOISE, same palette/type
system, hero-only ring animation) lives on branch
`claude/objective-maxwell-199f66` in `redesign/` — PR #4.

## 2. Creative concept

**One particle system plays every character.** The same ~13,000 particles are
rearranged by scroll into: noise → a dead lattice (infinite average) → debris
(old agencies/hiring/freelancers) → the three MyDesigner rings (the logo mark =
taste) → a single orbit (one revolution = one week) → back to rings at the
finale. The morphing **is** the brand argument: everyone has the same particles
now; taste is the arrangement.

Color is narrative too: the noise/debris chapters **drain to grey-blue**
(`uDrain`); the brand ember orange floods back when the rings assemble in
chapter 03.

Aesthetic carried over from Concept 01: warm ink + ember orange (from the logo
gradient `#FFA848 → #FF640D`), TheSeasons headings, Fraunces for italic accent
words (TheSeasons has no italic cut), IBM Plex Mono labels, Space Grotesk body,
film grain, custom cursor, magnetic buttons.

## 3. Design tokens

```css
--ink:#0b0807; --ink-2:#120d0a; --ink-3:#1a130d;
--paper:#f4efe9; --paper-dim:rgba(244,239,233,.62); --paper-faint:rgba(244,239,233,.38);
--accent:#ff8a3d; --accent-deep:#ff640d; --accent-light:#ffa848;
--accent-dim:rgba(255,138,61,.55);
--line:rgba(244,239,233,.10); --line-strong:rgba(244,239,233,.18);
--serif:"TheSeasons","Fraunces",Georgia,serif;     /* headings */
--serif-accent:"Fraunces",Georgia,serif;            /* ALL italics (TheSeasons has none) */
--sans:"Space Grotesk"; --mono:"IBM Plex Mono";
--label-size:11px; --label-track:0.32em;            /* every kicker/label, no exceptions */
```

@font-face: TheSeasons-Reg.otf (400) + TheSeasons-Bd.otf (700) from
`/assets/fonts/`. Italic accent rule: `.h2 em, .hero h1 em, .beat h3 em,
.finale-h em, .quote blockquote, .preloader__count em` → Fraunces italic, orange.

## 4. Page structure (humans edition)

Fixed full-viewport `<canvas id="field">` at z-0 behind everything. Content
sections scroll over it at z-2. Two section types:

- **Sticky chapters** (`.ch`): tall section (height in svh) containing
  `.ch__stage` (`position: sticky; top: 0; height: 100svh; display: grid;
  place-items: center`). Inside: one `.ch__kicker` + N `.beat` elements all in
  `grid-area: 1/1` so they overlay; GSAP fades beats through. A radial scrim
  (`.ch__stage::before`, `rgba(11,8,7,0.68)` center → transparent 75%) keeps
  text readable over particles. **CSS sticky, not ScrollTrigger pinning** —
  more robust with Lenis and mobile.
- **Flowing sections** (`.flow`): normal document flow (evidence, pricing,
  transmissions, finale) with `.reveal` stagger animations. `.flow--tint` adds
  a vertical gradient panel of ink so cards sit on calmer ground.

Chrome: fixed nav (logo left; right: **Plans** link + **Humans|Agents** pill +
Book-a-call CTA); fixed left **chapter rail** (≥1180px, built from
`[data-chapter]` sections, click → `lenis.scrollTo`); fixed bottom-left **HUD**
(≥900px) showing `MD·02 ORBIT · STATE — <state> · NNN%`; fixed **top progress
bar** (2px accent gradient, `scaleX(progress)`, shown ONLY <1180px where the
rail is absent); fixed bottom-right **motion toggle** (WCAG 2.2.2).

- **Plans nav link** (`#navPlans`, `.nav__plans`): mono text-only,
  underline-on-hover, visible at **every** width (the conversion path to
  pricing). Placed before the mode pill. Click → `lenis.scrollTo('#ch-plans')`
  (fallback `scrollIntoView`). At ≤460px the nav tightens (smaller pill padding,
  reduced gaps) so logo + Plans + pill fit at 375px without overflow. A quieter
  twin lives in the hero under the CTAs: `#heroSkip` ("Skip the story — see
  plans ↓"), same scroll handler.
- **Top progress bar** (`#progress`, `.progress`): driven by the same global
  scroll ScrollTrigger that writes `hudPct` (its `onUpdate` also sets
  `transform: scaleX(progress)`). z-index 51 (above the nav border). Hidden via
  `html.static` and `[data-view="agents"]`.
- **Motion toggle** (`#motionToggle`, `.motion-toggle`): tiny paper-faint mono
  button ("✳ MOTION ON/OFF"), all widths, hidden in agents view + `html.static`.
  OFF → adds `html.motion-off`: the render loop holds the last frame (`motionOn`
  short-circuits `tick()` before `renderer.render`, rAF stays alive), the GL
  canvas fades to `opacity: .15`, and the grain `animation` is set to `none`.
  Scrolling/Lenis is untouched; scroll-driven beat fades continue. Preference
  persisted in `localStorage['md-motion']` and honored on load (`renderOnce()`
  paints one frozen frame so the field isn't an empty void). `window.__setMotion(on)`
  is the loop's pause/resume hook.

### Chapter map (exact, in DOM order)

Chapters are numbered **01–09** so the hero's "A story in nine orbits" promise
lands (the hero is chapter 01 / Prologue, the finale is 09). The numbers live in
each section's `data-chapter`, the visible `.ch__kicker`/`.kicker .idx`, and the
per-chapter `.sr-only` h2s; the rail builds 01–09 directly from `data-chapter`.

| # | id | Type / height | data-state | Field becomes |
|---|---|---|---|---|
| 01 | `ch-hero` | hero, 100svh | SIGNAL | Rings assemble from chaos on load (the moment the user loved in Concept 01) |
| 02 | `ch-noise` | sticky, 320svh, 3 beats | NOISE | Rings dissolve → chaos → **grid lattice**, color drains |
| 03 | `ch-maps` | sticky, 400svh, 4 beats | DEBRIS | Grid shatters → high-turbulence debris |
| 04 | `ch-signal` | sticky, 400svh, 4 beats | SIGNAL | Debris → **three rings**, each ignites per beat, color returns; last beat seeds a quiet proof line (57 clients · 142+ projects) |
| 05 | `ch-orbit` | sticky, 360svh, 3 beats | ORBIT | Rings → **single face-on orbit**; comet head sweeps 3 revolutions (`uHead → 6π`); last beat carries the in-story CTA row |
| 06 | `ch-evidence` | flow (tint) | EVIDENCE | Field dims (alpha .3), drifts to chaos; 6 real projects |
| 07 | `ch-plans` | flow | PLANS | Faint rings behind 3 pricing cards (monthly-led) |
| 08 | `ch-voices` | flow (tint) | VOICES | (unchanged) 2 real testimonials as "transmissions" |
| 09 | `ch-finale` | flow | GO | Full-alpha rings, all glows .5, slow spin; FAQ + CTA |

## 5. Copy (final, in the file)

Tone: cinematic but concrete; every chapter earns its claim. Real data only:
57 clients, 142+ projects, 24–72h turnaround, est. 2020, clients Dentsu /
Apollo Radiology / Poocho / ScanO; booking link
`https://calendar.app.google/xGoKb51qpbcnZgJy5`.

- **Hero**: kicker "A story in nine orbits · Est. 2020"; H1 "Out of noise,
  / *signal.*"; sub: "MyDesigner is a **weekly creative engine** for founders —
  design, web, and brand that ships every seven days. This page is the story of
  why. Scroll, and we'll tell it properly." + trusted-by line (Dentsu · Apollo
  Radiology · Poocho · ScanO · USA Table Tennis · 52 more = 57) + CTAs (Book call
  / "Begin the story ↓" → scrolls to `#ch-noise`) + hero skip link `#heroSkip`
  ("In a hurry? Skip to plans ↓" → `scrollToPlans`).
- **01 The Noise**: "The sky has never been this loud." → "And infinite output
  has a shape." (tag: *Observation 01 — uniformity detected*; "Not chaos —
  sameness… Infinite average, perfectly aligned.") → "Average became *free.*"
  ("…made **different** the most expensive thing in the market — and the only
  thing that still converts.")
- **03 The Old Maps**: intro "The old maps don't survive this sky." → "The
  agency." (tag *ETA — one quarter*) → "The hire." (tag *Single point of
  failure*; "Ninety days to find. A six-figure salary on the books." — reconciled
  with the pricing note's $1,500+/wk fully-loaded reference, softened from the old
  "$150K+ a year to keep") → "The freelancer." (tag *Orbit — unstable*; "You
  can't build a company on a comet.")
- **04 The Signal**: "Then — a *filter.*" (taste; same particles, arranged like
  nobody else) → Ring 01 Product & UI → Ring 02 Web ("ships as working code…
  Webflow or Framer") → Ring 03 Brand (AI-ready system — glossed as "the rules,
  templates, and prompt libraries that keep everything…yours"). Tags use `.glow`.
  Last beat carries a quiet non-glow proof line (`.beat__proof`): "57 clients ·
  142+ projects shipped since 2020".
- **05 The Orbit**: "We don't sell months. We sell *orbits.*" → "Monday, brief.
  Friday, *shipped.*" (+ `.beat__week` Mon/Tue–Thu/Fri dots) → "Orbit after
  orbit, you look like a company that *ships.*" (replaces the off-brand "look
  *funded*" / implicit 12-week commitment; keeps Client Memory compounding,
  now glossed as "a living record of your brand's decisions, feedback, and
  outcomes"). The last beat ends with an in-story CTA row (`.beat__cta`): a quiet
  mono ghost button "Start with one Ship Week — $1,250" → booking URL, plus a
  "or see all plans ↓" link (`.js-to-plans`, shares `scrollToPlans`).
- **05 Evidence**: H2 "Things we've put *into orbit.*" + stats line + 6
  projects: Apollo Radiology (Webflow), Poocho (UI/UX), Vettly.ai (Branding),
  Neustreet (UI/UX), Takumi (Framer), ScanO (Branding) — images from
  `/assets/images/portfolio/<slug>.webp`.
- **07 Flight Plans**: H2 "Hire the engine *by the week.*" Lede: "Agencies sell
  months because they need them. With AI-speed production, the week is the
  honest unit of progress — so that's what we price." **Pricing presentation
  (copy pass, Agent 3):** the two ongoing cards now LEAD with the real billed
  monthly figure as the big number — **Growth Weeks** `$1,400 /month` (featured,
  "Most teams run on this") and **Partner Weeks** `$3,800 /month` ("Deeper
  function") — with the weekly equivalence demoted to a `.plan__per` support line
  ("≈ $350 / $950 per shipped week · pause or cancel anytime"). **Ship Week**
  stays `$1,250 / week, one-time` (it really is a one-time weekly price, "Start
  here, zero commitment"). A `.pricing__note` explains the trial-week premium:
  "A standalone Ship Week runs above the committed weekly rate because it carries
  full onboarding and setup; commit to ongoing weeks and the per-week price drops
  to $350." Second note keeps the six-figure / $1,500+/wk fully-loaded designer
  comparison. **Actual rates unchanged** ($1,250 one-time / $1,400/mo / $3,800/mo).
  ⚠️ **Rates are derived from current live pricing, not founder-confirmed. Do not
  ship to production without confirmation.**
- **08 Transmissions**: real quotes — Rajat Kabade (ScanO by DentalDost),
  Taapsi R (Poocho), with blinking `▮ Incoming ·` meta line.
- **09 First Orbit**: "Docking questions" FAQ (5 × `<details>`: what is MD /
  why weekly pricing / why not DIY AI / dev included / commitment) then finale:
  "Begin your *first orbit.*" + CTA + "20 minutes · No pitch deck · Leave with
  a sharper plan either way."

## 6. Three.js architecture

CDN, no build: GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.18 (classic scripts),
Three 0.160 via ES-module importmap (jsdelivr). Main script is `type="module"`.

### Particles
- `COUNT = 13000` desktop / `7000` (`max-width: 768px`). One
  `THREE.Points` + ShaderMaterial, additive blending, no depth write, DPR
  capped at 2. Camera: perspective 50°, z = 9.
- **Four morph targets as vertex attributes** (each `Float32Array(COUNT*3)`):
  - `aRings` — three tilted rings (the logo mark):
    `{r:2.1, tube:.045, euler:(π/2.25, 0, .25)}`,
    `{r:2.85, tube:.06, euler:(π/2.6, .55, -.3)}`,
    `{r:3.6, tube:.085, euler:(π/1.95, -.45, .5)}`; particle i belongs to ring
    `i % 3` (also stored in `aRing`).
  - `aChaos` — gaussian cloud, σ ≈ (9.5, 7, 7) (sum of 3 randoms − 1.5).
  - `aGrid` — lattice NX=24 × NY=14 × **NZ=2**, spacing 0.66 (z×1.4, offset
    −0.3), jitter **±0.0075**; cell = `i % (NX*NY*NZ)` (~19 particles per node →
    nodes glow). **NZ reduced 4→2** and jitter tightened so the lattice reads as a
    crisp regular grid of glowing nodes rather than sparse dim scatter (4 z-layers
    + larger jitter previously blurred the structure into random dots — a
    reviewer-flagged "nearly invisible" issue, fixed in the 2026-06-12 GL pass).
  - `aOrbit` — single ring r = 3.15 in the XY plane (face-on like a clock),
    euler (0.42, 0, −0.08), tube 0.05; the particle's polar angle is stored in
    `aAngle` (used by the comet).
  - Plus `aRand` (per-particle random).
- **Vertex shader** — per-particle staggered weight blend:
  ```glsl
  vec4 w = clamp((uW - aRand*0.22) / 0.78, 0., 1.);
  w = w*w*(3.-2.*w);                     // smoothstep
  vW = w / (w.x+w.y+w.z+w.w + 1e-4);     // normalize
  pos = (aRings*w.x + aChaos*w.y + aGrid*w.z + aOrbit*w.w) / tot;
  // base wobble is cancelled for grid-weighted particles → crisp stationary nodes
  float gridW = vW.z;
  pos += ((0.03*(1.0-0.9*gridW)) + uTurb*(0.16 + aRand*0.34)) * sin/cos wobble(uTime, aRand);
  float size = mix(1.1, 2.6, fract(aRand*7.31));
  size *= 1.0 + gridW*1.4;                 // grid nodes glow larger
  gl_PointSize = size * uPixelRatio * (6.5 / -mv.z);
  ```
  The stagger (−aRand·0.22) makes formations assemble organically instead of a
  lockstep crossfade. The `gridW` (= `vW.z`) terms are the lattice-legibility
  fix: grid-weighted points stop wobbling and grow, so the structure reads.
- **Fragment shader**:
  - Brand color: mix(amber `(1,.659,.282)`, ember `(1,.392,.051)`) with ~45%
    warm-paper dust particles `(0.82,0.77,0.71)`.
  - Drain: `col = mix(col, vec3(0.47,0.49,0.55), uDrain)`.
  - Alpha: `a * (0.30 + 0.55*(vW.x+vW.w) + 0.48*vW.z + 0.18*vW.y)` — rings and
    orbit brightest, grid clearly readable, chaos dimmest. × `uAlpha`.
  - Ring ignition (ch 03): `g = uGlow[aRing]`; `col += brand*g*vW.x*1.4`,
    `alpha += g*vW.x*0.35*a`.
  - Comet (ch 04): `diff = mod(uHead - vAngle, 2π)`;
    trail `exp(-diff*1.7)*uOrbitOn*vW.w` (ember × 2.6) + white-hot head
    `smoothstep(0.18, 0., diff) × 2.0`; `alpha += trail*0.6*a`.
- **Starfield**: separate Points, 1400 stars on a far shell (r 16–34, flattened
  y, pushed back z), tiny ShaderMaterial with per-star sine twinkle, alpha .38.
  Constant through the whole journey (space continuity when the main field dims).

### Uniforms ↔ state object
GSAP never touches uniforms directly. It tweens a plain JS object `S`; the
render loop syncs S → uniforms/group every frame (only when humans view
active):

```js
S = { wr,wc,wg,wo,            // → uW (rings, chaos, grid, orbit)
      turb, drain, alpha,     // → uTurb, uDrain, uAlpha
      g1,g2,g3,               // → uGlow (per-ring ignition)
      head, orbit,            // → uHead, uOrbitOn
      px, rx, rz, scale, spin,   // group x-pos / base tilt / z / scale / spin rate
      unspin }                   // 1 = cancel accumulated y-rotation (grid must be face-on)
// initial: wr0 wc1 wg0 wo0, turb.5, drain.15, alpha1, px1.25, rx-.04, spin.05, unspin0
```
Mouse parallax is added on top of base rotations in the loop:
`rot.x = S.rx + mouse.y*0.13`, `rot.y = spinAcc·(1−S.unspin) + mouse.x*0.1`
(spinAcc accumulates `S.spin·dt`; `unspin` exists because by ch-01 the
accumulated spin would show the lattice edge-on as random scatter), `rot.z =
S.rz + mouse.x*0.04`. **Narrow-viewport scale**: `vwScale = min(1,
aspect·1.3)` (recomputed on resize) multiplies `group.scale` and `S.px` so the
rings/orbit fit portrait phones instead of overflowing. Render is paused when
the tab is hidden (visibilitychange) and skipped while Agents view is active.
Debug: `window.__S` and `window.__lenis()` are exposed for console tuning.

## 7. Scroll choreography

Lenis (`lerp .09`) wired into GSAP's ticker; `lenis.on('scroll',
ScrollTrigger.update)`; `gsap.ticker.lagSmoothing(0)`.

### `chapterTL(sel, glBuild)` helper
One scrubbed timeline per sticky chapter:
`scrollTrigger: { trigger: sel, start: 'top top', end: 'bottom bottom', scrub: 0.6 }`,
normalized to duration 1 via `tl.to({}, {duration:1}, 0)`. Then:
- kicker: fade in at 0.015 (dur .05), fade out at 0.95;
- beats: for N beats, slot `len = 1/N`; beat i fades **in** at `i·len + .08·len`
  (y 38→0, dur `.3·len`, power2.out) and **out** at `(i+1)·len − .26·len`
  (y →−30, dur `.24·len`, power2.in); all tweens `immediateRender: false`
  (`html.js .beat { opacity: 0 }` prevents pre-JS flash);
- `glBuild(tl)` adds the chapter's S tweens at absolute positions.

### GL timelines per chapter (current values)
```js
// hero entrance (time-based, after preloader): wc→0 wr→1 turb.12 drain0, 2.4s
// hero scroll-out: #heroInner opacity→0 y→-70 (scrub over ch-hero)
// 01 noise:   {wr0 wc1 turb.55 drain.4 px0}@0×.26 → {wc0 wg1 turb.04 drain.88 spin0 unspin1 rx0}@.36×.3 → {drain.78}@.84
// 02 maps:    {wg0 wc1 turb1.05 drain.72 spin.05}@0×.22 → {rx.1}@.25 → {turb1.25}@.6
// 03 signal:  {wc0 wr1 turb.14 drain.22 rx-.04 spin.06 unspin0}@0×.22 → {g1:1 drain.1}@.28 → {g2:1 drain.04}@.53 → {g3:1 drain0}@.78
// 04 orbit:   {wr0 wo1 g*0 turb.08 scale1.08 rx.02 spin0}@0×.2 → {orbit1}@.12 → {head:6π}@.2×.72 → {orbit.4}@.92
// 05 evidence (standalone scrub, top 90%→top 30%): {wo0 wc1 alpha.3 turb.4 drain.45 scale1.3 spin.03 orbit0}
// 06 plans    (top 80%→top 25%): {wc0 wr1 drain.25 alpha.34 turb.14 scale1.1}
// 08 finale   (.finale-h top 95%→top 40%): {alpha1 drain0 g*.5 scale1 rx-.05 spin.1 turb.12}
```
All standalone `gsap.to(S, …)` use `immediateRender: false`.

⚠️ **Known scrub caveat**: abrupt programmatic jumps (`window.scrollTo` straight
into a deep chapter) can capture wrong `.to()` start values; **sequential**
scrolling (users, lenis.scrollTo with duration — which the rail and
begin-story button use) is always correct. Verified both ways in preview. Not
worth fixing for a concept; if it ever matters, convert GL tweens to `fromTo`.

### Other triggers
- Rail/HUD: per `[data-chapter]` section, `start 'top 55%' / end 'bottom 45%'`,
  onToggle sets active rail item + `hudState` ← `data-state`; one global
  trigger updates `hudPct`; nav gets `.is-scrolled` past 80px.
- `.reveal` elements: opacity/y stagger at `top 88%`.
- Stat chips in evidence are static text (no counters in this concept).

## 8. Humans | Agents toggle

- Pill in nav: `#modeHumans` / `#modeAgents` — a `role="radiogroup"` with
  `role="radio"` + `aria-checked` buttons, active = orange gradient fill.
  Footer also has an "Agents edition" button.
- State on `<html data-view="humans|agents">`. CSS in agents mode hides:
  `#humans, #field, .grain, .vignette, .rail, .hud, .cursor-dot, .cursor-ring`
  and shows `#agents` (now a `<div role="region">`, not a second `<main>`).
  Render loop self-skips.
- **History/Back**: toggling writes the URL with `history.pushState`
  (`?view=agents` on / off) so the browser **Back** button *undoes the switch*
  instead of leaving the page. A `popstate` listener reads `?view=` and calls
  `setView(target, /*writeHistory=*/false)` (the `false` arg suppresses a second
  history write since popstate is already a history move). `?view=agents` on
  initial load is still honored (preloader + hero intro skipped; S preset to
  assembled rings; nav forced visible + scrolled).
- **Toggle during preloader**: `setView('agents')` fast-forwards an in-flight
  intro — it `.progress(1)`s both the counter tween (`introCounterTween`) and the
  hero-entrance timeline (`introTL`) so toggling back to humans shows a fully
  assembled hero, never a half-run intro.
- **Do NOT `lenis.stop()` for the agents view** — Lenis stop blocks user wheel
  scrolling entirely (it's a scroll lock). Lenis stays running in both views.
  (This bug was found and fixed in preview.)
- Switching to agents stores `humansScrollY`, scrolls to 0 (immediate); back to
  humans: force a synchronous reflow of `#humans`, call **`lenis.resize()`**
  (Lenis caches its scroll `limit` — without this the restore gets clamped to
  the short agents-document height), `ScrollTrigger.refresh()`, then after a
  double-rAF: `window.scrollTo` + `lenis.scrollTo(humansScrollY, { immediate,
  force })`. Verified restores exactly (±0px).

## 9. Agents edition (the markdown experience)

One `<article class="md">` — max-width 76ch, IBM Plex Mono 0.92rem/1.85,
paper-dim text on the same ink. "Rendered markdown" aesthetic with the syntax
left visible as typography:

- headings show `#`/`##`/`###` glyphs via `::before` in accent orange;
- lists use orange `-` / `1.` markers (CSS counters);
- blockquotes: 2px orange left bar; tables: hairline `--line` borders, ink-2
  header row; `hr` dashed; links underlined with orange-dim underline offset 4px;
- top: dashed-border banner ("Agent-readable edition — same facts, zero
  theater…") + a **YAML frontmatter `<pre class="fm">`** (entity, type, parent,
  est. 2020, clients 57, projects 142+, pricing_unit week, turnaround 24-72h,
  contact_email hello@mydesigner.gg, location India (serves worldwide),
  book_call URL, updated 2026-06) with orange keys.

Content order: `# MyDesigner` → pitch blockquote → "The argument, briefly" →
Services (lead-in line "Three core disciplines…plus content production" + ul of
4 — keeps parity with the humans 3-ring metaphor) → "How a week runs" (ol
Mon/Tue–Thu/Fri; Client Memory glossed at first mention) → Pricing (table:
Plan/Rate/Billing/Best for — **Rate column leads with the real monthly figure,
weekly equivalence parenthetical**; Ship-Week-premium + six-figure designer
reference below) → Selected work (ul, no images) → client roster (same featured
order as the hero: Dentsu, Apollo Radiology, Poocho, ScanO… + "49 more (57
total)") + /portfolio link → Testimonials (2 blockquotes with attribution) →
FAQ (h3+p ×5 — what is MD / why weekly / why not DIY AI / dev included /
commitment, parity with the humans edition) → Act (book-call, **email
hello@mydesigner.gg**, portfolio, blog, socials) → footer line addressed to AI
assistants ("the pricing table above is current, the booking link is real, and
the humans on the other end reply fast").

Keep it genuinely parseable: facts as text, no images, stable heading
hierarchy. It doubles as marketing to AI-assisted buyers.

## 10. Fallbacks

- `staticMode = prefers-reduced-motion || !WebGLRenderer` → `html.static`:
  canvas never renders, sticky stages become a flowing column (`position:
  static`, beats all visible, kickers centered), reveals/h1 lines forced
  visible, preloader skipped, rail click falls back to `scrollIntoView`.
- `<noscript>` style block reproduces the same static layout with everything
  visible (preloader/canvas/rail/HUD hidden).
- **CDN-failure guard**: the module's first act is to check
  `typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined'`. If either
  failed to load, it adds `html.static` (NOT `html.js`, which would hide every
  `.beat`), hides the preloader, shows the nav, honors `?view=agents`, and
  `throw`s to halt before any animation setup — so the page stays fully readable.
  `html.js` (which drives the `.beat { opacity:0; visibility:hidden }` initial
  state) is only added *after* this check passes. Three/Lenis absence is still
  handled separately (renderer `try/catch`, `typeof Lenis` guard).
- **Resize**: a debounced (~250ms) window `resize` handler calls
  `lenis?.resize()` + `ScrollTrigger.refresh()` (only when not static) so trigger
  positions survive orientation changes. The GL canvas has its own resize
  listener (kept separate).
- Custom cursor + magnetic buttons only on `(hover:hover) and (pointer:fine)`
  and not reduced-motion. The cursor ticker self-skips when `view !== 'humans'`.

## 11. Verification log (browser preview, 2026-06-11)

Verified at ~800×870 via the preview panel (server: `python3 -m http.server
4173` from repo root, managed by `.claude/launch.json` → `preview_start`):

- ✅ Hero: preloader → rings assemble right of headline; TheSeasons headline
  with Fraunces italic "signal."; tabs render, Humans active.
- ✅ Console: zero errors/warnings throughout the journey.
- ✅ Ch 01: kicker + all 3 beats sequence correctly (beat tags render).
- ✅ Ch 03: rings assembled around beat text, ring-2 ignition visible
  (`window.__S` showed `wr:1, g1:1, g2:0.52` mid-chapter as designed).
- ✅ Ch 04: single face-on orbit encircling "Monday, brief. Friday, shipped."
  with Mon/Fri week markers — the showpiece frame.
- ✅ Ch 05: project cards render with real portfolio images (all 200s).
- ✅ Ch 06: weekly pricing cards, Growth Weeks featured w/ orange radial.
- ✅ Agents: frontmatter block, `#` glyph headings, pricing table, banner; URL
  flips to `?view=agents` and back; humans→agents→humans round-trip restores
  scroll exactly (asserted programmatically, 16855 → 16855).
- ✅ Ch-01 lattice re-verified after tuning — reads as a structured drained
  grid (required the `unspin` fix: accumulated y-spin was showing it edge-on).
- ✅ Ch-02 "The hire." beat + tag; transmissions cards (blinking meta, italic
  quotes); finale — FAQ + rings returning around "Begin your *first orbit.*"
- ✅ Rail + HUD render and track chapters at ≥1180px (verified at emulated
  1380×860; the preview panel letterboxes that size but rendering is correct).
- ✅ Mobile 375×812: hero (tabs fit, type scales), orbit ring fits the
  viewport after the `vwScale` fix and encircles the beat, agents edition
  clean (frontmatter scrolls horizontally).
- ✅ Static-mode CSS: injecting `html.static` forces beats visible
  (`opacity:1!important` beats GSAP inline styles), stages go `position:
  static` (CSS-level check; the init-time JS path wasn't separately run).
- ✅ Fixed during verification:
  (a) `lenis.stop()` would have blocked wheel scroll in agents view — removed;
  (b) scroll restore was clamped to the agents doc height — root cause was
  Lenis' cached `limit`; fixed with forced reflow + `lenis.resize()` +
  double-rAF restore;
  (c) grid lattice too dim — fragment alpha `+0.48·vW.z`, chaos `+0.18·vW.y`,
  drained grey brightened to `(0.47,0.49,0.55)`;
  (d) stage scrim eased 0.78 → 0.68;
  (e) accumulated y-spin made the lattice read as scatter — added `S.unspin`;
  (f) formation overflowed portrait phones — added `vwScale`.

**Changelog 2026-06-12 (a11y/robustness pass, Agent 1):** `:focus-visible`
outlines + `.sr-only` utility; beats now use `autoAlpha` (opacity+visibility) so
hidden ones leave the a11y tree; single `<main>` (`#agents` → `role=region`);
per-chapter `.sr-only` h2s + visually-hidden Agents-edition pointer link;
`--paper-faint` 0.38 → 0.55 (WCAG); Back/Forward via `pushState` + `popstate`;
CDN-failure guard (static fallback before `html.js`); debounced resize refresh;
last beat holds to ~0.985 (no dead tail); logo click → scroll-to-0; toggle
fast-forwards in-flight intro; footer double-scroll removed; cursor ticker guarded
in agents view; mode pill `role=radiogroup`/`aria-checked` + ≥40px hit area;
og/twitter/canonical meta; preloader gated on `document.fonts.ready`;
`beat__week` aria-hidden removed. Verified in preview: console clean, toggle/back
restores scroll exactly, beats animate, agents direct-load renders.

**Changelog 2026-06-12 (visual/orientation pass, Agent 2):** lattice now reads
as a real grid (NZ 4→2 layers, grid-weighted point-size boost + wobble damping
in the vertex shader, brighter grid grey); stronger `.ch__stage::before` scrim
on narrow viewports (mobile orbit/text overlap); cursor idle-fade after ~1.2s
stationary; "Plans" nav link at all widths + hero "Skip the story — see plans ↓"
(`#navPlans`/`#heroSkip` → `scrollToPlans`); 2px top progress bar `#progress`
(<1180px); bottom-right motion toggle (`#motionToggle`, pauses GL via
`window.__setMotion` + freezes one frame via `renderOnce`, `html.motion-off`
stops grain, persisted as `md-motion`). NOTE: Agent 2 hit a session limit during
final verification — orchestrator verified: lattice screenshot reads as grid;
Plans/heroSkip handlers scroll correctly; motion toggle state/class/localStorage
round-trips; console clean. Still visually unverified: mobile (375px) orbit
scrim strength and motion-off visual freeze — covered by the final verification
pass (Agent 4).

**Changelog 2026-06-12 (copy/conversion pass, Agent 3):** chapters renumbered
**00–08 → 01–09** (data-chapter, visible kickers, `.sr-only` h2s, rail; hero =
01/Prologue, finale = 09) so "A story in nine orbits" lands. **Pricing
framing** — ongoing cards now lead with the real billed monthly figure ($1,400 /
$3,800 /month) with the weekly equivalence demoted to a `.plan__per` support line
(≈$350 / ≈$950 per shipped week); added a `.pricing__note` explaining the
trial-week premium (standalone Ship Week carries onboarding + setup, committed
weeks drop to $350); agents pricing table mirrors this (Rate column leads
monthly, weekly parenthetical). **Actual rates unchanged.** Off-brand orbit beat
"you look *funded*" → "you look like a company that *ships*" (drops the implicit
12-week commitment). **Designer-cost anchor reconciled** — ch-02 "the hire"
"$150K+ a year to keep" → "a six-figure salary on the books"; pricing/agents
reference reframed as a "six-figure annual commitment ($1,500+/week fully
loaded)". **Jargon glosses** — "Unlimited requests, one at a time" → "Unlimited
backlog — we work one request at a time, finish it, then pull the next"; Client
Memory defined at first mention in both editions ("a living record of your
brand's decisions, feedback, and outcomes"); brand AI-ready-system gloss
strengthened ("rules, templates, and prompt libraries"). **Conversion** — added
one quiet in-story CTA row (`.beat__cta`) at the end of ch-05/orbit (mono ghost
"Start with one Ship Week — $1,250" → booking URL + "or see all plans ↓"
`.js-to-plans` sharing `scrollToPlans`); seeded an early `.beat__proof` line in
ch-04's brand beat ("57 clients · 142+ projects shipped since 2020"). **Edition
parity** — humans pricing copy now mentions founder content (no 4th ring added);
agents Services gained a "three core disciplines + content production" lead-in;
agents FAQ extended to 5 (added "What exactly is MyDesigner?"); client roster
aligned to the same featured order across hero + agents (57 total kept
everywhere). **Agents frontmatter** — added `contact_email: hello@mydesigner.gg`
(verified in `scripts/build-blog.js`) and `location: India (serves worldwide)`
(verified via the production schema `addressCountry: IN` / `areaServed`); email
also surfaced in the Act list. Hero skip copy refined to "In a hurry? Skip to
plans ↓". Verified in preview: console clean (humans + agents), rail renders
01–09 with correct names/kickers, orbit CTA visible + "see all plans" lands at
pricing, monthly-led cards + explanation line render, agents table/FAQ/frontmatter
updated.

**Verification pass 2026-06-12 (final QA gate, Agent 4):** all remaining checklist
items (12–21, 25–27) verified PASS in live preview, no code fixes required — lattice
forms with `__S.wg=1` at ch-noise+1.6vh (reads as grid); progress bar shows <1180px
and scaleX grows with scroll, hidden in agents view; navPlans/heroSkip land at
ch-plans (±0px); motion toggle off→`html.motion-off`+localStorage+canvas opacity .15,
on resumes, persists across reload; cursor idle-fade JS path present (1.2s timer);
mobile 375px nav has zero horizontal overflow with logo+Plans+pill visible and the
stronger portrait scrim keeps the orbit beat legible; rail/kickers read 01–09;
pricing cards lead with $1,400/$3,800 monthly + ≈$350/≈$950 weekly support lines +
$1,250 Ship Week + trial-week note; orbit CTA + ch-signal proof line present;
`html.static` injection forces all 14 beats visible + all 4 stages `position:static`;
console clean throughout (only harmless GA beacon aborts from the root page).
Verdict: SHIP.

**Changelog 2026-06-12 (desktop overlap fix, orchestrator):** at 1180–1720px
the fixed chrome collided with content (rail over the left-aligned hero
headline; vertical scroll cue over the ghost CTA and motion toggle; HUD tight
against the hero skip link — user-reported at 1512px). Added clearance rules:
`.hero, .shell { padding-left: calc(var(--gutter) + 7.5rem) }` in that range
(above 1720px the centered 1400px shell clears the rail naturally),
`.hero__bottom { padding-right: 4.5rem }` + `.hero__scroll { bottom:
clamp(6rem, 12vh, 8rem) }` at ≥1100px, and hero `padding-bottom:
clamp(3.5rem, 8vh, 5.5rem)` at ≥900px. Verified at 1512×772 via rect
intersection checks: all five collisions resolved, console clean.
Second user report: the orbit chapter's CTA beat (long headline + gloss
paragraph + CTA row) centered up under the kicker/nav. Fixes: `.ch__stage`
now pads the centering band (`padding-top: clamp(7.5rem, 14vh, 9.5rem)`,
`padding-bottom: clamp(3.5rem, 9vh, 5.5rem)`) so no beat can reach the
kicker; all beat h3s gain a `9vh` cap; the CTA beat uses `.beat--snug`
(h3 `min(clamp(1.9rem, 3.8vw, 3.2rem), 8vh)`, tighter paragraph margin).
Verified 1512×772 + 375×812: beat clear of kicker/nav/HUD both ways.

**Changelog 2026-06-12 (About page, Concept 02):** added `story/about.html` as
a self-contained About page using the ORBIT token system, dark space chrome,
film grain, custom cursor, magnetic CTAs, Lenis/GSAP ScrollTrigger, motion
toggle persisted through `localStorage['md-motion']`, scroll-percentage-only
HUD, optional left rail, static/reduced-motion fallbacks, CDN guard, noscript
fallback, and a `?view=agents` markdown-style edition with pushState/popstate.
The humans page is a 6-section flowing read: hero, belief, operating loop,
Client Memory, audience/ownership/Sukratu, and CTA. Three.js is intentionally
subtle: a lazy-loaded three-ring particle background only initializes in humans
view, with 5,400 particles desktop / 3,600 mobile, DPR capped at 2, and the
render loop paused while hidden or motion-off. About-page factual copy is
restricted to the verified facts supplied for this page: no years, client
counts, names, awards, offices, or pricing. `story/index.html` footer now links
to `/story/about.html`; top nav was left unchanged to avoid crowding the
mobile logo + Plans + Humans/Agents controls.

**Changelog 2026-06-12 (About page Team section):** added a production-sourced
6-person Team section to `story/about.html` between Fit and Next, renumbering
the About-page chapters/kickers to Fit `05`, Team `06`, Next `07`. The humans
edition uses ORBIT dark-theme circular avatars with grayscale-to-color hover
swap and lazy-loaded production team images; the Agents edition adds
`team_size: 6` frontmatter plus a zero-image Team list with name and role only.

**Changelog 2026-06-13 (Work page, Concept 02):** added `story/work.html` as
the ORBIT evidence page for the 20-project portfolio source in
`data/projects.js`. The humans edition follows the About page chrome and
flowing-section structure: short record hero, category-filtered project field,
and CTA back to story/plans/booking. Filters cover All, UI/UX Design, Web
Development, Graphic Design, and Branding, store shareable state in `?cat=`,
and animate card visibility with GSAP `autoAlpha`/`scale` when motion is
available. The page lazy-renders human cards so direct `?view=agents` loads no
project images and no WebGL; the agents edition lists all projects by category
with exact `data/projects.js` titles/descriptions and case-study URLs. Existing
story/about footer/nav links now include `/story/work.html`.

**Changelog 2026-06-13 (Services page, Concept 02):** added
`story/services.html` as the ORBIT services manifest, using the About/Work chrome
contract: fixed nav, Humans|Agents mode pill, motion toggle persisted as
`localStorage['md-motion']`, HUD percentage only, grain, custom cursor, lazy
Three.js rings/starfield, static/noscript fallbacks, pushState/popstate agents
toggle, and non-throwing CDN failure tolerance. The humans edition is a flowing
engine-room read: hero, four flagship offer cards, compact capability manifest,
included-experience chips, and CTA to booking/plans/story. Source copy is taken
from production `services.html`; the story page intentionally carries no prices,
leaving pricing to `/story/#ch-plans`. Capability items are dense rows rather
than heavy cards: UI/UX Design, Webflow + Framer Development, Everything Visual,
and Specialized Design Projects. The agents edition exposes frontmatter with
booking/plans/offer links, then markdown-style sections for each flagship offer
and capability group. Existing `story/index.html`, `story/about.html`, and
`story/work.html` nav/footer links now include `/story/services.html`, with
mobile nav hiding tightened to prevent crowding.

## 12. Remaining work (in priority order)

1. **Reduced-motion init path**: run once with `prefers-reduced-motion:
   reduce` actually enabled (CSS static layout is verified; the JS init branch
   — skipped timelines, preloader bypass — has not been exercised in a real
   browser).
2. Optional polish: remove `window.__S`/`window.__lenis` debug handles for
   production; consider a tiny "SHIPPED" pulse each comet revolution in ch-04;
   consider `<link rel="alternate">`/llms.txt pointer to `?view=agents`.
3. **Business**: confirm weekly rates with founder before any production use
   (see memory note `weekly-pricing-direction`).

## 13. How to run

```bash
# from the repo root (worktree root)
python3 -m http.server 4173
# humans:  http://localhost:4173/story/
# agents:  http://localhost:4173/story/?view=agents
```

No build, no deps to install. Edit `story/index.html`, reload. Use
`window.__S` in the console to inspect live GL state, and
`window.__lenis().scrollTo(y, { duration: 2 })` to scroll **through** chapters
when testing (avoid raw `window.scrollTo` jumps — see §7 caveat).

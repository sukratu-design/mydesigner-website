# HANDOVER

## Current State

This worktree is in the middle of a broad MyDesigner website repositioning from an "unlimited design subscription" frame toward:

> AI-native creative team for growing companies, with human taste, AI-powered execution, Client Memory, and a creative operating rhythm.

No changes have been pushed or deployed. The repo is on a detached `HEAD` with a large dirty working tree. Treat all current modifications as intentional unless Anand asks otherwise.

Local preview was most recently restarted on:

- `http://localhost:4176/services/website-design.html`

Ports `4173`, `4174`, and `4175` have previously had stale listeners or dropped preview servers during this session. If the preview stops responding, start a fresh static server with `python3 -m http.server <port>` from the repo root.

## What Got Done

### Sitewide Creative Growth Repositioning

Implemented the new high-level service direction from the initial creative-growth spec:

- Reworked major homepage/pricing/services language toward AI-native creative support.
- Added new offer pages:
  - `conversion-design.html`
  - `founder-content-engine.html`
  - `ai-ready-brand-system.html`
- Updated supporting styles and analytics hooks in:
  - `css/styles.css`
  - `js/main.js`

### How It Works, Portfolio, FAQ

Implemented the three-page spec group:

- `how-it-works.html`
  - Reframed the operating model around Diagnose, Memory, Create, Ship, Learn.
  - Added final CTA tracking with `data-final-cta`.
  - Added How It Works-specific click tracking in `js/main.js`.
- `portfolio.html`
  - Repositioned portfolio as proof of range across web, product, brand, and growth.
  - Added outcome-oriented filters and proof framing.
- `faq.html`
  - Rebuilt FAQ around AI, quality, Client Memory, pricing, workflow, ownership, comparisons, and fit.
  - Fixed malformed FAQ JSON-LD encountered during implementation.

Validation done for this group:

- `npm run build`
- `git diff --check`
- JSON-LD parse checks
- GStack browser desktop/mobile screenshots

### VS Comparison Pages

Implemented `/vs/*` repositioning:

- `vs/index.html`
- `vs/designjoy.html`
- `vs/penji.html`
- `vs/manypixels.html`
- `vs/kimp.html`

What changed:

- Reframed comparisons around creative operating models, not commodity subscription feature/price checklists.
- Removed percentage-savings and cheapness positioning.
- Added Client Memory, AI-native creative team, human creative direction, fair competitor-fit sections, updated FAQs, clean breadcrumb URLs, and updated footer language.
- Added `scripts/check-vs-positioning.js`.
- Wired it into `npm test`.

GStack screenshots captured during work:

- `/private/tmp/mydesigner-vs-hub-polished.png`
- `/private/tmp/mydesigner-vs-designjoy.png`
- `/private/tmp/mydesigner-vs-penji-mobile.png`

### Contact Page

The spec referenced `contact.html`, but this worktree did not have that file. Created it fresh:

- `contact.html`

What it does:

- Repositions `/contact` as a creative diagnosis and conversion handoff.
- Keeps the Google Calendar CTA.
- Adds sections for:
  - what the call is for
  - what to bring
  - what the buyer will decide
  - good-fit / not-good-fit routing
  - compare-first links
  - final CTA
- Adds ContactPage schema and clean canonical.
- Adds footer using the new AI-native creative team positioning.

Also added:

- `scripts/check-contact-page.js`
- `/contact` sitemap entry in `scripts/build-blog.js`, regenerated into `sitemap.xml`.

GStack screenshots:

- `/private/tmp/mydesigner-contact.png`
- `/private/tmp/mydesigner-contact-mobile.png`

### Service Detail Pages

Implemented the service detail pages spec by updating the generator source instead of hand-editing generated pages.

Changed source:

- `scripts/build-blog.js`

Generated pages updated:

- `services/website-design.html`
- `services/web-app-design.html`
- `services/webflow-development.html`
- `services/framer-development.html`
- `services/brand-identity.html`
- `services/presentation-design.html`
- `services/social-media-creatives.html`
- `services/booth-designs.html`

What changed:

- Added `SERVICE_REPOSITIONING` in `scripts/build-blog.js`.
- Rebuilt the service detail template to include:
  - outcome-led H1
  - service role/eyebrow
  - fit/use-case section
  - "What MyDesigner helps ship"
  - Diagnose/Gather/Create/Review/Ship process
  - Client Memory section with page-specific angle
  - proof-oriented related work
  - related service/internal links
  - FAQ
  - CTA strip
  - updated footer copy
- Updated Service and FAQ JSON-LD through the generator.
- Added `scripts/check-service-detail-pages.js`.
- Wired it into `npm test`.

GStack screenshots:

- `/private/tmp/mydesigner-service-website.png`
- `/private/tmp/mydesigner-service-brand-mobile.png`

## Verification Status

Most recent successful checks:

```bash
npm run build
npm test
git diff --check
```

Current `npm test` runs:

```bash
node scripts/check-vs-positioning.js &&
node scripts/check-contact-page.js &&
node scripts/check-service-detail-pages.js
```

All three checks passed most recently.

Additional JSON-LD parse checks were run manually for:

- `contact.html`
- all `services/*.html`
- earlier `how-it-works.html`, `portfolio.html`, and `faq.html`

## What Worked

- Updating generated service detail pages at the generator level was the right move. Editing `services/*.html` alone would be overwritten by `npm run build`.
- Small regression scripts were useful guardrails for positioning leaks:
  - VS pages
  - contact page
  - service detail pages
- GStack browser `chain` works reliably when the JSON input is an array of command arrays, for example:

```bash
printf '%s' '[["goto","http://localhost:4176/services/website-design.html"],["screenshot","/tmp/page.png"]]' | /Users/anand-mba/.agents/skills/gstack/browse/dist/browse chain
```

## What Did Not Work / Bugs Encountered

- `contact.html` was missing even though the spec assumed it existed. Fixed by creating it fresh.
- FAQ JSON-LD had malformed structure before the FAQ rebuild. Fixed during the FAQ implementation and validated afterward.
- GStack browser `chain` failed when given an array of object commands. Correct format is array-of-arrays.
- Several local preview ports became stale:
  - `4173` and `4174` sometimes had listeners but did not respond.
  - Restart on a fresh port rather than killing unknown listeners unless necessary.
- Browser text assertions sometimes failed because rendered labels were uppercase, for example:
  - `WHAT THIS PORTFOLIO PROVES`
  - `JUMP TO WHAT MATTERS`
  - `RELATED PATHS`
  The visible pages were correct; tests should avoid brittle case-sensitive probes.
- Some portfolio/service related-work cards may show blank image areas in screenshots if assets are missing or lazy-loaded late. This was seen before on portfolio/service pages and should be checked when doing the portfolio/category/case-study pass.

## Key Decisions

- Keep static HTML architecture; no framework migration.
- Preserve SEO routes and keyword intent while changing the buying frame.
- Use generated-source edits for pages produced by `scripts/build-blog.js`.
- Use direct calendar CTA everywhere instead of adding forms, because no backend/routing was in scope.
- Add focused regression scripts rather than broad end-to-end tests.
- Keep competitor pages fair: competitors can be better fits for certain jobs.
- Keep pricing visible but not as the page thesis.
- Avoid claiming historical portfolio work used the new AI-native workflow unless verified.

## Gotchas For The Next Session

- `npm run build` rewrites:
  - `services/*.html`
  - portfolio category pages
  - location pages
  - blog outputs
  - `js/related-projects.js`
  - `sitemap.xml`
  - parts of `index.html` blog carousel
- Do not hand-edit generated service detail pages unless you also update `scripts/build-blog.js`.
- `package.json` now has real tests. If adding more page groups, extend `npm test` carefully.
- The worktree is already dirty with both older and current-session changes. Do not revert unrelated files.
- The AGENTS instruction says all browsing should use gstack `/browse`, not other browser-control tools.
- Local preview with Python SimpleHTTP does not always resolve clean routes like `/contact`; use `.html` paths locally when needed.

## Next Steps

1. Implement the next architecture group: likely `/work/*` individual case-study pages.
2. Reposition `/portfolio/*` category pages after individual work pages, since category pages are generated by `scripts/build-portfolio.js`.
3. Audit and update global nav/footer consistency across all generated templates:
   - `scripts/build-blog.js`
   - `scripts/build-portfolio.js`
   - `scripts/build-locations.js`
   - static top-level pages
4. Check missing or lazy-loading portfolio images, especially cards that appeared blank in long screenshots.
5. Add regression checks for whichever page group is implemented next.
6. Run the standard loop after each group:

```bash
npm test
npm run build
npm test
git diff --check
```

7. Before shipping, do a final pass for old positioning phrases:

```bash
rg -n "unlimited design subscription|77% less|77% lower|cheap|cheaper|low cost|Book a Design Subscription Call" .
```

## Important Files Map

- `index.html` — homepage repositioning and blog carousel injection target.
- `services.html` — services hub/capability architecture.
- `pricing.html` — commercial architecture and operating rhythms.
- `how-it-works.html` — Diagnose, Memory, Create, Ship, Learn operating model.
- `portfolio.html` — proof/range page.
- `faq.html` — buyer confidence and objection handling page.
- `contact.html` — new contact/creative diagnosis page.
- `conversion-design.html` — new conversion website sprint page.
- `founder-content-engine.html` — new founder content/growth creative page.
- `ai-ready-brand-system.html` — new AI-ready brand system page.
- `vs/*.html` — competitor comparison pages repositioned around operating models.
- `services/*.html` — generated service detail pages, do not hand-edit without updating generator.
- `scripts/build-blog.js` — most important generator; now includes `SERVICE_REPOSITIONING`, sitemap static pages, service detail template, and service page generation.
- `scripts/build-portfolio.js` — portfolio category generator; likely next relevant source for `/portfolio/*`.
- `scripts/build-locations.js` — location page generator; likely future SEO page pass.
- `scripts/check-vs-positioning.js` — VS page positioning regression checks.
- `scripts/check-contact-page.js` — contact page positioning/schema checks.
- `scripts/check-service-detail-pages.js` — generated service detail page checks.
- `package.json` — `npm test` now runs all three regression scripts.
- `js/main.js` — analytics/tracking; includes How It Works CTA tracking additions.
- `css/styles.css` — visual system/style changes from the repositioning work.
- `sitemap.xml` — regenerated sitemap including `/contact` and other updated routes.

## Final Note

The repositioning is partially implemented across many page groups, but not globally complete. The site now has a much stronger core story, yet older generated surfaces may still leak old subscription language. Future work should keep updating source generators first, then generated pages through `npm run build`.

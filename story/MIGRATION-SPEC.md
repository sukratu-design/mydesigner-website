# ORBIT → Main Site Migration Spec

Goal: make the ORBIT concept the **primary mydesigner.gg experience**, with the
**entire site reskinned** to the ORBIT design system before go-live (founder
decision, 2026-06-13). Pricing is confirmed publishable. This is a whole-codebase
migration, sequenced to protect existing SEO and conversions.

## 0. Current-state facts (verified)

- Most pages are **generated** by build scripts, not hand-authored:
  - `build-services.js` → 8 pages at `/services/<slug>` (framer-development,
    webflow-development, web-app-design, website-design, brand-identity,
    presentation-design, booth-designs, social-media-creatives)
  - `build-work.js` → 20 case studies `/work/<slug>` from `content/work/*.html`
  - `build-portfolio.js` → 4 category pages `/portfolio/*`
  - `build-blog.js` → blog index + 27 posts + RSS + (calls homepage carousel)
  - `build-sitemap.js` → `sitemap.xml` from a static URL list
  - `build-homepage-carousel.js` → **rewrites root `index.html`** (conflict)
- Shared partials: `scripts/partials/{nav,footer,copyright}.js` (light/DaisyUI).
- Every generated page links `/css/site.css` (Tailwind+DaisyUI, built from
  `css/tailwind.source.css`) + `/css/styles.css`. ORBIT CSS is currently inline
  in each story page.
- Hand-authored root pages: index, services, pricing, how-it-works, faq, contact,
  portfolio, 404.
- Production homepage has **3 Schema.org blocks** (Organization, FAQPage, Service);
  ORBIT pages have **0**. Analytics on production: GA4 `G-BJS1P09VE8`, Microsoft
  Clarity, GTM, plus FB pixel, ConvertKit, AI chat assist. ORBIT pages have none.
- `npm test` runs a real suite (`check-*.js`) asserting the CURRENT structure
  (e.g. `check-homepage-portfolio.js`, `check-service-detail-pages.js`,
  `check-csp-analytics.js`). These will fail against a reskinned site until updated.
- Clean URLs: edge function `netlify/edge-functions/redirect-html.js` 301s any
  `*.html` → extensionless.

## 1. Architecture decisions

### 1.1 Shared design system (foundation)
Extract the ORBIT look from inline `<style>` into **`/css/orbit.css`** — tokens,
fonts (@font-face TheSeasons), base type, nav/footer, buttons, cards, grain,
reveal utilities, static/reduced-motion rules. Every page (generated + hand)
links `orbit.css`. Retire `site.css`/`styles.css` from reskinned pages; remove
DaisyUI/Tailwind once nothing references it (drop `build:css` last).

### 1.2 Two page tiers
- **Marquee pages** (home, about, work, services): full ORBIT treatment incl.
  lazy WebGL ring/particle background + Humans|Agents toggle.
- **Reading/deep pages** (service details, offer pages, case studies, blog,
  portfolio, contact): ORBIT *static dark theme* — same tokens/type/chrome, NO
  per-page WebGL (faster, better for reading & SEO). Optional faint static star
  texture only. Agents toggle optional here (recommend: keep a link to the
  agents edition of the home, not a per-page toggle).

### 1.3 Routing / URL model
ORBIT becomes root. Proposed final URL map (DECISION NEEDED — see §4):
- `/` → ORBIT home (was `story/index.html`)
- `/about` → ORBIT about (was `story/about.html`)
- `/work` → ORBIT work (was `story/work.html`); `/work/<slug>` case studies stay
- `/services` → ORBIT services overview (replaces current services.html);
  `/services/<slug>` detail pages stay (reskinned)
- Consolidated-into-home chapters: `/pricing` → `/#ch-plans`,
  `/faq` → `/#ch-faq`, testimonials in-home. `/how-it-works` → `/about` (or its
  own reskinned page). `/contact` → reskinned page or booking link.
- `/blog/`, `/portfolio`, offer pages keep their URLs (reskinned).
- `/story/*` → 301 to the new root URLs (avoid dupes; preserve any shared links).

### 1.4 Build-conflict resolution
- Retire/replace `build-homepage-carousel.js` (it rewrites index.html). Either
  drop the injected carousel (ORBIT home has its own work showcase) or rewrite it
  to emit ORBIT markup into a designated slot.
- Root `index.html` becomes the ORBIT home; ensure no generator overwrites it.
- Update `build-sitemap.js` URL list to the new map; regenerate canonicals clean.

## 2. SEO / analytics / parity (go-live gates)

- Port the 3 Schema.org blocks into the new templates (Organization on all;
  FAQPage on home; Service/Offer on services + offer pages; add
  BreadcrumbList + Article on blog posts, CreativeWork on case studies).
- GA4 + Clarity + GTM in a shared `<head>` partial linked by every page.
- Re-add lead machinery: ConvertKit, contact form, FB pixel, AI chat assist —
  confirm which survive (DECISION).
- Canonicals: extensionless, self-referential.
- 301 map for every changed URL; keep CSP headers (update if new origins).
- Fix sub-page canonicals (currently point at redirecting `.html`).

## 3. Execution sequence (orchestrated, each a Codex chunk + browser verify)

1. **Foundation:** extract `/css/orbit.css`; build shared head/nav/footer
   partials (ORBIT, with analytics + schema hooks). Verify story pages still
   render off the shared CSS.
2. **Generators — service tier:** reskin `build-services.js` shell → 8 detail
   pages + 3 offer pages in ORBIT static dark. Update `check-service-detail-pages.js`.
3. **Generators — work + portfolio:** reskin `build-work.js` (20 case studies)
   and `build-portfolio.js` (4 category pages). Update their checks.
4. **Generators — blog:** reskin `build-blog.js` (index + posts + RSS shell).
   Update `check-blog-positioning.js`.
5. **Hand pages:** reskin/redirect contact, how-it-works; fold pricing/faq into
   home chapters with 301s.
6. **Root swap + routing:** move ORBIT pages to root URLs; resolve homepage
   carousel; 301 `/story/*`; rewrite `build-sitemap.js`; canonicals.
7. **Parity:** schema blocks, GA4/Clarity/GTM, lead tools, CSP review.
8. **Tests + full build:** update all `check-*.js`; `npm run build` clean;
   `npm test` green; full-site browser QA (light→dark boundary gone, links,
   mobile, both editions, fallbacks).
9. **Launch:** deploy to production (not draft); post-deploy smoke test +
   Search Console sitemap resubmit.

## 4. Decisions — RESOLVED (founder, 2026-06-13)
- **D1 — Page map: FOLD EVERYTHING.** 301 `/pricing` → `/#ch-plans`,
  `/faq` → `/#ch-faq`, `/how-it-works` → `/about`, `/contact` → the booking link
  (no standalone contact page). None survive as standalone pages.
- **D2 — URLs: CLEAN ROOT + 301.** `/`, `/about`, `/work`, `/services` at root;
  `/story/*` → 301 to them.
- **D3 — Lead tools: GA4 + Clarity + GTM (always) + Facebook pixel ONLY.**
  DROP ConvertKit newsletter, the contact form, and the AI chat-assist bot.
  Simplifies CSP (remove convertkit + aichatassist origins; keep facebook).
- **D4 — Deep pages: STATIC DARK, no WebGL.** WebGL stays only on the four
  marquee pages (home/about/work/services).

Consequences: fewer integrations and a simpler CSP; no contact-form serverless
path needed; deep-page generators emit static dark templates with no GL plumbing.

## 5. Risks
- SEO regression if 301s/schema/sitemap are sloppy — biggest business risk.
- Scope: ~75 outputs + generators + tests; multi-week. Sequence protects against
  a broken half-migrated state by keeping the build green at each step.
- Design-system bleed: until `site.css` is fully retired, both systems load —
  keep an eye on conflicts; remove DaisyUI last.

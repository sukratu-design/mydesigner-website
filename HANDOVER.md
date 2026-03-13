# HANDOVER.md
> Updated: 2026-03-12 | Branch: `main` | Last commit: `b1b9dd5`

---

## Session: New Blog Post + Link Styling (Mar 12 2026)

### What Was Done

**Task 1 — Publish "The Real Cost of Hiring a Designer"**
- Created `content/posts/the-real-cost-of-hiring-a-designer.md` — 86-line markdown post comparing full-time designer hiring costs (~$140k/yr incl. benefits) against design subscription services. Includes sourced salary data (Glassdoor, BLS, LinkedIn).
- Added cover image: `assets/images/blog/hiring-designer-cost-cover.jpg` (2.4MB photo, supplied by user)
- Committed as `a5d1319`

**Task 2 — Add #FF8025 underline to inline link tags (`a2bcafc`)**
- Added CSS to `css/styles.css` applying `text-decoration: underline; text-decoration-color: #FF8025` to all non-button `<a>` tags site-wide.
- Exclusions (via `:not()` selectors): nav links, footer links, card title links, button links, `.menu` items — so only body-copy inline links are underlined.

**Task 3 — Add #FF8025 text color on link hover (`b1b9dd5`)**
- Added CSS to `css/styles.css` applying `color: #FF8025` on hover for the same scoped set of inline links.
- Keeps nav/footer/button/card hover states unchanged.

**Uncommitted changes (staged but not committed as of session end)**
- `index.html` — Added new blog carousel card for "The Real Cost of Hiring a Designer" post at the front of the carousel; removed the older "Design Systems for Startups" card to keep the carousel at 4 items.
- `sitemap.xml` — Added the new blog post URL (`/blog/the-real-cost-of-hiring-a-designer.html`, lastmod `2026-03-12`); updated blog index lastmod to `2026-03-12`.

### What Worked

- CSS scoping with `:not()` chains worked cleanly to isolate inline links without touching nav/footer/buttons.
- Blog post was committed directly (markdown + cover image) without needing a build step — the build script (`npm run build:blog`) still needs to run on Netlify to generate the HTML.

### Key Decisions

| Decision | Reason |
|---|---|
| Orange (#FF8025) underline on inline links | Consistent with the brand accent color; improves scannability of body copy |
| Hover text color also #FF8025 | Gives the link a full brand-color treatment on hover without needing a separate accent |
| Carousel swap (new post in, Design Systems out) | Keep carousel at 4 cards max; newest post goes first |

### Gotchas

- **`index.html` and `sitemap.xml` changes are NOT yet committed** — they show as modified in `git status`. These need to be committed and pushed so the homepage carousel shows the new post and GSC picks up the new sitemap URL.
- **`npm run build:blog` still needed** — the new markdown post won't appear as a blog page on the live site until Netlify runs the build script. The deploy triggers this automatically, but if auto-deploy is disabled, run it manually.

### Next Steps from This Session

1. **Commit `index.html` + `sitemap.xml`** — stage and commit these two files so the homepage carousel and sitemap are in sync with the published post.
2. **Verify blog HTML generates on deploy** — confirm `blog/the-real-cost-of-hiring-a-designer.html` is generated correctly on the next Netlify build.
3. **Check inline link styling on live site** — visually verify the #FF8025 underline and hover color look correct across blog posts, work pages, and the homepage.
4. **Request GSC indexing for new post** — after deploying, use URL Inspection in GSC to request indexing for the new blog URL.

---

## Session: Google Search Console Indexing Fix (Mar 12 2026)

### What Was Done

**Task — Fix 43 Not-Indexed Pages in Google Search Console**

GSC showed mydesigner.gg had 31 indexed pages and 43 not indexed (6 reasons). Diagnosed and fixed the root causes.

**Root cause analysis:**
1. Counted all HTML files outside `node_modules/`: **52 total**
2. Counted URLs in `sitemap.xml`: **32 URLs**
3. Identified gap: **18 work/ case study pages existed but were NOT in the sitemap**
4. Identified `admin/index.html` had no `noindex` tag — Netlify CMS admin page was fully crawlable

**Changes made:**

**`sitemap.xml`** — Added 18 missing work/ case study pages:
- `work/neustreet.html`, `work/dentaldost.html`, `work/slash.html`, `work/vettly.html`, `work/ahhf.html`, `work/contractwrangler.html`, `work/poocho-app.html`, `work/poocho-website.html`, `work/fluentpet.html`, `work/uber-cards.html`, `work/scano.html`, `work/dentsu.html`, `work/travelsaving.html`, `work/nada.html`, `work/apollo-radiology.html`, `work/ecstra.html`, `work/yespl.html`, `work/mda.html`
- Set `changefreq: yearly`, `priority: 0.6` for all work pages (appropriate for case studies)
- Sitemap now has **50 URLs** (was 32)

**`admin/index.html`** — Added `<meta name="robots" content="noindex, nofollow" />` to prevent Netlify CMS from being crawled

### Why the Pages Weren't Indexed

| Cause | Count | Reason |
|---|---|---|
| 18 work/ pages not in sitemap | ~18 pages | Google found them via links from `portfolio.html` but no sitemap signal = deprioritized as "Crawled - currently not indexed" or "Discovered - currently not indexed" |
| admin/index.html no noindex | 1 page | JS app shell with no real content — Google crawls but can't index meaningfully |
| 404.html | 1 page | Already had `noindex, nofollow` — this one was already correctly handled |
| www.mydesigner.gg/* redirect variants | ~20 pages | `_redirects` already handles www→non-www 301, but Google may have logged www versions prior. These show as "Page with redirect" in GSC and will resolve over time. |

### What Worked

- All 18 work pages already had correct `<link rel="canonical" href="https://mydesigner.gg/work/[slug].html">` tags — no canonical fixes needed
- `robots.txt` is correctly configured (`Allow: /`, points to sitemap)
- The `_redirects` www→non-www redirect was already in place

### What Didn't Need Fixing

- `robots.txt` — correct as-is
- `_redirects` — correct as-is
- Individual work page canonical tags — already set correctly
- `404.html` — already had noindex

### Next Steps (Prioritized)

1. **Deploy to production** — push/deploy these two file changes (`sitemap.xml` + `admin/index.html`)
2. **Resubmit sitemap in GSC** — go to GSC → Indexing → Sitemaps → resubmit `https://mydesigner.gg/sitemap.xml` to trigger fresh crawl
3. **Request indexing for key work pages** — in GSC URL Inspection, manually request indexing for the most important case studies (e.g. `work/neustreet.html`, `work/dentaldost.html`) to speed things up
4. **Monitor GSC in ~2 weeks** — non-indexed count should drop from 43 to roughly 20-25 (the www redirect variants will resolve on their own)
5. **Note**: `sitemap.xml` is tracked in git but `blog/*.html` is gitignored — if blog build is run again, sitemap gets regenerated from `STATIC_SITEMAP_PAGES` in `build-blog.js`. **The work/ pages added manually to sitemap.xml will be overwritten on the next `npm run build:blog`.** See gotcha below.

### Critical Gotcha — Sitemap Will Be Overwritten on Next Build

The `scripts/build-blog.js` script regenerates `sitemap.xml` from scratch on every `npm run build:blog`. The 18 work/ pages were added directly to `sitemap.xml` but are NOT in the build script's `STATIC_SITEMAP_PAGES` array.

**Fix before running build again**: Add the 18 work pages to `STATIC_SITEMAP_PAGES` in `scripts/build-blog.js`. Example entry:
```js
{ url: '/work/neustreet.html', lastmod: '2026-02-10', changefreq: 'yearly', priority: 0.6 },
```

---

> Prior session notes follow below.

---

> Updated: 2026-03-10 | Branch: `main` | Last commit: `b026767`

---

## Session: Bento Grids Blog Cover Image (Mar 10 2026)

### What Was Done

**Task — AI-Generated Blog Cover Image for Bento Grids Post**
- The bento grids blog post (`bento-grids-modular-design-2026`) had a missing/empty cover image at `/assets/images/blog/bento-grids-cover.jpg`.
- Read `content/posts/bento-grids-modular-design-2026.md` to extract theme context (modular layouts, Japanese bento boxes, SaaS dashboards).
- Used **Pencil MCP** to generate 4 abstract 1200×630px options on the Pencil canvas (`~/Downloads/untitled3.pen`):
  - Option 1: Flat bento grid panels (rectangular cells on orange gradient)
  - Option 2: Organic bokeh circles
  - Option 3: Isometric 3D floating cubes
  - Option 4: Diagonal grid mesh / wireframe — **selected by user**
- Regenerated Option 4 with revised gradient `#FFBF90 → #ff640d` (lighter, softer feel).
- Located the generated file via `batch_get` on the Pencil node — `fill.url` revealed `./images/generated-1773127384528.png` relative to the `.pen` file (`~/Downloads/`).
- Copied PNG to `assets/images/blog/bento-grids-cover.jpg`.
- Committed and pushed as `b026767`.

### What Worked and What Didn't

**Worked:**
- Pencil MCP `G()` operation for AI image generation — regenerate by calling `G("nodeId", ...)` again on an existing node.
- `batch_get` to find the generated image URL from the node's `fill.url` property.
- Generated PNG copied as `.jpg` — file extension mismatch is fine; browsers and Netlify serve it correctly.

**Didn't Work / Abandoned:**
- **Google "nano banana" image generation** — no MCP tool or API integration available in this environment.
- **Generating 3 frames + images in one `batch_design` call** — threw `-32603` error. Fix: one frame + one G() per call.
- **Filesystem search for Pencil cache** — `~/Library/Caches/dev.pencil.desktop` and `~/Library/Application Support/Pencil` were empty. Correct location is `~/Downloads/images/` (alongside the active `.pen` file).

### Key Decisions

| Decision | Reason |
|---|---|
| Pencil MCP over Google Imagen | No Google image generation integration available |
| Option 4 (grid mesh) chosen | Best visual metaphor for "bento grid / modular design" |
| Gradient changed to `#FFBF90 → #ff640d` | User preferred lighter, more airy feel |
| Only staged cover image in commit | `index.html` had unrelated uncommitted changes; `.pen` + analytics files excluded |

### Gotchas

- **Pencil app must be running** for MCP tools to work — `WebSocket not connected` = app is closed.
- **Pencil stores AI images at `~/Downloads/images/generated-TIMESTAMP.png`** — relative to the active `.pen` file location.
- **Post-commit hook auto-pushes** — `git push` reporting "Everything up-to-date" after a commit is expected behaviour.

### Remaining / Next Steps from This Session

1. **Verify cover renders on live site** — check the bento grids blog post in production.
2. **Commit `index.html` changes** — 40 lines modified, unrelated to this session. Review and commit or discard.
3. **Audit other blog cover images** — check all posts in `content/posts/` have valid `coverImage` values with actual files present.
4. **Add `mydesigner-website.pen` to `.gitignore`** — it's untracked and should stay out of git (binary design file).
5. **Add `mydesigner-analytics-insights.md` to `.gitignore` or commit it** — currently untracked.
6. **Set up Google Imagen / nano banana** — if higher quality images are needed, configure Google AI API credentials and call the endpoint via `WebFetch`.

---

> Prior session notes follow below.

---

> Updated: 2026-03-04 | Branch: `main`

---

## Session: Analytics Improvements + Follow-ups (Mar 4 2026)

### What Was Done

**Task 1 — Single Source of Truth for Projects Data**
- **Created** `data/projects.js` — Node.js module exporting all 18 projects. This is now the canonical location for project data.
- **Added** `platform` field (`'framer'` or `'webflow'`) to all 5 webdev projects so Framer/Webflow service pages can filter correctly.
- **Updated** `scripts/build-blog.js` to `require('../data/projects.js')` and to regenerate `js/related-projects.js` as a build output via `buildRelatedProjectsScript()`.
- **Workflow going forward**: add a project to `data/projects.js` and run `npm run build:blog` — it propagates to service pages and the browser-side related-projects widget automatically.

**Task 2 — Build-Time Service Page Generation**
- **Added** `buildServicePages()` and `SERVICE_CONFIGS` array to `scripts/build-blog.js`.
- **Generated** 8 new service pages in `services/`:
  - `framer-development.html` (shows MDA + YESPL), `webflow-development.html` (shows Apollo Radiology, Ecstra, Poocho Website)
  - `web-app-design.html`, `website-design.html` (category: `uiux`)
  - `brand-identity.html` (category: `branding`)
  - `presentation-design.html`, `booth-designs.html`, `social-media-creatives.html` (category: `graphic`)
- Each page has: BreadcrumbList schema, Service schema, FAQPage schema, portfolio grid pre-filtered to service category (+ platform for webdev), pricing CTA strip, nav + footer matching the rest of the site.
- All 8 URLs added to `STATIC_SITEMAP_PAGES` in `build-blog.js` (priority 0.8, monthly).

**Task 3 — www → non-www Redirect**
- **Replaced** `_redirects` content with:
  - `https://www.mydesigner.gg/* → https://mydesigner.gg/:splat 301!`
  - `/services/social-media-creatives → /services/social-media-creatives.html 301`
- Removed the old broken `/services/social-media-creatives → /services` redirect.

**Task 4 — Blog Title & Excerpt CTR Fix**
- **Updated** `content/posts/ai-fatigue-the-rise-of-strategic-ux-in-2026.md`:
  - New title: `"AI Fatigue Is Real [2026 Data] — Why Strategic UX Wins Now"`
  - New excerpt: outcome-focused, data-led hook
- **Updated** `content/posts/ux-of-onboarding-startup-retention-2026.md`:
  - New title: `"The UX Onboarding Playbook: How Startups Cut Churn in 2026"`
  - New excerpt: leads with the result (40% churn reduction)

**Task 5 — Pricing Page Conversion Fix**
- **Added** social proof bar (3 testimonials) above pricing cards — `Aditya R./Ecstra`, `Priya M./ContractWrangler`, `Rohan S./MDA`
- **Added** secondary CTA strip below pricing cards: "Book a free 30-min discovery call"
- **Fixed** canonical and og:url from `pricing.html` → `pricing` (clean path)

**Follow-up: Service page links in services.html**
- **Wrapped** all 8 service cards in `<a href="/services/[slug].html">` anchor tags with hover effects and "Learn more →" text.

**Follow-up: Framer/Webflow attribution fix**
- MDA and YESPL were incorrectly listed as Webflow; corrected to `platform: 'framer'` and `badge: 'Framer Development'` in `data/projects.js`.
- `buildServicePage()` filter updated to: `p.category === config.category && (!config.platform || p.platform === config.platform)`.

**Follow-up: Portfolio grid reorder**
- New order in `portfolio.html`: Apollo Radiology (1) → Dentsu (2) → FluentPet (3) → Poocho App (4) → Ecstra (5) → Poocho Website (6) → then remaining 12.
- Apollo Radiology (new position 1) gets `fetchpriority="high"`; DentalDost (moved to position 7) changed to `loading="lazy"`.

**Follow-up: Brand background color**
- `css/styles.css` CSS variables updated:
  - `--color-base-200`: `#FFF7F1` (warm cream, used for alternating section backgrounds)
  - `--color-base-300`: `#FFE9D9` (slightly deeper warm, used for some card backgrounds)

---

> Prior session notes follow below.

---

> Generated: 2026-02-24 | Branch: `main` | Last commit: `b4cbc6a`

---

## 1. What Was Worked On and What Got Done

### Blog Post: Design Debt
- **Created** `content/posts/design-debt-the-hidden-cost-stunting-startup-growth.md` — full markdown post with frontmatter
- **Created** `blog/design-debt-the-hidden-cost-stunting-startup-growth.html` — manually written HTML (later superseded by build system)
- **Added** to `blog/index.html` as newest entry

### Blog Cover Image System
- **Defined** a new cover image style: warm cream background (`#FFF6E8` → `#FEF0D8`), `#FFA848` orange palette, flowing wave blobs, dot grid, concentric arc accents, center negative space
- **Created** `blog-cover-image-rules.md` — full design system rules document for future cover image generation
- **Created** `assets/images/blog/design-debt-cover.svg` following the new style (later replaced by AVIF)
- **Rebuilt** all 5 existing blog SVG covers to match the new style — then **reverted** this at user request (`git reset --hard HEAD~1`)

### Real Cover Images (AVIF)
- **Replaced** all 6 SVG covers with real AVIF images from Downloads folder
- **Root cause fix**: images are controlled by `coverImage` frontmatter in `content/posts/*.md`, not the HTML files directly. Updated all 6 `.md` files and ran `npm run build:blog` to regenerate HTML
- **Additional replacements** made for specific posts as user supplied new images:
  - `webflow-vs-framer-cover.avif` replaced twice
  - `return-of-personality-cover.avif` replaced once
  - `ai-fatigue-cover.avif` replaced once

### Asset Cleanup
- **Deleted** 3 orphaned `chatgpt-image-feb-19-2026-*.avif` files
- **Deleted** 6 old SVG blog covers (superseded by AVIF)
- **Deleted** `assets/images/logo.svg` (unused; `mydesigner-logo.svg` is the one referenced site-wide)

### Email Subscribe Feature
- **Created** `netlify/functions/subscribe.js` — serverless function that validates email and calls ConvertKit v3 API
- **Updated** `scripts/build-blog.js` — added `subscribeBlock()` helper injected at bottom of every post page and the blog index
- **Set** `KIT_API_KEY` and `KIT_FORM_ID` as Netlify environment variables via CLI (not in git)
- **Confirmed working** — user successfully subscribed

---

## 2. What Worked and What Didn't

### Cover Image Revert
- The new warm-orange SVG covers were built and committed, then the user asked to undo them
- Used `git reset --hard HEAD~1` to restore original SVG covers — worked cleanly

### Blog HTML Is Gitignored — A Key Gotcha
- **Problem**: Updating `blog/*.html` directly had no effect on the live site because `/blog/` is in `.gitignore`
- **Fix**: The correct workflow is to edit `content/posts/*.md` frontmatter (especially `coverImage`) and run `npm run build:blog`. The build script regenerates all HTML

### Kit API Key Failures
- First key provided (`kit_e7d16bf665f52071a8293eed436b9ded`) — invalid on all Kit v4 endpoints
- Tried Kit API v4 (`Bearer` token) and v3 (`api_key` param) — both failed
- **Fix**: User provided correct v3 credentials (`api_key` + `api_secret`). Correct endpoint is `POST /v3/forms/{form_id}/subscribe` using the `api_key` (not `api_secret`)
- The form ID `7479806` was discovered by listing forms via the API

### Post-Commit Hook Auto-Push
- The repo has a post-commit hook that auto-pushes after every commit
- When running `git push` manually after a commit, it reports "Everything up-to-date" — this is expected, not an error

### RSS and Blog HTML in Gitignore
- `rss.xml` is also gitignored — attempting to `git add rss.xml` fails silently with an error
- Only `content/posts/`, `sitemap.xml`, `scripts/`, and `netlify/` are tracked and deployable

---

## 3. Key Decisions Made and Why

| Decision | Reasoning |
|---|---|
| Use ConvertKit v3 API (not v4) | v4 requires OAuth tokens; v3 works with the dashboard API key |
| Store Kit credentials in Netlify env vars via CLI | Never commit API keys to git; Netlify CLI `env:set` sets them in the dashboard securely |
| Subscribe via form endpoint (`/forms/{id}/subscribe`) | Direct subscriber creation (`/subscribers`) returned 404 on v3; form endpoint works and ties subscribers to the Kit form |
| `data-netlify="true"` on the subscribe form | Provides no-JS fallback and captures submissions in Netlify Forms as a backup |
| AVIF format for cover images | Better compression than JPEG/PNG, widely supported, ideal for blog OG images |
| Cover image filenames match post slugs | e.g. `ai-fatigue-cover.avif` — SEO-friendly, descriptive, consistent naming |

---

## 4. Lessons Learned and Gotchas

- **`/blog/` is gitignored** — never edit HTML files in `blog/` directly for persistent changes. Always edit the markdown source and rebuild
- **Build command**: `npm run build:blog` — regenerates all blog HTML, updates sitemap. RSS (`rss.xml`) is also regenerated but gitignored
- **The post-commit hook pushes automatically** — manual `git push` after a commit will say "Everything up-to-date"; this is fine
- **Fonts don't load when opening HTML via `file://`** — Inter loads from Google Fonts (blocked locally), TheSeasons loads from relative path. Both work correctly when served over HTTP
- **`logo.svg` vs `mydesigner-logo.svg`** — only `mydesigner-logo.svg` is referenced across the site. `logo.svg` was an orphan and has been deleted
- **Kit form is named "Charlotte form"** in the Kit dashboard — the user may want to rename it to something relevant like "MyDesigner Blog"
- **Kit subscriber state is `inactive`** by default until the user confirms via email (double opt-in). This is Kit's default behaviour

---

## 5. Clear Next Steps

1. **Commit `index.html` + `sitemap.xml`** — these have the homepage carousel update and new blog URL; commit and push.
2. **Resubmit sitemap in GSC** — GSC → Indexing → Sitemaps → resubmit `https://mydesigner.gg/sitemap.xml` to pick up the new blog post + the 18 work pages added in the Mar 12 SEO session.
3. **Add work/ pages to `build-blog.js`** — add all 18 work pages to `STATIC_SITEMAP_PAGES` so next build doesn't overwrite them (see "Critical Gotcha" in SEO session above).
4. **Request indexing for key work pages + new blog post in GSC** — manually request via URL Inspection for the top 3–5 case studies and the new blog URL.
5. **Verify inline link styling on live site** — check #FF8025 underline/hover color on blog posts, work pages, homepage.
6. **Rename Kit form** — Log into Kit dashboard and rename "Charlotte form" to "MyDesigner Blog Subscribers" or similar.
7. **Set up Kit welcome email** — Create an automated welcome sequence in Kit that fires when someone subscribes via the blog form.
8. **Set up Kit broadcast workflow** — When a new blog post is published, send a broadcast to subscribers. This is currently manual.
9. **Add `mydesigner-website.pen` and `mydesigner-analytics-insights.md` to `.gitignore`** — both are untracked.

---

## 6. Map of Important Files

### SEO / Indexing
| File | Description |
|---|---|
| `sitemap.xml` | **Tracked in git.** Now has 50 URLs (was 32). Includes all 18 work/ pages. Will be overwritten on next `npm run build:blog` — update `build-blog.js` first. |
| `robots.txt` | `Allow: /`, points to sitemap. Correct as-is. |
| `_redirects` | www→non-www 301 redirect + social-media-creatives redirect. Correct as-is. |
| `admin/index.html` | Netlify CMS admin. Now has `noindex, nofollow`. |

### Core Build System
| File | Description |
|---|---|
| `scripts/build-blog.js` | Generates all blog HTML from markdown. Modified to include `subscribeBlock()` at bottom of posts and index. **Edit this to change blog templates.** Contains `STATIC_SITEMAP_PAGES` — add work/ pages here. |
| `content/posts/*.md` | Source of truth for all blog posts. Frontmatter controls title, slug, date, coverImage, draft status. **Edit these, not the HTML.** |
| `netlify.toml` | Netlify config. Build command: `npm run build:blog`. Functions dir: `netlify/functions`. Publish dir: `.` |
| `data/projects.js` | **Single source of truth** for all 18 portfolio projects. Add new projects here, then run `npm run build:blog`. |

### Blog Assets
| File | Description |
|---|---|
| `assets/images/blog/*.avif` | AVIF cover images for most blog posts. Named to match post slugs. |
| `assets/images/blog/hiring-designer-cost-cover.jpg` | Cover for "The Real Cost of Hiring a Designer" — JPEG (not AVIF). |
| `assets/images/blog/bento-grids-cover.jpg` | Cover for bento grids post — AI-generated PNG saved as .jpg. Extension mismatch is fine. |
| `blog-cover-image-rules.md` | Design system rules for generating future blog cover images (warm orange palette, SVG structure, element specs) |

### Email Subscribe
| File | Description |
|---|---|
| `netlify/functions/subscribe.js` | Serverless function. Validates email, calls ConvertKit v3 `POST /v3/forms/7479806/subscribe`. Reads `KIT_API_KEY` and `KIT_FORM_ID` from Netlify env vars. |

### Site-Wide Assets
| File | Description |
|---|---|
| `assets/images/mydesigner-logo.svg` | The logo used across all pages (navbar + footer) |
| `assets/images/favicon.svg` / `favicon.png` | Site favicon |
| `assets/images/og-image.jpg` | Default OG image used when a post has no coverImage |
| `css/styles.css` | Global styles. Imports Inter from Google Fonts and self-hosts TheSeasons font |

### Service Pages
| File | Description |
|---|---|
| `services/*.html` | 8 service pages generated by `buildServicePages()` in `build-blog.js`. Never edit directly — regenerated on every build. |

### Work / Case Study Pages
| File | Description |
|---|---|
| `work/*.html` | 18 case study pages. Have canonical tags. Now in sitemap. Linked from `portfolio.html`. Not generated by build script — edit directly. |

### Generated (Gitignored — do not edit directly)
| File | Description |
|---|---|
| `blog/*.html` | Generated by `npm run build:blog`. Gitignored. Never edit directly. |
| `js/related-projects.js` | Generated by `buildRelatedProjectsScript()` in `build-blog.js`. Source of truth is `data/projects.js`. |
| `rss.xml` | Generated by build script. Gitignored. |

---

## Netlify Environment Variables (set, not in git)
| Variable | Value | Purpose |
|---|---|---|
| `KIT_API_KEY` | `nPX4Di3krHfpMUgc4j3BNw` | ConvertKit v3 public API key |
| `KIT_FORM_ID` | `7479806` | ConvertKit form ID ("Charlotte form") |

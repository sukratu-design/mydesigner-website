# HANDOVER.md
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

1. **Rename Kit form** — Log into Kit dashboard and rename "Charlotte form" to "MyDesigner Blog Subscribers" or similar
2. **Set up Kit welcome email** — Create an automated welcome sequence in Kit that fires when someone subscribes via the blog form
3. **Set up Kit broadcast workflow** — When a new blog post is published, send a broadcast to subscribers. This is currently manual
4. **Add design-debt post cover image** — The design-debt post currently uses the SVG placeholder cover. Replace `assets/images/blog/design-debt-cover.avif` with a real image using the same workflow as other posts
5. **Consider adding `blog-cover-image-rules.md` to gitignore or docs folder** — Currently sits in the project root; may want to move to a `docs/` directory
6. **Test subscribe form on live site** — Confirm the Netlify function deploys correctly after the latest push and the form works end-to-end on the production URL
7. **Double opt-in consideration** — Currently Kit requires email confirmation before subscriber is active. Decide whether to keep double opt-in or disable it in Kit settings

---

## 6. Map of Important Files

### Core Build System
| File | Description |
|---|---|
| `scripts/build-blog.js` | Generates all blog HTML from markdown. Modified to include `subscribeBlock()` at bottom of posts and index. **Edit this to change blog templates.** |
| `content/posts/*.md` | Source of truth for all blog posts. Frontmatter controls title, slug, date, coverImage, draft status. **Edit these, not the HTML.** |
| `netlify.toml` | Netlify config. Build command: `npm run build:blog`. Functions dir: `netlify/functions`. Publish dir: `.` |

### Blog Assets
| File | Description |
|---|---|
| `assets/images/blog/*.avif` | 6 cover images for the 6 published blog posts. Named to match post slugs. |
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

### Generated (Gitignored — do not edit directly)
| File | Description |
|---|---|
| `blog/*.html` | Generated by `npm run build:blog`. Gitignored. Never edit directly. |
| `rss.xml` | Generated by build script. Gitignored. |
| `sitemap.xml` | Generated by build script. **Tracked in git** (unlike RSS). |

---

## Netlify Environment Variables (set, not in git)
| Variable | Value | Purpose |
|---|---|---|
| `KIT_API_KEY` | `nPX4Di3krHfpMUgc4j3BNw` | ConvertKit v3 public API key |
| `KIT_FORM_ID` | `7479806` | ConvertKit form ID ("Charlotte form") |

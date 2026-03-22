# HANDOVER — mydesigner-website
> Updated: 2026-03-22 | Branch: `main` | Last commit: `d190b4d`

---

## What Was Done This Session

### 1. Image Generation Pipeline Built
Created `scripts/generate-blog-image.js` — CLI script calling Google's Imagen 4 API to generate monochromatic orange cover images for blog posts.
- API: `imagen-4.0-generate-001` at `generativelanguage.googleapis.com`
- Args: `node scripts/generate-blog-image.js "<topic>" <slug>`
- Saves simultaneously to `/tmp/blog-cover-preview-<slug>.png` (preview) and `assets/images/blog/<slug>-cover.jpg` (final)
- GEMINI_API_KEY stored in `.env` (gitignored)
- Prompt enforces strictly monochromatic orange — NO text, NO letters/numbers/labels, NO blue/grey/green/purple

### 2. Blog Publishing Workflow Established
Created `CLAUDE.md` (project root) defining the exact publish workflow:
1. Prepare frontmatter
2. Generate cover image with script
3. `open /tmp/blog-cover-preview-<slug>.png` — always auto-open for user approval
4. Wait for user approval
5. Write `.md`, run `npm run build`, commit & push

### 3. Five Blog Posts Published
All posts in `content/posts/`, all live on site:

| Post | Slug | Date |
|------|------|------|
| The Design-to-Dev Handoff Is Broken | `design-to-dev-handoff` | Mar 13 |
| Why Your Product Never Looks Like the Designs | `why-your-product-never-looks-like-the-designs` | Mar 14 |
| Micro-Interactions: The Design Detail Most Startups Skip | `micro-interactions-design-detail` | Mar 15 |
| Your Design Is Losing You Money | `design-roi-revenue-growth` | Mar 16 |
| Design Is Your First Due Diligence Test | `design-investor-due-diligence` | Mar 17 |

### 4. Takumi Portfolio Project Added
- Added entry to `data/projects.js` (source of truth)
- Created `work/takumi.html` — full case study page
- Added card to `portfolio.html` (item #19)
- Downloaded 9 gallery images + hero from Contra CDN to `assets/images/work/`
- Thumbnail at `assets/images/portfolio/takumi.webp`
- Live site link: takumitech.ai

### 5. Shareable Portfolio Category Pages
- Created `scripts/build-portfolio.js` — generates 4 category HTML pages from `data/projects.js`
- Output: `portfolio/ui-ux-design.html`, `portfolio/web-development.html`, `portfolio/graphic-design.html`, `portfolio/branding.html`
- Added clean URL rewrites in `netlify.toml` (status 200, no `.html` in URL)
- Updated `package.json`: `"build": "npm run build:blog && npm run build:portfolio"`
- Filter tabs on `portfolio.html` changed from `<button>` to `<a href="/portfolio/...">` links

### 6. Fixed Broken Build Pipeline
Pre-existing draft `micro-interactions-conversion-driver-2026.md` had a YAML parse error (unquoted title with colon, missing date, `published: false` instead of `draft: true`) that was silently blocking all Netlify deployments. Fixed all three issues.

---

## What Worked / What Didn't

### Worked
- Imagen 4 (`imagen-4.0-generate-001`) generates consistent, on-brand results
- Explicit color exclusions in prompt (`NO blue, NO grey, NO green, NO purple`) reliably prevent color bleed
- Sequential blog dating (Mar 13 → Mar 17) keeps the feed looking organic
- `data/projects.js` as single source of truth — category pages auto-update on build

### Didn't Work / Was Abandoned
- `gemini-3-pro-image-preview` — returns 503 consistently, completely unusable
- First image attempts included blue isometric icons (fixed by adding explicit color exclusions)
- First images included hex color codes as visible text (fixed by removing `#FFA848`-style values from prompt, using descriptive color names instead)
- Netlify manual deploy via MCP failed — uploaded entire local directory including `.agent/skills/` causing extraction errors. Root cause was the YAML bug blocking git-based deploys.

---

## Key Decisions

| Decision | Reason |
|----------|--------|
| Imagen 4 not Gemini image models | Only model that reliably works; Gemini image preview returns 503 |
| Monochromatic orange palette | Brand consistency — matches existing blog cover aesthetic |
| NO text/labels in image prompts | Imagen was rendering hex codes and labels as visible text |
| `data/projects.js` as portfolio source of truth | Prevents drift between portfolio.html and category pages |
| Netlify URL rewrites (status 200) | Clean shareable URLs without `.html` extension |
| `draft: true` not `published: false` | `build-blog.js` reads the `draft` field; `published` is not recognized |

---

## Gotchas / Non-Obvious Things

1. **YAML frontmatter titles with colons must be quoted** — `title: Design Is Broken: Here's Why` will fail silently. Use `title: "Design Is Broken: Here's Why"`.

2. **`published: false` does NOT work** — The build script reads the `draft` field only. Use `draft: true` to hide a post.

3. **`date` is required in frontmatter** — Posts without a `date` field cause build errors.

4. **Image script saves to both locations simultaneously** — No copy step needed. `/tmp/` is preview; `assets/images/blog/` is final. Do not add a separate copy command.

5. **Always `open /tmp/blog-cover-preview-<slug>.png` after generation** — User confirmed this must happen automatically every time, not on request.

6. **Netlify auto-deploys from `main` via GitHub** — No manual deploy step. `git push origin main` after a successful `npm run build` is all that's needed.

7. **`micro-interactions-conversion-driver-2026.md`** is a pre-existing draft (different from the published `micro-interactions-design-detail.md`). Fixed but not published. Needs a decision.

8. **Portfolio category pages are generated** — Do not edit `portfolio/ui-ux-design.html` etc. directly. Edit `scripts/build-portfolio.js` or `data/projects.js` and rebuild.

---

## Pending Items

| Priority | Item |
|----------|------|
| **High** | Rotate `GEMINI_API_KEY` — was exposed in plaintext during conversation |
| Medium | Decide on `micro-interactions-conversion-driver-2026.md` — publish or delete |
| Medium | Commit untracked `assets/images/blog/design-debt-hidden-cost-cover.jpg` |
| Low | Investigate uncommitted changes in `js/related-projects.js` and `services/framer-development.html` |
| Low | Consider auto-generating `portfolio.html` from `data/projects.js` (currently hand-maintained) |
| Low | Next blog post — next date in sequence is **March 18** |

---

## Important Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Claude's operating instructions — blog publish workflow |
| `scripts/generate-blog-image.js` | Imagen 4 CLI — generates cover images |
| `scripts/build-blog.js` | Static site builder for blog posts |
| `scripts/build-portfolio.js` | Generates portfolio category pages from `data/projects.js` |
| `data/projects.js` | Single source of truth for all portfolio projects |
| `content/posts/*.md` | Blog post markdown files |
| `assets/images/blog/` | Blog cover images (.jpg) |
| `assets/images/work/` | Project case study images |
| `assets/images/portfolio/` | Portfolio thumbnail images |
| `netlify.toml` | Build config + clean URL rewrites for category pages |
| `package.json` | Build scripts: `build`, `build:blog`, `build:portfolio` |
| `portfolio.html` | Main portfolio page — hand-maintained, filter tabs link to category pages |
| `portfolio/ui-ux-design.html` | Generated category page — do not edit directly |
| `work/takumi.html` | Takumi case study page |
| `.env` | `GEMINI_API_KEY` — gitignored, never commit |
| `content/posts/micro-interactions-conversion-driver-2026.md` | Pre-existing draft — status unresolved |

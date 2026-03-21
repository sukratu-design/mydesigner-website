# mydesigner-website — Claude Instructions

## Blog Publish Workflow

When the user asks to **write a blog post** or **publish a blog post**, follow these steps exactly:

### Step 1 — Prepare the post
- If given raw content: extract the topic, finalize the markdown with proper frontmatter (title, slug, excerpt, date, author, coverImage, draft: false).
- If asked to write one: write the full post content first, then proceed.
- Slug format: lowercase, hyphens, no special chars (e.g. `design-debt-hidden-cost`).
- Date: use today's date in `YYYY-MM-DDTHH:MM` format.

### Step 2 — Generate the cover image
Run the image generation script:
```
node scripts/generate-blog-image.js "<TOPIC>" <slug>
```
Where `<TOPIC>` is a concise description extracted from the post (e.g. "the hidden cost of design debt in startups").

Then **show the user the generated image** using the Read tool on the saved file at `/tmp/blog-cover-preview-<slug>.png` so they can visually approve it.

### Step 3 — Wait for approval
Ask: "Here's the generated cover image — does it look good, or should I regenerate?"
- If approved → proceed to Step 4.
- If rejected → regenerate with a refined prompt (tweak the topic description) and show again.

### Step 4 — Publish
Only after the user approves the image:
1. Write the `.md` file to `content/posts/<slug>.md` with `coverImage: /assets/images/blog/<slug>-cover.jpg`
2. Run `npm run build` to generate the HTML
3. Confirm success and tell the user the post is ready at `/blog/<slug>.html`

### Notes
- The image script saves to both `/tmp/` (preview) and `assets/images/blog/` (final) simultaneously — no extra copy step needed.
- NEVER publish the post (write the .md or run build) before the user approves the image.
- NEVER skip the image generation step when publishing a blog post.

## Tech Stack
- Static site: Node.js build script (`scripts/build-blog.js`)
- Blog posts: `content/posts/*.md` (markdown + YAML frontmatter)
- Cover images: `assets/images/blog/`
- Build command: `npm run build`
- Deploy: Netlify (auto-deploys on git push to main)

## Image Generation
- API: Google Imagen 4 (`imagen-4.0-generate-001`)
- Key: stored in `.env` as `GEMINI_API_KEY`
- Script: `scripts/generate-blog-image.js`

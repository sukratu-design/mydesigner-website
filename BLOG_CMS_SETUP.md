# MyDesigner Blog CMS Setup and Usage

This project now uses Decap CMS (Netlify CMS) with Markdown content in `content/posts`.

## What is already implemented

- CMS admin UI: `admin/index.html`
- CMS config: `admin/config.yml`
- Blog content folder: `content/posts`
- Blog generator: `scripts/build-blog.js`
- Generated outputs:
  - Blog index: `blog/index.html`
  - Blog posts: `blog/*.html`
  - RSS feed: `rss.xml`
  - Sitemap: `sitemap.xml`
- Netlify build config: `netlify.toml`

## One-time Netlify dashboard setup

1. Open your Netlify site dashboard for `mydesigner.gg`.
2. Go to `Site configuration` -> `Identity` and enable Identity.
3. Under Identity settings, enable `Git Gateway`.
4. Under Identity -> `Registration preferences`, set who can invite users.
5. Invite your editor email from Identity -> `Invite users`.

After this, `/admin/` will allow login and publishing.

## Deploy behavior

Netlify runs `npm run build:blog` on deploy (from `netlify.toml`).

That command:

- Reads Markdown files from `content/posts/*.md`
- Builds HTML pages in `blog/`
- Regenerates `rss.xml`
- Regenerates `sitemap.xml`

## How to add a new blog post (recommended: CMS UI)

1. Visit `https://mydesigner.gg/admin/`
2. Login with your invited Netlify Identity account.
3. Click `Blog Posts` -> `New Blog Post`.
4. Fill these fields:
   - `Title`
   - `Slug` (lowercase + hyphens, e.g. `best-landing-page-checklist`)
   - `Excerpt`
   - `Publish Date`
   - `Author`
   - `Cover Image` (optional)
   - `Body`
5. Set `Draft` to `false` when ready.
6. Publish.

CMS commits to your Git repo, which triggers a Netlify deploy.

## How to add a post manually (Git)

Create a file in `content/posts/your-slug.md` with frontmatter:

```md
---
title: Your Post Title
slug: your-post-slug
excerpt: One short summary sentence.
date: 2026-02-19T09:00:00.000Z
author: MyDesigner Team
coverImage: /assets/images/og-image.jpg
draft: false
---

Your markdown content here.
```

Then run:

```bash
npm run build:blog
```

Commit and push.

## Notes

- `draft: true` posts are excluded from blog pages, RSS, and sitemap.
- Slugs must match `^[a-z0-9-]+$`.
- Feed URL is `https://mydesigner.gg/rss.xml`.

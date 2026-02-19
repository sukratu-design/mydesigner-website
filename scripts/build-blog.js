#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const SITE_URL = 'https://mydesigner.gg';
const SITE_TITLE = 'MyDesigner Blog';
const SITE_DESCRIPTION = 'Insights on design, product, branding, and growth from the MyDesigner team.';
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const BLOG_DIR = path.join(process.cwd(), 'blog');
const RSS_PATH = path.join(process.cwd(), 'rss.xml');
const SITEMAP_PATH = path.join(process.cwd(), 'sitemap.xml');

const STATIC_SITEMAP_PAGES = [
  { loc: '/', lastmod: '2026-02-10', changefreq: 'weekly', priority: '1.0' },
  { loc: '/pricing.html', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.9' },
  { loc: '/services.html', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.8' },
  { loc: '/how-it-works.html', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.8' },
  { loc: '/faq.html', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
  { loc: '/portfolio.html', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/', lastmod: '2026-02-11', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/designjoy.html', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/penji.html', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/manypixels.html', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/kimp.html', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' }
];

marked.setOptions({
  mangle: false,
  headerIds: true
});

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readPostFiles() {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .sort();
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDisplayDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function toIsoDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function buildPostObject(fileName) {
  const fullPath = path.join(POSTS_DIR, fileName);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);

  const title = String(data.title || '').trim();
  const excerpt = String(data.excerpt || '').trim();
  const slugFromFrontmatter = String(data.slug || '').trim();
  const fallbackSlug = fileName.replace(/\.md$/, '');
  const slug = slugFromFrontmatter || fallbackSlug;
  const author = String(data.author || 'MyDesigner Team').trim();
  const draft = Boolean(data.draft);
  const coverImage = String(data.coverImage || '').trim();

  if (!title) {
    throw new Error(`Missing required frontmatter field "title" in ${fileName}`);
  }

  if (!excerpt) {
    throw new Error(`Missing required frontmatter field "excerpt" in ${fileName}`);
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Invalid slug "${slug}" in ${fileName}. Use lowercase letters, numbers, and hyphens only.`);
  }

  const dateValue = new Date(data.date);
  if (Number.isNaN(dateValue.getTime())) {
    throw new Error(`Invalid or missing frontmatter field "date" in ${fileName}`);
  }

  const htmlContent = marked.parse(content);

  return {
    title,
    excerpt,
    slug,
    author,
    draft,
    coverImage,
    date: dateValue,
    dateDisplay: formatDisplayDate(dateValue),
    dateIso: dateValue.toISOString(),
    dateOnly: toIsoDateOnly(dateValue),
    markdown: content,
    htmlContent
  };
}

function pageShell({ title, description, canonicalPath, body, ogType = 'website', ogImage = '/assets/images/og-image.jpg' }) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${escapeXml(description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" type="application/rss+xml" title="${SITE_TITLE} RSS" href="${SITE_URL}/rss.xml">
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeXml(title)}">
  <meta property="og:description" content="${escapeXml(description)}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeXml(title)}">
  <meta name="twitter:description" content="${escapeXml(description)}">
  <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
  <link rel="icon" type="image/png" href="/assets/images/favicon.png">
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/daisyui@5" as="style">
  <link rel="preload" href="/css/styles.css" as="style">
  <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    .blog-wrap { max-width: 860px; }
    .blog-prose h1, .blog-prose h2, .blog-prose h3, .blog-prose h4, .blog-prose h5, .blog-prose h6 {
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-weight: 700 !important;
    }
    .blog-prose p, .blog-prose li { line-height: 1.75; margin-bottom: 1rem; }
    .blog-prose ul, .blog-prose ol { margin-left: 1.25rem; margin-bottom: 1rem; }
    .blog-prose code { background: var(--color-base-200); border-radius: 6px; padding: 0.1rem 0.35rem; }
    .blog-prose pre { background: var(--color-base-200); border-radius: 10px; padding: 1rem; overflow-x: auto; margin-bottom: 1rem; }
    .blog-prose blockquote { border-left: 3px solid var(--color-base-300); padding-left: 1rem; color: color-mix(in oklab, var(--color-base-content) 75%, transparent); }
  </style>
</head>
<body class="bg-base-100 text-base-content">
  <nav class="navbar bg-base-100 border-b border-base-300 px-4 lg:px-8" role="navigation" aria-label="Main navigation">
    <div class="navbar-start">
      <a href="/" class="flex items-center gap-2 font-bold text-lg" aria-label="MyDesigner home">
        <img src="/assets/images/mydesigner-logo.svg" alt="MyDesigner" class="h-8">
      </a>
    </div>
    <div class="navbar-end gap-2">
      <a href="/blog/" class="btn btn-ghost btn-sm">Blog</a>
      <a href="/pricing.html" class="btn btn-ghost btn-sm">Pricing</a>
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm">Book a call</a>
    </div>
  </nav>
  ${body}
</body>
</html>
`;
}

function buildBlogIndex(posts) {
  const cards = posts
    .map((post) => {
      return `<article class="card bg-base-200 border border-base-300 hover:shadow-lg transition-shadow">
        <div class="card-body">
          <div class="text-sm text-base-content/70">${post.dateDisplay} · ${escapeXml(post.author)}</div>
          <h2 class="card-title text-2xl"><a class="hover:underline" href="/blog/${post.slug}.html">${escapeXml(post.title)}</a></h2>
          <p>${escapeXml(post.excerpt)}</p>
          <div class="card-actions justify-end">
            <a class="btn btn-primary btn-sm" href="/blog/${post.slug}.html">Read article</a>
          </div>
        </div>
      </article>`;
    })
    .join('\n');

  const body = `<main class="px-4 py-12 lg:py-16">
    <section class="mx-auto blog-wrap">
      <p class="text-sm uppercase tracking-wider text-base-content/70 mb-3">MyDesigner Journal</p>
      <h1 class="text-4xl lg:text-5xl mb-4">Design, growth, and product insights</h1>
      <p class="text-lg text-base-content/70 mb-6">${SITE_DESCRIPTION}</p>
      <div class="flex flex-wrap gap-3 mb-8">
        <a class="btn btn-outline btn-sm" href="/rss.xml">Subscribe via RSS</a>
      </div>
      <div class="grid gap-6">${cards || '<p>No posts published yet.</p>'}</div>
    </section>
  </main>`;

  return pageShell({
    title: 'MyDesigner Blog',
    description: SITE_DESCRIPTION,
    canonicalPath: '/blog/',
    body
  });
}

function buildBlogPostPage(post) {
  const cover = post.coverImage
    ? `<img src="${post.coverImage}" alt="${escapeXml(post.title)}" class="w-full rounded-box border border-base-300 mb-8">`
    : '';

  const body = `<main class="px-4 py-12 lg:py-16">
    <article class="mx-auto blog-wrap">
      <a href="/blog/" class="link link-hover text-sm">← Back to Blog</a>
      <header class="mt-4 mb-8">
        <p class="text-sm text-base-content/70 mb-3">${post.dateDisplay} · ${escapeXml(post.author)}</p>
        <h1 class="text-4xl lg:text-5xl mb-4">${escapeXml(post.title)}</h1>
        <p class="text-lg text-base-content/70">${escapeXml(post.excerpt)}</p>
      </header>
      ${cover}
      <section class="blog-prose">${post.htmlContent}</section>
    </article>
  </main>`;

  const ogImage = post.coverImage || '/assets/images/og-image.jpg';

  return pageShell({
    title: `${post.title} | MyDesigner Blog`,
    description: post.excerpt,
    canonicalPath: `/blog/${post.slug}.html`,
    ogType: 'article',
    ogImage,
    body
  });
}

function buildRss(posts) {
  const latest = posts[0] ? posts[0].date.toUTCString() : new Date().toUTCString();
  const items = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/blog/${post.slug}.html`;
      return `<item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <author>hello@mydesigner.gg (${escapeXml(post.author)})</author>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}/blog/</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${latest}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />
    ${items}
  </channel>
</rss>
`;
}

function buildSitemap(posts) {
  const dynamicPages = [
    ...STATIC_SITEMAP_PAGES,
    {
      loc: '/blog/',
      lastmod: posts[0] ? posts[0].dateOnly : toIsoDateOnly(new Date()),
      changefreq: 'weekly',
      priority: '0.8'
    },
    ...posts.map((post) => ({
      loc: `/blog/${post.slug}.html`,
      lastmod: post.dateOnly,
      changefreq: 'monthly',
      priority: '0.7'
    }))
  ];

  const urls = dynamicPages
    .map(
      (page) => `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function writeOutputs(posts) {
  ensureDir(BLOG_DIR);

  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), buildBlogIndex(posts));

  posts.forEach((post) => {
    const html = buildBlogPostPage(post);
    const outputPath = path.join(BLOG_DIR, `${post.slug}.html`);
    fs.writeFileSync(outputPath, html);
  });

  fs.writeFileSync(RSS_PATH, buildRss(posts));
  fs.writeFileSync(SITEMAP_PATH, buildSitemap(posts));
}

function main() {
  ensureDir(POSTS_DIR);
  const files = readPostFiles();
  const parsedPosts = files
    .map((file) => buildPostObject(file))
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  writeOutputs(parsedPosts);
  console.log(`Built blog: ${parsedPosts.length} published posts`);
}

main();

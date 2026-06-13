#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const { escapeXml, ensureDir } = require('./lib/utils');
const NAV = require('./partials/nav');
const FOOTER = require('./partials/footer');
const { SITE_URL, absoluteUrl, headTags } = require('./partials/head');

// Delegated to focused modules (audit refactor)
const { writeSitemap } = require('./build-sitemap');
const { injectBlogCarouselIntoHomepage } = require('./build-homepage-carousel');
const { buildRelatedProjectsScript } = require('./build-related-projects');

const SITE_TITLE = 'MyDesigner Blog';
const SITE_DESCRIPTION = 'Design strategy, SaaS UI/UX tips, and brand insights for founders and growth teams. Learn how design drives conversions, trust, and revenue.';
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const BLOG_DIR = path.join(process.cwd(), 'blog');
const RSS_PATH = path.join(process.cwd(), 'rss.xml');

const BLOG_PAGE_CSS = `  <style>
    .blog-main {
      position: relative;
      z-index: 2;
    }
    .blog-index-hero h1,
    .blog-post-hero h1 {
      font-family: var(--serif);
      font-weight: 320;
      font-variation-settings: "opsz" 144;
      font-size: clamp(3rem, 7vw, 6.5rem);
      line-height: 0.98;
      letter-spacing: -0.015em;
      color: var(--paper);
    }
    .blog-index-hero h1 { max-width: 11ch; }
    .blog-post-hero h1 { max-width: 13ch; }
    .blog-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem 0.9rem;
      margin: 0 0 1.25rem;
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--paper-faint);
    }
    .blog-meta span + span::before {
      content: "/";
      margin-right: 0.9rem;
      color: var(--accent-dim);
    }
    .blog-index-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }
    .blog-card {
      display: grid;
      grid-template-rows: auto 1fr;
      min-height: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
      background: rgba(244, 239, 233, 0.045);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
      transition: border-color 0.25s ease, transform 0.25s ease;
    }
    .blog-card:hover {
      border-color: var(--accent-dim);
      transform: translateY(-2px);
    }
    .blog-card__media {
      display: block;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      background: var(--ink-2);
    }
    .blog-card__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border: 0;
      transition: transform 0.4s ease;
    }
    .blog-card:hover .blog-card__media img {
      transform: scale(1.035);
    }
    .blog-card__body {
      display: grid;
      align-content: start;
      gap: 0.7rem;
      padding: clamp(1.2rem, 2.5vw, 1.65rem);
    }
    .blog-card__body h2 {
      font-size: clamp(1.15rem, 2vw, 1.45rem);
      line-height: 1.22;
      color: var(--paper);
    }
    .blog-card__body p {
      color: var(--paper-dim);
      line-height: 1.65;
    }
    .blog-card__link {
      align-self: end;
      margin-top: 0.35rem;
      color: var(--accent);
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .blog-empty {
      color: var(--paper-dim);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1.5rem;
      background: rgba(244, 239, 233, 0.045);
    }
    .blog-article-shell {
      width: min(100%, 68ch);
      margin: 0 auto;
      padding: 0 var(--gutter) clamp(5rem, 10vh, 7rem);
    }
    .blog-cover {
      margin: 0 0 clamp(2.2rem, 5vw, 3.5rem);
      padding: clamp(0.45rem, 1vw, 0.7rem);
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(244, 239, 233, 0.045);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
    }
    .blog-cover img {
      width: 100%;
      border-radius: 6px;
      object-fit: cover;
    }
    .blog-prose {
      color: var(--paper-dim);
      font-size: clamp(1rem, 1.25vw, 1.08rem);
      line-height: 1.82;
    }
    .blog-prose > * + * {
      margin-top: 1.15rem;
    }
    .blog-prose h1,
    .blog-prose h2,
    .blog-prose h3,
    .blog-prose h4,
    .blog-prose h5,
    .blog-prose h6 {
      color: var(--paper);
      font-family: var(--serif);
      font-weight: 320;
      line-height: 1.12;
      letter-spacing: -0.01em;
    }
    .blog-prose h1 {
      margin-top: 0;
      font-size: clamp(2.2rem, 4vw, 3.4rem);
    }
    .blog-prose h2 {
      margin-top: 3rem;
      font-size: clamp(1.75rem, 3vw, 2.55rem);
    }
    .blog-prose h3 {
      margin-top: 2.3rem;
      font-size: clamp(1.35rem, 2.2vw, 1.85rem);
    }
    .blog-prose h4,
    .blog-prose h5,
    .blog-prose h6 {
      margin-top: 2rem;
      font-family: var(--sans);
      font-size: 1.05rem;
      font-weight: 620;
      letter-spacing: 0;
    }
    .blog-prose p,
    .blog-prose li {
      color: var(--paper-dim);
    }
    .blog-prose strong {
      color: var(--paper);
      font-weight: 620;
    }
    .blog-prose em {
      color: var(--paper);
    }
    .blog-prose a {
      color: var(--paper);
      text-decoration: underline;
      text-underline-offset: 4px;
      text-decoration-color: var(--accent-dim);
      transition: color 0.2s ease;
    }
    .blog-prose a:hover {
      color: var(--accent);
    }
    .blog-prose ul,
    .blog-prose ol {
      padding-left: 1.35rem;
    }
    .blog-prose li + li {
      margin-top: 0.45rem;
    }
    .blog-prose li::marker {
      color: var(--accent);
    }
    .blog-prose blockquote {
      margin: 2.2rem 0;
      padding: 1.2rem 1.35rem;
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      background: rgba(244, 239, 233, 0.045);
      color: var(--paper);
    }
    .blog-prose blockquote p {
      color: var(--paper);
      font-family: var(--serif);
      font-size: clamp(1.25rem, 2vw, 1.55rem);
      line-height: 1.48;
    }
    .blog-prose code {
      border: 1px solid var(--line);
      border-radius: 5px;
      padding: 0.12rem 0.34rem;
      background: rgba(244, 239, 233, 0.07);
      color: var(--paper);
      font-family: var(--mono);
      font-size: 0.9em;
    }
    .blog-prose pre {
      overflow-x: auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1rem;
      background: var(--ink-2);
      color: var(--paper-dim);
    }
    .blog-prose pre code {
      border: 0;
      padding: 0;
      background: transparent;
      color: inherit;
    }
    .blog-prose hr {
      border: 0;
      border-top: 1px solid var(--line);
      margin: 2.8rem 0;
    }
    .blog-prose img {
      width: 100%;
      margin: 2rem 0;
      padding: 0.45rem;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(244, 239, 233, 0.045);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.26);
    }
    .blog-prose .table-wrap {
      overflow-x: auto;
      margin: 2rem 0;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(244, 239, 233, 0.035);
    }
    .blog-prose table {
      width: 100%;
      min-width: 680px;
      border-collapse: collapse;
      font-size: 0.92rem;
      line-height: 1.55;
    }
    .blog-prose th,
    .blog-prose td {
      padding: 0.85rem 1rem;
      text-align: left;
      border-top: 1px solid var(--line);
    }
    .blog-prose th {
      border-top: 0;
      color: var(--paper);
      background: rgba(255, 138, 61, 0.09);
      font-weight: 620;
    }
    .blog-rss-card {
      margin-top: clamp(3rem, 7vh, 5rem);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: clamp(1.35rem, 3vw, 2rem);
      background: rgba(244, 239, 233, 0.045);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
    }
    .blog-rss-card h2 {
      margin-top: 0.45rem;
      color: var(--paper);
      font-family: var(--serif);
      font-weight: 320;
      font-size: clamp(1.6rem, 3vw, 2.5rem);
      line-height: 1.08;
    }
    .blog-rss-card p {
      max-width: 56ch;
      margin-top: 0.75rem;
      color: var(--paper-dim);
    }
    .blog-rss-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
      margin-top: 1.35rem;
    }
    @media (max-width: 980px) {
      .blog-index-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 680px) {
      .blog-index-grid {
        grid-template-columns: 1fr;
      }
      .blog-post-hero h1,
      .blog-index-hero h1 {
        max-width: 100%;
      }
    }
  </style>`;

marked.setOptions({
  mangle: false,
  headerIds: true
});

function readPostFiles() {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .sort();
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

  const htmlContent = marked
    .parse(content)
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>');

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

function pageShell({ title, description, canonicalPath, body, ogImage = '/assets/images/og-image.jpg', structuredData = [] }) {
  return `<!DOCTYPE html>
<html lang="en" class="static">
<head>
${headTags({
    title,
    description,
    canonical: canonicalPath,
    ogTitle: title,
    ogDescription: description,
    ogImage: absoluteUrl(ogImage),
    schema: structuredData,
    extra: `  <link rel="alternate" type="application/rss+xml" title="${SITE_TITLE} RSS" href="${SITE_URL}/rss.xml">\n${BLOG_PAGE_CSS}`
  })}
</head>
<body class="orbit-static">
  ${NAV}
  <div class="grain"></div>
  <div class="vignette"></div>
  ${body}
  ${FOOTER}
</body>
</html>
`;
}

function rssBlock() {
  return `<aside class="blog-rss-card">
    <p class="kicker">RSS</p>
    <h2>Follow new essays without another inbox.</h2>
    <p>Use the feed for new MyDesigner writing on product, web, brand, and growth creative.</p>
    <div class="blog-rss-actions">
      <a class="btn btn--solid" href="/rss.xml">Open RSS <span class="arrow">-&gt;</span></a>
      <a class="btn btn--ghost" href="/blog/">Back to journal <span class="arrow">-&gt;</span></a>
    </div>
  </aside>`;
}

function renderBlogCard(post) {
  const cover = post.coverImage
    ? `<a class="blog-card__media" href="/blog/${post.slug}" aria-label="${escapeXml(post.title)}">
          <img src="${post.coverImage}" alt="${escapeXml(post.title)}" loading="lazy">
        </a>`
    : '';

  return `<article class="blog-card">
        ${cover}
        <div class="blog-card__body">
          <p class="blog-meta"><span>${post.dateDisplay}</span><span>${escapeXml(post.author)}</span></p>
          <h2><a href="/blog/${post.slug}">${escapeXml(post.title)}</a></h2>
          <p>${escapeXml(post.excerpt)}</p>
          <a class="blog-card__link" href="/blog/${post.slug}">Read article &rarr;</a>
        </div>
      </article>`;
}

function buildBlogIndex(posts) {
  const cards = posts.map(renderBlogCard).join('\n');
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog/` }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: `${SITE_URL}/blog/`,
      publisher: {
        '@type': 'Organization',
        name: 'MyDesigner',
        url: SITE_URL
      }
    }
  ];

  const body = `<main class="blog-main">
    <header class="deep-hero blog-index-hero">
      <div class="deep-hero__inner">
        <nav class="crumbs" aria-label="Breadcrumb">
          <span><a href="/">Home</a></span>
          <span>Blog</span>
        </nav>
        <p class="kicker">MyDesigner Journal</p>
        <h1>Design, growth, and product insights</h1>
        <p class="deep-hero__lede">${escapeXml(SITE_DESCRIPTION)}</p>
        <div class="cta-row">
          <a class="btn btn--solid" href="/rss.xml">Subscribe via RSS <span class="arrow">-&gt;</span></a>
        </div>
      </div>
    </header>

    <section class="deep-section">
      <div class="shell">
        <div class="blog-index-grid">
${cards || '          <p class="blog-empty">No posts published yet.</p>'}
        </div>
      </div>
    </section>
  </main>`;

  return pageShell({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    canonicalPath: '/blog/',
    body,
    structuredData
  });
}

function buildBlogPostPage(post) {
  const cover = post.coverImage
    ? `<figure class="blog-cover">
        <img src="${post.coverImage}" alt="${escapeXml(post.title)}" loading="eager">
      </figure>`
    : '';

  const body = `<main class="blog-main blog-post-main">
    <article>
      <header class="deep-hero blog-post-hero">
        <div class="deep-hero__inner">
          <nav class="crumbs" aria-label="Breadcrumb">
            <span><a href="/">Home</a></span>
            <span><a href="/blog/">Blog</a></span>
            <span>${escapeXml(post.title)}</span>
          </nav>
          <p class="blog-meta"><span><time datetime="${post.dateOnly}">${post.dateDisplay}</time></span><span>${escapeXml(post.author)}</span></p>
          <h1>${escapeXml(post.title)}</h1>
          <p class="deep-hero__lede">${escapeXml(post.excerpt)}</p>
        </div>
      </header>
      <div class="blog-article-shell">
        ${cover}
        <section class="blog-prose">${post.htmlContent}</section>
        ${rssBlock()}
      </div>
    </article>
  </main>`;

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.dateIso,
    author: {
      '@type': 'Organization',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'MyDesigner',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/images/mydesigner-logo.svg` }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl }
  };

  if (post.coverImage) {
    articleSchema.image = absoluteUrl(post.coverImage);
  }

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog/` },
        { '@type': 'ListItem', position: 3, name: post.title, item: articleUrl }
      ]
    },
    articleSchema
  ];

  return pageShell({
    title: `${post.title} | MyDesigner Blog`,
    description: post.excerpt,
    canonicalPath: `/blog/${post.slug}`,
    ogImage: post.coverImage || '/assets/images/og-image.jpg',
    body,
    structuredData
  });
}

function buildRss(posts) {
  const latest = posts[0] ? posts[0].date.toUTCString() : new Date().toUTCString();
  const items = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/blog/${post.slug}`;
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

function writeOutputs(posts) {
  ensureDir(BLOG_DIR);

  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), buildBlogIndex(posts));

  posts.forEach((post) => {
    const html = buildBlogPostPage(post);
    const outputPath = path.join(BLOG_DIR, `${post.slug}.html`);
    fs.writeFileSync(outputPath, html);
  });

  fs.writeFileSync(RSS_PATH, buildRss(posts));

  // Note: sitemap + homepage carousel injection are handled by delegated modules
  // called from main() after writeOutputs. This keeps build-blog.js focused on posts + RSS.
}

function main() {
  ensureDir(POSTS_DIR);
  const files = readPostFiles();
  const parsedPosts = files
    .map((file) => buildPostObject(file))
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  writeOutputs(parsedPosts);

  // Delegated to modular scripts (audit refactor)
  try { writeSitemap(parsedPosts); } catch (e) { console.warn('Sitemap skipped:', e.message); }
  try { injectBlogCarouselIntoHomepage(parsedPosts); } catch (e) { console.warn('Carousel injection skipped:', e.message); }
  try { buildRelatedProjectsScript(); } catch (e) { console.warn('Related projects skipped:', e.message); }

  console.log(`Built blog: ${parsedPosts.length} published posts`);
}

main();

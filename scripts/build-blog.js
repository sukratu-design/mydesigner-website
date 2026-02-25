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
    .blog-prose h1 { font-size: 2.15rem; line-height: 1.2; }
    .blog-prose h2 { font-size: 1.85rem; line-height: 1.25; }
    .blog-prose h3 { font-size: 1.55rem; line-height: 1.3; }
    .blog-prose h4 { font-size: 1.3rem; line-height: 1.35; }
    .blog-prose h5 { font-size: 1.15rem; line-height: 1.4; }
    .blog-prose h6 { font-size: 1.05rem; line-height: 1.45; }
    .blog-prose p, .blog-prose li { line-height: 1.75; margin-bottom: 1rem; }
    .blog-prose ul, .blog-prose ol { margin-left: 1.25rem; margin-bottom: 1rem; }
    .blog-prose code { background: var(--color-base-200); border-radius: 6px; padding: 0.1rem 0.35rem; }
    .blog-prose pre { background: var(--color-base-200); border-radius: 10px; padding: 1rem; overflow-x: auto; margin-bottom: 1rem; }
    .blog-prose blockquote { border-left: 3px solid var(--color-base-300); padding-left: 1rem; color: color-mix(in oklab, var(--color-base-content) 75%, transparent); }
  </style>
</head>
<body class="bg-base-100 text-base-content">
  <nav class="navbar bg-base-100 sticky top-0 z-50 px-4 lg:px-8" role="navigation" aria-label="Main navigation">
    <div class="navbar-start">
      <a href="/" class="flex items-center gap-2 font-bold text-lg" aria-label="MyDesigner home">
        <img src="/assets/images/mydesigner-logo.svg" alt="MyDesigner" class="h-8">
      </a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1 gap-1">
        <li><a href="/services.html" class="font-medium">Services</a></li>
        <li><a href="/how-it-works.html" class="font-medium">How It Works</a></li>
        <li><a href="/pricing.html" class="font-medium">Pricing</a></li>
        <li><a href="/portfolio.html" class="font-medium">Portfolio</a></li>
        <li><a href="/blog/" class="font-medium">Blog</a></li>
        <li><a href="/faq.html" class="font-medium">FAQ</a></li>
      </ul>
    </div>
    <div class="navbar-end gap-2">
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm hidden lg:inline-flex">Book a call</a>
      <div class="dropdown dropdown-end lg:hidden">
        <div tabindex="0" role="button" aria-label="Open menu" class="btn btn-ghost btn-square">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-lg mt-2">
          <li><a href="/services.html">Services</a></li>
          <li><a href="/how-it-works.html">How It Works</a></li>
          <li><a href="/pricing.html">Pricing</a></li>
          <li><a href="/portfolio.html">Portfolio</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/faq.html">FAQ</a></li>
          <li class="mt-2"><a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm">Book a call</a></li>
        </ul>
      </div>
    </div>
  </nav>
  ${body}
  <footer class="footer sm:footer-horizontal bg-base-200 text-base-content p-10" role="contentinfo">
    <aside>
      <a href="/" class="flex items-center gap-2 font-bold text-lg mb-2">
        <img src="/assets/images/mydesigner-logo.svg" alt="MyDesigner" class="h-8">
      </a>
      <p class="max-w-xs">MyDesigner is an unlimited design subscription by <a href="https://sukratu.co" target="_blank" rel="noopener" class="link link-hover">Sukratu</a>. Based in Pune, India, we provide UI/UX design, Webflow/Framer development, and graphic design for a fixed monthly fee.</p>
    </aside>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Pages</p>
      <a href="/services.html" class="link link-hover">Services</a>
      <a href="/how-it-works.html" class="link link-hover">How It Works</a>
      <a href="/pricing.html" class="link link-hover">Pricing</a>
      <a href="/portfolio.html" class="link link-hover">Portfolio</a>
      <a href="/blog/" class="link link-hover">Blog</a>
      <a href="/faq.html" class="link link-hover">FAQ</a>
    </nav>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Compare</p>
      <a href="/vs/designjoy.html" class="link link-hover">vs DesignJoy</a>
      <a href="/vs/penji.html" class="link link-hover">vs Penji</a>
      <a href="/vs/manypixels.html" class="link link-hover">vs ManyPixels</a>
      <a href="/vs/kimp.html" class="link link-hover">vs Kimp</a>
    </nav>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Get Started</p>
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="link link-hover">Book a Call</a>
    </nav>
  </footer>
  <footer class="footer sm:footer-horizontal bg-base-300 text-base-content border-t border-base-300 px-10 py-4">
    <aside class="grid-flow-col items-center">
      <p>&copy; 2026 MyDesigner by <a href="https://sukratu.co" target="_blank" rel="noopener" class="link link-hover">Sukratu</a>. All rights reserved.</p>
    </aside>
    <nav class="md:place-self-center md:justify-self-end">
      <div class="grid grid-flow-col gap-4">
        <a href="https://x.com/mydesigner_gg" aria-label="X (Twitter)" class="link link-hover"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
        <a href="https://www.linkedin.com/showcase/mydesigner-sukratu/?viewAsMember=true" aria-label="LinkedIn" class="link link-hover"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        <a href="https://instagram.com/mydesigner.gg" aria-label="Instagram" class="link link-hover"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></a>
      </div>
    </nav>
  </footer>
</body>
</html>
`;
}

function subscribeBlock() {
  return `<div class="mt-12 py-10 px-8 bg-base-200 rounded-box border border-base-300 text-center">
  <p class="text-xs uppercase tracking-widest text-base-content/50 mb-2">Stay in the loop</p>
  <h3 class="text-2xl font-bold mb-2">Get new posts in your inbox</h3>
  <p class="text-base-content/70 mb-6 max-w-sm mx-auto">No spam. Design, growth, and product insights from the MyDesigner team — straight to your inbox.</p>
  <form name="blog-subscribe" data-netlify="true" id="subscribe-form" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" novalidate>
    <input type="hidden" name="form-name" value="blog-subscribe">
    <input type="email" name="email" placeholder="your@email.com" required class="input input-bordered flex-1" autocomplete="email">
    <button type="submit" class="btn btn-primary">Subscribe</button>
  </form>
  <p id="subscribe-msg" class="mt-3 text-sm hidden"></p>
  <script>
  (function () {
    var form = document.getElementById('subscribe-form');
    var msg  = document.getElementById('subscribe-msg');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Subscribing\u2026';
      msg.className = 'mt-3 text-sm hidden';
      try {
        var res = await fetch('/.netlify/functions/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        if (res.ok) {
          form.style.display = 'none';
          msg.textContent = '\u2713 You\u2019re subscribed! Check your inbox.';
          msg.className = 'mt-3 text-sm text-success';
        } else {
          throw new Error();
        }
      } catch (_) {
        msg.textContent = 'Something went wrong \u2014 please try again.';
        msg.className = 'mt-3 text-sm text-error';
        btn.disabled = false;
        btn.textContent = 'Subscribe';
      }
      msg.classList.remove('hidden');
    });
  })();
  </script>
</div>`;
}

function buildBlogIndex(posts) {
  const cards = posts
    .map((post) => {
      const cover = post.coverImage
        ? `<figure class="px-6 pt-6">
          <img src="${post.coverImage}" alt="${escapeXml(post.title)}" class="w-full h-56 object-cover rounded-box border border-base-300">
        </figure>`
        : '';

      return `<article class="card bg-base-200 border border-base-300 hover:shadow-lg transition-shadow">
        ${cover}
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
      ${subscribeBlock()}
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
      ${subscribeBlock()}
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

function buildHomepageCarousel(posts) {
  const latest = posts.slice(0, 4);

  const cards = latest
    .map((post) => {
      const cover = post.coverImage
        ? `<figure class="overflow-hidden"><img src="${post.coverImage}" alt="${escapeXml(post.title)}" class="w-full h-48 object-cover" loading="lazy"></figure>`
        : '';
      return `    <div class="flex-none w-[85vw] sm:w-[45vw] lg:w-[calc(25%-1rem)] snap-start">
      <div class="card bg-base-200 border border-base-300 hover:shadow-lg transition-shadow h-full">
        ${cover}
        <div class="card-body gap-2">
          <div class="text-xs text-base-content/60">${post.dateDisplay}</div>
          <h3 class="card-title text-base leading-snug line-clamp-2">${escapeXml(post.title)}</h3>
          <p class="text-sm text-base-content/70 line-clamp-3 flex-1">${escapeXml(post.excerpt)}</p>
          <div class="card-actions justify-end pt-2">
            <a href="/blog/${post.slug}.html" class="btn btn-primary btn-sm">Read &rarr;</a>
          </div>
        </div>
      </div>
    </div>`;
    })
    .join('\n');

  return `<!-- BLOG_CAROUSEL_START -->
  <section class="py-16 lg:py-24 bg-base-100" id="blog-preview">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-end justify-between mb-8">
        <div>
          <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">From the Blog</span>
          <h2 class="text-3xl lg:text-4xl font-bold mt-1">Latest insights</h2>
        </div>
        <a href="/blog/" class="btn btn-outline btn-sm hidden sm:inline-flex">View all posts &rarr;</a>
      </div>
      <div class="relative">
        <div id="blog-carousel" class="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4" style="scrollbar-width:none;-ms-overflow-style:none;">
${cards}
        </div>
        <button onclick="document.getElementById('blog-carousel').scrollBy({left:-(document.getElementById('blog-carousel').offsetWidth*0.85),behavior:'smooth'})" class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 btn btn-circle btn-sm bg-base-100 border border-base-300 shadow-md hidden lg:flex" aria-label="Previous">&larr;</button>
        <button onclick="document.getElementById('blog-carousel').scrollBy({left:document.getElementById('blog-carousel').offsetWidth*0.85,behavior:'smooth'})" class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 btn btn-circle btn-sm bg-base-100 border border-base-300 shadow-md hidden lg:flex" aria-label="Next">&rarr;</button>
      </div>
      <div class="mt-6 text-center sm:hidden">
        <a href="/blog/" class="btn btn-outline btn-sm">View all posts &rarr;</a>
      </div>
    </div>
  </section>
  <!-- BLOG_CAROUSEL_END -->`;
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

  // Inject latest posts carousel into homepage
  const INDEX_PATH = path.join(process.cwd(), 'index.html');
  if (fs.existsSync(INDEX_PATH)) {
    const indexHtml = fs.readFileSync(INDEX_PATH, 'utf8');
    const carouselHtml = buildHomepageCarousel(posts);
    const updated = indexHtml.replace(
      /<!-- BLOG_CAROUSEL_START -->[\s\S]*?<!-- BLOG_CAROUSEL_END -->/,
      carouselHtml
    );
    if (updated !== indexHtml) {
      fs.writeFileSync(INDEX_PATH, updated);
      console.log('Updated homepage blog carousel');
    }
  }
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

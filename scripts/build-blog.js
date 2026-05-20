#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const SITE_URL = 'https://mydesigner.gg';
const SITE_TITLE = 'MyDesigner Blog';
const SITE_DESCRIPTION = 'Design strategy, SaaS UI/UX tips, and brand insights for founders and growth teams. Learn how design drives conversions, trust, and revenue.';
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const BLOG_DIR = path.join(process.cwd(), 'blog');
const RSS_PATH = path.join(process.cwd(), 'rss.xml');
const SITEMAP_PATH = path.join(process.cwd(), 'sitemap.xml');
const SERVICES_DIR = path.join(process.cwd(), 'services');

const PROJECTS = require('../data/projects.js');

const STATIC_SITEMAP_PAGES = [
  { loc: '/', lastmod: '2026-05-01', changefreq: 'weekly', priority: '1.0' },
  { loc: '/pricing', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.9' },
  { loc: '/services', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.8' },
  { loc: '/conversion-design', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.9' },
  { loc: '/founder-content-engine', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.9' },
  { loc: '/ai-ready-brand-system', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.9' },
  { loc: '/how-it-works', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.8' },
  { loc: '/faq', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.7' },
  { loc: '/portfolio', lastmod: '2026-05-05', changefreq: 'monthly', priority: '0.8' },
  { loc: '/contact', lastmod: '2026-05-05', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/', lastmod: '2026-02-11', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/designjoy', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/penji', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/manypixels', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/kimp', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
  { loc: '/services/framer-development', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/webflow-development', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/web-app-design', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/website-design', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/brand-identity', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/presentation-design', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/booth-designs', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/social-media-creatives', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/work/neustreet', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/dentaldost', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/slash', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/vettly', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/ahhf', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/contractwrangler', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/poocho-app', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/poocho-website', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/fluentpet', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/uber-cards', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/scano', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/dentsu', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/travelsaving', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/nada', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/apollo-radiology', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/ecstra', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/yespl', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/mda', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' }
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

  const htmlContent = marked.parse(content).replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');

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

function pageShell({ title, description, canonicalPath, body, ogType = 'website', ogImage = '/assets/images/og-image.jpg', structuredData = [] }) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;
  const schemaBlocks = structuredData
    .map((schema) => `  <script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n');

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
  <meta name="twitter:image" content="${imageUrl}">
${schemaBlocks ? schemaBlocks + '\n' : ''}
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
    .blog-prose .table-wrap { overflow-x: auto; margin-bottom: 1.5rem; border-radius: 0.75rem; border: 1px solid var(--color-base-300); }
    .blog-prose table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .blog-prose th { background: var(--color-base-200); font-weight: 700; text-align: left; padding: 0.75rem 1rem; white-space: nowrap; }
    .blog-prose td { padding: 0.75rem 1rem; border-top: 1px solid var(--color-base-200); }
    .blog-prose tr:nth-child(even) td { background: var(--color-base-200); }
    .blog-prose th:first-child, .blog-prose td:first-child { font-weight: 600; }
  </style>
<!-- Traffic Source Analytics -->
<script defer src="https://traffic.sukratu-test.com/t.js" data-site="1"></script>
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
        <li><a href="/services" class="font-medium">Services</a></li>
        <li><a href="/how-it-works" class="font-medium">How It Works</a></li>
        <li><a href="/pricing" class="font-medium">Pricing</a></li>
        <li><a href="/portfolio" class="font-medium">Portfolio</a></li>
        <li><a href="/blog/" class="font-medium">Blog</a></li>
        <li><a href="/faq" class="font-medium">FAQ</a></li>
      </ul>
    </div>
    <div class="navbar-end gap-2">
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm hidden lg:inline-flex">Talk through your creative needs</a>
      <div class="dropdown dropdown-end lg:hidden">
        <div tabindex="0" role="button" aria-label="Open menu" class="btn btn-ghost btn-square">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-lg mt-2">
          <li><a href="/services">Services</a></li>
          <li><a href="/how-it-works">How It Works</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/portfolio">Portfolio</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li class="mt-2"><a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm">Talk through your needs</a></li>
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
      <p class="max-w-xs">MyDesigner is an AI-native creative team by <a href="https://sukratu.co" target="_blank" rel="noopener" class="link link-hover">Sukratu</a>. We help growing companies ship web, product, brand, and growth creative with human-level taste, faster execution, and Client Memory that compounds over time.</p>
    </aside>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Pages</p>
      <a href="/services" class="link link-hover">Services</a>
      <a href="/how-it-works" class="link link-hover">How It Works</a>
      <a href="/pricing" class="link link-hover">Pricing</a>
      <a href="/portfolio" class="link link-hover">Portfolio</a>
      <a href="/blog/" class="link link-hover">Blog</a>
      <a href="/faq" class="link link-hover">FAQ</a>
    </nav>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Compare</p>
      <a href="/vs/designjoy" class="link link-hover">vs DesignJoy</a>
      <a href="/vs/penji" class="link link-hover">vs Penji</a>
      <a href="/vs/manypixels" class="link link-hover">vs ManyPixels</a>
      <a href="/vs/kimp" class="link link-hover">vs Kimp</a>
    </nav>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Get Started</p>
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="link link-hover">Talk through your creative needs</a>
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
          <h2 class="card-title text-2xl"><a class="hover:underline" href="/blog/${post.slug}">${escapeXml(post.title)}</a></h2>
          <p>${escapeXml(post.excerpt)}</p>
          <div class="card-actions justify-end">
            <a class="btn btn-primary btn-sm" href="/blog/${post.slug}">Read article</a>
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
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog/` },
        { '@type': 'ListItem', position: 3, name: post.title, item: postUrl }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: imageUrl,
      datePublished: post.dateIso,
      dateModified: post.dateIso,
      author: {
        '@type': 'Organization',
        name: 'MyDesigner',
        url: SITE_URL
      },
      publisher: {
        '@type': 'Organization',
        name: 'MyDesigner',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/images/mydesigner-logo.svg` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl }
    }
  ];

  return pageShell({
    title: `${post.title} | MyDesigner Blog`,
    description: post.excerpt,
    canonicalPath: `/blog/${post.slug}`,
    ogType: 'article',
    ogImage,
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
      loc: `/blog/${post.slug}`,
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
            <a href="/blog/${post.slug}" class="btn btn-primary btn-sm">Read &rarr;</a>
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

const SERVICE_CONFIGS = [
  {
    slug: 'framer-development',
    label: 'Framer Development',
    category: 'webdev',
    platform: 'framer',
    valuerop: 'Pixel-Perfect Framer Sites, Fast',
    subheadline: 'We build blazing-fast, fully responsive Framer websites — designed to convert and built to scale.',
    metaDescription: 'High-performance Framer websites with smooth animations and interactions, shaped by human creative direction and built inside an AI-native creative workflow.',
    included: [
      'Custom Framer component design & build',
      'Responsive layouts (mobile, tablet, desktop)',
      'CMS integration & dynamic collections',
      'Animations & micro-interactions',
      'SEO meta, sitemap & performance optimisation',
      'Source files & hand-off documentation'
    ],
    faq: [
      { q: 'Do you work from existing designs or start from scratch?', a: 'Both. We can build directly in Framer from your Figma files or create the design and development end-to-end.' },
      { q: 'How long does a typical Framer project take?', a: 'Timelines depend on page count, animation complexity, CMS needs, review speed, and whether the work is a focused sprint or part of an ongoing creative rhythm.' },
      { q: 'Will the site be editable by our team after handoff?', a: 'Yes. We set up Framer CMS and component structures so your non-technical team can update content without touching code.' },
      { q: 'Can you migrate an existing website to Framer?', a: 'Absolutely. We handle full migrations, preserving URL structures, SEO metadata, and visual design during the transition.' }
    ]
  },
  {
    slug: 'webflow-development',
    label: 'Webflow Development',
    category: 'webdev',
    platform: 'webflow',
    valuerop: 'Production-Ready Webflow Sites',
    subheadline: 'We design and develop high-converting Webflow websites that your team can manage without a developer.',
    metaDescription: 'Pixel-perfect Webflow sites built with CMS setup, animations, responsive design, and launch support inside an AI-native creative workflow.',
    included: [
      'Custom Webflow design & development',
      'Responsive across all breakpoints',
      'Webflow CMS setup & content modelling',
      'Interactions, animations & scroll effects',
      'SEO meta, Open Graph & sitemap configuration',
      'Staging review & production launch support'
    ],
    faq: [
      { q: 'Do you build from Figma designs or design in Webflow directly?', a: 'We do both. Share your Figma files and we\'ll build pixel-perfectly in Webflow, or we\'ll handle the full design-to-development workflow.' },
      { q: 'Can we edit the site ourselves after launch?', a: 'Yes. Webflow\'s Editor makes it easy for non-technical teams to update copy, images, and CMS content without touching the Designer.' },
      { q: 'Do you handle Webflow hosting and publishing?', a: 'We configure and publish to Webflow Hosting or help you connect a custom domain. We can also assist with Netlify or Cloudflare deployments.' },
      { q: 'What about integrations like HubSpot or Mailchimp?', a: 'We regularly integrate Webflow sites with HubSpot, Mailchimp, Zapier, Memberstack, and other SaaS tools when they are part of the scoped build.' }
    ]
  },
  {
    slug: 'web-app-design',
    label: 'Web App Design',
    category: 'uiux',
    valuerop: 'UX That Converts & Retains',
    subheadline: 'We design intuitive web application interfaces that reduce friction, improve retention, and look exceptional.',
    metaDescription: 'SaaS dashboards, admin panels, and web app interfaces designed for clarity, consistency, and handoff inside an AI-native creative workflow.',
    included: [
      'User flows & information architecture',
      'Wireframes & interactive prototypes',
      'High-fidelity UI design in Figma',
      'Design system & component library',
      'Usability review & iteration',
      'Developer-ready Figma handoff'
    ],
    faq: [
      { q: 'Do you conduct user research as part of this service?', a: 'We can provide UX audits and heuristic reviews when they fit the brief. Full user research studies are scoped separately on request.' },
      { q: 'What tools do you use for web app design?', a: 'Figma is our primary tool for all UI/UX work. We deliver interactive prototypes, auto-layout components, and full design tokens.' },
      { q: 'Can you work within our existing design system?', a: 'Yes. We frequently extend and apply existing design systems and component libraries rather than starting from scratch.' },
      { q: 'How many screens or flows can we expect?', a: 'Output varies by complexity, context quality, review speed, and operating rhythm. We recommend the right scope after seeing the product and priority flows.' }
    ]
  },
  {
    slug: 'website-design',
    label: 'Website Design',
    category: 'uiux',
    valuerop: 'Websites That Build Trust & Drive Leads',
    subheadline: 'We design conversion-focused websites that communicate your brand\'s value clearly and look great on every device.',
    metaDescription: 'Marketing websites and landing pages designed to convert, with message hierarchy, brand context, and practical handoff or build support.',
    included: [
      'Homepage & key page design (up to 8 pages)',
      'Mobile-first responsive layouts',
      'Brand-aligned visual design & typography',
      'CTA strategy & conversion-focused structure',
      'Prototype for stakeholder review',
      'Figma source files & style guide'
    ],
    faq: [
      { q: 'Is development included in website design?', a: 'UI/UX design can deliver Figma files ready for development. If you also need Webflow or Framer development, we scope that as part of the same website workflow.' },
      { q: 'How many pages are included?', a: 'Page count depends on the website scope. We confirm the right structure after reviewing the offer, audience, content, and launch goal.' },
      { q: 'Do you follow a brand guide if we have one?', a: 'Yes. Share your existing brand guide and assets and we\'ll design strictly within those guidelines for visual consistency.' },
      { q: 'Can you redesign an existing website?', a: 'Yes, redesigns are our most common request. We audit the current site, identify UX issues, and propose a modernised design before execution.' }
    ]
  },
  {
    slug: 'brand-identity',
    label: 'Brand Identity',
    category: 'branding',
    valuerop: 'Brands That Stand Out & Scale',
    subheadline: 'We create cohesive brand identities that communicate who you are, build trust, and differentiate you from the competition.',
    metaDescription: 'Complete brand identity systems, from logos and color palettes to style guides and templates, built to keep creative consistent across teams and AI workflows.',
    included: [
      'Logo design (primary + variations)',
      'Brand colour palette & typography system',
      'Brand guidelines document',
      'Business card & stationery design',
      'Social media profile & cover assets',
      'Source files in AI, EPS, SVG & PNG'
    ],
    faq: [
      { q: 'How many logo concepts do we get?', a: 'We present a small set of distinct directions, then refine the strongest route through focused feedback cycles.' },
      { q: 'Is a brand guidelines document included?', a: 'Yes. Every brand identity project includes a PDF brand guidelines document covering logo usage, colour, typography, and do/don\'ts.' },
      { q: 'Can you refresh an existing brand rather than start from scratch?', a: 'Yes. Brand refreshes are common — we modernise the existing identity while preserving recognition equity you\'ve already built.' },
      { q: 'What file formats will we receive?', a: 'You receive all source files: Adobe Illustrator (.ai), EPS, SVG, and PNG (transparent background) at multiple sizes.' }
    ]
  },
  {
    slug: 'presentation-design',
    label: 'Presentation Design',
    category: 'graphic',
    valuerop: 'Pitch Decks That Win Rooms',
    subheadline: 'We design investor-ready pitch decks and executive presentations that communicate clearly and leave a lasting impression.',
    metaDescription: 'Investor pitch decks and sales presentations designed for clarity, hierarchy, and confidence, with focused feedback cycles and brand-consistent execution.',
    included: [
      'Slide layout & visual hierarchy design',
      'Data visualisation & infographic creation',
      'Brand-aligned colour, type & icon system',
      'Up to 30 slides per request',
      'Speaker notes formatting',
      'PowerPoint, Keynote & Google Slides delivery'
    ],
    faq: [
      { q: 'Do you write the content or just design existing content?', a: 'We design around content you provide. We can refine copy for clarity and punch, but we don\'t write the pitch narrative from scratch.' },
      { q: 'How many slides can you design in one request?', a: 'A single request covers up to 30 slides. Larger decks are split into sequential requests in your queue.' },
      { q: 'Can you match our existing brand?', a: 'Absolutely. Share your brand guide and we\'ll design every slide to match your existing visual identity exactly.' },
      { q: 'What file formats do you deliver?', a: 'We deliver in PowerPoint (.pptx), Keynote (.key), and Google Slides — whichever you use to present.' }
    ]
  },
  {
    slug: 'booth-designs',
    label: 'Booth & Exhibition Design',
    category: 'graphic',
    valuerop: 'Exhibition Stands That Stop Foot Traffic',
    subheadline: 'We design eye-catching booth and exhibition graphics that communicate your brand\'s story and attract the right attendees.',
    metaDescription: 'Trade show booths, exhibition displays, and event graphics designed with brand clarity, print-ready production, and deadline-aware creative execution.',
    included: [
      'Booth backdrop & banner design',
      'Pull-up & retractable banner graphics',
      'Branded table cover & display assets',
      'Flyer, brochure & handout design',
      'Name badge & lanyard design',
      'Print-ready files at correct resolution & bleed'
    ],
    faq: [
      { q: 'Do you supply the printed materials or just design files?', a: 'We supply print-ready design files (PDF, AI, EPS). Printing is handled by your local or online print vendor.' },
      { q: 'Can you work with an upcoming event deadline?', a: 'Yes. Mention your deadline when sharing the brief and we will recommend a realistic sprint or production rhythm.' },
      { q: 'What dimensions and file specs do you need from us?', a: 'Share the vendor\'s spec sheet (dimensions, bleed, DPI, colour mode) and we\'ll design and export to those exact specifications.' },
      { q: 'Can you design multiple booth sizes for the same event?', a: 'Yes. Multiple size variants of the same concept can be scoped together so the event system stays consistent.' }
    ]
  },
  {
    slug: 'social-media-creatives',
    label: 'Social Media Design',
    category: 'graphic',
    valuerop: 'Scroll-Stopping Social Content, Consistently',
    subheadline: 'We design on-brand social media creatives that maintain visual consistency and drive engagement across every platform.',
    metaDescription: 'Scroll-stopping social media graphics and templates for every platform, created with brand context, reusable formats, and AI-native production support.',
    included: [
      'Instagram, LinkedIn & Twitter/X post designs',
      'Story & Reel cover graphics',
      'Carousel & multi-slide post design',
      'Ad creative variations (A/B ready)',
      'Platform-correct sizing & format',
      'Editable Figma or Canva templates'
    ],
    faq: [
      { q: 'How many posts can I get per month?', a: 'Output depends on complexity, content readiness, template reuse, and the operating rhythm we set for your team.' },
      { q: 'Do you design for all social platforms?', a: 'Yes — Instagram, LinkedIn, Twitter/X, Facebook, Pinterest, and YouTube thumbnails. Specify the platforms in your request.' },
      { q: 'Can you create templates our team can edit?', a: 'Yes. We deliver editable Figma or Canva templates so your team can swap copy and images for future posts independently.' },
      { q: 'Will the designs follow our brand guidelines?', a: 'Every creative is designed to your brand guide. Share your brand kit on onboarding and we apply it consistently across every post.' }
    ]
  }
];

const SERVICE_REPOSITIONING = {
  'website-design': {
    role: 'Conversion websites & landing pages',
    h1: 'Website design for teams that need to turn attention into action',
    metaTitle: 'Website Design — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Marketing websites, campaign pages, and landing pages shaped by strategy, brand context, and conversion logic — not just pretty screens. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    fit: 'Best when a team needs a clearer website, a launch page, a campaign landing page, or a redesign that must explain the offer and move visitors toward action.',
    included: [
      'Messaging and page-structure direction before design',
      'Homepage, landing page, and key conversion-page design',
      'Mobile-first responsive layouts',
      'CTA hierarchy and section sequencing',
      'Brand-aligned visual system in Figma',
      'Developer-ready handoff or Webflow/Framer build path'
    ],
    memory: 'Client Memory should store your offer, ICP, proof points, previous landing pages, brand rules, conversion notes, and pages that have already worked, so every new page starts with context instead of a blank brief.',
    relatedLinks: [
      ['/services/webflow-development', 'Webflow development'],
      ['/services/framer-development', 'Framer development'],
      ['/portfolio', 'View proof'],
      ['/pricing', 'See operating rhythms']
    ],
    faq: [
      { q: 'Is this just visual website design?', a: 'No. This is conversion website design: message hierarchy, offer clarity, section flow, CTA logic, and brand-consistent visual execution.' },
      { q: 'Can you design landing pages for campaigns?', a: 'Yes. Landing pages are one of the clearest fits because they benefit from fast creative execution plus stored context about your audience, offer, and brand.' },
      { q: 'Can this include Webflow or Framer development?', a: 'Yes. If build is needed, MyDesigner can connect the design work to a Webflow or Framer build path.' },
      { q: 'How does Client Memory help website work?', a: 'It keeps the offer, proof, audience, brand rules, prior page decisions, and reusable sections available for future pages and iterations.' }
    ]
  },
  'web-app-design': {
    role: 'Product UI & UX support',
    h1: 'Web app design that makes complex products easier to use',
    metaTitle: 'Web App Design — MyDesigner | AI-Native Creative Team',
    metaDescription: 'SaaS dashboards, internal tools, portals, and product interfaces designed with clarity, hierarchy, and continuity across every screen. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    fit: 'Best when a founder, product team, or engineering team needs sharper product UI, clearer flows, better dashboard structure, or a Figma system developers can actually use.',
    included: [
      'User-flow and information-architecture support',
      'Wireframes for high-risk flows',
      'High-fidelity Figma UI design',
      'Dashboard and table design systems',
      'Reusable components and interaction states',
      'Developer-ready specs and handoff notes'
    ],
    memory: 'Client Memory should capture product terminology, user roles, flows, design-system rules, edge cases, prior UX decisions, and implementation constraints so new screens stay coherent.',
    relatedLinks: [
      ['/services/brand-identity', 'Brand identity'],
      ['/portfolio', 'View product work'],
      ['/how-it-works', 'How the workflow runs']
    ],
    faq: [
      { q: 'Do you replace product research?', a: 'No. MyDesigner can work from existing research, customer insights, product notes, and stakeholder context. Full research work should be scoped separately.' },
      { q: 'Can you work inside our existing design system?', a: 'Yes. We can absorb current components, constraints, usage rules, and prior design decisions into Client Memory so new work stays consistent.' },
      { q: 'Can engineering use the files directly?', a: 'Yes. The output can include developer-ready Figma files, component states, and handoff notes for implementation.' },
      { q: 'How do you keep product screens consistent over time?', a: 'Client Memory stores flows, components, patterns, and past decisions so future UI requests do not reset context.' }
    ]
  },
  'webflow-development': {
    role: 'Conversion website build',
    h1: 'Webflow development for websites your team can actually ship and manage',
    metaTitle: 'Webflow Development — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Responsive, CMS-ready Webflow builds for marketing sites, landing pages, and content systems — designed for speed, polish, and handoff clarity. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    fit: 'Best when you have a Figma design to build, need design plus Webflow execution, or want a marketing site your team can edit after launch.',
    included: [
      'Figma-to-Webflow implementation',
      'Responsive build across breakpoints',
      'CMS structure and content modelling',
      'Animations and interaction polish',
      'SEO, Open Graph, sitemap, and launch basics',
      'Staging review and production handoff'
    ],
    memory: 'Client Memory should store CMS structure, component decisions, animation preferences, brand rules, launch checklist, reusable page sections, and previous site decisions.',
    relatedLinks: [
      ['/services/website-design', 'Website design'],
      ['/services/framer-development', 'Framer development'],
      ['/portfolio', 'View related work']
    ],
    faq: [
      { q: 'Do you only build, or also design?', a: 'Both are possible. MyDesigner can build from supplied Figma files or handle design plus Webflow execution when the scope calls for it.' },
      { q: 'Will our team be able to edit the site?', a: 'Yes. Webflow Editor and CMS setup can give your team operational independence after launch.' },
      { q: 'Can you support launches and campaign pages after the main site?', a: 'Yes. Once the system exists, Client Memory helps future pages ship faster and stay more consistent.' },
      { q: 'Do you handle integrations?', a: 'We can support common website integrations such as forms, CRM embeds, analytics, and marketing tools. Custom backend work should be scoped separately.' }
    ]
  },
  'framer-development': {
    role: 'Interactive website build',
    h1: 'Framer development for polished marketing sites and launch pages',
    metaTitle: 'Framer Development — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Fast, polished Framer websites with responsive layouts, motion, CMS structure, and brand-consistent execution for launches and modern teams. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    fit: 'Best when speed, visual polish, interaction quality, and flexible page production matter more than heavy enterprise CMS complexity.',
    included: [
      'Design-to-Framer implementation',
      'Responsive layouts for key breakpoints',
      'Framer CMS setup where useful',
      'Motion, transitions, and micro-interactions',
      'SEO metadata and launch setup',
      'Handoff documentation and editable structure'
    ],
    memory: 'Client Memory should store motion preferences, page patterns, brand rules, CMS choices, reusable sections, and launch notes so future Framer pages stay consistent.',
    relatedLinks: [
      ['/services/website-design', 'Website design'],
      ['/services/webflow-development', 'Webflow development'],
      ['/portfolio', 'View related work']
    ],
    faq: [
      { q: 'When should we choose Framer instead of Webflow?', a: 'Framer is strong for fast, polished marketing sites and interactive launch pages. Webflow may fit deeper CMS and operational workflows better.' },
      { q: 'Can you migrate an existing site to Framer?', a: 'Yes, when the scope is clear. Complex sites should start with a discovery pass so migration risk is understood.' },
      { q: 'Can the team edit after handoff?', a: 'Yes. We structure Framer pages and CMS areas so your team can edit content after launch.' },
      { q: 'How does Client Memory help Framer work?', a: 'It stores reusable page patterns, brand rules, interactions, and prior decisions so new pages do not drift.' }
    ]
  },
  'brand-identity': {
    role: 'AI-ready brand system',
    h1: 'Brand identity systems that make every future asset easier to ship',
    metaTitle: 'Brand Identity — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Logos, visual systems, guidelines, examples, templates, and usable rules that help your team create consistently across web, product, sales, and campaigns. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    fit: 'Best when a company is launching, refreshing, cleaning up inconsistent visuals, or preparing to use AI and templates without breaking brand consistency.',
    included: [
      'Logo direction and identity refinement',
      'Color, typography, and visual-language system',
      'Brand guidelines and usage rules',
      'Template starters for key channels',
      'Source files and export-ready assets',
      'Prompt-ready brand examples for future creative production'
    ],
    memory: 'Brand identity is not only a logo deliverable. It becomes the foundation for future creative decisions, AI prompts, templates, examples, and quality control inside Client Memory.',
    relatedLinks: [
      ['/services/social-media-creatives', 'Growth creative'],
      ['/services/website-design', 'Website design'],
      ['/how-it-works', 'How Client Memory works']
    ],
    faq: [
      { q: 'Is this only logo design?', a: 'No. Logos can be included, but the goal is a usable brand system that helps every future asset stay consistent.' },
      { q: 'Can you refresh an existing brand?', a: 'Yes. A refresh can modernize the identity while preserving the recognition and equity that should not change.' },
      { q: 'Do you create brand guidelines?', a: 'Yes. Guidelines can include practical rules, examples, templates, and AI-ready prompts where appropriate.' },
      { q: 'How does this help with AI content creation?', a: 'A clear brand system gives AI tools constraints, examples, and rules so output gets closer to your brand instead of becoming generic.' }
    ]
  },
  'presentation-design': {
    role: 'Decks & sales assets',
    h1: 'Presentation design that helps complex ideas land clearly',
    metaTitle: 'Presentation Design — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Investor decks, sales decks, strategy presentations, and internal narratives structured for clarity, trust, and decision-making. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    fit: 'Best when the team has a story to tell — fundraising, sales, partnership, strategy, product, or internal alignment — and needs the deck to feel sharp and easy to follow.',
    included: [
      'Narrative and slide-structure cleanup',
      'Slide layout and visual hierarchy',
      'Data visualization and infographic design',
      'Brand-aligned diagrams, icons, and visual systems',
      'PowerPoint, Keynote, Google Slides, or Figma delivery',
      'Reusable slide patterns for future decks'
    ],
    memory: 'Client Memory should store the company narrative, positioning, proof points, product explanations, previous deck patterns, common objections, and brand rules so future decks improve instead of restarting.',
    relatedLinks: [
      ['/services/brand-identity', 'Brand identity'],
      ['/services/social-media-creatives', 'Growth creative'],
      ['/portfolio', 'View related work']
    ],
    faq: [
      { q: 'Do you write the deck or only design it?', a: 'MyDesigner can sharpen structure and clarity around content you provide. Full copywriting or strategy depth depends on the scope.' },
      { q: 'Can you redesign an existing pitch deck?', a: 'Yes. This is one of the strongest use cases: making existing thinking sharper, more visual, and easier to present.' },
      { q: 'Can you make reusable templates?', a: 'Yes. Reusable slide patterns can be stored in Client Memory so future sales and founder communication gets faster.' },
      { q: 'Which formats do you deliver?', a: 'We can deliver PowerPoint, Keynote, Google Slides, or Figma files depending on how your team presents and edits.' }
    ]
  },
  'social-media-creatives': {
    role: 'Growth campaign creative',
    h1: 'Social media creatives that keep campaigns moving without losing the brand',
    metaTitle: 'Social Media Design — MyDesigner | AI-Native Creative Team',
    metaDescription: 'LinkedIn, Instagram, X, ad creative, carousels, covers, and campaign assets produced with brand consistency and enough variation to keep testing. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    fit: 'Best when a growth, founder, or marketing team needs steady creative output for campaigns, launches, content, ads, and experiments.',
    included: [
      'Platform-specific post and carousel designs',
      'Ad creative variations for testing',
      'Founder/content asset templates',
      'Story, reel, and cover graphics',
      'Editable Figma or Canva templates where useful',
      'Campaign-level visual consistency across batches'
    ],
    memory: 'Client Memory should store audience, offers, campaign learnings, content pillars, visual rules, winning examples, past assets, and channel preferences so creative variation stays on-brand.',
    relatedLinks: [
      ['/services/brand-identity', 'Brand identity'],
      ['/services/presentation-design', 'Decks and sales assets'],
      ['/pricing', 'See operating rhythms']
    ],
    faq: [
      { q: 'How many posts can we get?', a: 'Output depends on the operating rhythm: one focused lane, parallel growth execution, or a sprint depending on the priority and complexity.' },
      { q: 'Can you design ad variations?', a: 'Yes. MyDesigner can create structured creative variation for testing while keeping the campaign connected to your brand.' },
      { q: 'Can our team edit the templates?', a: 'Yes. Editable Figma or Canva templates can help your team adapt recurring formats without losing consistency.' },
      { q: 'How do you avoid everything looking generic?', a: 'Human taste plus Client Memory. Stored examples, rules, channel preferences, and performance learnings guide every batch.' }
    ]
  },
  'booth-designs': {
    role: 'Event & offline campaign creative',
    h1: 'Booth and exhibition design that carries your brand into the room',
    metaTitle: 'Booth & Exhibition Design — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Trade show booths, banners, handouts, display assets, and event graphics designed as one coherent brand experience before the deadline hits. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    fit: 'Best when an event, expo, booth, or sales presence needs high-clarity visuals, print-ready assets, and consistent messaging across physical touchpoints.',
    included: [
      'Booth backdrop and display graphics',
      'Pull-up banners and event signage',
      'Flyers, brochures, handouts, and leave-behinds',
      'Name badges, table covers, and supporting assets',
      'Print-ready files with bleed and resolution checks',
      'Event message hierarchy and asset consistency'
    ],
    memory: 'Client Memory should store event goals, booth dimensions, vendor specs, audience, offers, brand rules, previous event assets, and print constraints so recurring events get easier.',
    relatedLinks: [
      ['/services/presentation-design', 'Presentation design'],
      ['/services/brand-identity', 'Brand identity'],
      ['/contact', 'Talk through an event need']
    ],
    faq: [
      { q: 'Do you print the materials?', a: 'MyDesigner supplies print-ready design files and can support specs where possible. Printing is handled by your chosen vendor.' },
      { q: 'Can you work with tight event deadlines?', a: 'Yes, depending on priority and scope. Share vendor specs and deadlines immediately so the work can be planned realistically.' },
      { q: 'Can you adapt one booth system into many sizes?', a: 'Yes. This is a strong consistency use case because one event system can become banners, handouts, table assets, and other formats.' },
      { q: 'How does Client Memory help event work?', a: 'It preserves specs, message hierarchy, reusable event assets, brand rules, and print constraints for future booths and campaigns.' }
    ]
  }
};

function buildServicePage(config) {
  config = {
    ...config,
    ...(SERVICE_REPOSITIONING[config.slug] || {})
  };

  const categoryProjects = PROJECTS.filter((p) =>
    p.category === config.category && (!config.platform || p.platform === config.platform)
  );

  const projectCards = categoryProjects.map((p) => `
        <div class="portfolio-item" data-category="${p.category}">
          <a href="/work/${p.slug}" class="block group">
            <div class="card bg-base-100 border border-base-200 hover:shadow-lg transition-shadow overflow-hidden">
              <figure class="overflow-hidden">
                <img src="${p.thumb}" alt="${escapeXml(p.title)}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
              </figure>
              <div class="card-body p-4">
                <div class="badge badge-outline badge-sm">${p.badge}</div>
                <h3 class="card-title text-base mt-1">${escapeXml(p.title)}</h3>
                <p class="text-sm text-base-content/60">${escapeXml(p.desc)}</p>
                <p class="text-xs text-primary font-medium mt-1">View case study &rarr;</p>
              </div>
            </div>
          </a>
        </div>`).join('\n');

  const includedItems = config.included.map((item) =>
    `          <li class="flex items-start gap-3 p-4 bg-base-100 rounded-box border border-base-200">
            <span class="text-primary font-bold mt-0.5">&#10003;</span>
            <span>${escapeXml(item)}</span>
          </li>`
  ).join('\n');

  const faqItems = config.faq.map((item, i) => `
        <div class="collapse collapse-arrow join-item border border-base-300 bg-base-100">
          <input type="radio" name="service-faq" ${i === 0 ? 'checked="checked"' : ''}>
          <div class="collapse-title font-semibold">${escapeXml(item.q)}</div>
          <div class="collapse-content text-base-content/70"><p>${escapeXml(item.a)}</p></div>
        </div>`).join('\n');

  const relatedLinks = (config.relatedLinks || [
    ['/services', 'Explore all services'],
    ['/portfolio', 'View proof'],
    ['/pricing', 'See operating rhythms']
  ]).map(([href, label]) =>
    `          <a href="${href}" class="btn btn-outline btn-sm">${escapeXml(label)}</a>`
  ).join('\n');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
      { '@type': 'ListItem', position: 3, name: config.label, item: `${SITE_URL}/services/${config.slug}` }
    ]
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: config.label,
    provider: { '@type': 'Organization', name: 'MyDesigner', url: SITE_URL },
    name: `${config.label} — MyDesigner`,
    description: config.subheadline,
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    offers: {
      '@type': 'Offer',
      price: '1400',
      priceCurrency: 'USD',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '1400', priceCurrency: 'USD', unitText: 'month' },
      description: 'Transparent creative sprint, subscription, and partner options based on the operating rhythm your team needs.'
    }
  };

  const valuerop = config.valuerop || `Expert ${config.label} for Growing Startups`;
  const metaTitle = config.metaTitle || `${config.label} — MyDesigner | ${valuerop}`;
  const metaDesc = config.metaDescription || config.subheadline;
  const heroSubcopy = config.heroSubcopy || metaDesc.split(' Work with ')[0];
  const canonicalPath = `/services/${config.slug}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  serviceSchema.description = heroSubcopy;

  const body = `
  <!-- JSON-LD Schemas -->
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>

  <main>
    <!-- Hero -->
    <section class="py-16 lg:py-24" data-hero>
      <div class="max-w-4xl mx-auto px-4">
        <div class="breadcrumbs text-sm mb-8">
          <ul><li><a href="/">Home</a></li><li><a href="/services">Services</a></li><li>${escapeXml(config.label)}</li></ul>
        </div>
        <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">${escapeXml(config.role || config.label)}</span>
        <h1 class="text-4xl lg:text-6xl font-bold mt-3 mb-5 leading-tight">${escapeXml(config.h1 || config.label)}</h1>
        <p class="text-lg text-base-content/70 max-w-3xl mb-8">${escapeXml(heroSubcopy)}</p>
        <div class="flex flex-wrap gap-3">
          <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-lg">Talk through this work</a>
          <a href="#related-work" class="btn btn-outline btn-lg">See related work</a>
        </div>
      </div>
    </section>

    <!-- Fit -->
    <section class="py-12 lg:py-16 bg-base-200">
      <div class="max-w-4xl mx-auto px-4">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body lg:grid lg:grid-cols-[.35fr_.65fr] gap-8">
            <div>
              <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">Use this when</span>
              <h2 class="text-2xl lg:text-3xl font-bold mt-2">This capability fits a specific bottleneck.</h2>
            </div>
            <p class="text-base-content/70 leading-relaxed">${escapeXml(config.fit)}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What MyDesigner Helps Ship -->
    <section class="py-12 lg:py-16">
      <div class="max-w-4xl mx-auto px-4">
        <div class="text-center mb-10">
          <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">What MyDesigner helps ship</span>
          <h2 class="text-3xl lg:text-4xl font-bold mt-2">Concrete outputs, not vague design help.</h2>
        </div>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
${includedItems}
        </ul>
      </div>
    </section>

    <!-- Process + Client Memory -->
    <section class="py-12 lg:py-16 bg-base-200">
      <div class="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">How this work runs</span>
          <h2 class="text-3xl lg:text-4xl font-bold mt-2 mb-4">A shipping rhythm with human taste.</h2>
          <ol class="space-y-3 text-base-content/70">
            <li><strong>1. Diagnose</strong> the creative bottleneck.</li>
            <li><strong>2. Gather</strong> the context that affects quality.</li>
            <li><strong>3. Create</strong> the first direction quickly.</li>
            <li><strong>4. Review</strong> with human taste and business judgment.</li>
            <li><strong>5. Ship</strong> the asset and store the learning in Client Memory.</li>
          </ol>
        </div>
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">Client Memory</span>
            <h2 class="text-2xl lg:text-3xl font-bold">Every engagement builds Client Memory.</h2>
            <p class="text-base-content/70 leading-relaxed">Your brand rules, examples, reusable patterns, past decisions, prompts, templates, and performance learnings should not disappear after each request. MyDesigner turns that context into a living creative system so every new asset starts faster and stays closer to your brand.</p>
            <p class="text-base-content/70 leading-relaxed">${escapeXml(config.memory)}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Portfolio Grid -->
    <section class="py-12 lg:py-16" id="related-work">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-end justify-between mb-8">
          <div>
            <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">Related work</span>
            <h2 class="text-3xl lg:text-4xl font-bold mt-1">Proof that connects to ${escapeXml((config.role || config.label).toLowerCase())}</h2>
            <p class="text-base-content/70 mt-3 max-w-3xl">These projects show the taste, structure, and execution quality MyDesigner now makes faster and more repeatable through the AI-native creative-team model.</p>
          </div>
          <a href="/portfolio" class="btn btn-outline btn-sm hidden sm:inline-flex">View all work &rarr;</a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
${projectCards}
        </div>
        <div class="mt-8 text-center sm:hidden">
          <a href="/portfolio" class="btn btn-outline btn-sm">View all work &rarr;</a>
        </div>
      </div>
    </section>

    <!-- Related Services -->
    <section class="py-12 lg:py-16 bg-base-200">
      <div class="max-w-5xl mx-auto px-4">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">Related paths</span>
            <h2 class="text-2xl lg:text-3xl font-bold">Keep exploring the capability architecture.</h2>
            <div class="flex flex-wrap gap-3 mt-4">
${relatedLinks}
              <a href="/services" class="btn btn-outline btn-sm">All services</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-12 lg:py-16">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">FAQ</span>
        <h2 class="text-3xl lg:text-4xl font-bold mt-2 mb-8">${escapeXml(config.label)} — Questions Answered</h2>
        <div class="join join-vertical w-full text-left">
${faqItems}
        </div>
      </div>
    </section>

    <!-- CTA Strip -->
    <section class="py-16 lg:py-20 bg-neutral text-neutral-content">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl lg:text-4xl font-bold mb-4">Want to see if this is the right work to ship next?</h2>
        <p class="text-lg text-neutral-content/80 max-w-2xl mx-auto mb-8">Bring the bottleneck, examples, and current context. We will help you decide whether this should be a sprint, a focused lane, or part of a larger creative operating rhythm.</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-lg">Talk through this work</a>
          <a href="/pricing" class="btn btn-outline btn-neutral-content btn-lg">See pricing</a>
        </div>
      </div>
    </section>
  </main>`;

  // Build a full page using the same structure as pageShell but with extra schema tags in head
  const imageUrl = `${SITE_URL}/assets/images/og-image.jpg`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(metaTitle)}</title>
  <meta name="description" content="${escapeXml(metaDesc)}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" type="application/rss+xml" title="${SITE_TITLE} RSS" href="${SITE_URL}/rss.xml">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeXml(metaTitle)}">
  <meta property="og:description" content="${escapeXml(metaDesc)}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeXml(metaTitle)}">
  <meta name="twitter:description" content="${escapeXml(metaDesc)}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
  <link rel="icon" type="image/png" href="/assets/images/favicon.png">
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/daisyui@5" as="style">
  <link rel="preload" href="/css/styles.css" as="style">
  <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<!-- Traffic Source Analytics -->
<script defer src="https://traffic.sukratu-test.com/t.js" data-site="1"></script>
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
        <li><a href="/services" class="font-medium">Services</a></li>
        <li><a href="/how-it-works" class="font-medium">How It Works</a></li>
        <li><a href="/pricing" class="font-medium">Pricing</a></li>
        <li><a href="/portfolio" class="font-medium">Portfolio</a></li>
        <li><a href="/blog/" class="font-medium">Blog</a></li>
        <li><a href="/faq" class="font-medium">FAQ</a></li>
      </ul>
    </div>
    <div class="navbar-end gap-2">
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm hidden lg:inline-flex">Talk through your creative needs</a>
      <div class="dropdown dropdown-end lg:hidden">
        <div tabindex="0" role="button" aria-label="Open menu" class="btn btn-ghost btn-square">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-lg mt-2">
          <li><a href="/services">Services</a></li>
          <li><a href="/how-it-works">How It Works</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/portfolio">Portfolio</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li class="mt-2"><a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm">Talk through your needs</a></li>
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
      <p class="max-w-xs">MyDesigner is an AI-native creative team by <a href="https://sukratu.co" target="_blank" rel="noopener" class="link link-hover">Sukratu</a>. We help growing companies ship web, product, brand, and growth creative with human-level taste, faster execution, and Client Memory that compounds over time.</p>
    </aside>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Pages</p>
      <a href="/services" class="link link-hover">Services</a>
      <a href="/how-it-works" class="link link-hover">How It Works</a>
      <a href="/pricing" class="link link-hover">Pricing</a>
      <a href="/portfolio" class="link link-hover">Portfolio</a>
      <a href="/blog/" class="link link-hover">Blog</a>
      <a href="/faq" class="link link-hover">FAQ</a>
    </nav>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Compare</p>
      <a href="/vs/designjoy" class="link link-hover">vs DesignJoy</a>
      <a href="/vs/penji" class="link link-hover">vs Penji</a>
      <a href="/vs/manypixels" class="link link-hover">vs ManyPixels</a>
      <a href="/vs/kimp" class="link link-hover">vs Kimp</a>
    </nav>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Get Started</p>
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="link link-hover">Talk through your creative needs</a>
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

function buildServicePages() {
  ensureDir(SERVICES_DIR);
  SERVICE_CONFIGS.forEach((config) => {
    const html = buildServicePage(config);
    const outputPath = path.join(SERVICES_DIR, `${config.slug}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`Built service page: services/${config.slug}.html`);
  });
}

function buildRelatedProjectsScript() {
  const projectsJson = JSON.stringify(PROJECTS, null, 4);
  const content = `/* ========== RELATED PROJECTS ========== */
/* AUTO-GENERATED by build-blog.js — edit data/projects.js instead */
(function() {
  var section = document.querySelector('[data-related-projects]');
  if (!section) return;

  var category    = section.getAttribute('data-related-projects');
  var currentSlug = section.getAttribute('data-current-slug');

  var projects = ${projectsJson};

  var related = projects.filter(function(p) {
    return p.category === category && p.slug !== currentSlug;
  }).slice(0, 3);

  if (related.length === 0) return;

  var categoryLabels = {
    uiux:     'product UI proof',
    branding: 'brand system proof',
    webdev:   'website and build proof',
    graphic:  'growth creative proof'
  };

  var cards = related.map(function(p) {
    return [
      '<a href="/work/' + p.slug + '" class="block group">',
        '<div class="card bg-base-100 border border-base-200 hover:shadow-lg transition-shadow overflow-hidden">',
          '<figure class="overflow-hidden">',
            '<img src="' + p.thumb + '" alt="' + p.title + '" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">',
          '</figure>',
          '<div class="card-body p-4">',
            '<div class="badge badge-outline badge-sm">' + p.badge + '</div>',
            '<h3 class="card-title text-base mt-1">' + p.title + '</h3>',
            '<p class="text-sm text-base-content/60">' + p.desc + '</p>',
            '<p class="text-xs text-primary font-medium mt-1">View case study \\u2192</p>',
          '</div>',
        '</div>',
      '</a>'
    ].join('');
  }).join('\\n');

  var container = section.querySelector('div');
  container.innerHTML =
    '<h2 class="text-xl font-bold mb-8">More ' + (categoryLabels[category] || 'project proof') + '</h2>' +
    '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">' + cards + '</div>';
})();
`;
  const outputPath = path.join(process.cwd(), 'js', 'related-projects.js');
  fs.writeFileSync(outputPath, content);
  console.log('Regenerated js/related-projects.js from data/projects.js');
}

function main() {
  ensureDir(POSTS_DIR);
  const files = readPostFiles();
  const parsedPosts = files
    .map((file) => buildPostObject(file))
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  writeOutputs(parsedPosts);
  buildServicePages();
  buildRelatedProjectsScript();
  console.log(`Built blog: ${parsedPosts.length} published posts`);
}

main();

#!/usr/bin/env node

/**
 * Sitemap generation.
 * Extracted from build-blog.js for better maintainability.
 */

const fs = require('fs');
const path = require('path');

const { escapeXml } = require('./lib/utils');

const SITE_URL = 'https://mydesigner.gg';
const SITEMAP_PATH = path.join(process.cwd(), 'sitemap.xml');

// Large static list of pages with their sitemap metadata.
// This was previously inside build-blog.js.
const STATIC_SITEMAP_PAGES = [
  { loc: '/', lastmod: '2026-02-10', changefreq: 'weekly', priority: '1.0' },
  { loc: '/pricing', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.9' },
  { loc: '/services', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.8' },
  { loc: '/conversion-design', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.9' },
  { loc: '/founder-content-engine', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.9' },
  { loc: '/ai-ready-brand-system', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.9' },
  { loc: '/how-it-works', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.8' },
  { loc: '/faq', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
  { loc: '/portfolio', lastmod: '2026-02-10', changefreq: 'monthly', priority: '0.7' },
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

function toIsoDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function getLocationPages() {
  const locDir = path.join(process.cwd(), 'content', 'locations');
  if (!fs.existsSync(locDir)) return [];
  return fs.readdirSync(locDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(locDir, f), 'utf8');
      const { data } = require('gray-matter')(raw);
      if (data.draft) return null;
      const slug = String(data.slug || '').trim() || f.replace(/\.md$/, '');
      const date = data.date ? toIsoDateOnly(new Date(data.date)) : toIsoDateOnly(new Date());
      return { loc: `/locations/${slug}`, lastmod: date, changefreq: 'monthly', priority: '0.6' };
    })
    .filter(Boolean);
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
    })),
    ...getLocationPages()
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

function writeSitemap(posts) {
  const sitemapContent = buildSitemap(posts);
  fs.writeFileSync(SITEMAP_PATH, sitemapContent);
  console.log('Generated sitemap.xml');
}

module.exports = {
  buildSitemap,
  writeSitemap,
  STATIC_SITEMAP_PAGES // exported in case someone wants to inspect it
};

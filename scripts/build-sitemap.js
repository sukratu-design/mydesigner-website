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
  { loc: '/', lastmod: '2026-06-14', changefreq: 'weekly', priority: '1.0' },
  { loc: '/about', lastmod: '2026-06-14', changefreq: 'monthly', priority: '0.8' },
  { loc: '/work', lastmod: '2026-06-14', changefreq: 'weekly', priority: '0.9' },
  { loc: '/services', lastmod: '2026-06-14', changefreq: 'monthly', priority: '0.9' },
  { loc: '/conversion-design', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.9' },
  { loc: '/founder-content-engine', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.9' },
  { loc: '/ai-ready-brand-system', lastmod: '2026-05-01', changefreq: 'monthly', priority: '0.9' },
  { loc: '/vs/', lastmod: '2026-07-02', changefreq: 'monthly', priority: '0.8' },
  { loc: '/vs/designjoy', lastmod: '2026-07-02', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/kimp', lastmod: '2026-07-02', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/manypixels', lastmod: '2026-07-02', changefreq: 'monthly', priority: '0.7' },
  { loc: '/vs/penji', lastmod: '2026-07-02', changefreq: 'monthly', priority: '0.7' },
  { loc: '/services/framer-development', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/webflow-development', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/web-app-design', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/website-design', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/brand-identity', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/presentation-design', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/booth-designs', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/social-media-creatives', lastmod: '2026-03-04', changefreq: 'monthly', priority: '0.8' },
  { loc: '/work/dentaldost', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/slash', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/apollo-radiology', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/uber-cards', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/poocho-app', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/ecstra', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/dentsu', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/scano', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/travelsaving', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/contractwrangler', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/mda', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/vettly', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/fluentpet', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/poocho-website', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/ahhf', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/neustreet', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/nada', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/yespl', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/takumi', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/work/kkhavo', lastmod: '2026-02-10', changefreq: 'yearly', priority: '0.6' },
  { loc: '/portfolio/ui-ux-design', lastmod: '2026-06-14', changefreq: 'monthly', priority: '0.7' },
  { loc: '/portfolio/web-development', lastmod: '2026-06-14', changefreq: 'monthly', priority: '0.7' },
  { loc: '/portfolio/graphic-design', lastmod: '2026-06-14', changefreq: 'monthly', priority: '0.7' },
  { loc: '/portfolio/branding', lastmod: '2026-06-14', changefreq: 'monthly', priority: '0.7' }
];

function toIsoDateOnly(date) {
  return date.toISOString().slice(0, 10);
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

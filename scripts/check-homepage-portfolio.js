#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const portfolioMatch = html.match(/<section\b(?=[^>]*\bid="portfolio")[^>]*>[\s\S]*?<\/section>/i);
assert.ok(portfolioMatch, 'Homepage must contain a #portfolio section');

const portfolio = portfolioMatch[0];
const imgTags = [...portfolio.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
assert.strictEqual(imgTags.length, 6, 'Homepage portfolio should show exactly six work thumbnails');

const expected = [
  'dentaldost.webp',
  'apollo-radiology.webp',
  'scano.webp',
  'dentsu.webp',
  'contractwrangler.webp',
  'ecstra.webp',
];

for (const file of expected) {
  const src = `/assets/images/portfolio/${file}`;
  const tag = imgTags.find(img => img.includes(`src="${src}"`));
  assert.ok(tag, `Homepage portfolio must use local optimized thumbnail ${src}`);
  assert.ok(tag.includes('width="800"'), `${src} should include intrinsic width to prevent layout shift`);
  assert.ok(tag.includes('height="450"'), `${src} should include intrinsic height to prevent layout shift`);
  assert.ok(tag.includes('decoding="async"'), `${src} should decode asynchronously`);
  assert.ok(tag.includes('fetchpriority="low"'), `${src} should not compete with above-the-fold assets`);
  assert.ok(!/loading="lazy"/i.test(tag), `${src} should not be lazy-loaded; full-page audits and anchor jumps must show real work thumbnails`);

  const assetPath = path.join(root, src);
  assert.ok(fs.existsSync(assetPath), `${src} must exist on disk`);
  const size = fs.statSync(assetPath).size;
  assert.ok(size < 100 * 1024, `${src} should stay lightweight (<100KB); actual ${Math.round(size / 1024)}KB`);
}

assert.ok(!/cdn\.prod\.website-files\.com\/64f99cd63a4fcf5bd6a01c59\/[^"]+_thumbnail\.png/i.test(portfolio), 'Homepage portfolio should not depend on heavy remote Webflow PNG thumbnails');

console.log('Homepage portfolio thumbnail checks passed.');

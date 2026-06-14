#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const portfolioMatch = html.match(/<section\b(?=[^>]*\bid="ch-evidence")[^>]*>[\s\S]*?<\/section>/i);
assert.ok(portfolioMatch, 'Homepage must contain the ORBIT #ch-evidence work showcase section');

const portfolio = portfolioMatch[0];
const imgTags = [...portfolio.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
const projectCards = [...portfolio.matchAll(/<a\b[^>]*class="proj\b[^"]*"[^>]*>/gi)].map(match => match[0]);
assert.strictEqual(projectCards.length, 6, 'ORBIT homepage work showcase should show exactly six project cards');
assert.strictEqual(imgTags.length, 6, 'ORBIT homepage work showcase should show exactly six work thumbnails');

const expected = [
  'apollo-radiology.webp',
  'poocho-app.webp',
  'vettly.webp',
  'neustreet.webp',
  'takumi.webp',
  'scano.webp',
];

for (const file of expected) {
  const src = `/assets/images/portfolio/${file}`;
  const tag = imgTags.find(img => img.includes(`src="${src}"`));
  assert.ok(tag, `Homepage portfolio must use local optimized thumbnail ${src}`);
  assert.ok(tag.includes('loading="lazy"'), `${src} should lazy-load below the ORBIT hero`);

  const assetPath = path.join(root, src);
  assert.ok(fs.existsSync(assetPath), `${src} must exist on disk`);
  const size = fs.statSync(assetPath).size;
  assert.ok(size < 350 * 1024, `${src} should stay reasonable for the ORBIT work showcase (<350KB); actual ${Math.round(size / 1024)}KB`);
}

assert.match(portfolio, /href="\/work"/, 'Homepage work showcase should link the full archive CTA to /work');
assert.ok(!/cdn\.prod\.website-files\.com\/64f99cd63a4fcf5bd6a01c59\/[^"]+_thumbnail\.png/i.test(portfolio), 'Homepage portfolio should not depend on heavy remote Webflow PNG thumbnails');

console.log('Homepage ORBIT work showcase checks passed.');

const fs = require('fs');
const assert = require('assert');

const pages = [
  'vs/index.html',
  'vs/designjoy.html',
  'vs/penji.html',
  'vs/manypixels.html',
  'vs/kimp.html'
];

const childPages = pages.slice(1);

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');

  assert.match(html, /AI-native/i, `${page} should mention the AI-native positioning`);
  assert.match(html, /Client Memory/i, `${page} should mention Client Memory`);
  assert.doesNotMatch(html, /77%\s+(lower|less)/i, `${page} should not use percentage-savings framing`);
  assert.doesNotMatch(html, /cheap|cheaper|low cost/i, `${page} should not use cheapness framing`);
  assert.doesNotMatch(html, /unlimited design subscription by <a/i, `${page} footer should be repositioned`);
}

const hub = fs.readFileSync('vs/index.html', 'utf8');
assert.doesNotMatch(
  hub,
  /Compare MyDesigner vs Leading Design Subscriptions/i,
  'vs/index.html H1 should not use the old commodity comparison frame'
);

for (const page of childPages) {
  const html = fs.readFileSync(page, 'utf8');

  assert.match(html, /creative operating model|operating model/i, `${page} should compare operating models`);
  assert.match(html, /href="\/pricing"/, `${page} should link to pricing`);
  assert.match(html, /href="\/services"/, `${page} should link to services`);
  assert.match(html, /href="\/how-it-works"/, `${page} should link to how it works`);
  assert.match(html, /https:\/\/calendar\.app\.google\/xGoKb51qpbcnZgJy5/, `${page} should link to the booking CTA`);
  assert.doesNotMatch(html, /"item":"https:\/\/mydesigner\.gg\/vs\/[^"]+\.html"/, `${page} breadcrumb URLs should be clean`);

  const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(jsonBlocks.length >= 2, `${page} should include BreadcrumbList and FAQPage schema`);

  const schemas = jsonBlocks.map((match) => JSON.parse(match[1]));
  assert.ok(schemas.some((schema) => schema['@type'] === 'FAQPage'), `${page} should include FAQPage schema`);
}

console.log('VS positioning checks passed');

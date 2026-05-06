const fs = require('fs');
const assert = require('assert');

const page = 'contact.html';
const html = fs.readFileSync(page, 'utf8');

assert.match(html, /AI-native/i, 'contact.html should mention AI-native positioning');
assert.match(html, /Client Memory/i, 'contact.html should mention Client Memory');
assert.match(html, /creative operating rhythm|operating rhythm/i, 'contact.html should mention the operating rhythm');
assert.match(html, /Talk through your creative needs/i, 'contact.html should use the new CTA label');
assert.doesNotMatch(html, /Book a Design Subscription Call/i, 'contact.html should not use the old title');
assert.doesNotMatch(html, /unlimited design subscription by <a/i, 'contact.html footer should be repositioned');
assert.match(html, /<link rel="canonical" href="https:\/\/mydesigner\.gg\/contact">/, 'contact.html canonical should stay clean');
assert.match(html, /https:\/\/calendar\.app\.google\/xGoKb51qpbcnZgJy5/, 'contact.html should keep the calendar booking URL');

for (const href of ['/pricing', '/services', '/portfolio', '/how-it-works']) {
  assert.match(html, new RegExp(`href="${href}"`), `contact.html should link to ${href}`);
}

const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
assert.ok(jsonBlocks.length >= 2, 'contact.html should include BreadcrumbList and ContactPage schema');

const schemas = jsonBlocks.map((match) => JSON.parse(match[1]));
assert.ok(schemas.some((schema) => schema['@type'] === 'ContactPage'), 'contact.html should include ContactPage schema');

console.log('Contact page checks passed');

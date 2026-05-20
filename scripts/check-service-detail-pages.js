const fs = require('fs');
const assert = require('assert');

const pages = {
  'services/website-design.html': 'Website design for teams that need to turn attention into action',
  'services/web-app-design.html': 'Web app design that makes complex products easier to use',
  'services/webflow-development.html': 'Webflow development for websites your team can actually ship and manage',
  'services/framer-development.html': 'Framer development for polished marketing sites and launch pages',
  'services/brand-identity.html': 'Brand identity systems that make every future asset easier to ship',
  'services/presentation-design.html': 'Presentation design that helps complex ideas land clearly',
  'services/social-media-creatives.html': 'Social media creatives that keep campaigns moving without losing the brand',
  'services/booth-designs.html': 'Booth and exhibition design that carries your brand into the room'
};

for (const [file, h1] of Object.entries(pages)) {
  const html = fs.readFileSync(file, 'utf8');

  assert.match(html, new RegExp(h1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `${file} should use the repositioned H1`);
  assert.match(html, /AI-native creative team|Client Memory|creative operating rhythm|human-level taste/i, `${file} should include new positioning`);
  assert.match(html, /Client Memory/i, `${file} should include Client Memory`);
  assert.match(html, /Use this when/i, `${file} should include fit guidance`);
  assert.match(html, /What MyDesigner helps ship/i, `${file} should explain concrete outputs`);
  assert.match(html, /Related paths/i, `${file} should include internal related links`);
  assert.match(html, /Talk through this work/i, `${file} should use the new CTA`);
  assert.match(html, /https:\/\/mydesigner\.gg\/services\//i, `${file} should preserve service canonical/schema URL`);
  assert.doesNotMatch(html, /unlimited design subscription by/i, `${file} footer should not preserve old primary positioning`);
  assert.doesNotMatch(html, /cheap|low cost|cheaper/i, `${file} should avoid cheapness framing`);

  const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(jsonBlocks.length >= 3, `${file} should include BreadcrumbList, Service, and FAQPage schema`);

  const schemas = jsonBlocks.map((match) => JSON.parse(match[1]));
  assert.ok(schemas.some((schema) => schema['@type'] === 'Service'), `${file} should include Service schema`);
  assert.ok(schemas.some((schema) => schema['@type'] === 'FAQPage'), `${file} should include FAQPage schema`);
}

console.log('Service detail page positioning checks passed');

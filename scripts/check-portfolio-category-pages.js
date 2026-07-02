const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const pages = {
  'portfolio/ui-ux-design.html': {
    phrase: /Product UI proof for complex apps, dashboards, and workflows/i,
    service: /\/services\/web-app-design/i,
  },
  'portfolio/web-development.html': {
    phrase: /Website and no-code build proof for teams that need to launch/i,
    service: /\/services\/(website-design|webflow-development|framer-development)/i,
  },
  'portfolio/graphic-design.html': {
    phrase: /Growth creative proof for campaigns, decks, and communication assets/i,
    service: /\/services\/(social-media-creatives|presentation-design)/i,
  },
  'portfolio/branding.html': {
    phrase: /Brand system proof for identities that need to scale/i,
    service: /\/services\/brand-identity/i,
  },
};

for (const [file, rules] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const main = html.match(/<main[\s\S]*<\/main>/i)?.[0] || html;

  assert.match(html, rules.phrase, `${file} should use proof-category hero positioning`);
  assert.match(html, /What this category proves/i, `${file} should include proof framing`);
  assert.match(html, /Client Memory|living creative system/i, `${file} should include Client Memory bridge`);
  assert.match(html, /Related services/i, `${file} should link proof to services`);
  assert.match(html, rules.service, `${file} should link to the relevant service detail page`);
  assert.match(html, /Talk through similar work/i, `${file} should use repositioned CTA language`);
  assert.doesNotMatch(main, /unlimited design subscription by|Book a call|No contracts|Cancel anytime|Starting at \$1,400\/mo/i, `${file} should not preserve old subscription CTA framing in the portfolio body`);
  assert.doesNotMatch(html, /cheap|low cost|cheaper/i, `${file} should avoid cheapness framing`);
  assert.doesNotMatch(html, /portfolio\.html|work\/[a-z0-9-]+\.html/i, `${file} should use clean URLs`);
}

console.log('Portfolio category positioning checks passed');

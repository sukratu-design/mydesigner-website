const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const pages = [
  'work/ahhf.html',
  'work/apollo-radiology.html',
  'work/contractwrangler.html',
  'work/dentaldost.html',
  'work/dentsu.html',
  'work/ecstra.html',
  'work/fluentpet.html',
  'work/kkhavo.html',
  'work/mda.html',
  'work/nada.html',
  'work/neustreet.html',
  'work/poocho-app.html',
  'work/poocho-website.html',
  'work/scano.html',
  'work/slash.html',
  'work/takumi.html',
  'work/travelsaving.html',
  'work/uber-cards.html',
  'work/vettly.html',
  'work/yespl.html',
];

const productPages = [
  'work/contractwrangler.html',
  'work/dentaldost.html',
  'work/fluentpet.html',
  'work/nada.html',
  'work/neustreet.html',
  'work/poocho-app.html',
];

const websitePages = [
  'work/apollo-radiology.html',
  'work/ecstra.html',
  'work/kkhavo.html',
  'work/mda.html',
  'work/poocho-website.html',
  'work/takumi.html',
  'work/yespl.html',
];

const brandPages = [
  'work/scano.html',
  'work/slash.html',
  'work/uber-cards.html',
  'work/vettly.html',
];

const growthPages = [
  'work/ahhf.html',
  'work/dentsu.html',
  'work/travelsaving.html',
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

for (const file of pages) {
  const html = read(file);

  assert.match(html, /What this work proves/i, `${file} should include proof framing`);
  assert.match(html, /Client Memory|living creative system/i, `${file} should include Client Memory bridge`);
  assert.match(html, /Talk through similar work|Talk through what your team needs to ship|Talk through this work/i, `${file} should include repositioned CTA`);
  assert.match(html, /Related services/i, `${file} should link proof to services`);
  assert.doesNotMatch(html, /portfolio\.html|work\/[a-z0-9-]+\.html/i, `${file} should use clean URLs in schema/links`);
  assert.doesNotMatch(html, /cheap|low cost|cheaper/i, `${file} should avoid cheapness framing`);
  assert.doesNotMatch(html, /unlimited design subscription by/i, `${file} should not preserve old footer positioning`);
  assert.doesNotMatch(html, />Book a (free )?call</i, `${file} should not use generic Book a call CTAs`);
}

const dentsu = read('work/dentsu.html');
assert.match(dentsu, /2\.5\+[\s\S]{0,120}?years/i, 'Dentsu should preserve the 2.5+ years proof');
assert.match(dentsu, /20-30/i, 'Dentsu should preserve monthly asset proof');
assert.doesNotMatch(dentsu, /<h1[\s\S]*subscription that never stops[\s\S]*<\/h1>/i, 'Dentsu H1 should not lead with subscription framing');

const poocho = read('work/poocho-app.html');
assert.match(poocho, /since day one|five years/i, 'Poocho should preserve long-term continuity proof');
assert.match(poocho, /Client Memory|compound/i, 'Poocho should connect continuity to compounding context');

for (const file of productPages) {
  assert.match(read(file), /\/services\/web-app-design/i, `${file} should link to web app design`);
}

for (const file of websitePages) {
  const html = read(file);
  assert.match(html, /\/services\/website-design/i, `${file} should link to website design`);
  assert.match(html, /\/services\/(webflow-development|framer-development)/i, `${file} should link to Webflow or Framer development`);
}

for (const file of brandPages) {
  assert.match(read(file), /\/services\/brand-identity/i, `${file} should link to brand identity`);
}

for (const file of growthPages) {
  assert.match(read(file), /\/services\/(social-media-creatives|presentation-design)/i, `${file} should link to growth or deck services`);
}

console.log('Work case-study positioning checks passed');

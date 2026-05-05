#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const netlifyPath = path.join(root, 'netlify.toml');
const analyticsOrigin = 'https://traffic.sukratu-test.com';

const netlify = fs.readFileSync(netlifyPath, 'utf8');
const cspMatch = netlify.match(/Content-Security-Policy\s*=\s*"([^"]+)"/);
assert.ok(cspMatch, 'netlify.toml must define a Content-Security-Policy header');

const directives = Object.fromEntries(
  cspMatch[1].split(';').map((raw) => {
    const parts = raw.trim().split(/\s+/).filter(Boolean);
    return [parts[0], parts.slice(1)];
  }).filter(([name]) => name)
);

assert.ok(directives['script-src'], 'CSP must include script-src');
assert.ok(directives['connect-src'], 'CSP must include connect-src');
assert.ok(
  directives['script-src'].includes(analyticsOrigin),
  `script-src must allow ${analyticsOrigin} so the traffic-source analytics script can load`
);
assert.ok(
  directives['connect-src'].includes(analyticsOrigin),
  `connect-src must allow ${analyticsOrigin} so analytics beacons can POST to /api/collect`
);

const htmlFiles = [
  'index.html',
  'pricing.html',
  'contact.html',
  'services.html',
  'how-it-works.html',
  'portfolio.html',
].map((file) => path.join(root, file));

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('traffic.sukratu-test.com/t.js')) {
    assert.ok(
      directives['script-src'].includes(analyticsOrigin),
      `${path.relative(root, filePath)} loads traffic analytics, so CSP script-src must allow ${analyticsOrigin}`
    );
  }
}

console.log('CSP analytics allowlist checks passed.');

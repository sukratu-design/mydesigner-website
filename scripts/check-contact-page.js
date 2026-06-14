#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const contactPath = path.join(root, 'contact.html');
const sitemapPath = path.join(root, 'sitemap.xml');
const netlifyPath = path.join(root, 'netlify.toml');

assert.ok(!fs.existsSync(contactPath), 'contact.html should be deleted; /contact is a 301 to the booking URL');

const netlify = fs.readFileSync(netlifyPath, 'utf8');
assert.match(
  netlify,
  /from = "\/contact"\s+to = "https:\/\/calendar\.app\.google\/xGoKb51qpbcnZgJy5"\s+status = 301/s,
  'netlify.toml must 301 /contact to the booking URL'
);

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
assert.doesNotMatch(sitemap, /<loc>https:\/\/mydesigner\.gg\/contact<\/loc>/i, 'sitemap must not list redirected /contact');

console.log('Contact redirect checks passed.');

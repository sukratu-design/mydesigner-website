#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const contactPath = path.join(root, 'contact.html');
const sitemapPath = path.join(root, 'sitemap.xml');
const redirectsPath = path.join(root, '_redirects');

assert.ok(fs.existsSync(contactPath), 'contact.html must exist so /contact is not served by 404.html');

const html = fs.readFileSync(contactPath, 'utf8');
assert.match(html, /<title>Contact MyDesigner/i, 'contact page should have a contact-focused title');
assert.match(html, /<link rel="canonical" href="https:\/\/mydesigner\.gg\/contact">/i, 'contact page should canonicalize to /contact');
assert.doesNotMatch(html, /<meta name="robots"[^>]*noindex/i, 'contact page must not include noindex');
assert.match(html, /<h1[^>]*>\s*(Contact MyDesigner|Book a design call)/i, 'contact page should have a clear H1');
assert.match(html, /https:\/\/calendar\.app\.google\/xGoKb51qpbcnZgJy5/i, 'contact page should include the booking URL');
assert.match(html, /ContactPage|ContactPoint/i, 'contact page should include contact structured data');

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
assert.match(sitemap, /<loc>https:\/\/mydesigner\.gg\/contact<\/loc>/i, 'sitemap must list https://mydesigner.gg/contact');

const redirects = fs.readFileSync(redirectsPath, 'utf8');
assert.match(redirects, /^\/contact\s+\/contact\.html\s+200$/m, '_redirects must rewrite /contact to /contact.html');

console.log('Contact page visibility checks passed.');

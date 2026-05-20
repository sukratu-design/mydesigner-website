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
assert.match(html, /<h1[^>]*>[\s\S]*?(Contact MyDesigner|Book a design call|Talk through what your team needs to ship)/i, 'contact page should have a clear H1');
assert.match(html, /https:\/\/calendar\.app\.google\/xGoKb51qpbcnZgJy5/i, 'contact page should include the booking URL');
assert.match(html, /ContactPage|ContactPoint/i, 'contact page should include contact structured data');
assert.match(html, /AI-native/i, 'contact page should mention AI-native positioning');
assert.match(html, /Client Memory/i, 'contact page should mention Client Memory');
assert.match(html, /creative operating rhythm|operating rhythm/i, 'contact page should mention the operating rhythm');
assert.match(html, /Talk through your creative needs/i, 'contact page should use the new CTA label');
assert.doesNotMatch(html, /Book a Design Subscription Call/i, 'contact page should not use the old title');
assert.doesNotMatch(html, /unlimited design subscription by <a/i, 'contact page footer should be repositioned');

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
assert.match(sitemap, /<loc>https:\/\/mydesigner\.gg\/contact<\/loc>/i, 'sitemap must list https://mydesigner.gg/contact');

const redirects = fs.readFileSync(redirectsPath, 'utf8');
assert.match(redirects, /^\/contact\s+\/contact\.html\s+200$/m, '_redirects must rewrite /contact to /contact.html');

console.log('Contact page visibility checks passed.');

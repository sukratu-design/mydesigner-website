const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const robotsPath = path.join(root, 'robots.txt');
const calendarUrl = 'https://calendar.app.google/xGoKb51qpbcnZgJy5';

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function jsonLdBlocks(html) {
  const blocks = [];
  const scriptPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match;

  while ((match = scriptPattern.exec(html)) !== null) {
    blocks.push(JSON.parse(match[1]));
  }

  return blocks;
}

function schemaByType(blocks, type) {
  return blocks.find((block) => block['@type'] === type);
}

function assertOrganization(value, label) {
  assert.strictEqual(value['@type'], 'Organization', `${label} should be an Organization`);
  assert.strictEqual(value.name, 'MyDesigner', `${label} should identify MyDesigner`);
  assert.strictEqual(value.url, 'https://mydesigner.gg', `${label} should include the canonical org URL`);
  assert.strictEqual(value.logo.url, 'https://mydesigner.gg/assets/images/mydesigner-logo.svg', `${label} should include the logo`);
  assert.strictEqual(value.foundingDate, '2020', `${label} should include published founding date`);
  assert.match(value.description, /57 clients served and 142\+ projects delivered/, `${label} should reuse published proof points`);
}

const blogPages = fs.existsSync(blogDir)
  ? fs.readdirSync(blogDir).filter((file) => file.endsWith('.html') && file !== 'index.html')
  : [];

assert.ok(blogPages.length > 0, 'Generated blog post pages should exist before AI SEO checks run');

let faqPageCount = 0;

for (const file of blogPages) {
  const html = read(path.join(blogDir, file));
  const schemas = jsonLdBlocks(html);
  const article = schemaByType(schemas, 'Article');

  assert.ok(article, `blog/${file} should include Article schema`);
  assert.ok(article.datePublished, `blog/${file} Article schema should include datePublished`);
  assert.ok(article.dateModified, `blog/${file} Article schema should include dateModified`);
  assert.match(html, /Last updated:\s*<time datetime="\d{4}-\d{2}-\d{2}">/, `blog/${file} should show a visible Last updated line`);

  assertOrganization(article.author, `blog/${file} Article author`);
  assertOrganization(article.publisher, `blog/${file} Article publisher`);

  assert.match(html, /id="about-mydesigner-author"/, `blog/${file} should include the author block heading`);
  assert.match(html, /AI-native creative team by Sukratu/, `blog/${file} should include the published MyDesigner context`);
  assert.match(html, /57 clients/, `blog/${file} should include the published client count`);
  assert.match(html, /142\+ projects/, `blog/${file} should include the published project count`);
  assert.match(html, /href="\/about"/, `blog/${file} should link to /about`);
  assert.match(html, new RegExp(`href="${calendarUrl}"`), `blog/${file} should link to the booking calendar`);

  const faqPage = schemaByType(schemas, 'FAQPage');
  if (faqPage) {
    faqPageCount += 1;
    assert.ok(Array.isArray(faqPage.mainEntity), `blog/${file} FAQPage schema should include mainEntity`);
    assert.ok(faqPage.mainEntity.length > 0, `blog/${file} FAQPage schema should include questions`);

    for (const item of faqPage.mainEntity) {
      assert.strictEqual(item['@type'], 'Question', `blog/${file} FAQ item should be a Question`);
      assert.ok(item.name, `blog/${file} FAQ question should include a name`);
      assert.strictEqual(item.acceptedAnswer['@type'], 'Answer', `blog/${file} FAQ answer should be an Answer`);
      assert.ok(item.acceptedAnswer.text, `blog/${file} FAQ answer should include text`);
      assert.doesNotMatch(item.acceptedAnswer.text, /<[^>]+>/, `blog/${file} FAQ answer text should not contain HTML`);
    }
  }
}

assert.ok(faqPageCount > 0, 'At least one real FAQ section should emit FAQPage schema');

const robots = read(robotsPath);
const allowedAgents = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'PerplexityBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'Bingbot'
];

for (const agent of allowedAgents) {
  assert.match(robots, new RegExp(`User-agent: ${agent}\\nAllow: /`), `robots.txt should explicitly allow ${agent}`);
}

assert.match(robots, /User-agent: CCBot\nDisallow: \//, 'robots.txt should block CCBot');
assert.match(robots, /User-agent: \*\nAllow: \/\nDisallow: \/admin\//, 'robots.txt should keep wildcard allow and admin block');
assert.match(robots, /Sitemap: https:\/\/mydesigner\.gg\/sitemap\.xml/, 'robots.txt should keep the sitemap URL');

console.log('AI SEO checks passed');

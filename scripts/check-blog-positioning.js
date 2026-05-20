const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const postsDir = path.join(root, 'content', 'posts');
const blogDir = path.join(root, 'blog');

const oldPositioning = /Book a call|Book a free design call|unlimited design subscription|design subscription for startups|All plans include unlimited|77% less|77% lower/i;

for (const file of fs.readdirSync(postsDir).filter((name) => name.endsWith('.md'))) {
  const markdown = fs.readFileSync(path.join(postsDir, file), 'utf8');
  assert.doesNotMatch(markdown, oldPositioning, `${file} should avoid old MyDesigner positioning`);
}

const generatedPages = fs.existsSync(blogDir)
  ? fs.readdirSync(blogDir).filter((name) => name.endsWith('.html'))
  : [];

for (const file of generatedPages) {
  const html = fs.readFileSync(path.join(blogDir, file), 'utf8');
  assert.doesNotMatch(html, /unlimited design subscription|Book a free design call|77% less|77% lower/i, `blog/${file} should avoid old MyDesigner positioning`);
}

console.log('Blog positioning checks passed');

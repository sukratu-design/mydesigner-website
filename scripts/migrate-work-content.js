#!/usr/bin/env node

/**
 * Improved migration: Extract the main case study content more completely.
 */

const fs = require('fs');
const path = require('path');

const projects = require('../data/projects');

const WORK_DIR = path.join(process.cwd(), 'work');
const CONTENT_DIR = path.join(process.cwd(), 'content', 'work');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function extractMainContent(html) {
  // Try to get everything inside the first <main> tag
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch && mainMatch[1]) {
    let content = mainMatch[1].trim();

    // Remove the related projects section if it got pulled in
    content = content.replace(/<section[^>]*data-related-projects[\s\S]*?<\/section>/gi, '');
    return content;
  }

  return '';
}

function main() {
  ensureDir(CONTENT_DIR);

  let count = 0;

  projects.forEach((project) => {
    const sourcePath = path.join(WORK_DIR, `${project.slug}.html`);
    if (!fs.existsSync(sourcePath)) return;

    const html = fs.readFileSync(sourcePath, 'utf8');
    const content = extractMainContent(html);

    if (content.length > 200) { // only save if it looks like real content
      const destPath = path.join(CONTENT_DIR, `${project.slug}.html`);
      fs.writeFileSync(destPath, content);
      count++;
    }
  });

  console.log(`Migrated ${count} rich work content fragments to content/work/`);
}

main();

#!/usr/bin/env node

/**
 * Build ORBIT static-dark work case study pages from project data and
 * content/work HTML fragments.
 */

const fs = require('fs');
const path = require('path');

const projects = require('../data/projects');
const { escapeXml, ensureDir } = require('./lib/utils');
const NAV = require('./partials/nav');
const FOOTER = require('./partials/footer');
const { SITE_URL, absoluteUrl, headTags } = require('./partials/head');

const WORK_DIR = path.join(process.cwd(), 'work');
const CONTENT_DIR = path.join(process.cwd(), 'content', 'work');
const CALENDAR_URL = 'https://calendar.app.google/xGoKb51qpbcnZgJy5';

const WORK_PAGE_CSS = `  <style>
    .work-case-study {
      position: relative;
      z-index: 2;
    }
    .work-case-study section {
      position: relative;
      z-index: 2;
    }
    .work-case-study > section:first-child {
      padding: clamp(8rem, 17vh, 11rem) 0 clamp(3.5rem, 8vh, 6rem);
    }
    .work-case-study > section:first-child h1 {
      font-family: var(--serif);
      font-weight: 320;
      font-variation-settings: "opsz" 144;
      font-size: clamp(3rem, 7vw, 6.5rem);
      line-height: 0.98;
      letter-spacing: -0.015em;
      max-width: 12ch;
      color: var(--paper);
    }
    .work-case-study > section:first-child h1 + p {
      max-width: 68ch;
      margin-top: 1.25rem;
      color: var(--paper-dim);
      font-size: clamp(1rem, 1.5vw, 1.18rem);
      line-height: 1.72;
    }
    .work-case-study .mx-auto { margin-left: auto; margin-right: auto; }
    .work-case-study .px-4 { padding-left: var(--gutter); padding-right: var(--gutter); }
    .work-case-study .px-8 { padding-left: clamp(1.5rem, 4vw, 3rem); padding-right: clamp(1.5rem, 4vw, 3rem); }
    .work-case-study .pt-12, .work-case-study .pt-10 { padding-top: clamp(3rem, 7vh, 5rem); }
    .work-case-study .pb-8 { padding-bottom: clamp(2.5rem, 6vh, 4rem); }
    .work-case-study .pb-14 { padding-bottom: clamp(4rem, 9vh, 6rem); }
    .work-case-study .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .work-case-study .py-8 { padding-top: clamp(2rem, 5vh, 3rem); padding-bottom: clamp(2rem, 5vh, 3rem); }
    .work-case-study .py-12 { padding-top: clamp(3rem, 7vh, 4.5rem); padding-bottom: clamp(3rem, 7vh, 4.5rem); }
    .work-case-study .py-14, .work-case-study .py-16 { padding-top: clamp(4rem, 9vh, 6rem); padding-bottom: clamp(4rem, 9vh, 6rem); }
    .work-case-study .max-w-2xl { max-width: 42rem; }
    .work-case-study .max-w-3xl { max-width: 48rem; }
    .work-case-study .max-w-5xl { max-width: 65rem; }
    .work-case-study .max-w-6xl { max-width: 74rem; }
    .work-case-study .max-w-lg { max-width: 32rem; }
    .work-case-study .grid { display: grid; gap: 1rem; }
    .work-case-study .grid-cols-1 { grid-template-columns: 1fr; }
    .work-case-study .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .work-case-study .gap-2 { gap: 0.5rem; }
    .work-case-study .gap-3 { gap: 0.75rem; }
    .work-case-study .gap-4 { gap: 1rem; }
    .work-case-study .gap-6 { gap: 1.5rem; }
    .work-case-study .gap-12 { gap: clamp(2rem, 5vw, 4rem); }
    .work-case-study .gap-x-8 { column-gap: clamp(1.25rem, 3vw, 2rem); }
    .work-case-study .gap-y-2 { row-gap: 0.5rem; }
    .work-case-study .gap-y-4 { row-gap: 1rem; }
    .work-case-study .flex { display: flex; }
    .work-case-study .flex-wrap { flex-wrap: wrap; }
    .work-case-study .items-center { align-items: center; }
    .work-case-study .items-start { align-items: flex-start; }
    .work-case-study .justify-between { justify-content: space-between; }
    .work-case-study .text-center { text-align: center; }
    .work-case-study .text-left { text-align: left; }
    .work-case-study .sticky { position: sticky; }
    .work-case-study .top-24 { top: 6rem; }
    .work-case-study .w-full { width: 100%; }
    .work-case-study .w-4 { width: 1rem; }
    .work-case-study .h-4 { height: 1rem; }
    .work-case-study .h-10 { height: 2.5rem; }
    .work-case-study .flex-shrink-0 { flex-shrink: 0; }
    .work-case-study .object-contain { object-fit: contain; }
    .work-case-study .mt-0\\.5 { margin-top: 0.125rem; }
    .work-case-study .mt-1 { margin-top: 0.25rem; }
    .work-case-study .mt-3 { margin-top: 0.75rem; }
    .work-case-study .mt-6 { margin-top: 1.5rem; }
    .work-case-study .mt-10 { margin-top: 2.5rem; }
    .work-case-study .mb-3 { margin-bottom: 0.75rem; }
    .work-case-study .mb-4 { margin-bottom: 1rem; }
    .work-case-study .mb-5 { margin-bottom: 1.25rem; }
    .work-case-study .mb-6 { margin-bottom: 1.5rem; }
    .work-case-study .mb-8 { margin-bottom: 2rem; }
    .work-case-study .my-10 { margin-top: 2.5rem; margin-bottom: 2.5rem; }
    .work-case-study .space-y-2 > * + * { margin-top: 0.5rem; }
    .work-case-study .space-y-6 > * + * { margin-top: 1.5rem; }
    .work-case-study .space-y-8 > * + * { margin-top: 2rem; }
    .work-case-study .p-6 { padding: clamp(1.2rem, 2.5vw, 1.8rem); }
    .work-case-study .font-bold { font-weight: 640; }
    .work-case-study .font-medium, .work-case-study .font-semibold { font-weight: 560; }
    .work-case-study .italic { font-style: italic; }
    .work-case-study .leading-tight { line-height: 1.08; }
    .work-case-study .leading-relaxed { line-height: 1.72; }
    .work-case-study .uppercase { text-transform: uppercase; }
    .work-case-study .tracking-wider { letter-spacing: 0.16em; }
    .work-case-study .tracking-widest { letter-spacing: 0.22em; }
    .work-case-study .opacity-80 { opacity: 0.82; }
    .work-case-study .opacity-60 { opacity: 0.7; }
    .work-case-study .text-xs,
    .work-case-study .text-sm {
      font-family: var(--mono);
      font-size: 0.72rem;
      letter-spacing: 0.12em;
    }
    .work-case-study .text-lg {
      font-size: clamp(1rem, 1.5vw, 1.18rem);
      line-height: 1.72;
    }
    .work-case-study .text-xl { font-size: clamp(1.15rem, 2vw, 1.35rem); }
    .work-case-study .text-2xl,
    .work-case-study .text-3xl {
      font-family: var(--serif);
      font-weight: 320;
      font-size: clamp(1.65rem, 3vw, 2.4rem);
      line-height: 1.08;
      letter-spacing: -0.01em;
    }
    .work-case-study .text-base-content\\/60,
    .work-case-study .text-base-content\\/70,
    .work-case-study .text-base-content\\/80,
    .work-case-study [class*="text-base-content/"] {
      color: var(--paper-dim);
    }
    .work-case-study .text-primary,
    .work-case-study .link-primary {
      color: var(--accent);
    }
    .work-case-study .text-primary-content { color: var(--ink); }
    .work-case-study .bg-base-100 {
      background: rgba(11, 8, 7, 0.54);
    }
    .work-case-study .bg-base-200 {
      background: linear-gradient(180deg, rgba(244, 239, 233, 0.028), rgba(255, 138, 61, 0.035));
    }
    .work-case-study .bg-primary {
      background: linear-gradient(135deg, var(--accent-light), var(--accent-deep));
    }
    .work-case-study .border,
    .work-case-study .border-t,
    .work-case-study .border-y {
      border-color: var(--line);
    }
    .work-case-study .border { border-width: 1px; border-style: solid; }
    .work-case-study .border-t { border-top: 1px solid var(--line); }
    .work-case-study .border-y {
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }
    .work-case-study .border-l-4 {
      border-left: 3px solid var(--accent);
    }
    .work-case-study .pl-6 { padding-left: 1.5rem; }
    .work-case-study .breadcrumbs {
      margin-bottom: 1.8rem;
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--paper-faint);
    }
    .work-case-study .breadcrumbs ul {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .work-case-study .breadcrumbs li + li::before {
      content: "/";
      margin-right: 0.5rem;
      color: var(--accent-dim);
    }
    .work-case-study .breadcrumbs a,
    .work-case-study a.link,
    .work-case-study .link-hover {
      color: var(--paper-dim);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .work-case-study a:hover,
    .work-case-study a.link:hover {
      color: var(--accent);
    }
    .work-case-study .badge {
      display: inline-flex;
      align-items: center;
      width: max-content;
      max-width: 100%;
      min-height: 1.6rem;
      border: 1px solid var(--line-strong);
      border-radius: 999px;
      padding: 0.35rem 0.7rem;
      font-family: var(--mono);
      font-size: 10px;
      line-height: 1;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--accent);
      background: rgba(244, 239, 233, 0.035);
    }
    .work-case-study .badge-sm {
      min-height: 1.4rem;
      padding: 0.28rem 0.55rem;
      font-size: 9px;
    }
    .work-case-study .meta-label {
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--paper-faint);
      margin-bottom: 0.35rem;
    }
    .work-case-study .meta-value {
      color: var(--paper);
      line-height: 1.45;
    }
    .work-case-study img.image-reveal,
    .work-case-study figure img,
    .work-case-study #project-gallery img {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(244, 239, 233, 0.045);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
      overflow: hidden;
    }
    .work-case-study .rounded-2xl { border-radius: 8px; }
    .work-case-study .shadow-sm,
    .work-case-study .shadow-md {
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
    }
    .work-case-study .project-prose {
      max-width: 68ch;
      color: var(--paper-dim);
      font-size: 1rem;
      line-height: 1.78;
    }
    .work-case-study .project-prose h2 {
      color: var(--paper);
      margin-bottom: 1rem;
    }
    .work-case-study .project-prose p + p {
      margin-top: 1rem;
    }
    .work-case-study .project-prose blockquote {
      border-left: 3px solid var(--accent);
      margin: 2.4rem 0;
      padding: 0.5rem 0 0.5rem 1.5rem;
      color: var(--paper);
      background: transparent;
    }
    .work-case-study .project-prose blockquote p {
      color: var(--paper);
      font-family: var(--serif);
      font-size: clamp(1.25rem, 2vw, 1.65rem);
      line-height: 1.45;
    }
    .work-case-study blockquote footer {
      display: block;
      border: 0;
      padding: 0;
      margin-top: 0.8rem;
      background: transparent;
      color: var(--paper-faint);
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .work-case-study .card {
      border: 1px solid var(--line);
      background: rgba(244, 239, 233, 0.045);
      border-radius: 8px;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
      overflow: hidden;
    }
    .work-case-study .card-body {
      display: grid;
      gap: 0.7rem;
      padding: clamp(1.2rem, 2.5vw, 1.8rem);
    }
    .work-case-study .card-body.items-center {
      justify-items: center;
    }
    .work-case-study .card h2,
    .work-case-study .card h3 {
      color: inherit;
    }
    .work-case-study .bg-primary .btn {
      border-color: rgba(11, 8, 7, 0.2);
      background: var(--ink);
      color: var(--paper);
    }
    .work-case-study .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      min-height: 2.65rem;
      border: 1px solid var(--line-strong);
      border-radius: 999px;
      padding: 0.75rem 1.1rem;
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--paper);
      transition: border-color 0.25s ease, color 0.25s ease, background-color 0.25s ease;
    }
    .work-case-study .btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .work-case-study .btn-primary,
    .work-case-study .btn-secondary {
      border-color: transparent;
      background: linear-gradient(135deg, var(--accent-light), var(--accent-deep));
      color: var(--ink);
    }
    .work-case-study .btn-primary:hover,
    .work-case-study .btn-secondary:hover {
      color: var(--ink);
      background: linear-gradient(135deg, #ffb866, var(--accent));
    }
    .work-case-study .btn-ghost,
    .work-case-study .btn-outline {
      background: transparent;
      color: var(--paper);
    }
    .work-case-study .btn-block { display: flex; width: 100%; }
    .work-case-study ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .work-case-study .card li {
      color: var(--paper-dim);
      line-height: 1.55;
    }
    .work-case-study svg {
      color: var(--accent);
    }
    .work-related {
      position: relative;
      z-index: 2;
      border-top: 1px solid var(--line);
      padding: clamp(4rem, 9vh, 6rem) 0;
      background: rgba(244, 239, 233, 0.025);
    }
    .work-related > div {
      max-width: 74rem;
      margin: 0 auto;
      padding: 0 var(--gutter);
    }
    .work-related h2 {
      font-family: var(--serif);
      font-weight: 320;
      font-size: clamp(2rem, 4vw, 3.6rem);
      line-height: 1.06;
      margin-bottom: 2rem;
    }
    .work-related .grid {
      display: grid;
      gap: 1rem;
    }
    .work-related .card {
      display: grid;
      height: 100%;
      border: 1px solid var(--line);
      background: rgba(244, 239, 233, 0.045);
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.25s ease, transform 0.25s ease;
    }
    .work-related .card:hover {
      border-color: var(--accent-dim);
      transform: translateY(-2px);
    }
    .work-related figure {
      aspect-ratio: 16 / 10;
      overflow: hidden;
      background: var(--ink-2);
    }
    .work-related img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .work-related .card-body {
      padding: 1.2rem;
      display: grid;
      gap: 0.55rem;
    }
    .work-related .card-title {
      color: var(--paper);
      font-size: 1.08rem;
      line-height: 1.25;
    }
    .work-related p {
      color: var(--paper-dim);
      font-size: 0.94rem;
      line-height: 1.62;
    }
    .work-related .text-primary {
      color: var(--accent);
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    @media (min-width: 860px) {
      .work-case-study .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .work-case-study .lg\\:grid-cols-3 { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
      .work-case-study .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .work-case-study .lg\\:col-span-2 { grid-column: span 2 / span 2; }
      .work-case-study .lg\\:col-span-1 { grid-column: span 1 / span 1; }
      .work-case-study .lg\\:gap-16 { gap: clamp(3rem, 6vw, 4.5rem); }
      .work-case-study .lg\\:text-xl { font-size: 1.35rem; }
      .work-related .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 859px) {
      .work-case-study .grid-cols-2 { grid-template-columns: 1fr; }
      .work-case-study .sticky { position: static; }
      .work-case-study > section:first-child h1 { max-width: 100%; }
    }
  </style>`;

function getProjectContent(slug) {
  const contentPath = path.join(CONTENT_DIR, `${slug}.html`);
  if (fs.existsSync(contentPath)) {
    return fs.readFileSync(contentPath, 'utf8');
  }
  return `<p><em>Content for this case study is being prepared.</em></p>`;
}

function plainTextFromHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstTagText(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? plainTextFromHtml(match[1]) : '';
}

function extractDescription(html, fallback) {
  const h1Match = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i);
  if (h1Match) {
    const afterH1 = html.slice(h1Match.index + h1Match[0].length);
    const paragraphMatch = afterH1.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    const description = paragraphMatch ? plainTextFromHtml(paragraphMatch[1]) : '';
    if (description) return description;
  }
  return fallback;
}

function extractClient(html, fallback) {
  const match = html.match(/<p class="meta-label">Client<\/p>\s*<p class="meta-value">([\s\S]*?)<\/p>/i);
  const client = match ? plainTextFromHtml(match[1]) : '';
  return client || fallback;
}

function extractJsonLdSchemas(html) {
  const schemas = [];
  const content = html.replace(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi, (full, rawJson) => {
    try {
      schemas.push(JSON.parse(rawJson.trim()));
      return '';
    } catch (_) {
      return full;
    }
  });

  return { content, schemas };
}

function stripOldPriceCopy(html) {
  return html.replace(/\s*<p class="text-xs opacity-60 mt-3">No contracts\. Cancel anytime\. Starting at \$1,400\/mo<\/p>/g, '');
}

function buildFallbackSchemas(project, facts, canonicalUrl) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE_URL}/work` },
      { '@type': 'ListItem', position: 3, name: facts.title, item: canonicalUrl }
    ]
  };

  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: facts.title,
    description: facts.description,
    url: canonicalUrl,
    image: absoluteUrl(project.thumb),
    creator: {
      '@type': 'Organization',
      name: 'MyDesigner',
      url: SITE_URL
    }
  };

  if (facts.client) {
    creativeWorkSchema.about = {
      '@type': 'Organization',
      name: facts.client
    };
  }

  return [breadcrumbSchema, creativeWorkSchema];
}

function buildWorkPage(project) {
  const rawContent = getProjectContent(project.slug);
  const { content: contentWithoutSchema, schemas: existingSchemas } = extractJsonLdSchemas(rawContent);
  const content = stripOldPriceCopy(contentWithoutSchema);
  const facts = {
    title: extractFirstTagText(content, 'h1') || project.title,
    description: extractDescription(content, project.desc || `Case study for ${project.title} by MyDesigner.`),
    client: extractClient(content, project.title)
  };
  const pageTitle = `${facts.title} | MyDesigner Portfolio`;
  const canonicalPath = `/work/${project.slug}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const schemas = existingSchemas.length ? existingSchemas : buildFallbackSchemas(project, facts, canonicalUrl);

  return `<!DOCTYPE html>
<html lang="en" class="static">
<head>
${headTags({
    title: pageTitle,
    description: facts.description,
    canonical: canonicalPath,
    ogTitle: pageTitle,
    ogDescription: facts.description,
    ogImage: absoluteUrl(project.thumb),
    schema: schemas,
    extra: `  <link rel="alternate" type="application/rss+xml" title="MyDesigner Blog RSS" href="${SITE_URL}/rss.xml">\n${WORK_PAGE_CSS}`
  })}
</head>
<body class="orbit-static">
  ${NAV}
  <div class="grain"></div>
  <div class="vignette"></div>
  <main class="work-case-study">
    ${content}
  </main>

  <section class="work-related" data-related-projects="${escapeXml(project.category)}" data-current-slug="${escapeXml(project.slug)}">
    <div>
      <!-- Populated client-side by js/related-projects.js -->
    </div>
  </section>

  ${FOOTER}
  <script src="/js/related-projects.js" defer></script>
</body>
</html>`;
}

function main() {
  ensureDir(WORK_DIR);

  projects.forEach((project) => {
    const html = buildWorkPage(project);
    const outputPath = path.join(WORK_DIR, `${project.slug}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`Built: work/${project.slug}.html`);
  });

  console.log(`\nGenerated ${projects.length} work case studies from content/work/ fragments.`);
}

main();

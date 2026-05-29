#!/usr/bin/env node

/**
 * Phase 2: Build work case study pages from data + content fragments.
 * Uses shared NAV/FOOTER from Phase 1.
 */

const fs = require('fs');
const path = require('path');

const projects = require('../data/projects');
const NAV = require('./partials/nav');
const FOOTER = require('./partials/footer');

const { ensureDir } = require('./lib/utils');

const WORK_DIR = path.join(process.cwd(), 'work');
const CONTENT_DIR = path.join(process.cwd(), 'content', 'work');

function getProjectContent(slug) {
  const contentPath = path.join(CONTENT_DIR, `${slug}.html`);
  if (fs.existsSync(contentPath)) {
    return fs.readFileSync(contentPath, 'utf8');
  }
  return `<p><em>Content for this case study is being prepared.</em></p>`;
}

function buildWorkPage(project) {
  const pageTitle = `${project.title} — MyDesigner Portfolio`;
  const description = project.desc || `Case study for ${project.title} by MyDesigner.`;

  const content = getProjectContent(project.slug);

  const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <!-- Meta Pixel Code -->
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '4412177725703271');
  fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=4412177725703271&ev=PageView&noscript=1"
  /></noscript>
  <!-- End Meta Pixel Code -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="https://mydesigner.gg/work/${project.slug}">

  <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
  <link rel="icon" type="image/png" href="/assets/images/favicon.png">
  <link rel="apple-touch-icon" href="/assets/images/favicon.png">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://mydesigner.gg/work/${project.slug}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${project.thumb}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${project.thumb}">

  <link rel="preload" href="https://cdn.jsdelivr.net/npm/daisyui@5" as="style">
  <link rel="preload" href="/css/styles.css" as="style">
  <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

  <!-- Traffic Source Analytics -->
  <script defer src="https://traffic.sukratu-test.com/t.js" data-site="1"></script>
</head>
<body class="bg-base-100 text-base-content">
  ${NAV}

  <main>
    ${content}
  </main>

  ${FOOTER}

  <!-- Related Projects (populated by JS) -->
  <section class="bg-base-100 py-12" data-related-projects="${project.category}" data-current-slug="${project.slug}">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Populated client-side by js/related-projects.js -->
    </div>
  </section>

  <script src="/js/related-projects.js" defer></script>
</body>
</html>`;

  return html;
}

function main() {
  ensureDir(WORK_DIR);

  projects.forEach((project) => {
    const html = buildWorkPage(project);
    const outputPath = path.join(WORK_DIR, `${project.slug}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`Built: work/${project.slug}.html`);
  });

  console.log(`\n✓ Generated ${projects.length} work case studies from content/work/ fragments.`);
}

main();

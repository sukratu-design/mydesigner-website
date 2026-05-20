#!/usr/bin/env node
/**
 * build-portfolio.js
 * Generates shareable category pages from data/projects.js:
 *   portfolio/ui-ux-design.html
 *   portfolio/web-development.html
 *   portfolio/graphic-design.html
 *   portfolio/branding.html
 */

const fs = require('fs');
const path = require('path');

const projects = require('../data/projects');
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'portfolio');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const CATEGORIES = [
  {
    key: 'uiux',
    slug: 'ui-ux-design',
    title: 'Product UI',
    heading: 'Product UI proof for complex apps, dashboards, and workflows',
    description: 'Mobile apps, SaaS dashboards, web apps, and product interfaces that show how MyDesigner brings clarity, hierarchy, and reusable UI patterns to complex product work.',
    metaTitle: 'Product UI Portfolio — MyDesigner | AI-Native Creative Team',
    metaDesc: 'Explore product UI and UX case studies from MyDesigner: mobile apps, SaaS dashboards, web apps, and product interfaces shaped with clarity, hierarchy, and reusable patterns.',
    proofLabel: 'Product UI & UX proof',
    proofTitle: 'Complex products become easier to trust when the interface has structure.',
    proofPoints: [
      'Product flows stay clearer when screens share a system.',
      'Dashboards, tables, onboarding, and mobile states need hierarchy, not decoration.',
      'Reusable UI decisions become context future product work can build from.'
    ],
    memory: 'For product UI work, Client Memory should preserve terminology, user roles, flows, component decisions, edge cases, and implementation constraints so future screens stay coherent.',
    services: [
      ['/services/web-app-design', 'Web app design'],
      ['/services/brand-identity', 'Brand identity'],
      ['/how-it-works', 'How Client Memory works']
    ],
  },
  {
    key: 'webdev',
    slug: 'web-development',
    title: 'Websites & Builds',
    heading: 'Website and no-code build proof for teams that need to launch',
    description: 'Webflow and Framer websites, conversion pages, and marketing sites that show structure, polish, responsive execution, and launch-ready handoff clarity.',
    metaTitle: 'Website & Webflow Portfolio — MyDesigner | AI-Native Creative Team',
    metaDesc: 'Explore MyDesigner website, Webflow, and Framer work: responsive marketing sites, conversion pages, CMS builds, and launch-ready no-code execution.',
    proofLabel: 'Conversion website and no-code build proof',
    proofTitle: 'A website is only useful when structure, polish, and handoff all survive launch.',
    proofPoints: [
      'Marketing pages need a clear story, not just a finished visual.',
      'Webflow and Framer builds should be responsive, editable, and launch-ready.',
      'Reusable sections and build decisions should make future pages faster.'
    ],
    memory: 'For website and build work, Client Memory should preserve page sections, CMS choices, launch checklists, brand rules, content patterns, animation preferences, and reusable components.',
    services: [
      ['/services/website-design', 'Website design'],
      ['/services/webflow-development', 'Webflow development'],
      ['/services/framer-development', 'Framer development']
    ],
  },
  {
    key: 'graphic',
    slug: 'graphic-design',
    title: 'Growth Creative',
    heading: 'Growth creative proof for campaigns, decks, and communication assets',
    description: 'Pitch decks, social assets, presentation design, and campaign creative that show how visual structure can make ideas easier to understand and ship.',
    metaTitle: 'Growth Creative Portfolio — MyDesigner | Decks, Social & Campaign Assets',
    metaDesc: 'Explore MyDesigner growth creative work: pitch decks, presentation design, social assets, campaign graphics, and communication design for growing teams.',
    proofLabel: 'Growth creative and sales asset proof',
    proofTitle: 'Campaign and sales assets work better when clarity leads the design.',
    proofPoints: [
      'Decks and campaign assets need message structure, not just decoration.',
      'Reusable visual patterns help teams keep publishing without drifting off-brand.',
      'Growth creative should support testing, sales conversations, and launch rhythm.'
    ],
    memory: 'For growth and deck work, Client Memory should preserve audience assumptions, campaign learnings, slide patterns, narrative structure, proof points, content pillars, objections, and brand rules.',
    services: [
      ['/services/social-media-creatives', 'Growth creative'],
      ['/services/presentation-design', 'Presentation design'],
      ['/services/brand-identity', 'Brand identity']
    ],
  },
  {
    key: 'branding',
    slug: 'branding',
    title: 'Brand Systems',
    heading: 'Brand system proof for identities that need to scale into future assets',
    description: 'Brand identity, logo design, visual systems, and product-brand foundations that create rules, examples, and reusable patterns for future creative work.',
    metaTitle: 'Brand System Portfolio — MyDesigner | Brand Identity & Logo Design',
    metaDesc: 'Explore MyDesigner brand system work: identity systems, logo design, visual rules, examples, and reusable brand patterns for growing companies.',
    proofLabel: 'Brand system proof',
    proofTitle: 'A useful brand system gives future creative work something to build from.',
    proofPoints: [
      'Brand work is more than a logo or static style guide.',
      'Usable identities create rules, examples, and repeatable creative patterns.',
      'Strong systems make web, product, sales, and campaign assets easier to ship.'
    ],
    memory: 'For brand work, Client Memory should preserve visual rules, logo usage, typography, color, examples, tone, templates, prompt-ready constraints, and quality-control references.',
    services: [
      ['/services/brand-identity', 'Brand identity'],
      ['/services/social-media-creatives', 'Growth creative'],
      ['/services/website-design', 'Website design']
    ],
  },
];

const NAV = `
  <nav class="navbar bg-base-100 sticky top-0 z-50 px-4 lg:px-8 border-b border-base-200" role="navigation" aria-label="Main navigation">
    <div class="navbar-start">
      <a href="/" class="flex items-center gap-2 font-bold text-lg" aria-label="MyDesigner home">
        <img src="/assets/images/mydesigner-logo.svg" alt="MyDesigner" class="h-8">
      </a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1 gap-1">
        <li><a href="/services" class="font-medium">Services</a></li>
        <li><a href="/how-it-works" class="font-medium">How It Works</a></li>
        <li><a href="/pricing" class="font-medium">Pricing</a></li>
        <li><a href="/portfolio" class="font-medium">Portfolio</a></li>
        <li><a href="/blog/" class="font-medium">Blog</a></li>
        <li><a href="/faq" class="font-medium">FAQ</a></li>
      </ul>
    </div>
    <div class="navbar-end gap-2">
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm hidden lg:inline-flex">Talk through similar work</a>
      <div class="dropdown dropdown-end lg:hidden">
        <div tabindex="0" role="button" aria-label="Open menu" class="btn btn-ghost btn-square">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-lg mt-2">
          <li><a href="/services">Services</a></li>
          <li><a href="/how-it-works">How It Works</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/portfolio">Portfolio</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li class="mt-2"><a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm">Talk through similar work</a></li>
        </ul>
      </div>
    </div>
  </nav>`;

const FOOTER = `
  <footer class="footer sm:footer-horizontal bg-base-200 text-base-content p-10 border-t border-base-300" role="contentinfo">
    <aside>
      <a href="/" class="flex items-center gap-2 font-bold text-lg mb-2">
        <img src="/assets/images/mydesigner-logo.svg" alt="MyDesigner" class="h-8">
      </a>
      <p class="max-w-xs">MyDesigner is an AI-native creative team by <a href="https://sukratu.co" target="_blank" rel="noopener" class="link link-hover">Sukratu</a>. We help growing companies ship web, product, brand, and growth creative with human-level taste, faster execution, and Client Memory that compounds over time.</p>
    </aside>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Pages</p>
      <a href="/services" class="link link-hover">Services</a>
      <a href="/how-it-works" class="link link-hover">How It Works</a>
      <a href="/pricing" class="link link-hover">Pricing</a>
      <a href="/portfolio" class="link link-hover">Portfolio</a>
      <a href="/blog/" class="link link-hover">Blog</a>
      <a href="/faq" class="link link-hover">FAQ</a>
    </nav>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Compare</p>
      <a href="/vs/designjoy" class="link link-hover">vs DesignJoy</a>
      <a href="/vs/penji" class="link link-hover">vs Penji</a>
      <a href="/vs/manypixels" class="link link-hover">vs ManyPixels</a>
      <a href="/vs/kimp" class="link link-hover">vs Kimp</a>
    </nav>
    <nav>
      <p class="footer-title font-bold text-sm uppercase tracking-wider opacity-60">Get Started</p>
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="link link-hover">Talk through similar work</a>
    </nav>
  </footer>
  <footer class="footer sm:footer-horizontal bg-base-300 text-base-content border-t border-base-300 px-10 py-4">
    <aside class="grid-flow-col items-center">
      <p>&copy; 2026 MyDesigner by <a href="https://sukratu.co" target="_blank" rel="noopener" class="link link-hover">Sukratu</a>. All rights reserved.</p>
    </aside>
    <nav class="md:place-self-center md:justify-self-end">
      <div class="grid grid-flow-col gap-4">
        <a href="https://x.com/mydesigner_gg" aria-label="X (Twitter)" class="link link-hover"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
        <a href="https://www.linkedin.com/showcase/mydesigner-sukratu/?viewAsMember=true" aria-label="LinkedIn" class="link link-hover"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 .774 0 .729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        <a href="https://instagram.com/mydesigner.gg" aria-label="Instagram" class="link link-hover"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></a>
      </div>
    </nav>
  </footer>`;

function filterTabs(activeSlug) {
  const tabs = [
    { label: 'All', href: '/portfolio' },
    { label: 'Product UI', href: '/portfolio/ui-ux-design' },
    { label: 'Websites & Builds', href: '/portfolio/web-development' },
    { label: 'Growth Creative', href: '/portfolio/graphic-design' },
    { label: 'Brand Systems', href: '/portfolio/branding' },
  ];
  return tabs.map(t => {
    const active = (activeSlug === null && t.href === '/portfolio') || t.href.endsWith(activeSlug)
      ? 'btn-active' : '';
    return `<a href="${t.href}" class="btn btn-sm ${active}">${t.label}</a>`;
  }).join('\n        ');
}

function projectCard(p) {
  const thumb = p.thumb.startsWith('http')
    ? p.thumb
    : p.thumb;
  return `
        <div>
          <a href="/work/${p.slug}" class="block group">
            <div class="card bg-base-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <figure class="overflow-hidden"><img src="${thumb}" width="800" height="450" alt="${p.title}" class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy"></figure>
              <div class="card-body p-4">
                <div class="badge badge-outline badge-sm">${p.badge}</div>
                <h3 class="card-title text-base mt-1">${p.title}</h3>
                <p class="text-sm text-base-content/60">${p.desc}</p>
                <p class="text-xs text-primary font-medium mt-1">View case study →</p>
              </div>
            </div>
          </a>
        </div>`;
}

function buildPage(cat) {
  const filtered = projects.filter(p => p.category === cat.key);
  const cards = filtered.map(projectCard).join('');
  const url = `https://mydesigner.gg/portfolio/${cat.slug}`;
  const proofItems = cat.proofPoints.map(point => `
          <li class="flex gap-3 rounded-box border border-base-300 bg-base-100 p-4">
            <span class="text-primary font-bold">&#10003;</span>
            <span>${point}</span>
          </li>`).join('');
  const serviceLinks = cat.services.map(([href, label]) =>
    `              <a href="${href}" class="btn btn-outline btn-sm">${label}</a>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-BJS1P09VE8"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());
    gtag("config", "G-BJS1P09VE8");
  </script>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
  <link rel="icon" type="image/png" href="/assets/images/favicon.png">
  <link rel="apple-touch-icon" href="/assets/images/favicon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cat.metaTitle}</title>
  <meta name="description" content="${cat.metaDesc}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${cat.metaTitle}">
  <meta property="og:description" content="${cat.metaDesc}">
  <meta property="og:image" content="https://mydesigner.gg/assets/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${cat.metaTitle}">
  <meta name="twitter:description" content="${cat.metaDesc}">
  <meta name="twitter:image" content="https://mydesigner.gg/assets/images/og-image.jpg">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://mydesigner.gg/"},
      {"@type": "ListItem", "position": 2, "name": "Portfolio", "item": "https://mydesigner.gg/portfolio"},
      {"@type": "ListItem", "position": 3, "name": "${cat.title}", "item": "${url}"}
    ]
  }
  </script>
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
    <header class="py-16 lg:py-24">
      <div class="max-w-4xl mx-auto px-4">
        <div class="breadcrumbs text-sm mb-8">
          <ul><li><a href="/">Home</a></li><li><a href="/portfolio">Portfolio</a></li><li>${cat.title}</li></ul>
        </div>
        <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">${cat.proofLabel}</span>
        <h1 class="text-4xl lg:text-5xl font-bold mt-3">${cat.heading}</h1>
        <p class="text-lg lg:text-xl opacity-70 mt-4 max-w-3xl">${cat.description}</p>
        <div class="flex flex-wrap gap-3 mt-7">
          <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-lg">Talk through similar work</a>
          <a href="/services" class="btn btn-outline btn-lg">See related services</a>
        </div>
      </div>
    </header>

    <section class="py-12 lg:py-16 bg-base-200">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
          <div>
            <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">What this category proves</span>
            <h2 class="text-3xl lg:text-4xl font-bold mt-2">${cat.proofTitle}</h2>
            <p class="text-base-content/70 mt-4 leading-relaxed">These projects show the taste, structure, and execution quality behind MyDesigner's AI-native creative-team model. The work itself may predate the current operating model, but it demonstrates the judgment and shipping discipline that the model now makes faster and more repeatable.</p>
          </div>
          <ul class="grid gap-3">
${proofItems}
          </ul>
        </div>
      </div>
    </section>

    <section class="py-12 lg:py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="max-w-3xl mb-8">
          <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">Browse proof</span>
          <h2 class="text-3xl lg:text-4xl font-bold mt-2">Case studies in this proof category</h2>
        </div>
        <div class="flex flex-wrap gap-2 justify-center mb-10">
        ${filterTabs(cat.slug)}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
${cards}
        </div>
      </div>
    </section>

    <section class="py-12 lg:py-16 bg-base-200">
      <div class="max-w-5xl mx-auto px-4">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body lg:grid lg:grid-cols-[0.42fr_0.58fr] gap-8">
            <div>
              <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">Client Memory</span>
              <h2 class="text-2xl lg:text-3xl font-bold mt-2">Portfolio range gets stronger when context compounds.</h2>
            </div>
            <div class="space-y-4 text-base-content/70 leading-relaxed">
              <p>Projects like these create reusable context: approved examples, visual patterns, decision history, templates, audience assumptions, and handoff notes. In MyDesigner's current operating model, that context becomes Client Memory - a living creative system that helps future assets start faster and stay closer to the brand.</p>
              <p>${cat.memory}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-12 lg:py-16">
      <div class="max-w-5xl mx-auto px-4">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">Related services</span>
            <h2 class="text-2xl lg:text-3xl font-bold mt-2">Turn this proof into the next thing your team needs to ship.</h2>
            <div class="flex flex-wrap gap-3 mt-5">
${serviceLinks}
              <a href="/services" class="btn btn-outline btn-sm">All services</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 lg:py-20 bg-neutral text-neutral-content">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-3xl lg:text-4xl font-bold">Want to ship work with this level of clarity and consistency?</h2>
        <p class="opacity-80 mt-4 mb-7 max-w-xl mx-auto">Bring the closest examples and the business goal. We will talk through what kind of creative system, sprint, or recurring support fits.</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-lg">Talk through similar work</a>
          <a href="/how-it-works" class="btn btn-outline btn-neutral-content btn-lg">See how it works</a>
        </div>
      </div>
    </section>
  </main>
${FOOTER}
  <script src="/js/main.js"></script>
</body>
</html>`;
}

let count = 0;
for (const cat of CATEGORIES) {
  const html = buildPage(cat);
  const outPath = path.join(OUT_DIR, `${cat.slug}.html`);
  fs.writeFileSync(outPath, html);
  const n = projects.filter(p => p.category === cat.key).length;
  console.log(`  portfolio/${cat.slug}.html (${n} projects)`);
  count++;
}

console.log(`Portfolio category pages: ${count} files written to /portfolio/`);

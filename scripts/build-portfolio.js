#!/usr/bin/env node

/**
 * build-portfolio.js
 * Generates ORBIT static-dark category pages from data/projects.js:
 *   portfolio/ui-ux-design.html
 *   portfolio/web-development.html
 *   portfolio/graphic-design.html
 *   portfolio/branding.html
 */

const fs = require('fs');
const path = require('path');

const projects = require('../data/projects');
const { escapeXml, ensureDir } = require('./lib/utils');
const NAV = require('./partials/nav');
const FOOTER = require('./partials/footer');
const { SITE_URL, headTags } = require('./partials/head');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'portfolio');
const CALENDAR_URL = 'https://calendar.app.google/xGoKb51qpbcnZgJy5';

const MEMORY_INTRO = "Projects like these create reusable context: approved examples, visual patterns, decision history, templates, audience assumptions, and handoff notes. In MyDesigner's current operating model, that context becomes Client Memory - a living creative system that helps future assets start faster and stay closer to the brand.";

const CATEGORIES = [
  {
    key: 'uiux',
    slug: 'ui-ux-design',
    label: 'Product UI',
    navLabel: 'Product UI',
    metaTitle: 'Product UI Portfolio — MyDesigner | AI-Native Creative Team',
    metaDesc: 'Explore product UI and UX case studies from MyDesigner: mobile apps, SaaS dashboards, web apps, and product interfaces shaped with clarity, hierarchy, and reusable patterns.',
    kicker: 'Product UI & UX proof',
    h1: 'Product UI proof for complex apps, dashboards, and workflows',
    lede: 'Mobile apps, SaaS dashboards, web apps, and product interfaces that show how MyDesigner brings clarity, hierarchy, and reusable UI patterns to complex product work.',
    proofTitle: 'Complex products become easier to trust when the interface has structure.',
    proofPoints: [
      'Product flows stay clearer when screens share a system.',
      'Dashboards, tables, onboarding, and mobile states need hierarchy, not decoration.',
      'Reusable UI decisions become context future product work can build from.'
    ],
    memoryDetail: 'For product UI work, Client Memory should preserve terminology, user roles, flows, component decisions, edge cases, and implementation constraints so future screens stay coherent.',
    related: [
      { href: '/services/web-app-design', label: 'Web app design' },
      { href: '/services/brand-identity', label: 'Brand identity' },
      { href: '/about', label: 'How Client Memory works' },
      { href: '/services', label: 'All services' }
    ]
  },
  {
    key: 'webdev',
    slug: 'web-development',
    label: 'Websites & Builds',
    navLabel: 'Websites & Builds',
    metaTitle: 'Website & Webflow Portfolio — MyDesigner | AI-Native Creative Team',
    metaDesc: 'Explore MyDesigner website, Webflow, and Framer work: responsive marketing sites, conversion pages, CMS builds, and launch-ready no-code execution.',
    kicker: 'Conversion website and no-code build proof',
    h1: 'Website and no-code build proof for teams that need to launch',
    lede: 'Webflow and Framer websites, conversion pages, and marketing sites that show structure, polish, responsive execution, and launch-ready handoff clarity.',
    proofTitle: 'A website is only useful when structure, polish, and handoff all survive launch.',
    proofPoints: [
      'Marketing pages need a clear story, not just a finished visual.',
      'Webflow and Framer builds should be responsive, editable, and launch-ready.',
      'Reusable sections and build decisions should make future pages faster.'
    ],
    memoryDetail: 'For website and build work, Client Memory should preserve page sections, CMS choices, launch checklists, brand rules, content patterns, animation preferences, and reusable components.',
    related: [
      { href: '/services/website-design', label: 'Website design' },
      { href: '/services/webflow-development', label: 'Webflow development' },
      { href: '/services/framer-development', label: 'Framer development' },
      { href: '/services', label: 'All services' }
    ]
  },
  {
    key: 'graphic',
    slug: 'graphic-design',
    label: 'Growth Creative',
    navLabel: 'Growth Creative',
    metaTitle: 'Growth Creative Portfolio — MyDesigner | Decks, Social & Campaign Assets',
    metaDesc: 'Explore MyDesigner growth creative work: pitch decks, presentation design, social assets, campaign graphics, and communication design for growing teams.',
    kicker: 'Growth creative and sales asset proof',
    h1: 'Growth creative proof for campaigns, decks, and communication assets',
    lede: 'Pitch decks, social assets, presentation design, and campaign creative that show how visual structure can make ideas easier to understand and ship.',
    proofTitle: 'Campaign and sales assets work better when clarity leads the design.',
    proofPoints: [
      'Decks and campaign assets need message structure, not just decoration.',
      'Reusable visual patterns help teams keep publishing without drifting off-brand.',
      'Growth creative should support testing, sales conversations, and launch rhythm.'
    ],
    memoryDetail: 'For growth and deck work, Client Memory should preserve audience assumptions, campaign learnings, slide patterns, narrative structure, proof points, content pillars, objections, and brand rules.',
    related: [
      { href: '/services/social-media-creatives', label: 'Growth creative' },
      { href: '/services/presentation-design', label: 'Presentation design' },
      { href: '/services/brand-identity', label: 'Brand identity' },
      { href: '/services', label: 'All services' }
    ]
  },
  {
    key: 'branding',
    slug: 'branding',
    label: 'Brand Systems',
    navLabel: 'Brand Systems',
    metaTitle: 'Brand System Portfolio — MyDesigner | Brand Identity & Logo Design',
    metaDesc: 'Explore MyDesigner brand system work: identity systems, logo design, visual rules, examples, and reusable brand patterns for growing companies.',
    kicker: 'Brand system proof',
    h1: 'Brand system proof for identities that need to scale into future assets',
    lede: 'Brand identity, logo design, visual systems, and product-brand foundations that create rules, examples, and reusable patterns for future creative work.',
    proofTitle: 'A useful brand system gives future creative work something to build from.',
    proofPoints: [
      'Brand work is more than a logo or static style guide.',
      'Usable identities create rules, examples, and repeatable creative patterns.',
      'Strong systems make web, product, sales, and campaign assets easier to ship.'
    ],
    memoryDetail: 'For brand work, Client Memory should preserve visual rules, logo usage, typography, color, examples, tone, templates, prompt-ready constraints, and quality-control references.',
    related: [
      { href: '/services/brand-identity', label: 'Brand identity' },
      { href: '/services/social-media-creatives', label: 'Growth creative' },
      { href: '/services/website-design', label: 'Website design' },
      { href: '/services', label: 'All services' }
    ]
  }
];

function categoryNav(activeSlug) {
  return CATEGORIES.map((category) => {
    const active = category.slug === activeSlug ? ' btn--solid' : ' btn--ghost';
    return `          <a href="/portfolio/${category.slug}" class="btn${active}">${escapeXml(category.navLabel)}</a>`;
  }).join('\n');
}

function renderProofPoints(points) {
  return points.map((point) => `            <li>${escapeXml(point)}</li>`).join('\n');
}

function renderProjectCards(items) {
  return items.map((project) => `          <a href="/work/${project.slug}" class="project-card">
            <figure class="project-card__media">
              <img src="${project.thumb}" alt="${escapeXml(project.title)}" loading="lazy">
            </figure>
            <div class="project-card__body">
              <span class="project-card__tag">${escapeXml(project.badge)}</span>
              <h3>${escapeXml(project.title)}</h3>
              <p>${escapeXml(project.desc)}</p>
              <span class="project-card__link">View case study &rarr;</span>
            </div>
          </a>`).join('\n');
}

function renderRelatedLinks(links) {
  return links.map((link) => `            <a href="${escapeXml(link.href)}" class="btn btn--ghost">${escapeXml(link.label)} <span class="arrow">-&gt;</span></a>`).join('\n');
}

function breadcrumbSchema(category) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Portfolio', item: `${SITE_URL}/portfolio` },
      { '@type': 'ListItem', position: 3, name: category.label, item: `${SITE_URL}/portfolio/${category.slug}` }
    ]
  };
}

function buildPortfolioCategoryPage(category) {
  const categoryProjects = projects.filter((project) => project.category === category.key);
  const canonicalPath = `/portfolio/${category.slug}`;

  return `<!DOCTYPE html>
<html lang="en" class="static">
<head>
${headTags({
    title: category.metaTitle,
    description: category.metaDesc,
    canonical: canonicalPath,
    schema: breadcrumbSchema(category)
  })}
</head>
<body class="orbit-static">
  ${NAV}
  <div class="grain"></div>
  <div class="vignette"></div>
  <main>
    <header class="deep-hero">
      <div class="deep-hero__inner">
        <nav class="crumbs" aria-label="Breadcrumb">
          <span><a href="/">Home</a></span>
          <span><a href="/portfolio">Portfolio</a></span>
          <span>${escapeXml(category.label)}</span>
        </nav>
        <p class="kicker">${escapeXml(category.kicker)}</p>
        <h1>${escapeXml(category.h1)}</h1>
        <p class="deep-hero__lede">${escapeXml(category.lede)}</p>
        <div class="cta-row">
          <a href="${CALENDAR_URL}" class="btn btn--solid">Talk through similar work <span class="arrow">-&gt;</span></a>
          <a href="/services" class="btn btn--ghost">See related services <span class="arrow">-&gt;</span></a>
        </div>
      </div>
    </header>

    <section class="deep-section deep-section--tint">
      <div class="shell">
        <div class="orbit-card orbit-card--split">
          <div>
            <p class="kicker">What this category proves</p>
            <h2 class="section-title">${escapeXml(category.proofTitle)}</h2>
            <p class="section-copy">These projects show the taste, structure, and execution quality behind MyDesigner's AI-native creative-team model. The work itself may predate the current operating model, but it demonstrates the judgment and shipping discipline that the model now makes faster and more repeatable.</p>
          </div>
          <ul class="check-list deep-grid">
${renderProofPoints(category.proofPoints)}
          </ul>
        </div>
      </div>
    </section>

    <section class="deep-section">
      <div class="shell">
        <div class="section-head">
          <p class="kicker">Browse proof</p>
          <h2 class="section-title">Case studies in this proof category</h2>
        </div>
        <div class="cta-row" aria-label="Portfolio categories">
          <a href="/portfolio" class="btn btn--ghost">All</a>
${categoryNav(category.slug)}
        </div>
        <div class="deep-grid deep-grid--3" style="margin-top:2rem;">
${renderProjectCards(categoryProjects)}
        </div>
      </div>
    </section>

    <section class="deep-section deep-section--tint">
      <div class="shell">
        <div class="orbit-card orbit-card--split">
          <div>
            <p class="kicker">Client Memory</p>
            <h2 class="section-title">Portfolio range gets stronger when context compounds.</h2>
          </div>
          <div>
            <p>${escapeXml(MEMORY_INTRO)}</p>
            <p>${escapeXml(category.memoryDetail)}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="deep-section">
      <div class="shell">
        <div class="orbit-card">
          <p class="kicker">Related services</p>
          <h2 class="section-title">Turn this proof into the next thing your team needs to ship.</h2>
          <div class="cta-row">
${renderRelatedLinks(category.related)}
          </div>
        </div>
      </div>
    </section>

    <section class="deep-section finale">
      <div class="shell">
        <p class="kicker">Next orbit</p>
        <h2 class="finale-h">Want to ship work with this level of clarity and consistency?</h2>
        <p class="section-copy" style="margin-left:auto;margin-right:auto;">Bring the closest examples and the business goal. We will talk through what kind of creative system, sprint, or recurring support fits.</p>
        <div class="cta-row">
          <a href="${CALENDAR_URL}" class="btn btn--solid">Talk through similar work <span class="arrow">-&gt;</span></a>
          <a href="/about" class="btn btn--ghost">See how it works <span class="arrow">-&gt;</span></a>
        </div>
      </div>
    </section>
  </main>
  ${FOOTER}
</body>
</html>`;
}

function buildPortfolioPages() {
  ensureDir(OUT_DIR);
  CATEGORIES.forEach((category) => {
    const html = buildPortfolioCategoryPage(category);
    fs.writeFileSync(path.join(OUT_DIR, `${category.slug}.html`), html);
    console.log(`Built portfolio page: portfolio/${category.slug}.html`);
  });
}

if (require.main === module) {
  buildPortfolioPages();
}

module.exports = { CATEGORIES, buildPortfolioCategoryPage, buildPortfolioPages };

#!/usr/bin/env node

/**
 * Build ORBIT service detail pages.
 */

const fs = require('fs');
const path = require('path');

const PROJECTS = require('../data/projects');
const { escapeXml, ensureDir } = require('./lib/utils');
const NAV = require('./partials/nav');
const FOOTER = require('./partials/footer');
const { SITE_URL, headTags } = require('./partials/head');

const SERVICES_DIR = path.join(process.cwd(), 'services');

const MEMORY_INTRO = 'Your brand rules, examples, reusable patterns, past decisions, prompts, templates, and performance learnings should not disappear after each request. MyDesigner turns that context into a living creative system so every new asset starts faster and stays closer to your brand.';
const CALENDAR_URL = 'https://calendar.app.google/xGoKb51qpbcnZgJy5';

const SERVICE_CONFIGS = [
  {
    slug: 'framer-development',
    label: 'Framer Development',
    category: 'webdev',
    platform: 'framer',
    metaTitle: 'Framer Development — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Fast, polished Framer websites with responsive layouts, motion, CMS structure, and brand-consistent execution for launches and modern teams. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    kicker: 'Interactive website build',
    h1: 'Framer development for polished marketing sites and launch pages',
    subheadline: 'Fast, polished Framer websites with responsive layouts, motion, CMS structure, and brand-consistent execution for launches and modern teams.',
    fit: 'Best when speed, visual polish, interaction quality, and flexible page production matter more than heavy enterprise CMS complexity.',
    included: [
      'Design-to-Framer implementation',
      'Responsive layouts for key breakpoints',
      'Framer CMS setup where useful',
      'Motion, transitions, and micro-interactions',
      'SEO metadata and launch setup',
      'Handoff documentation and editable structure'
    ],
    memoryDetail: 'Client Memory should store motion preferences, page patterns, brand rules, CMS choices, reusable sections, and launch notes so future Framer pages stay consistent.',
    related: [
      { href: '/services/website-design', label: 'Website design' },
      { href: '/services/webflow-development', label: 'Webflow development' },
      { href: '/portfolio', label: 'View related work' },
      { href: '/services', label: 'All services' }
    ],
    faq: [
      { q: 'When should we choose Framer instead of Webflow?', a: 'Framer is strong for fast, polished marketing sites and interactive launch pages. Webflow may fit deeper CMS and operational workflows better.' },
      { q: 'Can you migrate an existing site to Framer?', a: 'Yes, when the scope is clear. Complex sites should start with a discovery pass so migration risk is understood.' },
      { q: 'Can the team edit after handoff?', a: 'Yes. We structure Framer pages and CMS areas so your team can edit content after launch.' },
      { q: 'How does Client Memory help Framer work?', a: 'It stores reusable page patterns, brand rules, interactions, and prior decisions so new pages do not drift.' }
    ]
  },
  {
    slug: 'webflow-development',
    label: 'Webflow Development',
    category: 'webdev',
    platform: 'webflow',
    metaTitle: 'Webflow Development — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Responsive, CMS-ready Webflow builds for marketing sites, landing pages, and content systems — designed for speed, polish, and handoff clarity. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    kicker: 'Conversion website build',
    h1: 'Webflow development for websites your team can actually ship and manage',
    subheadline: 'Responsive, CMS-ready Webflow builds for marketing sites, landing pages, and content systems — designed for speed, polish, and handoff clarity.',
    fit: 'Best when you have a Figma design to build, need design plus Webflow execution, or want a marketing site your team can edit after launch.',
    included: [
      'Figma-to-Webflow implementation',
      'Responsive build across breakpoints',
      'CMS structure and content modelling',
      'Animations and interaction polish',
      'SEO, Open Graph, sitemap, and launch basics',
      'Staging review and production handoff'
    ],
    memoryDetail: 'Client Memory should store CMS structure, component decisions, animation preferences, brand rules, launch checklist, reusable page sections, and previous site decisions.',
    related: [
      { href: '/services/website-design', label: 'Website design' },
      { href: '/services/framer-development', label: 'Framer development' },
      { href: '/portfolio', label: 'View related work' },
      { href: '/services', label: 'All services' }
    ],
    faq: [
      { q: 'Do you only build, or also design?', a: 'Both are possible. MyDesigner can build from supplied Figma files or handle design plus Webflow execution when the scope calls for it.' },
      { q: 'Will our team be able to edit the site?', a: 'Yes. Webflow Editor and CMS setup can give your team operational independence after launch.' },
      { q: 'Can you support launches and campaign pages after the main site?', a: 'Yes. Once the system exists, Client Memory helps future pages ship faster and stay more consistent.' },
      { q: 'Do you handle integrations?', a: 'We can support common website integrations such as forms, CRM embeds, analytics, and marketing tools. Custom backend work should be scoped separately.' }
    ]
  },
  {
    slug: 'web-app-design',
    label: 'Web App Design',
    category: 'uiux',
    metaTitle: 'Web App Design — MyDesigner | AI-Native Creative Team',
    metaDescription: 'SaaS dashboards, internal tools, portals, and product interfaces designed with clarity, hierarchy, and continuity across every screen. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    kicker: 'Product UI & UX support',
    h1: 'Web app design that makes complex products easier to use',
    subheadline: 'SaaS dashboards, internal tools, portals, and product interfaces designed with clarity, hierarchy, and continuity across every screen.',
    fit: 'Best when a founder, product team, or engineering team needs sharper product UI, clearer flows, better dashboard structure, or a Figma system developers can actually use.',
    included: [
      'User-flow and information-architecture support',
      'Wireframes for high-risk flows',
      'High-fidelity Figma UI design',
      'Dashboard and table design systems',
      'Reusable components and interaction states',
      'Developer-ready specs and handoff notes'
    ],
    memoryDetail: 'Client Memory should capture product terminology, user roles, flows, design-system rules, edge cases, prior UX decisions, and implementation constraints so new screens stay coherent.',
    related: [
      { href: '/services/brand-identity', label: 'Brand identity' },
      { href: '/portfolio', label: 'View product work' },
      { href: '/about', label: 'How the workflow runs' },
      { href: '/services', label: 'All services' }
    ],
    faq: [
      { q: 'Do you replace product research?', a: 'No. MyDesigner can work from existing research, customer insights, product notes, and stakeholder context. Full research work should be scoped separately.' },
      { q: 'Can you work inside our existing design system?', a: 'Yes. We can absorb current components, constraints, usage rules, and prior design decisions into Client Memory so new work stays consistent.' },
      { q: 'Can engineering use the files directly?', a: 'Yes. The output can include developer-ready Figma files, component states, and handoff notes for implementation.' },
      { q: 'How do you keep product screens consistent over time?', a: 'Client Memory stores flows, components, patterns, and past decisions so future UI requests do not reset context.' }
    ]
  },
  {
    slug: 'website-design',
    label: 'Website Design',
    category: 'uiux',
    metaTitle: 'Website Design — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Marketing websites, campaign pages, and landing pages shaped by strategy, brand context, and conversion logic — not just pretty screens. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    kicker: 'Conversion websites & landing pages',
    h1: 'Website design for teams that need to turn attention into action',
    subheadline: 'Marketing websites, campaign pages, and landing pages shaped by strategy, brand context, and conversion logic — not just pretty screens.',
    fit: 'Best when a team needs a clearer website, a launch page, a campaign landing page, or a redesign that must explain the offer and move visitors toward action.',
    included: [
      'Messaging and page-structure direction before design',
      'Homepage, landing page, and key conversion-page design',
      'Mobile-first responsive layouts',
      'CTA hierarchy and section sequencing',
      'Brand-aligned visual system in Figma',
      'Developer-ready handoff or Webflow/Framer build path'
    ],
    memoryDetail: 'Client Memory should store your offer, ICP, proof points, previous landing pages, brand rules, conversion notes, and pages that have already worked, so every new page starts with context instead of a blank brief.',
    related: [
      { href: '/services/webflow-development', label: 'Webflow development' },
      { href: '/services/framer-development', label: 'Framer development' },
      { href: '/portfolio', label: 'View proof' },
      { href: '/#ch-plans', label: 'See operating rhythms' },
      { href: '/services', label: 'All services' }
    ],
    faq: [
      { q: 'Is this just visual website design?', a: 'No. This is conversion website design: message hierarchy, offer clarity, section flow, CTA logic, and brand-consistent visual execution.' },
      { q: 'Can you design landing pages for campaigns?', a: 'Yes. Landing pages are one of the clearest fits because they benefit from fast creative execution plus stored context about your audience, offer, and brand.' },
      { q: 'Can this include Webflow or Framer development?', a: 'Yes. If build is needed, MyDesigner can connect the design work to a Webflow or Framer build path.' },
      { q: 'How does Client Memory help website work?', a: 'It keeps the offer, proof, audience, brand rules, prior page decisions, and reusable sections available for future pages and iterations.' }
    ]
  },
  {
    slug: 'brand-identity',
    label: 'Brand Identity',
    category: 'branding',
    metaTitle: 'Brand Identity — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Logos, visual systems, guidelines, examples, templates, and usable rules that help your team create consistently across web, product, sales, and campaigns. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    kicker: 'AI-ready brand system',
    h1: 'Brand identity systems that make every future asset easier to ship',
    subheadline: 'Logos, visual systems, guidelines, examples, templates, and usable rules that help your team create consistently across web, product, sales, and campaigns.',
    fit: 'Best when a company is launching, refreshing, cleaning up inconsistent visuals, or preparing to use AI and templates without breaking brand consistency.',
    included: [
      'Logo direction and identity refinement',
      'Color, typography, and visual-language system',
      'Brand guidelines and usage rules',
      'Template starters for key channels',
      'Source files and export-ready assets',
      'Prompt-ready brand examples for future creative production'
    ],
    memoryDetail: 'Brand identity is not only a logo deliverable. It becomes the foundation for future creative decisions, AI prompts, templates, examples, and quality control inside Client Memory.',
    related: [
      { href: '/services/social-media-creatives', label: 'Growth creative' },
      { href: '/services/website-design', label: 'Website design' },
      { href: '/about', label: 'How Client Memory works' },
      { href: '/services', label: 'All services' }
    ],
    faq: [
      { q: 'Is this only logo design?', a: 'No. Logos can be included, but the goal is a usable brand system that helps every future asset stay consistent.' },
      { q: 'Can you refresh an existing brand?', a: 'Yes. A refresh can modernize the identity while preserving the recognition and equity that should not change.' },
      { q: 'Do you create brand guidelines?', a: 'Yes. Guidelines can include practical rules, examples, templates, and AI-ready prompts where appropriate.' },
      { q: 'How does this help with AI content creation?', a: 'A clear brand system gives AI tools constraints, examples, and rules so output gets closer to your brand instead of becoming generic.' }
    ]
  },
  {
    slug: 'presentation-design',
    label: 'Presentation Design',
    category: 'graphic',
    metaTitle: 'Presentation Design — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Investor decks, sales decks, strategy presentations, and internal narratives structured for clarity, trust, and decision-making. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    kicker: 'Decks & sales assets',
    h1: 'Presentation design that helps complex ideas land clearly',
    subheadline: 'Investor decks, sales decks, strategy presentations, and internal narratives structured for clarity, trust, and decision-making.',
    fit: 'Best when the team has a story to tell — fundraising, sales, partnership, strategy, product, or internal alignment — and needs the deck to feel sharp and easy to follow.',
    included: [
      'Narrative and slide-structure cleanup',
      'Slide layout and visual hierarchy',
      'Data visualization and infographic design',
      'Brand-aligned diagrams, icons, and visual systems',
      'PowerPoint, Keynote, Google Slides, or Figma delivery',
      'Reusable slide patterns for future decks'
    ],
    memoryDetail: 'Client Memory should store the company narrative, positioning, proof points, product explanations, previous deck patterns, common objections, and brand rules so future decks improve instead of restarting.',
    related: [
      { href: '/services/brand-identity', label: 'Brand identity' },
      { href: '/services/social-media-creatives', label: 'Growth creative' },
      { href: '/portfolio', label: 'View related work' },
      { href: '/services', label: 'All services' }
    ],
    faq: [
      { q: 'Do you write the deck or only design it?', a: 'MyDesigner can sharpen structure and clarity around content you provide. Full copywriting or strategy depth depends on the scope.' },
      { q: 'Can you redesign an existing pitch deck?', a: 'Yes. This is one of the strongest use cases: making existing thinking sharper, more visual, and easier to present.' },
      { q: 'Can you make reusable templates?', a: 'Yes. Reusable slide patterns can be stored in Client Memory so future sales and founder communication gets faster.' },
      { q: 'Which formats do you deliver?', a: 'We can deliver PowerPoint, Keynote, Google Slides, or Figma files depending on how your team presents and edits.' }
    ]
  },
  {
    slug: 'booth-designs',
    label: 'Booth & Exhibition Design',
    category: 'graphic',
    metaTitle: 'Booth & Exhibition Design — MyDesigner | AI-Native Creative Team',
    metaDescription: 'Trade show booths, banners, handouts, display assets, and event graphics designed as one coherent brand experience before the deadline hits. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    kicker: 'Event & offline campaign creative',
    h1: 'Booth and exhibition design that carries your brand into the room',
    subheadline: 'Trade show booths, banners, handouts, display assets, and event graphics designed as one coherent brand experience before the deadline hits.',
    fit: 'Best when an event, expo, booth, or sales presence needs high-clarity visuals, print-ready assets, and consistent messaging across physical touchpoints.',
    included: [
      'Booth backdrop and display graphics',
      'Pull-up banners and event signage',
      'Flyers, brochures, handouts, and leave-behinds',
      'Name badges, table covers, and supporting assets',
      'Print-ready files with bleed and resolution checks',
      'Event message hierarchy and asset consistency'
    ],
    memoryDetail: 'Client Memory should store event goals, booth dimensions, vendor specs, audience, offers, brand rules, previous event assets, and print constraints so recurring events get easier.',
    related: [
      { href: '/services/presentation-design', label: 'Presentation design' },
      { href: '/services/brand-identity', label: 'Brand identity' },
      { href: CALENDAR_URL, label: 'Talk through an event need' },
      { href: '/services', label: 'All services' }
    ],
    faq: [
      { q: 'Do you print the materials?', a: 'MyDesigner supplies print-ready design files and can support specs where possible. Printing is handled by your chosen vendor.' },
      { q: 'Can you work with tight event deadlines?', a: 'Yes, depending on priority and scope. Share vendor specs and deadlines immediately so the work can be planned realistically.' },
      { q: 'Can you adapt one booth system into many sizes?', a: 'Yes. This is a strong consistency use case because one event system can become banners, handouts, table assets, and other formats.' },
      { q: 'How does Client Memory help event work?', a: 'It preserves specs, message hierarchy, reusable event assets, brand rules, and print constraints for future booths and campaigns.' }
    ]
  },
  {
    slug: 'social-media-creatives',
    label: 'Social Media Design',
    category: 'graphic',
    metaTitle: 'Social Media Design — MyDesigner | AI-Native Creative Team',
    metaDescription: 'LinkedIn, Instagram, X, ad creative, carousels, covers, and campaign assets produced with brand consistency and enough variation to keep testing. Work with an AI-native creative team that stores context in Client Memory so future work gets faster and more consistent.',
    kicker: 'Growth campaign creative',
    h1: 'Social media creatives that keep campaigns moving without losing the brand',
    subheadline: 'LinkedIn, Instagram, X, ad creative, carousels, covers, and campaign assets produced with brand consistency and enough variation to keep testing.',
    fit: 'Best when a growth, founder, or marketing team needs steady creative output for campaigns, launches, content, ads, and experiments.',
    included: [
      'Platform-specific post and carousel designs',
      'Ad creative variations for testing',
      'Founder/content asset templates',
      'Story, reel, and cover graphics',
      'Editable Figma or Canva templates where useful',
      'Campaign-level visual consistency across batches'
    ],
    memoryDetail: 'Client Memory should store audience, offers, campaign learnings, content pillars, visual rules, winning examples, past assets, and channel preferences so creative variation stays on-brand.',
    related: [
      { href: '/services/brand-identity', label: 'Brand identity' },
      { href: '/services/presentation-design', label: 'Decks and sales assets' },
      { href: '/#ch-plans', label: 'See operating rhythms' },
      { href: '/services', label: 'All services' }
    ],
    faq: [
      { q: 'How many posts can we get?', a: 'Output depends on the operating rhythm: one focused lane, parallel growth execution, or a sprint depending on the priority and complexity.' },
      { q: 'Can you design ad variations?', a: 'Yes. MyDesigner can create structured creative variation for testing while keeping the campaign connected to your brand.' },
      { q: 'Can our team edit the templates?', a: 'Yes. Editable Figma or Canva templates can help your team adapt recurring formats without losing consistency.' },
      { q: 'How do you avoid everything looking generic?', a: 'Human taste plus Client Memory. Stored examples, rules, channel preferences, and performance learnings guide every batch.' }
    ]
  }
];

function renderList(items) {
  return items.map((item) => `          <li>${escapeXml(item)}</li>`).join('\n');
}

function renderProjectCards(projects) {
  if (!projects.length) {
    return '          <p class="section-copy">Related work is being prepared for this capability.</p>';
  }

  return projects.map((project) => `          <a href="/work/${project.slug}" class="project-card">
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
  return links.map((link) => `              <a href="${escapeXml(link.href)}" class="btn btn--ghost">${escapeXml(link.label)} <span class="arrow">-&gt;</span></a>`).join('\n');
}

function renderFaq(faq, label) {
  return faq.map((item, index) => `          <details${index === 0 ? ' open' : ''}>
            <summary>${escapeXml(item.q)}</summary>
            <p>${escapeXml(item.a)}</p>
          </details>`).join('\n');
}

function buildSchemas(config, canonicalUrl) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
      { '@type': 'ListItem', position: 3, name: config.label, item: canonicalUrl }
    ]
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: config.label,
    provider: { '@type': 'Organization', name: 'MyDesigner', url: SITE_URL },
    name: `${config.label} — MyDesigner`,
    description: config.subheadline,
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    offers: {
      '@type': 'Offer',
      price: '1400',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '1400',
        priceCurrency: 'USD',
        unitText: 'month'
      },
      description: 'Transparent creative sprint, subscription, and partner options based on the operating rhythm your team needs.'
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };

  return [breadcrumbSchema, serviceSchema, faqSchema];
}

function buildServicePage(config) {
  const categoryProjects = PROJECTS.filter((project) =>
    project.category === config.category && (!config.platform || project.platform === config.platform)
  );
  const canonicalPath = `/services/${config.slug}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const schemas = buildSchemas(config, canonicalUrl);

  return `<!DOCTYPE html>
<html lang="en" class="static">
<head>
${headTags({
    title: config.metaTitle,
    description: config.metaDescription,
    canonical: canonicalPath,
    schema: schemas,
    extra: '  <link rel="alternate" type="application/rss+xml" title="MyDesigner Blog RSS" href="https://mydesigner.gg/rss.xml">'
  })}
</head>
<body class="orbit-static">
  ${NAV}
  <div class="grain"></div>
  <div class="vignette"></div>
  <main>
    <header class="deep-hero" data-hero>
      <div class="deep-hero__inner">
        <nav class="crumbs" aria-label="Breadcrumb">
          <span><a href="/">Home</a></span>
          <span><a href="/services">Services</a></span>
          <span>${escapeXml(config.label)}</span>
        </nav>
        <p class="kicker">${escapeXml(config.kicker)}</p>
        <h1>${escapeXml(config.h1)}</h1>
        <p class="deep-hero__lede">${escapeXml(config.subheadline)}</p>
        <div class="cta-row">
          <a href="${CALENDAR_URL}" class="btn btn--solid">Talk through this work <span class="arrow">-&gt;</span></a>
          <a href="#related-work" class="btn btn--ghost">See related work <span class="arrow">-&gt;</span></a>
        </div>
      </div>
    </header>

    <section class="deep-section deep-section--tint">
      <div class="shell">
        <div class="orbit-card orbit-card--split">
          <div>
            <p class="kicker">Use this when</p>
            <h2 class="section-title">This capability fits a specific bottleneck.</h2>
          </div>
          <p class="section-copy">${escapeXml(config.fit)}</p>
        </div>
      </div>
    </section>

    <section class="deep-section">
      <div class="shell">
        <div class="section-head section-head--center">
          <p class="kicker">What MyDesigner helps ship</p>
          <h2 class="section-title">Concrete outputs, not vague design help.</h2>
        </div>
        <ul class="check-list deep-grid deep-grid--2">
${renderList(config.included)}
        </ul>
      </div>
    </section>

    <section class="deep-section deep-section--tint">
      <div class="shell">
        <div class="deep-grid deep-grid--2">
          <div class="orbit-card">
            <p class="kicker">How this work runs</p>
            <h2 class="section-title">A shipping rhythm with human taste.</h2>
            <ol class="step-list">
              <li><strong>1. Diagnose</strong> the creative bottleneck.</li>
              <li><strong>2. Gather</strong> the context that affects quality.</li>
              <li><strong>3. Create</strong> the first direction quickly.</li>
              <li><strong>4. Review</strong> with human taste and business judgment.</li>
              <li><strong>5. Ship</strong> the asset and store the learning in Client Memory.</li>
            </ol>
          </div>
          <div class="orbit-card">
            <p class="kicker">Client Memory</p>
            <h2 class="section-title">Every engagement builds Client Memory.</h2>
            <p>${escapeXml(MEMORY_INTRO)}</p>
            <p>${escapeXml(config.memoryDetail)}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="deep-section" id="related-work">
      <div class="shell">
        <div class="section-head">
          <p class="kicker">Related work</p>
          <h2 class="section-title">Proof that connects to ${escapeXml(config.kicker.toLowerCase())}</h2>
          <p class="section-copy">These projects show the taste, structure, and execution quality MyDesigner now makes faster and more repeatable through the AI-native creative-team model.</p>
        </div>
        <div class="deep-grid deep-grid--3">
${renderProjectCards(categoryProjects)}
        </div>
      </div>
    </section>

    <section class="deep-section deep-section--tint">
      <div class="shell">
        <div class="orbit-card">
          <p class="kicker">Related paths</p>
          <h2 class="section-title">Keep exploring the capability architecture.</h2>
          <div class="cta-row">
${renderRelatedLinks(config.related)}
          </div>
        </div>
      </div>
    </section>

    <section class="deep-section">
      <div class="shell">
        <div class="section-head section-head--center">
          <p class="kicker">FAQ</p>
          <h2 class="section-title">${escapeXml(config.label)} — Questions Answered</h2>
        </div>
        <div class="faq-list">
${renderFaq(config.faq, config.label)}
        </div>
      </div>
    </section>

    <section class="deep-section finale">
      <div class="shell">
        <p class="kicker">Next orbit</p>
        <h2 class="finale-h">Want to see if this is the right work to ship next?</h2>
        <p class="section-copy" style="margin-left:auto;margin-right:auto;">Bring the bottleneck, examples, and current context. We will help you decide whether this should be a sprint, a focused lane, or part of a larger creative operating rhythm.</p>
        <div class="cta-row">
          <a href="${CALENDAR_URL}" class="btn btn--solid">Talk through this work <span class="arrow">-&gt;</span></a>
          <a href="/#ch-plans" class="btn btn--ghost">See operating rhythms <span class="arrow">-&gt;</span></a>
        </div>
      </div>
    </section>
  </main>
  ${FOOTER}
</body>
</html>`;
}

function buildServicePages() {
  ensureDir(SERVICES_DIR);
  SERVICE_CONFIGS.forEach((config) => {
    const html = buildServicePage(config);
    const outputPath = path.join(SERVICES_DIR, `${config.slug}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`Built service page: services/${config.slug}.html`);
  });
}

if (require.main === module) {
  buildServicePages();
}

module.exports = { buildServicePage, buildServicePages, SERVICE_CONFIGS };

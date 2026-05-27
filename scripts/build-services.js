#!/usr/bin/env node

/**
 * Build service pages.
 * Extracted from build-blog.js for better maintainability.
 */

const fs = require('fs');
const path = require('path');

const PROJECTS = require('../data/projects');
const { escapeXml, ensureDir } = require('./lib/utils');

const SERVICES_DIR = path.join(process.cwd(), 'services');
const SITE_URL = 'https://mydesigner.gg';

const SERVICE_CONFIGS = [
  {
    slug: 'framer-development',
    label: 'Framer Development',
    category: 'webdev',
    platform: 'framer',
    valuerop: 'Pixel-Perfect Framer Sites, Fast',
    subheadline: 'We build blazing-fast, fully responsive Framer websites — designed to convert and built to scale.',
    metaDescription: 'High-performance Framer websites with smooth animations and interactions, built by subscription. Unlimited Framer development included from $1,400/mo.',
    included: [
      'Custom Framer component design & build',
      'Responsive layouts (mobile, tablet, desktop)',
      'CMS integration & dynamic collections',
      'Animations & micro-interactions',
      'SEO meta, sitemap & performance optimisation',
      'Source files & hand-off documentation'
    ],
    faq: [
      { q: 'Do you work from existing designs or start from scratch?', a: 'Both. We can build directly in Framer from your Figma files or create the design and development end-to-end.' },
      { q: 'How long does a typical Framer project take?', a: 'A standard marketing site is usually delivered within 5–10 business days on the Starter plan. Turnaround depends on scope and your plan\'s concurrency.' },
      { q: 'Will the site be editable by our team after handoff?', a: 'Yes. We set up Framer CMS and component structures so your non-technical team can update content without touching code.' },
      { q: 'Can you migrate an existing website to Framer?', a: 'Absolutely. We handle full migrations, preserving URL structures, SEO metadata, and visual design during the transition.' }
    ]
  },
  {
    slug: 'webflow-development',
    label: 'Webflow Development',
    category: 'webdev',
    platform: 'webflow',
    valuerop: 'Production-Ready Webflow Sites',
    subheadline: 'We design and develop high-converting Webflow websites that your team can manage without a developer.',
    metaDescription: 'Pixel-perfect Webflow sites built as part of your design subscription — CMS setup, animations, and responsive design included. From $1,400/mo, cancel anytime.',
    included: [
      'Custom Webflow design & development',
      'Responsive across all breakpoints',
      'Webflow CMS setup & content modelling',
      'Interactions, animations & scroll effects',
      'SEO meta, Open Graph & sitemap configuration',
      'Staging review & production launch support'
    ],
    faq: [
      { q: 'Do you build from Figma designs or design in Webflow directly?', a: 'We do both. Share your Figma files and we\'ll build pixel-perfectly in Webflow, or we\'ll handle the full design-to-development workflow.' },
      { q: 'Can we edit the site ourselves after launch?', a: 'Yes. Webflow\'s Editor makes it easy for non-technical teams to update copy, images, and CMS content without touching the Designer.' },
      { q: 'Do you handle Webflow hosting and publishing?', a: 'We configure and publish to Webflow Hosting or help you connect a custom domain. We can also assist with Netlify or Cloudflare deployments.' },
      { q: 'What about integrations like HubSpot or Mailchimp?', a: 'We regularly integrate Webflow sites with HubSpot, Mailchimp, Zapier, Memberstack, and other SaaS tools as part of the subscription.' }
    ]
  },
  {
    slug: 'web-app-design',
    label: 'Web App Design',
    category: 'uiux',
    valuerop: 'UX That Converts & Retains',
    subheadline: 'We design intuitive web application interfaces that reduce friction, improve retention, and look exceptional.',
    metaDescription: 'SaaS dashboards, admin panels, and web app interfaces designed for clarity and conversion — unlimited UI/UX design requests included in every MyDesigner plan.',
    included: [
      'User flows & information architecture',
      'Wireframes & interactive prototypes',
      'High-fidelity UI design in Figma',
      'Design system & component library',
      'Usability review & iteration',
      'Developer-ready Figma handoff'
    ],
    faq: [
      { q: 'Do you conduct user research as part of this service?', a: 'We provide UX audits and heuristic reviews within the subscription. Full user research studies are scoped separately on request.' },
      { q: 'What tools do you use for web app design?', a: 'Figma is our primary tool for all UI/UX work. We deliver interactive prototypes, auto-layout components, and full design tokens.' },
      { q: 'Can you work within our existing design system?', a: 'Yes. We frequently extend and apply existing design systems and component libraries rather than starting from scratch.' },
      { q: 'How many screens or flows can we expect per month?', a: 'Output varies by complexity, but on the Starter plan clients typically see 10–20 unique screens per month with full revisions included.' }
    ]
  },
  {
    slug: 'website-design',
    label: 'Website Design',
    category: 'uiux',
    valuerop: 'Websites That Build Trust & Drive Leads',
    subheadline: 'We design conversion-focused websites that communicate your brand\'s value clearly and look great on every device.',
    metaDescription: 'Marketing websites and landing pages designed to convert — included in every MyDesigner plan. Request as many designs as you need, with unlimited revisions.',
    included: [
      'Homepage & key page design (up to 8 pages)',
      'Mobile-first responsive layouts',
      'Brand-aligned visual design & typography',
      'CTA strategy & conversion-focused structure',
      'Prototype for stakeholder review',
      'Figma source files & style guide'
    ],
    faq: [
      { q: 'Is development included in website design?', a: 'UI/UX design delivers Figma files ready for development. If you also need Webflow or Framer development, that\'s included in the same subscription — just add the request.' },
      { q: 'How many pages are included?', a: 'A standard engagement covers up to 8 pages. Additional pages are added as separate requests in your queue — no extra charge on any plan.' },
      { q: 'Do you follow a brand guide if we have one?', a: 'Yes. Share your existing brand guide and assets and we\'ll design strictly within those guidelines for visual consistency.' },
      { q: 'Can you redesign an existing website?', a: 'Yes, redesigns are our most common request. We audit the current site, identify UX issues, and propose a modernised design before execution.' }
    ]
  },
  {
    slug: 'brand-identity',
    label: 'Brand Identity',
    category: 'branding',
    valuerop: 'Brands That Stand Out & Scale',
    subheadline: 'We create cohesive brand identities that communicate who you are, build trust, and differentiate you from the competition.',
    metaDescription: 'Complete brand identity systems — logos, color palettes, and style guides — available in your MyDesigner subscription. Unlimited revisions, no extra cost.',
    included: [
      'Logo design (primary + variations)',
      'Brand colour palette & typography system',
      'Brand guidelines document',
      'Business card & stationery design',
      'Social media profile & cover assets',
      'Source files in AI, EPS, SVG & PNG'
    ],
    faq: [
      { q: 'How many logo concepts do we get?', a: 'We present 2–3 distinct logo directions. You choose a direction, we refine it through unlimited revisions until it\'s exactly right.' },
      { q: 'Is a brand guidelines document included?', a: 'Yes. Every brand identity project includes a PDF brand guidelines document covering logo usage, colour, typography, and do/don\'ts.' },
      { q: 'Can you refresh an existing brand rather than start from scratch?', a: 'Yes. Brand refreshes are common — we modernise the existing identity while preserving recognition equity you\'ve already built.' },
      { q: 'What file formats will we receive?', a: 'You receive all source files: Adobe Illustrator (.ai), EPS, SVG, and PNG (transparent background) at multiple sizes.' }
    ]
  },
  {
    slug: 'presentation-design',
    label: 'Presentation Design',
    category: 'graphic',
    valuerop: 'Pitch Decks That Win Rooms',
    subheadline: 'We design investor-ready pitch decks and executive presentations that communicate clearly and leave a lasting impression.',
    metaDescription: 'Investor pitch decks and sales presentations designed to impress — part of your MyDesigner subscription. Fast turnaround, unlimited revisions, no extra fees.',
    included: [
      'Slide layout & visual hierarchy design',
      'Data visualisation & infographic creation',
      'Brand-aligned colour, type & icon system',
      'Up to 30 slides per request',
      'Speaker notes formatting',
      'PowerPoint, Keynote & Google Slides delivery'
    ],
    faq: [
      { q: 'Do you write the content or just design existing content?', a: 'We design around content you provide. We can refine copy for clarity and punch, but we don\'t write the pitch narrative from scratch.' },
      { q: 'How many slides can you design in one request?', a: 'A single request covers up to 30 slides. Larger decks are split into sequential requests in your queue.' },
      { q: 'Can you match our existing brand?', a: 'Absolutely. Share your brand guide and we\'ll design every slide to match your existing visual identity exactly.' },
      { q: 'What file formats do you deliver?', a: 'We deliver in PowerPoint (.pptx), Keynote (.key), and Google Slides — whichever you use to present.' }
    ]
  },
  {
    slug: 'booth-designs',
    label: 'Booth & Exhibition Design',
    category: 'graphic',
    valuerop: 'Exhibition Stands That Stop Foot Traffic',
    subheadline: 'We design eye-catching booth and exhibition graphics that communicate your brand\'s story and attract the right attendees.',
    metaDescription: 'Trade show booths, exhibition displays, and event graphics designed as part of your subscription. Unlimited designs, fast turnaround, cancel anytime.',
    included: [
      'Booth backdrop & banner design',
      'Pull-up & retractable banner graphics',
      'Branded table cover & display assets',
      'Flyer, brochure & handout design',
      'Name badge & lanyard design',
      'Print-ready files at correct resolution & bleed'
    ],
    faq: [
      { q: 'Do you supply the printed materials or just design files?', a: 'We supply print-ready design files (PDF, AI, EPS). Printing is handled by your local or online print vendor.' },
      { q: 'Can you work with an upcoming event deadline?', a: 'Yes. Mention your deadline when submitting the request and we\'ll prioritise accordingly. Growth and Scale plans offer the fastest turnaround.' },
      { q: 'What dimensions and file specs do you need from us?', a: 'Share the vendor\'s spec sheet (dimensions, bleed, DPI, colour mode) and we\'ll design and export to those exact specifications.' },
      { q: 'Can you design multiple booth sizes for the same event?', a: 'Yes. Multiple size variants of the same design are treated as revisions, not separate requests.' }
    ]
  },
  {
    slug: 'social-media-creatives',
    label: 'Social Media Design',
    category: 'graphic',
    valuerop: 'Scroll-Stopping Social Content, Consistently',
    subheadline: 'We design on-brand social media creatives that maintain visual consistency and drive engagement across every platform.',
    metaDescription: 'Scroll-stopping social media graphics and templates for every platform, included in your MyDesigner subscription. Unlimited requests, 24–72 hour delivery.',
    included: [
      'Instagram, LinkedIn & Twitter/X post designs',
      'Story & Reel cover graphics',
      'Carousel & multi-slide post design',
      'Ad creative variations (A/B ready)',
      'Platform-correct sizing & format',
      'Editable Figma or Canva templates'
    ],
    faq: [
      { q: 'How many posts can I get per month?', a: 'Output depends on complexity and your plan. Starter clients typically receive 15–25 individual post designs per month with revisions.' },
      { q: 'Do you design for all social platforms?', a: 'Yes — Instagram, LinkedIn, Twitter/X, Facebook, Pinterest, and YouTube thumbnails. Specify the platforms in your request.' },
      { q: 'Can you create templates our team can edit?', a: 'Yes. We deliver editable Figma or Canva templates so your team can swap copy and images for future posts independently.' },
      { q: 'Will the designs follow our brand guidelines?', a: 'Every creative is designed to your brand guide. Share your brand kit on onboarding and we apply it consistently across every post.' }
    ]
  }
];

function buildServicePage(config) {
  const categoryProjects = PROJECTS.filter((p) =>
    p.category === config.category && (!config.platform || p.platform === config.platform)
  );

  const projectCards = categoryProjects.map((p) => `
        <div class="portfolio-item" data-category="${p.category}">
          <a href="/work/${p.slug}" class="block group">
            <div class="card bg-base-100 border border-base-200 hover:shadow-lg transition-shadow overflow-hidden">
              <figure class="overflow-hidden">
                <img src="${p.thumb}" alt="${escapeXml(p.title)}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
              </figure>
              <div class="card-body p-4">
                <div class="badge badge-outline badge-sm">${p.badge}</div>
                <h3 class="card-title text-base mt-1">${escapeXml(p.title)}</h3>
                <p class="text-sm text-base-content/60">${escapeXml(p.desc)}</p>
                <p class="text-xs text-primary font-medium mt-1">View case study &rarr;</p>
              </div>
            </div>
          </a>
        </div>`).join('\n');

  const includedItems = config.included.map((item) =>
    `          <li class="flex items-start gap-3 p-4 bg-base-100 rounded-box border border-base-200">
            <span class="text-primary font-bold mt-0.5">&#10003;</span>
            <span>${escapeXml(item)}</span>
          </li>`
  ).join('\n');

  const faqItems = config.faq.map((item, i) => `
        <div class="collapse collapse-arrow join-item border border-base-300 bg-base-100">
          <input type="radio" name="service-faq" ${i === 0 ? 'checked="checked"' : ''}>
          <div class="collapse-title font-semibold">${escapeXml(item.q)}</div>
          <div class="collapse-content text-base-content/70"><p>${escapeXml(item.a)}</p></div>
        </div>`).join('\n');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
      { '@type': 'ListItem', position: 3, name: config.label, item: `${SITE_URL}/services/${config.slug}` }
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
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '1400', priceCurrency: 'USD', unitText: 'month' },
      description: 'Starting from $1,400/mo. No contract. Cancel anytime.'
    }
  };

  const valuerop = config.valuerop || `Expert ${config.label} for Growing Startups`;
  const metaTitle = `${config.label} — MyDesigner | ${valuerop}`;
  const metaDesc = config.metaDescription || config.subheadline;
  const canonicalPath = `/services/${config.slug}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  const body = `
  <!-- JSON-LD Schemas -->
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>

  <main>
    <!-- Hero -->
    <section class="py-16 lg:py-24 text-center" data-hero>
      <div class="max-w-4xl mx-auto px-4">
        <div class="breadcrumbs text-sm mb-4 mx-auto w-fit">
          <ul><li><a href="/">Home</a></li><li><a href="/services">Services</a></li><li>${escapeXml(config.label)}</li></ul>
        </div>
        <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">Service</span>
        <h1 class="text-4xl lg:text-5xl font-bold mt-2 mb-4">${escapeXml(config.label)}</h1>
        <p class="text-lg text-base-content/70 max-w-2xl mx-auto mb-8">${escapeXml(config.subheadline)}</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-lg">Book a call</a>
          <a href="/pricing" class="btn btn-outline btn-lg">See pricing</a>
        </div>
      </div>
    </section>

    <!-- What's Included -->
    <section class="py-12 lg:py-16 bg-base-200">
      <div class="max-w-4xl mx-auto px-4">
        <div class="text-center mb-10">
          <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">What You Get</span>
          <h2 class="text-3xl lg:text-4xl font-bold mt-2">What's Included</h2>
        </div>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
${includedItems}
        </ul>
      </div>
    </section>

    <!-- Portfolio Grid -->
    <section class="py-12 lg:py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-end justify-between mb-8">
          <div>
            <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">Our Work</span>
            <h2 class="text-3xl lg:text-4xl font-bold mt-1">${escapeXml(config.label)} Projects</h2>
          </div>
          <a href="/portfolio" class="btn btn-outline btn-sm hidden sm:inline-flex">View all work &rarr;</a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
${projectCards}
        </div>
        <div class="mt-8 text-center sm:hidden">
          <a href="/portfolio" class="btn btn-outline btn-sm">View all work &rarr;</a>
        </div>
      </div>
    </section>

    <!-- Pricing CTA Strip -->
    <section class="py-10 bg-base-200">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <p class="text-base-content/70 mb-4">Starting from <strong>$1,400/mo</strong> &middot; No contract &middot; Cancel anytime</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <a href="/pricing" class="btn btn-outline">See pricing</a>
          <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary">Book a call</a>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-12 lg:py-16">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">FAQ</span>
        <h2 class="text-3xl lg:text-4xl font-bold mt-2 mb-8">${escapeXml(config.label)} — Questions Answered</h2>
        <div class="join join-vertical w-full text-left">
${faqItems}
        </div>
      </div>
    </section>
  </main>`;

  const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metaTitle}</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
  <link rel="icon" type="image/png" href="/assets/images/favicon.png">
  <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${metaTitle}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:image" content="${SITE_URL}/assets/images/og-image.jpg">
</head>
<body class="bg-base-100 text-base-content">
  ${require('./partials/nav')}
  ${body}
  ${require('./partials/footer')}
</body>
</html>`;

  return html;
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

module.exports = { buildServicePages };

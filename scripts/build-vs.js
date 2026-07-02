#!/usr/bin/env node

/**
 * Build ORBIT competitor comparison pages.
 */

const fs = require('fs');
const path = require('path');

const { escapeXml, ensureDir } = require('./lib/utils');
const NAV = require('./partials/nav');
const FOOTER = require('./partials/footer');
const { SITE_URL, headTags } = require('./partials/head');

const VS_DIR = path.join(process.cwd(), 'vs');
const CALENDAR_URL = 'https://calendar.app.google/xGoKb51qpbcnZgJy5';
const UPDATED = 'May 2026';

const HUB = {
  title: 'Compare MyDesigner vs DesignJoy, Penji, ManyPixels & Kimp | MyDesigner',
  description: 'Compare MyDesigner with DesignJoy, Penji, ManyPixels, and Kimp by operating model, creative scope, Client Memory, web/product capability, AI-native execution, and team fit.',
  keywords: 'MyDesigner comparison, DesignJoy alternative, Penji alternative, ManyPixels alternative, Kimp alternative, AI-native creative team, creative operating model, Client Memory, design subscription comparison',
  ogTitle: 'Compare creative operating models, not just design subscriptions',
  ogDescription: 'Compare MyDesigner with DesignJoy, Penji, ManyPixels, and Kimp by fit, scope, Client Memory, AI-native execution, and operating rhythm.',
  h1: 'Compare creative operating models, not just design subscriptions.',
  lede: 'DesignJoy, Penji, ManyPixels, and Kimp can all be useful depending on the job. This guide compares them against MyDesigner’s AI-native creative team model: human creative direction, AI-powered execution, Client Memory, and web/product/growth capability for growing companies.',
  decision: {
    title: 'What are you actually choosing?',
    body: 'The useful question is not only which service gives more output. It is whether your company needs a solo designer, a production queue, graphic/video volume, or a creative operating rhythm that keeps context and ships across web, product, brand, and growth.',
    models: [
      { title: 'Solo designer', body: 'A focused designer-led queue for defined creative tasks.' },
      { title: 'Production queue', body: 'Recurring graphic or video output from clear briefs.' },
      { title: 'Agency project', body: 'A larger scoped engagement when you need a campaign or rebrand moment.' },
      { title: 'AI-native creative team', body: 'Human taste, AI-powered execution, Client Memory, and cross-functional creative range.' }
    ]
  },
  comparisons: [
    {
      name: 'DesignJoy',
      href: '/vs/designjoy',
      title: 'DesignJoy comparison',
      frame: 'premium solo design subscription vs AI-native creative team with Client Memory, broader web/product/growth execution, and compounding brand context.',
      when: 'Read this if you are comparing whether your team needs DesignJoy, MyDesigner, a freelancer, an agency, or an internal hire.'
    },
    {
      name: 'Penji',
      href: '/vs/penji',
      title: 'Penji comparison',
      frame: 'high-volume graphic design production vs AI-native creative team for teams that need business context, web/product capability, and Client Memory.',
      when: 'Read this if you are comparing whether your team needs Penji, MyDesigner, a freelancer, an agency, or an internal hire.'
    },
    {
      name: 'ManyPixels',
      href: '/vs/manypixels',
      title: 'ManyPixels comparison',
      frame: 'broad creative production vs AI-native creative team that uses Client Memory to keep strategic context and brand decisions compounding.',
      when: 'Read this if you are comparing whether your team needs ManyPixels, MyDesigner, a freelancer, an agency, or an internal hire.'
    },
    {
      name: 'Kimp',
      href: '/vs/kimp',
      title: 'Kimp comparison',
      frame: 'graphic/video production subscription vs AI-native creative team for web, product, brand, and growth execution with Client Memory.',
      when: 'Read this if you are comparing whether your team needs Kimp, MyDesigner, a freelancer, an agency, or an internal hire.'
    }
  ],
  fit: {
    eyebrow: 'Why fit beats feature checklists',
    title: 'Price is visible. Fit is what decides the outcome.',
    body: [
      'Transparent pricing matters, but the wrong creative operating model still creates drag: repeated context, inconsistent brand output, disconnected web and product work, and assets that look fine but do not support the business priority.',
      'MyDesigner is built for teams that need creative momentum with memory: a living system of brand rules, examples, templates, prompts, past decisions, and learnings that make the next request start smarter.'
    ],
    listTitle: 'MyDesigner is different when you need',
    list: [
      'AI-native creative team for growing companies',
      'Human creative direction plus AI-powered execution',
      'Client Memory that compounds brand context',
      'Creative range across web, product UI, brand systems, founder content, decks, and growth assets',
      'Webflow/Framer capability where relevant',
      'Operating-brand credibility from Sukratu'
    ]
  },
  routeCards: [
    {
      href: '/services',
      title: 'Web, product, and growth range',
      body: 'See the creative lanes MyDesigner can support.',
      link: 'Explore services'
    },
    {
      href: '/about',
      title: 'Creative operating rhythm',
      body: 'See Diagnose, Memory, Create, Ship, Learn.',
      link: 'How it works'
    },
    {
      href: '/#ch-plans',
      title: 'Plan architecture',
      body: 'Compare sprint, subscription, and partner options.',
      link: 'See pricing'
    }
  ]
};

const COMPARISONS = [
  {
    slug: 'designjoy',
    name: 'DesignJoy',
    title: 'MyDesigner vs DesignJoy: which creative operating model fits your team? | MyDesigner',
    description: 'Compare MyDesigner vs DesignJoy by creative operating model, scope, Client Memory, AI-native execution, web/product capability, pricing, and best-fit use cases.',
    keywords: 'DesignJoy alternative, MyDesigner vs DesignJoy, creative operating model, AI-native creative team, Client Memory, design subscription comparison',
    h1: 'MyDesigner vs DesignJoy: which creative operating model fits your team?',
    lede: 'This is not just a plan-by-plan checklist. It is a comparison between premium solo design subscription vs AI-native creative team with Client Memory, broader web/product/growth execution, and compounding brand context.',
    myDesignerChoice: 'Choose MyDesigner when you need creative momentum across website, product UI, campaign assets, founder content, and brand consistency, not just one design queue.',
    competitorChoice: 'Choose DesignJoy when you specifically want a premium solo-designer model and your scope is mostly high-quality design execution.',
    rows: [
      ['Primary model', 'Premium solo-designer subscription focused on high-quality design execution.', { strong: 'AI-native creative team' }],
      ['Best fit', 'Teams that specifically want a premium solo-designer model and have a mostly design-only queue.', 'Growing teams that need creative momentum across web, product, brand, and growth.'],
      ['Context retention', 'Depends on the client brief and working rhythm.', { strong: 'Client Memory:', rest: ' brand rules, examples, templates, prompts, decisions, and learnings.' }],
      ['AI workflow', 'Compare based on public information and your sales conversation.', 'AI-powered execution with human creative direction.'],
      ['Creative direction', 'A specific designer-led point of view and focused execution lane.', 'Human taste and strategic review before delivery.'],
      ['Scope', 'Strong fit for design execution when strategy, product ownership, and web implementation are handled elsewhere.', 'Websites, landing pages, product UI, brand systems, founder content, decks, and growth assets.'],
      ['Websites / landing pages', 'Confirm fit for your specific implementation needs.', 'Design plus Webflow/Framer capability where relevant.'],
      ['Pricing', 'DesignJoy pricing is usually evaluated as a premium subscription. MyDesigner plans start at $1,400/month, with larger operating rhythms scoped by need.', 'Transparent sprint, subscription, and creative partner options based on operating need.']
    ],
    scenarios: [
      { title: 'MyDesigner is stronger when...', body: 'You are launching or rebuilding pages while also needing product UI, campaign assets, and founder content to stay consistent.' },
      { title: 'DesignJoy may be stronger when...', body: 'You want a focused premium design queue and do not need broader web/product/growth support from the same partner.' }
    ],
    fairTitle: 'Where DesignJoy may be the better fit',
    fairBody: 'DesignJoy can be the better fit when your team wants a premium solo-designer relationship, a narrow design execution lane, and already has internal ownership for strategy, product, web, and brand systems.',
    faq: [
      ['Is MyDesigner a good alternative to DesignJoy?', 'Yes, when your team needs more than a task queue. MyDesigner is an AI-native creative team for growing companies, combining human creative direction, AI-powered execution, Client Memory, and delivery across web, product, brand, and growth.'],
      ['What is the biggest difference between MyDesigner and DesignJoy?', 'The useful comparison is creative operating model. DesignJoy can be a fit for teams that specifically want a premium solo-designer model and have a mostly design-only queue. MyDesigner is designed for teams that need business context, brand consistency, web/product capability, and creative memory to compound over time.'],
      ['When should we choose MyDesigner?', 'Choose MyDesigner when creative is becoming an operating bottleneck: website updates, landing pages, product UI, campaign assets, founder content, sales decks, and brand consistency all need to move without hiring a full internal team.'],
      ['When should we choose DesignJoy?', 'Choose DesignJoy when you specifically want a premium solo-designer model and your scope is mostly high-quality design execution.'],
      ['How does Client Memory change the comparison?', 'Client Memory is the living creative system behind an account: brand rules, examples, templates, prompts, past decisions, rejected directions, and performance learnings. It matters because you are not only buying today’s asset; you are buying whether the next asset starts from more context than the last one.'],
      ['Does MyDesigner use AI?', 'Yes. MyDesigner uses AI-powered execution to move faster, but human creative direction stays responsible for taste, quality, brand consistency, and final judgment.'],
      ['How should we compare pricing?', 'Compare pricing after you know the operating model you need. A production queue, a solo designer, an agency project, and an AI-native creative team solve different problems, so the better question is which model removes your current creative bottleneck.']
    ]
  },
  {
    slug: 'penji',
    name: 'Penji',
    title: 'MyDesigner vs Penji: which creative operating model fits your team? | MyDesigner',
    description: 'Compare MyDesigner vs Penji by creative operating model, scope, Client Memory, AI-native execution, web/product capability, pricing, and best-fit use cases.',
    keywords: 'Penji alternative, MyDesigner vs Penji, creative operating model, AI-native creative team, Client Memory, design subscription comparison',
    h1: 'MyDesigner vs Penji: which creative operating model fits your team?',
    lede: 'This is not just a plan-by-plan checklist. It is a comparison between high-volume graphic design production vs AI-native creative team for teams that need business context, web/product capability, and Client Memory.',
    myDesignerChoice: 'Choose MyDesigner when your creative work touches growth, product, websites, messaging, and brand consistency.',
    competitorChoice: 'Choose Penji when you mainly need high-volume standalone graphics or video/motion requests and already have strategy, web/product design, and brand system ownership elsewhere.',
    rows: [
      ['Primary model', 'High-volume creative production model for standalone graphics and related requests.', { strong: 'AI-native creative team' }],
      ['Best fit', 'Teams that mainly need a reliable queue for graphic design or video/motion output.', 'Growing teams that need creative momentum across web, product, brand, and growth.'],
      ['Context retention', 'Depends on the client brief and working rhythm.', { strong: 'Client Memory:', rest: ' brand rules, examples, templates, prompts, decisions, and learnings.' }],
      ['AI workflow', 'Compare based on public information and your sales conversation.', 'AI-powered execution with human creative direction.'],
      ['Creative direction', 'Production capacity for defined briefs when strategy and brand ownership already exist internally.', 'Human taste and strategic review before delivery.'],
      ['Scope', 'Useful for standalone graphics and production volume; web/product strategy is usually a separate ownership layer.', 'Websites, landing pages, product UI, brand systems, founder content, decks, and growth assets.'],
      ['Websites / landing pages', 'Confirm fit for your specific implementation needs.', 'Design plus Webflow/Framer capability where relevant.'],
      ['Pricing', 'Penji pricing is often compared plan-by-plan. MyDesigner pricing should be compared by the operating rhythm you need: sprint, ongoing creative execution, or deeper creative partner support.', 'Transparent sprint, subscription, and creative partner options based on operating need.']
    ],
    scenarios: [
      { title: 'MyDesigner is stronger when...', body: 'You need campaign pages, product UI support, sales assets, and brand consistency to move together.' },
      { title: 'Penji may be stronger when...', body: 'You need many standalone graphics or motion assets from already-approved briefs.' }
    ],
    fairTitle: 'Where Penji may be the better fit',
    fairBody: 'Penji can be the better fit when your backlog is mostly defined graphic or video/motion production and your internal team already controls direction, messaging, product design, and brand consistency.',
    faq: [
      ['Is MyDesigner a good alternative to Penji?', 'Yes, when your team needs more than a task queue. MyDesigner is an AI-native creative team for growing companies, combining human creative direction, AI-powered execution, Client Memory, and delivery across web, product, brand, and growth.'],
      ['What is the biggest difference between MyDesigner and Penji?', 'The useful comparison is creative operating model. Penji can be a fit for teams that mainly need a reliable queue for graphic design or video/motion output. MyDesigner is designed for teams that need business context, brand consistency, web/product capability, and creative memory to compound over time.'],
      ['When should we choose MyDesigner?', 'Choose MyDesigner when creative is becoming an operating bottleneck: website updates, landing pages, product UI, campaign assets, founder content, sales decks, and brand consistency all need to move without hiring a full internal team.'],
      ['When should we choose Penji?', 'Choose Penji when you mainly need high-volume standalone graphics or video/motion requests and already have strategy, web/product design, and brand system ownership elsewhere.'],
      ['How does Client Memory change the comparison?', 'Client Memory is the living creative system behind an account: brand rules, examples, templates, prompts, past decisions, rejected directions, and performance learnings. It matters because you are not only buying today’s asset; you are buying whether the next asset starts from more context than the last one.'],
      ['Does MyDesigner use AI?', 'Yes. MyDesigner uses AI-powered execution to move faster, but human creative direction stays responsible for taste, quality, brand consistency, and final judgment.'],
      ['How should we compare pricing?', 'Compare pricing after you know the operating model you need. A production queue, a solo designer, an agency project, and an AI-native creative team solve different problems, so the better question is which model removes your current creative bottleneck.']
    ]
  },
  {
    slug: 'manypixels',
    name: 'ManyPixels',
    title: 'MyDesigner vs ManyPixels: which creative operating model fits your team? | MyDesigner',
    description: 'Compare MyDesigner vs ManyPixels by creative operating model, scope, Client Memory, AI-native execution, web/product capability, pricing, and best-fit use cases.',
    keywords: 'ManyPixels alternative, MyDesigner vs ManyPixels, creative operating model, AI-native creative team, Client Memory, design subscription comparison',
    h1: 'MyDesigner vs ManyPixels: which creative operating model fits your team?',
    lede: 'This is not just a plan-by-plan checklist. It is a comparison between broad creative production vs AI-native creative team that uses Client Memory to keep strategic context and brand decisions compounding.',
    myDesignerChoice: 'Choose MyDesigner when you need website/landing-page sprints, product UI support, AI-ready brand systems, and ongoing creative execution tied to business priorities.',
    competitorChoice: 'Choose ManyPixels when you need accessible graphic design volume or motion support and do not need a tightly integrated creative operating layer.',
    rows: [
      ['Primary model', 'Broad creative production subscription for graphic design and motion support.', { strong: 'AI-native creative team' }],
      ['Best fit', 'Teams that need accessible design volume and can manage strategy, web, product, and brand decisions internally.', 'Growing teams that need creative momentum across web, product, brand, and growth.'],
      ['Context retention', 'Depends on the client brief and working rhythm.', { strong: 'Client Memory:', rest: ' brand rules, examples, templates, prompts, decisions, and learnings.' }],
      ['AI workflow', 'Compare based on public information and your sales conversation.', 'AI-powered execution with human creative direction.'],
      ['Creative direction', 'Production support across common design requests when the brief and standards are already clear.', 'Human taste and strategic review before delivery.'],
      ['Scope', 'Good fit for graphic design and motion support; deeper operating context may need to be supplied by the client team.', 'Websites, landing pages, product UI, brand systems, founder content, decks, and growth assets.'],
      ['Websites / landing pages', 'Confirm fit for your specific implementation needs.', 'Design plus Webflow/Framer capability where relevant.'],
      ['Pricing', 'ManyPixels pricing can be useful for comparing production capacity. MyDesigner pricing is more useful when matched to the creative operating rhythm and range your team needs.', 'Transparent sprint, subscription, and creative partner options based on operating need.']
    ],
    scenarios: [
      { title: 'MyDesigner is stronger when...', body: 'You need creative work to span website launches, product UI, brand systems, decks, and growth assets with context carried forward.' },
      { title: 'ManyPixels may be stronger when...', body: 'You mainly need recurring design production from clear, repeatable briefs.' }
    ],
    fairTitle: 'Where ManyPixels may be the better fit',
    fairBody: 'ManyPixels can be the better fit when the work is mostly production volume and your team already has the strategy, brand system, and decision history documented internally.',
    faq: [
      ['Is MyDesigner a good alternative to ManyPixels?', 'Yes, when your team needs more than a task queue. MyDesigner is an AI-native creative team for growing companies, combining human creative direction, AI-powered execution, Client Memory, and delivery across web, product, brand, and growth.'],
      ['What is the biggest difference between MyDesigner and ManyPixels?', 'The useful comparison is creative operating model. ManyPixels can be a fit for teams that need accessible design volume and can manage strategy, web, product, and brand decisions internally. MyDesigner is designed for teams that need business context, brand consistency, web/product capability, and creative memory to compound over time.'],
      ['When should we choose MyDesigner?', 'Choose MyDesigner when creative is becoming an operating bottleneck: website updates, landing pages, product UI, campaign assets, founder content, sales decks, and brand consistency all need to move without hiring a full internal team.'],
      ['When should we choose ManyPixels?', 'Choose ManyPixels when you need accessible graphic design volume or motion support and do not need a tightly integrated creative operating layer.'],
      ['How does Client Memory change the comparison?', 'Client Memory is the living creative system behind an account: brand rules, examples, templates, prompts, past decisions, rejected directions, and performance learnings. It matters because you are not only buying today’s asset; you are buying whether the next asset starts from more context than the last one.'],
      ['Does MyDesigner use AI?', 'Yes. MyDesigner uses AI-powered execution to move faster, but human creative direction stays responsible for taste, quality, brand consistency, and final judgment.'],
      ['How should we compare pricing?', 'Compare pricing after you know the operating model you need. A production queue, a solo designer, an agency project, and an AI-native creative team solve different problems, so the better question is which model removes your current creative bottleneck.']
    ]
  },
  {
    slug: 'kimp',
    name: 'Kimp',
    title: 'MyDesigner vs Kimp: which creative operating model fits your team? | MyDesigner',
    description: 'Compare MyDesigner vs Kimp by creative operating model, scope, Client Memory, AI-native execution, web/product capability, pricing, and best-fit use cases.',
    keywords: 'Kimp alternative, MyDesigner vs Kimp, creative operating model, AI-native creative team, Client Memory, design subscription comparison',
    h1: 'MyDesigner vs Kimp: which creative operating model fits your team?',
    lede: 'This is not just a plan-by-plan checklist. It is a comparison between graphic/video production subscription vs AI-native creative team for web, product, brand, and growth execution with Client Memory.',
    myDesignerChoice: 'Choose MyDesigner when you need taste, business context, development capability, and repeatable brand consistency across a growing company.',
    competitorChoice: 'Choose Kimp when your main need is graphic/video production volume and your internal team already owns strategy, product, web, and brand consistency.',
    rows: [
      ['Primary model', 'Graphic and video production subscription for teams with defined asset requests.', { strong: 'AI-native creative team' }],
      ['Best fit', 'Teams that need graphic/video production volume and already own strategy, product, web, and brand consistency internally.', 'Growing teams that need creative momentum across web, product, brand, and growth.'],
      ['Context retention', 'Depends on the client brief and working rhythm.', { strong: 'Client Memory:', rest: ' brand rules, examples, templates, prompts, decisions, and learnings.' }],
      ['AI workflow', 'Compare based on public information and your sales conversation.', 'AI-powered execution with human creative direction.'],
      ['Creative direction', 'Production support for graphic and video deliverables from clear briefs.', 'Human taste and strategic review before delivery.'],
      ['Scope', 'Useful for graphic/video output; web, product, and growth operating context are usually separate layers.', 'Websites, landing pages, product UI, brand systems, founder content, decks, and growth assets.'],
      ['Websites / landing pages', 'Confirm fit for your specific implementation needs.', 'Design plus Webflow/Framer capability where relevant.'],
      ['Pricing', 'Kimp pricing is often reviewed by production volume and media type. MyDesigner pricing is best reviewed against the breadth of creative operating support your team needs.', 'Transparent sprint, subscription, and creative partner options based on operating need.']
    ],
    scenarios: [
      { title: 'MyDesigner is stronger when...', body: 'You need web, product, brand, founder content, decks, and campaign assets to come from one context-aware creative rhythm.' },
      { title: 'Kimp may be stronger when...', body: 'You need steady graphic/video production from a clear asset queue.' }
    ],
    fairTitle: 'Where Kimp may be the better fit',
    fairBody: 'Kimp can be the better fit when your creative need is mainly graphic/video production and your team already has strong internal direction, brand governance, and web/product ownership.',
    faq: [
      ['Is MyDesigner a good alternative to Kimp?', 'Yes, when your team needs more than a task queue. MyDesigner is an AI-native creative team for growing companies, combining human creative direction, AI-powered execution, Client Memory, and delivery across web, product, brand, and growth.'],
      ['What is the biggest difference between MyDesigner and Kimp?', 'The useful comparison is creative operating model. Kimp can be a fit for teams that need graphic/video production volume and already own strategy, product, web, and brand consistency internally. MyDesigner is designed for teams that need business context, brand consistency, web/product capability, and creative memory to compound over time.'],
      ['When should we choose MyDesigner?', 'Choose MyDesigner when creative is becoming an operating bottleneck: website updates, landing pages, product UI, campaign assets, founder content, sales decks, and brand consistency all need to move without hiring a full internal team.'],
      ['When should we choose Kimp?', 'Choose Kimp when your main need is graphic/video production volume and your internal team already owns strategy, product, web, and brand consistency.'],
      ['How does Client Memory change the comparison?', 'Client Memory is the living creative system behind an account: brand rules, examples, templates, prompts, past decisions, rejected directions, and performance learnings. It matters because you are not only buying today’s asset; you are buying whether the next asset starts from more context than the last one.'],
      ['Does MyDesigner use AI?', 'Yes. MyDesigner uses AI-powered execution to move faster, but human creative direction stays responsible for taste, quality, brand consistency, and final judgment.'],
      ['How should we compare pricing?', 'Compare pricing after you know the operating model you need. A production queue, a solo designer, an agency project, and an AI-native creative team solve different problems, so the better question is which model removes your current creative bottleneck.']
    ]
  }
];

function faqSchema(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer }
    }))
  };
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`
    }))
  };
}

function hubItemListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'MyDesigner comparison pages',
    itemListElement: HUB.comparisons.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `MyDesigner vs ${item.name}`,
      url: `${SITE_URL}${item.href}`
    }))
  };
}

function renderRich(value) {
  if (typeof value === 'string') return escapeXml(value);
  if (value && value.strong) {
    return `<strong>${escapeXml(value.strong)}</strong>${value.rest ? escapeXml(value.rest) : ''}`;
  }
  return '';
}

function renderModelCards(models) {
  return models.map((model) => `          <article class="orbit-card">
            <h3>${escapeXml(model.title)}</h3>
            <p>${escapeXml(model.body)}</p>
          </article>`).join('\n');
}

function renderComparisonDirectory() {
  return `        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th>Comparison</th>
                <th>Operating-model frame</th>
                <th>Best next read</th>
              </tr>
            </thead>
            <tbody>
${HUB.comparisons.map((item) => `              <tr>
                <td><a href="${escapeXml(item.href)}">${escapeXml(item.title)}</a></td>
                <td>${escapeXml(item.frame)}</td>
                <td>${escapeXml(item.when)}</td>
              </tr>`).join('\n')}
            </tbody>
          </table>
        </div>`;
}

function renderRows(page) {
  return page.rows.map(([axis, competitor, myDesigner]) => `              <tr>
                <td>${escapeXml(axis)}</td>
                <td>${renderRich(competitor)}</td>
                <td>${renderRich(myDesigner)}</td>
              </tr>`).join('\n');
}

function renderScenarioCards(page) {
  return page.scenarios.map((item) => `          <article class="orbit-card">
            <h3>${escapeXml(item.title)}</h3>
            <p>${escapeXml(item.body)}</p>
          </article>`).join('\n');
}

function renderFaq(faq) {
  return faq.map(([question, answer], index) => `          <details${index === 0 ? ' open' : ''}>
            <summary>${escapeXml(question)}</summary>
            <p>${escapeXml(answer)}</p>
          </details>`).join('\n');
}

function renderList(items) {
  return items.map((item) => `            <li>${escapeXml(item)}</li>`).join('\n');
}

function renderRouteCards() {
  return HUB.routeCards.map((item) => `          <a href="${escapeXml(item.href)}" class="orbit-card">
            <h3>${escapeXml(item.title)}</h3>
            <p>${escapeXml(item.body)}</p>
            <p class="project-card__link">${escapeXml(item.link)} -&gt;</p>
          </a>`).join('\n');
}

function renderHead({ title, description, keywords, canonical, ogTitle, ogDescription, schema }) {
  return headTags({
    title,
    description,
    keywords,
    canonical,
    ogTitle: ogTitle || title.replace(' | MyDesigner', ''),
    ogDescription: ogDescription || description,
    twitterTitle: ogTitle || title.replace(' | MyDesigner', ''),
    twitterDescription: ogDescription || description,
    schema
  });
}

function buildHubPage() {
  const schema = [
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Compare', path: '/vs/' }
    ]),
    hubItemListSchema()
  ];

  return `<!DOCTYPE html>
<html lang="en" class="static">
<head>
${renderHead({
    title: HUB.title,
    description: HUB.description,
    keywords: HUB.keywords,
    canonical: '/vs/',
    ogTitle: HUB.ogTitle,
    ogDescription: HUB.ogDescription,
    schema
  })}
</head>
<body class="orbit-static">
  ${NAV}
  <div class="grain"></div>
  <div class="vignette"></div>

  <main>
    <header class="deep-hero deep-hero--wide" data-hero>
      <div class="deep-hero__inner">
        <nav class="crumbs" aria-label="Breadcrumb"><span><a href="/">Home</a></span><span>Compare</span></nav>
        <p class="kicker">Comparison Hub</p>
        <h1>${escapeXml(HUB.h1)}</h1>
        <p class="deep-hero__lede">${escapeXml(HUB.lede)}</p>
        <p class="deep-hero__meta">Last updated: ${escapeXml(UPDATED)}</p>
      </div>
    </header>

    <section class="deep-section deep-section--tint">
      <div class="shell">
        <div class="section-head">
          <p class="kicker">Decision frame</p>
          <h2 class="section-title">${escapeXml(HUB.decision.title)}</h2>
          <p class="section-copy">${escapeXml(HUB.decision.body)}</p>
        </div>
        <div class="deep-grid deep-grid--4">
${renderModelCards(HUB.decision.models)}
        </div>
      </div>
    </section>

    <section class="deep-section">
      <div class="shell">
        <div class="section-head section-head--center">
          <p class="kicker">Right-fit comparisons</p>
          <h2 class="section-title">Choose a comparison by operating model.</h2>
        </div>
${renderComparisonDirectory()}
      </div>
    </section>

    <section class="deep-section deep-section--tint">
      <div class="shell">
        <div class="orbit-card orbit-card--split">
          <div>
            <p class="kicker">${escapeXml(HUB.fit.eyebrow)}</p>
            <h2 class="section-title">${escapeXml(HUB.fit.title)}</h2>
            ${HUB.fit.body.map((paragraph) => `<p class="section-copy">${escapeXml(paragraph)}</p>`).join('\n            ')}
          </div>
          <div>
            <h3>${escapeXml(HUB.fit.listTitle)}</h3>
            <ul class="check-list deep-grid">
${renderList(HUB.fit.list)}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="deep-section">
      <div class="shell">
        <div class="section-head section-head--center">
          <p class="kicker">Route by need</p>
          <h2 class="section-title">Route by what you need to ship.</h2>
        </div>
        <div class="deep-grid deep-grid--3">
${renderRouteCards()}
        </div>
      </div>
    </section>

    <section class="deep-section finale">
      <div class="shell">
        <p class="kicker">Next orbit</p>
        <h2 class="finale-h">Not sure which creative model fits your team?</h2>
        <p class="section-copy" style="margin-left:auto;margin-right:auto;">Bring your creative backlog, upcoming launches, and current bottlenecks. We will help you decide whether you need MyDesigner, another subscription, a freelancer, an agency, or an internal hire.</p>
        <div class="cta-row">
          <a href="${CALENDAR_URL}" class="btn btn--solid">Talk through your creative needs <span class="arrow">-&gt;</span></a>
          <a href="/#ch-plans" class="btn btn--ghost">See pricing <span class="arrow">-&gt;</span></a>
        </div>
      </div>
    </section>
  </main>

  ${FOOTER}
</body>
</html>`;
}

function buildComparisonPage(page) {
  const canonicalPath = `/vs/${page.slug}`;
  const schema = [
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Compare', path: '/vs/' },
      { name: `MyDesigner vs ${page.name}`, path: canonicalPath }
    ]),
    faqSchema(page.faq)
  ];

  return `<!DOCTYPE html>
<html lang="en" class="static">
<head>
${renderHead({
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    canonical: canonicalPath,
    schema
  })}
</head>
<body class="orbit-static">
  ${NAV}
  <div class="grain"></div>
  <div class="vignette"></div>

  <main>
    <header class="deep-hero deep-hero--wide" data-hero>
      <div class="deep-hero__inner">
        <nav class="crumbs" aria-label="Breadcrumb"><span><a href="/">Home</a></span><span><a href="/vs/">Compare</a></span><span>MyDesigner vs ${escapeXml(page.name)}</span></nav>
        <p class="kicker">Right-fit comparison</p>
        <h1>${escapeXml(page.h1)}</h1>
        <p class="deep-hero__lede">${escapeXml(page.lede)}</p>
        <p class="deep-hero__meta">Last updated: ${escapeXml(UPDATED)}</p>
      </div>
    </header>

    <section class="deep-section deep-section--tint">
      <div class="shell">
        <div class="section-head">
          <p class="kicker">Quick answer</p>
          <h2 class="section-title">Which should you choose?</h2>
        </div>
        <div class="deep-grid deep-grid--2">
          <article class="orbit-card">
            <h3>Choose MyDesigner when...</h3>
            <p>${escapeXml(page.myDesignerChoice)}</p>
          </article>
          <article class="orbit-card">
            <h3>Choose ${escapeXml(page.name)} when...</h3>
            <p>${escapeXml(page.competitorChoice)}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="deep-section">
      <div class="shell">
        <div class="section-head section-head--center">
          <p class="kicker">Operating model comparison</p>
          <h2 class="section-title">MyDesigner vs ${escapeXml(page.name)}</h2>
        </div>
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th>Decision axis</th>
                <th>${escapeXml(page.name)}</th>
                <th>MyDesigner</th>
              </tr>
            </thead>
            <tbody>
${renderRows(page)}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="deep-section deep-section--tint">
      <div class="shell">
        <div class="orbit-card orbit-card--split">
          <div>
            <p class="kicker">MyDesigner difference</p>
            <h2 class="section-title">Built for creative momentum with memory.</h2>
            <p class="section-copy">MyDesigner is an AI-native creative team for growing companies. The model combines human creative direction, AI-powered execution, Client Memory, and a broader creative range so work does not restart from scratch every time.</p>
            <div class="cta-row">
              <a href="/about" class="btn btn--ghost">How it works <span class="arrow">-&gt;</span></a>
              <a href="/services" class="btn btn--ghost">Explore services <span class="arrow">-&gt;</span></a>
              <a href="/#ch-plans" class="btn btn--ghost">See pricing <span class="arrow">-&gt;</span></a>
            </div>
          </div>
          <div>
            <h3>What MyDesigner brings</h3>
            <ul class="check-list deep-grid">
${renderList([
    'AI-native creative team for growing companies',
    'Human creative direction plus AI-powered execution',
    'Client Memory: brand rules, examples, templates, prompts, past decisions, and learnings',
    'Creative range across web, product UI, brand systems, founder content, decks, and growth assets',
    'Webflow/Framer capability where relevant',
    'Operating brand of Sukratu'
  ])}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="deep-section">
      <div class="shell">
        <div class="section-head section-head--center">
          <p class="kicker">Use-case scenarios</p>
          <h2 class="section-title">Where each model tends to fit.</h2>
        </div>
        <div class="deep-grid deep-grid--2">
${renderScenarioCards(page)}
        </div>
      </div>
    </section>

    <section class="deep-section deep-section--tint">
      <div class="shell">
        <div class="orbit-card">
          <p class="kicker">Fair competitor fit</p>
          <h2 class="section-title">${escapeXml(page.fairTitle)}</h2>
          <p class="section-copy">${escapeXml(page.fairBody)}</p>
        </div>
      </div>
    </section>

    <section class="deep-section">
      <div class="shell">
        <div class="section-head section-head--center">
          <p class="kicker">FAQ</p>
          <h2 class="section-title">Frequently asked questions</h2>
        </div>
        <div class="faq-list">
${renderFaq(page.faq)}
        </div>
      </div>
    </section>

    <section class="deep-section finale">
      <div class="shell">
        <p class="kicker">Next orbit</p>
        <h2 class="finale-h">Not sure which creative model fits your team?</h2>
        <p class="section-copy" style="margin-left:auto;margin-right:auto;">Bring your creative backlog, upcoming launches, and current bottlenecks. We will help you decide whether you need MyDesigner, another subscription, a freelancer, an agency, or an internal hire.</p>
        <div class="cta-row">
          <a href="${CALENDAR_URL}" class="btn btn--solid">Talk through your creative needs <span class="arrow">-&gt;</span></a>
          <a href="/#ch-plans" class="btn btn--ghost">See pricing <span class="arrow">-&gt;</span></a>
        </div>
      </div>
    </section>
  </main>

  ${FOOTER}
</body>
</html>`;
}

function buildVsPages() {
  ensureDir(VS_DIR);

  fs.writeFileSync(path.join(VS_DIR, 'index.html'), buildHubPage());
  console.log('Built VS page: vs/index.html');

  COMPARISONS.forEach((page) => {
    fs.writeFileSync(path.join(VS_DIR, `${page.slug}.html`), buildComparisonPage(page));
    console.log(`Built VS page: vs/${page.slug}.html`);
  });
}

if (require.main === module) {
  buildVsPages();
}

module.exports = {
  buildVsPages,
  buildHubPage,
  buildComparisonPage,
  COMPARISONS,
  HUB
};

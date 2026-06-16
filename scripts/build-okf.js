#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const { SERVICE_CONFIGS } = require('./build-services');
const PROJECTS = require('../data/projects');

const ROOT = process.cwd();
const SITE_URL = 'https://mydesigner.gg';
const OKF_DIR = path.join(ROOT, 'okf');
const POSTS_DIR = path.join(ROOT, 'content', 'posts');

const MARQUEE_PAGES = [
  { slug: 'index-home', file: 'index.html', title: 'MyDesigner', resourcePath: '/', related: ['services.md', 'work.md', 'about.md', 'offer-conversion-design.md', 'offer-founder-content-engine.md', 'offer-ai-ready-brand-system.md'] },
  { slug: 'about', file: 'about.html', title: 'About MyDesigner', resourcePath: '/about', related: ['services.md', 'work.md', 'index-home.md'] },
  { slug: 'services', file: 'services.html', title: 'Services', resourcePath: '/services', related: SERVICE_CONFIGS.map((service) => `service-${service.slug}.md`).concat(['offer-conversion-design.md', 'offer-founder-content-engine.md', 'offer-ai-ready-brand-system.md']) },
  { slug: 'work', file: 'work.html', title: 'Work', resourcePath: '/work', related: PROJECTS.map((project) => `work-${project.slug}.md`) }
];

const OFFER_PAGES = [
  {
    slug: 'conversion-design',
    file: 'conversion-design.html',
    title: 'Conversion Website Sprint',
    related: ['service-website-design.md', 'service-webflow-development.md', 'service-framer-development.md', 'services.md']
  },
  {
    slug: 'founder-content-engine',
    file: 'founder-content-engine.html',
    title: 'Founder Content Engine',
    related: ['service-social-media-creatives.md', 'service-presentation-design.md', 'services.md']
  },
  {
    slug: 'ai-ready-brand-system',
    file: 'ai-ready-brand-system.html',
    title: 'AI-Ready Brand System',
    related: ['service-brand-identity.md', 'service-social-media-creatives.md', 'services.md']
  }
];

const CATEGORY_LABELS = {
  uiux: 'UI/UX Design',
  webdev: 'Web Development',
  graphic: 'Graphic Design',
  branding: 'Branding'
};

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function sourceTimestamp(relativePath) {
  return fs.statSync(path.join(ROOT, relativePath)).mtime.toISOString();
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&nbsp;/g, ' ');
}

function cleanText(value) {
  return decodeHtml(String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim());
}

function extractMeta(html, name) {
  const pattern = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=(["'])([\\s\\S]*?)\\1`, 'i');
  const reversePattern = new RegExp(`<meta[^>]+content=(["'])([\\s\\S]*?)\\1[^>]+name=["']${name}["']`, 'i');
  const match = html.match(pattern) || html.match(reversePattern);
  return match ? cleanText(match[2]) : '';
}

function extractTitle(html, fallback) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return cleanText((h1Match && h1Match[1]) || (titleMatch && titleMatch[1]) || fallback);
}

function extractHeroLede(html) {
  const match = html.match(/<p[^>]+class=["'][^"']*deep-hero__lede[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  return match ? cleanText(match[1]) : '';
}

function extractSectionSummaries(html, limit = 4) {
  const sections = [];
  const sectionPattern = /<h2[^>]+class=["'][^"']*section-title[^"']*["'][^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<\/section>|<h2[^>]+class=["'][^"']*section-title|$)/gi;
  let match;

  while ((match = sectionPattern.exec(html)) && sections.length < limit) {
    const heading = cleanText(match[1]);
    const copyMatches = [...match[2].matchAll(/<p[^>]+class=["'][^"']*section-copy[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi)]
      .map((copyMatch) => cleanText(copyMatch[1]))
      .filter(Boolean);

    if (heading && copyMatches.length) {
      sections.push({ heading, copy: copyMatches.slice(0, 2) });
    }
  }

  return sections;
}

function normalizePathname(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname
    .replace(/\.html$/, '')
    .replace(/\/index$/, '')
    .replace(/\/+$/, '') || '/';
}

function resourceUrl(resourcePath) {
  return resourcePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${resourcePath}`;
}

function filenameForService(slug) {
  return `service-${slug}.md`;
}

function filenameForOffer(slug) {
  return `offer-${slug}.md`;
}

function filenameForWork(slug) {
  return `work-${slug}.md`;
}

function filenameForBlog(slug) {
  return `blog-${slug}.md`;
}

function localLink(filename) {
  return `./${filename}`;
}

function yamlString(value) {
  return JSON.stringify(String(value || ''));
}

function yamlArray(values) {
  const unique = [...new Set(values.filter(Boolean).map(String))];
  if (!unique.length) return '[]';
  return `\n${unique.map((value) => `  - ${yamlString(value)}`).join('\n')}`;
}

function frontmatter(data) {
  return [
    '---',
    `type: ${yamlString(data.type)}`,
    data.title ? `title: ${yamlString(data.title)}` : null,
    data.description ? `description: ${yamlString(data.description)}` : null,
    data.resource ? `resource: ${yamlString(data.resource)}` : null,
    data.tags ? `tags:${yamlArray(data.tags)}` : null,
    data.timestamp ? `timestamp: ${yamlString(data.timestamp)}` : null,
    '---',
    ''
  ].filter((line) => line !== null).join('\n');
}

function slugifyTag(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tagsFor(values) {
  return [...new Set(values.map(slugifyTag).filter(Boolean))];
}

function markdownList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function joinBlocks(blocks) {
  return blocks.filter((block) => block !== null && block !== undefined && block !== '').join('\n\n');
}

function relatedList(filenames, entriesByFilename) {
  return filenames
    .filter((filename) => entriesByFilename.has(filename))
    .map((filename) => {
      const entry = entriesByFilename.get(filename);
      return `- [${entry.title}](${localLink(filename)})`;
    })
    .join('\n');
}

function projectMatchesService(project, service) {
  if (service.slug === 'webflow-development') {
    return project.category === 'webdev' && project.platform === 'webflow';
  }

  if (service.slug === 'framer-development') {
    return project.category === 'webdev' && project.platform === 'framer';
  }

  if (service.slug === 'web-app-design') {
    return project.category === 'uiux';
  }

  if (service.slug === 'website-design') {
    return project.category === 'webdev';
  }

  if (service.slug === 'brand-identity') {
    return project.category === 'branding';
  }

  if (service.slug === 'presentation-design') {
    return /deck|pitch|presentation/i.test(`${project.title} ${project.desc} ${project.badge}`);
  }

  if (service.slug === 'social-media-creatives') {
    return project.category === 'graphic' && !/deck|pitch|presentation/i.test(`${project.title} ${project.desc} ${project.badge}`);
  }

  if (service.slug === 'booth-designs') {
    return project.category === 'graphic';
  }

  return project.category === service.category;
}

function representativeProjectsForService(service) {
  return PROJECTS
    .filter((project) => projectMatchesService(project, service))
    .slice(0, 3);
}

function relatedServicesForProject(project) {
  if (project.category === 'webdev' && project.platform === 'webflow') {
    return ['webflow-development'];
  }

  if (project.category === 'webdev' && project.platform === 'framer') {
    return ['framer-development'];
  }

  if (project.category === 'webdev') {
    return ['website-design'];
  }

  if (project.category === 'uiux') {
    return ['web-app-design'];
  }

  if (project.category === 'branding') {
    return ['brand-identity'];
  }

  if (/deck|pitch|presentation/i.test(`${project.title} ${project.desc} ${project.badge}`)) {
    return ['presentation-design'];
  }

  if (project.category === 'graphic') {
    return ['social-media-creatives'];
  }

  return [];
}

function serviceRelatedBundleLinks(service) {
  return (service.related || [])
    .map((link) => {
      const pathname = normalizePathname(link.href);
      if (pathname.startsWith('/services/')) return filenameForService(pathname.split('/').pop());
      if (pathname === '/services') return 'services.md';
      if (pathname === '/work') return 'work.md';
      if (pathname === '/about') return 'about.md';
      if (pathname === '/') return 'index-home.md';
      if (pathname === '/conversion-design') return filenameForOffer('conversion-design');
      if (pathname === '/founder-content-engine') return filenameForOffer('founder-content-engine');
      if (pathname === '/ai-ready-brand-system') return filenameForOffer('ai-ready-brand-system');
      return null;
    })
    .filter(Boolean);
}

function buildMarqueeEntry(page) {
  const html = readText(page.file);
  const description = extractMeta(html, 'description');
  const title = page.title || extractTitle(html, page.slug);
  const filename = `${page.slug}.md`;
  const body = joinBlocks([
    `# ${title}`,
    description,
    `## Live Resource\n\n[${resourceUrl(page.resourcePath)}](${resourceUrl(page.resourcePath)})`,
    '## Related Concepts\n\n<RELATED>'
  ]);

  return {
    group: 'marquee',
    filename,
    type: 'WebPage',
    title,
    description,
    resource: resourceUrl(page.resourcePath),
    tags: tagsFor(['page', page.slug]),
    timestamp: sourceTimestamp(page.file),
    related: page.related,
    body
  };
}

function buildServiceEntry(service) {
  const examples = representativeProjectsForService(service).map((project) => filenameForWork(project.slug));
  const related = [...examples, ...serviceRelatedBundleLinks(service)];
  const body = joinBlocks([
    `# ${service.label}`,
    service.subheadline,
    `## Use This When\n\n${service.fit}`,
    `## Included\n\n${markdownList(service.included)}`,
    `## Client Memory\n\n${service.memoryDetail}`,
    '## Related Concepts\n\n<RELATED>'
  ]);

  return {
    group: 'services',
    filename: filenameForService(service.slug),
    type: 'Service',
    title: service.label,
    description: service.subheadline,
    resource: resourceUrl(`/services/${service.slug}`),
    tags: tagsFor(['service', service.category, service.platform, service.slug]),
    timestamp: sourceTimestamp('scripts/build-services.js'),
    related,
    body
  };
}

function buildOfferEntry(offer) {
  const html = readText(offer.file);
  const description = extractMeta(html, 'description');
  const title = offer.title || extractTitle(html, offer.slug);
  const heroLede = extractHeroLede(html);
  const sections = extractSectionSummaries(html);
  const sectionMarkdown = sections.map((section) => {
    return joinBlocks([`## ${section.heading}`, ...section.copy]);
  }).join('\n\n');

  const body = joinBlocks([
    `# ${title}`,
    heroLede || description,
    sectionMarkdown,
    '## Related Concepts\n\n<RELATED>'
  ]);

  return {
    group: 'offers',
    filename: filenameForOffer(offer.slug),
    type: 'Service',
    title,
    description,
    resource: resourceUrl(`/${offer.slug}`),
    tags: tagsFor(['offer', 'service', offer.slug]),
    timestamp: sourceTimestamp(offer.file),
    related: offer.related,
    body
  };
}

function buildWorkEntry(project) {
  const related = relatedServicesForProject(project).map(filenameForService);
  const projectDetails = [
    `- Category: ${CATEGORY_LABELS[project.category] || project.category}`,
    `- Badge: ${project.badge}`,
    project.platform ? `- Platform: ${project.platform}` : null
  ].filter(Boolean).join('\n');
  const body = joinBlocks([
    `# ${project.title}`,
    project.desc,
    `## Portfolio Category\n\n${projectDetails}`,
    '## Related Concepts\n\n<RELATED>'
  ]);

  return {
    group: 'work',
    filename: filenameForWork(project.slug),
    type: 'CreativeWork',
    title: project.title,
    description: project.desc,
    resource: resourceUrl(`/work/${project.slug}`),
    tags: tagsFor(['work', project.category, project.badge, project.platform]),
    timestamp: sourceTimestamp('data/projects.js'),
    related,
    body
  };
}

function loadPostSources() {
  return fs.readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const relativePath = path.join('content', 'posts', file);
      const raw = readText(relativePath);
      const parsed = matter(raw);
      return {
        file,
        relativePath,
        rawDate: extractFrontmatterValue(raw, 'date'),
        parsed,
        slug: parsed.data.slug || file.replace(/\.md$/, '')
      };
    })
    .filter((post) => post.parsed.data.draft !== true)
    .sort((a, b) => {
      const aDate = new Date(a.rawDate || a.parsed.data.date || 0).getTime();
      const bDate = new Date(b.rawDate || b.parsed.data.date || 0).getTime();
      return bDate - aDate;
    });
}

function extractFrontmatterValue(raw, field) {
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return '';

  const match = frontmatterMatch[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  if (!match) return '';

  return match[1].trim().replace(/^["']|["']$/g, '');
}

function toTimestamp(value, fallbackPath) {
  if (value) {
    const rawValue = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
      return `${rawValue}T00:00:00.000Z`;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(rawValue)) {
      return `${rawValue}:00.000Z`;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(rawValue)) {
      return `${rawValue}.000Z`;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  return sourceTimestamp(fallbackPath);
}

function firstMarkdownParagraph(markdown) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith('#') && !block.startsWith('---')) || '';
}

function buildPathMap(posts) {
  const map = new Map();
  MARQUEE_PAGES.forEach((page) => {
    map.set(normalizePathname(page.resourcePath), `${page.slug}.md`);
  });
  SERVICE_CONFIGS.forEach((service) => {
    map.set(`/services/${service.slug}`, filenameForService(service.slug));
  });
  OFFER_PAGES.forEach((offer) => {
    map.set(`/${offer.slug}`, filenameForOffer(offer.slug));
  });
  PROJECTS.forEach((project) => {
    map.set(`/work/${project.slug}`, filenameForWork(project.slug));
  });
  posts.forEach((post) => {
    map.set(`/blog/${post.slug}`, filenameForBlog(post.slug));
  });
  return map;
}

function mapInternalHref(href, pathMap) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return null;
  }

  let pathname = null;

  if (href.startsWith('/')) {
    pathname = href.split('#')[0].split('?')[0];
  } else if (href.startsWith(SITE_URL)) {
    const url = new URL(href);
    pathname = url.pathname;
  }

  if (!pathname) return null;

  const normalized = normalizePathname(pathname);
  const filename = pathMap.get(normalized);
  return filename ? localLink(filename) : null;
}

function rewriteInternalLinks(markdown, pathMap) {
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
    const cleanHref = href.trim();
    const mapped = mapInternalHref(cleanHref, pathMap);
    if (!mapped && (cleanHref.startsWith('/') || cleanHref.startsWith(SITE_URL))) {
      return label;
    }
    return mapped ? `[${label}](${mapped})` : match;
  });
}

function relatedBlogConcepts(post, content) {
  const text = `${post.parsed.data.title || ''} ${post.parsed.data.excerpt || ''} ${content}`.toLowerCase();
  const related = [];
  const add = (filename) => {
    if (!related.includes(filename)) related.push(filename);
  };

  if (/webflow/.test(text)) add(filenameForService('webflow-development'));
  if (/framer/.test(text)) add(filenameForService('framer-development'));
  if (/landing page|conversion|website|homepage/.test(text)) {
    add(filenameForService('website-design'));
    if (/landing page|conversion/.test(text)) add(filenameForOffer('conversion-design'));
  }
  if (/design system|product ui|interface|dashboard|onboarding|web app|ux\b|ui\b/.test(text)) add(filenameForService('web-app-design'));
  if (/brand|identity|visual system|logo/.test(text)) add(filenameForService('brand-identity'));
  if (/ai-ready brand|brand system|ai tools|prompt/.test(text)) add(filenameForOffer('ai-ready-brand-system'));
  if (/deck|presentation|investor|pitch/.test(text)) add(filenameForService('presentation-design'));
  if (/social|content|founder|campaign|linkedin|carousel/.test(text)) {
    add(filenameForService('social-media-creatives'));
    if (/founder|linkedin|carousel/.test(text)) add(filenameForOffer('founder-content-engine'));
  }

  return related.slice(0, 4);
}

function normalizePostTags(data) {
  const tags = [];
  if (Array.isArray(data.tags)) tags.push(...data.tags);
  if (data.category) tags.push(data.category);
  tags.push('blog');
  return tagsFor(tags);
}

function buildBlogEntry(post, pathMap) {
  const data = post.parsed.data;
  const title = data.title || post.slug;
  const description = data.excerpt || firstMarkdownParagraph(post.parsed.content);
  const rewrittenBody = rewriteInternalLinks(post.parsed.content.trim(), pathMap);
  const related = relatedBlogConcepts(post, rewrittenBody);
  const relatedBlock = related.length ? '## Related Concepts\n\n<RELATED>' : '';
  const body = joinBlocks([`# ${title}`, rewrittenBody, relatedBlock]);

  return {
    group: 'blog',
    filename: filenameForBlog(post.slug),
    type: 'Article',
    title,
    description,
    resource: resourceUrl(`/blog/${post.slug}`),
    tags: normalizePostTags(data),
    timestamp: toTimestamp(post.rawDate || data.date, post.relativePath),
    related,
    body
  };
}

function fillRelated(entries) {
  const entriesByFilename = new Map(entries.map((entry) => [entry.filename, entry]));
  return entries.map((entry) => ({
    ...entry,
    body: entry.body.replace('<RELATED>', relatedList(entry.related || [], entriesByFilename) || '- No related OKF concepts generated from the current source data.')
  }));
}

function writeConcept(entry) {
  fs.writeFileSync(
    path.join(OKF_DIR, entry.filename),
    `${frontmatter(entry)}${entry.body.trim()}\n`,
    'utf8'
  );
}

function groupEntries(entries, group) {
  return entries.filter((entry) => entry.group === group);
}

function buildIndex(entries, counts) {
  const sections = [
    ['Marquee Pages', groupEntries(entries, 'marquee')],
    ['Services', groupEntries(entries, 'services')],
    ['Offers', groupEntries(entries, 'offers')],
    ['Work Case Studies', groupEntries(entries, 'work')],
    ['Blog Posts', groupEntries(entries, 'blog')]
  ];

  const lines = [
    '# MyDesigner OKF Bundle',
    '',
    'Cross-linked markdown bundle generated from published MyDesigner site sources.',
    '',
    '## Counts',
    '',
    `- Marquee pages: ${counts.marquee}`,
    `- Service detail pages: ${counts.services}`,
    `- Offer pages: ${counts.offers}`,
    `- Work case studies: ${counts.work}`,
    `- Published blog posts: ${counts.blog}`,
    ''
  ];

  sections.forEach(([heading, sectionEntries]) => {
    lines.push(`## ${heading}`, '');
    sectionEntries.forEach((entry) => {
      lines.push(`- [${entry.title}](${localLink(entry.filename)}): ${entry.description}`);
    });
    lines.push('');
  });

  return `${lines.join('\n').trim()}\n`;
}

function cleanOkfDir() {
  fs.rmSync(OKF_DIR, { recursive: true, force: true });
  fs.mkdirSync(OKF_DIR, { recursive: true });
}

function validateBundle(entries, counts) {
  const expectedCounts = {
    marquee: MARQUEE_PAGES.length,
    services: SERVICE_CONFIGS.length,
    offers: OFFER_PAGES.length,
    work: PROJECTS.length,
    blog: counts.blog
  };

  Object.entries(expectedCounts).forEach(([group, expected]) => {
    const actual = entries.filter((entry) => entry.group === group).length;
    if (actual !== expected) {
      throw new Error(`Expected ${expected} ${group} entries, found ${actual}`);
    }
  });

  const bundleFiles = new Set(fs.readdirSync(OKF_DIR).filter((file) => file.endsWith('.md')));
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

  fs.readdirSync(OKF_DIR).filter((file) => file.endsWith('.md')).forEach((file) => {
    const raw = fs.readFileSync(path.join(OKF_DIR, file), 'utf8');

    if (file === 'index.md') {
      if (raw.startsWith('---')) {
        throw new Error('okf/index.md must remain a spec-style index without frontmatter');
      }
    } else {
      const parsed = matter(raw);
      if (!parsed.data.type) {
        throw new Error(`${file} is missing required frontmatter field: type`);
      }
    }

    let match;
    while ((match = linkPattern.exec(raw))) {
      const href = match[1].split('#')[0].split('?')[0];
      if (!href.endsWith('.md')) continue;

      const target = href.startsWith('./') ? href.slice(2) : href.replace(/^\//, '');
      if (!bundleFiles.has(target)) {
        throw new Error(`${file} links to missing OKF target: ${href}`);
      }
    }
  });
}

function countByType(entries) {
  return entries.reduce((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + 1;
    return acc;
  }, {});
}

function main() {
  const posts = loadPostSources();
  const pathMap = buildPathMap(posts);
  const entries = fillRelated([
    ...MARQUEE_PAGES.map(buildMarqueeEntry),
    ...SERVICE_CONFIGS.map(buildServiceEntry),
    ...OFFER_PAGES.map(buildOfferEntry),
    ...PROJECTS.map(buildWorkEntry),
    ...posts.map((post) => buildBlogEntry(post, pathMap))
  ]);

  const counts = {
    marquee: MARQUEE_PAGES.length,
    services: SERVICE_CONFIGS.length,
    offers: OFFER_PAGES.length,
    work: PROJECTS.length,
    blog: posts.length
  };

  cleanOkfDir();
  entries.forEach(writeConcept);
  fs.writeFileSync(path.join(OKF_DIR, 'index.md'), buildIndex(entries, counts), 'utf8');
  validateBundle(entries, counts);

  const typeCounts = countByType(entries);
  console.log('Generated OKF bundle: okf/');
  console.log(`  index files: 1`);
  Object.keys(typeCounts).sort().forEach((type) => {
    console.log(`  ${type}: ${typeCounts[type]}`);
  });
  console.log(`  total concept files: ${entries.length}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildPathMap,
  relatedServicesForProject,
  representativeProjectsForService,
  rewriteInternalLinks
};

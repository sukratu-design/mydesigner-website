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
const NAV = require('./partials/nav');
const FOOTER = require('./partials/footer');
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'portfolio');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const CATEGORIES = [
  {
    key: 'uiux',
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    heading: 'UI/UX Design Work',
    description: 'Product design, mobile apps, web apps, and user experience design — from wireframes to production-ready UI.',
    metaTitle: 'UI/UX Design Portfolio — MyDesigner',
    metaDesc: 'Explore MyDesigner\'s UI/UX design work — mobile apps, web apps, and product design for startups and enterprises.',
  },
  {
    key: 'webdev',
    slug: 'web-development',
    title: 'Web Development',
    heading: 'Web Development Work',
    description: 'Webflow and Framer websites designed and developed from concept to launch — responsive, fast, and production-ready.',
    metaTitle: 'Web Development Portfolio — MyDesigner | Webflow & Framer',
    metaDesc: 'Explore MyDesigner\'s Webflow and Framer development work — websites built with precision for startups and growing companies.',
  },
  {
    key: 'graphic',
    slug: 'graphic-design',
    title: 'Graphic Design',
    heading: 'Graphic Design Work',
    description: 'Pitch decks, social media design, presentation design, and visual communication — making complex ideas look clear.',
    metaTitle: 'Graphic Design Portfolio — MyDesigner',
    metaDesc: 'Explore MyDesigner\'s graphic design work — pitch decks, presentation design, and social media for startups and enterprises.',
  },
  {
    key: 'branding',
    slug: 'branding',
    title: 'Branding',
    heading: 'Branding Work',
    description: 'Brand identity, logo design, visual systems, and brand strategy — building brands that are distinctive and durable.',
    metaTitle: 'Branding Portfolio — MyDesigner | Brand Identity & Logo Design',
    metaDesc: 'Explore MyDesigner\'s branding work — brand identity systems, logo design, and visual strategy for startups and growing companies.',
  },
];


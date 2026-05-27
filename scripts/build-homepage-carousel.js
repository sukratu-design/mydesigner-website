#!/usr/bin/env node

/**
 * Builds and injects the latest blog posts carousel into index.html.
 * Extracted from build-blog.js.
 */

const fs = require('fs');
const path = require('path');

const { escapeXml } = require('./lib/utils');

function buildHomepageCarousel(posts) {
  const latest = posts.slice(0, 4);

  const cards = latest
    .map((post) => {
      const cover = post.coverImage
        ? `<figure class="overflow-hidden"><img src="${post.coverImage}" alt="${escapeXml(post.title)}" class="w-full h-48 object-cover" loading="lazy"></figure>`
        : '';
      return `    <div class="flex-none w-[85vw] sm:w-[45vw] lg:w-[calc(25%-1rem)] snap-start">
      <div class="card bg-base-200 border border-base-300 hover:shadow-lg transition-shadow h-full">
        ${cover}
        <div class="card-body gap-2">
          <div class="text-xs text-base-content/60">${post.dateDisplay}</div>
          <h3 class="card-title text-base leading-snug line-clamp-2">${escapeXml(post.title)}</h3>
          <p class="text-sm text-base-content/70 line-clamp-3 flex-1">${escapeXml(post.excerpt)}</p>
          <div class="card-actions justify-end pt-2">
            <a href="/blog/${post.slug}" class="btn btn-primary btn-sm">Read &rarr;</a>
          </div>
        </div>
      </div>
    </div>`;
    })
    .join('\n');

  return `<!-- BLOG_CAROUSEL_START -->
  <section class="py-16 lg:py-24 bg-base-100" id="blog-preview">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-end justify-between mb-8">
        <div>
          <span class="text-sm font-semibold uppercase tracking-wider text-base-content/60">From the Blog</span>
          <h2 class="text-3xl lg:text-4xl font-bold mt-1">Latest insights</h2>
        </div>
        <a href="/blog/" class="btn btn-outline btn-sm hidden sm:inline-flex">View all posts &rarr;</a>
      </div>
      <div class="relative">
        <div id="blog-carousel" class="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4" style="scrollbar-width:none;-ms-overflow-style:none;">
${cards}
        </div>
        <button onclick="document.getElementById('blog-carousel').scrollBy({left:-(document.getElementById('blog-carousel').offsetWidth*0.85),behavior:'smooth'})" class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 btn btn-circle btn-sm bg-base-100 border border-base-300 shadow-md hidden lg:flex" aria-label="Previous">&larr;</button>
        <button onclick="document.getElementById('blog-carousel').scrollBy({left:document.getElementById('blog-carousel').offsetWidth*0.85,behavior:'smooth'})" class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 btn btn-circle btn-sm bg-base-100 border border-base-300 shadow-md hidden lg:flex" aria-label="Next">&rarr;</button>
      </div>
      <div class="mt-6 text-center sm:hidden">
        <a href="/blog/" class="btn btn-outline btn-sm">View all posts &rarr;</a>
      </div>
    </div>
  </section>
  <!-- BLOG_CAROUSEL_END -->`;
}

function injectBlogCarouselIntoHomepage(posts) {
  const INDEX_PATH = path.join(process.cwd(), 'index.html');
  if (fs.existsSync(INDEX_PATH)) {
    const indexHtml = fs.readFileSync(INDEX_PATH, 'utf8');
    const carouselHtml = buildHomepageCarousel(posts);
    const updated = indexHtml.replace(
      /<!-- BLOG_CAROUSEL_START -->[\s\S]*?<!-- BLOG_CAROUSEL_END -->/,
      carouselHtml
    );
    if (updated !== indexHtml) {
      fs.writeFileSync(INDEX_PATH, updated);
      console.log('Updated homepage blog carousel');
    }
  }
}

module.exports = {
  buildHomepageCarousel,
  injectBlogCarouselIntoHomepage
};

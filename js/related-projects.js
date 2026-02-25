/* ========== RELATED PROJECTS ========== */
(function() {
  var section = document.querySelector('[data-related-projects]');
  if (!section) return;

  var category    = section.getAttribute('data-related-projects');
  var currentSlug = section.getAttribute('data-current-slug');

  var projects = [
    { slug: 'dentaldost',       title: 'DentalDost Mobile App',            category: 'uiux',     badge: 'UI/UX Design',    thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/6899fb9b56757a982bc7b955_thumbnail.png',  desc: 'Redefining oral care with a seamless mobile experience' },
    { slug: 'slash',            title: 'Slash',                            category: 'branding', badge: 'Branding',        thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/6899e34d0d3b598be996d12f_thumbnail.png',  desc: 'Where food meets fun — a social dining experience' },
    { slug: 'apollo-radiology', title: 'Apollo Radiology',                 category: 'webdev',   badge: 'Web Development', thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/6891fe07cbf35c33d2810abd_thumbnail.png',  desc: 'Transforming healthcare with Webflow-powered precision' },
    { slug: 'uber-cards',       title: 'Uber Cards',                       category: 'branding', badge: 'Branding',        thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/6899c18241a13c55f8512cc7_thumbnail.png',  desc: 'Crafted a bold, modern logo capturing clarity and trust' },
    { slug: 'poocho-app',       title: 'Poocho App',                       category: 'uiux',     badge: 'UI/UX Design',    thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/68920086cbf35c33d2825fd3_thumbnail.png',  desc: "India's first research productivity tool" },
    { slug: 'ecstra',           title: 'Ecstra',                           category: 'webdev',   badge: 'Web Development', thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/688899a4c46dd38c84f77141_thumbnail.png',  desc: "Seamlessly developing Ecstra's digital presence" },
    { slug: 'dentsu',           title: 'Dentsu',                           category: 'graphic',  badge: 'Graphic Design',  thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/68888bb052ec4ae93210f2a8_thumbnail.png',  desc: 'Evolving a global brand through collaborative social design' },
    { slug: 'scano',            title: 'Scano by DentalDost',              category: 'branding', badge: 'Branding',        thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/688878740d714bfd580b1c96_thumbnail.png',  desc: "Designing India's first smile-scanning brand" },
    { slug: 'travelsaving',     title: 'Travelsaving Pitch Deck',          category: 'graphic',  badge: 'Graphic Design',  thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/6891fb68a7e08822614dbea1_thumbnail.png',  desc: 'Crafting a compelling investor-ready pitch deck' },
    { slug: 'contractwrangler', title: 'ContractWrangler',                 category: 'uiux',     badge: 'UI/UX Design',    thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/688c8c1fdb0b03b9dbbd0f2d_thumbnail.png',  desc: 'Simplifying legal complexity through smart web app design' },
    { slug: 'mda',              title: 'Maharashtra Dyslexia Association', category: 'webdev',   badge: 'Web Development', thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/6891f9621f33f4a1c9e94435_thumbnail.png',  desc: 'Digital transformation built on Framer' },
    { slug: 'vettly',           title: 'Vettly.ai',                       category: 'branding', badge: 'Branding',        thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/68876472fab231b5e9016c3b_1.png',         desc: 'Cohesive branding and smarter web app for AI-driven hiring' },
    { slug: 'fluentpet',        title: 'FluentPet',                        category: 'uiux',     badge: 'UI/UX Design',    thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/688c8c862b37723ffffb71e0_thumbnail.png',  desc: 'Bridging communication between pets and humans' },
    { slug: 'poocho-website',   title: 'Poocho Website',                   category: 'webdev',   badge: 'Web Development', thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/688872ad4fe7e34ca37538f9_thumbnail.png',  desc: 'Website design & Webflow development for a research productivity platform' },
    { slug: 'ahhf',             title: 'AHHF Social Media',                category: 'graphic',  badge: 'Graphic Design',  thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/68887922d0419bbe0a25d6e9_thumbnail.png',  desc: 'Designing for impact — social media for AHHF' },
    { slug: 'neustreet',        title: 'Neustreet',                        category: 'uiux',     badge: 'UI/UX Design',    thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/68887be1afa201b6799c785b_thumbnail.png',  desc: 'The marketplace for modern collectibles' },
    { slug: 'nada',             title: 'NADA',                             category: 'uiux',     badge: 'UI/UX Design',    thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/688c80c1706936e3d80c6389_thumbnail.png',  desc: 'Where exclusivity meets real connection' },
    { slug: 'yespl',            title: 'YESPL',                            category: 'webdev',   badge: 'Web Development', thumb: 'https://cdn.prod.website-files.com/64f99cd63a4fcf5bd6a01c59/68887a97578ece95c92b0cd9_thumbnail.png',  desc: 'Engineering precision, built with Framer' }
  ];

  var related = projects.filter(function(p) {
    return p.category === category && p.slug !== currentSlug;
  }).slice(0, 3);

  if (related.length === 0) return;

  var categoryLabels = {
    uiux:     'UI/UX Design',
    branding: 'Branding',
    webdev:   'Web Development',
    graphic:  'Graphic Design'
  };

  var cards = related.map(function(p) {
    return [
      '<a href="/work/' + p.slug + '.html" class="block group">',
        '<div class="card bg-base-100 border border-base-200 hover:shadow-lg transition-shadow overflow-hidden">',
          '<figure class="overflow-hidden">',
            '<img src="' + p.thumb + '" alt="' + p.title + '" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">',
          '</figure>',
          '<div class="card-body p-4">',
            '<div class="badge badge-outline badge-sm">' + p.badge + '</div>',
            '<h3 class="card-title text-base mt-1">' + p.title + '</h3>',
            '<p class="text-sm text-base-content/60">' + p.desc + '</p>',
            '<p class="text-xs text-primary font-medium mt-1">View case study \u2192</p>',
          '</div>',
        '</div>',
      '</a>'
    ].join('');
  }).join('\n');

  var container = section.querySelector('div');
  container.innerHTML =
    '<h2 class="text-xl font-bold mb-8">More ' + (categoryLabels[category] || 'Projects') + '</h2>' +
    '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">' + cards + '</div>';
})();

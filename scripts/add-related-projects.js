// One-time script: injects related-projects section + fixes into all work/*.html pages
const fs   = require('fs');
const path = require('path');

const projectMap = {
  'dentaldost':       'uiux',
  'slash':            'branding',
  'apollo-radiology': 'webdev',
  'uber-cards':       'branding',
  'poocho-app':       'uiux',
  'ecstra':           'webdev',
  'dentsu':           'graphic',
  'scano':            'branding',
  'travelsaving':     'graphic',
  'contractwrangler': 'uiux',
  'mda':              'webdev',
  'vettly':           'branding',
  'fluentpet':        'uiux',
  'poocho-website':   'webdev',
  'ahhf':             'graphic',
  'neustreet':        'uiux',
  'nada':             'uiux',
  'yespl':            'webdev',
};

const workDir = path.join(__dirname, '..', 'work');

Object.entries(projectMap).forEach(([slug, category]) => {
  const filePath = path.join(workDir, `${slug}.html`);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP  ${slug}.html — file not found`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Add deliverables-heading class to the Deliverables h3
  const oldDeliv = `class="font-bold mb-4 text-sm uppercase tracking-wider opacity-60">Deliverables`;
  const newDeliv = `class="font-bold mb-4 text-sm uppercase tracking-wider opacity-60 deliverables-heading">Deliverables`;
  if (html.includes(oldDeliv) && !html.includes('deliverables-heading')) {
    html = html.replace(oldDeliv, newDeliv);
    changed = true;
  }

  // 2. Insert related-projects section before NEXT/BACK NAV (if not already present)
  const navMarker = '<!-- ===== NEXT / BACK NAV ===== -->';
  const relatedMarker = 'data-related-projects=';
  if (!html.includes(relatedMarker) && html.includes(navMarker)) {
    const relatedSection = [
      '',
      '    <!-- ===== RELATED PROJECTS ===== -->',
      `    <section class="py-14 lg:py-16 border-t border-base-200" data-related-projects="${category}" data-current-slug="${slug}">`,
      '      <div class="max-w-5xl mx-auto px-4">',
      '        <!-- populated by related-projects.js -->',
      '      </div>',
      '    </section>',
      '',
      '    '
    ].join('\n');
    html = html.replace(navMarker, relatedSection + navMarker);
    changed = true;
  }

  // 3. Add related-projects.js script tag before main.js (if not already present)
  const mainJsTag  = '<script src="/js/main.js"></script>';
  const relatedTag = '<script src="/js/related-projects.js"></script>';
  if (!html.includes(relatedTag) && html.includes(mainJsTag)) {
    html = html.replace(mainJsTag, relatedTag + '\n  ' + mainJsTag);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html);
    console.log(`OK    ${slug}.html`);
  } else {
    console.log(`SKIP  ${slug}.html — already up to date`);
  }
});

console.log('\nDone.');

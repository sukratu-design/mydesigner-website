const path = require('path');

const ACTIVE_BY_BUILD_SCRIPT = {
  'build-services.js': 'services',
  'build-work.js': 'work',
  'build-portfolio.js': 'work',
  'build-blog.js': 'blog'
};

const defaultActive = ACTIVE_BY_BUILD_SCRIPT[path.basename(process.argv[1] || '')] || '';

function renderLink({ key, href, label, className }) {
  const current = key === defaultActive ? ' aria-current="page"' : '';
  return `      <a href="${href}" class="${className}"${current}>${label}</a>`;
}

const NAV = `
  <nav class="nav nav--shared" role="navigation" aria-label="Main navigation">
    <a href="/" class="nav__logo" aria-label="MyDesigner home">
      <img src="/assets/images/logo-dark.svg" alt="MyDesigner">
      <span class="nav__logo-text">MyDesigner</span>
    </a>
    <div class="nav__right">
${[
  { key: 'work', href: '/work', label: 'Work', className: 'nav__link nav__optional nav__optional--work' },
  { key: 'services', href: '/services', label: 'Services', className: 'nav__link' },
  { key: 'about', href: '/about', label: 'About', className: 'nav__link nav__optional nav__optional--about' },
  { key: 'blog', href: '/blog/', label: 'Blog', className: 'nav__link nav__optional nav__optional--blog' },
  { key: 'plans', href: '/#ch-plans', label: 'Plans', className: 'nav__link nav__optional nav__optional--plans' }
].map(renderLink).join('\n')}
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="nav__cta nav__cta--shared">Book a call</a>
    </div>
  </nav>
  <script>
    (function () {
      var nav = document.querySelector('.nav');
      if (!nav) return;
      var update = function () { nav.classList.toggle('is-scrolled', window.scrollY > 80); };
      window.addEventListener('scroll', update, { passive: true });
      update();
    })();
  </script>`;

module.exports = NAV;

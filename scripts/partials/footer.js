const { copyrightHtml } = require('./copyright');

const FOOTER = `
  <footer role="contentinfo">
    <div class="footer__brand">
      <a href="/" class="footer__logo" aria-label="MyDesigner home">
        <img src="/assets/images/logo-dark.svg" alt="MyDesigner">
      </a>
      <p>MyDesigner is an AI-native creative team by <a href="https://sukratu.co" target="_blank" rel="noopener">Sukratu</a>. We help growing companies ship web, product, brand, and growth creative with human-level taste, faster execution, and Client Memory that compounds over time.</p>
    </div>
    <nav aria-label="Footer">
      <a href="/work">Work</a>
      <a href="/services">Services</a>
      <a href="/about">About</a>
      <a href="/blog/">Blog</a>
      <a href="/vs/">Compare</a>
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5">Book a call</a>
    </nav>
    <div class="footer__meta">
      <span>${copyrightHtml()}</span>
      <span class="footer__social">
        <a href="https://x.com/mydesigner_gg" aria-label="X">X</a>
        <a href="https://www.linkedin.com/showcase/mydesigner-sukratu" aria-label="LinkedIn">LinkedIn</a>
        <a href="https://instagram.com/mydesigner.gg" aria-label="Instagram">Instagram</a>
      </span>
    </div>
  </footer>`;

module.exports = FOOTER;

const NAV = `
  <nav class="navbar bg-base-100 sticky top-0 z-50 px-4 lg:px-8 border-b border-base-200" role="navigation" aria-label="Main navigation">
    <div class="navbar-start">
      <a href="/" class="flex items-center gap-2 font-bold text-lg" aria-label="MyDesigner home">
        <img src="/assets/images/mydesigner-logo.svg" alt="MyDesigner" class="h-8">
      </a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1 gap-1">
        <li><a href="/services" class="font-medium">Services</a></li>
        <li><a href="/how-it-works" class="font-medium">How It Works</a></li>
        <li><a href="/pricing" class="font-medium">Pricing</a></li>
        <li><a href="/portfolio" class="font-medium">Portfolio</a></li>
        <li><a href="/blog/" class="font-medium">Blog</a></li>
        <li><a href="/faq" class="font-medium">FAQ</a></li>
      </ul>
    </div>
    <div class="navbar-end gap-2">
      <a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm hidden lg:inline-flex">Talk through your creative needs</a>
      <div class="dropdown dropdown-end lg:hidden">
        <div tabindex="0" role="button" aria-label="Open menu" class="btn btn-ghost btn-square">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-lg mt-2">
          <li><a href="/services">Services</a></li>
          <li><a href="/how-it-works">How It Works</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/portfolio">Portfolio</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li class="mt-2"><a href="https://calendar.app.google/xGoKb51qpbcnZgJy5" class="btn btn-primary btn-sm">Talk through your creative needs</a></li>
        </ul>
      </div>
    </div>
  </nav>`;

module.exports = NAV;

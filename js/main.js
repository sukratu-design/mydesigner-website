/* ========== SCROLL REVEAL ========== */
(function() {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(function(el) {
    observer.observe(el);
  });
})();

/* ========== MOBILE FLOATING CTA ========== */
(function() {
  var floatingCta = document.querySelector('.floating-cta');
  if (!floatingCta) return;

  var hero = document.querySelector('[data-hero]') || document.querySelector('section:first-of-type');
  if (!hero) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        floatingCta.classList.remove('visible');
      } else {
        floatingCta.classList.add('visible');
      }
    });
  }, { threshold: 0 });

  observer.observe(hero);
})();

/* ========== MARQUEE DUPLICATE ========== */
(function() {
  var track = document.querySelector('.marquee__track');
  if (!track) return;

  var items = track.innerHTML;
  track.innerHTML = items + items;
})();

/* ========== PORTFOLIO FILTERS ========== */
(function() {
  var filters = document.querySelectorAll('.portfolio-filter');
  var items = document.querySelectorAll('.portfolio-item');

  filters.forEach(function(filter) {
    filter.addEventListener('click', function() {
      var category = this.dataset.filter;

      filters.forEach(function(f) { f.classList.remove('btn-active'); });
      this.classList.add('btn-active');

      items.forEach(function(item) {
        if (category === 'all' || item.dataset.category === category) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
})();

/* ========== NAV SCROLL EFFECT ========== */
(function() {
  var nav = document.querySelector('.navbar');
  if (!nav) return;

  var scrolled = false;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50 && !scrolled) {
      nav.classList.add('shadow-sm');
      scrolled = true;
    } else if (window.scrollY <= 50 && scrolled) {
      nav.classList.remove('shadow-sm');
      scrolled = false;
    }
  });
})();

/* ========== LOADING SPINNER ON BUTTONS ========== */
(function() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn');
    if (!btn || btn.classList.contains('btn-loading')) return;

    // Skip portfolio filter buttons and anchor-only links
    if (btn.classList.contains('portfolio-filter')) return;
    var href = btn.getAttribute('href');
    if (href && href.startsWith('#')) return;

    // Add spinner state
    btn.classList.add('btn-loading');
    btn.style.pointerEvents = 'none';

    // Store original content and inject spinner
    var originalHTML = btn.innerHTML;
    var spinnerSize = btn.classList.contains('btn-sm') ? 'loading-sm' : 'loading-md';
    var spinner = '<span class="loading loading-spinner ' + spinnerSize + '"></span>';
    btn.innerHTML = spinner + ' ' + originalHTML;

    // For links, let navigation happen naturally after a brief visual feedback
    if (btn.tagName === 'A' && href) {
      // Spinner shows, then browser navigates
      return;
    }

    // For non-link buttons, reset after 2s
    setTimeout(function() {
      btn.innerHTML = originalHTML;
      btn.classList.remove('btn-loading');
      btn.style.pointerEvents = '';
    }, 2000);
  });
})();

/* ========== CUSTOM VIEW CURSOR ========== */
(function() {
  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  // Create cursor bubble
  var cursor = document.createElement('div');
  cursor.setAttribute('aria-hidden', 'true');
  cursor.style.cssText = [
    'position:fixed',
    'width:44px',
    'height:44px',
    'background:#000',
    'border-radius:50%',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'pointer-events:none',
    'z-index:99999',
    'top:0',
    'left:0',
    'transform:translate(-50%,-50%) scale(0)',
    'opacity:0',
    'transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
    'will-change:transform,left,top'
  ].join(';');
  cursor.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(cursor);

  // Track mouse — update position directly (no transition on position = no lag)
  document.addEventListener('mousemove', function(e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  // Shrink slightly on mousedown, restore on mouseup
  document.addEventListener('mousedown', function() {
    if (cursor.style.opacity === '1') {
      cursor.style.transform = 'translate(-50%,-50%) scale(0.85)';
    }
  });
  document.addEventListener('mouseup', function() {
    if (cursor.style.opacity === '1') {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    }
  });

  function show() {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursor.style.opacity = '1';
  }
  function hide() {
    cursor.style.transform = 'translate(-50%,-50%) scale(0)';
    cursor.style.opacity = '0';
  }

  // Apply to all target elements — portfolio cards, project images, work cards
  function bindCursor() {
    var targets = document.querySelectorAll(
      '.portfolio-item, [data-cursor="view"], .work-gallery-img, .project-card'
    );
    targets.forEach(function(el) {
      el.style.cursor = 'none';
      el.querySelectorAll('*').forEach(function(child) { child.style.cursor = 'none'; });
      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindCursor);
  } else {
    bindCursor();
  }
})();

/* ========== GA4 CONVERSION TRACKING ========== */
(function() {
  function trackEvent(name, params) {
    if (typeof gtag !== 'function') return;

    gtag('event', name, Object.assign({
      event_category: 'conversion',
      page_location: window.location.pathname
    }, params || {}));
  }

  function normalizePath(href) {
    var url;
    try {
      url = new URL(href, window.location.origin);
    } catch (err) {
      return '';
    }

    return url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  }

  function eventNameForCalendar(label, page) {
    var key = (label + ' ' + page).toLowerCase();

    if (normalizePath(page) === '/how-it-works') {
      return key.includes('final') ? 'how_it_works_click_book_call_final' : 'how_it_works_click_book_call_hero';
    }
    if (key.includes('website sprint') || key.includes('conversion-design')) return 'book_website_sprint';
    if (key.includes('content engine') || key.includes('founder-content-engine')) return 'book_founder_content_engine';
    if (key.includes('brand system') || key.includes('ai-ready-brand-system')) return 'book_ai_ready_brand_system';
    if (key.includes('partner')) return 'book_partner_call';
    if (key.includes('subscription')) return 'start_subscription_click';
    return 'book_creative_growth_call';
  }

  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href*="calendar.app.google"]');
    var label = '';
    var page = window.location.pathname;

    if (link) {
      label = (link.textContent || '').trim();
      var calendarEvent = eventNameForCalendar(label, page);
      if (normalizePath(page) === '/how-it-works' && link.closest('[data-final-cta]')) {
        calendarEvent = 'how_it_works_click_book_call_final';
      }
      trackEvent(calendarEvent, {
        event_label: label,
        link_url: link.href
      });
    }

    var offerLink = e.target.closest('a[href]');
    if (!offerLink) return;

    var offerPath = normalizePath(offerLink.getAttribute('href'));
    var currentPath = normalizePath(window.location.pathname);

    if (currentPath === '/how-it-works') {
      var howEvents = {
        '/services': 'how_it_works_click_services',
        '/conversion-design': 'how_it_works_click_website_sprint',
        '/founder-content-engine': 'how_it_works_click_founder_content',
        '/ai-ready-brand-system': 'how_it_works_click_brand_system',
        '/pricing': 'how_it_works_click_pricing'
      };

      if (howEvents[offerPath]) {
        trackEvent(howEvents[offerPath], {
          event_label: (offerLink.textContent || '').trim(),
          link_path: offerPath
        });
      }
    }

    var offerPaths = ['/conversion-design', '/founder-content-engine', '/ai-ready-brand-system', '/pricing'];
    if (!offerPaths.includes(offerPath)) return;

    var isPricingCta = offerPath === '/pricing' || !!offerLink.closest('#pricing, .pricing, [data-pricing]');
    trackEvent(isPricingCta ? 'pricing_cta_click' : 'offer_card_click', {
      event_label: (offerLink.textContent || '').trim(),
      offer_path: offerPath
    });
  });

  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;

    trackEvent('form_submit', {
      form_id: form.id || '',
      form_name: form.getAttribute('name') || form.getAttribute('aria-label') || ''
    });
  });

  var offerPages = ['/conversion-design', '/founder-content-engine', '/ai-ready-brand-system'];
  var currentPath = normalizePath(window.location.pathname);
  if (!offerPages.includes(currentPath)) return;

  var firedDepths = {};
  var depthTargets = [25, 50, 75, 100];

  function checkScrollDepth() {
    var scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    var percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));

    depthTargets.forEach(function(depth) {
      if (percent >= depth && !firedDepths[depth]) {
        firedDepths[depth] = true;
        trackEvent('offer_page_scroll_depth', {
          scroll_depth: depth,
          offer_path: currentPath
        });
      }
    });
  }

  window.addEventListener('scroll', checkScrollDepth, { passive: true });
  checkScrollDepth();
})();

/* ========== SMOOTH SCROLL FOR ANCHOR LINKS ========== */
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


/* ========== DYNAMIC COPYRIGHT YEAR & LAST UPDATED DATE ========== */
(function() {
  var now = new Date();
  var year = now.getFullYear();
  var monthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Update © year in footer
  document.querySelectorAll('footer p').forEach(function(p) {
    p.innerHTML = p.innerHTML.replace(/© \d{4}/, '© ' + year);
  });

  // Update "Last updated: Month Year" anywhere on the page
  document.querySelectorAll('p, em').forEach(function(el) {
    if (el.childElementCount === 0 && /Last updated:/i.test(el.textContent)) {
      el.innerHTML = el.innerHTML.replace(/Last updated:.*$/i, 'Last updated: ' + monthYear);
    }
  });
})();

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

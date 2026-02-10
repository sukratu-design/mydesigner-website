/* ========== MOBILE NAV ========== */
(function() {
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
})();

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

/* ========== FAQ ACCORDION ========== */
(function() {
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function(item) {
    var question = item.querySelector('.faq-item__question');
    var answer = item.querySelector('.faq-item__answer');

    if (question && answer) {
      question.addEventListener('click', function() {
        var isActive = item.classList.contains('active');

        // Close all
        faqItems.forEach(function(other) {
          other.classList.remove('active');
          var otherAnswer = other.querySelector('.faq-item__answer');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
        });

        // Open clicked (if wasn't active)
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });
})();

/* ========== MOBILE FLOATING CTA ========== */
(function() {
  var floatingCta = document.querySelector('.floating-cta');
  if (!floatingCta) return;

  var hero = document.querySelector('.hero') || document.querySelector('.page-header');
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

/* ========== PRICING TOGGLE ========== */
(function() {
  var toggle = document.querySelector('.pricing-toggle__switch');
  if (!toggle) return;

  var monthlyLabel = document.querySelector('[data-pricing="monthly"]');
  var yearlyLabel = document.querySelector('[data-pricing="yearly"]');
  var monthlyPrices = document.querySelectorAll('[data-price-monthly]');
  var yearlyPrices = document.querySelectorAll('[data-price-yearly]');
  var periodLabels = document.querySelectorAll('.pricing-card__period');

  toggle.addEventListener('click', function() {
    var isYearly = toggle.classList.toggle('active');

    if (monthlyLabel) monthlyLabel.classList.toggle('active', !isYearly);
    if (yearlyLabel) yearlyLabel.classList.toggle('active', isYearly);

    monthlyPrices.forEach(function(el) {
      el.style.display = isYearly ? 'none' : '';
    });
    yearlyPrices.forEach(function(el) {
      el.style.display = isYearly ? '' : 'none';
    });
    periodLabels.forEach(function(el) {
      el.textContent = isYearly ? '/yr' : '/mo';
    });
  });
})();

/* ========== MARQUEE DUPLICATE ========== */
(function() {
  var track = document.querySelector('.marquee__track');
  if (!track) return;

  // Clone items for seamless loop
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

      filters.forEach(function(f) { f.classList.remove('active'); });
      this.classList.add('active');

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
  var nav = document.querySelector('.nav');
  if (!nav) return;

  var scrolled = false;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50 && !scrolled) {
      nav.style.borderBottomColor = 'rgba(108, 92, 231, 0.2)';
      scrolled = true;
    } else if (window.scrollY <= 50 && scrolled) {
      nav.style.borderBottomColor = '';
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

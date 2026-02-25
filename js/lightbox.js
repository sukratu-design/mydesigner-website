/* ========== LIGHTBOX ========== */
(function () {
  var gallery = document.getElementById('project-gallery');
  if (!gallery) return;

  var imgs = Array.from(gallery.querySelectorAll('img'));
  if (!imgs.length) return;

  var current = 0;

  /* ---- Inject styles ---- */
  var style = document.createElement('style');
  style.textContent = [
    '#lb-backdrop{',
      'position:fixed;inset:0;z-index:9999;',
      'background:rgba(0,0,0,0.92);',
      'display:flex;align-items:center;justify-content:center;',
      'opacity:0;transition:opacity .25s ease;',
      'cursor:zoom-out;',
    '}',
    '#lb-backdrop.lb-open{opacity:1;}',
    '#lb-img-wrap{',
      'position:relative;',
      'transform:scale(.93);transition:transform .25s ease;',
      'cursor:default;',
    '}',
    '#lb-backdrop.lb-open #lb-img-wrap{transform:scale(1);}',
    '#lb-img{',
      'display:block;',
      'max-width:92vw;max-height:88vh;',
      'object-fit:contain;',
      'border-radius:12px;',
      'user-select:none;',
    '}',
    '#lb-close,#lb-prev,#lb-next{',
      'position:fixed;',
      'background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);',
      'border:none;border-radius:50%;',
      'width:44px;height:44px;',
      'display:flex;align-items:center;justify-content:center;',
      'cursor:pointer;color:#fff;',
      'transition:background .2s;',
      'z-index:10000;',
    '}',
    '#lb-close:hover,#lb-prev:hover,#lb-next:hover{background:rgba(255,255,255,0.25);}',
    '#lb-close{top:16px;right:16px;}',
    '#lb-prev{left:16px;top:50%;transform:translateY(-50%);}',
    '#lb-next{right:16px;top:50%;transform:translateY(-50%);}',
    '#lb-prev.lb-hidden,#lb-next.lb-hidden{opacity:0;pointer-events:none;}',
    '#lb-counter{',
      'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);',
      'color:rgba(255,255,255,0.6);font-size:13px;font-family:Inter,sans-serif;',
      'letter-spacing:.05em;z-index:10000;pointer-events:none;',
    '}',
  ].join('');
  document.head.appendChild(style);

  /* ---- Build DOM ---- */
  var backdrop = document.createElement('div');
  backdrop.id = 'lb-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Image lightbox');

  var wrap = document.createElement('div');
  wrap.id = 'lb-img-wrap';

  var lbImg = document.createElement('img');
  lbImg.id = 'lb-img';
  lbImg.alt = '';

  var closeBtn = document.createElement('button');
  closeBtn.id = 'lb-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  var prevBtn = document.createElement('button');
  prevBtn.id = 'lb-prev';
  prevBtn.setAttribute('aria-label', 'Previous image');
  prevBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';

  var nextBtn = document.createElement('button');
  nextBtn.id = 'lb-next';
  nextBtn.setAttribute('aria-label', 'Next image');
  nextBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  var counter = document.createElement('div');
  counter.id = 'lb-counter';

  wrap.appendChild(lbImg);
  backdrop.appendChild(wrap);
  backdrop.appendChild(closeBtn);
  backdrop.appendChild(prevBtn);
  backdrop.appendChild(nextBtn);
  backdrop.appendChild(counter);
  document.body.appendChild(backdrop);

  /* ---- State ---- */
  function updateUI() {
    lbImg.src = imgs[current].src;
    lbImg.alt = imgs[current].alt || '';
    counter.textContent = (current + 1) + ' / ' + imgs.length;
    prevBtn.classList.toggle('lb-hidden', current === 0);
    nextBtn.classList.toggle('lb-hidden', current === imgs.length - 1);
  }

  function open(index) {
    current = index;
    updateUI();
    backdrop.style.display = 'flex';
    // Force reflow so transition fires
    backdrop.offsetHeight; // eslint-disable-line
    backdrop.classList.add('lb-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    backdrop.classList.remove('lb-open');
    document.body.style.overflow = '';
    setTimeout(function () { backdrop.style.display = 'none'; }, 250);
  }

  function prev() { if (current > 0) { current--; updateUI(); } }
  function next() { if (current < imgs.length - 1) { current++; updateUI(); } }

  /* ---- Wire gallery images ---- */
  imgs.forEach(function (img, i) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function () { open(i); });
  });

  /* ---- Controls ---- */
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });

  // Click backdrop (not image) to close
  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop || e.target === wrap) close();
  });

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if (backdrop.style.display !== 'flex') return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Touch swipe
  var touchStartX = 0;
  backdrop.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  backdrop.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  backdrop.style.display = 'none';
})();

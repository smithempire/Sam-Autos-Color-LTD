/* =========================================================
   SAM AUTOS COLOR LIMITED — Script
   Vanilla JS. No frameworks, no dependencies.

   Structure: each feature is an isolated init function run through run(),
   so if one component throws (e.g. its markup is missing) the rest of the
   site still initializes. All DOM queries are existence-checked.
   ========================================================= */

(function () {
  'use strict';

  /* Canonical business WhatsApp number (digits only, for wa.me links). */
  var WA_NUMBER = '2347058181425';

  var prefersReducedMotion = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /* Run a component in isolation — a failure is logged, never fatal. */
  function run(name, fn) {
    try { fn(); } catch (err) { console.warn('[init] "' + name + '" failed:', err); }
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* ---------- Loading screen ---------- */
  function initLoader() {
    var loader = document.getElementById('loader');
    if (!loader) return;
    var hide = function () { loader.classList.add('hidden'); };
    if (document.readyState === 'complete') {
      setTimeout(hide, 400);
    } else {
      window.addEventListener('load', function () { setTimeout(hide, 400); }, { once: true });
    }
    // Safety net in case 'load' never fires (cached sub-resources, etc.).
    setTimeout(hide, 2500);
  }

  /* ---------- Sticky header, scroll progress, back-to-top, active nav ---------- */
  function initScrollFeatures() {
    var header = document.getElementById('siteHeader');
    var scrollProgress = document.getElementById('scrollProgress');
    var backToTop = document.getElementById('backToTop');
    var sections = ['home', 'about', 'gallery', 'supplies', 'order', 'contact']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    var navItems = document.querySelectorAll('[data-nav]');

    function updateActiveNav() {
      if (!navItems.length || !sections.length) return;
      var currentId = sections[0].id;
      var scrollPos = window.scrollY + 140;
      sections.forEach(function (sec) { if (sec.offsetTop <= scrollPos) currentId = sec.id; });
      navItems.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
      });
    }

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('scrolled', y > 40);
      if (backToTop) backToTop.classList.toggle('visible', y > 600);
      if (scrollProgress) {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      }
      updateActiveNav();
    }

    document.addEventListener('scroll', onScroll, { passive: true });
    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
    }
    onScroll();
  }

  /* ---------- Mobile menu (hamburger + off-canvas panel) ---------- */
  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    // Reuse a single backdrop element; never create duplicates.
    var backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);
    }

    var mq = window.matchMedia('(max-width: 860px)');
    var lastFocused = null;
    var focusable = function () { return Array.prototype.slice.call(navLinks.querySelectorAll('a[href]')); };
    var isOpen = function () { return navLinks.classList.contains('open'); };

    function openMenu() {
      if (isOpen()) return;
      lastFocused = document.activeElement;
      navLinks.classList.add('open');
      navLinks.inert = false; // panel must be interactive before we focus into it
      hamburger.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add('menu-open');
      hamburger.setAttribute('aria-expanded', 'true');
      var first = focusable()[0];
      if (first) first.focus();
    }

    function closeMenu(restoreFocus) {
      if (!isOpen()) return;
      navLinks.classList.remove('open');
      // On mobile the closed panel is off-screen: inert removes its links from the
      // tab order and accessibility tree (their focus ring would be clipped off-screen).
      navLinks.inert = mq.matches;
      hamburger.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      // Return focus to the hamburger unless focus should stay put (link navigation).
      if (restoreFocus !== false) hamburger.focus();
    }

    hamburger.addEventListener('click', function () {
      isOpen() ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', function () { closeMenu(); });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      } else if (e.key === 'Tab') {
        // Lightweight focus trap in real DOM/tab order: nav links first, hamburger last.
        var items = focusable().concat([hamburger]);
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // inert only on the off-canvas mobile panel while closed; the inline desktop
    // nav must always stay interactive.
    function syncInert() { navLinks.inert = mq.matches && !isOpen(); }

    // Leaving the mobile breakpoint (e.g. rotate to landscape / resize to desktop)
    // resets the menu so it never gets stuck open in the desktop layout.
    var onBreakpoint = function () { if (!mq.matches) closeMenu(false); syncInert(); };
    if (mq.addEventListener) mq.addEventListener('change', onBreakpoint);
    else if (mq.addListener) mq.addListener(onBreakpoint);

    syncInert(); // set the correct initial state for this viewport
  }

  /* ---------- Smooth in-page scrolling with fixed-header offset ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId.length <= 1) return; // ignore bare "#"
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        var offset = 90;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- Scroll-reveal animations ---------- */
  function initReveal() {
    var revealEls = document.querySelectorAll('[data-reveal]');
    if (!revealEls.length) return;
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('in-view'); }, (idx % 6) * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Hero statistic counters ---------- */
  function initCounters() {
    var nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;

    var formatter = new Intl.NumberFormat('en-US');
    var reduce = prefersReducedMotion();

    function animate(el) {
      if (el.dataset.counted) return;      // run only once per element
      el.dataset.counted = '1';
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) target = 0;       // never render NaN

      if (reduce) { el.textContent = formatter.format(target); return; }

      var duration = 1600;
      var start = performance.now();
      (function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatter.format(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = formatter.format(target); // land exactly on target
      })(start);
    }

    if (!('IntersectionObserver' in window)) {
      nums.forEach(animate); // no observer support → just show final values
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Hero slideshow ---------- */
  function initHeroSlideshow() {
    var slides = document.querySelectorAll('.hero-slide');
    var dotsWrap = document.getElementById('heroSlideDots');
    var heroSection = document.getElementById('hero');
    if (slides.length < 2 || !dotsWrap) return;

    var current = 0;
    var timer = null;
    var reduce = prefersReducedMotion();
    var INTERVAL = 5000;

    dotsWrap.innerHTML = '';
    slides.forEach(function (_, i) {
      var dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', 'Show slide ' + (i + 1));
      dot.addEventListener('click', function () { show(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.children;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('active', i === current); });
      Array.prototype.forEach.call(dots, function (d, i) { d.classList.toggle('active', i === current); });
    }
    function start() { if (reduce || timer) return; timer = setInterval(function () { show(current + 1); }, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (heroSection) {
      heroSection.addEventListener('mouseenter', stop);
      heroSection.addEventListener('mouseleave', start);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    start();
  }

  /* ---------- Floating paint particles (decorative) ---------- */
  function initParticles() {
    var wrap = document.getElementById('paintParticles');
    if (!wrap || prefersReducedMotion()) return;
    var colors = ['#2451B8', '#3E6BD6', '#FF6B1A', '#FF9142', '#7C8B9C'];
    var count = window.innerWidth < 700 ? 10 : 20;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      var size = 6 + Math.random() * 14;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
      p.style.animationDuration = (10 + Math.random() * 14) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      wrap.appendChild(p);
    }
  }

  /* ---------- Product gallery filtering ---------- */
  function initGalleryFilter() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.g-card');
    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        var filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-cat') === filter;
          card.classList.toggle('hide', !match);
        });
      });
    });
  }

  /* ---------- Testimonial carousel ---------- */
  function initTestimonials() {
    var slider = document.querySelector('.reviews-slider');
    var track = document.getElementById('reviewsTrack');
    var dotsWrap = document.getElementById('reviewsDots');
    var prevBtn = document.getElementById('reviewPrev');
    var nextBtn = document.getElementById('reviewNext');
    if (!slider || !track || !track.children.length) return; // no slider → skip cleanly

    var status = document.getElementById('reviewsStatus');
    var slideCount = track.children.length;
    var reduce = prefersReducedMotion();
    var current = 0;
    var timer = null;
    var INTERVAL = 6000;

    // Build dot controls as real buttons (keyboard + AT friendly).
    var dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < slideCount; i++) {
        (function (idx) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'reviews-dot' + (idx === 0 ? ' active' : '');
          dot.setAttribute('aria-label', 'Show testimonial ' + (idx + 1) + ' of ' + slideCount);
          dot.addEventListener('click', function () { goTo(idx, true); restart(); });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        })(i);
      }
    }

    function goTo(index, announce) {
      current = (index + slideCount) % slideCount;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === current);
        if (i === current) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
      // Announce only user-initiated changes — not the 6s auto-advance, which
      // would otherwise interrupt a screen-reader user reading elsewhere.
      if (announce && status) status.textContent = 'Testimonial ' + (current + 1) + ' of ' + slideCount;
    }
    var next = function (announce) { goTo(current + 1, announce); };
    var prev = function (announce) { goTo(current - 1, announce); };

    // Exactly one active timer, and it resumes only when nothing is pausing it
    // (not hovered, not focused, tab visible). maybeStart() enforces that so an
    // interaction while focused/hovered can't re-arm autoplay under the user.
    var hovered = false, focused = false;
    function start() { if (reduce || timer) return; timer = setInterval(function () { next(false); }, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function maybeStart() { if (!hovered && !focused && !document.hidden) start(); }
    function restart() { stop(); maybeStart(); }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(true); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(true); restart(); });

    // Pause on hover and on keyboard focus; resume only when BOTH are gone.
    slider.addEventListener('mouseenter', function () { hovered = true; stop(); });
    slider.addEventListener('mouseleave', function () { hovered = false; maybeStart(); });
    slider.addEventListener('focusin', function () { focused = true; stop(); });
    slider.addEventListener('focusout', function (e) {
      if (!slider.contains(e.relatedTarget)) { focused = false; maybeStart(); }
    });
    // Pause when the tab is hidden.
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : maybeStart(); });

    // Keyboard: left/right arrows when the carousel has focus.
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(true); restart(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(true); restart(); }
    });

    // Touch swipe (passive — does not block vertical page scrolling).
    var startX = null;
    var swipeTarget = slider.querySelector('.reviews-viewport') || track;
    swipeTarget.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; stop(); }, { passive: true });
    swipeTarget.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { dx < 0 ? next(true) : prev(true); }
      startX = null;
      maybeStart();
    }, { passive: true });

    goTo(0);
    start();
  }

  /* ---------- FAQ accordion ---------- */
  function initFAQ() {
    var items = document.querySelectorAll('.acc-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var trigger = item.querySelector('.acc-trigger');
      var panel = item.querySelector('.acc-panel');
      if (!trigger || !panel) return;

      // Collapsed on load: mark inert so the answer is pruned from the accessibility
      // tree (max-height:0 hides it only visually — otherwise a screen reader reads
      // every collapsed answer aloud despite aria-expanded="false").
      panel.inert = true;

      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');

        document.querySelectorAll('.acc-item.open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('open');
            var t = openItem.querySelector('.acc-trigger');
            var p = openItem.querySelector('.acc-panel');
            if (t) t.setAttribute('aria-expanded', 'false');
            if (p) { p.style.maxHeight = null; p.inert = true; }
          }
        });

        item.classList.toggle('open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
        panel.inert = isOpen; // inert when it was open (now closing); interactive when opening
      });
    });

    // Keep any open panel's height in sync with content when the viewport reflows
    // (rotation/resize); the pixel max-height is otherwise frozen at click time.
    var resizeTimer;
    function refreshOpenPanels() {
      document.querySelectorAll('.acc-item.open .acc-panel').forEach(function (p) {
        p.style.transition = 'none';
        p.style.maxHeight = p.scrollHeight + 'px';
        void p.offsetHeight; // force reflow so the suppressed transition applies cleanly
        p.style.transition = '';
      });
    }
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshOpenPanels, 100);
    });
    window.addEventListener('orientationchange', refreshOpenPanels);
  }

  /* ---------- Order form: validation + WhatsApp hand-off ---------- */
  function initOrderForm() {
    var form = document.getElementById('orderForm');
    var formSuccess = document.getElementById('formSuccess');
    if (!form) return;

    function setError(fieldId, message) {
      var errEl = document.getElementById('err-' + fieldId);
      var field = document.getElementById(fieldId);
      var row = field ? field.closest('.form-row') : null;
      if (errEl) errEl.textContent = message || '';
      if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (row) row.classList.toggle('invalid', Boolean(message));
    }

    function validate(data) {
      var valid = true;
      if (!data.custName.trim()) { setError('custName', 'Please enter your name.'); valid = false; }
      else setError('custName', '');

      if (data.custPhone.replace(/\D/g, '').length < 10) { setError('custPhone', 'Please enter a valid phone number.'); valid = false; }
      else setError('custPhone', '');

      if (!data.prodName.trim()) { setError('prodName', 'Please tell us which product you need.'); valid = false; }
      else setError('prodName', '');

      if (!data.qty || Number(data.qty) < 1) { setError('qty', 'Enter a quantity of at least 1.'); valid = false; }
      else setError('qty', '');

      return valid;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
      var data = {
        custName: val('custName'), custPhone: val('custPhone'), prodName: val('prodName'),
        qty: val('qty'), color: val('color'), message: val('message')
      };

      if (!validate(data)) {
        if (formSuccess) formSuccess.textContent = '';
        // Move focus to the first invalid field so a screen reader announces its
        // label + associated error (aria-describedby) — satisfies WCAG 3.3.1.
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var lines = [
        'Hello SAM AUTOS COLOR LIMITED, I would like to place an order.',
        'Name: ' + data.custName,
        'Phone: ' + data.custPhone,
        'Product: ' + data.prodName,
        'Quantity: ' + data.qty,
        data.color ? 'Preferred Colour: ' + data.color : null,
        data.message ? 'Message: ' + data.message : null
      ].filter(Boolean).join('\n');

      var whatsappUrl = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines);

      // Open via a real anchor click rather than window.open() — less likely to be
      // blocked by mobile popup blockers since it mimics a genuine link click.
      var opener = document.createElement('a');
      opener.href = whatsappUrl;
      opener.target = '_blank';
      opener.rel = 'noopener';
      document.body.appendChild(opener);
      opener.click();
      opener.remove();

      if (formSuccess) {
        formSuccess.innerHTML = 'Order details ready — WhatsApp should have opened in a new tab. ' +
          'If nothing happened, <a href="' + whatsappUrl + '" target="_blank" rel="noopener" ' +
          'style="color:#2451B8;font-weight:700;text-decoration:underline;">tap here to send it manually</a>.';
      }
    });

    form.addEventListener('reset', function () {
      ['custName', 'custPhone', 'prodName', 'qty'].forEach(function (id) { setError(id, ''); });
      if (formSuccess) formSuccess.textContent = '';
    });
  }

  /* ---------- Newsletter (front-end only) ---------- */
  function initNewsletter() {
    var form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('newsletterEmail');
      if (!input) return;
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        input.value = '';
        input.placeholder = 'Subscribed! Thank you.';
      } else {
        input.focus();
      }
    });
  }

  /* ---------- Button ripple effect ---------- */
  function initRipple() {
    if (prefersReducedMotion()) return;
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var rect = this.getBoundingClientRect();
        var ripple = document.createElement('span');
        var size = Math.max(rect.width, rect.height);
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 600);
      });
    });
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Boot ---------- */
  ready(function () {
    run('loader', initLoader);
    run('scrollFeatures', initScrollFeatures);
    run('mobileMenu', initMobileMenu);
    run('smoothScroll', initSmoothScroll);
    run('reveal', initReveal);
    run('counters', initCounters);
    run('heroSlideshow', initHeroSlideshow);
    run('particles', initParticles);
    run('galleryFilter', initGalleryFilter);
    run('testimonials', initTestimonials);
    run('faq', initFAQ);
    run('orderForm', initOrderForm);
    run('newsletter', initNewsletter);
    run('ripple', initRipple);
    run('footerYear', initFooterYear);
  });
})();

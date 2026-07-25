/* =========================================================
   SAM AUTOS COLOR LIMITED — Script (rebuild)
   Vanilla JS. Each feature is an independent initializer run
   through runComponent(), so one failure never blocks the rest.
   ========================================================= */

(function () {
  'use strict';

  /* Fresh-content guard: if a browser (notably iOS Safari) restores this page
     from its back/forward cache, reload so visitors get the latest version. */
  window.addEventListener('pageshow', function (e) { if (e.persisted) window.location.reload(); });

  var WA_NUMBER = '2347058181425';
  var reduceMotion = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /* Run a component in isolation. */
  function runComponent(name, initializer) {
    try { initializer(); } catch (error) { console.error('[' + name + '] failed', error); }
  }

  /* ---------- Loader ---------- */
  function initLoader() {
    var loader = document.getElementById('loader');
    if (!loader) return;
    var hide = function () { loader.classList.add('is-hidden'); };
    if (document.readyState === 'complete') setTimeout(hide, 350);
    else window.addEventListener('load', function () { setTimeout(hide, 350); }, { once: true });
    setTimeout(hide, 2500); // safety net
  }

  /* ---------- Scroll effects: sticky header, progress, active nav, back-to-top ---------- */
  function initScrollEffects() {
    var header = document.getElementById('siteHeader');
    var progress = document.getElementById('scrollProgress');
    var backToTop = document.getElementById('backToTop');
    var sections = ['home', 'about', 'gallery', 'supplies', 'order', 'contact']
      .map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var navItems = document.querySelectorAll('[data-nav]');

    function updateActiveNav() {
      if (!navItems.length || !sections.length) return;
      var current = sections[0].id;
      var pos = window.scrollY + 160;
      sections.forEach(function (s) { if (s.offsetTop <= pos) current = s.id; });
      navItems.forEach(function (link) {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
      });
    }
    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-scrolled', y > 30);
      if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
      if (progress) {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      }
      updateActiveNav();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var panel = document.getElementById('navLinks');
    if (!hamburger || !panel) return;

    var backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);
    }

    var mqDesktop = window.matchMedia('(min-width: 880px)');
    var links = function () { return Array.prototype.slice.call(panel.querySelectorAll('a[href]')); };
    var isOpen = function () { return panel.classList.contains('is-open'); };

    function open() {
      if (isOpen()) return;
      panel.classList.add('is-open');
      panel.inert = false;
      hamburger.classList.add('is-open');
      backdrop.classList.add('is-open');
      document.body.classList.add('is-menu-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close navigation menu');
      var first = links()[0];
      if (first) first.focus();
    }
    function close(returnFocus) {
      if (!isOpen()) return;
      panel.classList.remove('is-open');
      panel.inert = !mqDesktop.matches;
      hamburger.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.classList.remove('is-menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation menu');
      if (returnFocus !== false) hamburger.focus();
    }

    hamburger.addEventListener('click', function () { isOpen() ? close() : open(); });
    backdrop.addEventListener('click', function () { close(); });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { close(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') {
        var items = links().concat([hamburger]); // DOM/tab order: links then hamburger
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Only inert the off-canvas panel (mobile, closed); desktop inline nav stays interactive.
    function syncInert() { panel.inert = !mqDesktop.matches && !isOpen(); }
    var onChange = function () { if (mqDesktop.matches) close(false); syncInert(); };
    if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', onChange);
    else if (mqDesktop.addListener) mqDesktop.addListener(onChange);
    syncInert();
  }

  /* ---------- Smooth in-page scrolling ---------- */
  function initSmoothScroll() {
    var header = document.getElementById('siteHeader');
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id.length <= 1) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var offset = (header ? header.getBoundingClientRect().height : 68) + 12;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: reduceMotion() ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (reduceMotion() || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('is-visible'); }, (i % 6) * 70);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Statistic counters ---------- */
  function initCounters() {
    var nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;
    var fmt = new Intl.NumberFormat('en-US');
    var reduce = reduceMotion();

    function animate(el) {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) target = 0;
      if (reduce) { el.textContent = fmt.format(target); return; }
      var duration = 1600, start = performance.now();
      (function tick(now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt.format(Math.floor(eased * target));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt.format(target);
      })(start);
    }

    if (!('IntersectionObserver' in window)) { nums.forEach(animate); return; }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero slideshow ---------- */
  function initHero() {
    var slides = document.querySelectorAll('.hero-slide');
    var dotsWrap = document.getElementById('heroSlideDots');
    var hero = document.getElementById('home');
    if (slides.length < 2 || !dotsWrap) return;

    var current = 0, timer = null, reduce = reduceMotion(), INTERVAL = 5000;
    dotsWrap.innerHTML = '';
    slides.forEach(function (_, i) {
      var dot = document.createElement('span');
      if (i === 0) dot.classList.add('is-active');
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', 'Show slide ' + (i + 1));
      dot.addEventListener('click', function () { show(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.children;

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === current); });
      Array.prototype.forEach.call(dots, function (d, n) { d.classList.toggle('is-active', n === current); });
    }
    function start() { if (reduce || timer) return; timer = setInterval(function () { show(current + 1); }, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    start();
  }

  /* ---------- Paint particles (decorative) ---------- */
  function initParticles() {
    var wrap = document.getElementById('paintParticles');
    if (!wrap || reduceMotion()) return;
    var colors = ['#2451B8', '#3E6BD6', '#FF6B1A', '#FF9142', '#7C8B9C'];
    var count = window.innerWidth < 700 ? 8 : 16;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      var size = 6 + Math.random() * 12;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty('--dx', (Math.random() * 70 - 35) + 'px');
      p.style.animationDuration = (10 + Math.random() * 14) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      wrap.appendChild(p);
    }
  }

  /* ---------- Gallery filtering ---------- */
  function initGallery() {
    var btns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.g-card');
    if (!btns.length || !cards.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        var filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-cat') === filter;
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  /* ---------- Testimonial carousel ---------- */
  function initTestimonials() {
    var root = document.getElementById('reviews');
    var track = document.getElementById('reviewsTrack');
    var dotsWrap = document.getElementById('reviewsDots');
    var prevBtn = document.getElementById('reviewPrev');
    var nextBtn = document.getElementById('reviewNext');
    var status = document.getElementById('reviewsStatus');
    if (!root || !track || !track.children.length) return;

    var count = track.children.length, reduce = reduceMotion();
    var current = 0, timer = null, INTERVAL = 6000, hovered = false, focused = false, startX = null;

    var dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < count; i++) {
        (function (idx) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'reviews-dot' + (idx === 0 ? ' is-active' : '');
          dot.setAttribute('aria-label', 'Show testimonial ' + (idx + 1) + ' of ' + count);
          dot.addEventListener('click', function () { goTo(idx, true); restart(); });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        })(i);
      }
    }

    function goTo(index, announce) {
      current = (index + count) % count;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === current);
        if (n === current) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      if (announce && status) status.textContent = 'Testimonial ' + (current + 1) + ' of ' + count;
    }
    var next = function (a) { goTo(current + 1, a); };
    var prev = function (a) { goTo(current - 1, a); };

    function start() { if (reduce || timer) return; timer = setInterval(function () { next(false); }, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function maybeStart() { if (!hovered && !focused && !document.hidden) start(); }
    function restart() { stop(); maybeStart(); }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(true); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(true); restart(); });

    root.addEventListener('mouseenter', function () { hovered = true; stop(); });
    root.addEventListener('mouseleave', function () { hovered = false; maybeStart(); });
    root.addEventListener('focusin', function () { focused = true; stop(); });
    root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) { focused = false; maybeStart(); } });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : maybeStart(); });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(true); restart(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(true); restart(); }
    });

    var swipe = root.querySelector('.reviews-viewport') || track;
    swipe.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; stop(); }, { passive: true });
    swipe.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { dx < 0 ? next(true) : prev(true); }
      startX = null; maybeStart();
    }, { passive: true });

    goTo(0);
    start();
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    var items = document.querySelectorAll('.acc-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var trigger = item.querySelector('.acc-trigger');
      var panel = item.querySelector('.acc-panel');
      if (!trigger || !panel) return;
      panel.inert = true; // collapsed: hide from tab order + a11y tree

      trigger.addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');
        document.querySelectorAll('.acc-item.is-open').forEach(function (open) {
          if (open !== item) {
            open.classList.remove('is-open');
            var t = open.querySelector('.acc-trigger'); if (t) t.setAttribute('aria-expanded', 'false');
            var p = open.querySelector('.acc-panel'); if (p) { p.style.maxHeight = null; p.inert = true; }
          }
        });
        item.classList.toggle('is-open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
        panel.style.maxHeight = willOpen ? panel.scrollHeight + 'px' : null;
        panel.inert = !willOpen;
      });
    });

    // Keep an open panel's height correct after reflow (rotation / resize).
    var t;
    function refresh() {
      document.querySelectorAll('.acc-item.is-open .acc-panel').forEach(function (p) {
        p.style.transition = 'none';
        p.style.maxHeight = p.scrollHeight + 'px';
        void p.offsetHeight;
        p.style.transition = '';
      });
    }
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(refresh, 120); });
    window.addEventListener('orientationchange', refresh);
  }

  /* ---------- Order form ---------- */
  function initOrderForm() {
    var form = document.getElementById('orderForm');
    var success = document.getElementById('formSuccess');
    if (!form) return;

    function setError(id, message) {
      var errEl = document.getElementById('err-' + id);
      var field = document.getElementById(id);
      var row = field ? field.closest('.form-row') : null;
      if (errEl) errEl.textContent = message || '';
      if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (row) row.classList.toggle('is-invalid', Boolean(message));
    }
    function validate(d) {
      var ok = true;
      if (!d.custName.trim()) { setError('custName', 'Please enter your name.'); ok = false; } else setError('custName', '');
      if (d.custPhone.replace(/\D/g, '').length < 10) { setError('custPhone', 'Please enter a valid phone number.'); ok = false; } else setError('custPhone', '');
      if (!d.prodName.trim()) { setError('prodName', 'Please tell us which product you need.'); ok = false; } else setError('prodName', '');
      if (!d.qty || Number(d.qty) < 1) { setError('qty', 'Enter a quantity of at least 1.'); ok = false; } else setError('qty', '');
      return ok;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
      var data = { custName: val('custName'), custPhone: val('custPhone'), prodName: val('prodName'), qty: val('qty'), color: val('color'), message: val('message') };

      if (!validate(data)) {
        if (success) success.textContent = '';
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

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines);
      var opener = document.createElement('a');
      opener.href = url; opener.target = '_blank'; opener.rel = 'noopener';
      document.body.appendChild(opener); opener.click(); opener.remove();

      if (success) {
        success.innerHTML = 'Order details ready — WhatsApp should have opened in a new tab. If nothing happened, ' +
          '<a href="' + url + '" target="_blank" rel="noopener" style="color:#2451B8;font-weight:700;text-decoration:underline;">tap here to send it manually</a>.';
      }
    });

    form.addEventListener('reset', function () {
      ['custName', 'custPhone', 'prodName', 'qty'].forEach(function (id) { setError(id, ''); });
      if (success) success.textContent = '';
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

  /* ---------- Button ripple ---------- */
  function initRipple() {
    if (reduceMotion()) return;
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
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Boot ---------- */
  function boot() {
    runComponent('loader', initLoader);
    runComponent('scroll effects', initScrollEffects);
    runComponent('back to top', initBackToTop);
    runComponent('mobile menu', initMobileMenu);
    runComponent('smooth scroll', initSmoothScroll);
    runComponent('reveal', initReveal);
    runComponent('counters', initCounters);
    runComponent('hero', initHero);
    runComponent('particles', initParticles);
    runComponent('gallery', initGallery);
    runComponent('testimonials', initTestimonials);
    runComponent('faq', initFaq);
    runComponent('order form', initOrderForm);
    runComponent('newsletter', initNewsletter);
    runComponent('ripple', initRipple);
    runComponent('footer year', initFooterYear);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

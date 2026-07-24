/* =========================================================
   SAN AUTOS COLOR LIMITED — Script
   Vanilla JS. No frameworks, no dependencies.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
      
      /* ---------- Loading Screen ---------- */
      const loader = document.getElementById('loader');
      window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hidden'), 500);
      });
      // Fallback in case 'load' already fired
      setTimeout(() => loader && loader.classList.add('hidden'), 2500);
        /* ---------- Sticky Navbar + Scroll Progress + Back to Top ---------- */
  const header = document.getElementById('siteHeader');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
 
  function onScroll(){
    const scrollY = window.scrollY || window.pageYOffset;
    header.classList.toggle('scrolled', scrollY > 40);
    backToTop.classList.toggle('visible', scrollY > 600);
 
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
 
    updateActiveNav();
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  // NOTE: the initial onScroll() call is made further down, AFTER `sections` and
  // `navItems` are declared. Calling it here would make updateActiveNav() read
  // those `const`s in their temporal dead zone → ReferenceError that aborts every
  // feature set up after this line (slider, accordion, mobile menu, form, year...).
 
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
 
  /* ---------- Mobile Menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  // Backdrop behind the sliding panel — tapping it closes the menu.
  const navBackdrop = document.createElement('div');
  navBackdrop.className = 'nav-backdrop';
  document.body.appendChild(navBackdrop);

  function setMenu(open){
    navLinks.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    navBackdrop.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  }
  const closeMenu = () => setMenu(false);

  hamburger.addEventListener('click', () => {
    setMenu(!navLinks.classList.contains('open'));
  });

  navBackdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
 
  /* ---------- Smooth Scroll (native CSS handles most; ensure anchor offset) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
      const targetId = this.getAttribute('href');
      if (targetId.length > 1){
        const target = document.querySelector(targetId);
        if (target){
          e.preventDefault();
          const offset = 90;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });
 
  /* ---------- Active Nav Highlighting ---------- */
  const sections = ['home','about','gallery','supplies','order','contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navItems = document.querySelectorAll('[data-nav]');
 
  function updateActiveNav(){
    let currentId = 'home';
    const scrollPos = window.scrollY + 140;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navItems.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }

  // `sections` and `navItems` are now initialized, so it is finally safe to run
  // the initial scroll sync (moved down from the onScroll definition above).
  onScroll();

  /* ---------- Scroll Reveal Animations ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting){
        setTimeout(() => entry.target.classList.add('in-view'), (idx % 6) * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));
 
  /* ---------- Animated Counters ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => counterObserver.observe(el));
 
  function animateCounter(el){
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1400;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }
 
  /* ---------- Hero Slideshow ---------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDotsWrap = document.getElementById('heroSlideDots');
 
  if (heroSlides.length && heroDotsWrap){
    let heroCurrent = 0;
 
    heroSlides.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', 'Show slide ' + (i + 1));
      dot.addEventListener('click', () => showHeroSlide(i));
      heroDotsWrap.appendChild(dot);
    });
    const heroDots = heroDotsWrap.children;
 
    function showHeroSlide(index){
      heroCurrent = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((slide, i) => slide.classList.toggle('active', i === heroCurrent));
      Array.from(heroDots).forEach((d, i) => d.classList.toggle('active', i === heroCurrent));
    }
 
    let heroInterval = setInterval(() => showHeroSlide(heroCurrent + 1), 5000);
    const heroSection = document.getElementById('hero');
    if (heroSection){
      heroSection.addEventListener('mouseenter', () => clearInterval(heroInterval));
      heroSection.addEventListener('mouseleave', () => {
        heroInterval = setInterval(() => showHeroSlide(heroCurrent + 1), 5000);
      });
    }
  }
 
  /* ---------- Floating Paint Particles ---------- */
  const particlesWrap = document.getElementById('paintParticles');
  if (particlesWrap){
    const colors = ['#2451B8', '#3E6BD6', '#FF6B1A', '#FF9142', '#7C8B9C'];
    const count = window.innerWidth < 700 ? 10 : 20;
    for (let i = 0; i < count; i++){
      const p = document.createElement('span');
      const size = 6 + Math.random() * 14;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
      p.style.animationDuration = (10 + Math.random() * 14) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      particlesWrap.appendChild(p);
    }
  }
 
  /* ---------- Gallery Filtering ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.g-card');
 
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
 
      galleryCards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-cat') === filter;
        card.classList.toggle('hide', !match);
      });
    });
  });
 
  /* ---------- Testimonials Slider ---------- */
  const track = document.getElementById('reviewsTrack');
  const dotsWrap = document.getElementById('reviewsDots');
  const prevBtn = document.getElementById('reviewPrev');
  const nextBtn = document.getElementById('reviewNext');
 
  if (track){
    const slides = track.children.length;
    let current = 0;
 
    for (let i = 0; i < slides; i++){
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
    const dots = dotsWrap.children;
 
    function goTo(index){
      current = (index + slides) % slides;
      track.style.transform = `translateX(-${current * 100}%)`;
      Array.from(dots).forEach((d, i) => d.classList.toggle('active', i === current));
    }
 
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
 
    let autoSlide = setInterval(() => goTo(current + 1), 6000);
    [prevBtn, nextBtn, track].forEach(el => {
      el.addEventListener('mouseenter', () => clearInterval(autoSlide));
      el.addEventListener('mouseleave', () => { autoSlide = setInterval(() => goTo(current + 1), 6000); });
    });
  }
 
  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll('.acc-item').forEach(item => {
    const trigger = item.querySelector('.acc-trigger');
    const panel = item.querySelector('.acc-panel');

    // Collapsed on load: mark inert so the answer is pruned from the accessibility
    // tree (max-height:0 hides it only visually — otherwise a screen reader reads
    // every collapsed answer aloud despite aria-expanded="false").
    panel.inert = true;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
 
      document.querySelectorAll('.acc-item.open').forEach(openItem => {
        if (openItem !== item){
          openItem.classList.remove('open');
          openItem.querySelector('.acc-trigger').setAttribute('aria-expanded', 'false');
          const op = openItem.querySelector('.acc-panel');
          op.style.maxHeight = null;
          op.inert = true;
        }
      });
 
      item.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
      panel.inert = isOpen; // inert when it was open (now closing); interactive when opening
    });
  });

  // Keep any open panel's max-height in sync with its content when the viewport
  // reflows (rotation/resize). The height is otherwise frozen at click time, so a
  // narrower reflow would clip the answer under overflow:hidden. Debounced via a
  // timer (fires regardless of tab visibility, unlike requestAnimationFrame), with
  // the transition suppressed so it doesn't animate on every resize tick.
  let accResizeTimer;
  function refreshOpenPanels(){
    document.querySelectorAll('.acc-item.open .acc-panel').forEach(p => {
      p.style.transition = 'none';
      p.style.maxHeight = p.scrollHeight + 'px';
      void p.offsetHeight; // force reflow so the suppressed transition applies cleanly
      p.style.transition = '';
    });
  }
  window.addEventListener('resize', () => {
    clearTimeout(accResizeTimer);
    accResizeTimer = setTimeout(refreshOpenPanels, 100);
  });
  window.addEventListener('orientationchange', refreshOpenPanels);

  /* ---------- Order Form Validation + WhatsApp Handoff ---------- */
  const orderForm = document.getElementById('orderForm');
  const formSuccess = document.getElementById('formSuccess');
 
  function setError(fieldId, message){
    const errEl = document.getElementById('err-' + fieldId);
    const row = document.getElementById(fieldId).closest('.form-row');
    if (errEl) errEl.textContent = message || '';
    if (row) row.classList.toggle('invalid', Boolean(message));
  }
 
  function validateOrderForm(data){
    let valid = true;
 
    if (!data.custName.trim()){
      setError('custName', 'Please enter your name.'); valid = false;
    } else setError('custName', '');
 
    const phoneDigits = data.custPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10){
      setError('custPhone', 'Please enter a valid phone number.'); valid = false;
    } else setError('custPhone', '');
 
    if (!data.prodName.trim()){
      setError('prodName', 'Please tell us which product you need.'); valid = false;
    } else setError('prodName', '');
 
    if (!data.qty || Number(data.qty) < 1){
      setError('qty', 'Enter a quantity of at least 1.'); valid = false;
    } else setError('qty', '');
 
    return valid;
  }
 
  if (orderForm){
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        custName: document.getElementById('custName').value,
        custPhone: document.getElementById('custPhone').value,
        prodName: document.getElementById('prodName').value,
        qty: document.getElementById('qty').value,
        color: document.getElementById('color').value,
        message: document.getElementById('message').value,
      };
 
      if (!validateOrderForm(data)){
        formSuccess.textContent = '';
        return;
      }
 
      const lines = [
        'Hello SAM AUTOS COLOR LIMITED, I would like to place an order.',
        `Name: ${data.custName}`,
        `Phone: ${data.custPhone}`,
        `Product: ${data.prodName}`,
        `Quantity: ${data.qty}`,
        data.color ? `Preferred Colour: ${data.color}` : null,
        data.message ? `Message: ${data.message}` : null,
      ].filter(Boolean).join('\n');
 
      const whatsappUrl = `https://wa.me/14234326119?text=${encodeURIComponent(lines)}`;
 
      // Open via a real anchor click rather than window.open() — this is far less
      // likely to be blocked by browser/mobile popup blockers since it mimics a
      // genuine link click triggered directly inside the user's submit action.
      const opener = document.createElement('a');
      opener.href = whatsappUrl;
      opener.target = '_blank';
      opener.rel = 'noopener';
      document.body.appendChild(opener);
      opener.click();
      opener.remove();
 
      // Always show a manual fallback link too, in case the tab still gets blocked
      // (some in-app/mobile browsers block window/tab opens outright).
      formSuccess.innerHTML = `Order details ready — WhatsApp should have opened in a new tab.
        If nothing happened, <a href="${whatsappUrl}" target="_blank" rel="noopener" style="color:#2451B8;font-weight:700;text-decoration:underline;">tap here to send it manually</a>.`;
    });
 
    orderForm.addEventListener('reset', () => {
      ['custName','custPhone','prodName','qty'].forEach(id => setError(id, ''));
      formSuccess.textContent = '';
    });
  }
 
  /* ---------- Newsletter Form (front-end only) ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm){
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
      if (isValid){
        emailInput.value = '';
        emailInput.placeholder = 'Subscribed! Thank you.';
      } else {
        emailInput.focus();
      }
    });
  }
 
  /* ---------- Button Ripple Effect ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e){
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
 
  /* ---------- Typing Effect in Hero ---------- */
  const heroSub = document.querySelector('.hero-sub');
  // Kept as static, readable copy for SEO/accessibility — typing effect reserved for eyebrow tag line.
  const eyebrow = document.querySelector('.hero .eyebrow');
 
  /* ---------- Footer Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
 
});
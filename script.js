/// ===== Contact form → n8n webhook =====
(function () {
  const form = document.querySelector('.contact-form');
  const statusEl = document.getElementById('form-status');
  if (!form) return;

  // 🔒 store your webhook in one place
  const N8N_WEBHOOK_URL = 'https://jimmyjohn.app.n8n.cloud/webhook/contact-soaira'; // prod URL

  // light spam trap (hidden honeypot)
  const honeypotName = 'website'; // add a hidden input with this name in HTML (see below)

  async function postJSON(url, data) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000); // 10s timeout
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json().catch(() => ({}));
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Sending…';

    const data = Object.fromEntries(new FormData(form).entries());

    // Honeypot check – bots often fill hidden fields
    if (data[honeypotName]) {
      statusEl.textContent = 'Thanks!'; // pretend success
      form.reset();
      return;
    }

    // include some context
    data._meta = {
      page: location.href,
      ts: new Date().toISOString(),
    };

    try {
      await postJSON(N8N_WEBHOOK_URL, data);
      statusEl.textContent = 'Thanks! We’ll reach out shortly.';
      form.reset();
    } catch (err) {
      // Fallback to mailto if webhook fails
      statusEl.textContent = 'Having trouble—opening your email client…';
      const subject = encodeURIComponent('Soaria.AI — Contact');
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company}\n\nMessage:\n${data.message}`
      );
      location.href = `mailto:contact@soaria.ai?subject=${subject}&body=${body}`;
    }
  });
})();


// --- Neural background motion & scroll reveals ---
(function(){
  const shapes = document.querySelectorAll('.shape');
  window.addEventListener('scroll', () => {
    const y = window.pageYOffset || document.documentElement.scrollTop;
    shapes.forEach((s,i)=>{ const speed=(i+1)*0.25; s.style.transform=`translateY(${y*speed}px)`; });
  });

  const lines = document.querySelectorAll('.neural-line');
  setInterval(()=>{
    lines.forEach((line,i)=>{
      setTimeout(()=>{
        line.style.opacity='1'; line.style.transform='scaleX(1.08)';
        setTimeout(()=>{ line.style.opacity='.2'; line.style.transform='scaleX(.6)'; },220);
      }, i*250);
    });
  },2000);

  const revealables = document.querySelectorAll('.card, .step, .icon-card, .pricing, .contact-form, .contact-side');
  revealables.forEach(el=>el.classList.add('reveal'));
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} });
  },{threshold:.12, rootMargin:'0px 0px -50px 0px'});
  revealables.forEach(el=>io.observe(el));
})();

// Smooth scroll for header nav (with header offset + reduced-motion respect)
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const headerOffset = (header?.offsetHeight || 0) + 16; // +16px breathing room

  document.querySelectorAll('.site-header .nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(0, y),
        behavior: prefersReduced ? 'auto' : 'smooth'
      });

      // Optional: update URL hash without jumping
      history.replaceState(null, '', id);
    });
  });
})();


const toggle = document.querySelector('.nav-toggle');
const mobileNav = document.getElementById('mobileNav');

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  mobileNav.hidden = open;
});

// --- Collapse mobile menu after a selection ---
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobileNav');
  if (!toggle || !mobileNav) return;

  function closeMenu() {
    mobileNav.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  // When a link in the dropdown is clicked, close the menu
  mobileNav.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    // If you're smooth-scrolling to a hash, let the browser start it, then close
    requestAnimationFrame(closeMenu);
  });

  // Also close on hash changes triggered by smooth-scroll updates
  window.addEventListener('hashchange', closeMenu);
})();

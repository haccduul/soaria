// Simple JS for Soaria.AI demo interactions
document.getElementById("year").textContent = new Date().getFullYear();

function submitContact(e){
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const subject = encodeURIComponent("Soaria.AI — Demo Request");
  const body = encodeURIComponent(
    `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company}\n\nMessage:\n${data.message}`
  );
  window.location.href = `mailto:awhite@soaria.ai?subject=${subject}&body=${body}`;
  document.getElementById('form-status').textContent = "Thanks! We opened your email client to send the message.";
  return false;
}

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


// --- Mobile Hamburger Toggle (Soaria.AI) ---
(function(){
  const header = document.querySelector('.site-header');
  const btn = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobileNav');
  if(!header || !btn || !menu) return;
  
  // Ensure starting state: closed
  btn.setAttribute('aria-expanded', 'false');
  menu.setAttribute('hidden','');

  function closeMenu(){
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('hidden','');
    menu.classList.remove('open');
    document.removeEventListener('click', outside);
  }
  function outside(e){
    if(!header.contains(e.target)) closeMenu();
  }

  btn.addEventListener('click', function(e){
    e.stopPropagation();
    const open = this.getAttribute('aria-expanded') === 'true';
    if(open){
      closeMenu();
    }else{
      this.setAttribute('aria-expanded', 'true');
      menu.removeAttribute('hidden');
      menu.classList.add('open');
      setTimeout(()=>document.addEventListener('click', outside), 0);
    }
  });

  // Close on ESC
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ closeMenu(); }
  });

  // Collapse to desktop state if resized up
  const mq = window.matchMedia('(min-width: 641px)');
  mq.addEventListener?.('change', () => { if(mq.matches) closeMenu(); });
})();

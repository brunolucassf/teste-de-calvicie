/* ============================================================
   Landing Page — JavaScript
   Scroll Animations + CTA Tracking
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Scroll Reveal Animations ----------
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-fade-in-up, .animate-fade-in, .animate-slide-right, .animate-scale-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });


  // ---------- Smooth Scroll for Internal Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  // ---------- CTA Tracking (Facebook Pixel / GA ready) ----------
  document.querySelectorAll('#cta-hero, #cta-final').forEach(btn => {
    btn.addEventListener('click', () => {
      // Facebook Pixel
      if (typeof fbq === 'function') {
        fbq('trackCustom', 'QuizStart', { source: btn.id });
      }
      // Google Analytics 4
      if (typeof gtag === 'function') {
        gtag('event', 'quiz_start', { event_category: 'engagement', event_label: btn.id });
      }
    });
  });
});

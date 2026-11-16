// sticky nav shadow
const navEl = document.getElementById('siteNav');
if (navEl) {
  window.addEventListener('scroll', () => {
    navEl.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

// reveal timeline stops on scroll
const stops = document.querySelectorAll('.stop');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
  stops.forEach((s) => io.observe(s));
} else {
  stops.forEach((s) => s.classList.add('in'));
}

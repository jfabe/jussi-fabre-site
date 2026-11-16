// Scroll reveal, staggered groups and count-up numbers
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.section-head').forEach((h) => h.classList.add('in'));
    return;
  }
  const groups = [
    ['.section-head', 0], ['.about-body', 0], ['.about-flags', 0], ['.mx-figure', 0],
    ['.mx-stat', 0.08], ['.mx-trust li', 0.1], ['.exp-cell', 0.09], ['.sx-card', 0.1], ['.em', 0.08], ['.phase', 0.08], ['.dc-stack > div', 0.08], ['.role-box', 0], ['.split-card', 0.1],
    ['.cred-list li', 0.06], ['.lang-row', 0.04], ['footer .wrap > *', 0.08]
  ];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  groups.forEach(([sel, step]) => {
    const parents = new Map();
    document.querySelectorAll(sel).forEach((el) => {
      if (el.closest('.hero')) return;
      const i = parents.get(el.parentNode) || 0;
      parents.set(el.parentNode, i + 1);
      if (!el.classList.contains('section-head')) el.classList.add('mx-reveal');
      el.style.setProperty('--d', (i * step).toFixed(2) + 's');
      io.observe(el);
    });
  });

  function countUp(el) {
    const end = parseInt(el.dataset.count, 10);
    const t0 = performance.now(), dur = 1400;
    function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    el.textContent = '0';
    requestAnimationFrame(tick);
  }
})();

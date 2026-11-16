// Interactive zones & conduits diagram (maritime + data centre pages).
// Zone texts come from <script type="application/json" id="mxData">.
(function () {
  const fig = document.getElementById('mxFigure');
  const dataEl = document.getElementById('mxData');
  if (!fig || !dataEl) return;
  let data;
  try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
  const ZONES = data.zones || [];
  const CAPTIONS = data.captions || {};

  const svgZones = fig.querySelectorAll('.mx-zone');
  const legend = fig.querySelector('.mx-legend');
  const detail = document.getElementById('mxDetail');
  const caption = document.getElementById('mxCaption');
  const toggles = fig.querySelectorAll('.mx-toggle button');

  ZONES.forEach((z) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mx-leg';
    b.dataset.z = z.id;
    b.setAttribute('role', 'listitem');
    b.innerHTML = '<span class="mx-leg-badge">' + z.id.toUpperCase() + '</span><span>' + z.name + '</span>';
    b.addEventListener('click', () => select(z.id));
    legend.appendChild(b);
  });

  function select(id) {
    const z = ZONES.find((x) => x.id === id);
    if (!z) return;
    svgZones.forEach((g) => g.classList.toggle('is-active', g.dataset.z === id));
    legend.querySelectorAll('.mx-leg').forEach((b) => {
      const on = b.dataset.z === id;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    detail.innerHTML =
      '<div class="mx-d-eyebrow mono">ZONE ' + z.id.toUpperCase() + '</div>' +
      '<h3>' + z.name + '</h3>' +
      '<dl>' +
      '<dt>What lives here</dt><dd>' + z.lives + '</dd>' +
      '<dt>Typical risk</dt><dd>' + z.risk + '</dd>' +
      '<dt>Recommended design</dt><dd>' + z.fix + '</dd>' +
      '</dl>' +
      '<div class="mx-d-refs mono">' + z.refs + '</div>';
  }

  function setMode(mode) {
    fig.dataset.mode = mode;
    toggles.forEach((t) => t.setAttribute('aria-pressed', t.dataset.mode === mode ? 'true' : 'false'));
    caption.innerHTML = CAPTIONS[mode] || '';
  }

  svgZones.forEach((g) => {
    g.addEventListener('click', () => select(g.dataset.z));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(g.dataset.z); }
    });
  });
  toggles.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));

  setMode('flat');
  select(data.start || (ZONES[0] && ZONES[0].id));

  // switch to the segmented view once, a few seconds after the diagram is first seen
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let touched = false;
    toggles.forEach((t) => t.addEventListener('click', () => { touched = true; }));
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        setTimeout(() => { if (!touched) setMode('seg'); }, 4200);
      }
    }, { threshold: 0.5 });
    io.observe(fig.querySelector('.mx-ship'));
  }
})();

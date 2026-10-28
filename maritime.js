// Interactive vessel network diagram — maritime.html
(function () {
  const fig = document.getElementById('mxFigure');
  if (!fig) return;

  const ZONES = [
    { id: '1', name: 'Bridge & navigation',
      lives: 'ECDIS, radar, autopilot, GNSS, AIS, VDR',
      risk: 'Chart updates on USB sticks, GNSS spoofing, vendor laptops plugged into the bridge network.',
      fix: 'IEC 61162-460 gateway towards other networks, removable-media control, read-only data flows to IT.',
      refs: 'UR E27 · IEC 61162-460 · IEC 60945' },
    { id: '2', name: 'Propulsion & DP',
      lives: 'Engine & power management, thrusters, dynamic positioning',
      risk: 'Always-on vendor remote service, flat Layer-2 broadcast domains, unpatched HMIs.',
      fix: 'Dedicated zone on a redundant ring with fast failover; vendor sessions only on request, approved and logged.',
      refs: 'UR E26 · UR E27 · IEC 62443-3-3' },
    { id: '3', name: 'Alarm, monitoring & safety',
      lives: 'AMS, fire detection, watertight doors, safety systems',
      risk: 'Traffic floods from cameras or IT degrading time-critical alarms.',
      fix: 'Deterministic QoS, strict separation from IT and CCTV, documented change management.',
      refs: 'UR E26 · UR E10 · IEC 62443-3-3' },
    { id: '4', name: 'Cargo & ballast',
      lives: 'Loading computer, ballast control, ramp & door systems',
      risk: 'Shared accounts and engineering stations that bridge into other systems.',
      fix: 'Zone per system owner, conduit rules by explicit need, maintained asset inventory.',
      refs: 'UR E26 · IEC 62443-3-3' },
    { id: '5', name: 'Business IT & crew',
      lives: 'Admin PCs, email, crew and passenger Wi-Fi',
      risk: 'Phishing and untrusted personal devices — the most common way in.',
      fix: 'Kept outside OT entirely: no route to OT zones, separate SSIDs and VLANs, managed endpoints.',
      refs: 'UR E26 (untrusted network boundary)' },
    { id: 'b', name: 'Boundary · DMZ',
      lives: 'SATCOM, 4G / 5G / 450 MHz routers, VPN concentrator, update server',
      risk: 'Single compromised remote-access account reaching every system on board.',
      fix: 'One controlled entry point, MFA VPN, staged updates, logging to a shore SOC.',
      refs: 'UR E26 · IEC 62443-4-2 components' }
  ];

  const CAPTIONS = {
    flat: '<strong>Flat network.</strong> One compromised remote-access session or infected laptop sees every system on board — from crew Wi-Fi to propulsion control.',
    seg: '<strong>Zones &amp; conduits.</strong> The same intrusion stops at the boundary. Each zone talks only to what it must, through monitored, firewalled conduits — the structure UR E26 expects to see.'
  };

  const svgZones = fig.querySelectorAll('.mx-zone');
  const legend = fig.querySelector('.mx-legend');
  const detail = document.getElementById('mxDetail');
  const caption = document.getElementById('mxCaption');
  const toggles = fig.querySelectorAll('.mx-toggle button');

  // legend buttons (always readable, also on phones)
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
      '<dt>On board</dt><dd>' + z.lives + '</dd>' +
      '<dt>Typical risk</dt><dd>' + z.risk + '</dd>' +
      '<dt>Recommended design</dt><dd>' + z.fix + '</dd>' +
      '</dl>' +
      '<div class="mx-d-refs mono">' + z.refs + '</div>';
  }

  function setMode(mode) {
    fig.dataset.mode = mode;
    toggles.forEach((t) => t.setAttribute('aria-pressed', t.dataset.mode === mode ? 'true' : 'false'));
    caption.innerHTML = CAPTIONS[mode];
  }

  svgZones.forEach((g) => {
    g.addEventListener('click', () => select(g.dataset.z));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(g.dataset.z); }
    });
  });
  toggles.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));

  setMode('flat');
  select('2');

  // gently switch to the segmented view once, when the diagram is first seen
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

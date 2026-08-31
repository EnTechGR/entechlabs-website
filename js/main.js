/* ═══════════════════════════════════════════════
   VEKTÖR — main.js
   ═══════════════════════════════════════════════ */

/* ── SECTION LOADER ─────────────────────────────
   Edit SECTIONS to reorder, add, or remove pages.
   Each entry maps to a file in sections/.
   Dividers are inserted automatically between them.
   ─────────────────────────────────────────────── */
const SECTIONS = [
  'intro',
  'products',
  'solutions',
  'docs',
  'company',
  'resources',
  'contact',
];

/* ── ROUTER & INITIALIZATION ── */
async function loadContent() {
  const main = document.getElementById('site-main');
  const hash = window.location.hash;

  main.innerHTML = '';
  document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));

  if (hash === '#privacy') {
    try {
      const resp = await fetch('./sections/privacy.html');
      if (!resp.ok) throw new Error("Privacy page not found");
      const html = await resp.text();
      
      const section = document.createElement('section');
      section.className = 'si';
      section.id = 'privacy-page';
      section.innerHTML = html;
      main.appendChild(section);
      
      if (typeof initClock === 'function') initClock();
      if (typeof initNavScroll === 'function') initNavScroll();
      if (typeof initReveal === 'function') initReveal(); 
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      window.location.hash = ''; 
    }
  } else {
    await loadSections();
    
    if (hash && hash !== '#') {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView();
        if (typeof updateActiveNavLink === 'function') {
          updateActiveNavLink(hash.substring(1));
        }
      }
    }
  }
}

// Update your existing loadSections to be more modular
async function loadSections() {
  const main = document.getElementById('site-main');
  main.innerHTML = ''; 

  // Fetch registered sections safely
  const htmlChunks = await Promise.all(
    SECTIONS.map(async name => {
      try {
        const res = await fetch(`./sections/${name}.html`);
        return res.ok ? await res.text() : '';
      } catch {
        return '';
      }
    })
  );

  const fragment = document.createDocumentFragment();
  htmlChunks.filter(Boolean).forEach((html, i, arr) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
    if (i < arr.length - 1) {
      const div = document.createElement('div');
      div.className = 'divider';
      fragment.appendChild(div);
    }
  });
  main.appendChild(fragment);

  // Re-init visual and structural components
  if (typeof initClock === 'function') initClock();
  if (typeof initReveal === 'function') initReveal();
  if (typeof initNavScroll === 'function') initNavScroll();
  if (typeof initChips === 'function') initChips();
  if (typeof initScrollSpy === 'function') initScrollSpy();
  if (typeof initIntroCanvas === 'function') initIntroCanvas();
  if (typeof initTerminal === 'function') initTerminal();
}

/* ── 6. NEURAL MESH CANVAS BACKGROUND ── */
function initMesh() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const PARTICLE_COUNT      = 60;
  const CONNECTION_DISTANCE = 150;
  const PARTICLE_SPEED      = 0.4;
  const MOUSE_RADIUS        = 200;

  let width, height, particles;
  let mouse = { x: null, y: null };

  function resizeCanvas() {
    width         = canvas.clientWidth;
    height        = canvas.clientHeight;
    canvas.width  = width;
    canvas.height = height;
  }

  class Particle {
    constructor() {
      this.x      = Math.random() * width;
      this.y      = Math.random() * height;
      this.vx     = (Math.random() - 0.5) * PARTICLE_SPEED;
      this.vy     = (Math.random() - 0.5) * PARTICLE_SPEED;
      this.radius = Math.random() * 1.5 + 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width)  this.vx *= -1;
      if (this.y < 0 || this.y > height)  this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(138, 150, 163, 0.8)';
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = 1 - dist / CONNECTION_DISTANCE;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.3})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function drawMouseConnections() {
    if (mouse.x === null) return;

    particles.forEach(p => {
      const dx   = mouse.x - p.x;
      const dy   = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS) {
        const opacity = (1 - dist / MOUSE_RADIUS) * 0.5;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    drawMouseConnections();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  // window.addEventListener('resize', resizeCanvas, { passive: true });
  // window.addEventListener('mousemove', e => {
  //   mouse.x = e.clientX;
  //   mouse.y = e.clientY;
  // }, { passive: true });

  window.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
}, { passive: true });

  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  animate();
}

/* ── 7. UI SONIFICATION ── */
function initSonification() {
  let audioCtx = null;

  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTechSound(type) {
    const ctx  = getCtx();
    const now  = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.connect(gain);

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.02);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(400, now);
      osc2.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      osc2.connect(gain);
      osc2.start(now);
      osc2.stop(now + 0.1);

      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  const interactiveSelector = 'a, button, input[type="submit"], input[type="button"], .chip, [role="button"]';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelector)) playTechSound('hover');
  });
  
}


async function initCookieConsentEngine() {
  const wrapper = document.getElementById('cookie-wrapper');
  if (!wrapper) return;

  try {
    const res = await fetch('./sections/cookie-consent.html');
    if (!res.ok) throw new Error('Failed to load cookie banner markup');
    wrapper.innerHTML = await res.text();

    // Check if script is already present
    if (!document.querySelector('script[src="js/cookie-consent.js"]')) {
      const script = document.createElement('script');
      script.src = 'js/cookie-consent.js';
      script.onload = () => {
        if (typeof initCookieConsent === 'function') initCookieConsent();
      };
      document.body.appendChild(script);
    } else if (typeof initCookieConsent === 'function') {
      initCookieConsent();
    }
  } catch (err) {
    console.error('Cookie initialization error:', err);
  }
}

/* ── ROUTER & INITIALIZATION LISTENERS ── */
window.addEventListener('hashchange', loadContent);

document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  initCookieConsentEngine();
});
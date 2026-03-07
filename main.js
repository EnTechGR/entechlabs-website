/* ═══════════════════════════════════════════════
   VEKTÖR — main.js
   ═══════════════════════════════════════════════ */

/* ── SECTION LOADER ─────────────────────────────
   Edit SECTIONS to reorder, add, or remove pages.
   Each entry maps to a file in sections/.
   Dividers are inserted automatically between them.
   ─────────────────────────────────────────────── */
const SECTIONS = [
  'hero',
  'vision',
  'products',
  'blog',
  'contact',
];

/* ── ROUTER & INITIALIZATION ── */
async function loadContent() {
  const main = document.getElementById('site-main');
  const hash = window.location.hash;

  // 1. Clear main to prevent stacking
  main.innerHTML = '';

  // 2. Clear all active nav highlights first to prevent "ghost" highlights
  document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));

  if (hash === '#privacy') {
    try {
      const resp = await fetch('sections/privacy.html');
      if (!resp.ok) throw new Error("Privacy page not found");
      const html = await resp.text();
      
      const section = document.createElement('section');
      section.className = 'si';
      section.id = 'privacy-page';
      section.innerHTML = html;
      main.appendChild(section);
      
      initClock();
      initNavScroll();
      initReveal(); 
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      window.location.hash = ''; 
    }
  } else {
    // Load home sections
    await loadSections();
    
    // 3. If the user clicked a specific section (e.g., #contact) from the Privacy page,
    // scroll to it after the sections are injected.
    if (hash && hash !== '#') {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView();
        updateActiveNavLink(hash.substring(1));
      }
    }
  }
}

window.addEventListener('hashchange', loadContent);
window.addEventListener('DOMContentLoaded', loadContent);


// Update your existing loadSections to be more modular
async function loadSections() {
  const main = document.getElementById('site-main');
  main.innerHTML = ''; // Clear previous content

  const htmlChunks = await Promise.all(
    SECTIONS.map(name =>
      fetch(`sections/${name}.html`).then(r => r.text())
    )
  );

  const fragment = document.createDocumentFragment();
  htmlChunks.forEach((html, i) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
    if (i < htmlChunks.length - 1) {
      const divider = document.createElement('div');
      divider.className = 'divider';
      fragment.appendChild(divider);
    }
  });
  main.appendChild(fragment);

  // Re-init behaviors
  initCookieConsent()
  initClock();
  initReveal();
  initNavScroll();
  initTerminal();
  initChips();
  initHeroCanvas();
  initScrollSpy();
}

/* ── 1. AGENTIC CLOCK ── */
function initClock() {
  const clk = document.getElementById('clk');
  if (!clk) return;

  function tick() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    clk.innerText = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
  }

  setInterval(tick, 1000);
  tick();
}

/* ── 2. SCROLL REVEAL ── */
function initReveal() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ── 3. NAV SCROLL STATE ── */
function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ── 4. AGENTIC TERMINAL SIMULATION (LOOPING) ── */
/* ── TERMINAL: ENTECH DOMAIN COMMANDS ── */
function initTerminal() {
  const termBody = document.getElementById('tb');
  if (!termBody) return;

  const staticLines = [
    { text: 'entech-sync --init --satellite=GNSS',           type: 'tcmd'  },
    { text: 'Locking orbital signals: GPS / GALILEO...',      type: 'tcmt'  },
    { text: 'STRATUM-0 LOCKED. Accuracy: ±40ns',              type: 'tok'   },
    { text: 'entech-forensics --ingest /dev/flight_data',    type: 'tcmd'  },
    { text: 'Scanning telemetry packets for integrity...',    type: 'tout'  },
    { text: 'CRITICAL: Packet drift detected at 0x44A1',      type: 'twarn' },
    { text: 'Applying deterministic reconstruction...',       type: 'tcmd'  },
    { text: 'Data integrity verified. Log exported.',         type: 'tok'   },
  ];

  const dynamicLines = [
    { text: 'url-analyze --depth=MAX --detect-spoof',        type: 'tcmd' },
    { text: 'Resolving redirect chains...',                  type: 'tout' },
    { text: 'Heuristic Match: Adversarial Payload Delivery',  type: 'twarn' },
    { text: 'entech-monitor --active --heartbeat',           type: 'tcmd' },
    { text: 'GNSS Signal Strength: 42dBHz [Excellent]',       type: 'tcmt' },
    { text: 'System Uptime: 342 days | Integrity: 100%',     type: 'tok'  },
    { text: 'watch-net --port=123 --protocol=NTP',           type: 'tcmd' },
    { text: 'Monitoring sync requests... 0 errors.',         type: 'tout' },
  ];

  let lineIndex = 0;
  let isInitial = true;

  function typeTerminal() {
    const lines = isInitial ? staticLines : dynamicLines;
    if (lineIndex >= lines.length) {
      lineIndex = 0;
      isInitial = false;
      setTimeout(typeTerminal, 3000); // Wait before looping
      return;
    }

    const line = lines[lineIndex];

    if (line.type === 'tcmd') {
      const promptSpan = document.createElement('span');
      promptSpan.className = 'tprompt';
      promptSpan.textContent = 'admin@entech:~$ ';
      termBody.appendChild(promptSpan);

      const cmdSpan = document.createElement('span');
      cmdSpan.className = 'tcmd';
      termBody.appendChild(cmdSpan);

      let charIndex = 0;
      const typing = setInterval(() => {
        if (charIndex < line.text.length) {
          cmdSpan.textContent += line.text.charAt(charIndex++);
        } else {
          clearInterval(typing);
          termBody.appendChild(document.createElement('br'));
          lineIndex++;
          termBody.scrollTop = termBody.scrollHeight;
          setTimeout(typeTerminal, 600);
        }
      }, 40);
    } else {
      const span = document.createElement('span');
      span.className = line.type;
      span.textContent = line.text;
      termBody.appendChild(span);
      termBody.appendChild(document.createElement('br'));
      lineIndex++;
      termBody.scrollTop = termBody.scrollHeight;
      setTimeout(typeTerminal, 800);
    }
  }
  setTimeout(typeTerminal, 1500);
}

/* ── HERO CANVAS: RADAR / OSCILLOSCOPE EFFECT ── */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  const setCanvasSize = () => {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  };
  
  window.addEventListener('resize', setCanvasSize);
  setCanvasSize();

  let angle = 0;
  const centerX = () => w * 0.5;
  const centerY = () => h * 0.5;
  const getRadius = () => Math.max(w, h) * 0.6;

  // ── TARGET SYSTEM ──
  // Generate random static targets in the coordinate space
  const targets = Array.from({ length: 8 }, () => ({
    x: (Math.random() - 0.5) * 1.5, // Normalized relative to center
    y: (Math.random() - 0.5) * 1.5,
    opacity: 0,
    size: Math.random() * 3 + 2
  }));

  function draw() {
    ctx.fillStyle = 'rgba(11, 14, 20, 0.15)'; 
    ctx.fillRect(0, 0, w, h);

    const cx = centerX();
    const cy = centerY();
    const r = getRadius();

    // ── DRAW GRID ──
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.05)';
    ctx.lineWidth = 1;
    for(let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r / 5) * i, 0, Math.PI * 2);
        ctx.stroke();
    }

    // ── DRAW TARGETS ──
    targets.forEach(target => {
      const tx = cx + target.x * (r * 0.8);
      const ty = cy + target.y * (r * 0.8);
      
      // Calculate angle to this specific target
      const angleToTarget = Math.atan2(ty - cy, tx - cx);
      const normalizedSweep = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
      const normalizedTarget = ((angleToTarget % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);

      // Check if sweep line is passing over target (within a small threshold)
      if (Math.abs(normalizedSweep - normalizedTarget) < 0.05) {
        target.opacity = 1.0; // Light up!
      }

      if (target.opacity > 0) {
        ctx.beginPath();
        ctx.arc(tx, ty, target.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${target.opacity})`;
        ctx.shadowBlur = 10 * target.opacity;
        ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for next draws

        // Fade out target slowly
        target.opacity -= 0.005;
      }
    });

    // ── DRAW RADAR SWEEP ──
    let gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0, 'rgba(96, 165, 250, 0)');
    gradient.addColorStop(1, 'rgba(96, 165, 250, 0.15)');

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle - 0.4, angle);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // ── THE ACTIVE SCAN LINE ──
    const sweepX = cx + Math.cos(angle) * r;
    const sweepY = cy + Math.sin(angle) * r;
    
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepX, sweepY);
    ctx.stroke();

    angle += 0.01;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── 5. CONTACT FORM CHIP TOGGLES ── */
function initChips() {
  const chips = document.querySelectorAll('.chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
    });
  });
}

/* ── 6. NEURAL MESH CANVAS BACKGROUND ── */
function initMesh() {
  const canvas = document.getElementById('hero-canvas');
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
  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
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

/* ── 8. URI HASH UPDATE (SCROLL SPY) ── */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  if (sections.length === 0) return;

  const options = {
    root: null,
    threshold: 0.2,
    rootMargin: "-25% 0px -25% 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    // Only run spy if we are NOT on the privacy page
    if (window.location.hash === '#privacy') return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        // Prevent unnecessary history noise if it's already the current hash
        if(window.location.hash !== `#${id}`) {
            history.replaceState(null, null, `#${id}`);
        }
        updateActiveNavLink(id);
      }
    });
  }, options);

  sections.forEach(section => observer.observe(section));
}

function updateActiveNavLink(id) {
  document.querySelectorAll('.nav-links a').forEach(link => {
    // Match the href attribute to the section ID
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', isActive);
  });
}

/* ── CONSOLIDATED GATEKEEPER ── */
const Gatekeeper = {
    check: () => {
        const consent = document.cookie.match(/^(.*;)?\s*entech_sys_init\s*=\s*[^;]+(.*)?$/);
        const overlay = document.getElementById('cookie-overlay');
        
        if (!consent) {
            document.body.classList.add('system-locked');
            if (overlay) overlay.classList.add('visible');
            return false;
        } else {
            if (overlay) overlay.style.display = 'none';
            // If already consented, we can safely start background tasks
            if (typeof initHeroCanvas === 'function') initHeroCanvas();
            if (typeof initTerminal === 'function') initTerminal();
            return true;
        }
    },
    authorize: () => {
        const overlay = document.getElementById('cookie-overlay');
        const acceptBtn = document.getElementById('accept-cookies');
        
        // Set secure, SameSite=Strict cookie
        const d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `entech_sys_init=verified; expires=${d.toUTCString()}; path=/; SameSite=Strict; Secure`;

        acceptBtn.innerText = "INITIALIZING...";
        
        setTimeout(() => {
            overlay.classList.remove('visible');
            document.body.classList.remove('system-locked');
            
            // Start the visual engine
            initHeroCanvas();
            initTerminal();
            
            setTimeout(() => { overlay.style.display = 'none'; }, 500);
        }, 800);
    }
};

// Update your loadSections() to remove initCookieConsent()
async function loadSections() {
  const main = document.getElementById('site-main');
  main.innerHTML = ''; 

  const htmlChunks = await Promise.all(
    SECTIONS.map(name => fetch(`sections/${name}.html`).then(r => r.text()))
  );

  const fragment = document.createDocumentFragment();
  htmlChunks.forEach((html, i) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
    if (i < htmlChunks.length - 1) {
      const div = document.createElement('div');
      div.className = 'divider';
      fragment.appendChild(div);
    }
  });
  main.appendChild(fragment);

  // RE-INIT BEHAVIORS (Removed initCookieConsent here)
  initClock();
  initReveal();
  initNavScroll();
  initChips();
  initScrollSpy();
  
  // Only start these if the gate is already open
  if (document.cookie.includes("entech_sys_init")) {
      initHeroCanvas();
      initTerminal();
  }
}

// Initial entry point
document.addEventListener('DOMContentLoaded', () => {
    Gatekeeper.check();
    const btn = document.getElementById('accept-cookies');
    if (btn) btn.addEventListener('click', Gatekeeper.authorize);
});

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

async function loadSections() {
  const main = document.getElementById('site-main');

  // Fetch all partials in parallel
  const htmlChunks = await Promise.all(
    SECTIONS.map(name =>
      fetch(`sections/${name}.html`)
        .then(r => {
          if (!r.ok) throw new Error(`Failed to load section: ${name} (${r.status})`);
          return r.text();
        })
        .catch(err => {
          console.warn(err);
          return `<!-- section "${name}" could not be loaded -->`;
        })
    )
  );

  // Inject sections with dividers between them
  const fragment = document.createDocumentFragment();

  htmlChunks.forEach((html, i) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);

    // Insert divider after every section except the last
    if (i < htmlChunks.length - 1) {
      const divider = document.createElement('div');
      divider.className = 'divider';
      fragment.appendChild(divider);
    }
  });

  main.appendChild(fragment);

  // Kick off all behaviours once the DOM is populated
  initClock();
  initReveal();
  initNavScroll();
  initTerminal();
  initChips();
  initMesh();
  initSonification();
  initScrollSpy();
}

loadSections();

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
function initTerminal() {
  const termBody = document.getElementById('tb');
  if (!termBody) return;

  const staticLines = [
    { text: 'vektör-agent init --target=local',                type: 'tcmd'  },
    { text: 'Loading heuristic models...',                     type: 'tcmt'  },
    { text: 'Models loaded. Injecting telemetry hooks.',       type: 'tok'   },
    { text: 'Scanning exposed attack surface...',              type: 'tout'  },
    { text: 'WARN: Unauthenticated endpoint detected (0x8F2A)', type: 'twarn' },
    { text: 'Deploying Sentinël countermeasures...',           type: 'tcmd'  },
    { text: 'Threat neutralized. Resuming autonomous patrol.', type: 'tok'   },
  ];

  const dynamicLines = [
    { text: 'background-scan --module=stealth',                        type: 'tcmd' },
    { text: 'Intercepting encrypted handshake (TLS 1.3)...',           type: 'tout' },
    { text: 'Analyzing packet entropy... 0.988',                       type: 'tcmt' },
    { text: "Match found in known attack pattern DB 'VEKTÖR-ALPHA'",   type: 'tok'  },
    { text: 'shred --tmp-logs --force',                                type: 'tcmd' },
    { text: 'Cleaning audit trails...',                                type: 'tcmt' },
    { text: 'OK: All temporary traces eliminated.',                    type: 'tok'  },
    { text: 'watch --status=active',                                   type: 'tcmd' },
    { text: 'System heartbeat: 42ms | Load: 0.12',                     type: 'tout' },
    { text: 'Listening on port 443 (SO_REUSEADDR)',                     type: 'tcmt' },
  ];

  let lineIndex = 0;
  let isInitial = true;

  function typeTerminal() {
    const lines = isInitial ? staticLines : dynamicLines;

    if (lineIndex >= lines.length) {
      lineIndex = 0;
      isInitial = false;
      setTimeout(typeTerminal, 2000);
      return;
    }

    const line = lines[lineIndex];

    if (line.type === 'tcmd') {
      const promptSpan = document.createElement('span');
      promptSpan.className = 'tprompt';
      promptSpan.textContent = 'agent@vektör:~$ ';
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
      }, 50);
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
    threshold: 0.2, // Trigger earlier when only 20% of the section is visible
    rootMargin: "-25% 0px -25% 0px" // Focuses the "trigger zone" to the center 50% of the screen
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Only update if the section is truly entering the viewport center
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        history.replaceState(null, null, `#${id}`);
        updateActiveNavLink(id);
      }
    });
  }, options);

  sections.forEach(section => observer.observe(section));
}

function updateActiveNavLink(id) {
  document.querySelectorAll('.nav-links a').forEach(link => {
    // Exact match for the hash
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', isActive);
  });
}
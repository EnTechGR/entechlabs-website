/* ═══════════════════════════════════════════════
   ENTECH LABS — ui-effects.js
   ═══════════════════════════════════════════════ */

/* ── 1. AGENTIC CLOCK / SYSTEM STATUS ── */
function initClock() {
  const clk = document.getElementById('clk');
  if (!clk) return;

  function tick() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    // Displays software operational timestamp
    clk.innerText = `SYS OK — ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
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

/* ── 4. SCROLL SPY & LINK HIGHLIGHTING ── */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  if (sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    if (window.location.hash === '#privacy') return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (window.location.hash !== `#${id}`) {
          history.replaceState(null, null, `#${id}`);
        }
        updateActiveNavLink(id);
      }
    });
  }, { threshold: 0.2, rootMargin: "-25% 0px -25% 0px" });

  sections.forEach(section => observer.observe(section));
}

function updateActiveNavLink(id) {
  document.querySelectorAll('.nav-links a').forEach(link => {
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', isActive);
  });
}

/* ── 5. FORM CHIP TOGGLES ── */
function initChips() {
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
    });
  });
}

/* ── 6. MAILTO & CLIPBOARD HANDLER ── */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="mailto:"]');
  if (!link) return;

  const email = link.innerText.trim();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).then(() => {
      const originalText = link.innerHTML;
      link.innerHTML = `<span style="color: var(--green, #10b981)">EMAIL COPIED TO CLIPBOARD</span>`;
      setTimeout(() => { link.innerHTML = originalText; }, 2000);
    }).catch(err => console.error('Clipboard error:', err));
  }
}, { capture: true });
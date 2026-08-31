/* ═══════════════════════════════════════════════
   ENTECH LABS — canvas.js
   ═══════════════════════════════════════════════ */

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
  
  window.removeEventListener('resize', setCanvasSize);
  window.addEventListener('resize', setCanvasSize);
  setCanvasSize();

  let angle = 0;
  const centerX = () => w * 0.5;
  const centerY = () => h * 0.5;
  const getRadius = () => Math.max(w, h) * 0.6;

  const targets = Array.from({ length: 8 }, () => ({
    x: (Math.random() - 0.5) * 1.5,
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

    ctx.strokeStyle = 'rgba(96, 165, 250, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (r / 5) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    targets.forEach(target => {
      const tx = cx + target.x * (r * 0.8);
      const ty = cy + target.y * (r * 0.8);
      
      const angleToTarget = Math.atan2(ty - cy, tx - cx);
      const normalizedSweep = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
      const normalizedTarget = ((angleToTarget % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);

      if (Math.abs(normalizedSweep - normalizedTarget) < 0.05) {
        target.opacity = 1.0;
      }

      if (target.opacity > 0) {
        ctx.beginPath();
        ctx.arc(tx, ty, target.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${target.opacity})`;
        ctx.fill();
        target.opacity -= 0.005;
      }
    });

    let gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0, 'rgba(96, 165, 250, 0)');
    gradient.addColorStop(1, 'rgba(96, 165, 250, 0.15)');

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle - 0.4, angle);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

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
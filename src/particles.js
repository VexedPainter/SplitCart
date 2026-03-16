/**
 * SplitCart – Ambient Particle System
 * Lightweight canvas particle layer for floating ambient particles with glow
 */

export function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 80;

  const colors = [
    'rgba(108, 60, 224, ',    // purple
    'rgba(0, 245, 212, ',     // teal
    'rgba(255, 107, 157, ',   // pink
    'rgba(0, 180, 216, ',     // blue
  ];

  function resize() {
    width = window.innerWidth;
    height = document.documentElement.scrollHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * window.innerHeight,
      baseX: 0,
      baseY: 0,
      size: 1 + Math.random() * 2.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.2 - 0.1,
      opacity: 0.1 + Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.005 + Math.random() * 0.01,
    };
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, window.innerHeight);

    particles.forEach((p) => {
      p.phase += p.phaseSpeed;
      const sway = Math.sin(p.phase) * 0.5;

      p.x += p.speedX + sway * 0.1;
      p.y += p.speedY;

      // Adjust for scroll (parallax depth)
      const drawY = p.y - (scrollY * (0.02 + p.size * 0.01)) % window.innerHeight;

      // Wrap around
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = window.innerHeight + 10;
      if (p.y > window.innerHeight + 10) p.y = -10;

      const pulsedOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.phase));

      // Glow
      const gradient = ctx.createRadialGradient(p.x, drawY, 0, p.x, drawY, p.size * 4);
      gradient.addColorStop(0, p.color + String(pulsedOpacity * 0.5) + ')');
      gradient.addColorStop(1, p.color + '0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, drawY, p.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, drawY, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + String(pulsedOpacity) + ')';
      ctx.fill();
    });
  }

  init();
  window.addEventListener('resize', resize);
  animate();

  return () => {
    window.removeEventListener('resize', resize);
  };
}

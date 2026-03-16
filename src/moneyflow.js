/**
 * SplitCart – Money Flow Settlement Visualization
 * Canvas-based animated settlement graph with user nodes and animated pay arrows
 */

export function initMoneyFlow() {
  const container = document.getElementById('moneyflow-stage');
  const canvas = document.getElementById('moneyflow-canvas');
  const nodesContainer = document.getElementById('flow-nodes');
  if (!canvas || !container || !nodesContainer) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let isVisible = false;
  let animationStartTime = 0;

  // Users
  const users = [
    { id: 'sarah', name: 'Sarah', initials: 'S', color: 'hsl(180, 70%, 50%)', balance: -1872 },
    { id: 'mike', name: 'Mike', initials: 'M', color: 'hsl(260, 70%, 50%)', balance: 3146 },
    { id: 'julia', name: 'Julia', initials: 'J', color: 'hsl(320, 70%, 50%)', balance: -1274 },
    { id: 'alex', name: 'Alex', initials: 'A', color: 'hsl(40, 70%, 50%)', balance: 0 },
  ];

  // Settlement flows (arrows)
  const flows = [
    { from: 0, to: 1, amount: 1872, label: 'Sarah → Mike' },
    { from: 2, to: 1, amount: 1274, label: 'Julia → Mike' },
  ];

  // Positions (relative 0-1, computed on resize)
  const layouts = [
    { x: 0.18, y: 0.35 },
    { x: 0.82, y: 0.35 },
    { x: 0.18, y: 0.72 },
    { x: 0.82, y: 0.72 },
  ];

  let nodePositions = [];

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    nodePositions = layouts.map(l => ({
      x: l.x * width,
      y: l.y * height,
    }));

    // Place DOM nodes
    renderDOMNodes();
  }

  function renderDOMNodes() {
    nodesContainer.innerHTML = '';
    users.forEach((user, i) => {
      const pos = nodePositions[i];
      if (!pos) return;

      const el = document.createElement('div');
      el.className = 'flow-node';
      el.style.left = `${pos.x - 28}px`;
      el.style.top = `${pos.y - 28}px`;

      const balanceStr = user.balance >= 0
        ? `+₹${user.balance.toFixed(0)}`
        : `-₹${Math.abs(user.balance).toFixed(0)}`;
      const balanceColor = user.balance >= 0 ? '#00f5d4' : '#ff6b9d';

      el.innerHTML = `
        <div class="flow-node-avatar" style="background: ${user.color};">${user.initials}</div>
        <span class="flow-node-name">${user.name}</span>
        <span class="flow-node-balance" style="color: ${balanceColor};">${balanceStr}</span>
      `;
      nodesContainer.appendChild(el);
    });
  }

  // Particle trail pool
  const particles = [];

  function spawnParticle(x, y, color) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1,
      decay: 0.015 + Math.random() * 0.02,
      size: 2 + Math.random() * 3,
      color,
    });
  }

  function drawArrow(fromPos, toPos, progress, flow, time) {
    if (progress <= 0) return;

    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Curved path - bezier control point
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    // Perpendicular offset for curve
    const nx = -dy / dist;
    const ny = dx / dist;
    const curveAmount = 40;
    const cpX = midX + nx * curveAmount;
    const cpY = midY + ny * curveAmount;

    // Draw the path
    const clampedProgress = Math.min(progress, 1);

    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y);

    // Draw partial bezier curve based on progress
    const steps = Math.floor(50 * clampedProgress);
    for (let i = 1; i <= steps; i++) {
      const t = i / 50;
      const x = (1 - t) * (1 - t) * fromPos.x + 2 * (1 - t) * t * cpX + t * t * toPos.x;
      const y = (1 - t) * (1 - t) * fromPos.y + 2 * (1 - t) * t * cpY + t * t * toPos.y;

      if (i === 1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    // Glow effect
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Draw thinner bright core
    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y);
    for (let i = 1; i <= steps; i++) {
      const t = i / 50;
      const x = (1 - t) * (1 - t) * fromPos.x + 2 * (1 - t) * t * cpX + t * t * toPos.x;
      const y = (1 - t) * (1 - t) * fromPos.y + 2 * (1 - t) * t * cpY + t * t * toPos.y;
      if (i === 1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.9)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Animated dot traveling along the path
    const dotT = (time * 0.4) % 1;
    if (clampedProgress > 0.5) {
      const dotX = (1 - dotT) * (1 - dotT) * fromPos.x + 2 * (1 - dotT) * dotT * cpX + dotT * dotT * toPos.x;
      const dotY = (1 - dotT) * (1 - dotT) * fromPos.y + 2 * (1 - dotT) * dotT * cpY + dotT * dotT * toPos.y;

      ctx.beginPath();
      ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00f5d4';
      ctx.shadowColor = '#00f5d4';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Spawn particles at dot
      if (Math.random() > 0.5) {
        spawnParticle(dotX, dotY, 'rgba(0, 245, 212, 0.6)');
      }
    }

    // Amount label at midpoint
    if (clampedProgress > 0.6) {
      const labelOpacity = Math.min(1, (clampedProgress - 0.6) * 5);
      const labelX = cpX;
      const labelY = cpY - 15;

      ctx.font = '700 14px Outfit, sans-serif';
      ctx.fillStyle = `rgba(0, 245, 212, ${labelOpacity})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`₹${flow.amount.toFixed(0)}`, labelX, labelY);

      ctx.font = '500 11px Inter, sans-serif';
      ctx.fillStyle = `rgba(200, 200, 240, ${labelOpacity * 0.6})`;
      ctx.fillText(flow.label, labelX, labelY + 18);
    }
  }

  function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace('0.6', String(p.life * 0.4));
      ctx.fill();
    }
  }

  function draw() {
    if (!isVisible) {
      requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const elapsed = (performance.now() - animationStartTime) / 1000;

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw connection halos around nodes
    nodePositions.forEach((pos, i) => {
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 20, pos.x, pos.y, 70);
      gradient.addColorStop(0, users[i].color.replace(')', ', 0.1)').replace('hsl', 'hsla'));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 70, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw arrows with staggered animation
    flows.forEach((flow, i) => {
      const flowDelay = i * 1.5;
      const flowProgress = Math.max(0, (elapsed - flowDelay) / 2);
      drawArrow(
        nodePositions[flow.from],
        nodePositions[flow.to],
        flowProgress,
        flow,
        elapsed
      );
    });

    // Draw particles
    drawParticles();

    requestAnimationFrame(draw);
  }

  // Intersection Observer for visibility
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isVisible) {
        isVisible = true;
        animationStartTime = performance.now();
      } else if (!entry.isIntersecting) {
        isVisible = false;
      }
    });
  }, { threshold: 0.3 });

  observer.observe(container);

  resize();
  window.addEventListener('resize', resize);
  draw();

  return () => {
    window.removeEventListener('resize', resize);
    observer.disconnect();
  };
}

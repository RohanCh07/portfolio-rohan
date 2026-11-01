// =========================================================
// Contact section: the loss landscape from the first screen,
// shown as a slowly turning 3D wireframe. An orange ball runs
// gradient descent down into the lowest point, then the
// terrain reshapes and it starts again. Moving the mouse
// over the section tilts the view.
// Plain canvas, no libraries. Runs only while on screen.
// =========================================================
(() => {
  const host = document.querySelector(".cta");
  if (!host) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  canvas.className = "terrain3d";
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);
  const ctx = canvas.getContext("2d");
  const accent = () => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ff4c24";

  // ---- the surface: a bowl plus a few wells and ridges, on [-1, 1]² ----
  const N = 34; // grid lines per side
  const rand = (a, b) => a + Math.random() * (b - a);
  let bumps = [];
  const seed = () => {
    bumps = [{ x: rand(-0.4, 0.4), y: rand(-0.4, 0.4), a: -0.9, s: 0.32 }];
    for (let i = 0; i < 3; i++) bumps.push({ x: rand(-0.9, 0.9), y: rand(-0.9, 0.9), a: rand(-0.35, -0.15), s: rand(0.15, 0.25) });
    for (let i = 0; i < 4; i++) bumps.push({ x: rand(-0.9, 0.9), y: rand(-0.9, 0.9), a: rand(0.2, 0.45), s: rand(0.18, 0.3) });
  };
  const f = (x, y, g) => {
    let v = 0.22 * (x * x + y * y), gx = 0.44 * x, gy = 0.44 * y;
    for (const b of bumps) {
      const dx = x - b.x, dy = y - b.y, s2 = b.s * b.s;
      const e = b.a * Math.exp(-(dx * dx + dy * dy) / (2 * s2));
      v += e; gx -= e * dx / s2; gy -= e * dy / s2;
    }
    if (g) { g.x = gx; g.y = gy; }
    return v;
  };

  // ---- the ball ----
  const ball = { x: 0, y: 0, vx: 0, vy: 0, trail: [], rest: 0 };
  const g = { x: 0, y: 0 };
  const startBall = () => {
    let best = null;
    for (let i = 0; i < 30; i++) {
      const a = rand(0, Math.PI * 2), r = rand(0.75, 0.95);
      const x = Math.cos(a) * r, y = Math.sin(a) * r, v = f(x, y);
      if (!best || v > best.v) best = { x, y, v };
    }
    Object.assign(ball, { x: best.x, y: best.y, vx: 0, vy: 0, trail: [], rest: 0 });
  };
  const stepBall = () => {
    f(ball.x, ball.y, g);
    ball.vx = 0.93 * ball.vx - 0.004 * g.x;
    ball.vy = 0.93 * ball.vy - 0.004 * g.y;
    ball.x = Math.max(-1, Math.min(1, ball.x + ball.vx));
    ball.y = Math.max(-1, Math.min(1, ball.y + ball.vy));
    ball.trail.push([ball.x, ball.y]);
    if (ball.trail.length > 220) ball.trail.shift();
    ball.rest = Math.hypot(ball.vx, ball.vy) < 0.0006 ? ball.rest + 1 : 0;
  };

  // ---- camera ----
  let W = 0, H = 0, dpr = 1, yaw = 0.6, tilt = 0.55, tiltTarget = 0.55, yawNudge = 0, yawNudgeTarget = 0;
  const size = () => {
    const r = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const HEIGHT = 0.8;
  // rotate around the vertical axis, tilt toward the viewer, then perspective
  const P = (x, y, z) => {
    const a = yaw + yawNudge, ca = Math.cos(a), sa = Math.sin(a);
    const rx = x * ca - y * sa, ry = x * sa + y * ca;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const depth = ry * ct - z * st, up = ry * st + z * ct;
    const scale = W < 700 ? W * 0.5 : Math.min(W * 0.36, H * 0.55);
    const persp = 3.2 / (3.2 + depth);
    return [W / 2 + rx * scale * persp, H * (W < 700 ? 0.64 : 0.5) - up * scale * persp, persp];
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const lift = (x, y) => f(x, y) * HEIGHT; // low loss = valley
    ctx.lineWidth = 1;
    // grid lines in both directions, fading with distance
    for (let dir = 0; dir < 2; dir++) {
      for (let i = 0; i <= N; i++) {
        const u = -1 + (2 * i) / N;
        ctx.beginPath();
        let depth = 0;
        for (let j = 0; j <= N; j++) {
          const v = -1 + (2 * j) / N;
          const x = dir ? u : v, y = dir ? v : u;
          const p = P(x, y, lift(x, y));
          depth += p[2];
          j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
        }
        const d = depth / (N + 1);
        ctx.strokeStyle = `rgba(235, 233, 228, ${Math.max(0.04, Math.min(0.22, (d - 0.7) * 0.5))})`;
        ctx.stroke();
      }
    }
    // the ball's path and the ball
    const col = accent();
    if (ball.trail.length > 1) {
      ctx.beginPath();
      ball.trail.forEach(([x, y], i) => { const p = P(x, y, lift(x, y) + 0.01); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.stroke();
    }
    const b = P(ball.x, ball.y, lift(ball.x, ball.y) + 0.02);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(b[0], b[1], 5 * b[2], 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.arc(b[0], b[1], 12 * b[2], 0, Math.PI * 2); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();
    ctx.globalAlpha = 1;
  };

  // ---- loop ----
  seed(); startBall(); size();
  window.addEventListener("resize", () => { size(); draw(); });
  if (reduce) { for (let i = 0; i < 1500; i++) stepBall(); draw(); return; }

  let running = false, last = 0;
  const frame = (now) => {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    yaw += dt * 0.12;
    tilt += (tiltTarget - tilt) * 0.05;
    yawNudge += (yawNudgeTarget - yawNudge) * 0.05;
    for (let k = 0; k < 2; k++) stepBall();
    if (ball.rest > 150) { seed(); startBall(); }
    draw();
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    else if (!e.isIntersecting) running = false;
  }).observe(host);

  host.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
    tiltTarget = 0.55 + ny * 0.3; yawNudgeTarget = nx * 0.5;
  });
  host.addEventListener("pointerleave", () => { tiltTarget = 0.55; yawNudgeTarget = 0; });
})();

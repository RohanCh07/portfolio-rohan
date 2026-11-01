// =========================================================
// Loss landscape: a slowly shifting contour map with a point
// running gradient descent across it. Your cursor raises a
// hill the optimiser has to route around.
// No dependencies. Pauses when off screen or the tab is hidden.
// =========================================================
(() => {
  const canvas = document.getElementById("landscape");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const readout = document.getElementById("lossReadout");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  let colors = {};
  const readColors = () => {
    colors = {
      line: css("--contour"),
      index: css("--contour-strong"),
      signal: css("--signal"),
      paper: css("--paper"),
    };
  };
  readColors();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);

  let W = 0, H = 0, dpr = 1, cell = 14, cols = 0, rows = 0, grid;

  // ---- The field: a handful of wells and hills drifting slowly ----
  // Coordinates are normalised: x in [0, aspect], y in [0, 1].
  let aspect = 1.6;
  const rand = (a, b) => a + Math.random() * (b - a);
  const bumps = [];
  const seed = () => {
    bumps.length = 0;
    // one deep global minimum, kept away from the headline (left/bottom)
    bumps.push({ x: aspect * rand(0.68, 0.82), y: rand(0.3, 0.55), a: -1.15, s: 0.2, vx: rand(-1, 1), vy: rand(-1, 1) });
    // a few shallower local minima and some ridges
    for (let i = 0; i < 6; i++) bumps.push({ x: rand(aspect * 0.15, aspect), y: rand(0, 1), a: rand(-0.5, -0.2), s: rand(0.07, 0.15), vx: rand(-1, 1), vy: rand(-1, 1) });
    for (let i = 0; i < 6; i++) bumps.push({ x: rand(0, aspect), y: rand(0, 1), a: rand(0.25, 0.6), s: rand(0.08, 0.2), vx: rand(-1, 1), vy: rand(-1, 1) });
  };

  // cursor hill (smoothed)
  const hill = { x: -9, y: -9, tx: -9, ty: -9, a: 0, ta: 0 };

  const field = (x, y, out) => {
    // gentle global bowl so everything drains toward the middle-right
    const cx = x - aspect * 0.72, cy = y - 0.45;
    let f = 0.55 * (cx * cx * 0.5 + cy * cy);
    let gx = 0.55 * cx, gy = 0.55 * 2 * cy;
    for (let i = 0; i < bumps.length; i++) {
      const b = bumps[i];
      const dx = x - b.x, dy = y - b.y, s2 = b.s * b.s;
      const e = b.a * Math.exp(-(dx * dx + dy * dy) / (2 * s2));
      f += e; gx += -e * dx / s2; gy += -e * dy / s2;
    }
    if (hill.a > 0.001) {
      const dx = x - hill.x, dy = y - hill.y, s2 = 0.09 * 0.09;
      const e = hill.a * Math.exp(-(dx * dx + dy * dy) / (2 * s2));
      f += e; gx += -e * dx / s2; gy += -e * dy / s2;
    }
    if (out) { out.gx = gx; out.gy = gy; }
    return f;
  };

  // ---- Optimiser: gradient descent with momentum ----
  const opt = { x: 0, y: 0, vx: 0, vy: 0, trail: [], step: 0, rest: 0 };
  const g = { gx: 0, gy: 0 };
  const startOptimiser = () => {
    // start on a high point along the top-right, away from the headline
    let best = null;
    for (let i = 0; i < 24; i++) {
      const x = rand(aspect * 0.5, aspect * 0.97), y = rand(0.04, 0.3);
      const f = field(x, y);
      if (!best || f > best.f) best = { x, y, f };
    }
    Object.assign(opt, { x: best.x, y: best.y, vx: 0, vy: 0, trail: [{ x: best.x, y: best.y }], step: 0, rest: 0 });
  };
  const LR = 0.0007, MOMENTUM = 0.94;
  const stepOptimiser = () => {
    field(opt.x, opt.y, g);
    opt.vx = MOMENTUM * opt.vx - LR * g.gx;
    opt.vy = MOMENTUM * opt.vy - LR * g.gy;
    opt.x += opt.vx; opt.y += opt.vy;
    opt.x = Math.min(Math.max(opt.x, 0), aspect); opt.y = Math.min(Math.max(opt.y, 0), 1);
    opt.step++;
    if (opt.step % 2 === 0) {
      opt.trail.push({ x: opt.x, y: opt.y });
      if (opt.trail.length > 700) opt.trail.shift();
    }
    const speed = Math.hypot(opt.vx, opt.vy);
    if (speed < 0.00012) opt.rest++; else opt.rest = 0;
  };

  // ---- Marching squares ----
  const LEVELS = 24;
  let fmin = 0, fmax = 1;
  const sample = () => {
    fmin = Infinity; fmax = -Infinity;
    for (let j = 0; j <= rows; j++) {
      const y = (j * cell) / H;
      for (let i = 0; i <= cols; i++) {
        const v = field((i * cell) / H, y);
        grid[j * (cols + 1) + i] = v;
        if (v < fmin) fmin = v; if (v > fmax) fmax = v;
      }
    }
  };
  const lerp = (a, b, t) => (t - a) / (b - a);
  const contour = (level) => {
    const n = cols + 1;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = grid[j * n + i], b = grid[j * n + i + 1], c = grid[(j + 1) * n + i + 1], d = grid[(j + 1) * n + i];
        let idx = 0;
        if (a > level) idx |= 8; if (b > level) idx |= 4; if (c > level) idx |= 2; if (d > level) idx |= 1;
        if (idx === 0 || idx === 15) continue;
        const x = i * cell, y = j * cell;
        const top = [x + cell * lerp(a, b, level), y];
        const right = [x + cell, y + cell * lerp(b, c, level)];
        const bottom = [x + cell * lerp(d, c, level), y + cell];
        const left = [x, y + cell * lerp(a, d, level)];
        const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
        switch (idx) {
          case 1: case 14: seg(left, bottom); break;
          case 2: case 13: seg(bottom, right); break;
          case 3: case 12: seg(left, right); break;
          case 4: case 11: seg(top, right); break;
          case 6: case 9: seg(top, bottom); break;
          case 7: case 8: seg(left, top); break;
          case 5: seg(left, top); seg(bottom, right); break;
          case 10: seg(top, right); seg(left, bottom); break;
        }
      }
    }
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return; // hidden: keep the previous size
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = W < 700 ? 12 : 14;
    cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);
    grid = new Float32Array((cols + 1) * (rows + 1));
    const newAspect = W / H;
    // keep bumps in place proportionally
    bumps.forEach((b) => (b.x *= newAspect / aspect));
    opt.x *= newAspect / aspect;
    opt.trail.forEach((p) => (p.x *= newAspect / aspect));
    aspect = newAspect;
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    sample();
    const span = fmax - fmin || 1;
    ctx.lineWidth = 1;
    for (let k = 1; k < LEVELS; k++) {
      // spread levels non-linearly so detail sits near the minima
      const t = Math.pow(k / LEVELS, 1.6);
      const level = fmin + span * t;
      ctx.beginPath();
      contour(level);
      ctx.strokeStyle = k % 4 === 0 ? colors.index : colors.line;
      ctx.stroke();
    }

    // trail
    const tr = opt.trail;
    if (tr.length > 1) {
      ctx.beginPath();
      ctx.moveTo(tr[0].x * H, tr[0].y * H);
      // smooth through midpoints so the path reads as a curve
      for (let i = 1; i < tr.length - 1; i++) {
        const mx = (tr[i].x + tr[i + 1].x) / 2 * H, my = (tr[i].y + tr[i + 1].y) / 2 * H;
        ctx.quadraticCurveTo(tr[i].x * H, tr[i].y * H, mx, my);
      }
      ctx.lineTo(opt.x * H, opt.y * H);
      ctx.strokeStyle = colors.signal;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // iteration ticks every few samples
      ctx.fillStyle = colors.signal;
      for (let i = 0; i < tr.length; i += 14) {
        ctx.beginPath(); ctx.arc(tr[i].x * H, tr[i].y * H, 1.6, 0, Math.PI * 2); ctx.fill();
      }
    }
    // the optimiser
    const px = opt.x * H, py = opt.y * H;
    ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.strokeStyle = colors.signal; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = colors.signal; ctx.fill();

    if (readout) {
      const loss = (field(opt.x, opt.y) - fmin) / span;
      readout.textContent = `Step ${opt.step}, loss ${Math.max(loss, 0).toFixed(3)}`;
    }
  };

  // ---- Loop ----
  let running = false, visible = true, last = 0, t0 = performance.now();
  const frame = (now) => {
    if (!running) return;
    requestAnimationFrame(frame);
    if (now - last < 33) return; // ~30fps is plenty for slow motion
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const t = (now - t0) / 1000;

    // drift the terrain
    for (let i = 0; i < bumps.length; i++) {
      const b = bumps[i];
      b.x += Math.sin(t * 0.07 + i) * 0.004 * dt * b.vx;
      b.y += Math.cos(t * 0.06 + i * 1.7) * 0.004 * dt * b.vy;
    }
    // ease the cursor hill
    hill.x += (hill.tx - hill.x) * 0.12; hill.y += (hill.ty - hill.y) * 0.12;
    hill.a += (hill.ta - hill.a) * 0.06;

    for (let s = 0; s < 6; s++) stepOptimiser();
    // converged and rested: pause a moment, then reshape the land and start over
    if (opt.rest > 240) { seed(); startOptimiser(); }
    draw();
  };
  const play = () => { if (!running && visible && !document.hidden) { running = true; last = performance.now(); requestAnimationFrame(frame); } };
  const stop = () => { running = false; };

  // ---- Init ----
  resize(); seed(); startOptimiser();
  if (reduce) {
    // static: show the full descent path once
    for (let i = 0; i < 6000 && opt.rest < 60; i++) stepOptimiser();
    draw();
    window.addEventListener("resize", () => { resize(); draw(); });
    return;
  }
  draw();
  play();

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? play() : stop(); }).observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : play()));
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); draw(); }, 120); });

  const host = canvas.parentElement;
  const toField = (e) => {
    const r = canvas.getBoundingClientRect();
    hill.tx = (e.clientX - r.left) / H; hill.ty = (e.clientY - r.top) / H;
    if (hill.a < 0.01) { hill.x = hill.tx; hill.y = hill.ty; }
    hill.ta = 0.7;
  };
  host.addEventListener("pointermove", toField);
  host.addEventListener("pointerdown", toField);
  host.addEventListener("pointerleave", () => (hill.ta = 0));
})();

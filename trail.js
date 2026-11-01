// =========================================================
// Page-wide cursor trail: a thin orange line follows the
// mouse across the whole site and fades away behind it.
// Desktop only; off for reduced motion.
// =========================================================
(() => {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "trail-layer";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let W = 0, H = 0, dpr = 1;
  const size = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size(); window.addEventListener("resize", size);

  const accent = () => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ff4c24";
  let color = accent();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => (color = accent()));

  const LIFE = 420; // ms a point of the line stays visible
  const pts = [];   // { x, y, t }
  const tip = { x: 0, y: 0, set: false };
  let mx = 0, my = 0, running = false;

  const frame = (now) => {
    // the head eases toward the mouse, which rounds off the line's corners
    tip.x += (mx - tip.x) * 0.45; tip.y += (my - tip.y) * 0.45;
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(tip.x - last.x, tip.y - last.y) > 1.5) pts.push({ x: tip.x, y: tip.y, t: now });
    while (pts.length && now - pts[0].t > LIFE) pts.shift();

    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = color;
    for (let i = 1; i < pts.length; i++) {
      const life = 1 - (now - pts[i].t) / LIFE; // 1 = fresh, 0 = gone
      ctx.globalAlpha = life * 0.9;
      ctx.lineWidth = 0.4 + life * 1.2;
      ctx.beginPath();
      ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
      ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (pts.length > 1 || Math.hypot(mx - tip.x, my - tip.y) > 0.5) requestAnimationFrame(frame);
    else { running = false; pts.length = 0; ctx.clearRect(0, 0, W, H); }
  };

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (!tip.set) { tip.x = mx; tip.y = my; tip.set = true; }
    if (!running) { running = true; requestAnimationFrame(frame); }
  }, { passive: true });
})();

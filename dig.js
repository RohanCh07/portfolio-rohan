// =========================================================
// Square cursor "digging" through the page: as the square
// cursor moves, it punches short-lived square holes in its
// own shape, with a few brick chips flying off. Each hole
// closes again within a fraction of a second.
// Desktop only; off for reduced motion.
// =========================================================
(() => {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cursor = document.querySelector(".cursor");
  if (!cursor) return;

  const layer = document.createElement("div");
  layer.className = "dig-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const SPACING = 11;   // px of travel between holes
  const MAX = 36;       // holes alive at once
  let lx = null, ly = null, moving = 0, running = false;

  const isDark = (x, y) => {
    // dig darker holes on light areas, lighter-edged holes on dark cards
    const el = document.elementFromPoint(x, y);
    return !!(el && el.closest(".dark-card, .about-panel, .about-values, .cta, .project-media, .viz"));
  };

  const punch = (x, y, size, angle) => {
    if (layer.childElementCount > MAX) layer.firstElementChild.remove();
    const hole = document.createElement("span");
    hole.className = "dig" + (isDark(x, y) ? " on-dark" : "");
    hole.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;--r:${angle}deg`;
    // two or three chips knocked loose
    const chips = 2 + (Math.random() < 0.5 ? 1 : 0);
    for (let i = 0; i < chips; i++) {
      const c = document.createElement("i");
      const a = angle + 180 + (Math.random() - 0.5) * 120; // thrown backwards
      const d = 8 + Math.random() * 14;
      c.style.cssText = `--dx:${Math.cos(a * Math.PI / 180) * d}px;--dy:${Math.sin(a * Math.PI / 180) * d}px;--s:${2 + Math.random() * 2.5}px;--rot:${(Math.random() - 0.5) * 180}deg`;
      hole.appendChild(c);
    }
    hole.addEventListener("animationend", (e) => { if (e.target === hole) hole.remove(); });
    layer.appendChild(hole);
  };

  const frame = () => {
    const r = cursor.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const labelled = cursor.classList.contains("label");
    if (lx === null) { lx = x; ly = y; }
    const dx = x - lx, dy = y - ly, dist = Math.hypot(dx, dy);
    if (!labelled && dist >= SPACING) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const steps = Math.min(Math.floor(dist / SPACING), 4);
      for (let i = 1; i <= steps; i++) {
        punch(lx + (dx * i) / steps, ly + (dy * i) / steps, Math.min(r.width, 40), angle);
      }
      lx = x; ly = y;
    } else if (labelled) { lx = x; ly = y; }
    moving = dist > 0.3 ? 30 : moving - 1; // keep running ~0.5s after the cursor settles
    if (moving > 0) requestAnimationFrame(frame); else running = false;
  };

  window.addEventListener("mousemove", () => {
    moving = 30;
    if (!running) { running = true; requestAnimationFrame(frame); }
  }, { passive: true });
})();

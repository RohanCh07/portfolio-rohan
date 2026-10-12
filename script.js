// =========================================================
// Rohan Chauhan — Portfolio interactions (no dependencies)
// =========================================================

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const isDesktop = () => window.matchMedia("(min-width: 1000px)").matches;

  const root = document.documentElement;
  const isDark = () => root.dataset.theme === "dark";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Dark / light mode toggle ---------- */
  const modeBtn = $(".mode-toggle");
  const setMode = (mode) => {
    root.dataset.theme = mode;
    root.dataset.accent = mode === "light" ? "orange" : "amber";
    root.dataset.flow = "smart";
    modeBtn.setAttribute("aria-label", mode === "light" ? "Switch to dark mode" : "Switch to light mode");
    try { localStorage.setItem("rc-mode", mode); } catch (e) {}
    window.dispatchEvent(new Event("scroll"));
  };
  modeBtn.addEventListener("click", () => {
    root.classList.add("mode-anim");
    setMode(root.dataset.theme === "light" ? "dark" : "light");
    setTimeout(() => root.classList.remove("mode-anim"), 700);
  });
  modeBtn.setAttribute("aria-label", root.dataset.theme === "light" ? "Switch to dark mode" : "Switch to light mode");

  /* ---------- Live IST clock ---------- */
  const clock = $("#clock");
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false });
  };
  tick(); setInterval(tick, 1000);

  /* ---------- "Decode" headings: random glyphs resolve into the real text ---------- */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>[]{}=+";
  const decode = (el) => {
    if (reduceMotion || el.dataset.decoded) return;
    el.dataset.decoded = "1";
    const nodes = [];
    const walk = (n) => n.childNodes.forEach((c) => {
      if (c.nodeType === 3 && c.textContent.trim()) nodes.push({ node: c, text: c.textContent });
      else if (c.nodeType === 1) walk(c);
    });
    walk(el);
    const total = nodes.reduce((a, n) => a + n.text.length, 0);
    const dur = Math.min(1400, 500 + total * 25);
    const start = performance.now();
    let last = 0;
    const frame = (now) => {
      const p = Math.min((now - start) / dur, 1);
      if (now - last > 40 || p === 1) {
        last = now;
        let idx = 0;
        nodes.forEach((n) => {
          let out = "";
          for (const ch of n.text) {
            const revealAt = idx / total;
            out += ch === " " || ch === "\n" || p >= revealAt * 0.85 + 0.15 ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
            idx++;
          }
          n.node.textContent = out;
        });
      }
      if (p < 1) requestAnimationFrame(frame);
      else nodes.forEach((n) => (n.node.textContent = n.text));
    };
    requestAnimationFrame(frame);
  };
  const decodeIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { decode(e.target); decodeIO.unobserve(e.target); }
  }), { threshold: 0.4 });
  $$(".decode, .tag").forEach((el) => decodeIO.observe(el));

  /* ---------- Page-wide particle network (Black & White / White & Black themes) ----------
     One fixed canvas behind the whole page. Particles sit at different depths, so when you
     scroll they drift past at different speeds (parallax) and briefly link up more —
     the sections feel like they are part of the same space instead of separate blocks. */
  const bg = $("#bgnet");
  if (bg) {
    const bctx = bg.getContext("2d");
    let BW = 0, BH = 0, bdpr = 1, bnodes = [], lastScroll = window.scrollY, energy = 0;
    const bmouse = { x: -9999, y: -9999 };
    const bsize = () => {
      bdpr = Math.min(window.devicePixelRatio || 1, 2);
      BW = window.innerWidth; BH = window.innerHeight;
      bg.width = BW * bdpr; bg.height = BH * bdpr;
      bctx.setTransform(bdpr, 0, 0, bdpr, 0, 0);
      const count = Math.round(Math.min(Math.max((BW * BH) / 16000, 35), 110));
      bnodes = Array.from({ length: count }, () => {
        const z = 0.35 + Math.random() * 0.65; // depth: 1 = near, 0.35 = far
        return { x: Math.random() * BW, y: Math.random() * BH, z,
          vx: (Math.random() - 0.5) * 0.18 * z, vy: (Math.random() - 0.5) * 0.18 * z,
          // fixed "seat" inside whatever shape the smart network is forming, plus a wander phase
          u: Math.random(), v: Math.random(), ph: Math.random() * Math.PI * 2, sp: 0.5 + Math.random() };
      });
    };
    bsize();
    window.addEventListener("resize", bsize);
    window.addEventListener("mousemove", (e) => { bmouse.x = e.clientX; bmouse.y = e.clientY; });
    window.addEventListener("scroll", () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (root.dataset.flow !== "smart") for (const n of bnodes) n.y -= dy * 0.22 * n.z; // parallax drift
      if (MORPH) energy = Math.min(1, energy + Math.abs(dy) / 60); // no scroll "pulse" while the layout is fixed
      pickShape();
    }, { passive: true });

    /* ---- "Smart" network (Amber Terminal / Blueprint themes) ----
       Instead of sitting behind everything, the network reshapes for each section:
       full screen in the hero, then it shrinks out of the way of text — into the empty
       left column next to the skills / experience / FAQ, a strip on the right beside the
       projects, a ring around the About card — and collapses into a glowing core behind
       the final call-to-action. */
    const SHAPES = {
      full:  { link: 130, at: (n) => [n.u * BW, n.v * BH] },
      left:  { link: 95,  at: (n) => [BW * (0.02 + n.u * 0.33), BH * (0.14 + n.v * 0.74)] },
      right: { link: 85,  at: (n) => [BW * (0.76 + n.u * 0.22), BH * (0.16 + n.v * 0.7)] },
      sides: { link: 70,  at: (n) => (n.u < 0.5 ? [BW * n.u * 0.16, BH * n.v] : [BW * (0.92 + (n.u - 0.5) * 0.16), BH * n.v]) },
      ring:  { link: 105, at: (n) => { const a = n.u * Math.PI * 2, r = 0.47 + (n.v - 0.5) * 0.1;
                                       return [BW / 2 + Math.cos(a) * BW * r, BH / 2 + Math.sin(a) * BH * r]; } },
      core:  { link: 62,  at: (n) => { const a = n.u * Math.PI * 2, r = Math.sqrt(n.v) * Math.min(BW, BH) * 0.22;
                                       return [BW / 2 + Math.cos(a) * r * 1.3, BH * 0.5 + Math.sin(a) * r]; } },
    };
    const zones = [
      ["#hero", "full"], ["#services", "left"], ["#projects", "right"], [".about-stage", "ring"],
      [".about-values", "sides"], ["#experience", "left"], ["#faq", "left"], ["#contact", "core"], [".footer", "core"],
    ].map(([sel, shape]) => [$(sel), shape]).filter(([el]) => el);
    let shape = "full", curLink = 130;
    // Set to false to bring back the per-section shapes (left column, ring, core…).
    // For now the network keeps the same full-screen layout as the first screen everywhere.
    const MORPH = false;
    function pickShape() {
      if (!MORPH) { shape = "full"; return; }
      const mid = window.innerHeight * 0.5;
      for (const [el, s] of zones) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) { shape = s; break; }
      }
      // on narrow screens text spans the full width, so reading sections use the screen edges
      if (!isDesktop() && (shape === "left" || shape === "right")) shape = "sides";
    }
    pickShape();

    const BLINK = 130, BMOUSE = 180;
    const bdraw = () => {
      requestAnimationFrame(bdraw);
      if (!root.dataset.flow) return;
      const cs = getComputedStyle(root);
      const rgb = cs.getPropertyValue("--net-rgb").trim() || "245,245,245";
      const k = parseFloat(cs.getPropertyValue("--net-alpha")) || 1; // per-theme line strength
      const glow = parseFloat(cs.getPropertyValue("--net-glow")) || 0; // soft halo around the dots
      energy *= 0.94;
      bctx.clearRect(0, 0, BW, BH);
      const smart = root.dataset.flow === "smart";
      if (smart) {
        const S = SHAPES[shape] || SHAPES.full;
        const t = performance.now() / 1000;
        const wander = 14 + energy * 22;
        for (const n of bnodes) {
          const [tx, ty] = S.at(n);
          const wx = Math.sin(t * 0.6 * n.sp + n.ph) * wander;
          const wy = Math.cos(t * 0.5 * n.sp + n.ph * 1.3) * wander;
          const ease = reduceMotion ? 1 : 0.035 + n.z * 0.02; // near particles move a touch faster
          n.x += (tx + wx - n.x) * ease;
          n.y += (ty + wy - n.y) * ease;
        }
        curLink += (S.link - curLink) * 0.05;
      } else {
        for (const n of bnodes) {
          if (!reduceMotion) { n.x += n.vx; n.y += n.vy; }
          if (n.x < -20) n.x = BW + 20; else if (n.x > BW + 20) n.x = -20;
          if (n.y < -20) { n.y = BH + 20; n.x = Math.random() * BW; }
          else if (n.y > BH + 20) { n.y = -20; n.x = Math.random() * BW; }
        }
      }
      const link = (smart ? curLink : BLINK) * (1 + energy * 0.35);
      for (let i = 0; i < bnodes.length; i++) {
        const a = bnodes[i];
        for (let j = i + 1; j < bnodes.length; j++) {
          const b = bnodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < link) {
            bctx.strokeStyle = `rgba(${rgb},${Math.min(1, (1 - d / link) * 0.32 * k * Math.min(a.z, b.z) * (1 + energy * 0.6))})`;
            bctx.lineWidth = 0.6 + Math.min(a.z, b.z) * 0.8;
            bctx.beginPath(); bctx.moveTo(a.x, a.y); bctx.lineTo(b.x, b.y); bctx.stroke();
          }
        }
        const dm = Math.hypot(a.x - bmouse.x, a.y - bmouse.y);
        if (dm < BMOUSE) {
          bctx.strokeStyle = `rgba(${rgb},${Math.min(1, (1 - dm / BMOUSE) * 0.5 * k)})`;
          bctx.beginPath(); bctx.moveTo(a.x, a.y); bctx.lineTo(bmouse.x, bmouse.y); bctx.stroke();
        }
        bctx.fillStyle = `rgba(${rgb},${Math.min(1, (0.25 + a.z * 0.55) * Math.min(k, 1.3))})`;
        if (glow) { bctx.shadowBlur = glow * a.z; bctx.shadowColor = `rgba(${rgb},0.9)`; }
        bctx.beginPath(); bctx.arc(a.x, a.y, 0.8 + a.z * 1.7, 0, Math.PI * 2); bctx.fill();
        if (glow) bctx.shadowBlur = 0;
      }
    };
    requestAnimationFrame(bdraw);
  }

  /* ---------- Neural-network canvas in the hero ---------- */
  const canvas = $("#net");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = 1, nodes = [], visible = true;
    const mouse = { x: -9999, y: -9999 };
    const accent = () => getComputedStyle(root).getPropertyValue("--accent").trim() || "#b266ff";
    const hexToRgb = (h) => {
      const m = h.replace("#", "").match(/.{2}/g);
      return m ? m.map((x) => parseInt(x, 16)).join(",") : "178,102,255";
    };
    const size = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(Math.max((W * H) / 15000, 28), 95));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() < 0.12 ? 2.4 : 1.3,
      }));
    };
    size();
    window.addEventListener("resize", size);
    window.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

    const LINK = 135, MOUSE = 190;
    const draw = (t) => {
      requestAnimationFrame(draw);
      if (!visible || parseFloat(getComputedStyle(canvas).opacity) === 0) return;
      const rgb = hexToRgb(accent());
      ctx.clearRect(0, 0, W, H);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${rgb},${(1 - d / LINK) * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < MOUSE) {
          ctx.strokeStyle = `rgba(${rgb},${(1 - dm / MOUSE) * 0.6})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        const pulse = a.r > 2 ? 0.6 + 0.4 * Math.sin(t / 600 + i) : 1;
        ctx.fillStyle = `rgba(${rgb},${a.r > 2 ? 0.95 * pulse : 0.7})`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r * (a.r > 2 ? pulse + 0.4 : 1), 0, Math.PI * 2); ctx.fill();
      }
    };
    requestAnimationFrame(draw);
  }

  /* ---------- Rolling button text ---------- */
  $$(".roll").forEach((el) => {
    const text = el.textContent.trim();
    el.innerHTML = `<span class="roll-box"><span>${text}</span><span aria-hidden="true">${text}</span></span>`;
  });

  /* ---------- Mobile fullscreen menu ---------- */
  const menu = $("#menu");
  const toggle = $(".menu-toggle");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open);
    menu.setAttribute("aria-hidden", !open);
    $(".menu-label").textContent = open ? "Close" : "Menu";
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  };
  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  $$(".menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Centre nav dropdown ---------- */
  const group = $(".nav-group");
  const caret = $(".nav-caret");
  const setDrop = (open) => { group.classList.toggle("open", open); caret.setAttribute("aria-expanded", open); };
  caret.addEventListener("click", (e) => { e.stopPropagation(); setDrop(!group.classList.contains("open")); });
  group.addEventListener("mouseleave", () => setDrop(false));
  $$(".dropdown a").forEach((a) => a.addEventListener("click", () => setDrop(false)));
  document.addEventListener("click", (e) => { if (!group.contains(e.target)) setDrop(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); setDrop(false); } });

  /* ---------- Custom cursor ---------- */
  const cursor = $(".cursor");
  const cursorLabel = $(".cursor-label");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let mx = -100, my = -100, cx = -100, cy = -100;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; cursor.classList.add("visible"); });
    document.addEventListener("mouseleave", () => cursor.classList.remove("visible"));
    const loop = () => {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.addEventListener("mouseover", (e) => {
      const labelled = e.target.closest("[data-cursor]");
      const link = e.target.closest("a, button, summary");
      if (labelled && isDesktop()) {
        let text = labelled.dataset.cursor;
        const det = labelled.closest("details");
        if (det && labelled.tagName === "SUMMARY") text = det.open ? "Close" : "Open";
        cursorLabel.textContent = text;
        cursor.style.setProperty("--lw", `${text.length * 8 + 30}px`);
        cursor.classList.add("label"); cursor.classList.remove("hover");
      } else if (link) {
        cursor.classList.add("hover"); cursor.classList.remove("label");
      } else {
        cursor.classList.remove("hover", "label");
      }
    });
    // keep "Open/Close" label in sync when toggling
    $$("details").forEach((d) => d.addEventListener("toggle", () => {
      if (cursor.classList.contains("label") && d.matches(":hover")) cursorLabel.textContent = d.open ? "Close" : "Open";
    }));
  }

  /* ---------- Hero showcase slider ---------- */
  const track = $("#showcaseTrack");
  $$(".project-media > *").forEach((node) => {
    const clone = node.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
  const slides = track.children.length;
  let slide = 0, timer;
  const go = (n) => { slide = (n + slides) % slides; track.style.transform = `translateX(-${slide * 100}%)`; };
  const auto = () => { clearInterval(timer); timer = setInterval(() => go(slide + 1), 3500); };
  $(".sc-next").addEventListener("click", () => { go(slide + 1); auto(); });
  $(".sc-prev").addEventListener("click", () => { go(slide - 1); auto(); });
  auto();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Scroll-driven effects ---------- */
  const header = $(".header");
  const hero = $("#hero");
  const services = $$(".service");
  const darkZones = $$(".dark-card, .about-panel, .about-values, .cta");
  const aboutStage = $(".about-stage");
  const aboutPanel = $("#aboutPanel");
  const values = $$("#values li");
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;

    // Header: tuck away on scroll down, return on scroll up
    if (y > 120 && y > lastY + 4) header.classList.add("tucked");
    else if (y < lastY - 4 || y <= 120) header.classList.remove("tucked");
    lastY = y;

    // Header colour over dark areas (light theme only — in dark theme everything is dark)
    const probe = 46;
    header.classList.toggle("on-dark", !isDark() && !root.dataset.flow && darkZones.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe && getComputedStyle(s).visibility !== "hidden";
    }));

    {
      // Hero: parallax (moves at 20% of scroll speed), shrinks to 90% and fades out
      // (network themes have no solid panel to cover the hero, so it fades out a bit sooner;
      //  on phones sooner still, because the hero is shorter there)
      const fadeOver = root.dataset.flow ? (isDesktop() ? 0.65 : 0.5) : 1;
      const hp = clamp(y / (hero.offsetHeight * fadeOver));
      root.style.setProperty("--hy", (y * 0.2).toFixed(1));
      root.style.setProperty("--hp", hp.toFixed(3));

      // About: once the stage reaches the top, the card grows 50% -> 100% over 3/4 of a screen,
      // then its content fades in
      const r = aboutStage.getBoundingClientRect();
      const p = clamp(-r.top / (vh * 0.75));
      aboutPanel.style.setProperty("--s", (0.5 + 0.5 * p).toFixed(4));
      aboutPanel.style.setProperty("--r", "8px");
      aboutPanel.classList.toggle("full", p >= 0.999);
    }

    // Network themes: skill cards are see-through, so instead of being covered,
    // a card's text fades out as the next card slides up over it
    const fadeCards = !!root.dataset.flow;
    services.forEach((s, i) => {
      const body = $(".service-body", s);
      const next = services[i + 1];
      if (!fadeCards || !next) { body.style.opacity = ""; body.style.clipPath = ""; return; }
      // clip away whatever part of this card the next card has slid over (like being covered),
      // and fade the rest out as the next card reaches this card's heading
      const headBottom = $(".service-head", s).getBoundingClientRect().bottom;
      const br = body.getBoundingClientRect();
      const nr = next.getBoundingClientRect();
      const hidden = Math.max(0, br.bottom - (nr.top - 12));
      body.style.clipPath = hidden > 0 ? `inset(0 0 ${Math.min(hidden, br.height)}px 0)` : "";
      body.style.opacity = clamp((nr.top - headBottom) / 160).toFixed(3);
    });


    // Values: highlight the item closest to the centre of the screen
    let best = null, bestDist = Infinity;
    values.forEach((li) => {
      const r = li.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - vh * 0.5);
      if (d < bestDist) { bestDist = d; best = li; }
    });
    values.forEach((li) => li.classList.toggle("active", li === best && bestDist < vh * 0.45));
  };

  /* ---------- Lenis smooth scrolling (same library the reference site uses) ---------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  window.__lenis = lenis;

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // Smooth anchor scrolling (keeps header offset in mind)
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2 || id === "#top") {
      e.preventDefault();
      lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    const top = t.getBoundingClientRect().top + window.scrollY;
    lenis ? lenis.scrollTo(top) : window.scrollTo({ top, behavior: "smooth" });
  }));
})();

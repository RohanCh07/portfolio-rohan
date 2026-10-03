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

  /* ---------- Theme switcher (preview) ---------- */
  const swBtns = $$(".theme-switch button");
  const markTheme = () => {
    const cur = `${root.dataset.theme}:${root.dataset.accent}`;
    swBtns.forEach((b) => b.setAttribute("aria-pressed", b.dataset.set === cur));
  };
  swBtns.forEach((b) => b.addEventListener("click", () => {
    const [theme, accent] = b.dataset.set.split(":");
    root.dataset.theme = theme;
    root.dataset.accent = accent;
    try { localStorage.setItem("rc-theme", b.dataset.set); } catch (e) {}
    markTheme();
    window.dispatchEvent(new Event("scroll"));
  }));
  markTheme();

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
    header.classList.toggle("on-dark", !isDark() && darkZones.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe && getComputedStyle(s).visibility !== "hidden";
    }));

    if (isDesktop()) {
      // Hero: parallax (moves at 20% of scroll speed), shrinks to 90% and fades out
      const hp = clamp(y / hero.offsetHeight);
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

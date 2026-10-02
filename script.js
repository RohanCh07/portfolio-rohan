// =========================================================
// Rohan Chauhan — Portfolio interactions (no dependencies)
// =========================================================

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const isDesktop = () => window.matchMedia("(min-width: 1000px)").matches;

  $("#year").textContent = new Date().getFullYear();

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

    // Header colour over dark areas
    const probe = 46;
    header.classList.toggle("on-dark", darkZones.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe && getComputedStyle(s).visibility !== "hidden";
    }));

    if (isDesktop()) {
      // Hero stays pinned and dims while the services card slides over it
      const h = hero.offsetHeight;
      hero.style.setProperty("--hero-top", `${Math.min(0, vh - h)}px`);
      const over = clamp((y - Math.max(0, h - vh)) / vh);
      hero.style.setProperty("--shade", (over * 0.55).toFixed(3));

      // About: card grows from 50% to full screen
      const r = aboutStage.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 1.1));
      const s = 0.5 + 0.5 * p;
      aboutPanel.style.setProperty("--s", s.toFixed(4));
      aboutPanel.style.setProperty("--r", `${(1 - p) * 14 + 0}px`);
      aboutPanel.style.setProperty("--io", clamp((p - 0.55) / 0.35).toFixed(3));
    }

    // Services: animate content in once each card reaches the top area
    services.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.top < vh * 0.7) s.classList.add("in");
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

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // Smooth anchor scrolling (keeps header offset in mind)
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    const top = t.getBoundingClientRect().top + window.scrollY - (id.startsWith("#svc") ? 0 : 0);
    window.scrollTo({ top, behavior: "smooth" });
  }));
})();

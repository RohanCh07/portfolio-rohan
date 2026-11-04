/* Rohan Chauhan — portfolio v2
   theme · menu · clock · reveals · project filter · fitted titles · scroll trace */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ---------- year + IST clock ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  var clock = $('#clock');
  function tick() {
    if (!clock) return;
    try {
      var t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
      clock.textContent = 'IST ' + t;
    } catch (e) { clock.textContent = 'IST'; }
  }
  tick();
  setInterval(tick, 20000);

  /* ---------- theme ---------- */
  var themeBtn = $('#themeToggle');
  var themeLabel = $('#themeLabel');
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function currentTheme() { return root.dataset.theme || (darkQuery.matches ? 'dark' : 'light'); }
  function syncThemeUI() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    if (themeLabel) themeLabel.textContent = next === 'dark' ? 'Dark' : 'Light';
    if (themeBtn) themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeUI();
    });
  }
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', syncThemeUI);
  syncThemeUI();

  /* ---------- mobile menu ---------- */
  var header = $('.site-header');
  var menuBtn = $('#menuButton');
  function setMenu(open) {
    if (!header || !menuBtn) return;
    header.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(!header.classList.contains('is-open')); });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 760) setMenu(false); });

  /* ---------- reveal on scroll ---------- */
  var revealTargets = $$('.reveal, .project');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* current section in nav */
  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'experience', 'about', 'contact'].forEach(function (id) { var el = document.getElementById(id); if (el) navIO.observe(el); });
  }

  /* ---------- fit giant project names to the width ---------- */
  function fitNames() {
    $$('.project__name').forEach(function (h) {
      if (h.closest('.project').hidden) return;
      var lines = $$('.fit', h);
      var avail = h.clientWidth;
      if (!avail) return;
      h.style.setProperty('--fs', '100px');
      var widest = 0;
      lines.forEach(function (l) { widest = Math.max(widest, l.getBoundingClientRect().width); });
      if (!widest) return;
      var size = 100 * (avail * 0.985) / widest;
      var cap = Math.min(window.innerHeight * (lines.length > 1 ? 0.24 : 0.36), 340);
      h.style.setProperty('--fs', Math.max(28, Math.min(size, cap)).toFixed(1) + 'px');
    });
  }

  /* ---------- alternate tones on visible bands ---------- */
  function retone() {
    var visible = $$('.band').filter(function (b) { return !b.hidden; });
    visible.forEach(function (b, i) {
      var tone = i % 2 === 0 ? 'ink' : 'paper';
      b.classList.toggle('tone-ink', tone === 'ink');
      b.classList.toggle('tone-paper', tone === 'paper');
      b.dataset.tone = tone;
    });
  }

  /* ---------- the trace: one right-angled line through every band ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var traces = [];

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function buildTraces() {
    traces = [];
    $$('.trace').forEach(function (s) { s.remove(); });
    var bands = $$('.band').filter(function (b) { return !b.hidden; });

    bands.forEach(function (band, i) {
      var w = band.offsetWidth, h = band.offsetHeight;
      if (!w || !h) return;
      var inner = $('.band__inner', band);
      var pad = parseFloat(getComputedStyle(inner).paddingLeft) || 16;
      var gx = Math.max(6, pad * 0.45);
      var left = gx, right = w - gx;
      var xin = i % 2 === 0 ? left : right;
      var xout = i % 2 === 0 ? right : left;

      var anchor = $('[data-trace-y]', band);
      var y = h * 0.5;
      if (anchor) {
        // layout offsets (not getBoundingClientRect) so reveal transforms don't skew it
        var top = 0, node = anchor;
        while (node && node !== band) { top += node.offsetTop; node = node.offsetParent; }
        y = anchor.getAttribute('data-trace-y') === 'below'
          ? top + anchor.offsetHeight + Math.min(40, Math.max(22, w * 0.02))
          : top + anchor.offsetHeight / 2;
      }
      var y0 = i === 0 ? Math.min(h * 0.18, y - 40) : 0;
      y = Math.max(y0 + 30, Math.min(h - 30, y));
      var isEnd = i === bands.length - 1;
      var endLabelEl = $('[data-trace-end]', band);
      var r = Math.min(18, Math.abs(xout - xin) / 2);
      var dir = xout > xin ? 1 : -1;

      var d = 'M' + xin + ' ' + y0 + ' V' + (y - r) +
        ' Q' + xin + ' ' + y + ' ' + (xin + dir * r) + ' ' + y;
      var xEnd = isEnd ? (xin + dir * Math.min(Math.abs(xout - xin) * 0.82, Math.abs(xout - xin) - 120)) : xout;
      if (isEnd) {
        d += ' H' + xEnd;
      } else {
        d += ' H' + (xout - dir * r) + ' Q' + xout + ' ' + y + ' ' + xout + ' ' + (y + r) + ' V' + h;
      }

      var svg = el('svg', { 'class': 'trace', viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
      var path = el('path', { 'class': 'trace__path', d: d });
      svg.appendChild(path);

      if (i === 0) {
        svg.appendChild(el('circle', { 'class': 'trace__node', cx: xin, cy: y0, r: 6 }));
        svg.appendChild(el('circle', { 'class': 'trace__core', cx: xin, cy: y0, r: 2.5 }));
      }
      if (isEnd) {
        svg.appendChild(el('circle', { 'class': 'trace__node', cx: xEnd, cy: y, r: 7 }));
        svg.appendChild(el('circle', { 'class': 'trace__core', cx: xEnd, cy: y, r: 3 }));
        var label = el('text', { 'class': 'trace__label', x: xEnd - dir * 14, y: y + 26, 'text-anchor': dir > 0 ? 'end' : 'start' });
        label.textContent = endLabelEl ? endLabelEl.getAttribute('data-trace-end') : '200 OK';
        svg.appendChild(label);
      } else if (!band.classList.contains('approach')) {
        svg.appendChild(el('circle', { 'class': 'trace__node', cx: xout, cy: y, r: 5 }));
      }
      var packet = el('circle', { 'class': 'trace__packet', r: 4, cx: xin, cy: y0, opacity: 0 });
      svg.appendChild(packet);

      band.insertBefore(svg, band.firstChild);

      var total = path.getTotalLength();
      var v1 = Math.max(0, y - y0), hz = Math.abs(xEnd - xin), v2 = isEnd ? 0 : Math.max(0, h - y);
      var geo = v1 + hz + v2 || 1;
      var t = { band: band, path: path, packet: packet, total: total, scale: total / geo, y0: y0, y: y, h: h, v1: v1, hz: hz, v2: v2 };
      path.style.strokeDasharray = total + ' ' + total;
      path.style.strokeDashoffset = reduceMotion ? 0 : total;
      traces.push(t);
    });
    drawTraces();
  }

  /* map the viewport "read line" to how much of each band's trace is drawn */
  function drawTraces() {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    var readLine = vh * 0.62;
    traces.forEach(function (t) {
      var top = t.band.getBoundingClientRect().top;
      var ly = readLine - top;              // read line, in band coordinates
      var span = Math.min(vh * 0.35, Math.max(120, t.v2 * 0.5));   // scroll spent drawing the horizontal run
      var drawn;
      if (ly <= t.y0) drawn = 0;
      else if (ly <= t.y) drawn = ly - t.y0;
      else if (ly <= t.y + span || t.v2 === 0) drawn = t.v1 + t.hz * Math.min(1, (ly - t.y) / span);
      else drawn = t.v1 + t.hz + t.v2 * Math.min(1, (ly - t.y - span) / Math.max(1, t.h - t.y - span));
      drawn = Math.max(0, Math.min(t.total, drawn * t.scale));
      t.path.style.strokeDashoffset = (t.total - drawn).toFixed(1);

      var active = drawn > 2 && drawn < t.total - 2;
      if (active) {
        var p = t.path.getPointAtLength(drawn);
        t.packet.setAttribute('cx', p.x.toFixed(1));
        t.packet.setAttribute('cy', p.y.toFixed(1));
      }
      t.packet.setAttribute('opacity', active ? 1 : 0);
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { drawTraces(); ticking = false; });
  }, { passive: true });

  var resizeTimer;
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // phones fire resize when the URL bar hides; only rebuild if width changed
      var widthChanged = window.innerWidth !== lastW;
      lastW = window.innerWidth;
      if (widthChanged) fitNames();
      buildTraces();
    }, 150);
  });

  /* rebuild when case notes open/close (height changes) */
  $$('.notes').forEach(function (d) { d.addEventListener('toggle', function () { buildTraces(); }); });

  /* ---------- project filter ---------- */
  var projects = $$('.project');
  var filterBtns = $$('.filter');
  var status = $('#filterStatus');
  var labels = { all: 'all', company: 'company', personal: 'personal', research: 'research' };

  function countFor(cat) {
    return projects.filter(function (p) { return cat === 'all' || p.dataset.cat === cat; }).length;
  }
  $$('[data-count]').forEach(function (s) { s.textContent = countFor(s.dataset.count); });

  function applyFilter(cat, scroll) {
    var n = 0;
    projects.forEach(function (p) {
      var show = cat === 'all' || p.dataset.cat === cat;
      p.hidden = !show;
      if (show) {
        n++;
        var num = $('.project__num', p);
        if (num) num.textContent = String(n).padStart(2, '0');
        if (reduceMotion) p.classList.add('is-in');
      }
    });
    filterBtns.forEach(function (b) {
      var on = b.dataset.filter === cat;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    if (status) status.textContent = 'Showing ' + n + ' ' + (cat === 'all' ? '' : labels[cat] + ' ') + (n === 1 ? 'project' : 'projects');
    retone();
    fitNames();
    buildTraces();

    if (scroll) {
      var first = projects.filter(function (p) { return !p.hidden; })[0];
      if (first) {
        var top = first.getBoundingClientRect().top + window.scrollY;
        if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }
  }
  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () { applyFilter(b.dataset.filter, true); });
  });

  /* ---------- boot ---------- */
  function boot() {
    retone();
    fitNames();
    buildTraces();
    requestAnimationFrame(function () { root.classList.add('is-loaded'); });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
    setTimeout(function () { if (!root.classList.contains('is-loaded')) boot(); }, 1500);
  } else {
    boot();
  }
  window.addEventListener('load', function () { fitNames(); buildTraces(); });
})();

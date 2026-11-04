/* Rohan Chauhan — portfolio
   theme · menu · reveals · project filter · fitted names · the scroll thread */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- theme ---------- */
  var themeBtn = $('#themeToggle');
  var themeLabel = $('#themeLabel');
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function currentTheme() { return root.dataset.theme || (darkQuery.matches ? 'dark' : 'light'); }
  function syncTheme() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    if (themeLabel) themeLabel.textContent = next === 'dark' ? 'Dark' : 'Light';
    if (themeBtn) themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncTheme();
  });
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', syncTheme);
  syncTheme();

  /* ---------- mobile menu ---------- */
  var header = $('#header');
  var menuBtn = $('#menuButton');
  function setMenu(open) {
    header.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!header.classList.contains('is-open')); });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- reveals ---------- */
  // line art that draws itself: normalise every stroke to length 1
  $$('.draw path, .draw rect, .draw circle').forEach(function (n) { n.setAttribute('pathLength', '1'); });
  var revealEls = $$('.reveal, .project, .arc, .draw');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['capabilities', 'projects', 'experience', 'about', 'contact'].forEach(function (id) {
      var el = document.getElementById(id); if (el) navIO.observe(el);
    });
  }

  /* ---------- giant project names fill the width ---------- */
  function fitNames() {
    $$('.project:not([hidden]) .project__name').forEach(function (h) {
      var lines = $$('.fit', h);
      var avail = h.clientWidth;
      if (!avail) return;
      h.style.setProperty('--fs', '100px');
      var widest = 0;
      lines.forEach(function (l) { widest = Math.max(widest, l.scrollWidth); });
      if (!widest) return;
      var size = 100 * avail * 0.99 / widest;
      var cap = window.innerHeight * (lines.length > 1 ? 0.22 : 0.34);
      h.style.setProperty('--fs', Math.max(30, Math.min(size, cap, 360)).toFixed(1) + 'px');
    });
  }

  /* ---------- light/dark alternation of visible bands ---------- */
  function retone() {
    $$('.band').filter(function (b) { return !b.hidden; }).forEach(function (b, i) {
      b.classList.toggle('tone-ink', i % 2 === 0);
      b.classList.toggle('tone-paper', i % 2 === 1);
    });
  }

  /* ---------- the thread ---------- */
  var main = $('main');
  var svg = $('#thread');
  var NS = 'http://www.w3.org/2000/svg';
  var PROJECT_PATTERNS = [
    '0.2,0 0.07,0.2 0.15,0.5,n 0.5,0.57 0.86,0.5 0.93,0.8 0.8,1',
    '0.8,0 0.93,0.22 0.85,0.48,n 0.5,0.43 0.14,0.52 0.07,0.82 0.2,1'
  ];
  var T = null; // current thread state

  function mk(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // smooth curve through points (Catmull-Rom → cubic Bézier)
  function curve(pts) {
    var d = 'M' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    return d;
  }

  function buildThread() {
    if (!svg || !main) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var mRect = main.getBoundingClientRect();
    var W = main.clientWidth, H = main.scrollHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    var pts = [], projIdx = 0;
    $$('.band').filter(function (b) { return !b.hidden; }).forEach(function (band) {
      var r = band.getBoundingClientRect();
      var top = r.top - mRect.top, h = r.height;
      var spec = band.dataset.thread || PROJECT_PATTERNS[projIdx++ % 2];
      spec.trim().split(/\s+/).forEach(function (tok) {
        var pt;
        if (tok.indexOf('a:') === 0) {
          // a:elementId:fx,fy[,flag] — a point relative to an element's box
          var bits = tok.split(':'), target = document.getElementById(bits[1]);
          if (!target || !target.getClientRects().length) return;
          var er = target.getBoundingClientRect(), q = bits[2].split(',');
          pt = { x: er.left - mRect.left + parseFloat(q[0]) * er.width, y: er.top - mRect.top + parseFloat(q[1]) * er.height, flag: q[2] || '' };
        } else {
          var p = tok.split(',');
          pt = { x: parseFloat(p[0]) * W, y: top + parseFloat(p[1]) * h, flag: p[2] || '' };
        }
        var last = pts[pts.length - 1];
        if (last && Math.abs(last.y - pt.y) < 2 && Math.abs(last.x - pt.x) < 2) return; // band seams
        pts.push(pt);
      });
    });
    if (pts.length < 2) return;

    var path = mk('path', { 'class': 'thread__path', d: curve(pts) });
    svg.appendChild(path);
    var total = path.getTotalLength();

    // sample the path; cumulative max of y lets loops draw naturally while scrolling
    var step = 6, lens = [], maxY = [], xs = [], ys = [], m = -Infinity;
    for (var L = 0; L <= total; L += step) {
      var q = path.getPointAtLength(L);
      m = Math.max(m, q.y);
      lens.push(L); maxY.push(m); xs.push(q.x); ys.push(q.y);
    }

    var nodes = [];
    pts.forEach(function (p) {
      if (!p.flag) return;
      // length along the path nearest to this point
      var best = 0, bd = Infinity;
      for (var i = 0; i < xs.length; i++) {
        var dd = (xs[i] - p.x) * (xs[i] - p.x) + (ys[i] - p.y) * (ys[i] - p.y);
        if (dd < bd) { bd = dd; best = i; }
      }
      var g = mk('g', { opacity: reduceMotion ? 1 : 0 });
      g.style.transition = 'opacity .4s';
      if (p.flag === 'e') {
        g.appendChild(mk('circle', { 'class': 'thread__node', cx: p.x, cy: p.y, r: 9 }));
        g.appendChild(mk('circle', { 'class': 'thread__core', cx: p.x, cy: p.y, r: 3.5 }));
        var t = mk('text', { 'class': 'thread__label', x: p.x, y: p.y + 30, 'text-anchor': 'middle' });
        t.textContent = '200 OK';
        g.appendChild(t);
      } else {
        g.appendChild(mk('circle', { 'class': 'thread__node', cx: p.x, cy: p.y, r: 7 }));
        g.appendChild(mk('circle', { 'class': 'thread__core', cx: p.x, cy: p.y, r: 2.6 }));
      }
      svg.appendChild(g);
      nodes.push({ el: g, at: lens[best] });
    });

    var head = mk('circle', { 'class': 'thread__head', r: 4, opacity: 0 });
    svg.appendChild(head);

    path.style.strokeDasharray = total + ' ' + total;
    path.style.strokeDashoffset = reduceMotion ? 0 : total;
    T = { path: path, total: total, lens: lens, maxY: maxY, nodes: nodes, head: head, mainTop: mRect.top + window.scrollY };
    drawThread();
  }

  function drawThread() {
    if (!T || reduceMotion) return;
    var readY = window.scrollY + window.innerHeight * 0.66 - T.mainTop;
    // first sample whose running max y passes the read line
    var lo = 0, hi = T.maxY.length - 1;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (T.maxY[mid] > readY) hi = mid; else lo = mid + 1; }
    var drawn = T.maxY[T.maxY.length - 1] <= readY ? T.total : T.lens[lo];
    T.path.style.strokeDashoffset = (T.total - drawn).toFixed(1);
    T.nodes.forEach(function (n) { n.el.setAttribute('opacity', drawn >= n.at ? 1 : 0); });
    var live = drawn > 4 && drawn < T.total - 4;
    if (live) {
      var p = T.path.getPointAtLength(drawn);
      T.head.setAttribute('cx', p.x.toFixed(1)); T.head.setAttribute('cy', p.y.toFixed(1));
    }
    T.head.setAttribute('opacity', live ? 1 : 0);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { drawThread(); ticking = false; });
  }, { passive: true });

  var resizeTimer, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; fitNames(); if (window.innerWidth > 760) setMenu(false); }
      buildThread();
    }, 160);
  });
  $$('.notes').forEach(function (d) { d.addEventListener('toggle', buildThread); });

  /* ---------- project filter ---------- */
  var projects = $$('.project');
  var buttons = $$('.filter');
  var status = $('#filterStatus');
  $$('[data-count]').forEach(function (s) {
    var c = s.dataset.count;
    s.textContent = projects.filter(function (p) { return c === 'all' || p.dataset.cat === c; }).length;
  });
  function applyFilter(cat) {
    var n = 0;
    projects.forEach(function (p) {
      var show = cat === 'all' || p.dataset.cat === cat;
      p.hidden = !show;
      if (show) { n++; $('.project__num', p).textContent = String(n).padStart(2, '0'); }
    });
    buttons.forEach(function (b) {
      var on = b.dataset.filter === cat;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    if (status) status.textContent = 'Showing ' + n + (cat === 'all' ? '' : ' ' + cat) + (n === 1 ? ' project' : ' projects');
    retone(); fitNames(); buildThread();
    var first = projects.filter(function (p) { return !p.hidden; })[0];
    if (first) window.scrollTo({ top: first.getBoundingClientRect().top + window.scrollY, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.dataset.filter); }); });

  /* ---------- boot ---------- */
  var booted = false;
  function boot() {
    if (booted) return; booted = true;
    retone(); fitNames(); buildThread();
    requestAnimationFrame(function () { root.classList.add('is-loaded'); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
  // the display font can finish loading after "ready" resolves; re-measure when it lands
  if (document.fonts && document.fonts.load) {
    var refit = function () { fitNames(); buildThread(); };
    Promise.all([document.fonts.load('900 100px "Archivo"'), document.fonts.load('800 100px "Archivo"')]).then(refit, function () {});
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refit);
  }
  setTimeout(boot, 1500);
  window.addEventListener('load', function () { fitNames(); buildThread(); });
})();

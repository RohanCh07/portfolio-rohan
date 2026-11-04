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

  /* ---------- theme: always the black / ivory look ---------- */
  delete root.dataset.theme;
  try { localStorage.removeItem('theme'); } catch (e) {}

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
  var revealEls = $$('.reveal, .project, .arc');
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
    '0.3,0 0.16,0.24 0.24,0.5,n 0.52,0.6 0.8,0.52 0.84,0.8 0.7,1',
    '0.7,0 0.84,0.22 0.76,0.48,n 0.48,0.42 0.2,0.5 0.16,0.8 0.3,1'
  ];
  var T = null; // current thread state

  function mk(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // Smooth curve through points (Catmull-Rom → cubic Bézier). Points flagged "m" start a new
  // run, so the thread can hand over to a drawing and pick up after it.
  // Returns the path data plus samples computed with plain maths — measuring a long SVG path
  // with getPointAtLength() thousands of times freezes the page, so we never do that.
  function curve(pts) {
    var runs = [[]];
    pts.forEach(function (p) {
      if (p.flag.indexOf('m') !== -1 && runs[runs.length - 1].length) runs.push([]);
      runs[runs.length - 1].push(p);
    });
    // Each run becomes its own <path>: browsers restart the dash pattern at every "M" inside a
    // single path, which made the stretch after a break draw far ahead of the tip.
    var d = [], lens = [], xs = [], ys = [], total = 0, pieces = [];
    runs.filter(function (r) { return r.length > 1; }).forEach(function (run) {
      if (d.length) pieces.push({ d: d.join(' '), start: pieces.length ? pieces[pieces.length - 1].end : 0, end: total });
      d = [];
      d.push('M' + run[0].x.toFixed(1) + ' ' + run[0].y.toFixed(1));
      lens.push(total); xs.push(run[0].x); ys.push(run[0].y);
      run[0].len = total;
      for (var i = 0; i < run.length - 1; i++) {
        var p0 = run[i - 1] || run[i], p1 = run[i], p2 = run[i + 1], p3 = run[i + 2] || p2;
        var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
        var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
        if (p2.ctrl) {                       // rounded corner (quadratic as cubic)
          c1x = p1.x + (p2.ctrl.x - p1.x) * 2 / 3; c1y = p1.y + (p2.ctrl.y - p1.y) * 2 / 3;
          c2x = p2.x + (p2.ctrl.x - p2.x) * 2 / 3; c2y = p2.y + (p2.ctrl.y - p2.y) * 2 / 3;
        } else if (p1.line && p2.line) {     // straight trace
          c1x = p1.x + (p2.x - p1.x) / 3; c1y = p1.y + (p2.y - p1.y) / 3;
          c2x = p1.x + (p2.x - p1.x) * 2 / 3; c2y = p1.y + (p2.y - p1.y) * 2 / 3;
        } else {
          if (p1.line && p0 !== p1) { c1x = p1.x + (p1.x - p0.x) * 0.33 * Math.min(1, Math.hypot(p2.x - p1.x, p2.y - p1.y) / (Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1)); c1y = p1.y + (p1.y - p0.y) * 0.33 * Math.min(1, Math.hypot(p2.x - p1.x, p2.y - p1.y) / (Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1)); }
          if (p2.line && p3 !== p2) { c2x = p2.x - (p3.x - p2.x) * 0.33 * Math.min(1, Math.hypot(p2.x - p1.x, p2.y - p1.y) / (Math.hypot(p3.x - p2.x, p3.y - p2.y) || 1)); c2y = p2.y - (p3.y - p2.y) * 0.33 * Math.min(1, Math.hypot(p2.x - p1.x, p2.y - p1.y) / (Math.hypot(p3.x - p2.x, p3.y - p2.y) || 1)); }
        }
        d.push('C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1));
        var px = p1.x, py = p1.y, N = 20;
        for (var k = 1; k <= N; k++) {
          var t = k / N, u = 1 - t;
          var x = u * u * u * p1.x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * p2.x;
          var y = u * u * u * p1.y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * p2.y;
          total += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
          lens.push(total); xs.push(x); ys.push(y);
          px = x; py = y;
        }
        p2.len = total;
      }
    });
    if (d.length) pieces.push({ d: d.join(' '), start: pieces.length ? pieces[pieces.length - 1].end : 0, end: total });
    return { pieces: pieces, lens: lens, xs: xs, ys: ys, total: total };
  }

  function buildThread() {
    if (!svg || !main) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var mRect = main.getBoundingClientRect();
    var W = main.clientWidth, H = main.scrollHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    var pts = [], projIdx = 0, figs = [];
    var bandEls = $$('.band').filter(function (b) { return !b.hidden; });
    bandEls.forEach(function (band, bandIdx) {
      var r = band.getBoundingClientRect();
      var top = r.top - mRect.top, h = r.height;
      var narrow = window.innerWidth <= 1100;
      var spec = (narrow && band.dataset.threadMobile) || band.dataset.thread || PROJECT_PATTERNS[projIdx++ % 2];
      spec.trim().split(/\s+/).forEach(function (tok) {
        var pt;
        if (tok.indexOf('g:') === 0) {
          // g:figureId — the thread itself traces this figure's outline (one continuous stroke)
          var fsvg = document.getElementById(tok.slice(2));
          if (!fsvg || !fsvg.getClientRects().length) return;
          var fpath = fsvg.querySelector('path'), FL = fpath.getTotalLength(), ctm = fpath.getScreenCTM();
          var nS = Math.max(40, Math.round(FL / 3)), fi = figs.length;
          figs.push({ id: fsvg.id });
          for (var ks = 0; ks <= nS; ks++) {
            var q = fpath.getPointAtLength(FL * ks / nS);
            pts.push({ x: ctm.a * q.x + ctm.c * q.y + ctm.e - mRect.left, y: ctm.b * q.x + ctm.d * q.y + ctm.f - mRect.top, flag: '', band: bandIdx, fig: fi });
          }
          return;
        }
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
        pt.band = bandIdx;
        pts.push(pt);
      });
    });
    if (pts.length < 2) return;

    // Rounded right-angle routing: points flagged 'r' become rounded corners and points flagged
    // 'l' are straight-line ends, so a stretch of thread can run like a circuit trace.
    var routed = [];
    for (var ri = 0; ri < pts.length; ri++) {
      var V = pts[ri];
      if (V.flag.indexOf('r') !== -1 && pts[ri - 1] && pts[ri + 1]) {
        var A = pts[ri - 1], B = pts[ri + 1];
        var la = Math.hypot(A.x - V.x, A.y - V.y), lb = Math.hypot(B.x - V.x, B.y - V.y);
        var rad = Math.min(44, la / 2, lb / 2);
        routed.push({ x: V.x + (A.x - V.x) / (la || 1) * rad, y: V.y + (A.y - V.y) / (la || 1) * rad, flag: '', band: V.band, line: true });
        routed.push({ x: V.x + (B.x - V.x) / (lb || 1) * rad, y: V.y + (B.y - V.y) / (lb || 1) * rad, flag: '', band: V.band, line: true, ctrl: { x: V.x, y: V.y } });
      } else {
        if (V.flag.indexOf('l') !== -1) V.line = true;
        routed.push(V);
      }
    }
    pts = routed;

    // A real thread doesn't run in straight diagonals. Between anchors that are far apart,
    // add soft side-to-side bends that fade out at each anchor, so the line meanders.
    var vhNow = window.innerHeight, dense = [], seed = 0.7;
    var isStudy = root.classList.contains('study-page');
    for (var pi = 0; pi < pts.length; pi++) {
      var a = pts[pi], b = pts[pi + 1];
      dense.push(a);
      if (!b || (b.flag && b.flag.indexOf('m') !== -1) || (a.line && b.line) || a.fig != null || b.fig != null) continue;
      var dy = b.y - a.y, steps = Math.floor(Math.abs(dy) / (vhNow * 0.38));
      for (var k = 1; k < steps; k++) {
        var tt = k / steps, env = Math.sin(Math.PI * tt);
        var wobble = Math.sin(seed + (a.y + dy * tt) / (vhNow * 0.55)) * W * (isStudy ? 0.012 : 0.075) * env;   // case studies: stay in the margin
        var nx = a.x + (b.x - a.x) * tt + wobble;
        dense.push({ x: Math.max(W * 0.05, Math.min(W * 0.95, nx)), y: a.y + dy * tt, flag: '', band: a.band });
      }
      seed += 1.3;
    }
    pts = dense;

    var geo = curve(pts);
    var total = geo.total || 1, lens = geo.lens, xs = geo.xs, ys = geo.ys, step = 0;
    // one <path> per piece; pathLength makes each piece's dash units match our computed lengths
    var pieces = geo.pieces.map(function (pc) {
      var L = Math.max(0.01, pc.end - pc.start);
      var el = mk('path', { 'class': 'thread__path', d: pc.d, pathLength: L.toFixed(2) });
      el.style.strokeDasharray = L + ' ' + L;
      el.style.strokeDashoffset = reduceMotion ? 0 : L;
      svg.appendChild(el);
      return { el: el, start: pc.start, end: pc.end, len: L };
    });
    var path = pieces[0].el;

    // cumulative max of y lets loops draw naturally while scrolling
    var maxY = [], m = -Infinity;
    for (var si = 0; si < ys.length; si++) { m = Math.max(m, ys[si]); maxY.push(m); }

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

    var ring = mk('circle', { 'class': 'thread__ring', r: 11, opacity: 0 });
    svg.appendChild(ring);
    var head = mk('circle', { 'class': 'thread__head', r: 4, opacity: 0 });
    svg.appendChild(head);

    // where each section's stretch of thread ends, so it can draw one section at a time
    var bandEnd = bandEls.map(function () { return 0; });
    pts.forEach(function (p) { if (p.len != null) bandEnd[p.band] = Math.max(bandEnd[p.band], p.len); });
    for (var bi = 1; bi < bandEnd.length; bi++) bandEnd[bi] = Math.max(bandEnd[bi], bandEnd[bi - 1]);
    // each traced figure: where it starts and ends along the thread, and its vertical extent
    figs.forEach(function (f, fi) {
      var fp = pts.filter(function (q) { return q.fig === fi && q.len != null; });
      if (!fp.length) return;
      f.start = fp[0].len; f.end = fp[fp.length - 1].len;
      f.top = Math.min.apply(null, fp.map(function (q) { return q.y; }));
      f.bottom = Math.max.apply(null, fp.map(function (q) { return q.y; }));
      f.pts = pts.filter(function (q) { return q.fig === fi; }).map(function (q) { return [q.x, q.y]; });
    });
    // the line shown while the plug is being pulled (the coil straightening out)
    var pullPath = mk('path', { 'class': 'thread__pull', d: '', opacity: 0 });
    svg.appendChild(pullPath);
    var figById = {};
    figs.forEach(function (f) { if (f.start != null) figById[f.id] = f; });
    T = { path: path, total: total, lens: lens, maxY: maxY, xs: xs, ys: ys, step: step, nodes: nodes, head: head, ring: ring,
          bands: bandEls, bandEnd: bandEnd, figs: figs.filter(function (f) { return f.start != null; }), figById: figById, pull: pullPath, pieces: pieces, mainTop: mRect.top + window.scrollY };
    if (threadNow > total) threadNow = total;
    if (reduceMotion) threadNow = total;                         // no drawing animation: show it all
    threadGoal = Math.min(threadGoal, total);
    paintThread(threadNow);
    drawThread();
  }

  // The thread is pulled by the scroll: it is drawn exactly down to a line two-thirds of the way
  // down the screen, so its tip is always in view and stops the moment you stop.
  // (Lenis already smooths the scroll, so this needs no extra easing.)
  var READ = 0.67;
  var threadNow = 0, threadGoal = 0, intro = null;
  var easeInOut = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  function lengthAtScreenLine() {
    var readY = window.scrollY + window.innerHeight * READ - T.mainTop;
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) return T.total;
    for (var fi = 0; fi < T.figs.length; fi++) {
      var f = T.figs[fi];
      if (readY >= f.top && readY < f.bottom) return f.start + (f.end - f.start) * (readY - f.top) / Math.max(1, f.bottom - f.top);
    }
    var lo = 0, hi = T.maxY.length - 1;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (T.maxY[mid] > readY) hi = mid; else lo = mid + 1; }
    return T.maxY[T.maxY.length - 1] <= readY ? T.total : T.lens[lo];
  }
  // The tip follows the scroll, but never faster than a pen could move: long horizontal runs
  // (like the route around the capabilities heading) draw across instead of appearing at once.
  var PEN_SPEED = 2.1;                                           // px per millisecond
  var stepping = false, lastStep = 0, pulling = false;
  function drawThread() {
    if (!T || reduceMotion) return;
    if (!root.classList.contains('is-loaded')) return;          // wait for the opening signature
    threadGoal = lengthAtScreenLine();
    if (intro || pulling) return;                                // opening glide / plug being pulled
    if (!stepping) { stepping = true; lastStep = performance.now(); requestAnimationFrame(stepThread); }
  }
  function stepThread(now) {
    if (!T || pulling) { stepping = false; return; }
    var dt = Math.min(48, Math.max(1, now - lastStep)); lastStep = now;
    var diff = threadGoal - threadNow;
    // pen speed for ordinary gaps (e.g. a long horizontal run); big jumps (nav links, back to top) catch up fast
    var maxStep = PEN_SPEED * dt + Math.max(0, Math.abs(diff) - window.innerHeight * 1.6) * 0.18;
    threadNow = Math.abs(diff) <= maxStep ? threadGoal : threadNow + (diff > 0 ? maxStep : -maxStep);
    paintThread(threadNow);
    drawSkillmap();
    if (threadNow !== threadGoal) requestAnimationFrame(stepThread); else stepping = false;
  }
  // once, after the signature: glide the hero's stretch in, then hand over to the scroll
  function introThread() {
    if (!T || reduceMotion) return;
    threadGoal = lengthAtScreenLine();
    intro = { from: 0, start: performance.now(), dur: 1400 };
    (function frame(now) {
      var k = Math.min(1, (now - intro.start) / intro.dur);
      threadNow = intro.from + (lengthAtScreenLine() - intro.from) * easeInOut(k);
      paintThread(threadNow);
      if (k < 1) requestAnimationFrame(frame); else { intro = null; drawThread(); }
    })(intro.start);
  }
  function paintThread(drawn) {
    setDrawn(drawn);
    T.nodes.forEach(function (n) { n.el.setAttribute('opacity', drawn >= n.at ? 1 : 0); });
    var live = drawn > 4 && drawn < T.total - 4;
    if (live) {
      var lo2 = 0, hi2 = T.lens.length - 1;
      while (lo2 < hi2) { var md = (lo2 + hi2) >> 1; if (T.lens[md] < drawn) lo2 = md + 1; else hi2 = md; }
      T.head.setAttribute('cx', T.xs[lo2].toFixed(1)); T.head.setAttribute('cy', T.ys[lo2].toFixed(1));
      T.ring.setAttribute('cx', T.xs[lo2].toFixed(1)); T.ring.setAttribute('cy', T.ys[lo2].toFixed(1));
    }
    T.head.setAttribute('opacity', live ? 1 : 0);
    T.ring.setAttribute('opacity', live ? 0.55 : 0);
    figureUi(drawn);
  }
  // how much of each piece is drawn, given how far along the whole thread the tip is
  function setDrawn(drawn) {
    T.pieces.forEach(function (pc) {
      var v = Math.max(0, Math.min(pc.len, drawn - pc.start));
      pc.el.style.strokeDashoffset = (pc.len - v).toFixed(1);
    });
  }
  function figProgress(id, drawn) {
    var f = T && T.figById[id];
    if (!f) return reduceMotion ? 1 : null;
    return Math.max(0, Math.min(1, (drawn - f.start) / Math.max(1, f.end - f.start)));
  }
  function figureUi(drawn) {
    var sp = figProgress('figSpiral', drawn);
    if (sp != null) { toggleOn('#spiralIn', sp > 0); toggleOn('#spiralOut', sp > 0.92); }
    var co = figProgress('coil', drawn);
    var plugEl = document.getElementById('plug');
    if (plugEl) plugEl.classList.toggle('is-ready', reduceMotion || drawn >= T.total - 6 || (co != null && co > 0.985));
  }
  function toggleOn(sel, on) { var el = $(sel); if (el) el.classList.toggle('is-on', on); }

  /* skills map: two halves draw down both sides together from where the thread arrives at the top,
     each tip level with the thread's screen line, and they meet at the bottom just before the
     thread carries on. Skills on both sides appear as their half reaches them. */
  var skillmap = $('#skillmap');
  var skillItems = skillmap ? $$('.skill', skillmap) : [];
  var skillNodes = skillmap ? $$('.skillmap__node, .skillmap__group', skillmap) : [];
  var halves = skillmap ? $$('.skillmap__lines path', skillmap) : [];
  // Measured in their real lengths (not pathLength + fixed-width stroke, which some Chrome
  // versions dash differently), so "fully drawn" really is fully drawn everywhere.
  var halfLen = halves.map(function (p) {
    p.removeAttribute('pathLength'); p.removeAttribute('vector-effect');
    var L = p.getTotalLength() || 1;
    p.style.strokeDasharray = L + ' ' + L;
    p.style.strokeDashoffset = reduceMotion ? 0 : L;
    return L;
  });
  function setHalves(frac) {
    halves.forEach(function (p, i) { p.style.strokeDashoffset = (halfLen[i] * (1 - frac)).toFixed(2); });
  }
  var CY = 350, CR = 330, CH = 700;
  function drawSkillmap() {
    if (!skillmap) return;
    if (reduceMotion || window.innerWidth <= 1100) {
      setHalves(1);
      skillItems.concat(skillNodes).forEach(function (el) { el.classList.add('is-on'); });
      return;
    }
    if (!root.classList.contains('is-loaded')) return;
    var box = skillmap.getBoundingClientRect();
    // where the thread's tip is, in circle units (+ a small lead so the halves close first)
    var yBox = (window.innerHeight * READ - box.top) / box.height * CH + CR * 0.18;
    var frac = yBox <= CY - CR ? 0 : yBox >= CY + CR ? 1 : Math.acos((CY - yBox) / CR) / Math.PI;
    // the moment the thread has started its stretch below the circle, the circle is closed — no exceptions
    // (while the screen line is inside the circle the thread waits exactly at that point, so require real progress past it)
    if (T && T.pieces && T.pieces.length > 1 && threadNow > T.pieces[1].start + 4) frac = 1;
    if (window.innerHeight * READ > box.top + box.height * 680 / 700) frac = 1;
    setHalves(frac);
    skillNodes.forEach(function (el) { el.classList.toggle('is-on', frac > 0.03); });
    skillItems.forEach(function (li) { li.classList.toggle('is-on', frac >= parseFloat(li.getAttribute('data-t')) - 0.01); });
  }
  function drawFigures() {}

  /* ---------- contact: pull the plug — the coil straightens out, then the message pop-up opens ---------- */
  (function () {
    var plug = document.getElementById('plug'), form = document.getElementById('msgForm');
    var backdrop = document.getElementById('msgBackdrop');
    if (!plug || !form) return;
    var PULL = 190;                                // how far you pull for the coil to go fully straight
    var dragging = false, sx = 0, sy = 0, dx = 0, dy = 0, k = 0, anim = null, opened = false;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

    function coil() { return T && T.figById && T.figById.coil && T.figById.coil.pts; }
    // Draw the coil bent toward a straight line from its top to the plug: k = 0 is the coil, 1 is taut.
    function drawPull(ox, oy, kk) {
      var P = coil(); if (!P) return;
      var n = P.length, top = P[0], end = P[n - 1];
      var ex = end[0] + ox, ey = end[1] + oy, out = [];
      for (var i = 0; i < n; i++) {
        var u = i / (n - 1);
        var bx = P[i][0] + ox * u, by = P[i][1] + oy * u;          // bend with the hand
        var lx = top[0] + (ex - top[0]) * u, ly = top[1] + (ey - top[1]) * u;   // the taut line
        out.push((bx + (lx - bx) * kk).toFixed(1) + ' ' + (by + (ly - by) * kk).toFixed(1));
      }
      T.pull.setAttribute('d', 'M' + out.join(' L'));
      plug.style.transform = 'translate(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px)';
    }
    function beginPull() {
      var f = T && T.figById && T.figById.coil; if (!f) return false;
      pulling = true;
      setDrawn(f.start);                                            // hide the drawn coil; the pull line replaces it
      T.pull.setAttribute('opacity', 1);
      return true;
    }
    function endPull() {
      pulling = false;
      T.pull.setAttribute('opacity', 0);
      plug.style.transform = '';
      paintThread(threadNow);
    }
    function tween(from, to, ms, done) {
      if (anim) cancelAnimationFrame(anim.raf);
      var t0 = performance.now();
      anim = {};
      (function frame(now) {
        var t = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3);
        var v = {}; for (var key in from) v[key] = from[key] + (to[key] - from[key]) * e;
        drawPull(v.x, v.y, v.k);
        if (t < 1) anim.raf = requestAnimationFrame(frame); else { anim = null; if (done) done(); }
      })(t0);
    }
    function openForm() {
      if (opened) return; opened = true;
      backdrop.hidden = false; form.hidden = false; plug.setAttribute('aria-expanded', 'true');
      if (lenis) lenis.stop();
      var first = form.querySelector('input'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 200);
    }
    function closeForm() {
      if (!opened) return; opened = false;
      backdrop.hidden = true; form.hidden = true; plug.setAttribute('aria-expanded', 'false');
      if (lenis) lenis.start();
      // the cable springs back into its coil
      if (pulling) tween({ x: dx, y: dy, k: k }, { x: 0, y: 0, k: 0 }, 650, function () { dx = dy = k = 0; endPull(); plug.focus({ preventScroll: true }); });
      else plug.focus({ preventScroll: true });
    }
    // pull to straighten; past the end of the pull it snaps taut and the pop-up opens
    function untangleAndOpen() {
      if (!pulling && !beginPull()) { openForm(); return; }
      var ty = Math.max(dy, PULL), tx = dx;
      tween({ x: dx, y: dy, k: k }, { x: tx, y: ty, k: 1 }, 520, function () { dx = tx; dy = ty; k = 1; openForm(); });
    }

    plug.addEventListener('pointerdown', function (e) {
      if (!plug.classList.contains('is-ready') || opened) return;
      if (!beginPull()) return;
      dragging = true; sx = e.clientX; sy = e.clientY; dx = dy = k = 0;
      plug.setPointerCapture(e.pointerId); plug.classList.add('is-dragging');
      if (lenis) lenis.stop();
    });
    plug.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dx = (e.clientX - sx) * 0.7; dy = Math.max(0, e.clientY - sy);
      dy = Math.min(dy, PULL * 1.25);
      k = ease(Math.min(1, Math.hypot(dx, dy) / PULL));
      drawPull(dx, dy, k);
    });
    function release() {
      if (!dragging) return;
      dragging = false; plug.classList.remove('is-dragging');
      if (lenis && !opened) lenis.start();
      var moved = Math.hypot(dx, dy);
      if (moved < 6 || k > 0.82) { untangleAndOpen(); return; }      // a tap, or pulled far enough
      tween({ x: dx, y: dy, k: k }, { x: 0, y: 0, k: 0 }, 620, function () { dx = dy = k = 0; endPull(); });
    }
    plug.addEventListener('pointerup', release);
    plug.addEventListener('pointercancel', release);
    plug.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); untangleAndOpen(); } });
    form.querySelector('.msg__close').addEventListener('click', closeForm);
    backdrop.addEventListener('click', closeForm);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && opened) closeForm(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.msg__note');
      var fe = form.elements, name = fe['name'].value.trim(), email = fe['email'].value.trim(), msg = fe['message'].value.trim();
      if (!name || !msg || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { note.textContent = 'Add your name, a valid email and a message.'; return; }
      var subject = 'Portfolio message from ' + name;
      var body = msg + '\n\n— ' + name + ' (' + email + ')';
      window.location.href = 'mailto:chauhanrohan223@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      note.textContent = 'Your email app should open with the message ready to send.';
    });
  })();

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { drawThread(); drawSkillmap(); drawFigures(); ticking = false; });
  }, { passive: true });

  var resizeTimer, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; fitNames(); if (window.innerWidth > 760) setMenu(false); }
      buildThread(); drawParallax();
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
    retone(); fitNames(); buildThread(); collectFloaters(); drawParallax();
    var first = projects.filter(function (p) { return !p.hidden; })[0];
    if (first) scrollToY(first.getBoundingClientRect().top + window.scrollY);
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.dataset.filter); }); });

  /* ---------- smooth, weighted scrolling ---------- */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis === 'function') {
    // low lerp + reduced wheel step = a slower, heavier glide
    lenis = new window.Lenis({ duration: 1.05, wheelMultiplier: 0.9, touchMultiplier: 1, smoothWheel: true, syncTouch: false });
    var rafLoop = function (t) { lenis.raf(t); requestAnimationFrame(rafLoop); };
    requestAnimationFrame(rafLoop);
    root.style.scrollBehavior = 'auto';
  }
  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  // in-page links glide instead of jumping
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#top' ? document.body : document.querySelector(id);
      if (!target || !lenis) return;
      e.preventDefault();
      scrollToY(id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY);
      history.replaceState(null, '', id);
    });
  });

  /* ---------- project scenes: each project pins while its pieces arrive ---------- */
  var scenesOn = !reduceMotion;
  if (scenesOn) root.classList.add('scenes');
  var scenes = [];
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  function toPx(v) {
    v = String(v).trim();
    var n = parseFloat(v) || 0;
    if (/vw$/.test(v)) return n * window.innerWidth / 100;
    if (/vh$/.test(v)) return n * window.innerHeight / 100;
    return n;
  }
  function collectFloaters() {
    scenes = [];
    $$('.project:not([hidden])').forEach(function (proj) {
      var parts = [], k = { sketch: 0, card: 0, note: 0 };
      $$('.project__stage > *', proj).forEach(function (el) {
        var part = { el: el, kind: 'card', from: [0, 110], a0: 0, a1: 1, fade: true };
        if (el.classList.contains('project__name')) { part.kind = 'name'; part.a0 = 0; part.a1 = 0.2; }
        else if (el.classList.contains('sketch')) {
          part.kind = 'sketch'; part.fade = false;
          part.a0 = 0.06 + 0.07 * k.sketch++; part.a1 = part.a0 + 0.38;
          part.from = el.dataset.from ? el.dataset.from.split(',') : [0, 0];
          part.strokes = $$('path, rect, circle, ellipse', el);
          part.strokes.forEach(function (n) { n.setAttribute('pathLength', '1'); n.style.strokeDasharray = '1 1'; });
        }
        else if (el.classList.contains('callout') || el.classList.contains('sketch-note')) {
          part.kind = 'note'; part.from = [0, 36]; part.a0 = 0.38 + 0.06 * k.note++; part.a1 = part.a0 + 0.16;
        }
        else { part.a0 = 0.2 + 0.09 * k.card++; part.a1 = part.a0 + 0.22; }
        parts.push(part);
      });
      scenes.push({ host: proj, parts: parts });
    });
  }
  function settle(part) {   // final resting state (phones, reduced motion)
    var el = part.el;
    el.style.removeProperty('--px'); el.style.removeProperty('--py'); el.style.opacity = '';
    if (part.kind === 'name') el.style.removeProperty('--reveal');
    if (part.strokes) part.strokes.forEach(function (n) { n.style.strokeDashoffset = 0; });
  }
  function drawParallax() {
    var narrow = window.innerWidth <= 760;
    var vh = window.innerHeight;
    scenes.forEach(function (sc) {
      if (!scenesOn || narrow) { sc.parts.forEach(settle); return; }
      var r = sc.host.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var travel = Math.max(1, r.height - vh);
      var p = clamp01(-r.top / travel);              // 0 = just pinned, 1 = about to leave
      var lift = p > 0.86 ? -(p - 0.86) / 0.14 * 70 : 0;
      sc.parts.forEach(function (part) {
        var t = easeOut(clamp01((p - part.a0) / (part.a1 - part.a0)));
        var el = part.el;
        if (part.kind === 'name') {
          el.style.setProperty('--reveal', t.toFixed(3));
          el.style.setProperty('--py', (lift * 0.4).toFixed(1) + 'px');
          return;
        }
        var fx = toPx(part.from[0]) * (1 - t), fy = toPx(part.from[1]) * (1 - t);
        el.style.setProperty('--px', fx.toFixed(1) + 'px');
        el.style.setProperty('--py', (fy + lift).toFixed(1) + 'px');
        if (part.strokes) {
          var d = easeOut(clamp01((p - part.a0) / (part.a1 - part.a0) * 1.15));
          part.strokes.forEach(function (n) { n.style.strokeDashoffset = (1 - d).toFixed(3); });
          el.style.opacity = Math.min(1, t * 4).toFixed(2);
        } else if (part.fade) {
          el.style.opacity = t.toFixed(3);
        }
      });
    });
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(drawParallax); }, { passive: true });

  /* ---------- opening signature ---------- */
  var loader = $('#loader');
  var loaderDone = false, loaderWaiters = [];
  function afterLoader(fn) { if (loaderDone) fn(); else loaderWaiters.push(fn); }
  function runLoader() {
    var release = function () { loaderDone = true; loaderWaiters.splice(0).forEach(function (f) { f(); }); };
    if (!loader || reduceMotion) { if (loader) loader.hidden = true; release(); return; }
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    root.classList.add('is-locked');
    if (lenis) lenis.stop();
    var paths = $$('path', loader);
    // Pen timing, like a hand: the lead-in accelerates into the R, letters are written at a steady
    // pace (each stroke easing in and out), a short pen-lift between the two words, then the
    // closing swash is a fast whip that slows as it leaves the screen.
    var lens = paths.map(function (p) { return p.getTotalLength(); });
    var kinds = paths.map(function (p) { return p.getAttribute('data-kind') || 'letter'; });
    var letterLen = 0;
    kinds.forEach(function (k, i) { if (k === 'letter') letterLen += lens[i]; });
    var LEAD = 520, LETTERS = 1900, SWASH = 820, WORD_GAP = 140, delay = 120;
    var sigSvg = $('.loader__sig', loader);
    var vbW = sigSvg && sigSvg.viewBox && sigSvg.viewBox.baseVal ? sigSvg.viewBox.baseVal.width : 0;
    var scale = vbW ? sigSvg.getBoundingClientRect().width / vbW : 1;
    var nib = (1.9 / (scale || 1)).toFixed(2);
    var prevRight = null;
    paths.forEach(function (p, i) {
      var k = kinds[i], dur, ease;
      if (k === 'lead') { dur = LEAD; ease = 'cubic-bezier(.55,0,.85,.6)'; }
      else if (k === 'swash') { dur = SWASH; ease = 'cubic-bezier(.2,.7,.35,1)'; }
      else {
        dur = Math.max(30, LETTERS * lens[i] / (letterLen || 1));
        ease = 'cubic-bezier(.42,0,.58,1)';
        var box = p.getBBox();
        if (prevRight !== null && box.x - prevRight > 90) delay += WORD_GAP;   // lift the pen between words
        prevRight = Math.max(prevRight || 0, box.x + box.width);
      }
      p.style.strokeWidth = nib;
      p.setAttribute('pathLength', '1');
      p.style.strokeDasharray = '1 1';
      p.style.transition = 'none';                     // jump straight to "hidden" — don't animate into it
      p.style.strokeDashoffset = '1';
      p.dataset.draw = 'stroke-dashoffset ' + dur.toFixed(0) + 'ms ' + ease + ' ' + delay.toFixed(0) + 'ms';
      // strokes overlap slightly, so the pen never looks like it stops dead between pieces
      delay += k === 'letter' ? dur * 0.9 : dur;
    });
    if (sigSvg) sigSvg.getBoundingClientRect();       // make the browser apply the hidden state now
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      paths.forEach(function (p) { p.style.transition = p.dataset.draw; p.style.strokeDashoffset = 0; });
    }); });
    var finished = false;
    function finish() {
      if (finished) return; finished = true;
      loader.classList.add('is-leaving');
      root.classList.remove('is-locked');
      if (lenis) lenis.start();
      release();
      setTimeout(function () { loader.hidden = true; }, 600);
    }
    setTimeout(finish, delay + 220);
    loader.addEventListener('click', finish);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter') finish(); }, { once: true });
  }
  runLoader();   // starts straight away; does not wait for fonts


  /* ---------- cursor ---------- */
  var cur = $('#cursor');
  if (cur && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    var cx = -100, cy = -100, tx = -100, ty = -100, moving = false;
    cur.classList.add('is-hidden');
    var follow = function () {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) requestAnimationFrame(follow); else moving = false;
    };
    document.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (cur.classList.contains('is-hidden')) { cx = tx; cy = ty; cur.classList.remove('is-hidden'); }
      if (!moving) { moving = true; requestAnimationFrame(follow); }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { cur.classList.add('is-hidden'); });
    document.addEventListener('pointerover', function (e) {
      var labelled = e.target.closest('[data-cursor]');
      var link = e.target.closest('a, button, summary, .filter');
      cur.classList.toggle('is-active', !!labelled);
      cur.classList.toggle('is-link', !labelled && !!link);
      cur.setAttribute('data-label', labelled ? labelled.getAttribute('data-cursor') : '');
    });
  }

  /* ---------- boot ---------- */
  var booted = false;
  function boot() {
    if (booted) return; booted = true;
    retone(); fitNames(); buildThread(); collectFloaters(); drawParallax();
    afterLoader(function () {
      requestAnimationFrame(function () { root.classList.add('is-loaded'); setTimeout(function () { introThread(); drawSkillmap(); drawFigures(); }, 350); });
    });
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

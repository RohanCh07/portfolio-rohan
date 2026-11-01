// =========================================================
// "What I can do": one small live demo per skill.
//   AI & GenAI       retrieve context, then stream an answer
//   Backend          a live API access log
//   Data & ML        logistic regression learning a boundary
// Each demo only runs while it is on screen.
// =========================================================
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Run `start` while the element is visible; `start` gets an isOn() check.
  const whenVisible = (el, start) => {
    let on = false, token = 0;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; const t = ++token; start(() => on && t === token); }
      else if (!e.isIntersecting) on = false;
    }, { threshold: 0.2 }).observe(el);
  };

  /* ---------- AI & GenAI ---------- */
  const ai = document.querySelector(".viz-ai");
  if (ai) {
    const runs = [
      {
        q: "Which suppliers missed delivery last month?",
        chunks: [["orders_2026_10.sql", 0.92], ["supplier_sla.md", 0.87], ["rfq_policy.pdf", 0.41]],
        a: "3 suppliers missed their SLA. Apex Metals was late on 7 of 19 orders (source: orders_2026_10.sql).",
      },
      {
        q: "Draft an RFQ for 500 safety helmets.",
        chunks: [["rfq_template.docx", 0.95], ["catalog/ppe.csv", 0.83], ["past_rfqs.json", 0.78]],
        a: "Draft ready: 500 × ISI-marked helmets, delivery in 14 days, 3 approved vendors invited.",
      },
      {
        q: "Why did yesterday's pipeline fail?",
        chunks: [["airflow/etl.log", 0.94], ["schema_v12.sql", 0.71], ["runbook.md", 0.66]],
        a: "Column order_ts was renamed in schema v12. The loader still reads the old name. Fix: map order_ts → created_at.",
      },
    ];
    const qEl = ai.querySelector(".q-text"), aEl = ai.querySelector(".a-text"), state = ai.querySelector(".viz-state");
    const rows = [...ai.querySelectorAll(".viz-chunks li")];
    const show = (r, full) => {
      qEl.textContent = r.q;
      rows.forEach((li, i) => {
        li.querySelector(".c-name").textContent = r.chunks[i][0];
        li.querySelector(".c-score").textContent = full ? r.chunks[i][1].toFixed(2) : "";
        li.querySelector(".c-bar b").style.width = full ? r.chunks[i][1] * 100 + "%" : "0";
        li.classList.toggle("on", !!full);
      });
      aEl.textContent = full ? r.a : "";
    };
    if (reduce) { show(runs[0], true); state.textContent = "done"; }
    else whenVisible(ai, async (isOn) => {
      for (let k = 0; isOn(); k = (k + 1) % runs.length) {
        const r = runs[k];
        show(r, false); qEl.textContent = ""; state.textContent = "thinking";
        for (const ch of r.q) { if (!isOn()) return; qEl.textContent += ch; await wait(22); }
        await wait(300); state.textContent = "retrieving";
        for (let i = 0; i < rows.length; i++) {
          if (!isOn()) return;
          rows[i].classList.add("on");
          rows[i].querySelector(".c-bar b").style.width = r.chunks[i][1] * 100 + "%";
          rows[i].querySelector(".c-score").textContent = r.chunks[i][1].toFixed(2);
          await wait(380);
        }
        state.textContent = "answering";
        for (const word of r.a.split(" ")) { if (!isOn()) return; aEl.textContent += (aEl.textContent ? " " : "") + word; await wait(70); }
        state.textContent = "done";
        await wait(2600);
      }
    });
  }

  /* ---------- Backend ---------- */
  const api = document.querySelector(".viz-api");
  if (api) {
    const log = api.querySelector(".viz-log"), p95El = api.querySelector(".p95");
    const routes = [
      ["GET", "/api/v1/products?page=2", 200], ["POST", "/api/v1/cart/items", 201], ["GET", "/api/v1/orders/218", 200],
      ["PATCH", "/api/v1/orders/218", 200], ["POST", "/api/v1/auth/token", 200], ["GET", "/api/v1/admin/users", 403],
      ["DELETE", "/api/v1/cart/items/7", 204], ["GET", "/api/v1/search?q=helmet", 200], ["POST", "/api/v1/rfq", 201],
      ["GET", "/api/v1/orders?status=open", 200], ["GET", "/api/v1/products/999", 404],
    ];
    const times = [];
    const add = () => {
      const [m, path, st] = routes[Math.floor(Math.random() * routes.length)];
      const ms = Math.round(4 + Math.random() * 18 + (Math.random() < 0.1 ? 30 : 0));
      times.push(ms); if (times.length > 40) times.shift();
      const sorted = [...times].sort((a, b) => a - b);
      p95El.textContent = sorted[Math.floor(sorted.length * 0.95)] ?? ms;
      const li = document.createElement("li");
      li.innerHTML = `<span class="m">${m}</span><span class="p">${path}</span><span class="s${st >= 400 ? " w" : ""}">${st}</span><span class="t">${ms}ms</span>`;
      log.appendChild(li);
      while (log.children.length > 9) log.firstElementChild.remove();
    };
    if (reduce) for (let i = 0; i < 9; i++) add();
    else whenVisible(api, async (isOn) => {
      while (isOn()) { add(); await wait(380 + Math.random() * 700); }
    });
  }

  /* ---------- Data & ML ---------- */
  const ml = document.querySelector(".viz-ml");
  if (ml) {
    const NS = "http://www.w3.org/2000/svg";
    const g = ml.querySelector(".pts"), line = ml.querySelector(".boundary");
    const epEl = ml.querySelector(".ep"), accEl = ml.querySelector(".acc");
    const W = 400, H = 220;
    let pts = [], w = [0, 0, 0];
    const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const makeData = () => {
      const ang = Math.random() * Math.PI, d = 0.55;
      const c = [Math.cos(ang) * d, Math.sin(ang) * d];
      pts = [];
      for (let i = 0; i < 46; i++) {
        const y = i % 2;
        const s = y ? 1 : -1;
        pts.push({ x: s * c[0] + gauss() * 0.32, y2: s * c[1] + gauss() * 0.32, y });
      }
      // start from a deliberately wrong boundary so you can watch it learn
      w = [0.2, -Math.sin(ang) * 0.8, Math.cos(ang) * 0.8];
      g.replaceChildren(...pts.map((p) => {
        const el = document.createElementNS(NS, "circle");
        el.setAttribute("cx", ((p.x + 1.6) / 3.2) * W); el.setAttribute("cy", ((1.2 - p.y2) / 2.4) * H);
        el.setAttribute("r", 4); if (p.y) el.classList.add("b");
        p.el = el; return el;
      }));
    };
    const sig = (z) => 1 / (1 + Math.exp(-z));
    const step = () => {
      const grad = [0, 0, 0];
      for (const p of pts) { const e = sig(w[0] + w[1] * p.x + w[2] * p.y2) - p.y; grad[0] += e; grad[1] += e * p.x; grad[2] += e * p.y2; }
      for (let k = 0; k < 3; k++) w[k] -= 0.12 * grad[k] / pts.length;
    };
    const draw = (epoch) => {
      let right = 0;
      for (const p of pts) {
        const ok = (sig(w[0] + w[1] * p.x + w[2] * p.y2) > 0.5) === !!p.y;
        right += ok; p.el.classList.toggle("x", !ok);
      }
      epEl.textContent = epoch; accEl.textContent = (right / pts.length).toFixed(2);
      // boundary: w0 + w1 x + w2 y = 0, drawn across the plot
      const toPx = (x, y) => [((x + 1.6) / 3.2) * W, ((1.2 - y) / 2.4) * H];
      let a, b;
      if (Math.abs(w[2]) > Math.abs(w[1])) { a = toPx(-1.6, -(w[0] + w[1] * -1.6) / w[2]); b = toPx(1.6, -(w[0] + w[1] * 1.6) / w[2]); }
      else { a = toPx(-(w[0] + w[2] * 1.2) / w[1], 1.2); b = toPx(-(w[0] + w[2] * -1.2) / w[1], -1.2); }
      line.setAttribute("x1", a[0]); line.setAttribute("y1", a[1]); line.setAttribute("x2", b[0]); line.setAttribute("y2", b[1]);
    };
    makeData();
    if (reduce) { for (let i = 0; i < 300; i++) step(); draw(300); }
    else {
      draw(0);
      whenVisible(ml, async (isOn) => {
        while (isOn()) {
          for (let e = 1; e <= 120 && isOn(); e++) { for (let k = 0; k < 2; k++) step(); draw(e); await wait(60); }
          await wait(2200);
          if (isOn()) { makeData(); draw(0); await wait(500); }
        }
      });
    }
  }
})();

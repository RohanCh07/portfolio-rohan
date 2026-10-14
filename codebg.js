// =========================================================
// Source-code background
// Faint, syntax-highlighted code fills the right side of the screen and fades out
// towards the headline on the left. A little life:
//   - one line at a time is "typed" with a blinking cursor, like a live editor
//   - the code drifts up slowly as you scroll (a gentle parallax)
// With "reduce motion" switched on in the system settings it stays completely still.
// Behind the reading sections it dims (see .codebg.is-dim in flow.css).
//
// To show your own code, replace the text inside CODE below.
// =========================================================
(() => {
  const CODE = `from langgraph.graph import StateGraph
from portfolio.retrieval import VectorStore, rerank

class Agent:
    """Answers questions grounded in my own documents."""
    def __init__(self, store: VectorStore, llm):
        self.store, self.llm = store, llm

    def retrieve(self, query: str, k: int = 8):
        hits = self.store.search(embed(query), top_k=k)
        return rerank(query, hits)[:4]

    def answer(self, query: str) -> str:
        ctx = "\\n".join(h.text for h in self.retrieve(query))
        return self.llm.generate(PROMPT.format(ctx=ctx, q=query))

graph = StateGraph(AgentState)
graph.add_node("retrieve", agent.retrieve)
graph.add_node("answer", agent.answer)
graph.add_edge("retrieve", "answer")
app = graph.compile()

@router.post("/api/debug")
async def debug(req: DebugRequest):
    trace = run_sandboxed(req.code, timeout=5)
    fix = await app.ainvoke({"code": req.code, "trace": trace})
    return {"error": trace.error, "fix": fix.patch}

def train(model, loader, epochs=20):
    opt = torch.optim.AdamW(model.parameters(), lr=3e-4)
    for epoch in range(epochs):
        for x, y in loader:
            loss = F.cross_entropy(model(x), y)
            opt.zero_grad(); loss.backward(); opt.step()
        log(f"epoch {epoch:02d}  loss {loss.item():.4f}")`;

  const KEYWORDS = /^(from|import|class|def|return|async|await|for|in|self|with|as|if|else|try|except)$/;
  const SPLIT = /(\b(?:from|import|class|def|return|async|await|for|in|self|with|as|if|else|try|except)\b|f?"[^"]*"|#.*$)/;
  const LINES = CODE.split("\n");

  const root = document.documentElement;
  const cv = document.getElementById("codebg");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, dpr = 1;
  // typing state: which (absolute) line is being typed and how much of it is visible
  let active = -1, typed = 0, caretOn = true;

  const geometry = () => {
    const phone = W < 760;
    const size = phone ? 11 : 14;
    return { phone, size, lh: Math.round(size * 1.7), x0: phone ? 34 : Math.round(W * 0.42) };
  };
  const drift = () => (still ? 0 : window.scrollY * 0.12);   // code moves at 12% of the scroll speed

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    draw();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const light = root.dataset.theme === "light";
    const { phone, size, lh, x0 } = geometry();
    // colours: amber on black in dark mode, ink + orange on paper in light mode
    const C = light
      ? { kw: "232,64,20", str: "176,72,24", txt: "30,26,20", num: "30,26,20", a: [0.8, 0.62, 0.42, 0.32] }
      : { kw: "255,178,36", str: "255,214,140", txt: "243,236,224", num: "255,178,36", a: [0.55, 0.42, 0.24, 0.2] };
    const k = phone ? (light ? 0.5 : 0.4) : 1;
    ctx.font = `${size}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = "alphabetic";

    const d = drift();
    const first = Math.floor(d / lh);            // first visible (absolute) line
    const yStart = 40 - (d % lh);
    let caret = null;
    for (let y = yStart, n = first; y < H + lh; y += lh, n++) {
      const full = LINES[((n % LINES.length) + LINES.length) % LINES.length];
      const isActive = n === active;
      const line = isActive ? full.slice(0, typed) : full;
      const fade = Math.min(1, Math.max(0, (y / H) * 0.6 + 0.4)) * k;
      ctx.fillStyle = `rgba(${C.num},${C.a[3] * fade})`;
      ctx.fillText(String(n + 1).padStart(3, " "), x0 - (phone ? 30 : 44), y);
      let x = x0;
      for (const part of line.split(SPLIT)) {
        if (!part) continue;
        const isKw = KEYWORDS.test(part), isStr = /^f?"/.test(part);
        ctx.fillStyle = isKw ? `rgba(${C.kw},${C.a[0] * fade})` : isStr ? `rgba(${C.str},${C.a[1] * fade})` : `rgba(${C.txt},${C.a[2] * fade})`;
        ctx.fillText(part, x, y);
        x += ctx.measureText(part).width;
      }
      if (isActive || (still && n === first + 10)) caret = [x + 3, y];
    }
    if (caret && (caretOn || still)) {
      ctx.fillStyle = `rgba(${C.kw},${0.7 * k})`;
      ctx.fillRect(caret[0], caret[1] - size + 2, Math.round(size * 0.6), Math.round(size * 1.1));
    }
    // fade the code out towards the left: erase (not paint over) so the canvas stays transparent there
    if (!phone) {
      const g = ctx.createLinearGradient(W * 0.3, 0, W * 0.6, 0);
      g.addColorStop(0, "rgba(0,0,0,0.97)"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = g; ctx.fillRect(0, 0, W * 0.6, H);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // ---- typing loop: types the current line, pauses, moves on to the next one ----
  function pickStartLine() {
    const { lh } = geometry();
    return Math.floor(drift() / lh) + Math.round((H * 0.3) / lh);   // a line about a third down the screen
  }
  function step() {
    if (document.hidden) { setTimeout(step, 600); return; }
    const { lh } = geometry();
    const top = Math.floor(drift() / lh), bottom = top + Math.floor(H / lh);
    if (active < top + 2 || active > bottom - 2) { active = pickStartLine(); typed = 0; }
    const full = LINES[((active % LINES.length) + LINES.length) % LINES.length];
    if (typed < full.length) {
      typed++;
      caretOn = true; draw();
      setTimeout(step, full[typed - 1] === " " ? 18 : 38 + Math.random() * 55);
    } else {
      // line finished: blink a moment, then start the next line
      let blinks = 0;
      const blink = () => {
        caretOn = !caretOn; draw();
        if (++blinks < 4) setTimeout(blink, 420);
        else { active++; typed = 0; caretOn = true; setTimeout(step, 200); }
      };
      setTimeout(blink, 420);
    }
  }

  // draw once the mono font is ready
  const ready = document.fonts && document.fonts.load ? document.fonts.load('14px "JetBrains Mono"') : Promise.resolve();
  ready.then(start, start);
  function start() {
    resize();
    if (!still) { active = pickStartLine(); typed = 0; step(); }
  }

  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(resize, 150); });
  new MutationObserver(draw).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  // scrolling: redraw for the drift, and dim behind the reading sections
  let queued = false;
  window.addEventListener("scroll", () => {
    cv.classList.toggle("is-dim", window.scrollY > window.innerHeight * 0.6);
    if (still || queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; draw(); });
  }, { passive: true });
  cv.classList.toggle("is-dim", window.scrollY > window.innerHeight * 0.6);
})();

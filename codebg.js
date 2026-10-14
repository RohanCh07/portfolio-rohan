// =========================================================
// Source-code background
// Faint, syntax-highlighted code fills the right side of the screen and fades out
// towards the headline on the left. It is completely static: drawn once, and only
// redrawn when the window is resized or dark/light mode changes.
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

  const root = document.documentElement;
  const cv = document.getElementById("codebg");
  if (!cv) return;
  const ctx = cv.getContext("2d");

  function draw() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const light = root.dataset.theme === "light";
    const phone = W < 760;
    // colours: amber on black in dark mode, ink + orange on paper in light mode
    const C = light
      ? { kw: "255,76,36", str: "190,70,20", txt: "17,17,17", num: "17,17,17", a: [0.42, 0.34, 0.16, 0.14] }
      : { kw: "255,178,36", str: "255,214,140", txt: "243,236,224", num: "255,178,36", a: [0.55, 0.42, 0.24, 0.2] };
    const k = phone ? 0.4 : 1;

    const size = phone ? 11 : 14, lh = Math.round(size * 1.7);
    const x0 = phone ? 34 : Math.round(W * 0.42);
    ctx.font = `${size}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = "alphabetic";

    const lines = CODE.split("\n");
    let cursorAt = null;
    for (let y = 40, n = 0; y < H + lh; y += lh, n++) {
      const line = lines[n % lines.length];
      const fade = Math.min(1, Math.max(0, (y / H) * 0.6 + 0.4)) * k;   // a touch lighter at the top
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
      if (n === 10) cursorAt = [x + 4, y];   // a (static) text cursor at the end of line 11
    }
    if (cursorAt) {
      ctx.fillStyle = `rgba(${C.kw},${0.6 * k})`;
      ctx.fillRect(cursorAt[0], cursorAt[1] - size + 2, Math.round(size * 0.6), Math.round(size * 1.1));
    }

    // fade the code out towards the left so the headline sits on a clean background
    if (!phone) {
      // erase (not paint over) so the canvas stays transparent there
      const g = ctx.createLinearGradient(W * 0.3, 0, W * 0.6, 0);
      g.addColorStop(0, "rgba(0,0,0,0.97)"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = g; ctx.fillRect(0, 0, W * 0.6, H);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // draw once the mono font is ready, then only on resize / theme change
  const ready = document.fonts && document.fonts.load ? document.fonts.load('14px "JetBrains Mono"') : Promise.resolve();
  ready.then(draw, draw);
  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(draw, 150); });
  new MutationObserver(draw).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  // dim behind the reading sections (the code itself never moves)
  const dim = () => cv.classList.toggle("is-dim", window.scrollY > window.innerHeight * 0.6);
  window.addEventListener("scroll", dim, { passive: true });
  dim();
})();

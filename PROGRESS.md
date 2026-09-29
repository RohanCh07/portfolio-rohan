# PROGRESS

> Agents: read this after README.md. Update it at the end of every task.

**Current phase:** Phase 7: Real models and props — code complete, model assets pending
**Next task:** Phase 8: polish pass (lighting, bloom, particles) + batched fixes from Phases 4-6
**Last updated:** 2026-09-30

---

## Checklist

### Phase 0: Prep
- [ ] Real content written in `content.js` (about, 3 to 5 projects, contact)
- [ ] Resume PDF and project screenshots added
- [ ] References saved, overview sketch done

### Phase 1: Setup
- [x] index.html, import map, style.css
- [x] theme.js, content.js, store.js
- [x] Empty renderer running with background color
- [ ] Deployed to Vercel/Netlify

### Phase 2: Blockout scene
- [x] Room, desk, monitor, lamp, shelf, project board
- [x] Lighting, shadows, tone mapping
- [x] Overview camera plus mouse parallax
- [x] Layout and lighting tuned after first screenshot review (lighting + framing pass)

### Phase 3: Camera and navigation
- [x] Camera stops config (overview, monitor, shelf, board, phone, resume)
- [x] Raycaster hover and click on hotspots (monitor, shelf, board)
- [x] GSAP fly-to and Back button
- [x] Esc = back
- [ ] Keyboard focus support (Tab to hotspots)
- [ ] Phone / resume stops clickable (objects don't exist yet — see Known issues)

### Phase 4: HTML overlays
- [x] Overlay panel system (`src/ui/overlay.js`, `mountOverlay`)
- [x] About, Skills, Projects, Contact, Resume from `content.js`
- [x] Enter/exit transitions, responsive layout
- [x] Camera stop framing pass: pulled back stops (monitor, shelf, board) to maintain room context and frame objects in the left 50–65% of viewport clear of the right-side overlay panel

### Phase 5: Dev Mode
- [x] Full-screen IDE layout (`#dev-mode`: explorer, tabs, editor, collapsible terminal, status bar)
- [x] Virtual files generated dynamically from `content.js` via `buildVirtualFiles(content)`
- [x] Multi-tab system (open, focus, close with fallback to adjacent/placeholder)
- [x] Read-only editor with line numbers and syntax highlighting (highlight.js)
- [x] Status bar (location, availability, language, DEV MODE badge)
- [x] Persistent mode toggle button (`</>` ↔ `⬡ 3D`) mounted via `mountModeToggle()`
- [x] Terminal commands engine (`help`, `about`, `projects`, `skills`, `contact`, `resume`, `theme`, `clear`)
- [x] Monitor-click zoom transition into Dev Mode

### Phase 6: Quick View and fallbacks
- [x] Quick View page
- [x] Device tier detection and low-tier settings
- [x] No-WebGL fallback, reduced-motion support

### Phase 7: Real models and props
- [ ] CC0 GLB props downloaded and compressed — **blocked: `public/models/raw/` is empty, no models on disk yet.** Pipeline is built and waiting.
- [x] Loaded with GLTFLoader plus loading manager (`src/scene/props.js`: one shared GLTFLoader + DRACOLoader from gstatic, wired to one shared `THREE.LoadingManager`)
- [x] Per-prop primitive fallbacks so a missing/broken `.glb` never leaves a hole in the room
- [x] Selective palette tint (bright + saturated only; textured materials and palette colors are left alone)
- [x] Device tier respected — low tier skips props entirely, scene stays fully primitive
- [ ] Placeholders replaced with real GLBs, `CREDITS.md` started — needs the model files first

### Phase 8: Polish
- [ ] Lamp toggle, bloom, particles, screen flicker, vignette
- [ ] Loading screen, micro-interactions, optional sound

### Phase 9: Performance, SEO, accessibility
- [ ] Lighthouse pass, meta tags, OG image
- [ ] Cross-browser and mobile testing

### Phase 10: Launch
- [ ] Custom domain, analytics, links added

### Phase 11: Scalability
- [ ] Projects auto-added (markdown folder, GitHub API, or CMS)

---

## Assets

### Props (Phase 7) — configured in `PROPS` at the top of `src/scene/props.js`
Six GLB slots, all currently falling back to primitives until the models are dropped in.
Paths point at **optimised** files in `/public/models/` (never `/public/models/raw/`).

| `name` | path | position | rotation | scale | placement |
|---|---|---|---|---|---|
| `plant` | `/models/plant.glb` | `-1.30, 1.05, -1.80` | `0, 0.4, 0` | `0.40` | desk back-left |
| `headphones` | `/models/headphones.glb` | `-1.05, 1.07, -1.15` | `0, 0.9, 0` | `0.30` | desk front-left |
| `books` | `/models/books.glb` | `-2.75, 2.53, -4.90` | `0, 0.1, 0` | `0.25` | bookshelf top plank |
| `mug` | `/models/mug.glb` | `0.62, 1.05, -1.20` | `0, -0.6, 0` | `0.10` | desk right of monitor |
| `phone` | `/models/phone.glb` | `0.98, 1.06, -1.50` | `0, 0.35, 0` | `1.00` | desk right-front (matches the `phone` camera stop) |
| `resume` | `/models/notebook.glb` | `0.02, 1.05, -1.28` | `0, -0.25, 0` | `0.25` | desk centre (matches the `resume` camera stop) |

Scales are guesses per source — CC0 models are authored at wildly different sizes, so
expect one tuning pass after the first real load. Adding a prop means editing `PROPS` only.

### Third-party runtime assets
- Draco decoder (lazy, only for Draco-compressed files): `https://www.gstatic.com/draco/versioned/decoders/1.5.7/`, configured in `src/scene/props.js`.
- three.js r160, GSAP 3.12.5, highlight.js 11.9.0 — all via CDN, no npm, no build step.
- No `CREDITS.md` yet — must be created once the actual CC0 model sources are chosen.

### Model optimisation (run locally once, then replace the files in `/public/models/`)
```powershell
npx @gltf-transform/cli optimize public\models\raw\<name>.glb public\models\<name>.glb --compress draco --texture-compress webp
```
Per-model equivalent if `optimize` is too aggressive (it can also prune/quantise, which
hurts soft props):
```powershell
npx @gltf-transform/cli draco   public\models\raw\<name>.glb public\models\<name>.glb --method edgebreaker
npx @gltf-transform/cli resize  public\models\<name>.glb public\models\<name>.glb --width 1024 --height 1024
npx @gltf-transform/cli webp    public\models\<name>.glb
```
Check the totals afterwards and keep the sum under ~5 MB:
```powershell
npx @gltf-transform/cli inspect public\models\plant.glb
Get-ChildItem public\models\*.glb | Measure-Object -Property Length -Sum
```

---

## Decisions log
- Theme, scene map and navigation model are locked (see README section 2).
- Stack: vanilla JS + three.js via import map, no build step.
- Camera fly-to uses theme `motion` tokens (1.0 s, `power2.inOut`), inside the README 0.9–1.2 s rule.
- Parallax lives in `experience.js` render loop, gated to `activeSection === 'overview'` and not mid-tween.
- Overlay panels slide/fade at `motion.durationFast`, and skip animation under `prefers-reduced-motion`. Only the visible panel gets pointer events.
- Added a `content.js` `sections` map (`monitor` → About, `shelf` → Skills, `board` → Projects, `phone` → Contact) to drive panel headings.
- Camera stops framing pass (Phase 4): pulled back distance on all navigation stops (monitor, shelf, board) and adjusted camera height and lookAt angles so the hero object occupies the left half to two-thirds of the viewport without unlit backfaces, keeping room context (desk, floor, lamp glow) visible while the right-side overlay panel is open.
- Dev Mode is rendered in a full-screen `#dev-mode` layer that replaces the viewport when `store.mode === 'dev'`.
- `buildVirtualFiles(content)` pure function dynamically produces `about.md`, `skills.json`, `projects/<slug>.md`, and `contact.ts`.
- Code viewer uses `highlight.js` with theme-token overrides (`--monitor`, `--lamp`, `--muted`, `--text`) in JetBrains Mono.
- Persistent mode toggle button (`#mode-toggle`) in the top-right corner allows switching between `3d` and `dev` modes instantly.
- Phase 7 prop pipeline: a single module-scope `GLTFLoader` + `DRACOLoader` + one shared `THREE.LoadingManager` (`loadingManager`, exported from `props.js`). `ui/loader.js` subscribes to it, so the bar tracks real `.glb` bytes instead of a timer.
- `props.js` never blocks boot. `loadAllProps()` resolves with a per-prop report (`ok` / `source`) and adds a primitive stand-in wherever a load failed, so the room layout is identical with or without models.
- Low tier **skips props entirely** rather than loading a reduced set — chosen because a half-filled desk reads as broken, and low tier already disables shadows, which is most of what props contribute visually. Total model bytes on low tier: 0.
- Palette tinting gate is saturation ≥ 0.45 **and** lightness ≥ 0.45, then a 45% lerp toward the nearest theme token. Palette colours resolve to themselves (verified no-op), textured materials are skipped, and dark/warm natural tones are left untouched.
- Loading screen dismisses on `whenReady()` (all props settled) rather than `manager.onLoad`, because the Draco decoder binaries are fetched outside the manager's item count and `onLoad` can fire early. It also handles `onError` so a 404 can never leave the cover stuck on screen.
- `DRACOLoader` is pinned to the `js` decoder build (`type: 'js'`) — it works under strict CSP and older iOS where the wasm build can fail.

## Known issues
- **No model files yet:** `public/models/` is empty (only `.gitkeep`), so all six props render as their primitive fallbacks and the `/models/*.glb` requests 404. Drop the optimised GLBs in and they swap in automatically — no code change.
- **Placeholder stops:** `phone` and `resume` props now exist in the scene (with fallbacks), but `interaction.js` `HOTSPOTS` is still `['monitor', 'shelf', 'board']`, so those two stops remain unclickable. Wiring them needs the hotspot targets re-collected after props settle — left for the batched polish pass.
- Camera framing, placeholder content cleanup, and terminal styling from Phases 4-5 are batched for a single polish pass — not yet fixed individually.

## Session log
- 2026-09-29: Phases 1 and 2 built (setup + blockout scene).
- 2026-09-29: Phase 3 — `CAMERA_STOPS`, GSAP fly-to, raycaster hotspots (monitor/shelf/board), Back button + Esc, overview-only parallax gating.
- 2026-09-29: Phase 4 — `mountOverlay()` with About/Skills/Projects/Contact panels + resume download, glass panel CSS, a11y basics (dialog role, h2 focus), `content.sections` titles added.
- 2026-09-29: Phase 2 lighting/framing correction pass: lighting + camera values tuned, no geometry changes.
- 2026-09-29: Phase 4 verification & polish — refined interactive project card accordion, contact layout, heading focus management.
- 2026-09-30: Phase 5 (Part 1) — Dev Mode IDE workbench: `buildVirtualFiles(content)`, multi-tab explorer, syntax-highlighted editor with line numbers, collapsible terminal panel, status bar, `setMode` store action, and persistent mode toggle.
- 2026-09-30: Camera stops framing fix — pulled back CAMERA_STOPS (monitor, shelf, board) and centered lookAt targets to frame objects in the left 50–65% of the frame with room context.
- 2026-09-30: Phase 5b — Terminal commands engine built in `terminal.js` (`help`, `about`, `projects`, `skills`, etc.) with command history. Monitor-click zoom transition wired in `cameraRig.js`, along with a fade exit transition back to 3D. Contextual Escape key added.
- 2026-09-30: Phase 6 — Quick View implemented in `quickView.js`. Added `deviceTier.js` for "low"/"mid"/"high" detection. Added WebGL detection to `main.js`. Guarded heavy 3D loading (pixel ratio capping, disabling shadows) and disabled parallax / skipped GSAP animations in `cameraRig.js` for reduced-motion/low-tier devices.
- 2026-09-30: Phase 7 — GLB prop pipeline in `src/scene/props.js` (`PROPS` config, shared GLTFLoader + DRACOLoader + `loadingManager`, `loadProp()`, `loadAllProps()`, primitive fallbacks, selective palette tint). `experience.js` calls `loadAllProps(scene, { tier })` fire-and-forget and exports `whenReady()`; low tier skips props entirely. `src/ui/loader.js` rewritten from a comment into a real loading screen driven by `manager.onProgress` (no fake timer), mounted in `main.js` and dismissed once props settle; loader CSS appended to `style.css`. Verified via `node --check` on all four modules and a static-server pass; with `public/models/` empty all six props correctly fall back to primitives. Still outstanding: the actual `.glb` files, `CREDITS.md`, and `phone`/`resume` hotspot wiring in `interaction.js`.

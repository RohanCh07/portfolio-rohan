# PROGRESS

> Agents: read this after README.md. Update it at the end of every task.

**Current phase:** Phase 5: Dev Mode
**Next task:** Phase 5: Dev Mode
**Last updated:** 2026-09-29

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

### Phase 5: Dev Mode
- [ ] IDE layout (explorer, tabs, editor, terminal, status bar)
- [ ] Files generated from `content.js`
- [ ] Terminal commands
- [ ] Monitor zoom transition into Dev Mode, mode toggle

### Phase 6: Quick View and fallbacks
- [ ] Quick View page
- [ ] Device tier detection and low-tier settings
- [ ] No-WebGL fallback, reduced-motion support

### Phase 7: Real models and props
- [ ] CC0 GLB props downloaded and compressed
- [ ] Loaded with GLTFLoader plus loading manager
- [ ] Placeholders replaced, `CREDITS.md` started

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

## Decisions log
- Theme, scene map and navigation model are locked (see README section 2).
- Stack: vanilla JS + three.js via import map, no build step.
- Camera fly-to uses theme `motion` tokens (1.0 s, `power2.inOut`), inside the README 0.9–1.2 s rule.
- Parallax keeps living in `experience.js` render loop, gated to `activeSection === 'overview'` and not mid-tween.
- Overlay panels slide/fade at `motion.durationFast`, and skip animation under `prefers-reduced-motion`. Only the visible panel gets pointer events.
- Deleted the duplicate section-title text by adding a `content.js` `sections` map (monitor/shelf/board/phone → titles) so panel headings are content-driven.
- Phase 2 lighting/framing pass (2026-09-29): raised ambient, violet fill, hemisphere and ACES exposure; brighter lamp (5.0 power @12 dist, decay 1.2); lightened floor/wall; FOV 42→38 and overview camera pulled 5.5→4.8 so objects fill the frame. No geometry changes, no new objects.

## Known issues
- **Placeholder stops:** `phone` and `resume` are defined in `CAMERA_STOPS` but their objects don't exist yet — `props.js` is still an empty stub (Phase 7). They can't be clicked until the objects are added; `interaction.js` only activates monitor, shelf, board.
- **Overlay readiness:** the phone (Contact) panel and resume download are implemented in `overlay.js` but unreachable from the scene until the phone/resume objects exist (Phase 7). Resume triggers an automatic download (no panel).
- `contact.email`/`project.links` still contain `[PLACEHOLDER]` / example.com values from Phase 0 — fine until real content lands.

## Session log
- (date): Phases 1 and 2 built (setup + blockout scene).
- 2026-09-29: Phase 3 — `CAMERA_STOPS`, GSAP fly-to, raycaster hotspots (monitor/shelf/board), Back button + Esc, overview-only parallax gating.
- 2026-09-29: Phase 4 — `mountOverlay()` with About/Skills/Projects/Contact panels + resume download, glass panel CSS, a11y basics (dialog role, h2 focus), `content.sections` titles added.
- 2026-09-29: Phase 2 lighting/framing correction pass (too dark / too small in frame): lighting + camera values tuned, no geometry changes.
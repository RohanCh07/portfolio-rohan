# PROGRESS

> Agents: read this after README.md. Update it at the end of every task.

**Current phase:** Phase 4: HTML overlay panels
**Next task:** Phase 4: HTML overlay panels
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
- [ ] Layout and lighting tuned after first screenshot review

### Phase 3: Camera and navigation
- [x] Camera stops config (overview, monitor, shelf, board, phone, resume)
- [x] Raycaster hover and click on hotspots (monitor, shelf, board)
- [x] GSAP fly-to and Back button
- [x] Esc = back
- [ ] Keyboard focus support (Tab to hotspots)
- [ ] Phone / resume stops clickable (objects don't exist yet — see Known issues)

### Phase 4: HTML overlays
- [ ] Overlay panel system
- [ ] About, Skills, Projects, Contact, Resume from `content.js`
- [ ] Enter/exit transitions, responsive layout

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

## Known issues
- **Placeholder stops:** `phone` and `resume` are defined in `CAMERA_STOPS` but their objects don't exist yet — `props.js` is still an empty stub (Phase 7). They can't be clicked until the objects are added; `interaction.js` only activates monitor, shelf, board.

## Session log
- (date): Phases 1 and 2 built (setup + blockout scene).
- 2026-09-29: Phase 3 — `CAMERA_STOPS`, GSAP fly-to, raycaster hotspots (monitor/shelf/board), Back button + Esc, overview-only parallax gating.
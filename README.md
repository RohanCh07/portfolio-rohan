# 3D Portfolio: Cozy Night Desk

A full-3D portfolio for recruiters and clients, with a second **Dev Mode** (IDE-style) for developers. Built with plain HTML, CSS and JavaScript plus three.js. No React, no build step, no Blender required.

> **Status:** Planning → Phase 0
> **Rule #1:** Ship an ugly working version first. Polish comes last.

---

## 1. Goals

| Audience | What they should do in 60 seconds |
|---|---|
| Recruiter | See who I am, view top projects, download resume, contact me |
| Client | Feel the quality, see relevant work, get in touch |
| Developer | Toggle Dev Mode, browse projects like code, try the terminal |

**Success criteria**
- Loads in under 5 s on a normal connection, and the scene is interactive right after.
- Recruiters can reach projects, resume, and contact **without** exploring the 3D scene (Quick View).
- Works on mobile with a lightweight fallback.
- Adding a project means editing one data entry, never touching scene code.

---

## 2. Locked Decisions (do not revisit until the prototype works)

### Concept
**Cozy night desk.** A dark room lit by a warm lamp, a glowing monitor, and a few personal props. The camera flies between objects, and each object opens a section.

### Theme tokens (`src/theme.js`)

| Token | Value | Use |
|---|---|---|
| `bg` | `#14121F` | Room / page background |
| `lamp` | `#F2A65A` | Warm accent, lamp light, highlights |
| `monitor` | `#7C6CF0` | Violet accent, screen glow, Dev Mode accent |
| `text` | `#F5EFE6` | Primary text |
| `muted` | `#9A94A8` | Secondary text |

- **Fonts:** Space Grotesk (headings), Inter (body). Dev Mode uses JetBrains Mono.
- **Max colors:** 3 (bg, lamp, monitor) plus neutrals.
- **Lighting mood:** warm key light (lamp) plus cool violet fill (monitor).
- **Motion rule:** slow, eased movement everywhere (0.8 to 1.4 s), no sudden snaps.

### Scene map

| Object | Opens | Content source |
|---|---|---|
| Monitor | Dev Mode (IDE) | Same data, different skin |
| Framed poster / notebook | About | `content.about` |
| Bookshelf | Skills | `content.skills` |
| Wall board with pinned cards | Projects | `content.projects` |
| Phone / mailbox | Contact | `content.contact` |
| Mug / resume on desk | Resume download | `content.resume` |
| Lamp | Toggle light on/off | none (delight) |

### Navigation
- Fixed camera stops, with a smooth fly-to on click and a **Back** button.
- Subtle mouse parallax on the overview only.
- No free-roam controls.
- All text, links, and project details are **HTML overlays**, not 3D text.
- A permanent **Quick View** button opens a plain, fast list of projects, resume, and contact.

---

## 3. Tech Stack (Vanilla JS)

**No React, no npm, no build step.** Plain ES modules loaded by the browser through an import map. Run it with VS Code's Live Server extension (a local server is required for modules).

| Purpose | Tool |
|---|---|
| Structure | `index.html`, `style.css`, ES modules in `src/` |
| 3D | three.js (pinned version, loaded via import map from jsDelivr) |
| 3D helpers | `three/addons`: `GLTFLoader`, `DRACOLoader`, `EffectComposer`, `UnrealBloomPass`, `RoomEnvironment` |
| Camera animation | GSAP (CDN script) for eased fly-to tweens |
| UI overlays | Real DOM elements layered over the canvas (CSS transitions) |
| State | Tiny pub/sub store in `src/store.js` (no library) |
| Hosting | Vercel, Netlify or GitHub Pages (static files) |
| Version control | Git + GitHub |

**Assets:** primitives for main pieces (desk, monitor, lamp, shelf), free CC0 GLB models for props (Poly Pizza, Quaternius, Kenney). Always check the license.

**Import map (in `index.html`):**

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script type="module" src="/src/main.js"></script>
```

**Concept mapping (README phases were written with React terms in mind; use these vanilla equivalents):**

| Phase text says | Vanilla equivalent |
|---|---|
| Component / `Desk.jsx` | Module `desk.js` exporting `createDesk()` that returns a `THREE.Group` |
| Zustand store | `store.js` with `getState()`, `setState()`, `subscribe()` |
| drei `<Html>` overlays | DOM panels in `src/ui/overlay.js` |
| `ContactShadows` | Soft shadow map on the lamp light, or a radial-gradient blob plane under objects |
| `useGLTF` | `GLTFLoader` (+ `DRACOLoader`) with a `LoadingManager` for the loader bar |
| Postprocessing bloom | `EffectComposer` + `UnrealBloomPass` |
| Framer Motion | CSS transitions / GSAP |

---

## 4. Project Structure

```
portfolio/
├── index.html
├── style.css
├── public/
│   ├── models/              # optimized .glb props
│   ├── projects/            # project screenshots
│   ├── resume.pdf
│   └── og-image.png
├── src/
│   ├── main.js              # entry: boots scene, UI, mode switching
│   ├── theme.js             # colors, fonts, motion timings
│   ├── content.js           # ALL site content (single source of truth)
│   ├── store.js             # tiny pub/sub state
│   ├── scene/
│   │   ├── experience.js    # renderer, scene, lights, render loop, resize
│   │   ├── cameraRig.js     # camera stops + fly-to (GSAP) + parallax
│   │   ├── interaction.js   # raycaster: hover + click on hotspots
│   │   ├── room.js
│   │   ├── desk.js
│   │   ├── monitor.js
│   │   ├── lamp.js
│   │   ├── bookshelf.js
│   │   ├── projectBoard.js
│   │   ├── props.js         # mug, plant, headphones, phone (GLB)
│   │   └── particles.js     # floating dust
│   ├── ui/
│   │   ├── overlay.js       # HTML panels per section
│   │   ├── backButton.js
│   │   ├── modeToggle.js
│   │   ├── loader.js
│   │   └── quickView.js
│   ├── dev-mode/
│   │   ├── devMode.js       # IDE layout
│   │   └── terminal.js
│   └── utils/
│       └── deviceTier.js    # detects low-end / mobile
└── README.md
```

---

## 5. Content Schema (`src/content.js`)

Define this first. Every part of the site reads from it.

```js
export const content = {
  about: {
    name: "Your Name",
    title: "Your Role",
    tagline: "One sentence that says what you do and for whom.",
    bio: "2-3 short paragraphs.",
    location: "City, Country",
    availability: "Open to work",
  },
  skills: [
    { name: "React", category: "Frontend", level: 4 },
  ],
  projects: [
    {
      id: "project-slug",
      title: "Project Name",
      summary: "One-line pitch.",
      description: "What it is, your role, the result.",
      tech: ["React", "Node"],
      links: { live: "", repo: "" },
      image: "/projects/project-slug.png",
      featured: true,
      date: "2026-01",
    },
  ],
  contact: {
    email: "",
    github: "",
    linkedin: "",
  },
  resume: "/resume.pdf",
};
```

---

## 6. Roadmap

Each phase ends with a **working, committable** state. Do not start the next phase until the current one runs.

### Phase 0: Prep (½ day)
- [ ] Create the GitHub repo and push this README
- [ ] Write real content into `content.js` (about, 3 to 5 projects, contact)
- [ ] Add resume PDF and project screenshots
- [ ] Collect 5 to 8 visual references and save them in `/docs/references`
- [ ] Sketch the overview shot on paper (which object sits where)

**Done when:** content is written, and the sketch exists.

### Phase 1: Project Setup (½ day)
- [ ] Create `index.html`, `style.css`, `src/main.js` with the import map from section 3
- [ ] Load three.js and GSAP from CDN (no npm)
- [ ] Create `theme.js`, `content.js`, `store.js`
- [ ] Render an empty three.js canvas with the background color
- [ ] Deploy the empty site to Vercel (so deployment is never a surprise)

**Done when:** a live URL shows a dark canvas.

### Phase 2: Blockout Scene (1 to 2 days)
- [ ] Floor and back wall
- [ ] Desk from box primitives
- [ ] Monitor (rounded box plus emissive violet screen plane)
- [ ] Lamp (cylinder, cone, sphere) with a warm point light
- [ ] Shelf and wall board as plain boxes
- [ ] Ambient plus violet fill light, `ContactShadows` on the floor
- [ ] Fixed overview camera position

**Done when:** the overview looks like a room, even if crude. Screenshot it.

### Phase 3: Camera System and Navigation (1 to 2 days)
- [ ] Define camera stops (overview, monitor, shelf, board, phone, resume) in one config
- [ ] Click an object → camera flies to its stop
- [ ] Back button returns to overview
- [ ] Hover feedback (cursor pointer, slight glow or scale)
- [ ] Mouse parallax on the overview
- [ ] Keyboard support (Esc = back, Tab to focus hotspots)

**Done when:** you can visit every stop and return without glitches.

### Phase 4: HTML Overlays with Real Content (2 days)
- [ ] `Overlay` panel that shows content per active section
- [ ] About, Skills, Projects (card grid → detail view), Contact, Resume
- [ ] All data pulled from `content.js`
- [ ] Panel enter/exit animation (Framer Motion)
- [ ] Responsive panel layout

**Done when:** a recruiter could get everything they need through the overlays.

### Phase 5: Dev Mode (2 to 3 days)
- [ ] IDE layout: explorer, tabs, editor, terminal, status bar
- [ ] Files generated from `content.js` (`about.md`, `projects/*.md`, `skills.json`, `contact.ts`)
- [ ] Terminal commands: `help`, `about`, `projects`, `skills`, `contact`, `resume`, `theme`, `clear`
- [ ] Syntax-highlighted content (Shiki or Prism)
- [ ] Monitor click transitions into Dev Mode (zoom into the screen, then swap)
- [ ] Persistent toggle in the corner (`</>` / 3D)
- [ ] Reuse the violet accent from `theme.js`

**Done when:** both modes show the same data and switching feels seamless.

### Phase 6: Quick View and Fallbacks (1 day)
- [ ] `QuickView`: plain page with about, projects, resume, contact
- [ ] Device tier detection (`useDeviceTier`)
- [ ] Low tier: lower pixel ratio, no post-processing, fewer particles
- [ ] Very low tier or no WebGL: static image with tappable hotspots, or Quick View directly
- [ ] Respect `prefers-reduced-motion`

**Done when:** the site is usable on an old phone.

### Phase 7: Real Models and Props (2 to 3 days)
- [ ] Download CC0 GLB props (plant, mug, headphones, books, phone)
- [ ] Compress with `gltf-transform` (Draco, resize textures)
- [ ] Load with `useGLTF` and preload
- [ ] Replace placeholder boxes one by one
- [ ] Tint materials to fit the palette
- [ ] Keep total model weight under about 5 MB

**Done when:** the room feels lived in.

### Phase 8: Polish (2 to 3 days)
- [ ] Lamp toggle (light on/off with a transition)
- [ ] Bloom on lamp and screen (subtle)
- [ ] Floating dust particles
- [ ] Monitor screen flicker or scrolling code texture
- [ ] Vignette
- [ ] Optional ambient sound with a mute toggle (off by default)
- [ ] Loading screen with a progress bar and short intro
- [ ] Micro-interactions on hover and click

**Done when:** it looks and feels premium, and holds 60 fps on a mid-range laptop.

### Phase 9: Performance, SEO, Accessibility (1 day)
- [ ] Lighthouse pass (target 85+ performance on desktop)
- [ ] Lazy-load the 3D scene, and show a fast HTML shell first
- [ ] Meta tags, Open Graph image, favicon, title
- [ ] Real HTML text for content (crawlable), plus Quick View
- [ ] Alt text, focus states, color contrast
- [ ] Test on Chrome, Safari, Firefox, iOS, and Android

### Phase 10: Launch (½ day)
- [ ] Custom domain
- [ ] Analytics (Plausible or Vercel Analytics)
- [ ] Add the link to resume, LinkedIn, GitHub
- [ ] Share with 3 friends and watch them use it (no explaining!)
- [ ] Fix what confuses them

### Phase 11: Scalability (later)
Make projects add themselves:
- [ ] **Option A:** move projects into a `/content/projects/*.md` folder with frontmatter, loaded at build time
- [ ] **Option B:** fetch pinned or starred repos from the GitHub API at build time, then merge with manual overrides
- [ ] **Option C:** headless CMS (Sanity or Notion) for editing without code
- [ ] `ProjectBoard` renders N cards from data, with pagination or a "more" pile
- [ ] Dev Mode files generate from the same list automatically

---

## 7. Time Estimate

| Phase | Effort |
|---|---|
| 0 to 1: Prep and setup | 1 day |
| 2 to 3: Scene and camera | 3 to 4 days |
| 4: Overlays | 2 days |
| 5: Dev Mode | 2 to 3 days |
| 6: Fallbacks | 1 day |
| 7 to 8: Assets and polish | 4 to 6 days |
| 9 to 10: Optimize and launch | 1.5 days |
| **Total** | **about 3 to 4 weeks part-time** |

A usable version (through Phase 4) can exist in about a week.

---

## 8. Vibe-Coding Workflow

1. **One task per prompt.** Example: "Build `Lamp.jsx` with a warm point light and emissive bulb using tokens from `theme.js`."
2. **Always give context:** paste the relevant file plus the phase goal.
3. **Send screenshots** and describe problems in plain words ("too dark", "monitor looks flat", "camera overshoots").
4. **Commit after each working step.** Use messages like `phase-2: add desk and lamp`.
5. **Never let the AI rewrite the whole project.** Ask for changes to one component at a time.
6. **Keep `theme.js` and `content.js` as the only place for colors and text.**

### Starter prompts
See the chat for phase-by-phase Copilot prompts written for this vanilla stack.

---

## 9. Risks and Fixes

| Risk | Fix |
|---|---|
| Endless design tweaking | Theme is locked. Only change after Phase 4 |
| Scene looks flat | More light contrast, bloom, contact shadows, emissive accents |
| Heavy load / slow phones | Draco, small textures, device tiers, Quick View |
| Users get lost | Fixed camera stops, Back button, always-visible Quick View |
| Overengineering | Ship through Phase 4 first, and treat everything else as upgrades |
| Asset license issues | Use CC0 only, and keep a `CREDITS.md` |

---

## 10. Definition of Done (v1)

- [ ] Overview scene with 5 clickable objects
- [ ] Camera fly-to and back navigation
- [ ] Overlays with real content
- [ ] Dev Mode with a working terminal
- [ ] Quick View and mobile fallback
- [ ] Deployed on a custom domain
- [ ] Lighthouse and cross-browser checks passed

---

## 11. Credits

Keep a `CREDITS.md` listing every third-party model, font, and library with its license.
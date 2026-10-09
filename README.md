# Rohan Chauhan — Portfolio

A static website: plain HTML, CSS and JavaScript. There is no build step and no backend.

```
index.html          the page
style.css           base layout and typography
theme.css           dark-theme base rules
flow.css            dark (amber) and light (orange) modes, smart particle network
mobile.css          phone / tablet behaviour
script.js           animations, particle network, dark/light toggle
404.html            "page not found" page
assets/             resume PDF, icons, share image, smooth-scroll library
vercel.json         Vercel settings (clean URLs, security headers)
render.yaml         Render settings (same thing for Render)
robots.txt          lets search engines index the site
sitemap.xml         list of pages for search engines
```

---

## Before you launch: checklist

- [ ] **Photos:** add `assets/avatar.jpg` (small square headshot) and `assets/me.jpg` (bigger photo). They replace the "RC" placeholders automatically.
- [ ] **Project links:** each project in `index.html` links to `https://github.com/Rohan708`. Point each one to its own repo or live demo.
- [ ] **Resume:** replace `assets/Rohan-Chauhan-Resume.pdf` with your latest version, using the same file name.
- [ ] **Site address:** after the first deploy, find-and-replace `https://rohan-chauhan.vercel.app` with your real address in
  `index.html`, `robots.txt` and `sitemap.xml`. Then push again.
- [ ] **FAQ answers:** re-read them in `index.html` and make sure they're accurate.

---

## Put it on GitHub (once)

From this folder on your laptop:

```bash
git add .
git commit -m "Launch-ready portfolio"
# create an empty repo on github.com first (e.g. "portfolio"), then:
git remote add origin https://github.com/Rohan708/portfolio.git
git branch -M main
git push -u origin main
```

`.gitignore` keeps `backup-all-themes/`, `Claude outputs/` and the unused `sections.css` on your laptop only. They are not uploaded.

---

## Option A: Vercel (recommended)

1. Go to **vercel.com** → sign in with GitHub.
2. **Add New… → Project** → import your `portfolio` repo.
3. Settings:
   - Framework Preset: **Other**
   - Build Command: *leave empty*
   - Output Directory: *leave empty* (the repo root is the site)
4. Click **Deploy**. Your site is live at `https://<project-name>.vercel.app`.
5. To change the address: Project → **Settings → Domains**. You can rename the `.vercel.app` part or add your own domain.

Every `git push` to `main` redeploys automatically.

## Option B: Render

**Quick way:**

1. Go to **render.com** → sign in with GitHub.
2. **New + → Static Site** → pick your repo.
3. Build Command: `echo done` · Publish Directory: `.`
4. **Create Static Site** → live at `https://<name>.onrender.com`.

**Or with the included `render.yaml`:** **New + → Blueprint** → pick the repo. Render reads the settings from the file.

Every `git push` redeploys automatically here too.

> You only need one of the two. Vercel is a little faster to set up for a site like this.

---

## After launch

- Paste your link into LinkedIn or WhatsApp. It shows a preview card using `assets/og-image.jpg`.
- Optional: add the site to **Google Search Console** so it gets indexed faster.
- To update anything: edit the files → `git commit` → `git push`. The site redeploys automatically.

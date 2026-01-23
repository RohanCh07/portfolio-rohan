# Hosting Your Portfolio Website

## Option 1: Vercel (Recommended - Easiest) ⭐

Vercel is made by the Next.js team and offers the best experience for Next.js apps.

### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Your site will be live in ~2 minutes!

3. **Custom Domain (Optional)**
   - In Vercel dashboard, go to your project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

**Benefits:**
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ Auto-deploys on every git push
- ✅ Built-in CDN
- ✅ Zero configuration needed

---

## Option 2: Netlify

### Steps:

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy site"

**Note:** For Next.js on Netlify, you might need to use `@netlify/plugin-nextjs` for optimal performance.

---

## Option 3: GitHub Pages (Static Export)

If you want to use GitHub Pages, you'll need to export your Next.js app as static files.

### Steps:

1. **Update next.config.ts** to enable static export:
   ```typescript
   import type { NextConfig } from 'next';

   const nextConfig: NextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };

   export default nextConfig;
   ```

2. **Build and export:**
   ```bash
   npm run build
   ```
   This creates an `out` folder with static files.

3. **Deploy to GitHub Pages:**
   - Push the `out` folder contents to `gh-pages` branch
   - Enable GitHub Pages in repository settings
   - Your site will be at: `https://YOUR_USERNAME.github.io/portfolio`

**Note:** Static export has limitations (no API routes, server-side features).

---

## Option 4: Other Cloud Providers

### AWS (Amplify)
- AWS Amplify supports Next.js
- Connect your GitHub repo
- Auto-deploys on push

### Railway
- Simple deployment platform
- Connect GitHub repo
- Free tier available

### Render
- Similar to Vercel/Netlify
- Free tier with some limitations

---

## Before Deploying - Checklist

- [ ] Test build locally: `npm run build`
- [ ] Test production build: `npm run start`
- [ ] Update any placeholder links (GitHub, social media)
- [ ] Add your actual project GitHub links
- [ ] Update contact form email
- [ ] Check all sections load correctly
- [ ] Test on mobile devices

---

## Quick Deploy Commands

### Vercel CLI (Alternative to web interface)
```bash
npm i -g vercel
vercel login
vercel
```

### Netlify CLI
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

---

## Recommended: Vercel

For a Next.js portfolio, **Vercel is the best choice** because:
- Made specifically for Next.js
- Zero configuration
- Fastest deployment
- Best performance
- Free tier is very generous

Your portfolio will be live at: `https://your-project-name.vercel.app`

/**
 * overlay.js — HTML content panels per section (Phase 4).
 *
 * Subscribes to store.activeSection:
 *   monitor → About, shelf → Skills, board → Projects, phone → Contact.
 *   resume  → triggers a resume download instead of a panel.
 * Panels are hidden on "overview". The existing back button is reused
 * (Escape already closes via backButton), so no close control is added here.
 */

import { getState, subscribe } from '../store.js';
import { content } from '../content.js';
import { motion } from '../theme.js';

/** Sections that render an HTML panel. resume is handled as a download. */
const PANEL_KEYS = ['monitor', 'shelf', 'board', 'phone'];

/** Escape untrusted content text before injecting it into innerHTML. */
function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Mount the overlay panels into #ui and start reacting to store changes.
 * Returns a cleanup function so it can be unmounted/re-mounted safely.
 */
export function mountOverlay() {
  const root = document.getElementById('ui');
  if (!root) return () => {};

  /* Respect prefers-reduced-motion: panels appear instantly (no slide/fade). */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panelDurSec = reduceMotion ? 0 : motion.durationFast;

  /* Build one hidden panel per section. */
  const panels = {};
  for (const key of PANEL_KEYS) {
    panels[key] = buildPanel(key, panelDurSec);
    panels[key].hidden = true;
    root.appendChild(panels[key]);
  }

  const hideTimers = new Map();
  let activeKey = null;

  function sync(state) {
    const key = state.activeSection;
    if (key === activeKey) return;      // ignore unrelated state changes (e.g. lampOn)
    activeKey = key;

    if (key === 'resume') {
      triggerResumeDownload();
    } else if (Object.prototype.hasOwnProperty.call(panels, key)) {
      openPanel(panels[key]);
      for (const [k, el] of Object.entries(panels)) {
        if (k !== key) hidePanel(el);
      }
      const title = panels[key].querySelector('h2');
      if (title) title.focus({ preventScroll: true }); // a11y: focus the dialog heading on open
      return;
    }

    // overview or any unknown stop: close every panel
    for (const el of Object.values(panels)) hidePanel(el);
  }
  sync(getState());
  const unsubscribe = subscribe(sync);

  return () => {
    unsubscribe();
    for (const el of Object.values(panels)) {
      const t = hideTimers.get(el);
      if (t) clearTimeout(t);
      el.remove();
    }
  };

  /* ── panels ── */

  function buildPanel(key, durSec) {
    const section = content.sections?.[key];
    const title = section?.title || key.replace(/^\w/, (c) => c.toUpperCase());
    const el = document.createElement('section');
    el.className = 'overlay-panel';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-labelledby', `overlay-title-${key}`);
    el.style.transition =
      `opacity ${durSec}s ease, transform ${durSec}s ease`;
    el.innerHTML =
      `<h2 id="overlay-title-${key}" tabindex="-1">${esc(title)}</h2>` +
      bodyHtml(key);
    return el;
  }

  function openPanel(el) {
    const t = hideTimers.get(el);
    if (t) { clearTimeout(t); hideTimers.delete(el); }
    el.hidden = false;
    void el.offsetWidth;               // force reflow so the CSS transition runs
    el.classList.add('is-open');
    el.style.pointerEvents = 'auto';
  }

  function hidePanel(el) {
    if (el.hidden) return;
    el.classList.remove('is-open');
    el.style.pointerEvents = 'none';
    const t = window.setTimeout(() => el.hidden = true, durMs());
    hideTimers.set(el, t);
  }

  function durMs() {
    return Math.round(panelDurSec * 1000);
  }

  /* ── content builders ── */

  function bodyHtml(key) {
    switch (key) {
      case 'monitor': return aboutHtml();
      case 'shelf':   return skillsHtml();
      case 'board':   return projectsHtml();
      case 'phone':   return contactHtml();
      default:        return '';
    }
  }

  function aboutHtml() {
    const a = content.about || {};
    const bio = String(a.bio || '')
      .split(/\n\s*\n/)
      .map((p) => `<p>${esc(p)}</p>`)
      .join('');
    return `
      <p class="about-name">${esc(a.name || '')}</p>
      <p class="about-title">${esc(a.title || '')}</p>
      ${a.tagline ? `<p class="about-tagline">${esc(a.tagline)}</p>` : ''}
      ${bio ? `<div class="about-bio">${bio}</div>` : ''}
      <div class="about-meta">
        ${a.location ? `<span class="about-location">${esc(a.location)}</span>` : ''}
        ${a.availability ? `<span class="availability">${esc(a.availability)}</span>` : ''}
      </div>`;
  }

  function skillsHtml() {
    const byCat = {};
    for (const s of content.skills || []) {
      (byCat[s.category] ||= []).push(s);
    }
    const dots = (n) => {
      const filled = Math.max(0, Math.min(5, Number(n) || 0));
      let html = '';
      for (let i = 1; i <= 5; i++) {
        html += `<span class="dot${i <= filled ? ' filled' : ''}"></span>`;
      }
      return html;
    };
    const cats = Object.keys(byCat).map((cat) => `
      <h3 class="skill-cat">${esc(cat)}</h3>
      <ul class="skill-list">
        ${byCat[cat].map((s) => `
          <li class="skill-row">
            <span class="skill-name">${esc(s.name)}</span>
            <span class="level-dots" role="img" aria-label="${s.level} out of 5">${dots(s.level)}</span>
          </li>`).join('')}
      </ul>`).join('');
    return `<div class="skills-wrap">${cats}</div>`;
  }

  function projectsHtml() {
    const cards = (content.projects || []).map((p) => {
      const tech = (p.tech || []).map((t) => `<span class="chip">${esc(t)}</span>`).join('');
      const links = [];
      if (p.links?.live) {
        links.push(`<a class="card-link" href="${esc(p.links.live)}" target="_blank" rel="noopener">Live ↗</a>`);
      }
      if (p.links?.repo) {
        links.push(`<a class="card-link" href="${esc(p.links.repo)}" target="_blank" rel="noopener">Repo ↗</a>`);
      }
      return `
        <details class="project-card">
          <summary>
            <div class="card-head">
              <span class="card-title">${esc(p.title || p.id)}</span>
              ${p.date ? `<span class="card-date">${esc(p.date)}</span>` : ''}
              <span class="card-toggle" aria-hidden="true">▾</span>
            </div>
            ${p.summary ? `<p class="card-summary">${esc(p.summary)}</p>` : ''}
            ${tech ? `<div class="card-tech">${tech}</div>` : ''}
          </summary>
          <div class="card-body">
            ${p.description ? `<p class="card-description">${esc(p.description)}</p>` : ''}
            ${links.length ? `<div class="card-links">${links.join('')}</div>` : ''}
          </div>
        </details>`;
    }).join('');
    return `<div class="project-grid">${cards}</div>`;
  }

  function contactHtml() {
    const c = content.contact || {};
    const items = [];

    if (c.email) {
      const email = c.email.replace(/^\[PLACEHOLDER\]\s*/i, '').trim();
      items.push(`
        <a class="contact-link" href="mailto:${esc(email)}">
          <span class="contact-label">Email</span>
          <span class="contact-val">${esc(email)}</span>
        </a>`);
    }

    if (c.github) {
      const rawUrl = c.github.replace(/^\[PLACEHOLDER\]\s*/i, '').trim();
      const display = rawUrl.replace(/^https?:\/\/(www\.)?/, '');
      items.push(`
        <a class="contact-link" href="${esc(rawUrl)}" target="_blank" rel="noopener">
          <span class="contact-label">GitHub</span>
          <span class="contact-val">${esc(display)} ↗</span>
        </a>`);
    }

    if (c.linkedin) {
      const rawUrl = c.linkedin.replace(/^\[PLACEHOLDER\]\s*/i, '').trim();
      const display = rawUrl.replace(/^https?:\/\/(www\.)?/, '');
      items.push(`
        <a class="contact-link" href="${esc(rawUrl)}" target="_blank" rel="noopener">
          <span class="contact-label">LinkedIn</span>
          <span class="contact-val">${esc(display)} ↗</span>
        </a>`);
    }

    return `<div class="contact-list">${items.join('')}</div>`;
  }

  /* ── resume ── */

  function triggerResumeDownload() {
    if (!content.resume) return;
    const a = document.createElement('a');
    a.href = content.resume;
    a.download = '';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
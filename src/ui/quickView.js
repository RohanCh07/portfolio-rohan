import { getState, subscribe, setMode } from '../store.js';
import { content } from '../content.js';
import { colors, fonts } from '../theme.js';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function mountQuickView() {
  const root = document.getElementById('quick-view');
  if (!root) return () => {};

  // Mount persistent Quick View button next to mode toggle
  const qvBtn = document.createElement('button');
  qvBtn.type = 'button';
  qvBtn.id = 'quick-view-toggle';
  qvBtn.textContent = 'Quick View';
  qvBtn.style.cssText = `
    position: fixed;
    top: 14px;
    right: 140px; /* next to the mode toggle */
    z-index: 100;
    padding: 7px 14px;
    background: rgba(20, 18, 31, 0.85);
    border: 1px solid rgba(124, 108, 240, 0.4);
    border-radius: 8px;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
  `;
  // Add hover effect
  qvBtn.onmouseenter = () => { qvBtn.style.background = 'rgba(124, 108, 240, 0.2)'; qvBtn.style.borderColor = 'var(--monitor)'; };
  qvBtn.onmouseleave = () => { qvBtn.style.background = 'rgba(20, 18, 31, 0.85)'; qvBtn.style.borderColor = 'rgba(124, 108, 240, 0.4)'; };
  document.body.appendChild(qvBtn);

  qvBtn.addEventListener('click', () => {
    const currentMode = getState().mode;
    setMode(currentMode === 'quick' ? '3d' : 'quick');
  });

  // Build the Quick View content
  root.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 40; /* Above 3D, below Dev Mode and toggles */
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    overflow-y: auto;
    padding: 40px 20px;
    -webkit-overflow-scrolling: touch;
  `;

  const container = document.createElement('div');
  container.style.cssText = `
    max-width: 680px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 48px;
  `;

  // 1. Header (About)
  const a = content.about || {};
  const bio = String(a.bio || '').replace(/\\n/g, '<br>');
  const headerHtml = `
    <header>
      <h1 style="font-family: var(--font-heading); font-size: 2.5rem; margin-bottom: 8px; color: var(--text);">${esc(a.name)}</h1>
      <h2 style="font-size: 1.25rem; color: var(--monitor); margin-bottom: 16px;">${esc(a.title)}</h2>
      <p style="font-size: 1.1rem; line-height: 1.6; color: var(--text); margin-bottom: 16px;"><strong>${esc(a.tagline)}</strong></p>
      <p style="font-size: 1rem; line-height: 1.6; color: var(--muted);">${bio}</p>
      <div style="margin-top: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
        ${a.location ? `<span style="color: var(--muted);">${esc(a.location)}</span>` : ''}
        ${a.availability ? `<span style="padding: 4px 12px; border-radius: 99px; border: 1px solid var(--monitor); color: var(--text); font-size: 0.875rem;">${esc(a.availability)}</span>` : ''}
      </div>
    </header>
  `;

  // 2. Skills
  const skillsList = (content.skills || []).map(s => `${esc(s.name)}`).join(', ');
  const skillsHtml = `
    <section>
      <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--lamp); margin-bottom: 16px;">Skills</h3>
      <p style="color: var(--text); line-height: 1.6;">${skillsList}</p>
    </section>
  `;

  // 3. Projects
  const projHtml = (content.projects || []).map(p => `
    <div style="border: 1px solid rgba(154, 148, 168, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 16px; background: rgba(255,255,255,0.02);">
      <h4 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--text); margin-bottom: 8px;">${esc(p.title)} <span style="font-size: 0.875rem; color: var(--muted); font-weight: normal; margin-left: 8px;">${esc(p.date)}</span></h4>
      <p style="color: var(--muted); margin-bottom: 12px; line-height: 1.5;">${esc(p.summary)}</p>
      <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
        ${(p.tech || []).map(t => `<span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 99px; border: 1px solid rgba(124, 108, 240, 0.4); color: var(--monitor);">${esc(t)}</span>`).join('')}
      </div>
      <p style="color: var(--text); line-height: 1.6; margin-bottom: 20px;">${esc(p.description)}</p>
      <div style="display: flex; gap: 12px;">
        ${p.links?.live ? `<a href="${esc(p.links.live)}" target="_blank" style="color: var(--lamp); text-decoration: none; font-weight: 500;">Live ↗</a>` : ''}
        ${p.links?.repo ? `<a href="${esc(p.links.repo)}" target="_blank" style="color: var(--lamp); text-decoration: none; font-weight: 500;">Repo ↗</a>` : ''}
      </div>
    </div>
  `).join('');
  const projectsSection = `
    <section>
      <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--lamp); margin-bottom: 24px;">Projects</h3>
      ${projHtml}
    </section>
  `;

  // 4. Contact & Resume
  const c = content.contact || {};
  const contactLinks = [];
  if (c.email) contactLinks.push(`<a href="mailto:${esc(c.email)}" style="color: var(--monitor); text-decoration: none;">Email</a>`);
  if (c.github) contactLinks.push(`<a href="${esc(c.github)}" target="_blank" style="color: var(--monitor); text-decoration: none;">GitHub</a>`);
  if (c.linkedin) contactLinks.push(`<a href="${esc(c.linkedin)}" target="_blank" style="color: var(--monitor); text-decoration: none;">LinkedIn</a>`);

  let resumeBtn = '';
  if (content.resume) {
    resumeBtn = `<a href="${esc(content.resume)}" download class="resume-btn" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: rgba(124, 108, 240, 0.15); border: 1px solid var(--monitor); color: var(--text); border-radius: 8px; text-decoration: none; font-weight: 500;">Download Resume</a>`;
  }

  const footerHtml = `
    <footer style="padding-bottom: 60px;">
      <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--lamp); margin-bottom: 16px;">Contact</h3>
      <div style="display: flex; gap: 24px; margin-bottom: 16px; flex-wrap: wrap;">
        ${contactLinks.join('')}
      </div>
      ${resumeBtn}
    </footer>
  `;

  container.innerHTML = headerHtml + skillsHtml + projectsSection + footerHtml;
  root.appendChild(container);

  // Synchronize state
  function sync(state) {
    const isQuick = state.mode === 'quick';
    root.hidden = !isQuick;
    
    qvBtn.textContent = isQuick ? 'Back to 3D' : 'Quick View';
    qvBtn.setAttribute('aria-label', isQuick ? 'Return to 3D Scene' : 'Skip 3D and show Quick View');

    // If WebGL is unavailable and we're stuck in quick mode, hide the 3D button
    if (state.noWebGL) {
      qvBtn.style.display = 'none';
      const devToggle = document.getElementById('mode-toggle');
      if (devToggle) devToggle.style.display = 'none';
    }
  }

  sync(getState());
  const unsubscribe = subscribe(sync);

  return () => {
    unsubscribe();
    qvBtn.remove();
    root.innerHTML = '';
  };
}

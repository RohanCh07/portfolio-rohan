/**
 * backButton.js — Back-to-overview button (Phase 3).
 * Visible whenever activeSection isn't "overview". Esc does the same.
 * Styled with theme tokens; appended into #ui.
 */

import { colors, fonts, motion } from '../theme.js';
import { getState, subscribe } from '../store.js';
import { goToOverview } from '../scene/cameraRig.js';

/**
 * Mount the back button and bind Escape. Returns a cleanup function
 * (used if the UI ever needs re-mounting).
 */
export function mountBackButton() {
  const root = document.getElementById('ui');
  if (!root) return () => {};

  const btn = document.createElement('button');
  btn.id = 'back';
  btn.type = 'button';
  btn.textContent = '← Back';
  btn.style.cssText = [
    'position:fixed',
    'top:16px',
    'left:16px',
    `background:${colors.bg}`,
    `color:${colors.text}`,
    `border:1px solid ${colors.muted}`,
    `font-family:${fonts.body}`,
    'font-size:14px',
    'padding:8px 16px',
    'border-radius:6px',
    'cursor:pointer',
    `transition:opacity ${motion.durationFast}s ease`,
  ].join(';');
  root.appendChild(btn);

  function sync(state) {
    const visible = state.activeSection !== 'overview';
    btn.style.display = visible ? 'block' : 'none';
    btn.setAttribute('aria-hidden', String(!visible));
    btn.tabIndex = visible ? 0 : -1;
  }
  sync(getState());
  const unsubscribe = subscribe(sync);

  const onKey = (e) => { if (e.key === 'Escape') goToOverview(); };
  window.addEventListener('keydown', onKey);
  btn.addEventListener('click', () => goToOverview());

  return () => {
    unsubscribe();
    window.removeEventListener('keydown', onKey);
    btn.remove();
  };
}
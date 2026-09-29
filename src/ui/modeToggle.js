/**
 * modeToggle.js — Persistent mode switcher button (Phase 5).
 *
 * Sits in the top-right corner across both 3D and Dev modes:
 * - In "3d" mode: shows "</>" Dev Mode toggle button
 * - In "dev" mode: shows "⬡" 3D Scene toggle button
 *
 * Calls store.setMode() to switch views instantly.
 */

import { getState, subscribe, setMode } from '../store.js';

/**
 * Perform a brief fade transition from Dev Mode back to 3D Scene.
 */
export function exitDevMode() {
  if (getState().mode !== 'dev') return;
  
  const fade = document.createElement('div');
  fade.style.position = 'fixed';
  fade.style.inset = '0';
  fade.style.backgroundColor = 'var(--bg)';
  fade.style.opacity = '1';
  fade.style.zIndex = '9999';
  fade.style.pointerEvents = 'none';
  fade.style.transition = 'opacity 0.3s ease';
  document.body.appendChild(fade);

  // Force reflow so transition works
  void fade.offsetWidth;

  setMode('3d');

  requestAnimationFrame(() => {
    fade.style.opacity = '0';
    setTimeout(() => fade.remove(), 300);
  });
}


/**
 * Mount the mode toggle button into document.body.
 * Returns a cleanup function.
 */
export function mountModeToggle() {
  const existing = document.getElementById('mode-toggle');
  if (existing) existing.remove();

  const btn = document.createElement('button');
  btn.id = 'mode-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-live', 'polite');
  document.body.appendChild(btn);

  function sync(state) {
    const isDev = state.mode === 'dev';
    btn.className = isDev ? 'mode-toggle dev-active' : 'mode-toggle';
    btn.setAttribute('aria-label', isDev ? 'Switch to 3D Scene' : 'Switch to Dev Mode (IDE)');
    btn.title = isDev ? 'Switch to 3D Scene' : 'Switch to Dev Mode (IDE)';
    btn.innerHTML = isDev
      ? '<span class="mode-toggle-icon">⬡</span><span class="mode-toggle-label">3D Scene</span>'
      : '<span class="mode-toggle-icon">&lt;/&gt;</span><span class="mode-toggle-label">Dev Mode</span>';
  }

  btn.addEventListener('click', () => {
    const currentMode = getState().mode;
    if (currentMode === 'dev') {
      exitDevMode();
    } else {
      setMode('dev');
    }
  });

  sync(getState());
  const unsubscribe = subscribe(sync);

  return () => {
    unsubscribe();
    btn.remove();
  };
}

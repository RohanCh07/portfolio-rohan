/**
 * loader.js — Loading screen with a progress bar.
 *
 * Progress is real: it comes from the shared THREE.LoadingManager in
 * scene/props.js (one item per .glb), not from a fake timer. The screen only
 * hides when the caller says the scene is settled (`whenReady()`), because the
 * Draco decoder binaries are fetched outside the manager's item count — so
 * manager.onLoad alone can fire slightly early.
 *
 * No intro/animation polish here; that belongs to the Phase 8 polish pass.
 */

import { loadingManager } from '../scene/props.js';

const LABELS = {
  start:    'Setting the desk…',
  loading:  'Loading props…',
  done:     'Ready',
};

/**
 * Mount the loading screen and bind it to the real LoadingManager.
 * @param {object} [options]
 * @param {boolean} [options.enabled=false] — mount only if there is something to load
 * @returns {{ dismiss: () => void }}
 */
export function mountLoader(options = {}) {
  const { enabled = false } = options;

  if (!enabled) {
    return { dismiss() {} };
  }

  const root = document.createElement('div');
  root.className = 'loader';
  root.setAttribute('role', 'progressbar');
  root.setAttribute('aria-valuemin', '0');
  root.setAttribute('aria-valuemax', '100');
  root.setAttribute('aria-valuenow', '0');
  root.innerHTML = `
    <div class="loader__panel">
      <p class="loader__label"></p>
      <div class="loader__track"><div class="loader__fill"></div></div>
      <p class="loader__pct">0%</p>
    </div>
  `;
  document.body.appendChild(root);

  const labelEl = root.querySelector('.loader__label');
  const fillEl  = root.querySelector('.loader__fill');
  const pctEl   = root.querySelector('.loader__pct');

  let dismissed = false;

  function setProgress(ratio) {
    const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    fillEl.style.width = `${pct}%`;
    pctEl.textContent = `${pct}%`;
    root.setAttribute('aria-valuenow', String(pct));
  }

  function setLabel(text) {
    if (labelEl.textContent !== text) labelEl.textContent = text;
  }

  function onStart() {
    setLabel(LABELS.loading);
    setProgress(0.05);
  }

  function onProgress(_url, loaded, total) {
    setLabel(LABELS.loading);
    setProgress(total > 0 ? loaded / total : 0.9);
  }

  function onLoad() {
    setLabel(LABELS.done);
    setProgress(1);
  }

  function onError(url) {
    // A 404 removes an item from the total without ever completing it, so
    // onLoad may never fire. Log it and let the caller dismiss.
    console.warn(`[loader] failed to load ${url}`);
    setProgress(1);
  }

  loadingManager.onStart = onStart;
  loadingManager.onProgress = onProgress;
  loadingManager.onLoad = onLoad;
  loadingManager.onError = onError;

  setLabel(LABELS.start);

  return {
    dismiss() {
      if (dismissed) return;
      dismissed = true;

      loadingManager.onStart = undefined;
      loadingManager.onProgress = undefined;
      loadingManager.onLoad = undefined;
      loadingManager.onError = undefined;

      setLabel(LABELS.done);
      setProgress(1);

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      root.classList.add('is-done');
      window.setTimeout(() => root.remove(), reduceMotion ? 0 : 420);
    },
  };
}

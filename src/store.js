/**
 * store.js — Tiny pub/sub state store (no dependencies).
 *
 * API:
 *   getState()          → returns current state object
 *   setState(patch)     → shallow-merges patch into state, notifies subscribers
 *   subscribe(fn)       → fn(state) called on every change; returns unsubscribe
 */

/** @type {Set<(state: object) => void>} */
const listeners = new Set();

const state = {
  activeSection: 'overview',   // which camera stop / overlay is active
  mode:          '3d',         // '3d' | 'dev' | 'quick'
  lampOn:        true,         // desk lamp toggle (delight feature)
};

/** Return a shallow copy so consumers can't mutate directly. */
export function getState() {
  return { ...state };
}

/** Shallow-merge patch into state and notify all subscribers. */
export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(getState()));
}

/**
 * Subscribe to state changes.
 * @param {(state: object) => void} fn
 * @returns {() => void} unsubscribe function
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

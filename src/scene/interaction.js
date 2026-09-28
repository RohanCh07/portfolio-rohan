/**
 * interaction.js — Raycaster: hover + click on scene hotspots (Phase 3).
 * Active hotspots: monitor, shelf, board. phone/resume are skipped until
 * their objects exist (props.js is still an empty stub).
 *
 * `gsap` is a global provided by index.html (not in the import map).
 */

import * as THREE from 'three';
import { flyTo, isFlying } from './cameraRig.js';

const HOTSPOTS = ['monitor', 'shelf', 'board'];
const HOVER_SCALE = 1.04;   // group gizmo grows this much on hover
const HOVER_GLOW  = 1.6;    // emissive-intensity multiplier on the monitor screen

/* Module-scope so re-calling setupInteraction can reuse/remove the same handlers. */
let camera     = null;
let container  = null;
let raycaster  = null;
let hoveredKey = null;
const pointer  = new THREE.Vector2();
const groups   = {};        // hotspot key → object to pulse
const pickTargets = [];     // objects handed to the raycaster

/**
 * Attach hover + click raycaster picking to `container`.
 * Safe to call again: removes any previously attached listeners first.
 * @param {THREE.PerspectiveCamera} cam
 * @param {THREE.Scene} scn
 * @param {HTMLElement} el — canvas parent, receives the pointer events
 */
export function setupInteraction(cam, scn, el) {
  if (container) {
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerleave', clearHover);
    container.removeEventListener('click', onClick);
  }

  camera    = cam;
  container = el;
  raycaster = new THREE.Raycaster();

  // Collect the object that answers each hotspot key, remembering its resting state.
  for (const key of HOTSPOTS) {
    const obj = findNamed(scn, key);
    groups[key] = obj || null;
    if (!obj) continue;
    pickTargets.push(obj);
    obj.userData.baseScale   = obj.scale.clone();
    if (obj.material?.emissive) obj.userData.baseEmissive = obj.material.emissiveIntensity;
  }

  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerleave', clearHover);
  container.addEventListener('click', onClick);
}

/* ── pointer helpers ── */

function updatePointer(e) {
  const rect = container.getBoundingClientRect();
  pointer.x =  ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerMove(e) {
  updatePointer(e);
  setHover(hitKey());
}

function onClick(e) {
  if (isFlying()) return;    // never queue tweens mid-flight
  updatePointer(e);
  const key = hitKey();
  if (key) flyTo(key);
}

function clearHover() {
  setHover(null);
}

function hitKey() {
  if (!raycaster || pickTargets.length === 0) return null;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickTargets, true);
  if (!hits.length) return null;
  return hotspotKeyOf(hits[0].object);
}

/** Walk hit object up to the nearest ancestor whose name is a hotspot key. */
function hotspotKeyOf(obj) {
  let node = obj;
  while (node) {
    if (HOTSPOTS.includes(node.name)) return node.name;
    node = node.parent;
  }
  return null;
}

function setHover(key) {
  if (key === hoveredKey) return;
  if (hoveredKey) applyHover(hoveredKey, false);
  hoveredKey = key;
  if (container) container.style.cursor = key ? 'pointer' : '';
  if (key) applyHover(key, true);
}

/** Small scale or emissive-intensity pulse on the hovered hotspot. */
function applyHover(key, on) {
  const obj = groups[key];
  if (!obj) return;

  if (key === 'monitor' && obj.material?.emissive) {
    const base = obj.userData.baseEmissive ?? obj.material.emissiveIntensity;
    gsap.to(obj.material, {
      emissiveIntensity: on ? base * HOVER_GLOW : base,
      duration: 0.2,
    });
  } else {
    const base = obj.userData.baseScale || obj.scale.clone();
    const k = on ? HOVER_SCALE : 1;
    gsap.to(obj.scale, {
      x: base.x * k, y: base.y * k, z: base.z * k,
      duration: 0.2,
    });
  }
}

/** First object under `root` with `name`. */
function findNamed(root, name) {
  let found = null;
  root.traverse((o) => {
    if (!found && o.name === name) found = o;
  });
  return found;
}
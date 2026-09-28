/**
 * cameraRig.js — Camera stops + GSAP fly-to (Phase 3).
 *
 * `gsap` is a global provided by the <script> tag in index.html
 * (not part of the import map), so we reference it directly.
 */

import * as THREE from 'three';
import { motion } from '../theme.js';
import { getState, setState } from '../store.js';

/* ──────────────────────────────────────────────
   CAMERA STOPS — one entry per navigation stop.
   pos/lookAt are the camera's destination position + aim target.
   group names the scene object the stop opens (raycaster hotspot key).
   ────────────────────────────────────────────── */
export const CAMERA_STOPS = {
  overview: {
    pos:    { x: 0,    y: 2.6, z: 5.5 },
    lookAt: { x: 0,    y: 1.2, z: -1.5 },
    group:  null,              // whole scene
  },
  monitor: {
    pos:    { x: 0,    y: 1.55, z: -0.9 },
    lookAt: { x: 0,    y: 1.35, z: -1.75 },
    group:  'monitor',
  },
  shelf: {
    pos:    { x: -2.4, y: 2.0,  z: -3.6 },
    lookAt: { x: -2.5, y: 1.8,  z: -4.9 },
    group:  'shelf',
  },
  board: {
    pos:    { x: 1.9,  y: 2.4,  z: -3.5 },
    lookAt: { x: 1.8,  y: 2.2,  z: -4.9 },
    group:  'board',
  },
  // PHONE/RESUME are PLACEHOLDER stops - props.js is still an empty stub,
  // so these objects don't exist in the scene yet. The config is stable now;
  // interaction.js skips them until the objects land (Phase 7).
  phone: {
    pos:    { x: 0.95, y: 1.35, z: -0.7 },
    lookAt: { x: 0.85, y: 1.08, z: -1.15 },  // right side of the desk top
    group:  'phone',
  },
  resume: {
    pos:    { x: 0,    y: 1.5,  z: -0.35 },
    lookAt: { x: 0,    y: 1.08, z: -0.85 },  // front-center of the desk top
    group:  'resume',
  },
};

/* ── Internal refs (set by initCameraRig) ── */
let camera     = null;
let container  = null;
let isTweening = false;

/* Look target the fly-to tween animates; the render loop reads it every frame. */
const lookTarget = new THREE.Vector3(
  CAMERA_STOPS.overview.lookAt.x,
  CAMERA_STOPS.overview.lookAt.y,
  CAMERA_STOPS.overview.lookAt.z,
);

/**
 * Give the rig its camera and pointers container, and snap it to the
 * overview stop (Phase 3 starting position).
 * @param {THREE.PerspectiveCamera} cam
 * @param {HTMLElement|null} el — canvas parent, disabled mid-tween
 */
export function initCameraRig(cam, el) {
  camera    = cam;
  container = el || null;
  const ov = CAMERA_STOPS.overview;
  camera.position.set(ov.pos.x, ov.pos.y, ov.pos.z);
  lookTarget.set(ov.lookAt.x, ov.lookAt.y, ov.lookAt.z);
  camera.lookAt(lookTarget);
}

/** True while a fly-to tween is running (render loop skips parallax then). */
export function isFlying() {
  return isTweening;
}

/** Look target the camera should aim at this frame (mutated by the tween). */
export function getLookTarget() {
  return lookTarget;
}

/**
 * Fly the camera to a named stop with an eased GSAP tween.
 * Parallax and clicks are disabled until it finishes so double-clicks
 * can't queue tweens. activeSection is set immediately (back button shows).
 */
export function flyTo(stopName) {
  const stop = CAMERA_STOPS[stopName];
  if (!stop || isTweening || getState().activeSection === stopName) {
    return;
  }

  setState({ activeSection: stopName });
  isTweening = true;
  if (container) container.style.pointerEvents = 'none';

  gsap.timeline({
    onComplete: () => {
      isTweening = false;
      if (container) container.style.pointerEvents = '';
      camera.lookAt(lookTarget);
    },
  })
    .to(camera.position, {
      x: stop.pos.x, y: stop.pos.y, z: stop.pos.z,
      duration: motion.durationNormal,      // 1.0 s → inside the 0.9–1.2 s rule
      ease: motion.ease,                    // 'power2.inOut'
    }, 0)
    .to(lookTarget, {
      x: stop.lookAt.x, y: stop.lookAt.y, z: stop.lookAt.z,
      duration: motion.durationNormal,
      ease: motion.ease,
    }, 0);
}

/** Convenience: fly straight back to the overview stop. */
export function goToOverview() {
  flyTo('overview');
}
/**
 * cameraRig.js — Camera stops + GSAP fly-to (Phase 3).
 *
 * `gsap` is a global provided by the <script> tag in index.html
 * (not part of the import map), so we reference it directly.
 */

import * as THREE from 'three';
import { motion } from '../theme.js';
import { getState, setState, setMode } from '../store.js';

/* ──────────────────────────────────────────────
   CAMERA STOPS — one entry per navigation stop.
   pos/lookAt are the camera's destination position + aim target.
   group names the scene object the stop opens (raycaster hotspot key).
   ────────────────────────────────────────────── */
export const CAMERA_STOPS = {
  overview: {
    pos:    { x: 0,    y: 2.4, z: 4.8 },   // full room overview
    lookAt: { x: 0,    y: 1.25, z: -1.5 },
    group:  null,              // whole scene
  },
  monitor: {
    pos:    { x: 0.45, y: 1.7,  z: 0.9 },   // pulled back: frames monitor on left + desk & warm lamp on right
    lookAt: { x: 0.0,  y: 1.5,  z: -1.77 }, // centered on monitor screen
    group:  'monitor',
  },
  shelf: {
    pos:    { x: -1.3, y: 2.2,  z: -1.8 },  // pulled back: shelf on left half + wall/floor context
    lookAt: { x: -2.4, y: 2.15, z: -4.9 },  // centered on bookshelf
    group:  'shelf',
  },
  board: {
    pos:    { x: 2.5,  y: 2.3,  z: -1.7 },  // pulled back: board on left half + foreground lamp & desk
    lookAt: { x: 1.75, y: 2.2,  z: -4.9 },  // centered on framed board
    group:  'board',
  },
  // PHONE/RESUME are PLACEHOLDER stops - props.js is still an empty stub,
  // so these objects don't exist in the scene yet. The config is stable now;
  // interaction.js skips them until the objects land (Phase 7).
  phone: {
    pos:    { x: 1.2,  y: 1.65, z: 0.2 },   // desk right side + lamp base context
    lookAt: { x: 0.85, y: 1.1,  z: -1.3 },
    group:  'phone',
  },
  resume: {
    pos:    { x: 0.25, y: 1.75, z: 0.4 },   // desk center front workspace
    lookAt: { x: 0.0,  y: 1.08, z: -1.3 },
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

  if (stopName !== 'monitor') {
    setState({ activeSection: stopName });
  }
  
  isTweening = true;
  if (container) container.style.pointerEvents = 'none';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reduceMotion ? 0 : motion.durationNormal;

  gsap.timeline({
    onComplete: () => {
      isTweening = false;
      if (container) container.style.pointerEvents = '';
      camera.lookAt(lookTarget);
      
      if (stopName === 'monitor') {
        transitionToDevMode();
      }
    },
  })
    .to(camera.position, {
      x: stop.pos.x, y: stop.pos.y, z: stop.pos.z,
      duration: duration,      // jumps if reduced motion
      ease: motion.ease,
    }, 0)
    .to(lookTarget, {
      x: stop.lookAt.x, y: stop.lookAt.y, z: stop.lookAt.z,
      duration: duration,
      ease: motion.ease,
    }, 0);
}

function transitionToDevMode() {
  isTweening = true;
  if (container) container.style.pointerEvents = 'none';
  
  const fade = document.createElement('div');
  fade.style.position = 'fixed';
  fade.style.inset = '0';
  fade.style.backgroundColor = 'var(--bg)';
  fade.style.opacity = '0';
  fade.style.zIndex = '9999';
  fade.style.pointerEvents = 'none';
  document.body.appendChild(fade);

  // Zoom in a bit toward the lookTarget
  const forward = new THREE.Vector3().subVectors(lookTarget, camera.position).normalize().multiplyScalar(0.4);
  const zoomPos = camera.position.clone().add(forward);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reduceMotion ? 0 : 0.4;

  gsap.timeline({
    onComplete: () => {
      setMode('dev');
      
      // Reset 3D camera silently to overview
      const ov = CAMERA_STOPS.overview;
      camera.position.set(ov.pos.x, ov.pos.y, ov.pos.z);
      lookTarget.set(ov.lookAt.x, ov.lookAt.y, ov.lookAt.z);
      camera.lookAt(lookTarget);
      setState({ activeSection: 'overview' });
      
      isTweening = false;
      if (container) container.style.pointerEvents = '';

      // Fade out the overlay
      gsap.to(fade, {
        opacity: 0,
        duration: reduceMotion ? 0 : 0.3,
        onComplete: () => fade.remove()
      });
    }
  })
  .to(camera.position, {
    x: zoomPos.x, y: zoomPos.y, z: zoomPos.z,
    duration: duration,
    ease: 'power2.in'
  }, 0)
  .to(fade, {
    opacity: 1,
    duration: duration,
    ease: 'power2.in'
  }, 0);
}

/** Convenience: fly straight back to the overview stop. */
export function goToOverview() {
  flyTo('overview');
}
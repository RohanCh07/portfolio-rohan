/**
 * experience.js — Renderer, scene, lights, camera, render loop.
 * All object positions are in LAYOUT below for easy tweaking.
 */

import * as THREE from 'three';
import { colors } from '../theme.js';
import { getState } from '../store.js';

import { createRoom }         from './room.js';
import { createDesk }         from './desk.js';
import { createMonitor }      from './monitor.js';
import { createLamp }         from './lamp.js';
import { createBookshelf }    from './bookshelf.js';
import { createProjectBoard } from './projectBoard.js';
import { loadAllProps }       from './props.js';
import * as camRig from './cameraRig.js';

/* ──────────────────────────────────────────────
   LAYOUT CONFIG — tweak positions / rotations here
   ────────────────────────────────────────────── */
const LAYOUT = {
  desk:    { pos: [0, 0, -1.5],    rot: [0, 0, 0] },
  monitor: { pos: [0, 1.05, -1.8], rot: [0, 0, 0] },       // sits on desk
  lamp:    { pos: [1.2, 1.05, -1.4], rot: [0, -0.3, 0] },   // right side of desk
  shelf:   { pos: [-2.5, 1.8, -4.9], rot: [0, 0, 0] },      // left wall area
  board:   { pos: [1.8, 2.2, -4.9],  rot: [0, 0, 0] },      // right wall area
};

/* ── Mouse parallax settings (overview only) ── */
const PARALLAX_RANGE  = 0.15;  // max camera offset in units
const PARALLAX_FACTOR = 0.05;  // lerp speed (0–1, lower = smoother)

/* ──────────────────────────────────────────────
   Exports
   ────────────────────────────────────────────── */
export let renderer, scene, camera;

/* ── Internal state ── */
const mouse   = { x: 0, y: 0 };   // normalised mouse (−1 to 1)
const camBase = new THREE.Vector3(); // overview base position (no parallax)

/* Phase 7: GLB props. Resolves when every prop has settled (loaded or
   fell back to a primitive), so the UI loading screen can dismiss itself. */
let ready = Promise.resolve();

/** Resolves once the scene is fully populated (props included). */
export function whenReady() {
  return ready;
}

/**
 * Initialise the 3D experience.
 * @param {HTMLElement} container — typically #canvas-container
 * @param {object} options — config (e.g. { tier: 'low' | 'mid' | 'high' })
 */
export function init(container, options = {}) {
  const { tier = 'high' } = options;

  // ─── Renderer ───
  renderer = new THREE.WebGLRenderer({ antialias: true });
  
  // Phase 6: Cap pixel ratio based on device tier
  const maxPixelRatio = tier === 'high' ? 2 : (tier === 'mid' ? 1.5 : 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;   // lift mid-tones ACES otherwise crushes
  
  // Phase 6: disable shadows for low tier
  renderer.shadowMap.enabled = tier !== 'low';
  if (renderer.shadowMap.enabled) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  
  container.appendChild(renderer.domElement);

  // ─── Scene ───
  scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.bg);

  // ─── Camera ───
  camera = new THREE.PerspectiveCamera(
    38,                            // narrower than 42 → objects fill more of the frame
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  camRig.initCameraRig(camera, container); // start at the overview stop
  camBase.copy(camera.position);

  // ─── Lighting ───

  // Low ambient so unlit surfaces are dark charcoal, never pure black
  const ambient = new THREE.AmbientLight(0xffffff, 0.18);
  scene.add(ambient);

  // Cool violet fill (simulates monitor bounce light) — wide reach,
  // so shelf/board geometry reads even where nothing is emissive
  const violetFill = new THREE.DirectionalLight(colors.monitor, 0.7);
  violetFill.position.set(-3, 2.5, 1.5);   // rakes the shelf + board fronts
  scene.add(violetFill);

  // Subtle warm hemisphere for sky/ground tint
  const hemi = new THREE.HemisphereLight(0x1a1726, 0x0a0810, 0.25);
  scene.add(hemi);

  // ─── Scene objects ───
  addToScene(createRoom(),         { pos: [0, 0, 0] });
  addToScene(createDesk(),         LAYOUT.desk);
  addToScene(createMonitor(),      LAYOUT.monitor);
  addToScene(createLamp(),         LAYOUT.lamp);
  addToScene(createBookshelf(),    LAYOUT.shelf);
  addToScene(createProjectBoard(), LAYOUT.board);

  // NOTE (Phase 6): heavy effects from later phases (bloom, particles)
  // are not yet implemented. When added, guard them with: `if (tier !== 'low') { ... }`

  // ─── GLB props (Phase 7) ───
  // Fire-and-forget: the render loop never waits on these. Low tier skips
  // props entirely; on mid/high each prop that fails to load is replaced by
  // its primitive stand-in, so the room keeps the same layout either way.
  ready = loadAllProps(scene, { tier }).then((report) => {
    const loaded = report.filter((r) => r.ok).map((r) => r.name);
    const fellBack = report.filter((r) => !r.ok && !r.skipped).map((r) => r.name);
    if (tier === 'low') return report;
    console.info(
      `[props] GLB loaded: ${loaded.join(', ') || 'none'}` +
      ` · primitive fallback: ${fellBack.join(', ') || 'none'}`,
    );
    return report;
  });

  // ─── Mouse tracking for parallax ───
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth)  * 2 - 1; // −1 … 1
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // ─── Resize ───
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // ─── Render loop ───
  function tick() {
    // Mouse parallax on the overview only, and never mid-tween.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && getState().activeSection === 'overview' && !camRig.isFlying()) {
      camera.position.x += (camBase.x + mouse.x * PARALLAX_RANGE - camera.position.x) * PARALLAX_FACTOR;
      camera.position.y += (camBase.y - mouse.y * PARALLAX_RANGE * 0.5 - camera.position.y) * PARALLAX_FACTOR;
    }

    // The fly-to tween mutates this vector each frame; follow it.
    camera.lookAt(camRig.getLookTarget());

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}

/* ── Helper: place a group using a LAYOUT entry ── */
function addToScene(group, cfg) {
  if (cfg.pos) group.position.set(...cfg.pos);
  if (cfg.rot) group.rotation.set(...cfg.rot);
  scene.add(group);
}

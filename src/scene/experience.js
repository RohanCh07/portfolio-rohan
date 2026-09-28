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

/**
 * Initialise the 3D experience.
 * @param {HTMLElement} container — typically #canvas-container
 */
export function init(container) {

  // ─── Renderer ───
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // ─── Scene ───
  scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.bg);

  // ─── Camera ───
  camera = new THREE.PerspectiveCamera(
    42,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  camRig.initCameraRig(camera, container); // start at the overview stop
  camBase.copy(camera.position);

  // ─── Lighting ───

  // Very low ambient so nothing is pitch black
  const ambient = new THREE.AmbientLight(0xffffff, 0.08);
  scene.add(ambient);

  // Cool violet fill (simulates monitor bounce light)
  const violetFill = new THREE.DirectionalLight(colors.monitor, 0.25);
  violetFill.position.set(-2, 3, 2);
  scene.add(violetFill);

  // Subtle warm hemisphere for sky/ground tint
  const hemi = new THREE.HemisphereLight(0x1a1726, 0x0a0810, 0.15);
  scene.add(hemi);

  // ─── Scene objects ───
  addToScene(createRoom(),         { pos: [0, 0, 0] });
  addToScene(createDesk(),         LAYOUT.desk);
  addToScene(createMonitor(),      LAYOUT.monitor);
  addToScene(createLamp(),         LAYOUT.lamp);
  addToScene(createBookshelf(),    LAYOUT.shelf);
  addToScene(createProjectBoard(), LAYOUT.board);

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
    if (getState().activeSection === 'overview' && !camRig.isFlying()) {
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

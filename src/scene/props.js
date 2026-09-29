/**
 * props.js — Real GLB props for the desk: plant, mug, headphones, books,
 * phone, notebook. (Phase 7)
 *
 * One shared GLTFLoader (with DRACOLoader) feeds a single THREE.LoadingManager,
 * which src/ui/loader.js reads for a *real* progress bar — no fake timer.
 *
 * Two rules keep this safe:
 *   1. Nothing here is awaited during boot. A missing or broken .glb falls back
 *      to a primitive stand-in in the same slot, so the room never looks broken.
 *   2. Low device tier skips model bytes entirely (README §9 — slow phones).
 *
 * Paths point at the *optimised* files in /public/models (never /raw).
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { colors } from '../theme.js';

/* ──────────────────────────────────────────────
   PROPS CONFIG — add/remove props here only.
   path     : optimised .glb URL in /public/models
   position : world coords (desk surface is y = 1.05, shelf top plank y = 2.53)
   rotation : euler XYZ in radians
   scale    : number or [x, y, z]. CC0 sources are modelled at wildly
              different sizes, so expect to tune this once per source.
   name     : primitive fallback key + console/logging label. 'phone' and
              'resume' match the CAMERA_STOPS hotspot names.
   ────────────────────────────────────────────── */
export const PROPS = [
  { name: 'plant',      path: '/models/plant.glb',      position: [-1.30, 1.05, -1.80], rotation: [0, 0.4, 0],    scale: 0.40 },
  { name: 'headphones', path: '/models/headphones.glb', position: [-1.05, 1.07, -1.15], rotation: [0, 0.9, 0],    scale: 0.30 },
  { name: 'books',      path: '/models/books.glb',      position: [-2.75, 2.53, -4.90], rotation: [0, 0.1, 0],    scale: 0.25 },
  { name: 'mug',        path: '/models/mug.glb',        position: [ 0.62, 1.05, -1.20], rotation: [0, -0.6, 0],   scale: 0.10 },
  { name: 'phone',      path: '/models/phone.glb',      position: [ 0.98, 1.06, -1.50], rotation: [0, 0.35, 0],   scale: 1.00 },
  { name: 'resume',     path: '/models/notebook.glb',   position: [ 0.02, 1.05, -1.28], rotation: [0, -0.25, 0],  scale: 0.25 },
];

/* ── Loader setup (module scope: one instance, one manager) ── */

/* Draco decoder binaries come from Google's CDN, matching the three r160
   examples build. The path is configurable if you self-host them. */
const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

/** Shared manager — src/ui/loader.js subscribes to its onProgress. */
export const loadingManager = new THREE.LoadingManager();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
dracoLoader.setDecoderConfig({ type: 'js' });  // 'js' build works where wasm is blocked (strict CSP, old iOS)

const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

/* ──────────────────────────────────────────────
   Material tinting — only where a colour clearly clashes.
   In a dark room with a three-colour palette, the thing that fights the scene
   is a *bright, heavily saturated* material (neon green, pure red, hot pink).
   So the gate is saturation + lightness only, and the nudge always goes to the
   nearest theme token. No hue-distance rejection is needed: when a colour is
   already an accent, the nearest accent is itself and the lerp is a no-op.
   Textured materials are skipped outright so we never wash out an image.
   ────────────────────────────────────────────── */
const TINT_MIN_SATURATION = 0.45;
const TINT_MIN_LIGHTNESS  = 0.45;
const TINT_STRENGTH       = 0.45;  // how far to pull toward the nearest token

const PALETTE = [
  new THREE.Color(colors.bg),
  new THREE.Color(colors.lamp),
  new THREE.Color(colors.monitor),
  new THREE.Color(colors.text),
  new THREE.Color(colors.muted),
];

/* Hues precomputed once (0 when a colour is achromatic). */
const hsl = { h: 0, s: 0, l: 0 };
const PALETTE_HUES = PALETTE.map((c) => c.getHSL(hsl).h);

/** Shortest distance between two hues on the 0–1 wheel. */
function hueDistance(a, b) {
  const d = Math.abs(a - b);
  return d > 0.5 ? 1 - d : d;
}

/** Index of the closest theme token to `hue`. */
function nearestPaletteHue(hue) {
  let best = { index: 0, dist: Infinity };
  PALETTE_HUES.forEach((h, index) => {
    const dist = hueDistance(hue, h);
    if (dist < best.dist) best = { index, dist };
  });
  return best;
}

/** Nudge clashing base colours toward the nearest theme token. */
function tintMaterials(group) {
  group.traverse((obj) => {
    if (!obj.isMesh) return;

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (!mat || !mat.color || mat.map) continue;   // no tint on textured materials

      mat.color.getHSL(hsl);
      if (hsl.s < TINT_MIN_SATURATION || hsl.l < TINT_MIN_LIGHTNESS) continue;

      mat.color.lerp(PALETTE[nearestPaletteHue(hsl.h).index], TINT_STRENGTH);
    }
  });
}

/* ──────────────────────────────────────────────
   Public API
   ────────────────────────────────────────────── */

/**
 * Load one GLB and return it as a positioned THREE.Group.
 * Per-file progress is handled by the shared manager, not per-call.
 *
 * @param {string} path — URL of the .glb
 * @param {object} [options]
 * @param {[number,number,number]} [options.position]
 * @param {[number,number,number]} [options.rotation] — euler XYZ radians
 * @param {number|[number,number,number]} [options.scale]
 * @param {string} [options.name] — group name (matches CAMERA_STOPS hotspots)
 * @returns {Promise<THREE.Group>}
 */
export function loadProp(path, options = {}) {
  const {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale    = 1,
    name     = 'prop',
  } = options;

  return new Promise((resolve, reject) => {
    gltfLoader.load(
      path,
      (gltf) => {
        const group = gltf.scene;
        group.name = name;

        if (Array.isArray(scale)) group.scale.set(...scale);
        else group.scale.setScalar(scale);

        group.position.set(...position);
        group.rotation.set(...rotation);

        group.traverse((obj) => {
          if (!obj.isMesh) return;
          obj.castShadow = true;
          obj.receiveShadow = true;
        });

        tintMaterials(group);
        resolve(group);
      },
      undefined,  // progress: reported through the shared LoadingManager
      (err) => reject(new Error(`props: "${name}" failed to load from ${path}`, { cause: err })),
    );
  });
}

/** Resolves with the per-prop report once every load has settled. */
let settled = Promise.resolve([]);

/**
 * Load every prop in PROPS and add it to `scene`.
 *
 * Never rejects: each prop resolves to a report entry and, on failure, a
 * primitive stand-in is added in its place.
 *
 * Low tier returns immediately with everything marked `skipped`, so the scene
 * stays fully primitive (chosen over a reduced set: partial props read as
 * half-finished, and low tier has no shadows for them to catch anyway).
 *
 * @param {THREE.Scene} scene
 * @param {object} [options]
 * @param {'low'|'mid'|'high'} [options.tier]
 * @returns {Promise<Array<{name:string, ok:boolean, source:string, object?:THREE.Object3D, error?:Error, skipped?:boolean}>>}
 */
export function loadAllProps(scene, options = {}) {
  const { tier = 'high' } = options;

  if (tier === 'low') {
    settled = Promise.resolve(
      PROPS.map((p) => ({ name: p.name, ok: false, skipped: true, source: 'none' })),
    );
    return settled;
  }

  settled = Promise.all(PROPS.map((cfg) => loadOneProp(cfg, scene)));
  return settled;
}

/** Promise for the in-flight (or already finished) loadAllProps run. */
export function whenAssetsSettled() {
  return settled;
}

/* ── internals ── */

/** One prop, with its primitive fallback wired in on failure. */
function loadOneProp(cfg, scene) {
  return loadProp(cfg.path, cfg)
    .then((group) => {
      scene.add(group);
      return { name: cfg.name, ok: true, source: 'glb', object: group };
    })
    .catch((error) => {
      const fallback = createFallbackProp(cfg.name);
      // Transforms but not scale: the stand-ins are authored at real size.
      fallback.position.set(...cfg.position);
      fallback.rotation.set(...cfg.rotation);
      scene.add(fallback);
      return { name: cfg.name, ok: false, source: 'primitive', object: fallback, error };
    });
}

/**
 * Primitive stand-ins, used when a .glb is missing or fails to parse.
 * Deliberately crude (README rule #1) but the right silhouette and palette,
 * so one failed download never leaves a hole in the scene.
 */
function createFallbackProp(name) {
  const group = new THREE.Group();
  group.name = `${name}Fallback`;

  const body   = fallbackMaterial(shade(colors.bg, colors.muted, 0.35));
  const warm   = fallbackMaterial(colors.lamp, 0.55, 0.2);
  const violet = fallbackMaterial(colors.monitor, 0.6, 0.1);
  const paper  = fallbackMaterial(colors.text, 0.9, 0.0);

  const add = (geo, mat, x, y, z, rot = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  switch (name) {
    case 'plant':
      add(new THREE.CylinderGeometry(0.07, 0.055, 0.11, 12), warm, 0, 0.055, 0);
      add(new THREE.SphereGeometry(0.09, 10, 8), body, 0, 0.17, 0);
      break;

    case 'headphones':
      add(new THREE.TorusGeometry(0.07, 0.018, 8, 16, Math.PI), body, 0, 0.02, 0);
      add(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 10), violet, -0.07, 0.015, 0, [0, 0, Math.PI / 2]);
      add(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 10), violet,  0.07, 0.015, 0, [0, 0, Math.PI / 2]);
      break;

    case 'books':
      add(new THREE.BoxGeometry(0.26, 0.035, 0.18), warm,   0,    0.018, 0,    [0, 0.10, 0]);
      add(new THREE.BoxGeometry(0.24, 0.030, 0.17), violet, 0.01, 0.050, 0.01, [0, -0.15, 0]);
      break;

    case 'mug':
      add(new THREE.CylinderGeometry(0.037, 0.032, 0.09, 14), body, 0, 0.045, 0);
      add(new THREE.TorusGeometry(0.022, 0.007, 6, 12), body, 0.04, 0.05, 0, [Math.PI / 2, 0, 0]);
      break;

    case 'phone':
      add(new THREE.BoxGeometry(0.068, 0.008, 0.14), body,   0, 0.004, 0);
      add(new THREE.PlaneGeometry(0.062, 0.13),     violet, 0, 0.0085, 0, [-Math.PI / 2, 0, 0]);
      break;

    case 'resume':
    default:
      add(new THREE.BoxGeometry(0.21, 0.012, 0.28), paper, 0,    0.006, 0,    [0, 0.12, 0]);
      add(new THREE.BoxGeometry(0.20, 0.004, 0.27), body,  0.01, 0.014, 0.01, [0, 0.06, 0]);
      break;
  }

  return group;
}

function fallbackMaterial(color, roughness = 0.8, metalness = 0.1) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

/** Blend two theme tokens so stand-ins stay on-palette without new literals. */
function shade(from, to, amount) {
  return new THREE.Color(from).lerp(new THREE.Color(to), amount);
}

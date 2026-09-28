/**
 * monitor.js — Monitor from box primitives.
 * Body, stand/neck, base plate, and an emissive violet screen.
 * The screen mesh is named "monitor" for raycaster picking later.
 */

import * as THREE from 'three';
import { colors } from '../theme.js';

const BODY_COLOR = 0x1e1a2a;  // near-black casing

export function createMonitor() {
  const group = new THREE.Group();
  group.name = 'monitorGroup';

  const casingMat = new THREE.MeshStandardMaterial({
    color: BODY_COLOR,
    roughness: 0.6,
    metalness: 0.3,
  });

  // --- Screen body (housing) ---
  const bodyGeo = new THREE.BoxGeometry(1.4, 0.85, 0.06);
  const body = new THREE.Mesh(bodyGeo, casingMat);
  body.position.set(0, 0.5, 0);
  body.castShadow = true;
  group.add(body);

  // --- Emissive screen face (slightly in front of body) ---
  const screenGeo = new THREE.PlaneGeometry(1.3, 0.76);
  const screenMat = new THREE.MeshStandardMaterial({
    color: colors.monitor,
    emissive: colors.monitor,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.0,
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.5, 0.035);
  screen.name = 'monitor'; // for raycaster / interaction
  group.add(screen);

  // --- Neck ---
  const neckGeo = new THREE.BoxGeometry(0.08, 0.3, 0.08);
  const neck = new THREE.Mesh(neckGeo, casingMat);
  neck.position.set(0, 0.0, 0);
  neck.castShadow = true;
  group.add(neck);

  // --- Base plate ---
  const baseGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.03, 16);
  const base = new THREE.Mesh(baseGeo, casingMat);
  base.position.set(0, -0.15, 0);
  base.castShadow = true;
  group.add(base);

  return group;
}

/**
 * lamp.js — Desk lamp built from primitives.
 * Base disc, angled arm, cone shade, small emissive bulb sphere,
 * and a warm PointLight that reacts to store.lampOn.
 */

import * as THREE from 'three';
import { colors } from '../theme.js';
import { getState, subscribe } from '../store.js';

const ARM_COLOR  = 0x2a2235;
const SHADE_COLOR = 0x3a3040;

export function createLamp() {
  const group = new THREE.Group();
  group.name = 'lamp';

  const metalMat = new THREE.MeshStandardMaterial({
    color: ARM_COLOR,
    roughness: 0.5,
    metalness: 0.4,
  });

  // --- Base disc ---
  const baseGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.04, 16);
  const base = new THREE.Mesh(baseGeo, metalMat);
  base.position.y = 0;
  base.castShadow = true;
  group.add(base);

  // --- Arm (tilted cylinder) ---
  const armGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8);
  const arm = new THREE.Mesh(armGeo, metalMat);
  arm.position.set(0.05, 0.4, 0);
  arm.rotation.z = -0.25; // slight tilt
  arm.castShadow = true;
  group.add(arm);

  // --- Cone shade ---
  const shadeGeo = new THREE.ConeGeometry(0.2, 0.2, 16, 1, true);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: SHADE_COLOR,
    roughness: 0.7,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.position.set(0.15, 0.82, 0);
  shade.rotation.z = Math.PI;  // flip cone so opening faces down
  shade.castShadow = true;
  group.add(shade);

  // --- Bulb (small emissive sphere) ---
  const bulbGeo = new THREE.SphereGeometry(0.05, 12, 12);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: colors.lamp,
    emissive: colors.lamp,
    emissiveIntensity: 2.0,
    roughness: 0.2,
  });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.set(0.15, 0.73, 0);
  group.add(bulb);

  // --- Warm point light (casts soft shadows) ---
  // Bright enough to light the desk top and throw a soft warm pool on
  // the floor below; slower decay gives it a wider reach.
  const light = new THREE.PointLight(colors.lamp, 5.0, 12, 1.2);
  light.position.set(0.15, 0.73, 0);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.radius = 4;       // soft shadow blur
  light.shadow.bias = -0.002;
  group.add(light);

  // --- React to lampOn state ---
  function applyLampState(on) {
    light.visible = on;
    bulbMat.emissiveIntensity = on ? 2.0 : 0;
  }

  // Set initial state
  applyLampState(getState().lampOn);

  // Subscribe to future changes
  subscribe((state) => {
    applyLampState(state.lampOn);
  });

  return group;
}

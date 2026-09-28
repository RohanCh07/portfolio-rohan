/**
 * desk.js — Desk built from box primitives.
 * Flat top slab + four cylinder legs.
 */

import * as THREE from 'three';

const DESK_COLOR = 0x2a2235;  // dark muted purple-brown

export function createDesk() {
  const group = new THREE.Group();
  group.name = 'desk';

  const mat = new THREE.MeshStandardMaterial({
    color: DESK_COLOR,
    roughness: 0.75,
    metalness: 0.1,
  });

  // --- Top slab ---
  const topGeo = new THREE.BoxGeometry(3.2, 0.1, 1.6);
  const top = new THREE.Mesh(topGeo, mat);
  top.position.y = 1.0;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // --- Four legs ---
  const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
  const legPositions = [
    [-1.45, 0.5, -0.65],
    [ 1.45, 0.5, -0.65],
    [-1.45, 0.5,  0.65],
    [ 1.45, 0.5,  0.65],
  ];
  for (const [x, y, z] of legPositions) {
    const leg = new THREE.Mesh(legGeo, mat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    group.add(leg);
  }

  return group;
}

/**
 * projectBoard.js — Framed board on the wall with pinned card planes.
 * The group is named "board" for raycaster picking.
 */

import * as THREE from 'three';
import { colors } from '../theme.js';

const FRAME_COLOR = 0x2a2235;
const BOARD_BG    = 0x201c2e;

export function createProjectBoard() {
  const group = new THREE.Group();
  group.name = 'board';

  const frameMat = new THREE.MeshStandardMaterial({
    color: FRAME_COLOR,
    roughness: 0.7,
    metalness: 0.15,
  });

  // --- Board backing ---
  const backingGeo = new THREE.BoxGeometry(1.6, 1.1, 0.04);
  const backingMat = new THREE.MeshStandardMaterial({
    color: BOARD_BG,
    roughness: 0.9,
    metalness: 0.0,
  });
  const backing = new THREE.Mesh(backingGeo, backingMat);
  backing.receiveShadow = true;
  group.add(backing);

  // --- Frame edges (four thin bars) ---
  const hBar = new THREE.BoxGeometry(1.68, 0.06, 0.06);
  const vBar = new THREE.BoxGeometry(0.06, 1.18, 0.06);

  const top    = new THREE.Mesh(hBar, frameMat); top.position.y =  0.58;
  const bottom = new THREE.Mesh(hBar, frameMat); bottom.position.y = -0.58;
  const left   = new THREE.Mesh(vBar, frameMat); left.position.x  = -0.83;
  const right  = new THREE.Mesh(vBar, frameMat); right.position.x =  0.83;
  [top, bottom, left, right].forEach((m) => { m.castShadow = true; });
  group.add(top, bottom, left, right);

  // --- Pinned cards (small coloured planes) ---
  const cardPositions = [
    { x: -0.5,  y:  0.25, color: colors.lamp },
    { x:  0.1,  y:  0.25, color: colors.monitor },
    { x:  0.5,  y:  0.25, color: colors.muted },
    { x: -0.25, y: -0.2,  color: colors.monitor },
    { x:  0.35, y: -0.2,  color: colors.lamp },
  ];

  const cardGeo = new THREE.PlaneGeometry(0.36, 0.28);
  for (const c of cardPositions) {
    const mat = new THREE.MeshStandardMaterial({
      color: c.color,
      roughness: 0.6,
      metalness: 0.0,
      side: THREE.FrontSide,
    });
    const card = new THREE.Mesh(cardGeo, mat);
    card.position.set(c.x, c.y, 0.025); // slightly in front of backing
    card.castShadow = true;
    group.add(card);
  }

  // --- Pin dots ---
  const pinGeo = new THREE.SphereGeometry(0.02, 6, 6);
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xf5efe6 });
  for (const c of cardPositions) {
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(c.x, c.y + 0.12, 0.04);
    group.add(pin);
  }

  return group;
}

/**
 * room.js — Floor plane and back wall.
 * Uses dark tones close to theme.bg so the room recedes.
 */

import * as THREE from 'three';
import { colors } from '../theme.js';

export function createRoom() {
  const group = new THREE.Group();
  group.name = 'room';

  // Dark charcoal (clearly above bg, never pure black) so the floor and
  // wall catch the lamp glow and the violet fill.
  const floorColor = 0x221f31;
  const wallColor  = 0x1c182a;

  // --- Floor ---
  const floorGeo = new THREE.PlaneGeometry(14, 10);
  const floorMat = new THREE.MeshStandardMaterial({
    color: floorColor,
    roughness: 0.9,
    metalness: 0.0,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  floor.name = 'floor';
  group.add(floor);

  // --- Back wall ---
  const wallGeo = new THREE.PlaneGeometry(14, 7);
  const wallMat = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.95,
    metalness: 0.0,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 3.5, -5);
  wall.receiveShadow = true;
  wall.name = 'backWall';
  group.add(wall);

  return group;
}

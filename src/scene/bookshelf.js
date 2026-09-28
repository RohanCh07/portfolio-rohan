/**
 * bookshelf.js — Wall-mounted shelf with several book boxes.
 * The group is named "shelf" for raycaster picking.
 */

import * as THREE from 'three';

const SHELF_COLOR = 0x2a2235;
const BOOK_COLORS = [0x7C6CF0, 0xF2A65A, 0x4a9e8f, 0xc94f6d, 0x6e8cb8];

export function createBookshelf() {
  const group = new THREE.Group();
  group.name = 'shelf';

  const shelfMat = new THREE.MeshStandardMaterial({
    color: SHELF_COLOR,
    roughness: 0.8,
    metalness: 0.1,
  });

  // --- Two shelf planks ---
  const plankGeo = new THREE.BoxGeometry(1.6, 0.05, 0.35);
  const plank1 = new THREE.Mesh(plankGeo, shelfMat);
  plank1.position.set(0, 0, 0);
  plank1.castShadow = true;
  plank1.receiveShadow = true;
  group.add(plank1);

  const plank2 = new THREE.Mesh(plankGeo, shelfMat);
  plank2.position.set(0, 0.7, 0);
  plank2.castShadow = true;
  plank2.receiveShadow = true;
  group.add(plank2);

  // --- Side brackets ---
  const bracketGeo = new THREE.BoxGeometry(0.04, 0.7, 0.3);
  const bracketL = new THREE.Mesh(bracketGeo, shelfMat);
  bracketL.position.set(-0.78, 0.35, 0);
  bracketL.castShadow = true;
  group.add(bracketL);

  const bracketR = new THREE.Mesh(bracketGeo, shelfMat);
  bracketR.position.set(0.78, 0.35, 0);
  bracketR.castShadow = true;
  group.add(bracketR);

  // --- Books on bottom shelf ---
  const bookData = [
    { x: -0.5, h: 0.35, w: 0.08, color: 0 },
    { x: -0.35, h: 0.30, w: 0.07, color: 1 },
    { x: -0.22, h: 0.32, w: 0.09, color: 2 },
    { x: -0.06, h: 0.28, w: 0.07, color: 3 },
    { x:  0.08, h: 0.34, w: 0.08, color: 4 },
    { x:  0.22, h: 0.29, w: 0.07, color: 0 },
    { x:  0.36, h: 0.33, w: 0.09, color: 1 },
  ];

  for (const b of bookData) {
    const geo = new THREE.BoxGeometry(b.w, b.h, 0.22);
    const mat = new THREE.MeshStandardMaterial({
      color: BOOK_COLORS[b.color],
      roughness: 0.85,
      metalness: 0.05,
    });
    const book = new THREE.Mesh(geo, mat);
    book.position.set(b.x, b.h / 2 + 0.025, 0);
    book.castShadow = true;
    group.add(book);
  }

  // --- Books on top shelf ---
  const topBooks = [
    { x: -0.4, h: 0.30, w: 0.08, color: 3 },
    { x: -0.25, h: 0.26, w: 0.07, color: 4 },
    { x: -0.12, h: 0.32, w: 0.09, color: 2 },
    { x:  0.04, h: 0.27, w: 0.07, color: 0 },
    { x:  0.18, h: 0.31, w: 0.08, color: 1 },
  ];

  for (const b of topBooks) {
    const geo = new THREE.BoxGeometry(b.w, b.h, 0.22);
    const mat = new THREE.MeshStandardMaterial({
      color: BOOK_COLORS[b.color],
      roughness: 0.85,
      metalness: 0.05,
    });
    const book = new THREE.Mesh(geo, mat);
    book.position.set(b.x, 0.7 + b.h / 2 + 0.025, 0);
    book.castShadow = true;
    group.add(book);
  }

  return group;
}

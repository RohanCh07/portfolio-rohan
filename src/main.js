/**
 * main.js — Application entry point.
 * Boots the 3D scene, wires hotspot interaction, mounts the back button.
 */

import { init, camera, scene } from './scene/experience.js';
import { setupInteraction } from './scene/interaction.js';
import { mountBackButton } from './ui/backButton.js';
import { mountOverlay } from './ui/overlay.js';

// Kick off the renderer inside the container div
const container = document.getElementById('canvas-container');
init(container);

// Phase 3: click-to-fly hotspots + Back navigation
// (camera & scene are live bindings populated by init(), and the camera
// already starts at the overview stop via initCameraRig inside experience.js)
setupInteraction(camera, scene, container);
mountBackButton();

// Phase 4: HTML content overlays (subscribe to activeSection)
mountOverlay();
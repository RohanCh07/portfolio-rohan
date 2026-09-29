/**
 * main.js — Application entry point.
 * Boots the 3D scene, wires hotspot interaction, mounts UI overlays,
 * Dev Mode IDE, and the mode toggle.
 */

import { init, camera, scene, whenReady } from './scene/experience.js';
import { setupInteraction } from './scene/interaction.js';
import { mountBackButton } from './ui/backButton.js';
import { mountOverlay } from './ui/overlay.js';
import { mountLoader } from './ui/loader.js';
import { mountModeToggle } from './ui/modeToggle.js';
import { mountDevMode } from './dev-mode/devMode.js';
import { mountQuickView } from './ui/quickView.js';
import { getDeviceTier } from './utils/deviceTier.js';
import { setState, setMode } from './store.js';

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

const webglAvailable = isWebGLAvailable();
const tier = getDeviceTier();

if (!webglAvailable) {
  setState({ noWebGL: true });
  setMode('quick');
} else if (tier === 'low') {
  setMode('quick');
}

if (webglAvailable) {
  // Phase 7: loading screen bound to the real LoadingManager. Low tier skips
  // props entirely, so there is nothing to wait for and no screen is mounted.
  const loadingScreen = mountLoader({ enabled: tier !== 'low' });

  // Kick off the renderer inside the container div
  const container = document.getElementById('canvas-container');
  init(container, { tier });

  // Dismiss once every prop has loaded or fallen back to its primitive.
  whenReady().then(() => loadingScreen.dismiss());

  // Safety net: three's loaders have no built-in timeout, so a stalled request
  // would otherwise trap the user behind the cover. dismiss() is idempotent.
  window.setTimeout(() => loadingScreen.dismiss(), 15000);

  // Phase 3: click-to-fly hotspots + Back navigation
  setupInteraction(camera, scene, container);
  mountBackButton();

  // Phase 4: HTML content overlays (subscribe to activeSection)
  mountOverlay();

  // Phase 5: Dev Mode IDE + persistent mode switcher
  mountDevMode();
  mountModeToggle();
}

// Phase 6: Quick View (always mounted)
mountQuickView();

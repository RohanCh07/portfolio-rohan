/**
 * theme.js — Single source of truth for colors, fonts, and motion timings.
 * Mirrors the locked tokens from README §2.
 */

export const colors = {
  bg:      '#14121F',   // Room / page background
  lamp:    '#F2A65A',   // Warm accent, lamp light, highlights
  monitor: '#7C6CF0',   // Violet accent, screen glow, Dev Mode accent
  text:    '#F5EFE6',   // Primary text
  muted:   '#9A94A8',   // Secondary text
};

export const fonts = {
  heading: "'Space Grotesk', sans-serif",
  body:    "'Inter', sans-serif",
  mono:    "'JetBrains Mono', monospace",  // Dev Mode
};

/** Motion rule: slow, eased movement everywhere (0.8–1.4 s) */
export const motion = {
  durationFast:   0.8,   // seconds — shortest allowed transition
  durationNormal: 1.0,
  durationSlow:   1.4,   // seconds — longest standard transition
  ease:           'power2.inOut',  // GSAP ease string
};

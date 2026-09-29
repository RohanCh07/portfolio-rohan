/**
 * deviceTier.js — Hardware and capability detection (Phase 6).
 */

export function getDeviceTier() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Mobile check: window width < 768 or user agent hints at mobile
  let isMobile = window.innerWidth < 768;
  if (navigator.userAgentData) {
    isMobile = isMobile || navigator.userAgentData.mobile;
  } else if (/Mobi|Android/i.test(navigator.userAgent)) {
    isMobile = true;
  }

  const cores = navigator.hardwareConcurrency || 4; // default to 4 if unknown

  // "low": reduced motion preferred, OR mobile AND low core count.
  if (isReducedMotion || (isMobile && cores <= 4)) {
    return 'low';
  }

  // "high": desktop with plenty of cores
  if (!isMobile && cores >= 8) {
    return 'high';
  }

  // "mid": everything else (capable phones, older desktops, laptops)
  return 'mid';
}

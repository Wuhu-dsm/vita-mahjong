export function isLowEndDevice(): boolean {
  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 4;

  // Low-end: low-DPI screen AND few CPU cores
  if (dpr < 2 && cores < 4) return true;

  // Budget devices typically have 1x or 1.5x DPR
  if (dpr < 2) return true;

  return false;
}

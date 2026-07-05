export const config = {
  designWidth: 1080,
  designHeight: 2400,
  safeAreaTop: 48,
  safeAreaBottom: 34,
  tile: {
    width: 218,
    height: 276,
    touchPadding: 12,
  },
  tray: {
    height: 162,
    slotSize: 128,
    gap: 0,
  },
  hud: {
    height: 96,
  },
  colors: {
    homeBg: 0x7a3f19,
    gameBg: 0x063f32,
    resultBg: 0x000804,
    secondary: 0xD4A574,
    accent: 0xF5D78E,
    destructive: 0xC0392B,
    tileFace: 0xFAFAF8,
    tileSide: 0x0aa121,
    trayBg: 0x421407,
    trayBorder: 0xb76b2c,
  },
  timings: {
    screenTransitionMs: 350,
    tileFlightMs: 250,
    comboTimeoutMs: 3000,
    blockedShakeMs: 200,
    blockedFeedbackMs: 1200,
  },
  assist: {
    undoLimit: 3,
    hintLimit: 3,
    shuffleLimit: 1,
  },
  audio: {
    sfxDefaultVolume: 0.7,
    bgmDefaultVolume: 0.4,
  },
  persistence: {
    keyPrefix: 'vita-mahjong:',
  },
  particles: {
    highCount: 72,
    lowCount: 32,
    burstDurationMs: 760,
    minSpeed: 0.9,
    maxSpeed: 3.7,
    gravity: 0.34,
    particleSize: 16,
    spreadRadius: 152,
    colors: {
      primary: 0xffffff,
      secondaries: [0xf8fbff, 0xd9d9d9, 0xffffff],
    },
  },
};

export type Config = typeof config;

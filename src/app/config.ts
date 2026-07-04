export const config = {
  designWidth: 1080,
  designHeight: 2400,
  safeAreaTop: 48,
  safeAreaBottom: 34,
  tile: {
    width: 227,
    height: 120,
    touchPadding: 12,
  },
  tray: {
    height: 128,
    slotSize: 120,
    gap: 16,
  },
  hud: {
    height: 96,
  },
  colors: {
    homeBg: 0x7A4F2E,
    gameBg: 0x1B4D3E,
    resultBg: 0x0F172A,
    secondary: 0xD4A574,
    accent: 0xF5D78E,
    destructive: 0xC0392B,
    tileFace: 0xFAFAF8,
    tileSide: 0x2E8B57,
    trayBg: 0x3E2723,
    trayBorder: 0xF5D78E,
  },
  timings: {
    screenTransitionMs: 350,
    tileFlightMs: 250,
    comboTimeoutMs: 3000,
    blockedShakeMs: 200,
    blockedFeedbackMs: 1200,
  },
};

export type Config = typeof config;

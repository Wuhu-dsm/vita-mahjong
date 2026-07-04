---
phase: 03-polish-persistence-distribution
plan: 03-02
subsystem: ui, pwa
tags: [pixi.js, graphics, particle-effects, object-pool, pwa, vite-plugin-pwa, workbox, service-worker]

requires:
  - phase: 03-01
    provides: config.particles (highCount, lowCount, burstDurationMs, etc.), GameScreenOptions.isLowEndDevice
  - phase: 01
    provides: GameScreen tick loop, Animation interface, TilePool object pool pattern
  - phase: 02
    provides: ScoreFloater ticker-driven update pattern, ComboFeedback

provides:
  - Pooled particle burst effect on match elimination with low-end device degradation
  - PWA build pipeline with manifest, Service Worker, and offline level caching

affects:
  - verify-work phase 3 — particle burst visual verification
  - future — PWA icons can be customized in generate-assets.ts

tech-stack:
  added:
    - vite-plugin-pwa (v1.3.0) — generateSW + Workbox for PWA Service Worker
  patterns:
    - Object pool (ParticlePool) for Graphics objects — follows TilePool pattern
    - Ticker-driven animation (particleBurst.update) — follows ScoreFloater pattern
    - Container extension (ParticleBurst extends Container) — follows component pattern
    - Programmatic PNG generation for app icons — follows existing canvas pipeline

key-files:
  created:
    - src/renderer/effects/ParticleBurst.ts — pooled particle burst effect
    - public/icons/icon-192.png — PWA app icon (192×192)
    - public/icons/icon-512.png — PWA app icon (512×512)
  modified:
    - src/renderer/screens/GameScreen.ts — import, field, init, tick, match integration
    - vite.config.ts — VitePWA plugin with manifest + workbox config
    - index.html — iOS PWA meta tags (apple-mobile-web-app-capable, etc.)
    - tools/generate-assets.ts — iconApp() function for PWA icon generation
    - package.json — vite-plugin-pwa devDependency

key-decisions:
  - "Particle pool budget set to 40 (per RESEARCH.md A3) — covers worst-case burst overlap"
  - "Particles use Graphics.rect() with fill() (PixiJS 8 API) — no @pixi/particle-container"
  - "Pool exhaustion handled silently — emit() skips when pool is full, no crash"
  - "PWA use vite-plugin-pwa's generateSW + Workbox — no custom sw.js"
  - "registerType: autoUpdate for seamless PWA updates without user prompt"
  - "CacheFirst for /levels/*.json — level data is versioned with build, safe to cache-first"
  - "Programmatic icon generation via generate-assets.ts — consistent with existing asset pipeline"

requirements-completed: [VISL-03, PLAT-03]

coverage:
  - id: D1
    description: "Particle burst effect on match elimination with 15-20 particles (normal) or 8-10 (low-end), using object pool with budget 40"
    requirement: "VISL-03"
    verification:
      - kind: other
        ref: "npm run build (ParticleBurst.ts + GameScreen.ts compile and bundle)"
        status: pass
    human_judgment: true
    rationale: "Particle visual quality, scatter pattern, fade/shrink timing, and proper pooling behavior require human visual verification on actual devices."
  - id: D2
    description: "PWA build pipeline with manifest, Service Worker, offline level caching, and install-to-home-screen support"
    requirement: "PLAT-03"
    verification:
      - kind: other
        ref: "npm run build (produces dist/manifest.webmanifest, dist/sw.js, dist/workbox-*.js, dist/registerSW.js)"
        status: pass
    human_judgment: true
    rationale: "PWA installability, offline behavior, and 'Add to Home Screen' UX require testing on real Android Chrome and iOS Safari devices."

duration: 3 min
completed: 2026-07-05
status: complete
---

# Phase 3 Plan 02: Particle Burst Effects & PWA Pipeline Summary

**Pooled particle burst effect on match elimination with low-end degradation, plus PWA build pipeline with manifest, Service Worker, and offline level caching**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-04T23:36:27Z
- **Completed:** 2026-07-04T23:39:19Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- ParticleBurst effect with internal ParticlePool (budget 40) — no per-burst Graphics allocations
- Circular scatter from match midpoint with gravity, fade, and shrink over ~500ms
- Color distribution: 60% primary gold, 40% random secondary for visual variety
- Config-driven particle counts: 18 (normal) or 9 (low-end) from config.particles
- Integrated into GameScreen tick loop alongside ScoreFloater, triggered only on match elimination
- PWA build pipeline with vite-plugin-pwa generateSW + Workbox (registerType: autoUpdate)
- PWA manifest: standalone display, portrait orientation, theme_color #7A4F2E
- Service Worker with CacheFirst for /levels/*.json (maxEntries: 25), precache for all static assets
- Programmatically generated 192×192 and 512×512 PWA app icons via existing canvas pipeline
- iOS PWA meta tags for standalone mode and home screen icon

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ParticleBurst effect + integrate into GameScreen** - `ec8d6b0` (feat)
2. **Task 2: Set up PWA build pipeline (vite-plugin-pwa + icons + manifest)** - `51d18ba` (feat)

## Files Created/Modified

- `src/renderer/effects/ParticleBurst.ts` - Pooled particle burst effect with emit/update lifecycle
- `src/renderer/screens/GameScreen.ts` - ParticleBurst import, field, init, tick, and match integration
- `vite.config.ts` - VitePWA plugin with manifest and workbox runtime caching
- `index.html` - iOS PWA meta tags (apple-mobile-web-app-capable, status-bar-style, apple-touch-icon)
- `tools/generate-assets.ts` - iconApp() function for PWA icon generation
- `public/icons/icon-192.png` - 192×192 PWA app icon
- `public/icons/icon-512.png` - 512×512 PWA app icon
- `package.json` / `package-lock.json` - vite-plugin-pwa devDependency

## Decisions Made

- Particle pool budget 40 (per RESEARCH.md A3) — covers worst-case burst overlap
- Graphics.rect() + fill() (PixiJS 8 API) — no deprecated @pixi/particle-container
- Pool exhaustion handled silently (skips, no crash) per RESEARCH.md mitigation
- vite-plugin-pwa's generateSW + Workbox over custom sw.js per "Don't Hand-Roll" guidance
- CacheFirst for levels (safe — versioned with build) vs NetworkFirst for navigation
- Programmatic icon generation over static PNGs — consistent with existing asset pipeline

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Particle burst and PWA pipeline complete for Phase 3
- Ready for user verification (visual particle effects, PWA install/offline testing)
- Next: Phase 3 verification (03-VERIFICATION.md or /gsd-verify-work)

---
*Phase: 03-polish-persistence-distribution*
*Completed: 2026-07-05*

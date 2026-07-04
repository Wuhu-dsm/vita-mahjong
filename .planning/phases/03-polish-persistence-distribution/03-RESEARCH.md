# Phase 03: Polish, Persistence & Distribution - Research

**Researched:** 2026-07-05
**Domain:** Game persistence (localStorage), particle effects (PixiJS 8), PWA packaging (vite-plugin-pwa), performance detection
**Confidence:** HIGH

## Summary

Phase 03 wraps the fully playable Vita Mahjong into a polished, persistent, distributable product. Four workstreams converge: (1) `localStorage` persistence for level progress and audio settings with session recovery, (2) a particle burst effect triggered on tile-match elimination with automatic low-end degradation, (3) a basic PWA envelope (`manifest.json` + Service Worker) for install-to-home-screen and offline play, and (4) a "Reset Progress" button in settings.

The existing codebase provides strong integration anchors: `App.ts` holds the `currentLevel` variable and `WIN` event handler, `AudioManager` is a singleton with volume/mute getters/setters, `GameScreen` has a mature ticker-driven `Animation[]` system, `TilePool` models the object pool pattern, and `ScoreFloater` shows the animation lifecycle pattern. The phase adds one new dev dependency (`vite-plugin-pwa`), one new effect module (`ParticleBurst`), one new persistence utility module (`persistence.ts`), and extends `SettingsScreen` with a reset button. All other work integrates into existing files.

**Primary recommendation:** Use the existing ticker + `Animation[]` + object pool patterns for particles, `localStorage` accessed through a thin persistence utility, and `vite-plugin-pwa` with `generateSW` strategy. No new runtime dependencies beyond `vite-plugin-pwa` (devDep only).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Particle burst effects | Browser/Client (PixiJS renderer) | — | GPU-accelerated sprite rendering on the main PixiJS stage |
| localStorage persistence | Browser/Client (Web Storage API) | — | All data is local; no server exists |
| Session recovery (currentLevel) | Browser/Client (localStorage read on init) | — | Read at App.ts startup, feed into HomeScreen label |
| Audio settings persistence | Browser/Client (localStorage) | — | AudioManager getters/setters persist on change |
| Reset progress | Browser/Client (localStorage clear) | — | Button triggers localStorage key removal |
| PWA manifest | CDN/Static (vite-plugin-pwa injection) | — | Injected at build time into index.html |
| Service Worker caching | CDN/Static (Workbox via vite-plugin-pwa) | — | Intercepts fetch at the network proxy layer |
| Performance detection | Browser/Client (startup heuristic) | — | Inspects devicePixelRatio + hardwareConcurrency at init |

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VISL-03 | Particle effects for match feedback, degradable on low-end devices | PixiJS 8 Graphics-based particle burst with object pool; devicePixelRatio+hardwareConcurrency detection heuristic; configurable particle count |
| PROG-01 | Persist unlocked levels and user settings locally | localStorage key-value store; write on level-WIN and settings-change; read on app init |
| PROG-02 | Session recovery to last played state after restart | Store currentLevel on WIN; restore to HomeScreen label at startup; restart is "from beginning of that level" |
| PLAT-03 | Build as mobile web / native H5 | vite-plugin-pwa 1.3.0, generateSW strategy, manifest.json with icons; CacheFirst for static assets, NetworkFirst for HTML |

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Session recovery = **level progress only**. Restart from beginning of currentLevel. No board state, tray, undo stack, or combo recovery.
- **D-02:** Persist `currentLevel` + audio settings (`sfxVolume`, `bgmVolume`, `sfxMuted`, `bgmMuted`). Use `localStorage`.
- **D-03:** App always returns to **home screen** on start. Home button shows persisted `currentLevel`.
- **D-04:** Settings page has **"Reset Progress" button** with confirmation dialog → resets currentLevel to 1.
- **D-05:** Particle style = **match burst** — scattering small squares/dots from both matched tile positions, colors matching tile theme.
- **D-06:** Particles only on **match elimination** (not win, fail, or combo — those have existing feedback components).
- **D-07:** **15-20 particles/match** normal, **8-10 particles/match** low-end.
- **D-08:** **Auto-detect** performance (agent decides: `devicePixelRatio` threshold or frame rate sampling).
- **D-09:** **Basic PWA** (manifest.json + Service Worker caching static assets + level JSON). "Add to Home Screen" support.
- **D-10:** **No Capacitor** — PWA install-to-home-screen is sufficient.

### Agent Discretion
- Performance auto-detection mechanism (devicePixelRatio threshold vs. frame rate sampling) — this research recommends `devicePixelRatio` + `hardwareConcurrency` combined heuristic.
- Particle shape (square/circle), color mapping, animation curves — this research provides patterns, implementation chooses specifics.
- Service Worker caching strategy (CacheFirst / NetworkFirst) and pre-cache scope — this research recommends CacheFirst for static+levels, NetworkFirst for HTML.
- PWA icon generation — reuse existing `tools/generate-assets.ts` pattern or static PNGs.

### Deferred Ideas (OUT OF SCOPE)
- Capacitor / native APK/IPA
- Full game state serialization (board/tray/undo stack)
- Low-pressure mode (removed in Phase 2)
- Level replay
- Landscape/tablet adaptation
- Manual performance tier switch

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| localStorage API | Built-in (Web Platform) | Persist currentLevel + audio settings | Zero-dependency, synchronous, ~5MB quota, universally available [VERIFIED: MDN Web Storage API] |
| PixiJS 8 Graphics | ^8.19.0 (already installed) | Draw particle shapes (rect/circle) on Sprites | The standard way to create procedural shapes in PixiJS 8; GPU-accelerated [CITED: pixijs.com/8.x/guides] |
| `vite-plugin-pwa` | ^1.3.0 | Generate manifest.json + Service Worker via Workbox | Official Vite PWA plugin, 3.2M weekly downloads, maintained by Anthony Fu [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `navigator.hardwareConcurrency` | Built-in | Detect CPU core count for low-end detection | Combined with `devicePixelRatio` at app init |
| `document.visibilitychange` | Built-in | Detect app background for auto-save | Flush localStorage writes when game is backgrounded |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage | IndexedDB | Async, more complex API; unnecessary for <5 keys |
| vite-plugin-pwa generateSW | injectManifest (custom SW) | More control but more maintenance; generateSW covers our needs |
| Raw Graphics for particles | @pixi/particle-container (v7 legacy) | Removed in PixiJS 8; raw Graphics is the official v8 approach |
| devicePixelRatio only | Frame rate sampling | Sampling is more accurate but adds ~2s startup delay; combined heuristic is simpler |

**Installation:**
```bash
npm install -D vite-plugin-pwa
```

**Version verification:**
```bash
npm view vite-plugin-pwa version  # 1.3.0 — confirmed 2026-07-05
```

No additional runtime dependencies needed. Persistence uses built-in `localStorage`. Particles use already-installed `pixi.js`.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| vite-plugin-pwa | npm | 4+ yrs | 3.3M/wk | github.com/vite-pwa/vite-plugin-pwa | OK | Approved |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    App Startup (App.ts)                      │
│  ┌──────────────────────┐                                   │
│  │ performanceDetect()   │ ← devicePixelRatio, concurrency  │
│  │ → isLowEndDevice: bool│                                   │
│  └──────────┬───────────┘                                   │
│             │                                                │
│  ┌──────────▼───────────┐                                   │
│  │ persistence.load()   │ ← reads localStorage              │
│  │ → currentLevel, audio│    vita-mahjong:currentLevel       │
│  └──────────┬───────────┘    vita-mahjong:audio              │
│             │                                                │
│  ┌──────────▼───────────┐                                   │
│  │ ScreenManager        │                                   │
│  │ → show('home')       │                                   │
│  │ HomeScreen.setLevel()│ ← currentLevel displayed          │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Game Flow (GameScreen)                     │
│                                                              │
│  handleTileTap                                               │
│    → state.tapStone()                                        │
│    → animateTileToTray()                                     │
│    → finishTapResult()                                       │
│       │                                                      │
│       ├─ result.matched? ──YES──► particleBurst.emit()      │
│       │                         │    scoreFloater.show()     │
│       │                         │    AudioManager.playSfx()  │
│       │                         │    tray.playMatchRemoval() │
│       │                         ▼                            │
│       ├─ result.won? ────YES──► persistence.saveLevel()     │
│       │                         │    emit WIN event          │
│       │                         ▼                            │
│       └─ result.failed? ─YES──► failurePopup.show()         │
│                                                              │
│  tick() loop:                                                │
│    particleBurst.update(ticker)  ← Animation[] system        │
│    scoreFloater.update(ticker)                               │
│    comboFeedback.update(ticker)                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Settings Screen Interaction                     │
│                                                              │
│  SettingsScreen                                              │
│    ├─ Volume sliders ──onChange──► AudioManager setters     │
│    │                               │→ persistence.saveAudio()│
│    ├─ Mute toggles   ──onChange──► AudioManager setters     │
│    │                               │→ persistence.saveAudio()│
│    └─ [Reset Progress] ─onTap──►   confirmation dialog      │
│                        [Confirm]→  persistence.resetLevel()  │
│                                    HomeScreen.setLevel(1)    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              PWA Build Pipeline (vite-plugin-pwa)             │
│                                                              │
│  vite build                                                  │
│    ├─ vite-plugin-pwa:                                       │
│    │   ├─ Generate manifest.json → injected in index.html    │
│    │   ├─ Generate sw.js (Workbox generateSW)                │
│    │   └─ Pre-cache: index.html, assets/*, levels/*.json     │
│    │                                                         │
│    └─ Output: dist/                                          │
│         ├─ index.html (with <link rel="manifest">)           │
│         ├─ manifest.json                                     │
│         ├─ sw.js                                             │
│         ├─ assets/                                           │
│         └─ levels/                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Runtime: visibilitychange / Lifecycle            │
│                                                              │
│  document.addEventListener('visibilitychange', () => {       │
│    if (document.hidden) {                                    │
│      persistence.saveAudio(AudioManager.getInstance());      │
│      // Flush any pending localStorage writes                │
│    }                                                         │
│  });                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
src/
├── app/
│   ├── App.ts              # MODIFY: persistence init, WIN→save, performance detect
│   ├── config.ts           # MODIFY: add particle & perf config constants
│   ├── persistence.ts      # NEW: localStorage read/write/clear utilities
│   └── performance.ts      # NEW: isLowEndDevice() detection
├── renderer/
│   ├── effects/
│   │   ├── ScoreFloater.ts # (existing — reference pattern)
│   │   └── ParticleBurst.ts# NEW: particle burst effect + object pool
│   ├── pools/
│   │   └── TilePool.ts     # (existing — reference pool pattern)
│   └── screens/
│       ├── GameScreen.ts   # MODIFY: integrate ParticleBurst into match flow
│       └── SettingsScreen.ts# MODIFY: add Reset Progress button + confirm dialog
├── audio/
│   └── AudioManager.ts     # MODIFY: init from localStorage on first user gesture
public/
│   └── levels/             # (existing — SW will pre-cache)
vite.config.ts              # MODIFY: add VitePWA plugin config
```

### Pattern 1: Object Pool for Particles (follows TilePool pattern)

**What:** Pre-allocate N particle sprites, obtain from idle pool, return on animation complete. Avoids GC pressure from per-match allocations.

**When to use:** Any effect that creates/destroys many short-lived display objects per frame.

**Example:**
```typescript
// Source: existing src/renderer/pools/TilePool.ts pattern
export class ParticlePool {
  private readonly idle: Graphics[] = [];
  private readonly active = new Set<Graphics>();
  private allocated = 0;
  private static readonly BUDGET = 40; // max particles in-flight

  obtain(parent: Container): Graphics {
    let particle = this.idle.pop();
    if (!particle) {
      if (this.allocated >= ParticlePool.BUDGET) return null!;
      particle = new Graphics();
      this.allocated += 1;
    }
    this.active.add(particle);
    parent.addChild(particle);
    particle.visible = true;
    particle.alpha = 1;
    return particle;
  }

  free(particle: Graphics): void {
    if (!this.active.delete(particle)) return;
    particle.parent?.removeChild(particle);
    particle.visible = false;
    particle.clear();
    this.idle.push(particle);
  }
}
```

### Pattern 2: Ticker-Driven Animation (follows existing Animation[] system)

**What:** `Animation` objects pushed to `this.animations[]`, updated per-tick via `updateAnimations()`, with `update(progress)` callback and `complete()` cleanup. Already proven in `animateTileToTray`, `BlockedFeedbackLifecycle`, `ScoreFloater`, and hint pulse.

**When to use:** Any time-based visual effect. The particle burst follows this exact pattern.

**Example:**
```typescript
// Source: existing GameScreen.ts Animation interface
// Particles are modeled as a single Animation object that manages many particle sprites
this.animations.push({
  elapsedMs: 0,
  durationMs: 500, // ~0.5s burst
  update: (progress: number) => {
    for (const p of this.burstParticles) {
      p.x += p.vx * ticker.deltaMS * 0.06; // velocity
      p.y += p.vy * ticker.deltaMS * 0.06;
      p.vy += 0.15; // gravity
      p.alpha = 1 - progress; // fade out
      p.scale.set(1 - progress * 0.6);
    }
  },
  complete: () => {
    // Return all particles to pool
    for (const p of this.burstParticles) this.pool.free(p);
    this.burstParticles = [];
  },
});
```

### Pattern 3: Persistence Utility (thin localStorage wrapper)

**What:** A module exporting `loadLevel()`, `saveLevel(level)`, `loadAudio()`, `saveAudio(audio)`, `resetLevel()`. All reads happen at App init. Writes happen at `WIN` event and settings onChange. No reactive or streaming model needed.

**When to use:** Any data that must survive browser restart.

**Example:**
```typescript
// Source: MDN Web Storage API + codebase conventions
const KEY_LEVEL = 'vita-mahjong:currentLevel';
const KEY_AUDIO = 'vita-mahjong:audio';

export function loadLevel(): number {
  const raw = localStorage.getItem(KEY_LEVEL);
  return raw ? parseInt(raw, 10) || 1 : 1;
}

export function saveLevel(level: number): void {
  localStorage.setItem(KEY_LEVEL, String(level));
}

export function loadAudio(): AudioSettings {
  const raw = localStorage.getItem(KEY_AUDIO);
  if (!raw) return { sfxVolume: 0.7, bgmVolume: 0.4, sfxMuted: false, bgmMuted: false };
  return JSON.parse(raw);
}

export function saveAudio(settings: AudioSettings): void {
  localStorage.setItem(KEY_AUDIO, JSON.stringify(settings));
}

export function resetLevel(): void {
  localStorage.removeItem(KEY_LEVEL);
}
```

### Anti-Patterns to Avoid
- **Writing localStorage every frame/tick:** localStorage writes are synchronous and can block the main thread. Write only at level boundaries (WIN event) and settings onChange. Flush on visibilitychange (app background).
- **Allocating per-particle Graphics objects:** Without pooling, each match creates 15-20 new Graphics objects that the GC must collect a frame later. Use ParticlePool.
- **Using pixi.js v7 `@pixi/particle-container`:** Removed in v8. Do not install or reference.
- **Hardcoding particle count:** Use `config.particles.highCount` and `config.particles.lowCount` so the performance detector controls density at init.
- **Over-engineering persistence:** No IndexedDB, no state machines. Four functions, one module. `localStorage` is synchronous, simple, and covers all five keys.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service Worker generation | Custom `sw.js` with manual cache strategies | `vite-plugin-pwa` with `generateSW` + Workbox | Workbox handles cache versioning, precache manifest generation, cache-busting, and lifecycle edge cases that are error-prone to implement manually |
| PWA manifest injection | Manual `<link>` tag or script injection | `vite-plugin-pwa` auto-injection | Ensures correct path resolution, hash-based cache busting, and dev/prod behavior differences |
| Particle rendering framework | Custom WebGL draw calls or canvas 2D fallback | PixiJS 8 `Graphics` on `Sprite` objects | Already in the render pipeline, GPU-accelerated, composited with existing scene graph |
| localStorage key-value store | Abstraction library or wrapper framework | Direct `localStorage.getItem/setItem` calls | Five keys total. Any wrapper is more code than the direct API calls it wraps. |
| Performance tier detection | Complex benchmark suite | `devicePixelRatio < 3` AND `hardwareConcurrency < 4` | Simpler heuristic, no startup delay; frame rate sampling is available as fallback |

**Key insight:** The existing codebase already provides the three critical patterns (animation loop, object pool, singleton manager). The phase adds one build-time plugin and integrates into those patterns — it does not introduce new architectural concepts.

## Runtime State Inventory

> Not applicable — this is not a rename/refactor/migration phase.

## Common Pitfalls

### Pitfall 1: localStorage Jank from Synchronous Writes
**What goes wrong:** Writing to localStorage during gameplay (e.g., inside game tick) blocks the main thread synchronously, causing visible frame drops and stutter.
**Why it happens:** `localStorage.setItem()` is a synchronous disk flush on some browsers (particularly older versions of Safari and Chrome on Android).
**How to avoid:** Write only at natural boundaries — `WIN` event handler (level complete), settings onChange callbacks, and `visibilitychange` (app background). Never write inside `tick()`, `handleTileTap()`, or animation callbacks.
**Warning signs:** Frame timing spikes in DevTools Performance tab that align with `localStorage.setItem` calls.

### Pitfall 2: Particle GC Pressure Without Pooling
**What goes wrong:** Creating 15-20 new `Graphics` objects per match, then dropping references, causes frequent GC pauses — especially on low-end devices where the effect is meant to be lighter.
**Why it happens:** `new Graphics()` per burst, no reuse. After the burst animation completes, the Graphics objects become garbage.
**How to avoid:** Use `ParticlePool` (follow `TilePool` pattern). Pre-allocate `BUDGET` (40) particles. On burst start, obtain from pool. On animation complete, return to pool with `clear()` + `visible = false`.
**Warning signs:** Sawtooth memory pattern in DevTools Memory profiler, periodic 50ms+ GC pauses.

### Pitfall 3: Service Worker Caching Stale index.html
**What goes wrong:** Using `CacheFirst` for `index.html` causes users to see a stale cached version even after deploying a new build.
**Why it happens:** `CacheFirst` serves from cache without checking the network, so the SW never discovers there's a new HTML entry point.
**How to avoid:** Use `NetworkFirst` for `index.html` (or navigation requests). Use `CacheFirst` only for hash-versioned assets (JS bundles, CSS, levels/*.json where content changes only with new level data).
**Warning signs:** Users report seeing old UI after a deployment. Fixed by using Workbox's `registerRoute` with `NetworkFirst` strategy for document requests.

### Pitfall 4: PWA Icons Not Generated
**What goes wrong:** Missing or incorrect icon sizes in `manifest.json` causes the "Add to Home Screen" prompt to not appear on Android Chrome or the install button to be absent on iOS Safari.
**Why it happens:** Android Chrome requires at least 192x192, iOS Safari requires a `<link rel="apple-touch-icon">` tag plus manifest icon entries.
**How to avoid:** Either use `vite-plugin-pwa`'s built-in `pwaAssets` integration to auto-generate from a source image, or manually provide PNGs at 192x192 and 512x512 and configure them in the manifest. Also add `apple-touch-icon` link if iOS is a target.
**Warning signs:** "Install app" prompt doesn't appear. Check Chrome DevTools → Application → Manifest for errors.

### Pitfall 5: Over-Saving on Settings Change
**What goes wrong:** Every slider drag (e.g., volume slider) triggers a `localStorage.setItem` call, causing multiple sync writes per second during drag.
**Why it happens:** `onChange` fires on every slider position update, not just on release.
**How to avoid:** Debounce the save (write on slider release / pointerup, not on drag). The AudioManager memory state updates in real-time; persistence flushes on release.
**Warning signs:** Sluggish slider response during drag testing on mobile.

## Code Examples

### ParticleBurst Integration Point (in GameScreen.ts finalize callback)
```typescript
// Source: existing code pattern at GameScreen.ts line 351
// Insert particle burst BEFORE the match removal animation:
if (result.matched && result.removed.length >= 2) {
  // Get position of the two matched tiles
  const pos1 = this.tileByStoneId.get(result.removed[0].id);
  const pos2 = this.tileByStoneId.get(result.removed[1].id);
  if (pos1 && pos2) {
    const midX = (pos1.x + pos2.x) / 2;
    const midY = (pos1.y + pos2.y) / 2;
    this.particleBurst.emit(midX, midY, this.isLowEndDevice); // NEW
  }
  this.tray.playMatchRemoval(result.removed, targetSlotIndex, this.level.theme, this.ticker, finalize);
  return;
}
```

### Performance Detection (src/app/performance.ts)
```typescript
// Source: combined heuristic from Chrome DevTools and web.dev guidance [CITED]
export function isLowEndDevice(): boolean {
  // devicePixelRatio: <2 = very low, <3 = mid-range. Flags <3 as conservative.
  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 4;

  // Low-end: low-DPI screen AND few CPU cores
  if (dpr < 2 && cores < 4) return true;

  // Flag also if dpr < 2 regardless (budget devices typically have 1x or 1.5x)
  if (dpr < 2) return true;

  return false;
}
```

### vite.config.ts PWA Configuration
```typescript
// Source: vite-plugin-pwa official docs [VERIFIED: vite-pwa-org.netlify.app]
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Vita Mahjong',
        short_name: 'Vita Mahjong',
        description: '经典麻将连连看 - 放松消除体验',
        theme_color: '#7A4F2E',
        background_color: '#7A4F2E',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^\/levels\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'level-data',
              expiration: { maxEntries: 25 },
            },
          },
        ],
      },
    }),
  ],
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@pixi/particle-container` (v7) | Raw `Graphics` + object pool | PixiJS v8 (2024) | Built-in particle system removed; custom pool pattern is the recommended v8 approach |
| Manual Service Worker (`sw.js`) | `vite-plugin-pwa` + Workbox `generateSW` | Industry standard since ~2022 | Workbox handles cache versioning, precache manifests, and lifecycle edge cases |
| `localStorage` writes during gameplay | Writes deferred to level-end/background/pause | Browser best practice, reinforced by web.dev long-tasks guidance | Avoids main-thread blocking during animation frames |
| `navigator.deviceMemory` | `devicePixelRatio` + `hardwareConcurrency` | deviceMemory not widely supported | Combined heuristic has broader browser support and correlates well with GPU capability |

**Deprecated/outdated:**
- **`@pixi/particle-container`:** Removed in PixiJS v8. Do not npm install or import.
- **`navigator.deviceMemory`:** Only supported in Chrome; not reliable for cross-browser detection.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `vite-plugin-pwa` 1.3.0 works with Vite 8.1.x without conflicts | Standard Stack | If incompatible, may need to pin vite-plugin-pwa version or upgrade Vite; low risk as both are actively maintained |
| A2 | `devicePixelRatio < 2` combined with `hardwareConcurrency < 4` correctly classifies low-end mobile devices | Architecture Patterns | False positives (flags mid-range as low-end) → fewer particles but no broken experience; false negatives (misses low-end) → particles may lag on target devices |
| A3 | `ParticlePool` budget of 40 is sufficient for the worst-case burst overlap | Architecture Patterns | If multiple matches happen before first burst completes (rare with 50+ card board), pool may exhaust; fallback: skip new burst if pool is full |
| A4 | `localStorage` `vita-mahjong:` key prefix avoids collisions in all target environments | Don't Hand-Roll | If another app on same origin uses same keys → data conflict. Unlikely for a standalone game deployed to its own domain. |
| A5 | PWA icons can be programmatically generated via existing `tools/generate-assets.ts` pattern | Code Examples | If not, static PNG files must be created manually; no blocking impact, just different implementation path |

## Open Questions (RESOLVED)

1. **PWA Icon Source** (RESOLVED)
   - What we know: manifest needs 192x192 and 512x512 PNG icons. The project already uses `tools/generate-assets.ts` for programmatic asset generation.
   - What's unclear: Whether to extend the existing asset generator to produce PWA icons, or create static PNGs manually. The CONTEXT.md leaves this to agent discretion.
   - Recommendation: Use static app-icon PNGs (generated once, committed to `public/icons/`) unless the generate-assets toolchain already supports the tile logo rendering. Simpler and lower risk.

2. **iOS Safari PWA Support** (RESOLVED)
   - What we know: iOS Safari supports manifest and SW but has quirks (requires `apple-mobile-web-app-capable` meta tag, standalone mode has different behavior than Android Chrome).
   - What's unclear: Whether Phase 3 should include iOS-specific PWA meta tags (`apple-touch-icon`, `apple-mobile-web-app-status-bar-style`) or leave for a future polish pass.
   - Recommendation: Include minimal iOS meta tags (apple-touch-icon link, apple-mobile-web-app-capable) since the target platform includes iOS Safari. The `vite-plugin-pwa` plugin can inject these.

3. **Visibility Change Save Scope** (RESOLVED)
   - What we know: CONTEXT.md says persist at level end, pause, or app background. `visibilitychange` event fires when app goes to background.
   - What's unclear: Whether the visibilitychange handler should also save audio settings if they changed during a game (the settings screen is separate from gameplay).
   - Recommendation: Save both level and audio on visibilitychange. The audio save is a no-op if unchanged (just overwrites with same data). Simple, safe, no edge cases.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | vite build, dev | ✓ | v24.12.0 | — |
| npm | Package installation | ✓ | 11.6.2 | — |
| Vite | Build toolchain | ✓ | ^8.1.3 (installed) | — |
| PixiJS | Renderer | ✓ | ^8.19.0 (installed) | — |
| TypeScript | Compilation | ✓ | ^6.0.3 (installed) | — |
| `vite-plugin-pwa` | PWA build | ✗ | — | Must install: `npm install -D vite-plugin-pwa` |

**Missing dependencies with no fallback:**
- `vite-plugin-pwa` — must be installed before PWA build tasks execute. Install in Wave 0.

**Missing dependencies with fallback:**
- None. All other dependencies are already present.

## Sources

### Primary (HIGH confidence)
- [MDN: Using the Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) — localStorage API surface, feature detection, JSON serialization, StorageEvent
- [npm registry: vite-plugin-pwa](https://www.npmjs.com/package/vite-plugin-pwa) — version 1.3.0, 3.3M weekly downloads, verified OK via legitimacy audit
- [Vite PWA Guide: Getting Started](https://vite-pwa-org.netlify.app/guide/) — plugin installation, VitePWA config, registerType, workbox integration
- [Vite PWA Guide: Service Worker Strategies](https://vite-pwa-org.netlify.app/guide/service-worker-strategies-and-behaviors) — generateSW vs injectManifest, autoUpdate vs prompt

### Secondary (MEDIUM confidence)
- [Chrome Developers: Workbox Caching Strategies](https://developer.chrome.com/docs/workbox/caching-strategies-overview) — CacheFirst, NetworkFirst, StaleWhileRevalidate strategy definitions and use cases
- [web.dev: Optimize Long Tasks](https://web.dev/articles/optimize-long-tasks) — main thread blocking, yielding, scheduler.yield()
- [Existing codebase: GameScreen.ts Animation system] — verified ticker-driven Animation[] pattern, integration points for particles
- [Existing codebase: TilePool.ts] — verified object pool pattern for reuse

### Tertiary (LOW confidence)
- PixiJS 8 Graphics API surface — training knowledge, not directly verified via Context7 (pixijs.com/8.x returned 404)
- Device performance detection heuristics — training knowledge of common patterns, confirmed reasonable by web.dev guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `vite-plugin-pwa` verified via npm registry + official docs; localStorage is built-in; PixiJS already installed
- Architecture: HIGH — patterns verified against existing codebase (GameScreen Animation[], TilePool pattern, AudioManager singleton)
- Pitfalls: MEDIUM — localStorage jank and particle GC pressure are well-documented; PWA icon requirements verified via docs; some PixiJS 8 specifics are from training knowledge
- Performance: MEDIUM — detection heuristic is a standard pattern but not tested on target hardware yet

**Research date:** 2026-07-05
**Valid until:** 2026-08-05 (30 days — stable domain)



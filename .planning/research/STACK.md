# Technology Stack

**Project:** Vita Mahjong
**Researched:** 2026-07-04
**Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **PixiJS** | `^8.19.0` | 2D WebGL/WebGPU rendering engine | The dominant lightweight 2D renderer for browser games. Handles ~150 tile sprites, layered z-ordering, touch events, particle effects, and alpha blending far better than DOM or Canvas 2D at 60 fps on mid/low-end phones. WebGL fallback to Canvas 2D is automatic for very old devices. |
| **TypeScript** | `^5.7.0` (via Vite) | Type-safe game logic | Catches tile-state, level-data, and event-shape bugs early. Vite compiles it with zero-config. |

### Build & Dev Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vite** | `^8.1.3` | Dev server, bundler, production build | Fast HMR, first-class TypeScript/ESM, tree-shaking, and easy output to a static `dist/` that can be wrapped by Capacitor or a mini-game adapter. `v8.1.3` is the current latest release (Jul 2026). |
| **npm** / **pnpm** | latest LTS | Package manager | Either works; pnpm is slightly faster and saves disk space. |

### Audio

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **howler.js** | `^2.2.3` | Sound effects and background music | Abstracts the Web Audio API / HTML5 Audio split, solves iOS Safari auto-play policy and audio context suspension, and provides sprite-based SFX with a tiny (~7 kB gzipped) footprint. |

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Zustand** | `^5.0.14` | Global game state store | Minimal (~1 kB), TypeScript-friendly, and avoids the boilerplate of Redux or MobX for a single-player game. Holds level progress, settings, undo/hint state, and UI route. |

### Native App Wrapper

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Capacitor** | `^8.4.1` | Wrap web build as iOS/Android native app | Drop-in wrapper for a Vite `dist/` folder; no React/Angular/Ionic required. Gives native splash screen, icons, and access to haptics/storage if needed later. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **PixiJS ParticleContainer** | bundled with PixiJS | Batch-rendered tile-shatter / match sparkles | Use when visual effects are enabled; skip entirely on low-end devices by reading `navigator.hardwareConcurrency` / FPS heuristics. |
| **Vite PWA plugin** | `^0.21.0` | Service worker + manifest for mobile web install | Use if the primary distribution channel is mobile web rather than app stores. |
| **微信小游戏适配器 (WeChat Mini-Game Adapter)** | official SDK | Bridge file system, audio, canvas, and storage to WeChat mini-game runtime | Use only if a WeChat mini-game build is required; the core HTML5 build stays unchanged. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Rendering engine | PixiJS `^8.19.0` | Phaser `^4.2.0` | Phaser is a full game framework (scenes, physics, input, audio) and excellent for complex games, but it is heavier and more opinionated. Mahjong Solitaire needs only sprites, touch, and tweens — PixiJS gives full control with a smaller bundle and less lock-in. |
| Rendering engine | PixiJS `^8.19.0` | DOM/CSS | DOM cannot efficiently express 7-layer tile stacking, real-time z-sorting, and 150 simultaneous transforms/particles. It also couples layout to CSS in ways that hurt deterministic game rendering. |
| Rendering engine | PixiJS `^8.19.0` | Raw Canvas 2D | Canvas 2D is simple and universally supported, but alpha blending, particle overdraw, and large sprite counts drain the CPU on low-end phones. PixiJS batches draw calls via WebGL and falls back to Canvas 2D automatically. |
| Native wrapper | Capacitor `^8.4.1` | Cordova | Cordova is in maintenance mode; Capacitor is the Ionic-backed successor with better plugin model and modern tooling. |
| Native wrapper | Capacitor `^8.4.1` | Tauri / Electron | Tauri and Electron target desktop primarily; Capacitor is purpose-built for iOS/Android and lighter for a simple game. |
| State management | Zustand `^5.0.14` | Vanilla custom store | A custom observable store is viable and has zero deps, but Zustand adds only ~1 kB and gives predictable devtools integration and TypeScript ergonomics. |
| Animation | PixiJS Ticker + small custom tween helpers | GSAP 3 | GSAP is powerful but overkill for slide/scale/fade tweens. Custom tween helpers tied to PixiJS `Ticker` keep bundle size tiny and avoid a paid/commercial license in some use cases. |

## Rendering Decision: PixiJS over DOM/Canvas 2D

For Vita Mahjong the renderer must:

1. Draw up to 128–150 tiles with correct occlusion (7 layers).
2. Animate selected, matched, and eliminated tiles at 60 fps.
3. Show optional particle/sparkle feedback without dropping frames on low-end devices.
4. Handle single-finger touch with accurate hit-testing on irregular tile bounds.

PixiJS satisfies all four: its scene graph gives explicit z-ordering, its WebGL batcher handles hundreds of sprites on budget phones, `ParticleContainer` is designed for burst effects, and its event system supports precise pointer/touch hit tests. DOM and Canvas 2D each fail at least one of these requirements at scale.

## Installation

```bash
# Core
npm install pixi.js@^8.19.0 howler@^2.2.3 zustand@^5.0.14

# Dev / build
npm install -D vite@^8.1.3 typescript@^5.7.0

# Optional native wrapper
npm install -D @capacitor/cli@^8.4.1 @capacitor/core@^8.4.1
npm install -D @capacitor/ios@^8.4.1 @capacitor/android@^8.4.1

# Optional PWA output
npm install -D vite-plugin-pwa@^0.21.0
```

## Build Targets

| Target | Command / Step | Notes |
|--------|----------------|-------|
| Mobile web | `npm run build` → serve `dist/` | Vite emits a static site. Add the PWA plugin for installability. |
| iOS/Android native | `npm run build && npx cap sync && npx cap open ios/android` | Capacitor consumes `dist/`; no native code needed for the MVP. |
| WeChat mini-game | Build `dist/` then apply WeChat canvas/storage/audio adapter | Keep the core engine renderer-agnostic enough that only the bootstrap file changes. |

## Performance & Degradation Notes

- **Low-end fallback**: Detect via `navigator.hardwareConcurrency <= 4` or dropped-frame heuristics, then disable `ParticleContainer` and reduce match animations to simple alpha fade.
- **Texture size**: Use a single spritesheet/atlas for tile faces to minimize WebGL texture binds. PixiJS `Assets` loader supports texture atlases.
- **Battery/heat**: Cap the ticker to 60 fps; PixiJS `ticker.maxFPS = 60` prevents unnecessary GPU work.
- **Audio**: Initialize Howler only after the first user gesture to satisfy mobile browser autoplay policies.

## Sources

- PixiJS v8.x docs and release `v8.19.0`: https://pixijs.com/8.x/guides/getting-started/intro, https://github.com/pixijs/pixijs/releases/tag/v8.19.0 — **HIGH confidence**
- Phaser release `v4.2.0`: https://github.com/phaserjs/phaser/releases/tag/v4.2.0 — **HIGH confidence**
- Vite release `v8.1.3`: https://vitejs.dev, https://github.com/vitejs/vite/releases/tag/v8.1.3 — **HIGH confidence**
- howler.js `v2.2.3`: https://howlerjs.com — **HIGH confidence**
- Capacitor release `8.4.1`: https://capacitorjs.com, https://github.com/ionic-team/capacitor/releases/tag/8.4.1 — **HIGH confidence**
- Zustand release `v5.0.14`: https://github.com/pmndrs/zustand/releases/tag/v5.0.14 — **HIGH confidence**
- WeChat Mini-Game engine adaptation guide: https://developers.weixin.qq.com/minigame/dev/guide/ — **HIGH confidence**

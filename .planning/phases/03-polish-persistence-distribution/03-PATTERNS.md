# Phase 03: Polish, Persistence & Distribution - Pattern Map

**Mapped:** 2026-07-05
**Files analyzed:** 12 (4 new, 8 modified)
**Analogs found:** 10 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/persistence.ts` | utility | CRUD (localStorage read/write) | `src/app/config.ts` (export pattern) + `src/audio/AudioManager.ts` (singleton init pattern) | role-match |
| `src/app/performance.ts` | utility | request-response (one-time check) | `src/app/config.ts` (simple named export module) | role-match |
| `src/renderer/effects/ParticleBurst.ts` | component (visual effect) | event-driven (ticker + pool) | `src/renderer/effects/ScoreFloater.ts` (ticker-updated visual) + `src/renderer/pools/TilePool.ts` (object pool) | exact |
| `src/app/App.ts` (MODIFY) | controller | request-response | Already exists — `src/app/App.ts` lines 11-91 | self |
| `src/app/config.ts` (MODIFY) | config | constants | Already exists — `src/app/config.ts` lines 1-47 | self |
| `src/renderer/screens/GameScreen.ts` (MODIFY) | controller | event-driven (ticker + input) | Already exists — `src/renderer/screens/GameScreen.ts` lines 23-28 (Animation interface), lines 351-357 (particle integration point) | self |
| `src/renderer/screens/SettingsScreen.ts` (MODIFY) | component (screen) | event-driven (UI interaction) | `src/renderer/components/FailurePopup.ts` (confirmation dialog pattern) | exact |
| `src/audio/AudioManager.ts` (MODIFY) | service | event-driven | Already exists — singleton getter/setter pattern lines 73-78, 316-358 | self |
| `vite.config.ts` (MODIFY) | config | build-time | Already exists — `vite.config.ts` lines 1-18 | self |
| `public/icons/icon-192.png` | static asset | file-I/O (generated) | `tools/generate-assets.ts` (programmatic PNG generation) | role-match |
| `public/icons/icon-512.png` | static asset | file-I/O (generated) | `tools/generate-assets.ts` (programmatic PNG generation) | role-match |

## Pattern Assignments

### `src/app/persistence.ts` (utility, CRUD — NEW)

**Analog:** `src/app/config.ts` (lines 1-47) for named-export module pattern + `src/audio/AudioManager.ts` (lines 73-78) for singleton getter pattern

**Module export pattern** (from `config.ts` lines 1-2, 49):
```typescript
export const config = {
  // typed config object
};
export type Config = typeof config;
```

**Audio settings interface pattern** (from `AudioManager.ts` lines 73-78, 316-358):
```typescript
static getInstance(): AudioManager { ... }
getSfxVolume(): number { return this.sfxVolume; }
getBgmVolume(): number { return this.bgmVolume; }
isSfxMuted(): boolean { return this.sfxMuted; }
isBgmMuted(): boolean { return this.bgmMuted; }
```

**Core persistence pattern** (from RESEARCH.md, lines 300-325):
```typescript
// Named exports, no class wrapper needed — five keys total
const KEY_LEVEL = 'vita-mahjong:currentLevel';
const KEY_AUDIO = 'vita-mahjong:audio';
// defaults from config.audio.sfxDefaultVolume / bgmDefaultVolume

export function loadLevel(): number { ... }
export function saveLevel(level: number): void { ... }
export function loadAudio(): AudioSettings { ... }
export function saveAudio(settings: AudioSettings): void { ... }
export function resetLevel(): void { localStorage.removeItem(KEY_LEVEL); }
```

**Error handling pattern** (from App.ts lines 4-7):
```typescript
// No try/catch for localStorage itself — it's a browser built-in that doesn't throw in normal use.
// The caller (App.ts) uses try/catch around async initialization (lines 3-7 in main.ts).
```

---

### `src/app/performance.ts` (utility, one-time check — NEW)

**Analog:** `src/app/config.ts` (lines 1-47) for named-export const pattern

**Module export pattern** (from `config.ts` lines 1-2):
```typescript
// Single export, no class wrapper
export function isLowEndDevice(): boolean {
  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 4;
  if (dpr < 2 && cores < 4) return true;
  if (dpr < 2) return true;
  return false;
}
```

---

### `src/renderer/effects/ParticleBurst.ts` (component/visual effect, event-driven — NEW)

**Primary analog:** `src/renderer/effects/ScoreFloater.ts` (lines 1-45)
**Secondary analog:** `src/renderer/pools/TilePool.ts` (lines 1-48)
**Tertiary analog:** `src/renderer/components/ComboFeedback.ts` (lines 1-57)

**Imports pattern** (from ScoreFloater.ts line 1-2):
```typescript
import { Container, Text, type Ticker } from 'pixi.js';
import { config } from '../../app/config';
```
→ ParticleBurst will use `Container, Graphics, type Ticker`.

**Object pool pattern** (from TilePool.ts lines 8-48):
```typescript
export class TilePool {
  private readonly idle: TileSprite[] = [];
  private readonly active = new Set<TileSprite>();
  private allocated = 0;

  obtain(stone: Stone, theme: ThemeId, parent?: Container): TileSprite {
    let tile = this.idle.pop();
    if (!tile) {
      if (this.allocated >= TILE_POOL_ACTIVE_TILE_BUDGET) throw new Error(...);
      tile = new TileSprite();
      this.allocated += 1;
    }
    tile.setStone(stone, theme);
    this.active.add(tile);
    parent?.addChild(tile);
    return tile;
  }

  free(tile: TileSprite): void {
    if (!this.active.delete(tile)) return;
    tile.parent?.removeChild(tile);
    tile.resetForPool();
    this.idle.push(tile);
  }
}
```
→ ParticleBurst uses this pattern for `Graphics` objects in a `ParticlePool` with static `BUDGET = 40`.

**Ticker-driven update pattern** (from ScoreFloater.ts lines 31-43):
```typescript
update(ticker: Ticker): void {
  for (let index = this.floaters.length - 1; index >= 0; index -= 1) {
    const floater = this.floaters[index];
    floater.elapsedMs += ticker.deltaMS;
    const progress = Math.min(floater.elapsedMs / 800, 1);
    floater.text.position.set(floater.startX, floater.startY - 60 * progress);
    floater.text.alpha = 1 - progress;
    if (progress >= 1) {
      floater.text.parent?.removeChild(floater.text);
      this.floaters.splice(index, 1);
    }
  }
}
```

**ComboFeedback show/self-contained pattern** (from ComboFeedback.ts lines 21-28):
```typescript
show(combo: number): void {
  if (combo < 2) return;
  this.comboText.text = `Combo x${combo}`;
  this.elapsedMs = 0;
  this.alpha = 1;
  this.scale.set(0.2);
  this.visible = true;
}
```

**ParticleBurst integration: emit() signature** (from RESEARCH.md lines 386-400):
```typescript
emit(midX: number, midY: number, isLowEnd: boolean): void {
  // obtain N particles from pool (N = isLowEnd ? 8-10 : 15-20)
  // set vx, vy for circular scatter with gravity
  // push to internal active array for update() loop
}
```

**GameScreen Animation interface** — ParticleBurst can follow this for its ticker integration (from GameScreen.ts lines 23-28):
```typescript
interface Animation {
  elapsedMs: number;
  durationMs: number;
  update: (progress: number) => void;
  complete: () => void;
}
```
→ Particles managed via `update(ticker)` method called from GameScreen's tick loop, similar to ScoreFloater. Alternatively, a single Animation object in GameScreen's `animations[]` array that manages many particle sprites internally.

---

### `src/app/App.ts` (controller — MODIFY)

**Analog:** Self — existing file `src/app/App.ts` (lines 1-92)

**Imports to ADD** (follow existing import pattern lines 1-9):
```typescript
import { saveLevel, loadLevel } from './persistence';
import { isLowEndDevice } from './performance';
```

**currentLevel init from persistence** (modify line 11):
```typescript
// BEFORE:
let currentLevel = 1;
// AFTER:
let currentLevel = loadLevel();
const lowEndDevice = isLowEndDevice();
```

**WIN handler persistence write** (modify lines 67-74):
```typescript
// INSERT after line 71 (currentLevel = stats.nextLevel):
saveLevel(currentLevel);
```

**AudioManager persistence init** (lines 86-91 startLevel function):
```typescript
// Existing pattern: AudioManager.getInstance().init() called on first gesture
// Add after init: restore saved audio settings
await AudioManager.getInstance().init();
// AudioManager.init() itself reads from persistence
```

**Pass isLowEndDevice to GameScreen** (GameScreenOptions interface line 18-21):
```typescript
export interface GameScreenOptions {
  ticker?: Ticker;
  onBack?: () => void;
  isLowEndDevice?: boolean;  // NEW
}
```

---

### `src/app/config.ts` (config — MODIFY)

**Analog:** Self — existing file `src/app/config.ts` (lines 1-47)

**Add particle config** (follow existing nested object pattern from lines 6-18):
```typescript
particles: {
  highCount: 18,     // normal: 15-20 → midpoint 18
  lowCount: 9,       // low-end: 8-10 → midpoint 9
  burstDurationMs: 500,
  minSpeed: 0.8,
  maxSpeed: 2.5,
  gravity: 0.15,
  colors: [0xF5D78E, 0xD4A574, 0xC0392B, 0x2E8B57], // accent, secondary, destructive, tileSide
},
```

**Add persistence config** (follow existing flat object pattern from lines 31-46):
```typescript
persistence: {
  keyPrefix: 'vita-mahjong:',
},
```

---

### `src/renderer/screens/GameScreen.ts` (controller — MODIFY)

**Analog:** Self — existing file `src/renderer/screens/GameScreen.ts` (lines 1-504)

**ParticleBurst import** (follow existing import pattern lines 1-16):
```typescript
import { ParticleBurst } from '../effects/ParticleBurst';
// Add to class fields after scoreFloater (line 79):
private readonly particleBurst: ParticleBurst;
// Init in constructor after scoreFloater (line 119-121):
this.particleBurst = new ParticleBurst(isLowEndDevice);
this.addChild(this.particleBurst);
// Add to tick loop (line 96, after scoreFloater.update):
this.particleBurst.update(ticker);
```

**Integration point in finishTapResult** (lines 351-357):
```typescript
// BEFORE (lines 351-354):
if (result.matched && result.removed.length >= 2) {
  this.tray.playMatchRemoval(result.removed, targetSlotIndex, this.level.theme, this.ticker, finalize);
  return;
}
// AFTER: insert particle burst between scoreFloater.show() (line 334) and tray.playMatchRemoval:
if (result.matched && result.removed.length >= 2) {
  // Compute midpoint from removed stones' board positions
  const pos1 = this.toBoardPosition(result.removed[0]);
  const pos2 = this.toBoardPosition(result.removed[1]);
  const midX = this.boardLayer.x + (pos1.x + pos2.x) / 2 * this.boardLayer.scale.x;
  const midY = this.boardLayer.y + (pos1.y + pos2.y) / 2 * this.boardLayer.scale.y;
  this.particleBurst.emit(midX, midY);
  this.tray.playMatchRemoval(result.removed, targetSlotIndex, this.level.theme, this.ticker, finalize);
  return;
}
```

**Animation interface** (lines 23-28) — used by ParticleBurst.update() via ticker loop:
```typescript
// ParticleBurst.update(ticker) called in tick() alongside scoreFloater.update(ticker)
```

---

### `src/renderer/screens/SettingsScreen.ts` (component/screen — MODIFY)

**Analog for confirmation dialog:** `src/renderer/components/FailurePopup.ts` (lines 1-77)

**Confirmation dialog pattern** (from FailurePopup.ts lines 14-64):
```typescript
// Overlay + panel + heading + button structure:
constructor() {
  super();
  this.visible = false;
  this.alpha = 0;
  this.eventMode = 'static';
  this.hitArea = new Rectangle(0, 0, config.designWidth, config.designHeight);

  // Semi-transparent dark overlay
  const overlay = new Sprite(requireTexture('bg_result'));
  overlay.width = config.designWidth;
  overlay.height = config.designHeight;
  overlay.alpha = 0.62;
  overlay.eventMode = 'static';
  this.addChild(overlay);

  // Panel background (tinted rect or sprite)
  const panel = new Sprite(requireTexture('btn_circle_brown'));
  panel.anchor.set(0.5);
  panel.position.set(config.designWidth / 2, config.designHeight * 0.47);
  panel.width = 620;
  panel.height = 430;
  panel.tint = 0x4a2c21;
  this.addChild(panel);

  // Heading text centered
  const heading = new Text({ ... });
  heading.anchor.set(0.5);
  heading.position.set(config.designWidth / 2, ...);
  this.addChild(heading);

  // Action button
  const button = new Button({
    textureKey: 'btn_green_capsule',
    label: '确认重置',
    onTap: () => this.emit(/* event */),
  });
  button.position.set(config.designWidth / 2, ...);
  this.addChild(button);
}

show(): void { this.visible = true; this.alpha = 1; }
hide(): void { this.visible = false; this.alpha = 0; }
```

**Reset button integration** (follow existing SettingsScreen pattern for Button placement):
```typescript
// In SettingsScreen constructor, add after footer (line 226):
const resetButton = new Button({
  textureKey: 'btn_wooden_capsule',
  label: '重置进度',
  width: 380,
  height: 100,
  fontSize: 32,
  textColor: config.colors.destructive,
  onTap: () => this.resetConfirmDialog.show(),
});
resetButton.position.set(config.designWidth / 2, config.designHeight * 0.72);
this.addChild(resetButton);
```

**Font style pattern** (from SettingsScreen.ts lines 29-38 for Text style):
```typescript
fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
fontSize: 42,
fontWeight: '800',
fill: config.colors.accent,
stroke: { color: 0x29170b, width: 4 },
```

---

### `src/audio/AudioManager.ts` (service — MODIFY)

**Analog:** Self — existing file `src/audio/AudioManager.ts` (lines 1-359)

**Singleton pattern** (lines 73-78):
```typescript
static getInstance(): AudioManager {
  if (!AudioManager.instance) {
    AudioManager.instance = new AudioManager();
  }
  return AudioManager.instance;
}
```

**Getter/Setter pattern for persistence bridge** (lines 316-358):
```typescript
getSfxVolume(): number { return this.sfxVolume; }
getBgmVolume(): number { return this.bgmVolume; }
isSfxMuted(): boolean { return this.sfxMuted; }
isBgmMuted(): boolean { return this.bgmMuted; }
setSfxVolume(v: number): void { ... }
setBgmVolume(v: number): void { ... }
```

**Init from persistence** — add after `this.initialized = true;` (line 97):
```typescript
// Restore saved audio settings
import { loadAudio } from '../app/persistence';  // top of file
// in init():
const saved = loadAudio();
this.setSfxVolume(saved.sfxVolume);
this.setBgmVolume(saved.bgmVolume);
this.setSfxMuted(saved.sfxMuted);
this.setBgmMuted(saved.bgmMuted);
```

**Save on change** — add at end of each setter (lines 316-342):
```typescript
// In setSfxVolume, setBgmVolume, setSfxMuted, setBgmMuted after setting the value:
import { saveAudio } from '../app/persistence';  // top of file
// In each setter, add:
saveAudio({
  sfxVolume: this.sfxVolume,
  bgmVolume: this.bgmVolume,
  sfxMuted: this.sfxMuted,
  bgmMuted: this.bgmMuted,
});
```
→ Wait — this would save on every slider drag. Use debounce: only `saveAudio` in `setSfxMuted`/`setBgmMuted` (instant toggle = one write). For volume sliders, save on pointerup. The SettingsScreen Slider's `onChange` fires on every drag position, but `saveAudio` should be called only on `pointerup` in the Slider component, or via a debounced `saveAudio` call.

**Better pattern:** Persistence writes go through the SettingsScreen callbacks, not AudioManager itself. The `onChange` in SettingsScreen lines 69/150 calls `audio.setSfxVolume(v)` — the persistence save happens separately in `onPointerUp` of the Slider or in a `saveOnRelease` callback.

---

### `vite.config.ts` (config — MODIFY)

**Analog:** Self — existing file `vite.config.ts` (lines 1-18)

**Import pattern** (from existing line 1):
```typescript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
```

**Plugin config pattern** (from RESEARCH.md lines 421-458):
```typescript
export default defineConfig({
  root: '.',
  publicDir: 'public',
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
            options: { cacheName: 'level-data', expiration: { maxEntries: 25 } },
          },
        ],
      },
    }),
  ],
  build: { outDir: 'dist', sourcemap: true },
  server: { host: '127.0.0.1', port: 5173 },
  test: { globals: true, environment: 'node' },
});
```

---

### PWA Icons (`public/icons/icon-192.png`, `public/icons/icon-512.png` — NEW static assets)

**Analog:** `tools/generate-assets.ts` (lines 1-434) — programmatic PNG generation

**Asset generation function pattern** (from generate-assets.ts lines 413-434):
```typescript
function generateAssets(): void {
  mkdirSync(TEXTURE_DIR, { recursive: true });
  save('bg_home', bgHome());
  save('bg_game', bgGame());
  // ... each asset is a function returning a Canvas { width, height, data: Uint8Array }
}
```

**PWA icon strategy:** Either extend `tools/generate-assets.ts` to add `iconApp192()` and `iconApp512()` functions, or create static PNGs. The existing pattern is programmatic via `canvas()`, `circle()`, `rect()`, `drawText()`, `roundedRect()` helper functions (lines 68-248).
```typescript
function iconApp(size: number): Canvas {
  const image = canvas(size, size, hex(palette.gameBg));
  const center = size / 2;
  const tileSize = size * 0.35;
  // Draw a simplified tile shape as app icon
  roundedRect(image, center - tileSize/2, center - tileSize*0.8, tileSize, tileSize*1.6, tileSize*0.15, hex(palette.tileFace));
  roundedRect(image, center - tileSize/2, center + tileSize*0.55, tileSize, tileSize*0.25, tileSize*0.08, hex(palette.tileSide));
  return image;
}
```

**Icons directory:** Create `public/icons/` alongside existing `public/assets/` and `public/levels/`.

---

## Shared Patterns

### 1. Tick + Animation System
**Source:** `src/renderer/screens/GameScreen.ts` lines 23-28 (Animation interface), lines 81-97 (tick loop), lines 359-370 (updateAnimations)
**Apply to:** ParticleBurst (via `update(ticker)` called in tick loop), ScoreFloater, ComboFeedback
```typescript
// Animation interface used across all visual effects:
interface Animation {
  elapsedMs: number;
  durationMs: number;
  update: (progress: number) => void;
  complete: () => void;
}
// All effects get update(ticker: Ticker): void called from GameScreen's tick loop (line 96-97):
this.comboFeedback.update(ticker);
this.scoreFloater.update(ticker);
// NEW: this.particleBurst.update(ticker);
```

### 2. Container Extension + show/hide
**Source:** `src/renderer/components/ComboFeedback.ts` lines 4-28, `src/renderer/components/FailurePopup.ts` lines 14-76
**Apply to:** ParticleBurst, SettingsScreen reset confirmation dialog
```typescript
// Pattern: extend Container, manage visible/alpha, use show()/hide():
export class Xxx extends Container {
  constructor() { super(); this.visible = false; /* build children */ }
  show(): void { this.visible = true; this.alpha = 1; }
  hide(): void { this.visible = false; this.alpha = 0; }
  update(ticker: Ticker): void { if (!this.visible) return; /* ... */ }
}
```

### 3. PixiJS 8 Text Style + Font Stack
**Source:** `src/renderer/screens/SettingsScreen.ts` lines 29-38, `src/renderer/components/HomeScreen.ts` lines 82-91
**Apply to:** All UI text (reset confirmation dialog heading/body, etc.)
```typescript
fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
fontSize: 42,
fontWeight: '800',
fill: config.colors.accent,
stroke: { color: 0x29170b, width: 4 },
align: 'center',
```

### 4. requireTexture Utility
**Source:** `src/renderer/components/FailurePopup.ts` lines 6-12, `src/renderer/screens/HomeScreen.ts` lines 6-12
**Apply to:** SettingsScreen reset confirmation dialog (for panel/overlay textures)
```typescript
function requireTexture(key: AssetKey): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) { throw new Error(`Texture "${key}" has not been loaded`); }
  return texture;
}
```

### 5. Event Emission Pattern (Custom Events)
**Source:** `src/renderer/components/FailurePopup.ts` line 15 (`static readonly RESTART = 'restart'`), line 61 (`this.emit(FailurePopup.RESTART)`); `src/renderer/screens/HomeScreen.ts` lines 32-33
**Apply to:** SettingsScreen reset confirmation dialog
```typescript
// Define static event name constants
static readonly CONFIRM_RESET = 'confirm-reset';
static readonly CANCEL_RESET = 'cancel-reset';
// Emit on button tap
onTap: () => this.emit(ResetDialog.CONFIRM_RESET),
```

### 6. config.ts Central Constants
**Source:** `src/app/config.ts` lines 1-47
**Apply to:** All new files (particle params, persistence keys, PWA config)
```typescript
// Pattern: nested config objects under a single typed export
export const config = {
  particles: { ... },
  persistence: { ... },
};
```

### 7. Singleton Pattern (if needed)
**Source:** `src/audio/AudioManager.ts` lines 73-78
**Apply to:** NOT needed for persistence/performance — use plain named exports instead. Singleton only if ParticleBurst needs global access.
```typescript
// Only used for AudioManager; persistence.ts uses plain functions
static getInstance(): AudioManager { ... }
```

### 8. Vitest Test Pattern
**Source:** `src/__tests__/renderer-budget.test.ts` lines 1-18, `src/__tests__/GameState.test.ts` lines 1-4
**Apply to:** Tests for `persistence.ts` and `performance.ts`
```typescript
import { describe, expect, it } from 'vitest';
// Example structure:
describe('persistence', () => {
  it('loadLevel returns 1 when no data saved', () => { ... });
  it('saveLevel and loadLevel round-trip', () => { ... });
});
```

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | All files have good analogs in the existing codebase |

All new files have clear analogs. The only novel integration is `vite-plugin-pwa`, which follows the Vite plugin config pattern already established in `vite.config.ts` (the plugin is inserted into the `plugins` array in the existing `defineConfig`).

## Metadata

**Analog search scope:** `src/`, `tools/`, `vite.config.ts`
**Files scanned:** 42 source files, 4 test files
**Pattern extraction date:** 2026-07-05

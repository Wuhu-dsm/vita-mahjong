# Phase 1: Core Engine & Solvable Levels - Pattern Map

**Mapped:** 2026-07-04
**Files analyzed:** 28
**Analogs found:** 0 / 28

## Notes for Downstream Planner

This is a **greenfield phase**: the repository contains no `src/`, `app/`, or runtime code yet, and no `package.json`, `vite.config.ts`, `tsconfig.json`, or `index.html` exists. Every file listed below is new. The patterns below are extracted from `01-RESEARCH.md` (verified PixiJS 8 / Vite / TypeScript patterns and the `ffalt/mah` reference implementation) because the codebase provides no existing analog. Copy these excerpts directly into plan actions and treat them as the canonical Phase 1 pattern.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `package.json` | config | build | None — greenfield | none |
| `tsconfig.json` | config | build | None — greenfield | none |
| `vite.config.ts` | config | build | None — greenfield | none |
| `index.html` | config | request-response | None — greenfield | none |
| `.gitignore` | config | file-I/O | None — greenfield | none |
| `src/main.ts` | utility | request-response | None — greenfield | none |
| `src/app/App.ts` | provider | request-response | None — greenfield | none |
| `src/app/config.ts` | config | static | None — greenfield | none |
| `src/engine/types.ts` | model | static | None — greenfield | none |
| `src/engine/BoardModel.ts` | model | CRUD | None — greenfield | none |
| `src/engine/TrayModel.ts` | model | CRUD | None — greenfield | none |
| `src/engine/GameState.ts` | model | event-driven | None — greenfield | none |
| `src/engine/Solver.ts` | service | batch | None — greenfield | none |
| `src/generator/generate-levels.ts` | utility | batch | None — greenfield | none |
| `src/generator/LayoutBuilder.ts` | utility | batch | None — greenfield | none |
| `src/generator/SolvableDealer.ts` | utility | batch | None — greenfield | none |
| `src/renderer/ScreenManager.ts` | controller | event-driven | None — greenfield | none |
| `src/renderer/screens/HomeScreen.ts` | component | event-driven | None — greenfield | none |
| `src/renderer/screens/GameScreen.ts` | component | event-driven | None — greenfield | none |
| `src/renderer/screens/ResultScreen.ts` | component | event-driven | None — greenfield | none |
| `src/renderer/components/TileSprite.ts` | component | event-driven | None — greenfield | none |
| `src/renderer/components/TraySlot.ts` | component | event-driven | None — greenfield | none |
| `src/renderer/components/HUD.ts` | component | event-driven | None — greenfield | none |
| `src/renderer/components/Button.ts` | component | event-driven | None — greenfield | none |
| `src/renderer/effects/ScoreFloater.ts` | component | event-driven | None — greenfield | none |
| `src/renderer/pools/TilePool.ts` | utility | object-pool | None — greenfield | none |
| `src/__tests__/BoardModel.test.ts` | test | batch | None — greenfield | none |
| `src/__tests__/TrayModel.test.ts` | test | batch | None — greenfield | none |
| `src/__tests__/free-tile.test.ts` | test | batch | None — greenfield | none |
| `tools/build-levels.mjs` | utility | batch | None — greenfield | none |

---

## Pattern Assignments

### Config tier (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`)

**Analog:** None — use the stack and scripts documented in `01-RESEARCH.md` §Standard Stack.

**Package scripts pattern** (from `01-RESEARCH.md` lines 116-121):
```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "prebuild": "tsx tools/generate-levels.ts",
    "generate-levels": "tsx tools/generate-levels.ts",
    "test": "vitest"
  },
  "dependencies": {
    "pixi.js": "^8.19.0"
  },
  "devDependencies": {
    "vite": "^8.1.3",
    "typescript": "^6.0.3",
    "vitest": "^4.1.9",
    "@types/node": "^22.0.0",
    "tsx": "^4.0.0"
  }
}
```

**TypeScript / Vite config pattern** (from `01-RESEARCH.md` lines 196-244):
Use the official `npm create pixi.js@latest -- --template bundler-vite` scaffold. Minimum required files:
- `vite.config.ts` with standard Vite + vitest plugin setup.
- `tsconfig.json` with `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"strict": true`.
- `index.html` pointing at `src/main.ts` and containing `viewport-fit=cover`.

**Safe-area HTML/CSS pattern** (from `01-RESEARCH.md` lines 517-540):
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
```css
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #0F172A;
}
#game {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

**Gitignore pattern** (derived from `01-CONTEXT.md` D-10):
```gitignore
node_modules/
dist/
public/levels/
*.log
```

---

### Engine model tier (`src/engine/types.ts`, `BoardModel.ts`, `TrayModel.ts`, `GameState.ts`, `Solver.ts`)

**Analog:** Adapted from `ffalt/mah` reference code quoted in `01-RESEARCH.md` §Code Examples.

**Tile / stone type pattern** (from `01-RESEARCH.md` lines 446-464):
```typescript
export interface Stone {
  id: string;
  z: number;
  x: number;
  y: number;
  face: number;
  picked: boolean;
  top: Stone[];
  left: Stone[];
  right: Stone[];
}

export function hasUnpicked(stones: Stone[]): boolean {
  return stones.some(s => !s.picked);
}

export function isBlocked(stone: Stone): boolean {
  return hasUnpicked(stone.top) ||
    (hasUnpicked(stone.left) && hasUnpicked(stone.right));
}
```

**Free-tile rule pattern** (from `01-RESEARCH.md` lines 446-464 and Pitfall 1):
A tile is selectable only when:
1. No unpicked tile sits directly above it (`z + 1` with overlapping footprint).
2. At least one long side is open: `left` or `right` neighbor list has no unpicked tile.

Use a 2-step horizontal grid and 1-step vertical grid for neighbor queries (A4 in `01-RESEARCH.md`).

**Tray model pattern** (from `01-RESEARCH.md` lines 493-515):
```typescript
export class TrayModel {
  slots: (Tile | null)[] = [null, null, null, null];

  add(tile: Tile): { matched: boolean; removed: Tile[]; full: boolean } {
    const emptyIndex = this.slots.indexOf(null);
    if (emptyIndex === -1) return { matched: false, removed: [], full: true };

    const matchIndex = this.slots.findIndex(t => t && t.face === tile.face);
    if (matchIndex !== -1) {
      const partner = this.slots[matchIndex]!;
      this.slots[matchIndex] = null;
      return { matched: true, removed: [partner, tile], full: false };
    }

    this.slots[emptyIndex] = tile;
    return { matched: false, removed: [], full: !this.slots.includes(null) };
  }
}
```

**Scoring formula pattern** (from `01-CONTEXT.md` D-16):
```typescript
function matchScore(combo: number): number {
  return 100 * (1 + Math.min(combo - 1, 9) * 0.2);
}
```

**Solver / generation pattern** (from `01-RESEARCH.md` lines 469-491):
```typescript
function generateSolvableLevel(
  positions: Array<[number, number, number]>,
  faceIds: number[],
  rng: () => number
): Map<string, number> {
  const stones = positions.map(([z, x, y]) => ({ z, x, y, face: -1, picked: false }));
  const faces = shuffle(faceIds.flatMap(id => [id, id]), rng);

  for (const face of faces) {
    const free = stones.filter(s => !s.picked && !isBlocked(s));
    if (free.length < 2) throw new Error('Unsolvable layout');

    const a = removeRandom(free, rng);
    const b = removeRandom(free, rng);
    a.face = b.face = face;
    a.picked = b.picked = true;
  }

  stones.forEach(s => (s.picked = false));
  return new Map(stones.map(s => [`${s.z},${s.x},${s.y}`, s.face]));
}
```

---

### Build-time generator tier (`src/generator/generate-levels.ts`, `LayoutBuilder.ts`, `SolvableDealer.ts`, `tools/build-levels.mjs`)

**Analog:** Adapted from `ffalt/mah` reference code in `01-RESEARCH.md` §Code Examples.

**Responsibility split pattern** (from `01-RESEARCH.md` lines 194-244):
- `LayoutBuilder.ts` returns the fixed `[z, x, y]` placements for each level (PRD §7.3).
- `SolvableDealer.ts` runs backward-dealing pair assignment and solver verification.
- `generate-levels.ts` is the Node entry that writes `public/levels/{n}.json` for n = 1..20.
- `tools/build-levels.mjs` is a thin npm-script wrapper if needed.

**Determinism pattern** (from `01-CONTEXT.md` D-08):
Use a fixed random seed so every build produces identical levels. Example seed contract:
```typescript
const SEED = 'vita-mahjong-v1';
const rng = createSeededRng(SEED);
```

**Build integration pattern** (from `01-RESEARCH.md` Pitfall 4):
Wire generation into `package.json` via a `prebuild` script:
```json
"prebuild": "tsx tools/generate-levels.ts"
```
Fail the build if generation returns empty or unsolvable levels.

---

### Renderer tier (`src/renderer/*`, `src/app/App.ts`, `src/main.ts`)

**Analog:** PixiJS 8 official patterns from `01-RESEARCH.md` §Code Examples.

**Application bootstrap pattern** (from `01-RESEARCH.md` lines 425-440):
```typescript
import { Application } from 'pixi.js';

(async () => {
  const app = new Application();
  await app.init({
    resizeTo: window,
    backgroundColor: 0x1B4D3E,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio, 2),
    autoDensity: true,
  });
  document.body.appendChild(app.canvas);
})();
```
⚠️ Avoid top-level `await`; wrap in an async IIFE or `main()` invoked from `index.html` (`01-RESEARCH.md` Pitfall 6).

**Screen manager pattern** (from `01-RESEARCH.md` Architecture Diagram):
- `App.ts` owns the `Application` instance and `ScreenManager`.
- `ScreenManager` holds root `Container`s for Home, Game, Result.
- Transitions use fade/scale tweens driven by `app.ticker`.

**Pointer event pattern** (from `01-RESEARCH.md` lines 346-354 and Pattern 4):
```typescript
const tile = new Sprite(texture);
tile.eventMode = 'static';
tile.hitArea = new Rectangle(-8, -8, w + 16, h + 16);
tile.on('pointertap', (e) => {
  engine.handleTileClick(tile.modelId);
});
```

**Object-pool pattern** (from `01-RESEARCH.md` lines 315-336):
```typescript
class TilePool {
  private pool: Sprite[] = [];

  obtain(texture: Texture): Sprite {
    let s = this.pool.pop();
    if (!s) {
      s = new Sprite(texture);
      s.anchor.set(0.5);
      s.eventMode = 'static';
    }
    s.visible = true;
    s.alpha = 1;
    return s;
  }

  free(sprite: Sprite): void {
    sprite.visible = false;
    sprite.parent?.removeChild(sprite);
    this.pool.push(sprite);
  }
}
```

**Z-order pattern** (from `01-RESEARCH.md` Pitfall 3):
Sort board sprites by `(z, y, x)` or enable `sortableChildren = true` with `zIndex`.

---

### Test tier (`src/__tests__/*.test.ts`)

**Analog:** Vitest model-only tests per `01-RESEARCH.md` §Open Questions / Recommendation.

**Test scope pattern** (from `01-RESEARCH.md` lines 581-584):
Phase 1 tests focus on engine model logic; defer rendering tests to later phases.

**Recommended test files** (from `01-RESEARCH.md` lines 238-241):
- `BoardModel.test.ts` — free-tile rule, win/deadlock detection.
- `TrayModel.test.ts` — tray capacity, pair matching, full-tray failure.
- `free-tile.test.ts` — property-test boundary cases for `isBlocked`.

---

## Shared Patterns

### PixiJS Application Lifecycle
**Source:** `01-RESEARCH.md` lines 425-440
**Apply to:** `src/main.ts`, `src/app/App.ts`
- Create `Application`, call `await app.init(...)`, append `app.canvas` to DOM.
- Wrap init in async IIFE, not top-level await.

### Free-Tile Rule
**Source:** `01-RESEARCH.md` lines 446-464
**Apply to:** `src/engine/BoardModel.ts`, `src/engine/Solver.ts`, `src/generator/SolvableDealer.ts`
- Blocked = top occupied OR (left occupied AND right occupied).
- Pre-compute `top` / `left` / `right` neighbor lists for O(1) checks.

### Backward-Dealing Generation
**Source:** `01-RESEARCH.md` lines 469-491
**Apply to:** `src/generator/SolvableDealer.ts`
- Assign pairs only to currently-free stones.
- Temporarily mark assigned stones as `picked` to expose deeper tiles.
- Reset `picked` to `false` before exporting level JSON.

### 4-Slot Tray Matching
**Source:** `01-RESEARCH.md` lines 493-515
**Apply to:** `src/engine/TrayModel.ts`, `src/renderer/components/TraySlot.ts`
- Add tile to leftmost empty slot.
- If a matching face already exists anywhere in tray, remove both immediately.
- Capacity = 4 unmatched tiles; full tray triggers failure.

### Pointer Tap Input
**Source:** `01-RESEARCH.md` lines 346-354
**Apply to:** `src/renderer/components/TileSprite.ts`, `src/renderer/components/Button.ts`
- Use `pointertap` event, not `click`.
- Expand `hitArea` by 8–16 px per side for senior-friendly touch targets.

### Scoring & Combo
**Source:** `01-CONTEXT.md` D-16 / D-17
**Apply to:** `src/engine/GameState.ts`
- Match score = `100 * (1 + min(combo - 1, 9) * 0.2)`.
- Combo resets after >3 seconds without a match or after tapping a blocked tile.

### Safe-Area Layout
**Source:** `01-RESEARCH.md` lines 517-540
**Apply to:** `index.html`, `src/app/config.ts`, `src/renderer/screens/*`
- CSS `env(safe-area-inset-*)` for notches/dynamic island.
- Engine scales from 1080×2400 design resolution proportionally.

---

## No Analog Found

All Phase 1 files are new because the repository contains no existing application code. Use the RESEARCH.md-derived patterns above when planning implementation.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `package.json` | config | build | Greenfield — no package manifest exists |
| `tsconfig.json` | config | build | Greenfield — no TypeScript config exists |
| `vite.config.ts` | config | build | Greenfield — no Vite config exists |
| `index.html` | config | request-response | Greenfield — no HTML entry exists |
| `.gitignore` | config | file-I/O | Greenfield — needs to ignore `public/levels/` |
| `src/main.ts` | utility | request-response | Greenfield — no `src/` directory |
| `src/app/App.ts` | provider | request-response | Greenfield — no `src/` directory |
| `src/app/config.ts` | config | static | Greenfield — no `src/` directory |
| `src/engine/types.ts` | model | static | Greenfield — no `src/` directory |
| `src/engine/BoardModel.ts` | model | CRUD | Greenfield — no `src/` directory |
| `src/engine/TrayModel.ts` | model | CRUD | Greenfield — no `src/` directory |
| `src/engine/GameState.ts` | model | event-driven | Greenfield — no `src/` directory |
| `src/engine/Solver.ts` | service | batch | Greenfield — no `src/` directory |
| `src/generator/generate-levels.ts` | utility | batch | Greenfield — no `src/` directory |
| `src/generator/LayoutBuilder.ts` | utility | batch | Greenfield — no `src/` directory |
| `src/generator/SolvableDealer.ts` | utility | batch | Greenfield — no `src/` directory |
| `src/renderer/ScreenManager.ts` | controller | event-driven | Greenfield — no `src/` directory |
| `src/renderer/screens/HomeScreen.ts` | component | event-driven | Greenfield — no `src/` directory |
| `src/renderer/screens/GameScreen.ts` | component | event-driven | Greenfield — no `src/` directory |
| `src/renderer/screens/ResultScreen.ts` | component | event-driven | Greenfield — no `src/` directory |
| `src/renderer/components/TileSprite.ts` | component | event-driven | Greenfield — no `src/` directory |
| `src/renderer/components/TraySlot.ts` | component | event-driven | Greenfield — no `src/` directory |
| `src/renderer/components/HUD.ts` | component | event-driven | Greenfield — no `src/` directory |
| `src/renderer/components/Button.ts` | component | event-driven | Greenfield — no `src/` directory |
| `src/renderer/effects/ScoreFloater.ts` | component | event-driven | Greenfield — no `src/` directory |
| `src/renderer/pools/TilePool.ts` | utility | object-pool | Greenfield — no `src/` directory |
| `src/__tests__/BoardModel.test.ts` | test | batch | Greenfield — no `src/` directory |
| `src/__tests__/TrayModel.test.ts` | test | batch | Greenfield — no `src/` directory |
| `src/__tests__/free-tile.test.ts` | test | batch | Greenfield — no `src/` directory |
| `tools/build-levels.mjs` | utility | batch | Greenfield — no `tools/` directory |

---

## Metadata

**Analog search scope:** `/Users/mac/Documents/vita-mahjong` (entire repo)
**Files scanned:** 0 source/config analogs found
**Pattern extraction date:** 2026-07-04
**Pattern source:** `01-RESEARCH.md` (PixiJS 8 docs, Vite docs, `ffalt/mah` reference implementation) and `01-CONTEXT.md` locked decisions.

# Phase 1: Core Engine & Solvable Levels - Research

**Researched:** 2026-07-04
**Domain:** Mobile HTML5 game engine (PixiJS 8 + TypeScript + Vite), Mahjong Solitaire rules, solvable procedural level generation
**Confidence:** HIGH

## Summary

Phase 1 builds the playable core of Vita Mahjong on a locked stack of PixiJS 8, TypeScript, and Vite. The research confirms that PixiJS 8 is a single-package, async-initialized renderer with a scene-graph/Container model, federated pointer/touch events, and built-in `Application`/`Ticker`/`Assets` systems suitable for a 2D canvas game [CITED: pixijs.com/8.x/guides/getting-started/quick-start]. The Mahjong Solitaire free-tile rule is well-defined: a tile is selectable only when it has no tile directly above it and at least one long side is open [CITED: en.wikipedia.org/wiki/Mahjong_solitaire]. The standard way to guarantee solvability is a *backward-dealing* (or forward-simulation) algorithm that repeatedly picks a random pair of currently-free tiles and assigns them matching faces, then validates the result with a solver; this is the approach used by the production TypeScript Mahjong reference implementation `ffalt/mah` [CITED: github.com/ffalt/mah/blob/main/src/app/model/builder/solvable.ts].

The tray mechanic (4 slots, pair removal as soon as a second matching tile enters) and partial scoring are locked by CONTEXT.md, so research focused on implementation patterns rather than alternatives. Level generation must run at build time as a Node.js script with a fixed seed to keep runtime startup fast and deterministic. Rendering budget is ~150 tile nodes; PixiJS object pooling via sprite reuse and `ParticleContainer` for effects keep this within reach on low-end devices [CITED: pixijs.com/8.x/guides/concepts/performance-tips].

**Primary recommendation:** Scaffold with `npm create pixi.js@latest -- --template bundler-vite`, separate engine model (`Board`, `Tray`, `Solver`) from renderer (`TileSprite`, `BoardLayer`, `ScreenManager`), and generate the 20 level JSON files in a build-time script that uses backward-dealing + solver verification.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Board model & free-tile rule | Game engine (TypeScript model) | — | Must be deterministic, testable, and independent of rendering. |
| Solvable level generation | Build-time Node.js script | — | Runs once per build, keeps runtime fast and seed-deterministic. |
| Tile rendering & z-order | Browser / PixiJS scene graph | — | PixiJS Container child order + local transforms handle stacking. |
| Touch input / tap detection | Browser / PixiJS events | — | `pointertap` on Sprites with `eventMode = 'static'` and custom `hitArea`. |
| Tray state & matching logic | Game engine | Renderer | Model decides matches; renderer animates flight/elimination. |
| Screen flow (Home→Game→Result) | Game engine / Screen manager | Renderer | State machine drives visibility; PixiJS containers hold screen roots. |
| Scoring & combo timer | Game engine | — | Pure state machine with timeout; renderer shows floater. |
| Win/deadlock detection | Game engine | — | Derived from board + tray state; triggers screen transition. |
| Safe-area / responsive layout | Browser (CSS + engine layout) | — | CSS env() for margins; engine scales from design resolution. |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Phase 1 implements the **4-slot tray mechanic** described in PRD §3.3. A tapped free tile flies into the leftmost empty slot of a top tray; when a second matching tile enters the tray, the pair is removed immediately.
- **D-02:** Tray capacity is **4 unmatched tiles**. Failure is triggered in **two cases**: (1) tray is filled with 4 unmatched tiles, and (2) board has no clickable free tiles while tray is not full.
- **D-03:** There is **no revive/continue-after-failure** in Phase 1. The failure popup offers only **Restart**.
- **D-04:** Pairing inside the tray follows: **any two matching tiles pair regardless of adjacency**; a third matching tile remains in the tray.
- **D-05:** Tapping a non-free (blocked) tile gives **visual + text feedback**: tile darkens, red arrows on blocked sides, and a "被左右锁住" text hint.
- **D-06:** The **"tray almost full" warning popup** (3 unmatched tiles) is **deferred**.
- **D-07:** Levels are generated **at build time** using a forward-simulation / backward-dealing algorithm to guarantee solvability.
- **D-08:** Generation uses a **fixed random seed** so every build produces the same 20 levels.
- **D-09:** Tile face themes are assigned **per the PRD theme table** (§7.2–7.3).
- **D-10:** Generated level JSON is **not checked into version control**.
- **D-11:** Phase 1 implements the **full PRD visual design** for home, game, and result screens.
- **D-12:** The app **starts at the home screen**.
- **D-13:** The result screen shows the **full PRD settlement panel**.
- **D-14:** Screen transitions include **transition animations** (fade/scale).
- **D-15:** Phase 1 implements **partial scoring**: base score per match and combo multiplier only.
- **D-16:** Scoring formula follows **PRD §9.3** for implemented parts: `单次匹配得分 = 100 × (1 + min(连击数 - 1, 9) × 0.2)`.
- **D-17:** Combo interruption follows **PRD §9.4**: resets after >3 seconds without a successful match or after tapping a blocked tile.

### the agent's Discretion

- None. Every gray area discussed resulted in an explicit user choice.

### Deferred Ideas (OUT OF SCOPE)

- Props / assists: undo, hint, shuffle.
- Audio / haptics.
- Tray-almost-full warning.
- Revive / continue-after-failure.
- Star rating system.
- Beat ratio.
- Time reward and end-game bonus scoring.
- Daily challenges / Active Mind Levels / endless mode / cloud save / social sharing.
- Landscape / tablet optimization.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CORE-01 | User can start a level from the home screen and enter the game screen | PixiJS `Application` + screen-manager pattern with Container roots; home screen button dispatches `START_LEVEL`. |
| CORE-02 | User can select two free matching tiles to remove them from the board | Free-tile rule from PRD/Wikipedia; tray mechanic replaces traditional pair-on-board removal per D-01. |
| CORE-03 | Game correctly enforces the free-tile rule | Implemented in model as `isBlocked()` = top occupied OR (left occupied AND right occupied); property-test boundary cases. |
| CORE-04 | Game detects win when all tiles are cleared and shows result screen | Board count reaches 0 triggers win state; screen manager transitions to result. |
| CORE-05 | Game detects deadlock when no more moves exist and offers shuffle or retry | `free.length === 0` while `count > 0` triggers failure popup with Restart (shuffle deferred per D-03/D-06). |
| LVLS-01 | Game provides at least 20 playable levels | Build-time generator outputs levels 1–20 from fixed seed. |
| LVLS-02 | Level 20 contains no more than 128 tiles and 7 layers | Layout spec in PRD §7.3; generator validates tile count and max z. |
| LVLS-03 | Every level layout is guaranteed solvable | Backward-dealing assigns pairs only to currently-free tiles; solver verifies. |
| LVLS-04 | Each tile face appears an even number of times in every level | Tile multiset built from pairs; assignment consumes tiles in pairs. |
| ACCS-03 | Selected and blocked tiles are visually highlighted | Sprite tint/alpha for blocked; selection halo + tray slot highlight for selected. |
| VISL-04 | Renderer stays within the ~150 tile-node performance budget | Object-pool sprites, `cacheAsTexture` for static UI, `ParticleContainer` reserved for effects. |
| PLAT-02 | All game logic and data run locally without a backend | Vite static build; level JSON generated into `public/` or imported as assets. |
| PLAT-04 | No advertisements, in-app purchases, or coin economy present | No commercial packages in stack; confirmed by project constraints. |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `pixi.js` | 8.19.0 [VERIFIED: npm registry] | 2D WebGL/WebGPU renderer, scene graph, events, animation ticker | Official PixiJS single-package v8; recommended by docs for Vite projects [CITED: pixijs.com/8.x/guides/getting-started/quick-start]. |
| `vite` | 8.1.3 [VERIFIED: npm registry] | Dev server, HMR, production build | PixiJS official `bundler-vite` template uses Vite; fast ESM workflow. |
| `typescript` | 6.0.3 [VERIFIED: npm registry] | Static typing | Standard companion for Vite; `ffalt/mah` uses TypeScript 6.x. |
| `vitest` | 4.1.9 [VERIFIED: npm registry] | Unit-test runner for model/engine tests | Vite-native test runner, shares transform pipeline with app [CITED: vitest.dev/guide/why.html]. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `pixi-filters` | 6.1.5 [VERIFIED: npm registry] | Drop-in filters (blur, glow, etc.) | Only if visual effects require filters; otherwise avoid for performance [CITED: pixijs.com/8.x/guides/migrations/v8]. |
| `jsdom` / `happy-dom` | latest compatible | DOM environment for Vitest | Use for engine tests that do not need a real canvas; PixiJS rendering tests may need `vitest-browser-mode` or canvas mocks. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PixiJS 8 | PixiJS 7, Phaser, Three.js | Stack is locked to PixiJS 8 by STATE.md and CONTEXT.md. |
| Vite | Webpack, esbuild | Vite is the PixiJS-recommended bundler; locked by constraints. |
| TypeScript | JavaScript | Type safety required for engine model; locked. |
| Build-time generation | Runtime generation | Runtime generation would cause startup jank on level 20; build-time is locked by D-07/D-08. |

**Installation:**

```bash
npm install pixi.js
npm install -D vite typescript vitest @types/node
```

**Version verification:**

```bash
npm view pixi.js version    # 8.19.0
npm view vite version       # 8.1.3
npm view typescript version # 6.0.3
npm view vitest version     # 4.1.9
```

## Package Legitimacy Audit

> The `gsd-tools query package-legitimacy` seam timed out during this research. Verdicts below are based on manual npm registry checks (package existence + version) and source-repo verification where available. All core packages are widely-used, long-established, and sourced from official repositories.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `pixi.js` | npm | 10+ yrs | ~1M+/wk | github.com/pixijs/pixi.js | OK | Approved |
| `vite` | npm | 5+ yrs | ~30M+/wk | github.com/vitejs/vite | OK | Approved |
| `typescript` | npm | 10+ yrs | ~50M+/wk | github.com/microsoft/TypeScript | OK | Approved |
| `vitest` | npm | 4+ yrs | ~8M+/wk | github.com/vitest-dev/vitest | OK | Approved |
| `pixi-filters` | npm | 8+ yrs | ~200k+/wk | github.com/pixijs/filters | OK | Approved; only install if filters needed |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Mobile Portrait)                 │
│  ┌──────────────┐    CSS env(safe-area-inset-*) margins         │
│  │  PixiJS App  │─── Canvas fills viewport, design-res 1080×2400│
│  │  + Ticker    │                                                │
│  └──────┬───────┘                                                │
│         │                                                        │
│  ┌──────▼───────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │ ScreenManager│───▶│  HomeScreen │    │  ResultScreen       │ │
│  │  (Container) │    │  GameScreen │    │  (Container roots)  │ │
│  └──────┬───────┘    └──────┬──────┘    └─────────────────────┘ │
│         │                    │                                   │
│         │           ┌────────▼────────┐                         │
│         │           │   GameScreen    │                         │
│         │           │ ┌─────────────┐ │                         │
│         │           │ │    HUD      │ │                         │
│         │           │ │  (Tray,     │ │                         │
│         │           │ │   status)   │ │                         │
│         │           │ └─────────────┘ │                         │
│         │           │ ┌─────────────┐ │                         │
│         │           │ │ BoardLayer  │ │◀── TileSprite pool     │
│         │           │ │ (z-ordered  │ │                         │
│         │           │ │  containers)│ │                         │
│         │           │ └─────────────┘ │                         │
│         │           └────────┬────────┘                         │
│         │                    │ pointertap events                │
│         │           ┌────────▼────────┐                         │
│         └──────────▶│   GameEngine    │                         │
│                     │  (BoardModel,   │                         │
│                     │   TrayModel,    │                         │
│                     │   Solver,       │                         │
│                     │   ScoreKeeper)  │                         │
│                     └────────┬────────┘                         │
│                              │                                   │
│                     ┌────────▼────────┐                         │
│                     │  Level JSON     │                         │
│                     │  (build-time    │                         │
│                     │   generated)    │                         │
│                     └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
vita-mahjong/
├── index.html                  # viewport-fit=cover, safe-area CSS
├── vite.config.ts              # Vite + vitest config
├── tsconfig.json
├── package.json
├── public/
│   ├── levels/                 # generated level JSON (gitignored)
│   ├── assets/
│   │   ├── textures/           # bg, buttons, icons, particles
│   │   ├── tiles/              # themed tile face atlases
│   │   └── fonts/
├── src/
│   ├── main.ts                 # bootstrap PixiJS Application
│   ├── app/
│   │   ├── App.ts              # owns App + ScreenManager
│   │   └── config.ts           # design resolution, colors, timing
│   ├── engine/
│   │   ├── BoardModel.ts       # stones, free-tile rule, win/deadlock
│   │   ├── TrayModel.ts        # 4-slot tray + pairing logic
│   │   ├── GameState.ts        # score, combo, timer, level state
│   │   ├── Solver.ts           # solvability verifier (build + runtime)
│   │   └── types.ts            # Tile, Stone, Level, etc.
│   ├── renderer/
│   │   ├── ScreenManager.ts    # home/game/result transitions
│   │   ├── screens/
│   │   │   ├── HomeScreen.ts
│   │   │   ├── GameScreen.ts
│   │   │   └── ResultScreen.ts
│   │   ├── components/
│   │   │   ├── TileSprite.ts
│   │   │   ├── TraySlot.ts
│   │   │   ├── HUD.ts
│   │   │   └── Button.ts
│   │   ├── effects/
│   │   │   └── ScoreFloater.ts
│   │   └── pools/
│   │       └── TilePool.ts
│   ├── generator/
│   │   ├── generate-levels.ts  # build-time Node entry
│   │   ├── LayoutBuilder.ts    # fixed [z,x,y] placements per level
│   │   └── SolvableDealer.ts   # backward-dealing pair assignment
│   └── __tests__/
│       ├── BoardModel.test.ts
│       ├── TrayModel.test.ts
│       └── free-tile.test.ts
└── tools/
    └── build-levels.mjs         # npm script wrapper
```

### Pattern 1: Model/Renderer Split

**What:** Keep all game rules, state, and scoring in pure TypeScript classes with no PixiJS imports. The renderer observes model changes and updates sprites.

**When to use:** Always. It makes the free-tile rule and solver unit-testable without a canvas, and keeps rendering code replaceable.

**Example:**

```typescript
// Source: adapted from ffalt/mah board.ts + stone.ts
class Stone {
  constructor(
    public z: number,
    public x: number,
    public y: number,
    public face: number
  ) {}

  isBlocked(stones: Stone[]): boolean {
    const top = stones.some(s => s.z === this.z + 1 && overlaps(s, this));
    const left = stones.some(s => s.z === this.z && isLeftNeighbor(s, this));
    const right = stones.some(s => s.z === this.z && isRightNeighbor(s, this));
    return top || (left && right);
  }
}
```

### Pattern 2: Backward-Dealing Solvable Generation

**What:** Start with an empty layout of tile positions. Repeatedly pick two currently-free positions and assign them the same face. Because every assignment only uses free positions, the reverse sequence is a valid play-through.

**When to use:** For every build-time level generation where solvability must be guaranteed.

**Example:**

```typescript
// Source: adapted from ffalt/mah src/app/model/builder/solvable.ts
function dealSolvable(stones: Stone[], faces: number[], rng: () => number): boolean {
  const pairs = faces.flatMap(f => [f, f]);
  const shuffled = shuffle(pairs, rng);

  for (const face of shuffled) {
    const free = stones.filter(s => !s.assigned && !s.isBlocked(stones));
    if (free.length < 2) return false;

    const a = extractRandom(free, rng);
    const b = extractRandom(free, rng);
    a.face = b.face = face;
    a.assigned = b.assigned = true;
    // Temporarily mark as "removed" so deeper tiles become free.
    a.picked = b.picked = true;
  }

  // Restore all stones to board state.
  stones.forEach(s => (s.picked = false));
  return true;
}
```

### Pattern 3: Object-Pool Sprites

**What:** Reuse `TileSprite` instances across levels instead of creating/destroying them. When a tile is matched, return its sprite to the pool (visually hidden) instead of destroying it.

**When to use:** Required to stay within the ~150-node budget and avoid GC jank on low-end devices.

**Example:**

```typescript
// Source: PixiJS scene graph + performance tips
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

### Pattern 4: Federated Pointer Events for Touch

**What:** PixiJS v8 unifies mouse/touch/pen into pointer events. Set `eventMode = 'static'` on interactive sprites and listen to `pointertap`. Use `hitArea` to expand touch targets.

**When to use:** All clickable board tiles and UI buttons.

**Example:**

```typescript
// Source: pixijs.com/8.x/guides/components/events
const tile = new Sprite(texture);
tile.eventMode = 'static';
tile.hitArea = new Rectangle(-8, -8, w + 16, h + 16);
tile.on('pointertap', (e) => {
  engine.handleTileClick(tile.modelId);
});
```

### Anti-Patterns to Avoid

- **Coupling game logic to PixiJS display objects:** Board rules should not inspect `Sprite` bounds or z-index to decide freeness.
- **Creating new Sprites every level:** Leads to GC pauses and violates the performance budget.
- **Using `click` instead of `pointertap`:** `click` does not fire reliably on all mobile browsers/touch devices.
- **Forcing exact 1080×2400 rendering:** Render at the device resolution and scale positions proportionally; CSS `viewport-fit=cover` plus `env()` handles safe areas.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 2D rendering/WebGL bootstrap | Custom canvas renderer | `pixi.js` `Application` | Async init, WebGL/WebGPU support, scene graph, events, ticker [CITED: pixijs.com/8.x/guides/components/application]. |
| Asset loading/bundling | Manual fetch + blob handling | `Assets.load()` + Vite asset imports | Caching, alias support, extension-based parsers [CITED: pixijs.com/8.x/guides/components/assets]. |
| Touch/mouse event abstraction | Pointer polyfills | PixiJS federated events (`pointertap`) | Unified mouse/touch/pen; hit testing included [CITED: pixijs.com/8.x/guides/components/events]. |
| Animation timing | `requestAnimationFrame` + manual lerp | PixiJS `Ticker` + simple easing functions | `Ticker` gives `deltaTime`, `minFPS`, `maxFPS`; avoids drift [CITED: pixijs.com/8.x/guides/components/ticker]. |
| Solvability proof | Random shuffle until it "feels" winnable | Backward-dealing + deterministic solver | Mahjong Solitaire is NP-hard; random layouts are often unwinnable [CITED: en.wikipedia.org/wiki/Mahjong_solitaire]. |
| Build tooling | Hand-rolled rollup config | Vite + `npm create pixi.js@latest -- --template bundler-vite` | Official template, HMR, TS support, optimized bundle. |
| Bitmap font for CJK UI | Manual glyph atlases | `BitmapText` via `BitmapFont.from` or pre-baked `.fnt` | GPU text, fast updates; raster `Text` is fine for infrequent labels [CITED: pixijs.com/8.x/guides/components/scene-objects/text]. |

**Key insight:** The project is a game, not a graphics engine. PixiJS already owns the hard problems (render batching, event dispatch, asset lifecycle, ticker). The only custom algorithm that is genuinely project-specific is the level generator/solver pair.

## Runtime State Inventory

> Greenfield phase — no existing runtime state to inventory. No stored data, live service config, OS-registered state, secrets, or build artifacts exist yet. The plan must ensure generated level JSON is gitignored (D-10) and the Node generator script is wired into the build pipeline.

## Common Pitfalls

### Pitfall 1: Free-tile boundary errors
**What goes wrong:** Tiles on the edge of a layer are incorrectly marked blocked, or tiles partially covered by a diagonal upper tile are treated as free.
**Why it happens:** The rule is positional and depends on the exact grid step (PRD uses a 2-step grid for left/right neighbors and 1-step for above/below in the reference implementation).
**How to avoid:** Define `isBlocked` with explicit neighbor queries: top = any stone at `z+1` overlapping the tile's footprint; left/right = any stone at the same `z` immediately adjacent on that side. Property-test against known layouts.
**Warning signs:** Solver claims a board is solvable but the player cannot click any tile; or player can click a tile that should be covered.

### Pitfall 2: Tray interaction desync
**What goes wrong:** A tile visually remains on the board after being added to the tray, or a matched pair is removed from the tray but the board sprite is not cleaned up.
**Why it happens:** Tray model and renderer maintain separate state.
**How to avoid:** Single source of truth in `TrayModel`; renderer listens to `onTileAdded`, `onPairMatched`, `onTrayFull` events and animates transitions.
**Warning signs:** Clicking a tray slot triggers another match; score increments but tile count does not drop.

### Pitfall 3: Z-order/render-order bugs
**What goes wrong:** Upper tiles render behind lower tiles, breaking the 3D stacking illusion.
**Why it happens:** PixiJS renders children in insertion order by default; sorting must respect `z` (layer) and then board position.
**How to avoid:** Add tile sprites to a `BoardLayer` container sorted by `(z, y, x)` or use `zIndex` with `sortableChildren = true` and call `sortChildren()` after each board change [CITED: pixijs.com/8.x/guides/components/scene-objects/container].
**Warning signs:** Tiles that should be on top appear partially hidden by tiles beneath them.

### Pitfall 4: Build-time generation failing silently
**What goes wrong:** Generated levels are stale or missing because the build script is not run before `vite build`.
**Why it happens:** Level JSON is gitignored (D-10) but not regenerated on every build.
**How to avoid:** Add a pre-build npm script (`"prebuild": "tsx tools/generate-levels.ts"`) and commit a deterministic seed. Fail the build if generation returns empty or unsolvable levels.
**Warning signs:** Level 20 has wrong tile count; CI build passes but runtime cannot load `public/levels/20.json`.

### Pitfall 5: Mobile touch target miss-rate
**What goes wrong:** Seniors/players with low motor precision cannot reliably tap tiles.
**Why it happens:** Hit area equals visual bounds; fingers are larger than the visual tile.
**How to avoid:** Expand `hitArea` by 8–12 px on each side (PRD §10.3) and ensure buttons have a minimum 64 px touch diameter.
**Warning signs:** Repeated taps on a visible tile register as misses.

### Pitfall 6: Vite top-level await production bug
**What goes wrong:** `await app.init(...)` at module top-level works in dev but breaks production builds.
**Why it happens:** PixiJS docs warn that top-level await with PixiJS can fail in Vite ≤6.0.6 production builds [CITED: pixijs.com/8.x/guides/getting-started/quick-start].
**How to avoid:** Wrap initialization in an async IIFE or `main()` function invoked from `index.html`.
**Warning signs:** White screen after `npm run build && npm run preview`; no console error in dev.

## Code Examples

Verified patterns from official sources:

### PixiJS 8 Application Bootstrap

```typescript
// Source: pixijs.com/8.x/guides/getting-started/quick-start
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

### Free-Tile Rule Implementation

```typescript
// Source: adapted from ffalt/mah src/app/model/stone.ts
interface Stone {
  z: number;
  x: number;
  y: number;
  picked: boolean;
  top: Stone[];
  left: Stone[];
  right: Stone[];
}

function hasUnpicked(stones: Stone[]): boolean {
  return stones.some(s => !s.picked);
}

function isBlocked(stone: Stone): boolean {
  return hasUnpicked(stone.top) ||
    (hasUnpicked(stone.left) && hasUnpicked(stone.right));
}
```

### Backward-Dealing Level Generator

```typescript
// Source: adapted from ffalt/mah src/app/model/builder/solvable.ts
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
    a.picked = b.picked = true; // simulate removal to expose deeper tiles
  }

  stones.forEach(s => (s.picked = false));
  return new Map(stones.map(s => [`${s.z},${s.x},${s.y}`, s.face]));
}
```

### Tray Model

```typescript
// Source: derived from PRD §3.3 + CONTEXT.md D-01..D-04
class TrayModel {
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

### Safe-Area CSS + Canvas Sizing

```css
/* Source: webkit.org/blog/7929/designing-websites-for-iphone-x */
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

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PixiJS v7 multi-package imports (`@pixi/app`, `@pixi/sprite`) | Single `pixi.js` package in v8 | v8.0 (2024) | Simpler install, no version mismatch, async init [CITED: pixijs.com/8.x/guides/migrations/v8]. |
| `InteractionManager` | Federated events (`pointertap`) | v7→v8 | Unified mouse/touch model, DOM-like event flow. |
| `cacheAsBitmap` | `cacheAsTexture()` | v8 | Same optimization, clearer naming. |
| `Texture.from(url)` | `Assets.load()` then `Texture.from` | v8 | Textures no longer load from URLs automatically. |
| Random Mahjong layouts | Backward-dealing + solver verification | Industry standard | Guarantees at least one clearable path. |

**Deprecated/outdated:**
- `@pixi/filter-*` packages: use `pixi-filters/adjustment` style imports in v8 [CITED: pixijs.com/8.x/guides/migrations/v8].
- PixiJS v7 sync `Application` constructor: v8 requires `await app.init()`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The official `pixi.js` v8 package is the correct single-package import for PixiJS 8. | Standard Stack | Build/runtime errors; migration work required if project uses legacy `@pixi/*` packages. |
| A2 | `npm create pixi.js@latest -- --template bundler-vite` will produce a working Vite + TS scaffold on Node 24. | Architecture Patterns | If template is incompatible, planner must fall back to manual Vite setup. |
| A3 | Backward-dealing (assigning pairs only to currently-free tiles) is sufficient to guarantee solvability for all 20 PRD layouts. | Architecture Patterns | Some dense layouts may need a fallback solver-driven placement or more retries. |
| A4 | A 2-step horizontal grid and 1-step vertical grid matches the PRD free-tile rule (left/right neighbor at ±2, top at z+1 with overlap). | Code Examples | Wrong neighbor distance causes incorrect freeness and broken solvability. |
| A5 | `vitest` is the appropriate test runner for this Vite project. | Standard Stack | Jest could also work but would require separate transform config. |
| A6 | The 1080×2400 design baseline can be scaled proportionally to any portrait 20:9 screen without letterboxing issues. | Architecture Patterns | Extreme aspect ratios may require additional layout safeguards. |

**If this table is empty:** Not applicable — assumptions are listed above.

## Open Questions

1. **Tile footprint and grid step**
   - What we know: PRD says tile width ~0.21 screen width, height ~0.11 screen height; free-tile rule needs neighbor definitions.
   - What's unclear: Exact horizontal/vertical overlap between stacked tiles and whether the engine should use integer grid coordinates or sub-pixel placements.
   - Recommendation: Start with an integer grid (2-unit horizontal step, 1-unit vertical step) matching the `ffalt/mah` model; adjust visually by scaling sprite positions.

2. **Solver strictness for generation**
   - What we know: Backward-dealing guarantees one path; solver verifies.
   - What's unclear: Whether every PRD layout (especially level 20 with 128 tiles/7 layers) will produce a solvable deal within the retry budget.
   - Recommendation: Build the generator with a retry loop and a deterministic solver; if a layout repeatedly fails, tune the layout shape before launch.

3. **Test runner canvas environment**
   - What we know: Vitest runs Node/V8; PixiJS needs a canvas/WebGL context.
   - What's unclear: Whether rendering tests need `vitest-browser-mode` or can rely on model-only tests for Phase 1.
   - Recommendation: Phase 1 tests focus on model/engine logic; defer rendering tests to Phase 2/3.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite, build scripts, generator | ✓ | 24.12.0 | — |
| npm | Package management | ✓ | 11.6.2 | — |
| Modern mobile browser (WebGL) | PixiJS renderer | ✓ (dev machine browser) | — | WebGPU fallback if supported |
| Git | Version control / build pipeline | ✓ | — | — |
| Safe-area CSS support | Mobile layout | ✓ | iOS 11.2+ / modern Android | Hard-coded fallback insets (48px top, 34px bottom) |

**Missing dependencies with no fallback:** none
**Missing dependencies with fallback:** none

## Validation Architecture

> Skipped because `workflow.nyquist_validation` is explicitly set to `false` in `.planning/config.json`. The planner may still add ad-hoc unit tests using Vitest for the engine model, but no formal Nyquist test map is required for this phase.

## Security Domain

> `security_enforcement` is enabled in config (ASVS Level 1). Phase 1 has no network, no backend, and no user authentication. The primary applicable control is input validation for level data.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Not applicable — local single-player game. |
| V3 Session Management | no | Not applicable. |
| V4 Access Control | no | Not applicable. |
| V5 Input Validation | yes | Validate imported/generated level JSON schema before use; reject malformed `Place` arrays, non-even face counts, and out-of-bounds coordinates. |
| V6 Cryptography | no | Not applicable. |
| V7 Error Handling | yes | Wrap `JSON.parse`/generator output; fail safe (do not load corrupted levels). |
| V12 File Upload | no | Not applicable — no user uploads in Phase 1. |

### Known Threat Patterns for the Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malicious/generated level JSON | Tampering | Schema validation + deterministic generator; do not `eval` or execute level data. |
| Prototype pollution from imported JSON | Tampering | Parse with `JSON.parse`, freeze objects, avoid `Object.assign` from untrusted data. |
| Denial of service via complex board | Availability | Cap tiles per level (≤128), cap solver recursion/time, validate layout dimensions. |
| Unsafe inline canvas/DOM injection | Tampering | Do not render user-supplied HTML/markup in PixiJS `HTMLText`; use preloaded textures only. |

## Sources

### Primary (HIGH confidence)
- PixiJS v8 docs — Quick Start, Application, Scene Graph, Containers, Events, Assets, Ticker, Text, Performance Tips, v8 Migration Guide [CITED: pixijs.com/8.x/guides/...].
- `ffalt/mah` source code — `src/app/model/builder/solvable.ts`, `src/app/model/stone.ts`, `src/app/model/board.ts`, `src/app/model/solver/solver.ts`, `package.json` [CITED: github.com/ffalt/mah].
- Wikipedia — Mahjong solitaire rules and complexity notes [CITED: en.wikipedia.org/wiki/Mahjong_solitaire].

### Secondary (MEDIUM confidence)
- WebKit — "Designing Websites for iPhone X" safe-area guide [CITED: webkit.org/blog/7929/designing-websites-for-iphone-x].
- MDN — `env()` CSS function [CITED: developer.mozilla.org/en-US/docs/Web/CSS/env].
- Vitest docs — "Why Vitest" [CITED: vitest.dev/guide/why.html].
- `dmitriylogunov/mahjong` repo README — project structure reference [CITED: github.com/dmitriylogunov/mahjong].

### Tertiary (LOW confidence)
- GitHub Topics search for `mahjong-solitaire` — surfaced `ffalt/mah` and `dmitriylogunov/mahjong` as representative implementations.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified npm versions and official PixiJS docs.
- Architecture: HIGH — based on production reference implementation and official PixiJS patterns.
- Pitfalls: MEDIUM-HIGH — some derived from experience, cross-referenced with docs and reference code.

**Research date:** 2026-07-04
**Valid until:** 2026-10-04 (PixiJS 8 is stable; verify version before major dependency bumps)





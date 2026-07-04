# Architecture Patterns

**Domain:** Mobile Mahjong Solitaire (tile-matching puzzle)
**Researched:** 2026-07-04
**Overall confidence:** MEDIUM

## Recommended Architecture

Mobile Mahjong Solitaire is best structured as a thin client around a deterministic game-state core. Because there is no backend and no multiplayer, the architecture can stay monolithic: a single-page web app where a `GameController` owns the canonical board state and dispatches updates to a renderer, input layer, and UI.

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Home    │  │  Game    │  │ Result   │  │  HUD     │    │
│  │  Screen  │  │  Screen  │  │  Screen  │  │ Overlay  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
├───────┴─────────────┴─────────────┴─────────────┴───────────┤
│                    Interaction / FX Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Input Handler│  │   Animator   │  │ Audio/FX Mgr │      │
│  │(touch/hover) │  │(tween/pool)  │  │(synth/files) │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
├─────────┴─────────────────┴─────────────────┴───────────────┤
│                       Game Logic Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  GameController                      │   │
│  │  (state machine: menu → playing → paused → result)   │   │
│  └──────────────────────┬──────────────────────────────┘   │
│  ┌──────────────────────┴──────────────────────────────┐   │
│  │                 Board / Tile Model                   │   │
│  │   Tile[] with id, {x,y,z}, face, matched, blocked    │   │
│  └──────────────────────┬──────────────────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Layout  │  │  Solver  │  │ Generator│  │  Scoring │   │
│  │  Manager │  │(free/match)│  │(solvable)│  │  Timer   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│                       Storage Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ localStorage │  │   Settings   │  │   Progress   │      │
│  │   (prefs)    │  │ (audio/diff) │  │ (unlocked)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **GameController** | Owns game phase state (menu/playing/result), starts levels, processes matches, checks win/loss. | BoardModel, Renderer, AudioManager, ScreenManager |
| **BoardModel** | Canonical tile array: positions, faces, matched flag. Exposes query methods (`isFree`, `findMatches`, `isSolved`). | Solver, Generator, Renderer, InputHandler |
| **LayoutManager** | Loads per-level tile position maps (x, y, z). Pure data; no rendering. | Generator, BoardModel |
| **Solver** | Determines if a tile is free, counts available matches, finds hints, detects deadlocks, validates solvability. | BoardModel, GameController |
| **Generator** | Assigns tile faces to a layout so the board is provably solvable. Uses forward simulation + backtracking. | LayoutManager, BoardModel, Solver |
| **InputHandler** | Translates pointer/canvas coordinates into tile hits, debounces taps, handles deselect. | Renderer, GameController |
| **Renderer** | Draws the board (DOM or Canvas). Renders tiles in z-order, highlights selection/blocked state, triggers match animations. | BoardModel, Animator |
| **Animator** | Runs selection pulse, match shrink/fade, particle bursts. Falls back to simple fade on low-end devices. | Renderer, GameController |
| **AudioManager** | Plays click, match, win, button sounds. Respects mute setting. | GameController, Settings |
| **ScreenManager** | Switches between home, game, and result screens without page reload. | GameController, UI |
| **Settings/Storage** | Persists audio, low-pressure mode, unlocked levels, best times in `localStorage`. | All UI components |

### Data Flow

1. **Level start:** `LayoutManager[level]` → `Generator` assigns faces via simulated playthrough → `BoardModel` is populated → `Renderer` draws tiles in back-to-front z-order.
2. **User tap:** `InputHandler` resolves coordinate → tile id → `GameController` validates the tile is free via `Solver` → updates selection or calls `removePair()` on `BoardModel`.
3. **Match:** `BoardModel` marks tiles matched → `Renderer` plays removal animation → `Animator` spawns particles (if enabled) → `AudioManager` plays match sound → `Solver` re-evaluates available moves.
4. **Win/Deadlock:** `Solver` reports no tiles left or no valid moves → `GameController` transitions to result screen or offers shuffle/undo.
5. **Undo:** `GameController` pops the last matched pair from a history stack → restores `BoardModel` state → `Renderer` re-inserts tiles.

```
User Tap
   ↓
InputHandler (hit-test)
   ↓
GameController
   ↓
BoardModel + Solver (free? match?)
   ↓
BoardModel.matched = true
   ↓
Renderer + Animator + AudioManager
   ↓
Solver (deadlock? win?)
   ↓
GameController → ScreenManager / HUD
```

## Patterns to Follow

### Pattern 1: State-First Game Loop

**What:** The renderer is a pure function of `BoardModel`. User input mutates the model; the view reflects it. No game logic lives in the view layer.

**When:** Always. This is the dominant pattern in both the TypeScript engine (`jmcragun/mahjong-solitaire-engine`) and the single-file PWA (`tcottrill/myMahjong`).

**Example:**
```typescript
class BoardModel {
  tiles: Tile[];

  select(id: number): MatchResult | null {
    const tile = this.tiles.find(t => t.id === id);
    if (!tile || !this.isFree(tile)) return null;
    // ...match logic, mark matched
    return { removed: [a, b] };
  }

  isFree(tile: Tile): boolean {
    const hasTop = this.tiles.some(t =>
      !t.matched &&
      t.z === tile.z + 1 &&
      Math.abs(t.x - tile.x) < 1 &&
      Math.abs(t.y - tile.y) < 1
    );
    const leftBlocked = /* tile at same z, x-1, y */;
    const rightBlocked = /* tile at same z, x+1, y */;
    return !hasTop && (!leftBlocked || !rightBlocked);
  }
}
```

### Pattern 2: Solvability by Forward Simulation

**What:** To guarantee a layout is solvable, do not place tiles randomly and then test. Instead, repeatedly remove random *free* pairs from an empty layout, recording the pair positions; then assign matching faces to those recorded pairs. The resulting board has at least the recorded playthrough as a solution.

**When:** Level generation at runtime or build time. Used by `acvrp-lab/mahjong-solitaire-algorithm` and `tcottrill/myMahjong`.

**Example:**
```typescript
function generateSolvable(layout: Position[]): Tile[] {
  const tiles = layout.map((pos, i) => ({ ...pos, id: i, face: null, matched: false }));
  const stack: [number, number][] = [];

  while (tiles.some(t => !t.matched)) {
    const free = tiles.filter(t => !t.matched && isFree(t, tiles));
    if (free.length < 2) throw new Error('dead end — retry with new seed');
    const [a, b] = pickTwo(free);
    a.matched = true; b.matched = true;
    stack.push([a.id, b.id]);
  }

  // assign faces in pairs according to removal order
  const faces = createPairs(stack.length);
  stack.forEach(([aid, bid], i) => {
    tiles[aid].face = faces[i];
    tiles[bid].face = faces[i];
  });

  tiles.forEach(t => t.matched = false);
  return tiles;
}
```

### Pattern 3: Z-Ordered Rendering

**What:** Tiles are drawn from lowest layer / back-most to highest layer / front-most so upper tiles visually cover lower ones. Each tile stores its layer index; the renderer sorts by `z` (and then by `y` or `x` for tie-breaking).

**When:** Any stack-based tile renderer, whether DOM (absolute `z-index`) or Canvas (painters algorithm).

**Example:**
```typescript
function renderTiles(tiles: Tile[], ctx: CanvasRenderingContext2D) {
  const visible = tiles.filter(t => !t.matched);
  visible.sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
  for (const tile of visible) {
    drawTile(ctx, tile);
    if (!isFree(tile)) drawDimOverlay(ctx, tile);
  }
}
```

### Pattern 4: Object Pooling for Particles

**What:** Reuse DOM nodes or canvas particle objects instead of creating/destroying them per match. This keeps GC pressure low on low-end phones.

**When:** Particle effects are enabled. Should be skipped entirely in low-performance mode.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Render State in the DOM

**What:** Using DOM element classes or positions as the source of truth for which tiles exist, are selected, or are matched.

**Why bad:** Leads to synchronization bugs between game logic and visuals; makes undo, hints, and solvability checks unreliable.

**Instead:** Keep `BoardModel` as the single source of truth. The DOM/canvas is read-only except through the renderer.

### Anti-Pattern 2: Generating Layouts Randomly Then Testing Solvability

**What:** Randomly assigning faces to a fixed layout and then running a solver until one happens to be solvable.

**Why bad:** For dense 144-tile layouts, random assignment is rarely solvable, causing long startup delays or impossible boards.

**Instead:** Generate by forward simulation (remove free pairs) or reverse placement (add free pairs) so solvability is guaranteed by construction.

### Anti-Pattern 3: Recomputing Free/Blocked Status for Every Tile Every Frame

**What:** Calling `isFree()` on all 150 tiles inside an animation loop.

**Why bad:** O(n²) per frame drains battery and drops frames on low-end devices.

**Instead:** Recompute only after a match occurs. Cache the set of currently free tiles and incrementally update it.

### Anti-Pattern 4: Blocking the Main Thread During Generation

**What:** Running the solvability generator synchronously on level start for large layouts.

**Why bad:** On level 20 (up to 128 tiles, 7 layers), backtracking may take tens to hundreds of milliseconds and freeze the UI.

**Instead:** Generate levels at build time and ship pre-computed face assignments, or run generation in a Web Worker and show a short loading spinner.

## Scalability Considerations

| Concern | 20–72 tiles | 128 tiles / 7 layers | Notes |
|---------|-------------|----------------------|-------|
| **Renderer** | DOM nodes fine | Canvas preferred | DOM with 150 nodes is workable but Canvas gives smoother z-sorting and particles. |
| **Free-tile recomputation** | Naive O(n²) acceptable | Cache incremental updates | Recompute only after matches. |
| **Solvability generation** | Runtime OK | Pre-generate or Worker | Large layouts risk main-thread jank. |
| **Particle effects** | Full effects | Degrade/optional | Disable on low-end devices per project constraint. |
| **Asset delivery** | Inline SVGs acceptable | Split sprite sheet | `myMahjong` inlines 44 SVGs in a 1.3 MB file; for 20 levels of art, consider external sprites. |

## Suggested Build Order

Because components have clear dependencies, build them in this order to keep each phase playable:

1. **Core types and BoardModel** — `Tile`, `Position`, `Layout`; `isFree`, `findMatches`, `removePair`.
2. **Layout data** — Static level descriptors (positions per level, up to level 20).
3. **Solver** — Hint, deadlock detection, available-match count.
4. **Generator** — Solvable face assignment; validate against Solver.
5. **Canvas/DOM renderer** — Draw tiles with z-order, selection highlight, blocked dimming.
6. **Input handler** — Tap-to-select, deselect, pinch/prevent-zoom.
7. **GameController + ScreenManager** — Menu → Game → Result flow, timer/score, undo.
8. **Audio / animations / particles** — Add polish; make particles optional.
9. **Settings / progress persistence** — localStorage, low-pressure mode, level unlock.

**Why this order:** Rendering and input are useless without a correct BoardModel; the Solver is useless without a model; the Generator is useless without the Solver; UI flow and polish depend on everything underneath working.

## Sources

- `jmcragun/mahjong-solitaire-engine` — TypeScript implementation with `BoardSolver`, `LayoutManager`, and `MahjongGame` coordinator. Confidence: MEDIUM.
- `tcottrill/myMahjong` — Single-file PWA using canvas rendering, inline SVG tile sprites, and forward-simulation solvable generation. Confidence: MEDIUM.
- `acvrp-lab/mahjong-solitaire-algorithm` — C++ reference for depth-first forward simulation to generate solvable boards. Confidence: MEDIUM.
- Stack Overflow, "Mahjong Solitaire — Arrange tiles to ensure at least one path to victory" — Community consensus on forward simulation / reverse placement for solvability. Confidence: MEDIUM.

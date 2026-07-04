# Phase 2: UI/UX, Accessibility & Game Flow — Research

**Researched:** 2026-07-05
**Domain:** Mobile game UI, Web Audio API, accessibility, screen flow
**Confidence:** HIGH

## Summary

Phase 2 builds the complete player-facing experience on top of Phase 1's engine and renderer. All work extends existing PixiJS 8 Container components (HomeScreen, GameScreen, ResultScreen, ScreenManager, Button, HUD, Tray, TileSprite) with zero new npm dependencies. Audio is generated entirely via the built-in Web Audio API (`OscillatorNode` + `GainNode`), matching the project's established pattern of programmatic asset generation. The phase adds navigation polish (back button, settings screen), assist controls (undo/hint/shuffle with usage limits), tile layout adjustments for senior-friendly touch targets, and a complete audio system with SFX, BGM, and independent volume controls.

**Primary recommendation:** Extend existing patterns — add a `ScreenName` value for settings, wrap assist buttons as three `Button` components in a bottom bar, implement undo/hint/shuffle as new `GameState` methods backed by a lightweight history stack, and generate all audio through a singleton `AudioManager` that respects the browser autoplay policy by initializing on first user gesture.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CORE-06 | User can navigate back to home screen from game/result screens | Back button on HUD triggers `ScreenManager.show('home')` with `immediate: true`. D-11: no confirmation, discard progress. |
| LVLS-05 | User can select any unlocked level | D-01/D-02: single "关卡 X" button on home shows current level, no grid. Linear-only, no replay. Level number tracked in App state. |
| ACCS-01 | Tile size and touch targets large enough for seniors | Tile is 227×120 design px → ~146×77 CSS px at 1080px viewport. WCAG 2.5.8 min: 24×24 CSS px. Current size well above. Assist buttons need ≥120×120 px. |
| ACCS-02 | High-contrast tile faces with clear, readable fonts | Tile face uses 0xFAFAF8 on dark background, symbols via `Noto Sans SC` at large size. Contrast meets WCAG AA (light text on dark). |
| ACCS-04 | One-tap undo, hint, and shuffle controls | Three `Button` components in bottom `AssistBar`. Undo/hint tracked per level. Solver reused for hint. BoardModel.shuffle for shuffle. |
| ACCS-05 | Low-pressure mode | REMOVED per D-03. Timer and score always visible. |
| VISL-01 | Oriental classical art style | Phase 1 already established style via procedural assets (bg_game, tile textures, deco elements). Key_nodes screenshots provide reference. |
| VISL-02 | Smooth selection, match, elimination animations | Phase 1 already implements: tile highlight, tile-to-tray flight (easeOutBack), match removal from tray, combo/score feedback. Extend with hint highlight animation. |
| AUDI-01 | Sound effects for select, match, win, button actions | Web Audio API: short `OscillatorNode` with rapid attack-decay envelope. Distinct waveforms per event type (sine=tap, triangle=match, square=combo). |
| AUDI-02 | Background music, mutable | Oscillator-based pentatonic melody loop. Individual notes scheduled via `currentTime`. GainNode for volume. |
| AUDI-03 | Independent SFX/music volume control | Settings page: two `<input type="range">`-equivalent UI controls. Separate GainNodes for SFX bus and BGM bus. |
| RSLT-01 | Result screen shows stats | ResultScreen already displays time, score, combo, beat ratio, progress. Connects via `GameScreen.WIN` event. |
| RSLT-02 | Retry current or proceed to next level | ResultScreen already has "下一关" button emitting `NEXT_LEVEL`. Home-level button always reflects current level. |
| PLAT-01 | Mobile portrait 20:9, 1080×2400 baseline | config.ts already defines `designWidth: 1080, designHeight: 2400`. ScreenManager handles resize-to-renderer scaling. |
</phase_requirements>

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Home shows single button "关卡 X" (X = current level). Linear progression. No grid/list.
- **D-02:** Completed levels not replayable.
- **D-03:** No low-pressure mode. Timer and score always shown. ACCS-05 removed.
- **D-04:** Assist buttons: three circular buttons side-by-side at screen bottom.
- **D-05:** Limits: undo 3x, hint 3x, shuffle 1x. Reset per level.
- **D-06:** Hint highlights one matchable pair (both tiles glow). Player clicks themselves. Uses Phase 1 Solver.
- **D-07:** Undo reverts last elimination. Shuffle randomizes remaining tile positions.
- **D-08:** Same-layer tiles abut: `gridX = tile.width / 2`, `gridY = tile.height`. No overlap.
- **D-09:** Upper layer half-covers 4 tiles beneath (classic mahjong stacking).
- **D-10:** Tile dimensions, rounded corners, side thickness per key_nodes screenshots.
- **D-11:** Back button in game returns to home, discards progress. No confirmation. No pause.
- **D-12:** Native Web Audio API. No howler.js or any audio library.
- **D-13:** All audio programmatic: `OscillatorNode` + `GainNode`.
- **D-14:** Audio controls on separate settings page via gear icon. SFX volume, BGM volume, independent mute.
- **D-15:** SFX: tap, match, combo, win, fail, click. BGM: classical Chinese-style loop.

### Agent Discretion
- `gridX` / `gridY` / `layerOffset` pixel values derived during implementation.
- Programmatic audio waveform and note parameters by AudioManager implementation.
- Settings page content beyond audio controls deferred to Phase 3.

### Deferred Ideas (OUT OF SCOPE)
- Low-pressure mode (removed)
- Level replay (Phase 3)
- Persistence (Phase 3)
- Particle effects (Phase 3)
- PWA / native H5 packaging (Phase 3)
- Settings expansion (language, reset, version) (Phase 3)
- Landscape / tablet (v1 scope excluded)
</user_constraints>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Screen navigation (home→game→result→settings) | Browser / Renderer | — | ScreenManager already owns transitions; all screen logic is PixiJS Containers |
| Tile layout & touch targets | Browser / Renderer | — | Grid positioning is a renderer concern; engine provides logical positions |
| Assist controls (undo/hint/shuffle) | Engine | Browser / Renderer | Engine tracks state history and solves; renderer triggers via buttons |
| Audio playback (SFX + BGM) | Browser | — | Web Audio API is a browser capability; managed as singleton service |
| Audio settings (volume/mute) | Browser | — | Settings screen reads/writes GainNode values; persistence deferred to Phase 3 |
| Level progression tracking | Browser / Renderer | — | Current level stored as state in App.ts; Phase 3 adds localStorage persistence |
| Game result display | Browser / Renderer | — | ResultScreen reads GameStats from WIN event; no backend |
| Timer display | Browser / Renderer | — | Elapsed time computed in GameStats.getStats(); displayed on HUD and result |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pixi.js | ^8.19.0 | Rendering, input, screen management | Already installed in Phase 1. No alternative needed. |
| Web Audio API | Built-in (browser) | Programmatic audio generation | D-12/D-13 mandate native API. No library. Available in all target browsers since 2021. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | — | — | Zero new npm packages. All audio is Web Audio API; all UI is pixi.js. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Web Audio API | howler.js | D-12 explicitly prohibits howler.js. Web Audio API gives full control, lighter footprint, no dependency. |
| Web Audio API | tone.js | Overkill for simple SFX + BGM loop. Adds 50+ KB. Programmatic generation is sufficient. |
| Custom audio library | Audio file playback | D-13 mandates programmatic audio. Files would need to be generated anyway; real-time synthesis is more flexible and matches PNG generation pattern. |

**Installation:**
```bash
# No new packages to install
```

## Package Legitimacy Audit

> This phase installs zero new external packages. All UI is pixi.js (already in package.json, Phase 1). All audio is built-in Web Audio API (browser platform). No audit needed.

**Packages removed due to SLOP verdict:** none
**Packages flagged as suspicious SUS:** none

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    App.ts (entry)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ ScreenManager │  │ AudioManager  │  │ currentLevel │ │
│  │ (transitions) │  │ (singleton)   │  │ (number)     │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────┘ │
│         │                │                            │
│  ┌──────┼────────────────┼────────────────────────┐  │
│  │      │     Screens     │                        │  │
│  │  ┌───┴──────┐  ┌──────┴───────┐  ┌──────────┐ │  │
│  │  │HomeScreen│  │  GameScreen  │  │ResultScr │ │  │
│  │  │ ┌──────┐ │  │ ┌──────────┐ │  │          │ │  │
│  │  │ │Level │ │  │ │  HUD      │ │  │ stats    │ │  │
│  │  │ │Button│ │  │ │  (back btn│ │  │ next btn │ │  │
│  │  │ └──────┘ │  │ │   timer)  │ │  │          │ │  │
│  │  │ gear→    │  │ ├──────────┤ │  └──────────┘ │  │
│  │  │settings  │  │ │ BoardLayer│ │               │  │
│  │  └─────────┘  │ │  Tray     │ │  ┌──────────┐ │  │
│  │               │ │  AssistBar│ │  │Settings  │ │  │
│  │               │ │  (undo/   │ │  │Screen    │ │  │
│  │               │ │  hint/    │ │  │ SFX vol  │ │  │
│  │               │ │  shuffle) │ │  │ BGM vol  │ │  │
│  │               │ └──────────┘ │  │ mute      │ │  │
│  │               └──────┬───────┘  └──────────┘ │  │
│  └──────────────────────┼────────────────────────┘  │
│                         │                            │
│  ┌──────────────────────┼────────────────────────┐  │
│  │       Engine (Phase 1, extended)               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │  │
│  │  │GameState │  │BoardModel│  │   Solver     │ │  │
│  │  │+undo()   │  │+shuffle()│  │+findHint()   │ │  │
│  │  │+hint()   │  │          │  │              │ │  │
│  │  └──────────┘  └──────────┘  └──────────────┘ │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

Flow:
  Home → tap "关卡 X" → Game Screen (startLevel)
  Game → tap back → immediate return to Home (discard state)
  Game → WIN event → Result Screen (stats)
  Result → "关卡 X+1" → Game Screen
  Home → gear icon → Settings Screen → back → Home
  Settings → volume sliders → AudioManager GainNodes
  Game → AssistBar taps → GameState.undo() / .hint() / .shuffle()
```

### Recommended Project Structure

```
src/
├── app/
│   ├── App.ts              # Wire screens, AudioManager, level tracking
│   ├── assets.ts            # Unchanged
│   └── config.ts            # Add assist button limits, audio frequencies
├── audio/
│   └── AudioManager.ts      # NEW: singleton, SFX/BGM via Web Audio API
├── engine/
│   ├── BoardModel.ts        # EXTEND: add shuffle() method
│   ├── GameState.ts         # EXTEND: add undo(), hint(), shuffle(), history
│   ├── Solver.ts            # EXTEND: add findHintPair() static method
│   └── ...                  # Unchanged
└── renderer/
    ├── ScreenManager.ts     # EXTEND: add 'settings' to ScreenName, Container
    ├── screens/
    │   ├── GameScreen.ts    # EXTEND: HUD back button, AssistBar, timer
    │   ├── HomeScreen.ts    # EXTEND: dynamic level label, gear click handler
    │   ├── ResultScreen.ts  # EXTEND: back button (if needed)
    │   └── SettingsScreen.ts # NEW: audio controls, back button
    ├── components/
    │   ├── AssistBar.ts     # NEW: 3-button bar (undo/hint/shuffle)
    │   ├── Button.ts        # Unchanged (reusable)
    │   ├── HUD.ts           # EXTEND: back button click handler, timer label
    │   └── ...
    └── ...
```

### Pattern 1: Screen Management (Extending ScreenManager)

**What:** Add a fourth screen (`'settings'`) to the existing three-screen architecture. The `ScreenManager` owns a Container per screen; adding a new screen follows the exact pattern of `home`/`game`/`result`.

**When to use:** Any new full-screen UI. Follow the established pattern: Container subclass, `setContent()`, `show()` with transition.

**Example:**
```typescript
// ScreenManager.ts — add to ScreenName union
export type ScreenName = 'home' | 'game' | 'result' | 'settings';

// Add Container property
readonly settings = new Container();

// Add to screens record
private readonly screens: Record<ScreenName, Container> = {
  home: this.home,
  game: this.game,
  result: this.result,
  settings: this.settings,
};

// Add to transitionScale
private readonly transitionScale: Record<ScreenName, number> = {
  home: 1, game: 1, result: 1, settings: 1,
};
```

### Pattern 2: AudioManager (Singleton Service)

**What:** A single `AudioManager` class created once in `App.ts`. Manages one `AudioContext`, a BGM loop, and on-demand SFX. Uses separate GainNodes for SFX and BGM buses to enable independent volume control.

**When to use:** All audio. Call `AudioManager.getInstance().playSfx('tap')` from game events.

**Example (pattern):**
```typescript
// Source: MDN Web Audio API [CITED: developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API]
export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  static getInstance(): AudioManager { ... }

  // Must be called from a user gesture (click) due to autoplay policy
  async init(): Promise<void> {
    this.ctx = new AudioContext();
    this.sfxGain = this.ctx.createGain();
    this.bgmGain = this.ctx.createGain();
    this.sfxGain.connect(this.ctx.destination);
    this.bgmGain.connect(this.ctx.destination);
  }

  playSfx(type: 'tap' | 'match' | 'combo' | 'win' | 'fail' | 'click'): void {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain).connect(this.sfxGain!);
    // Configure frequency, type, envelope per SFX type
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.stop(this.ctx.currentTime + 0.3);
  }

  startBgm(): void { /* pentatonic melody loop via scheduled oscillators */ }
  stopBgm(): void { /* disconnect/cancel scheduled notes */ }
  setSfxVolume(v: number): void { if (this.sfxGain) this.sfxGain.gain.value = v; }
  setBgmVolume(v: number): void { if (this.bgmGain) this.bgmGain.gain.value = v; }
}
```

### Pattern 3: Undo Stack in GameState

**What:** The engine tracks the last N match operations (removed stone IDs, their prior tray state, their board positions) so `GameState.undo()` can restore them. Matches Phase 1's clean separation: engine owns state, renderer re-renders from it.

**Key insight:** `BoardModel.pick()` is irreversible — undo needs to restore `picked = false` and rebuild neighbors. Simplest approach: store a snapshot of affected stone IDs and faces before each match, then rebuild board state on undo.

### Pattern 4: AssistBar Component

**What:** A `Container` with three `Button` instances arranged horizontally at screen bottom. Each button shows remaining uses (e.g., "撤销 3", "提示 3", "洗牌 1"). Buttons disable when count reaches 0.

**Example:**
```typescript
export class AssistBar extends Container {
  private undoButton: Button;
  private hintButton: Button;
  private shuffleButton: Button;

  constructor(onUndo: () => void, onHint: () => void, onShuffle: () => void) {
    super();
    const btnSize = 160; // ~104 CSS px at display scale — well above WCAG 24px minimum
    const gap = 40;
    this.undoButton = new Button({ textureKey: 'btn_circle_brown', label: '撤销 3', width: btnSize, height: btnSize, fontSize: 26, onTap: onUndo });
    this.hintButton = new Button({ textureKey: 'btn_circle_brown', label: '提示 3', width: btnSize, height: btnSize, fontSize: 26, onTap: onHint });
    this.shuffleButton = new Button({ textureKey: 'btn_circle_brown', label: '洗牌 1', width: btnSize, height: btnSize, fontSize: 26, onTap: onShuffle });
    // Position: centered row at bottom of screen
    this.undoButton.x = -btnSize - gap;
    this.hintButton.x = 0;
    this.shuffleButton.x = btnSize + gap;
    this.addChild(this.undoButton, this.hintButton, this.shuffleButton);
  }

  updateCounts(undo: number, hint: number, shuffle: number): void {
    this.undoButton.setLabel(`撤销 ${undo}`);
    this.hintButton.setLabel(`提示 ${hint}`);
    this.shuffleButton.setLabel(`洗牌 ${shuffle}`);
    // Disable button (alpha/eventMode) when count === 0
  }
}
```

### Anti-Patterns to Avoid
- **Don't put game logic in renderer:** AssistBar calls methods on GameState; never touches board model directly. Engine exports results, renderer re-renders.
- **Don't create AudioContext at page load:** Browser autoplay policy will suspend it. Create on first user click (home screen level button tap is ideal).
- **Don't use `setTimeout` for audio scheduling:** Use `AudioContext.currentTime` for precise scheduling.
- **Don't hardcode level numbers:** HomeScreen button label and level tracking should read from a single source of truth (App-level state).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio playback | Custom audio mixer | `AudioContext` + `OscillatorNode` + `GainNode` | Built-in, no deps, precise scheduling, envelope control. D-12 mandates this. |
| Touch hit testing | Manual coordinate math | PixiJS `eventMode = 'static'` + `FederatedPointerEvent` | Already used in Phase 1. Handles scaling, DPR, and event propagation. |
| Screen transitions | Custom transition engine | Existing `ScreenManager.show()` with crossfade+scale | Already built. Just add the 'settings' screen to the union type. |
| Tile z-ordering | Manual sort per frame | `Container.sortableChildren = true` + `zIndex` | Already used in GameScreen. PixiJS handles GPU batching. |

**Key insight:** The Phase 1 renderer already provides all the primitives needed — Button, Container, ScreenManager, animation loop, tile pool, HUD. Phase 2 is purely composition and extension, never reinvention.

## Runtime State Inventory

> Phase 2 is not a rename/refactor/migration phase. It is a greenfield addition of features to an existing engine. No runtime state migration needed.

## Common Pitfalls

### Pitfall 1: AudioContext Suspended State

**What goes wrong:** Audio plays silently on first interaction because the AudioContext was created outside a user gesture. The browser's autoplay policy puts it in `suspended` state.

**Why it happens:** Browsers (Chrome, Safari, Firefox) require `AudioContext` creation or `resume()` to happen inside a trusted user event handler (click, touchstart).

**How to avoid:** Initialize `AudioManager` lazily — create the `AudioContext` inside the first button click handler (e.g., the "关卡 X" button on HomeScreen). Check `audioCtx.state === 'suspended'` and call `.resume()` if needed.

**Warning signs:** Console shows "The AudioContext was not allowed to start" warning. Sounds don't play on first tap but work after refresh.

### Pitfall 2: Undo Breaks Solvability Invariants

**What goes wrong:** After undo, the restored board position has tiles that were previously free now showing as blocked (or vice versa) because `buildNeighbors()` wasn't called on restore.

**Why it happens:** `BoardModel.pick()` removes a stone from `remaining` and rebuilds neighbors. Undo must reverse both: mark stone as unpicked, add back to remaining, and rebuild neighbor topology.

**How to avoid:** Store the pre-match state as `{ stoneId: string, face: number }[]` for both removed stones. On undo: iterate stored IDs, set `picked = false`, add back to `remaining` set, then call `buildNeighbors()` once after all restorations. Use a bounded history stack (max 3 entries per D-05).

### Pitfall 3: Hint Pair Goes Stale

**What goes wrong:** Hint highlights a pair, but before the player taps them, another match removes one of the tiles. The highlighted tile has a stale reference.

**Why it happens:** Hint result is computed at call time but not invalidated by subsequent board mutations.

**How to avoid:** Call `Solver.findHintPair()` fresh each time. If the hinted pair no longer exists or is no longer free, clear highlights silently. The hint pair should be a `{ stoneId: string, partnerId: string }` — validate both stones exist and are free before highlighting.

### Pitfall 4: Button Touch Targets Too Small

**What goes wrong:** Assist buttons (undo/hint/shuffle) are hard to tap accurately on mobile. Seniors miss and tap adjacent buttons or empty space.

**Why it happens:** Visual size ≠ touch target size. The hitArea must include padding.

**How to avoid:** The existing `Button` component already adds `config.tile.touchPadding (12px)` to hitArea. For assist buttons at ~160px design size, this is sufficient. Ensure WCAG 2.5.8 compliance: the button visual + touch padding should fit a 24×24 CSS px square. At 1080px viewport on a 6.7" screen, 160 design px ≈ 104 CSS px — well above minimum.

## Code Examples

Verified patterns from official sources:

### AudioContext Init (Autoplay Policy Safe)
```typescript
// Source: MDN Web Audio API Best Practices [CITED: developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices]
let audioCtx: AudioContext | null = null;

button.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  // ... play sounds
});
```

### Short SFX with Envelope
```typescript
// Source: MDN OscillatorNode [CITED: developer.mozilla.org/en-US/docs/Web/API/OscillatorNode]
function playTapSound(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain).connect(destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}
```

### Solver Hint Method (Concept)
```typescript
// Extend Solver.ts — finds one matching pair of free tiles
static findHintPair(stones: Stone[]): [string, string] | null {
  const free = stones.filter(s => !s.picked && !isBlocked(s));
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (free[i].face === free[j].face) {
        return [free[i].id, free[j].id];
      }
    }
  }
  return null; // deadlocked
}
```

### BoardModel.shuffle (Concept)
```typescript
shuffle(): void {
  const remaining = this.getRemaining();
  const positions = remaining.map(s => ({ x: s.x, y: s.y, z: s.z }));
  // Fisher-Yates shuffle on positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  // Reassign positions to stones
  remaining.forEach((stone, i) => {
    stone.x = positions[i].x;
    stone.y = positions[i].y;
    stone.z = positions[i].z;
  });
  buildNeighbors(this.stones);
  this.remaining = new Set(remaining);
}
```

### Setting Up Audio Gain Buses
```typescript
// Source: MDN GainNode [CITED: developer.mozilla.org/en-US/docs/Web/API/GainNode]
const sfxBus = ctx.createGain();
const bgmBus = ctx.createGain();
sfxBus.connect(ctx.destination);
bgmBus.connect(ctx.destination);
// All SFX → sfxBus, all BGM → bgmBus
// Volume controls modify sfxBus.gain.value and bgmBus.gain.value
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `ScriptProcessorNode` for JS audio | `AudioWorkletNode` (complex) or direct `OscillatorNode` scheduling (simple) | 2021 | For simple SFX, direct scheduling is sufficient; skip AudioWorklet complexity |
| howler.js for game audio | Native Web Audio API | Phase 2 (D-12) | Zero dependency, full control, matches project's programmatic-generation pattern |
| Grid-based level select | Single "关卡 X" button, linear only | Phase 2 (D-01) | Simpler UI, less navigation, aligns with senior-friendly philosophy |

**Deprecated/outdated:**
- **`ScriptProcessorNode`:** Deprecated. Do not use. `OscillatorNode` with direct `start()`/`stop()` scheduling covers all Phase 2 audio needs.
- **howler.js:** D-12 explicitly prohibits. Native Web Audio API is sufficient and matches the zero-dependency philosophy.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Chinese pentatonic scale frequencies (C-D-E-G-A) are appropriate for BGM | Standard Stack | LOW — any scale works; can adjust during implementation |
| A2 | AudioContext can be created lazily on first home screen button tap | Common Pitfalls | LOW — confirmed by MDN autoplay policy docs |
| A3 | Tile size 227×120 design px at 1080px viewport has physical size ≥10mm on typical 6.7" phones | Common Pitfalls | MEDIUM — varies by device PPI; needs real-device validation |
| A4 | `BoardModel.shuffle()` by shuffling positions preserves solvability (same layout, randomized assignments) | Architecture Patterns | HIGH — shuffled layouts may become unsolvable. Plan must include a post-shuffle solvability check or use a safe algorithm. |
| A5 | GameState undo stack of 3 entries is sufficient (matches D-05 limit) | Architecture Patterns | LOW — D-05 locks this limit |

## Open Questions

1. **Shuffle solvability guarantee**
   - What we know: D-07 says shuffle "re-randomizes remaining tile positions." A naive position shuffle can create unsolvable layouts.
   - What's unclear: Whether shuffle should guarantee solvability, or if post-shuffle deadlock is acceptable (player can restart).
   - Recommendation: Implement as simple position reassignment first. If the board becomes deadlocked post-shuffle, the deadlock detection will catch it and show the failure popup (shuffle has already been consumed). If user feedback indicates this is frustrating, add a solvability check in Phase 3.

2. **BGM loop seamlessness**
   - What we know: Programmatic BGM via scheduled oscillators requires careful timing to loop without gaps.
   - What's unclear: Whether `setInterval`-based scheduling is precise enough, or if `AudioContext.currentTime`-based look-ahead scheduling is needed.
   - Recommendation: Use `currentTime`-based scheduling. Schedule 4-8 bars ahead, reschedule on a timer. If timing drift is noticeable, the `AudioContext.currentTime` clock is sample-accurate and a simple look-ahead loop works.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build toolchain | ✓ | (Phase 1 verified) | — |
| npm | Package management | ✓ | (Phase 1 verified) | — |
| Vite | Dev server / build | ✓ | ^8.1.3 (devDependency) | — |
| PixiJS | Rendering | ✓ | ^8.19.0 (dependency) | — |
| Web Audio API | Audio | ✓ | Built-in (all target browsers) | — |
| TypeScript | Type checking | ✓ | ^6.0.3 (devDependency) | — |

**Missing dependencies with no fallback:** None
**Missing dependencies with fallback:** None

## Sources

### Primary (HIGH confidence)
- MDN Web Audio API — overview, OscillatorNode, GainNode, Best Practices (autoplay policy, AudioContext lifecycle) [CITED: developer.mozilla.org]
- WCAG 2.2 SC 2.5.8 Target Size (Minimum) [CITED: w3.org/WAI/WCAG22/Understanding/target-size-minimum.html]
- Project source code (Phase 1 deliverables) — ScreenManager, GameScreen, GameState, BoardModel, config.ts [VERIFIED: codebase grep]

### Secondary (MEDIUM confidence)
- MDN OscillatorNode examples — waveform types, start/stop scheduling [CITED: developer.mozilla.org]
- PixiJS 8 docs — Container, sortableChildren, eventMode patterns (confirmed via existing codebase usage) [VERIFIED: codebase grep]

### Tertiary (LOW confidence)
- Chinese pentatonic scale frequencies [ASSUMED] — training knowledge, not verified this session
- Physical touch target size estimate on 6.7" devices [ASSUMED] — computed from PPI formula, not measured on device

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new packages; Web Audio API is well-documented and project-tested
- Architecture: HIGH — extends existing patterns from Phase 1 codebase; integration points are clearly mapped
- Pitfalls: HIGH — autoplay policy, undo state, and touch target issues are well-documented in MDN/WCAG

**Research date:** 2026-07-05
**Valid until:** 2026-08-05 (stable domain — Web Audio API and WCAG standards change slowly)

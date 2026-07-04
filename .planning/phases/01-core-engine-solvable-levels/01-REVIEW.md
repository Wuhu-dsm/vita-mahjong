---
phase: 01-core-engine-solvable-levels
reviewed: 2026-07-04T20:17:48Z
depth: standard
files_reviewed: 45
files_reviewed_list:
  - .gitignore
  - index.html
  - package.json
  - public/assets/assets.json
  - public/assets/fonts/fonts.css
  - public/levels/.gitkeep
  - src/__tests__/BoardModel.test.ts
  - src/__tests__/TrayModel.test.ts
  - src/__tests__/blocked-feedback.test.ts
  - src/__tests__/free-tile.test.ts
  - src/__tests__/generator.test.ts
  - src/__tests__/renderer-budget.test.ts
  - src/__tests__/solver.test.ts
  - src/app/App.ts
  - src/app/assets.ts
  - src/app/config.ts
  - src/engine/BoardModel.ts
  - src/engine/GameState.ts
  - src/engine/Solver.ts
  - src/engine/TrayModel.ts
  - src/engine/isBlocked.ts
  - src/engine/types.ts
  - src/generator/LayoutBuilder.ts
  - src/generator/SolvableDealer.ts
  - src/generator/generate-levels.ts
  - src/main.ts
  - src/renderer/ScreenManager.ts
  - src/renderer/components/BlockedHint.ts
  - src/renderer/components/Button.ts
  - src/renderer/components/ComboFeedback.ts
  - src/renderer/components/FailurePopup.ts
  - src/renderer/components/HUD.ts
  - src/renderer/components/TileSprite.ts
  - src/renderer/components/Tray.ts
  - src/renderer/effects/ScoreFloater.ts
  - src/renderer/pools/TilePool.ts
  - src/renderer/screens/GameScreen.ts
  - src/renderer/screens/HomeScreen.ts
  - src/renderer/screens/ResultScreen.ts
  - tools/generate-assets.ts
  - tools/generate-levels.ts
  - tools/png-writer.ts
  - tsconfig.json
  - tsconfig.node.json
  - vite.config.ts
findings:
  critical: 0
  warning: 3
  info: 0
  total: 3
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-07-04T20:17:48Z
**Depth:** standard
**Files Reviewed:** 45
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

Reviewed the listed Phase 01 source/config files at standard depth, with extra attention on the 01-05 blocked-feedback path, renderer lifecycle, blocked-tile legality, timer cleanup, and mobile cue readability. The configured test suite and Vite build pass, but the current implementation still has three warning-level defects that should be fixed before treating this phase as stable.

## Warnings

### WR-01 (WARNING): Typecheck Configuration Fails Under The Submitted TypeScript Config

**File:** `tsconfig.json:14`; `tsconfig.json:19`; `tsconfig.node.json:3`
**Issue:** The root TypeScript project both references `tsconfig.node.json` and includes `tools` directly at `tsconfig.json:19`, while the referenced node project is composite at `tsconfig.node.json:3`. A direct `npm exec tsc -- --noEmit` fails with TS6305 because the root project consumes referenced tool files whose declaration outputs have not been built. The same run also fails TS5101 because `baseUrl` at `tsconfig.json:14` is deprecated under the submitted TypeScript 6 dependency. This leaves the repo without a working direct typecheck command, so CI or developer checks can report a broken tree even when tests/build pass.
**Fix:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "paths": {
      "src/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```
Also add an explicit script such as `"typecheck": "tsc -b --noEmit"` so project references are checked through build mode instead of the broken root-only invocation.

### WR-02 (WARNING): Renderer Lifecycle Registers Long-Lived Callbacks Without Teardown

**File:** `src/renderer/screens/GameScreen.ts:123`; `src/renderer/ScreenManager.ts:54`; `src/renderer/components/Tray.ts:165`
**Issue:** `GameScreen` adds `this.tick` to the Pixi ticker, `ScreenManager` adds a `resize` listener to `window`, and `Tray.playMatchRemoval()` adds a temporary ticker callback, but none of these owners expose a teardown path that removes all outstanding callbacks. In a mobile shell, hot reload, app destroy/recreate, or level reset during a match-removal animation, stale callbacks can retain destroyed containers and run `onComplete()` against a newer board state.
**Fix:**
```ts
override destroy(options?: DestroyOptions): void {
  this.ticker?.remove(this.tick);
  this.animations.length = 0;
  this.clearBlockedFeedback();
  super.destroy(options);
}

destroy(): void {
  this.stopTransition();
  window.removeEventListener('resize', this.resizeToRenderer);
}
```
Track the ticker callback created in `Tray.playMatchRemoval()` or return a cancel handle so `GameScreen.loadLevelModel()` and `destroy()` can cancel match-removal animation callbacks before replacing board state.

### WR-03 (WARNING): Blocked Hint Shrinks And Can Sort Behind Tiles On Dense Boards

**File:** `src/renderer/screens/GameScreen.ts:105`; `src/renderer/screens/GameScreen.ts:112`; `src/renderer/screens/GameScreen.ts:180`; `src/renderer/screens/GameScreen.ts:192`; `src/renderer/components/BlockedHint.ts:32`
**Issue:** `BlockedHint` is a child of `boardLayer`, and `boardLayer` is scaled down to fit dense layouts. With the submitted level 20 layout, the current bounds formula produces a board scale of about `0.72`, so the blocked cue's `28` font and `34` arrows shrink with the board. Because `boardLayer.sortableChildren` is enabled and the hint keeps the default `zIndex`, tile sprites with positive z-indices can also render over the hint after sorting. That violates the mobile readability contract for the blocked-tile cue, especially for older players.
**Fix:**
```ts
private readonly overlayLayer = new Container();

// Add once in constructor, above boardLayer content.
this.addChild(this.hud, this.tray, this.boardLayer, this.overlayLayer, this.comboFeedback, this.scoreFloater, this.failurePopup);
this.overlayLayer.addChild(this.blockedHint);

// Return canvas-space coordinates for the overlay instead of board-local coordinates.
this.blockedHint.showAt(clampedCanvasX, clampedCanvasY, now);
```
Keep the hint in an unscaled overlay layer, or explicitly compensate with inverse scale and a guaranteed top z-index.

## Verification

- `npm test -- --run` passed: 10 test files, 50 tests.
- `npm run build` passed.
- `npm exec tsc -- --noEmit` failed with TS6305 and TS5101, captured in WR-01.

---

_Reviewed: 2026-07-04T20:17:48Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_

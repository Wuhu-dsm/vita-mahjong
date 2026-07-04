---
phase: 01-core-engine-solvable-levels
reviewed: 2026-07-04T19:02:43Z
depth: standard
files_reviewed: 38
files_reviewed_list:
  - public/assets/assets.json
  - public/assets/fonts/fonts.css
  - public/levels/.gitkeep
  - src/__tests__/BoardModel.test.ts
  - src/__tests__/TrayModel.test.ts
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
findings:
  critical: 1
  warning: 6
  info: 0
  total: 7
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-07-04T19:02:43Z
**Depth:** standard
**Files Reviewed:** 38
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

Reviewed the submitted engine, generator, renderer, asset, and test files at standard depth. Existing `npm test -- --run` and `npm run build` both completed in the current workspace, but the review found one model state-corruption bug plus runtime robustness defects around transition cancellation, local JSON validation, generated-file test reliability, dev asset bootstrap, and inert font loading.

## Critical Issues

### CR-01: `GameState` can remove a board tile after the tray is already full

**Classification:** BLOCKER
**File:** `src/engine/GameState.ts:100`
**Issue:** `tapStone()` marks the board tile as picked before it asks `TrayModel` to accept the tile. `TrayModel.add()` checks for an empty slot at `src/engine/TrayModel.ts:30`, but when the tray is already full and the tile does not match an existing face, it silently returns `full: true` without storing the new tile. A second model-level tap after a failed/full state therefore removes a tile from `BoardModel` while the tray still contains only the previous four tiles. I reproduced this with an in-memory even-face level: after four unmatched taps the board had 6 remaining and 4 tray tiles; one extra tap returned `ok: true`, left the tray at 4 tiles, and dropped board remaining to 5.
**Fix:** Track terminal failure/win state in `GameState` and reject further taps before mutating the board. Also make `TrayModel.add()` return an explicit rejected result when it cannot accept a tile, so callers cannot accidentally drop state.

```ts
export class GameState {
  private terminal = false;

  tapStone(stoneId: string, timestamp = Date.now()): GameTapResult {
    const stone = this.getStone(stoneId);
    this.comboTracker.resetIfExpired(timestamp);

    if (this.terminal || !stone || stone.picked || !this.board.isFree(stone)) {
      if (!this.terminal) this.comboTracker.onBlockedTap();
      return this.result({ ok: false, blocked: !this.terminal, matched: false, removed: [], scoreAwarded: 0, stone });
    }

    this.board.pick(stone);
    const trayResult = this.tray.add(stone);
    // existing scoring...
    const result = this.result({ ok: true, blocked: false, matched: trayResult.matched, removed: trayResult.removed, scoreAwarded, stone });
    this.terminal = result.failed || result.won;
    return result;
  }
}
```

## Warnings

### WR-01: Runtime level JSON validation does not enforce the project's solvability and layer contract

**Classification:** WARNING
**File:** `src/renderer/screens/GameScreen.ts:351`
**Issue:** `validateLevel()` only checks basic shape, `stones.length <= 128`, and even face counts. It still accepts `maxLayer === 7` even though project levels are 7 layers max with zero-based `maxLayer === 6`, accepts empty levels, accepts duplicate `(z,x,y)` positions, does not require integer/ranged level ids, and does not verify the loaded JSON is actually solvable. Because `loadLevel()` consumes local JSON directly from `levels/${levelNumber}.json`, a stale or corrupted generated file can pass validation and start a blank, over-layered, overlapping, or unwinnable board.
**Fix:** Fail closed on runtime JSON by validating id range, integer `maxLayer` in `0..6`, non-empty even stone count, unique positions, max z consistency, and solver success after shape checks.

```ts
import { Solver } from '../../engine/Solver';

if (!Number.isInteger(value.id) || value.id < 1 || value.id > 20) {
  throw new Error('Malformed level: invalid id');
}
if (!Number.isInteger(value.maxLayer) || value.maxLayer < 0 || value.maxLayer > 6) {
  throw new Error(`Malformed level ${value.id}: maxLayer must be 0..6`);
}
if (parsedStones.length === 0 || parsedStones.length % 2 !== 0) {
  throw new Error(`Malformed level ${value.id}: invalid stone count`);
}
const seen = new Set<string>();
for (const stone of parsedStones) {
  const key = `${stone.z},${stone.x},${stone.y}`;
  if (seen.has(key)) throw new Error(`Malformed level ${value.id}: duplicate position ${key}`);
  seen.add(key);
}
const level = { id: value.id, name: value.name, theme: value.theme, maxLayer: value.maxLayer, stones: parsedStones };
if (!Solver.isSolvable(level)) throw new Error(`Malformed level ${value.id}: not solvable`);
```

### WR-02: Cancelling an active screen transition leaves the original `show()` promise unresolved

**Classification:** WARNING
**File:** `src/renderer/ScreenManager.ts:77`
**Issue:** `show()` calls `stopTransition()` before starting a new transition, but `stopTransition()` at `src/renderer/ScreenManager.ts:152` only removes the ticker callback and clears `this.transition`. The promise created at `src/renderer/ScreenManager.ts:101` never resolves or rejects. Rapid navigation or double-taps can leave callers awaiting a permanently pending transition and can strand the stage in a partially faded/scaled state until another transition repairs it.
**Fix:** Store a cancellation/settlement callback on the transition and always settle the prior promise when stopping it. Either snap to the previous stable screen or finish the in-flight transition deliberately.

```ts
interface ScreenTransition {
  // existing fields...
  cancel: () => void;
}

private stopTransition(): void {
  if (!this.transition) return;
  const transition = this.transition;
  this.app.ticker.remove(transition.tick);
  this.transition = null;
  transition.cancel();
}
```

### WR-03: Renderer budget test depends on ignored generated level JSON

**Classification:** WARNING
**File:** `src/__tests__/renderer-budget.test.ts:8`
**Issue:** The test reads `public/levels/20.json` from disk, but `public/levels/*.json` is gitignored and only `.gitkeep` is tracked (`public/levels/.gitkeep:1`). A clean checkout or CI job that runs `npm test` without first running `npm run generate-levels` will fail with `ENOENT` before it tests the renderer budget. This hides real regressions behind local generated state.
**Fix:** Generate level 20 in the test using the same source generator helpers, or generate into a temporary directory inside the test setup instead of reading ignored files.

```ts
const layout = LayoutBuilder.get(20);
const level = SolvableDealer.deal(
  layout,
  buildFacePairs(layout.theme, layout.positions.length / 2),
  createSeededRng(`${DEFAULT_SEED}:${layout.id}`),
);
expect(level.stones.length + TILE_POOL_TRAY_NODE_ALLOWANCE).toBeLessThanOrEqual(150);
```

### WR-04: Runtime assets and levels are required by `dev` but are only generated by `prebuild`

**Classification:** WARNING
**File:** `public/assets/assets.json:6`
**Issue:** The manifest points at PNG files under `public/assets/textures/`, and the game screen later fetches `public/levels/*.json`; both generated file sets are ignored by git. `npm run build` works because `prebuild` runs both generators, but a fresh clone running the dev server can 404 on the manifest textures and level JSON. The reviewed `.gitkeep` explicitly documents that level JSON is generated, but there is no tracked runtime fallback in the reviewed files.
**Fix:** Add a generation step for dev/test bootstrap, or stop ignoring required runtime artifacts. The low-friction fix is to wire `predev` and `pretest` to run the generators, then update tests to avoid depending on stale generated output.

```json
{
  "scripts": {
    "predev": "npm run generate-assets && npm run generate-levels",
    "pretest": "npm run generate-assets && npm run generate-levels"
  }
}
```

### WR-05: Font bundle is fetched as text but never applied to the document or Pixi text styles

**Classification:** WARNING
**File:** `public/assets/assets.json:42`
**Issue:** `App.ts` and `GameScreen.create()` load the `fonts` bundle, but the manifest marks `fonts.css` as a text asset. Pixi fetching a CSS file as text does not inject the stylesheet, so `public/assets/fonts/fonts.css` is inert. The `@font-face` family declared there (`Vita Noto Sans SC`) is also not used by the Pixi `Text` styles, which reference `Noto Sans SC` directly. The result is a false-positive asset load: the app appears to load fonts, but Chinese text rendering still depends on whatever system fonts happen to be available. If this CSS is later injected as-is, line 1 also introduces a Google Fonts network dependency for an otherwise local/offline H5 app.
**Fix:** Apply fonts through a real stylesheet import/link or the `FontFace` API, remove the text manifest entry, and avoid remote font imports for the local/offline build.

```html
<link rel="stylesheet" href="/assets/fonts/fonts.css" />
```

Then use the declared family consistently in Pixi styles:

```ts
fontFamily: 'Vita Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif'
```

### WR-06: No regression test covers `GameState` terminal tap behavior

**Classification:** WARNING
**File:** `src/__tests__/TrayModel.test.ts:20`
**Issue:** The tests cover `TrayModel`, scoring, combo tracking, and some `BoardModel` behavior, but there is no direct `GameState` test for the full-tray failure path, win terminal state, or repeated taps after failure. That gap allowed CR-01 to ship: the lower-level tray test correctly reports `full: true`, but no test asserts that `GameState` stops mutating board state once a result has `failed: true` or `won: true`.
**Fix:** Add focused `GameState` tests that fill the tray, call `tapStone()` again, and assert the remaining count and tray slots do not change. Also test that taps after `won` are rejected without changing score or board state.

```ts
it('does not mutate board state after a full-tray failure', () => {
  const game = new GameState(makeEvenFaceLevelWithFiveOpenFaces());
  const stones = game.getBoard().getStones();
  stones.slice(0, 4).forEach((stone) => game.tapStone(stone.id));
  const beforeRemaining = game.getBoard().getRemaining().length;
  const beforeTray = game.getTraySlots();

  const result = game.tapStone(stones[4].id);

  expect(result.ok).toBe(false);
  expect(game.getBoard().getRemaining()).toHaveLength(beforeRemaining);
  expect(game.getTraySlots()).toEqual(beforeTray);
});
```

---

_Reviewed: 2026-07-04T19:02:43Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_

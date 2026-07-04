---
phase: 01-core-engine-solvable-levels
verified: 2026-07-04T20:26:11Z
status: passed
score: "14/15 must-haves verified"
behavior_unverified: 1
overrides_applied: 0
deferred:

  - truth: "Home level-select grid for choosing any unlocked/generated level directly"
    addressed_in: "Phase 2"
    evidence: "Phase 2 success criteria include: User can choose any unlocked level from a level-select screen."
behavior_unverified_items:

  - truth: "Blocked feedback shows one coherent red-arrow/text cue without obscuring adjacent tiles."
    test: "Re-run Phase 01 UAT test 3 in a 20:9 portrait viewport after plan 01-05."
    expected: "A blocked tile does not select or move; it briefly dims, clears after about 1.2 seconds, and shows only one readable red-arrow/text cue without covering nearby tile faces, tray slots, or HUD controls."
    why_human: "Automated tests verify lifecycle and non-duplicated arrow ownership, but final readability/occlusion depends on Pixi canvas composition and mobile viewport perception. Review WR-03 remains a visual risk because BlockedHint is still inside the scaled/sortable board layer."
human_verification:

  - test: "Phase 01 UAT test 3: Blocked-Tile Feedback"
    expected: "A blocked tile cannot be selected or removed; the tile briefly dims, the cue fades after roughly 1.2 seconds, only one red-arrow/text cue with '被左右锁住' appears, and adjacent tile faces/tray/HUD remain readable."
    why_human: "The root cause is fixed in code and tests pass, but the final cue placement/readability must be inspected in the target mobile portrait browser/canvas."
re_verification:
  previous_status: human_needed
  previous_score: "11/13"
  gaps_closed:

    - "Blocked-tile stale dimming and duplicate persistent arrow implementation root cause closed by plan 01-05 code and regression tests."
  gaps_remaining: []
  regressions: []
---

# Phase 1: Core Engine & Solvable Levels Verification Report

**Phase Goal:** Players can start any of 20+ levels, see a correctly rendered stacked board, select and remove matching free tiles, and reach a win or deadlock state.
**Verified:** 2026-07-04T20:26:11Z
**Status:** human_needed
**Re-verification:** Yes - after gap-closure plan 01-05

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | User can start a level from the home screen and see tiles stacked in correct z-order. | VERIFIED | `HomeScreen` emits `START_LEVEL`; `App.startLevel()` calls `GameScreen.startLevel(level)` and `ScreenManager.show('game')`; `GameScreen.renderBoard()` loads validated level JSON, sets tile `zIndex = z * 10000 + y * 100 + x`, and sorts board children. Phase 01 UAT test 1 passed. |
| 2 | User can tap two matching free tiles and both are removed from the board. | VERIFIED | `GameScreen.handleTileTap()` delegates to `GameState.tapStone()`; `TrayModel` removes matching pairs immediately; Phase 01 UAT test 2 passed; `npm test -- --run` passes tray/game-state coverage. |
| 3 | Blocked tile taps never move or select the tile. | VERIFIED | One-off `GameState` spot-check rejected a covered tile tap with `blocked=true`, unchanged remaining count, and empty tray. `BoardModel.isFree()` uses shared `isBlocked()`; `GameScreen` returns from the blocked branch before tile flight/tray animation. |
| 4 | Blocked feedback clears automatically after the temporary hint window. | VERIFIED | `BlockedFeedbackLifecycle` clears the active tile on expiry, next blocked tap, explicit reset, level load, and board re-render. `npm test -- --run src/__tests__/blocked-feedback.test.ts src/__tests__/GameState.test.ts` passed 7 tests. |
| 5 | Blocked feedback shows one coherent red-arrow/text cue without obscuring adjacent tiles. | PRESENT_BEHAVIOR_UNVERIFIED | Code now makes `TileSprite.setBlocked()` dim-only and `BlockedHint` the only arrow/text owner, with compact arrows and clamped placement. No post-01-05 browser UAT confirms adjacent tile readability; review WR-03 notes the hint is still in the scaled/sortable board layer. |
| 6 | When the last tile is removed, the game transitions to a result screen. | VERIFIED | `GameState.test.ts` verifies final pair win; `GameScreen.finishTapResult()` emits `WIN`; `App.ts` updates `ResultScreen` and calls `ScreenManager.show('result')`; Phase 01 UAT test 4 passed. |
| 7 | When no legal moves remain, the game detects deadlock and offers shuffle or retry. | VERIFIED | `GameState.result()` reports failure for full tray or board deadlock; `FailurePopup` shows `重新开始` wired to reload the current level. Phase 01 UAT test 5 passed. Shuffle controls are explicitly Phase 2; retry satisfies the Phase 1 "shuffle or retry" criterion. |
| 8 | BoardModel loads levels, tracks remaining stones, and applies the PRD free-tile rule through one shared helper. | VERIFIED | `BoardModel` builds stone state, remaining set, neighbor lists, `getFree()`, `pick()`, `hasWon()`, and `isDeadlocked()`; `BoardModel.test.ts` and `free-tile.test.ts` pass. |
| 9 | Solver and generator prove levels are solvable with deterministic local generation. | VERIFIED | `SolvableDealer` uses fixed seed generation and shared `isBlocked`; `generate-levels.ts` validates each output with `Solver.isSolvable()` before writing JSON. |
| 10 | Game provides at least 20 playable levels and level 20 stays within 128 tiles / 7 layers. | VERIFIED | Runtime validation command accepted 20 generated JSON files; level 20 has 128 stones, `maxLayer=6`, and `maxZ=6`. |
| 11 | Each tile face appears an even number of times in every generated level. | VERIFIED | Runtime validation command counted faces across all 20 levels and found no odd counts; generator enforces this before writing JSON. |
| 12 | Generated level JSON is local and runtime validation rejects malformed or unsolvable data. | VERIFIED | `public/levels/{1..20}.json` are generated locally; `validatePlayableLevel()` enforces schema, tile count, duplicate position, layer, even-face, and `Solver.isSolvable()` checks. |
| 13 | Texture, font, and asset manifests exist and are wired through PixiJS asset loading. | VERIFIED | `public/assets/assets.json`, `fonts.css`, generated PNG textures, and `src/app/assets.ts` exist; screens/components load aliases through `loadAssets()` / `Assets.get()`. |
| 14 | Renderer stays within the roughly 150 tile-node budget through pooled sprites. | VERIFIED | `TilePool` caps allocation at 150; `renderer-budget.test.ts` verifies level 20 stones plus tray allowance are <= 150; `npm test -- --run` passes. |
| 15 | All game logic/data are local and no ads, IAP, backend, or coin economy mechanics are present. | VERIFIED | `package.json` has only `pixi.js` runtime and local dev tooling; banned monetization scans found no ads/IAP/shop/purchase/reward/currency mechanics. `HomeScreen` has a static visual `x0` label from the UI spec, but no economy behavior or package surface. |

**Score:** 14/15 truths verified; 1 present and wired but behavior/visual result remains unverified by post-fix UAT.

### Deferred Items

Items not yet met but explicitly addressed in later milestone phases.

| # | Item | Addressed In | Evidence |
|---|---|---|---|
| 1 | Home level-select grid for choosing any unlocked/generated level directly. | Phase 2 | Phase 2 success criteria include choosing any unlocked level from a level-select screen. Phase 1 has 20 generated levels and `GameScreen.startLevel(n)`, but Home currently exposes only `关卡 1` and sequential next-level flow. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/engine/BoardModel.ts`, `src/engine/isBlocked.ts` | Board state and centralized free-tile rule | VERIFIED | Substantive pure TypeScript, imported by engine/tests/generator. |
| `src/engine/TrayModel.ts`, `src/engine/GameState.ts` | Four-slot tray, scoring, combo, win/failure orchestration | VERIFIED | Substantive and covered by `TrayModel.test.ts` and `GameState.test.ts`; one-off blocked tap spot-check passed. |
| `src/engine/Solver.ts` | Solvability search | VERIFIED | Memoized bounded tray-state search used by generator and runtime validation. |
| `src/generator/LayoutBuilder.ts`, `src/generator/SolvableDealer.ts`, `src/generator/generate-levels.ts`, `tools/generate-levels.ts` | 20 deterministic solvable levels | VERIFIED | Build-time generation writes and validates 20 local JSON files. |
| `src/engine/validateLevel.ts` | Runtime level validation | VERIFIED | Rejects malformed, over-budget, duplicate-position, odd-face, and unsolvable level data. |
| `src/renderer/ScreenManager.ts`, `HomeScreen.ts`, `GameScreen.ts`, `ResultScreen.ts` | Basic home/game/result flow | VERIFIED | Substantive PixiJS containers, wired from `src/app/App.ts`; UAT already passed start, match, win, and retry flows. |
| `TileSprite`, `BlockedHint`, `GameScreen` blocked feedback lifecycle | Temporary non-duplicated blocked feedback | PRESENT_BEHAVIOR_UNVERIFIED | Code/test evidence is strong, but final viewport readability for the cue needs post-fix UAT. |
| `Tray`, `HUD`, `FailurePopup`, `ComboFeedback`, `ScoreFloater`, `TilePool` | Rendering/input feedback components | VERIFIED | Substantive components imported by `GameScreen`; tests/build pass. |
| `public/assets/assets.json`, `public/assets/fonts/fonts.css`, `public/assets/textures/*.png`, `src/app/assets.ts` | Generated assets and loader | VERIFIED | Assets generated by pretest/prebuild and loaded by manifest aliases. |
| `src/__tests__/*.test.ts` | Unit/static renderer coverage | VERIFIED | `npm test -- --run` passed 10 files / 50 tests. |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `HomeScreen` | `GameScreen` | `START_LEVEL` event -> `App.startLevel()` -> `ScreenManager.show('game')` | WIRED | Home starts level 1; result next button advances sequentially. Direct level-select grid deferred to Phase 2. |
| `GameScreen` | Level JSON / validation | `fetch('levels/{n}.json')` -> `validatePlayableLevel()` | WIRED | Runtime data is validated before `GameState` construction. |
| `GameScreen` | `GameState` / board / tray | `handleTileTap()` -> `state.tapStone()` -> render/HUD/tray updates | WIRED | Legal taps, blocked taps, scoring, win, and failure feed renderer actions. |
| `GameScreen` | `TileSprite` / `BlockedHint` | `BlockedFeedbackLifecycle.show()` + `BlockedHint.showAt()` | WIRED | Timed dimming and single hint cue are connected; post-fix visual UAT remains. |
| `isBlocked.ts` | Board, solver, dealer | Imports in `BoardModel`, `Solver`, `SolvableDealer` | WIRED | Free-tile rule has one source of truth. |
| `LayoutBuilder` | Generated levels | `SolvableDealer.deal()` -> `Solver.isSolvable()` -> `public/levels/*.json` | WIRED | `npm run generate-levels` generated 20 levels and runtime validation accepted all. |
| `GameState` win/failure | Result/failure UI | `GameScreen.WIN` -> `ResultScreen`; `result.failed` -> `FailurePopup.show()` | WIRED | Result screen and retry popup are connected. |
| Asset manifest | Screens/components | `loadAssets()` -> `Assets.get()` aliases | WIRED | Home/game/result bundles load before screen/component construction. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|---|---|---|---|---|
| `GameScreen` | `level` / `stones` | `public/levels/{n}.json`, generated by `generate-levels.ts` | Yes - 20 validated JSON files | FLOWING |
| `GameState` | `board`, `tray`, `score`, `combo` | User tile taps via `GameScreen.handleTileTap()` | Yes - state mutates through BoardModel/TrayModel | FLOWING |
| `BlockedFeedbackLifecycle` | active blocked tile / expiry | Blocked tap branch in `GameScreen.handleTileTap()` | Yes - current target clears on expiry/reset/re-render | FLOWING |
| `BlockedHint` | cue position / visible window | `GameScreen.getBlockedHintPosition()` and `config.timings.blockedFeedbackMs` | Yes - position is clamped, but final occlusion is visual-UAT only | FLOWING_WITH_HUMAN_CHECK |
| `ResultScreen` | `ResultStats` | `GameState.getStats()` on `GameScreen.WIN` | Yes - score/time/combo/level stats | FLOWING |
| `TileSprite` / `Tray` | Tile face/theme | Validated level stones and theme ids | Yes - symbols derive from generated face ids | FLOWING |
| `HUD` | Level/score/combo labels | `GameScreen.updateHud()` from `GameState` | Yes - labels update after taps | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full automated suite | `npm test -- --run` | 10 test files, 50 tests passed | PASS |
| Production build with prebuild generators | `npm run build` | Assets and 20 levels generated; Vite build passed | PASS |
| Runtime validation accepts all generated levels | `npx tsx -e "...validatePlayableLevel(...)"` | `validated 20 levels; level20 stones=128, maxLayer=6, maxZ=6` | PASS |
| Blocked tap does not mutate board/tray | `npx tsx -e "...GameState blocked tap spot-check..."` | `blocked tap rejected; remaining=4, tray=0, blocked=true` | PASS |
| Blocked feedback lifecycle and terminal-state regressions | `npm test -- --run src/__tests__/blocked-feedback.test.ts src/__tests__/GameState.test.ts` | 2 files, 7 tests passed | PASS |

### Probe Execution

| Probe | Command | Result | Status |
|---|---|---|---|
| Conventional probes | `find scripts -path '*/tests/probe-*.sh' -type f` | No `scripts/` directory and no phase-declared probes | SKIPPED |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| CORE-01 | 01-04 | Start a level from home and enter game screen | SATISFIED_WITH_UAT | Code wiring exists and Phase 01 UAT test 1 passed. |
| CORE-02 | 01-01, 01-04 | Select two free matching tiles to remove them | SATISFIED_WITH_UAT | Engine/tray tests pass and Phase 01 UAT test 2 passed. |
| CORE-03 | 01-01 | Enforce free-tile rule | SATISFIED | Shared `isBlocked`, BoardModel tests, free-tile tests, and blocked-tap spot-check pass. |
| CORE-04 | 01-04 | Detect win and show result screen | SATISFIED_WITH_UAT | GameState win test, screen wiring, and Phase 01 UAT test 4 passed. |
| CORE-05 | 01-04 | Detect deadlock/failure and offer shuffle or retry | SATISFIED_WITH_UAT | Full-tray terminal tests and retry popup wiring pass; Phase 01 UAT test 5 passed. |
| LVLS-01 | 01-02 | At least 20 playable levels | SATISFIED | 20 generated/runtime-validated levels exist. |
| LVLS-02 | 01-02 | Level 20 no more than 128 tiles and 7 layers | SATISFIED | Level 20 has 128 stones, max z 6, and maxLayer 6. |
| LVLS-03 | 01-02 | Every level guaranteed solvable | SATISFIED | Generator and runtime validation call `Solver.isSolvable()`. |
| LVLS-04 | 01-02 | Every face appears an even number of times | SATISFIED | Generator asserts counts; runtime check found zero odd counts. |
| ACCS-03 | 01-04, 01-05 | Selected and blocked tiles visually highlighted | HUMAN_NEEDED | Selection/blocked code and 01-05 tests pass; post-fix blocked-cue readability/occlusion UAT is still required. |
| VISL-04 | 01-03, 01-04 | Renderer stays within ~150 tile-node budget | SATISFIED | Pool cap and renderer budget test pass. |
| PLAT-02 | 01-01, 01-02 | All game logic/data run locally without backend | SATISFIED | Local TS engine, generated public JSON/assets, no API/backend service. |
| PLAT-04 | 01-01 | No ads, IAP, or coin economy | SATISFIED_WITH_NOTE | No monetization dependencies or mechanics found. Static `HomeScreen` `x0` label is visual-only per UI spec and has no earn/spend/store path. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---:|---|---|---|
| `src/*`, `tools/*` | - | No unresolved `TBD`, `FIXME`, or `XXX` markers found | - | No debt-marker blocker. |
| `src/main.ts`, `src/generator/generate-levels.ts` | - | `console.log` | INFO | Bootstrap/generator status logging only; not a stub or blocker. |
| `tsconfig.json`, `tsconfig.node.json` | 14 | `npm exec tsc -- --noEmit` fails with TS6305/TS5101 | WARNING | Matches review WR-01. Not a Phase 01 goal blocker because configured `npm test` and `npm run build` pass, but should be fixed before adding a typecheck CI gate. |
| `src/renderer/screens/GameScreen.ts`, `src/renderer/ScreenManager.ts`, `src/renderer/components/Tray.ts` | - | Long-lived ticker/window callbacks lack teardown | WARNING | Matches review WR-02. It does not prevent current Phase 01 gameplay, but it is a lifecycle risk for hot reload/destroy/recreate flows. |
| `src/renderer/screens/GameScreen.ts`, `src/renderer/components/BlockedHint.ts` | - | `BlockedHint` remains in scaled/sortable `boardLayer` | WARNING | Review WR-03 is partially mitigated by compacting/removing duplicate arrows, but final mobile readability remains the human UAT item. |
| `src/renderer/screens/HomeScreen.ts` | 77 | Static `x0` visual label | INFO | No economy mechanics found; note retained for PLAT-04 audit visibility. |

### Human Verification Required

#### 1. Phase 01 UAT Test 3: Blocked-Tile Feedback

**Test:** Open the app in a 20:9 portrait mobile viewport, start a level, and tap a tile visibly covered or side-blocked by other tiles.

**Expected:** The tile is not selected, moved to the tray, or removed. It briefly dims, clears after roughly 1.2 seconds, shows only one red-arrow/text cue with `被左右锁住`, and nearby tile faces, tray slots, and HUD controls remain readable.

**Why human:** The rule, timeout, reset lifecycle, and non-duplicated cue ownership are covered by code/tests. Final cue readability and occlusion depend on rendered Pixi canvas composition in the target viewport.

### Gaps Summary

No blocking implementation gaps were found. Plan 01-05 closes the prior blocked-feedback root cause in code: stale dimming now clears, tile-local persistent arrows are gone, and regression tests cover lifecycle/ownership. The phase should remain `human_needed` until Phase 01 UAT test 3 is re-run and marked pass.

---

_Verified: 2026-07-04T20:26:11Z_
_Verifier: the agent (gsd-verifier)_

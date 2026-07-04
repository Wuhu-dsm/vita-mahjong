---
phase: 01-core-engine-solvable-levels
verified: 2026-07-04T19:31:03Z
status: human_needed
score: 11/13 must-haves verified
behavior_unverified: 2
overrides_applied: 0
deferred:
  - truth: "Home level-select grid for choosing any unlocked/generated level directly"
    addressed_in: "Phase 2"
    evidence: "Phase 2 success criteria include: User can choose any unlocked level from a level-select screen."
behavior_unverified_items:
  - truth: "User can start a level from the home screen and see tiles stacked in correct z-order"
    test: "Open the app in a mobile portrait browser, tap the home-screen level button, and inspect the rendered stacked board."
    expected: "The game screen appears, level data is loaded, and upper-layer tiles visibly cover lower-layer tiles without incoherent overlap."
    why_human: "Code sorts by z/y/x and build passes, but no automated browser/canvas screenshot test verifies actual visual stacking."
  - truth: "Blocked tiles cannot be selected and free/blocked states are visually distinct"
    test: "Tap a visibly covered or side-blocked tile during play."
    expected: "The tile is not removed or added to the tray; it dims and shows red-arrow feedback with the text '被左右锁住'."
    why_human: "Engine free/blocked rules are tested, but visual feedback placement/readability and touch behavior are not exercised by automated browser tests."
human_verification:
  - test: "Mobile start and board rendering"
    expected: "In a 20:9 portrait viewport, tapping '关卡 1' on the home screen transitions to the game screen and shows a correctly stacked board."
    why_human: "Canvas rendering, z-order perception, and transition feel require browser/device inspection."
  - test: "Free-tile match interaction"
    expected: "Tapping two matching free tiles moves them to the tray, clears the pair, updates score/combo, and removes both board tiles."
    why_human: "GameState and tray behavior are tested, but Pixi pointer/touch feel and tile-flight animation are not covered by unit tests."
  - test: "Blocked-tile feedback"
    expected: "A blocked tile cannot be selected and shows dimming, red arrows, and '被左右锁住' without obscuring nearby UI."
    why_human: "Automated tests verify the rule, not the rendered feedback quality."
  - test: "Win flow"
    expected: "Clearing all tiles transitions to the result screen with time, score, combo, progress, and next-level action."
    why_human: "Engine win state is tested, but the full touch-to-screen-transition flow needs browser play-through."
  - test: "Failure and retry flow"
    expected: "Filling the tray with 4 unmatched tiles, or reaching a no-move state, shows the failure popup with '重新开始' and retry resets the level."
    why_human: "Full-tray terminal behavior is tested, but popup placement and restart UX need visual/touch verification."
---

# Phase 1: Core Engine & Solvable Levels Verification Report

**Phase Goal:** Players can start any of 20+ levels, see a correctly rendered stacked board, select and remove matching free tiles, and reach a win or deadlock state.  
**Verified:** 2026-07-04T19:31:03Z  
**Status:** human_needed  
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | User can start a level from the home screen and see tiles stacked in correct z-order. | PRESENT_BEHAVIOR_UNVERIFIED | `HomeScreen` emits `START_LEVEL`; `App` calls `GameScreen.startLevel()` and `ScreenManager.show('game')`; `GameScreen.renderBoard()` loads validated JSON and sorts tiles by `z * 10000 + y * 100 + x`. Needs browser/canvas visual check. |
| 2 | User can tap two matching free tiles and both are removed from the board. | VERIFIED | `GameScreen.handleTileTap()` delegates legality to `GameState.tapStone()`; `GameState.test.ts` exercises clearing a matching pair to win; `TrayModel.test.ts` verifies immediate pair removal. |
| 3 | Blocked tiles cannot be selected and free/blocked states are visually distinct. | PRESENT_BEHAVIOR_UNVERIFIED | `BoardModel.isFree()` delegates to shared `isBlocked`; `GameScreen` shows `TileSprite.setBlocked(true)` and `BlockedHint`. Rule tests pass, but rendered feedback needs human browser verification. |
| 4 | When the last tile is removed, the game transitions to a result screen. | VERIFIED | `GameState.test.ts` verifies a final pair clears the board; `GameScreen` emits `WIN`; `App` updates `ResultScreen` stats and calls `ScreenManager.show('result')`. |
| 5 | When no legal moves remain, the game detects failure and offers shuffle or retry. | VERIFIED | `GameState.test.ts` verifies full-tray terminal behavior; `GameState.result()` reports `failed` for full tray or board deadlock; `FailurePopup` exposes `重新开始` retry wired to `GameScreen.startLevel()`. Phase 2 owns full shuffle controls. |
| 6 | BoardModel loads levels, tracks remaining stones, and applies the PRD free-tile rule through one shared helper. | VERIFIED | `BoardModel` builds stones, remaining set, neighbor lists, `getFree()`, `pick()`, `hasWon()`, and `isDeadlocked()`; `BoardModel.test.ts` and `free-tile.test.ts` pass. |
| 7 | Solver and generator prove levels are solvable with deterministic local generation. | VERIFIED | `SolvableDealer` uses `DEFAULT_SEED`, `LayoutBuilder`, and shared `isBlocked`; `generate-levels.ts` validates each level with `Solver.isSolvable()` before writing JSON. |
| 8 | Game provides at least 20 playable levels and level 20 stays within 128 tiles / 7 layers. | VERIFIED | Runtime JSON check found 20 levels; level 20 has 128 stones, `maxLayer` 6, and max z 6. |
| 9 | Each tile face appears an even number of times in every generated level. | VERIFIED | Generator assertions and runtime JSON check found zero odd face counts. |
| 10 | Generated level JSON is written locally and runtime validation rejects malformed or unsolvable data. | VERIFIED | `public/levels/{1..20}.json` generated by `pretest`/`prebuild`; `validatePlayableLevel()` enforces schema, count, budget, duplicate positions, even faces, and `Solver.isSolvable()`. |
| 11 | Texture, font, and asset manifests exist and are wired through PixiJS asset loading. | VERIFIED | 16 generated PNGs, `fonts.css`, `assets.json`, and `src/app/assets.ts` exist; screens and `TileSprite` use `loadAssets()`/`Assets.get()` aliases. |
| 12 | Renderer stays within the roughly 150 tile-node budget through pooled sprites. | VERIFIED | `TilePool` caps allocation at 150; `renderer-budget.test.ts` verifies level 20 stones + tray allowance <= 150. |
| 13 | All game logic/data are local and no ads, IAP, backend, or coin economy packages are present. | VERIFIED | `package.json` dependencies are `pixi.js`; dev stack is `@types/node`, `tsx`, `typescript`, `vite`, `vitest`; banned commercial/ad/IAP dependency scan returned none. |

**Score:** 11/13 truths verified; 2 present and wired but browser/mobile behavior remains unverified.

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|---|---|---|
| 1 | Home level-select grid for choosing any unlocked/generated level directly. | Phase 2 | Phase 2 success criteria include choosing any unlocked level from a level-select screen; Phase 1 supports generated levels and programmatic/sequential loading. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/engine/BoardModel.ts`, `src/engine/isBlocked.ts` | Board state and centralized free-tile rule | VERIFIED | Substantive pure TypeScript, imported by engine/tests/generator. |
| `src/engine/TrayModel.ts`, `src/engine/GameState.ts` | Four-slot tray, scoring, combo, win/failure orchestration | VERIFIED | Substantive and covered by `TrayModel.test.ts` and `GameState.test.ts`. |
| `src/engine/Solver.ts` | Solvability search | VERIFIED | Memoized bounded tray-state search; used by generator and runtime validation. |
| `src/generator/LayoutBuilder.ts`, `src/generator/SolvableDealer.ts`, `src/generator/generate-levels.ts`, `tools/generate-levels.ts` | 20 deterministic solvable levels | VERIFIED | Build-time generation writes and validates 20 local JSON files. |
| `src/engine/validateLevel.ts` | Runtime level validation | VERIFIED | Rejects malformed, over-budget, duplicate-position, odd-face, and unsolvable levels. |
| `src/renderer/ScreenManager.ts`, `HomeScreen.ts`, `GameScreen.ts`, `ResultScreen.ts` | Basic home/game/result flow | VERIFIED | Substantive PixiJS containers, wired from `src/app/App.ts`; visual UAT still required. |
| `TileSprite`, `Tray`, `HUD`, `BlockedHint`, `FailurePopup`, `ScoreFloater`, `TilePool` | Rendering/input feedback components | VERIFIED | Substantive components, all imported by `GameScreen`. |
| `public/assets/assets.json`, `public/assets/fonts/fonts.css`, `public/assets/textures/*.png`, `src/app/assets.ts` | Generated assets and loader | VERIFIED | Assets generated by `npm run generate-assets`; manifest loader used by app/screens/components. |
| `src/__tests__/*.test.ts` | Unit and static renderer coverage | VERIFIED | `npm test -- --run` passed 9 files / 45 tests. |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `HomeScreen` | `GameScreen` | `START_LEVEL` event -> `App.startLevel()` -> `ScreenManager.show('game')` | WIRED | `App.ts` creates all screens and registers home/result/game events. |
| `GameScreen` | Level JSON / validation | `fetch('levels/{n}.json')` -> `validatePlayableLevel()` | WIRED | Runtime data is validated before `GameState` construction. |
| `GameScreen` | `GameState` / board / tray | `handleTileTap()` -> `state.tapStone()` -> render/HUD/tray updates | WIRED | Free taps, blocked taps, scoring, win, and failure feed renderer actions. |
| `isBlocked.ts` | Board, solver, dealer | Imports in `BoardModel`, `Solver`, `SolvableDealer` | WIRED | Free-tile rule has one source of truth. |
| `LayoutBuilder` | Generated levels | `SolvableDealer.deal()` -> `Solver.isSolvable()` -> `public/levels/*.json` | WIRED | `npm run generate-levels` generated 20 levels and runtime validation accepted all. |
| `GameState` win/failure | Result/failure UI | `GameScreen.WIN` -> `ResultScreen`; `result.failed` -> `FailurePopup.show()` | WIRED | Result screen and retry popup are connected. |
| Asset manifest | Screens/components | `loadAssets()` -> `Assets.get()` aliases | WIRED | Home/game/result bundles load before screen construction. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|---|---|---|---|---|
| `GameScreen` | `level` / `stones` | `public/levels/{n}.json` generated by `generate-levels.ts` | Yes - 20 validated JSON files | FLOWING |
| `GameState` | `board`, `tray`, `score`, `combo` | User tile taps via `GameScreen.handleTileTap()` | Yes - state mutates through BoardModel/TrayModel | FLOWING |
| `ResultScreen` | `ResultStats` | `GameState.getStats()` on `GameScreen.WIN` | Yes - score/time/combo/level stats | FLOWING |
| `TileSprite` / `Tray` | Tile face/theme | Validated level stones and theme ids | Yes - symbols derive from generated face ids | FLOWING |
| `HUD` | Level/score/combo labels | `GameScreen.updateHud()` from `GameState` | Yes - labels update after taps | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full automated suite | `npm test -- --run` | 9 test files, 45 tests passed | PASS |
| Production build with prebuild generators | `npm run build` | Assets and 20 levels generated; Vite build passed | PASS |
| Runtime validation accepts all generated levels | `npx tsx -e "...validatePlayableLevel(...)"` | `validated 20 runtime levels` | PASS |
| GameState terminal behavior | `npm test -- --run src/__tests__/GameState.test.ts` | 1 file, 2 tests passed | PASS |
| Runtime validation and renderer budget | `npm test -- --run src/__tests__/level-validation.test.ts src/__tests__/renderer-budget.test.ts` | 2 files, 6 tests passed | PASS |

### Probe Execution

| Probe | Command | Result | Status |
|---|---|---|---|
| Conventional probes | `find scripts -path '*/tests/probe-*.sh' -type f` | No `scripts/` directory and no phase-declared probes | SKIPPED |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| CORE-01 | 01-04 | Start a level from home and enter game screen | HUMAN_NEEDED | Code wiring exists; mobile/browser start flow needs UAT. |
| CORE-02 | 01-01, 01-04 | Select two free matching tiles to remove them | SATISFIED_WITH_UAT | Engine/tray tests pass; touch/animation needs UAT. |
| CORE-03 | 01-01 | Enforce free-tile rule | SATISFIED | Shared `isBlocked` and unit coverage. |
| CORE-04 | 01-04 | Detect win and show result screen | SATISFIED_WITH_UAT | GameState win test and screen wiring; result visual flow needs UAT. |
| CORE-05 | 01-04 | Detect deadlock/failure and offer shuffle or retry | SATISFIED_WITH_UAT | Full-tray failure and retry popup wired; retry satisfies Phase 1, shuffle deferred to Phase 2 controls. |
| LVLS-01 | 01-02 | At least 20 playable levels | SATISFIED | Generated/runtime-validated 20 levels. |
| LVLS-02 | 01-02 | Level 20 no more than 128 tiles and 7 layers | SATISFIED | Level 20 has 128 stones, max z 6, maxLayer 6. |
| LVLS-03 | 01-02 | Every level guaranteed solvable | SATISFIED | Generator and runtime validation call `Solver.isSolvable()`. |
| LVLS-04 | 01-02 | Every face appears an even number of times | SATISFIED | Generator asserts counts; runtime check found zero odd counts. |
| ACCS-03 | 01-04 | Selected and blocked tiles visually highlighted | HUMAN_NEEDED | `TileSprite.highlight()` and `setBlocked()` exist; visual/readability check needed. |
| VISL-04 | 01-03, 01-04 | Renderer stays within ~150 tile-node budget | SATISFIED | Pool cap and renderer budget test pass. |
| PLAT-02 | 01-01, 01-02 | All game logic/data run locally without backend | SATISFIED | Local TS engine, generated public JSON/assets, no backend/API service. |
| PLAT-04 | 01-01 | No ads, IAP, or coin economy | SATISFIED | Dependency scan found no commercial/ad/IAP packages; no monetization code paths found. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---:|---|---|---|
| None | - | No unresolved `TBD`, `FIXME`, `XXX`, stubs, or placeholder user-facing implementation found in source files | - | No blocker anti-patterns. |
| `src/main.ts`, `src/generator/generate-levels.ts` | - | `console.log` | INFO | Bootstrap/generator status logging only; not a stub or blocker. |

### Human Verification Required

#### 1. Mobile Start And Board Rendering

**Test:** Open the built app in a mobile portrait browser/viewport and tap `关卡 1`.  
**Expected:** The game screen appears, the level board is visible, and upper-layer tiles visually cover lower-layer tiles.  
**Why human:** Canvas visual stacking and mobile transition feel are not covered by the automated checks.

#### 2. Free-Tile Match Interaction

**Test:** Tap two matching free tiles during level play.  
**Expected:** Both tiles move to the tray, match, disappear, update score/combo, and no stale sprite remains on the board.  
**Why human:** Unit tests cover state transitions; browser touch, animation, and visual removal need play-through.

#### 3. Blocked-Tile Feedback

**Test:** Tap a tile visibly covered by another tile or locked on both long sides.  
**Expected:** It is not selected or removed; it dims and shows red arrows plus `被左右锁住`.  
**Why human:** Rule enforcement is tested, but feedback placement and readability need visual QA.

#### 4. Win Flow

**Test:** Complete a level.  
**Expected:** The result screen appears with time, score, combo/progress text, beat-ratio text, and a next-level button.  
**Why human:** End-to-end screen transition and stats presentation need browser play-through.

#### 5. Failure And Retry Flow

**Test:** Fill the tray with four unmatched tiles, then tap `重新开始`.  
**Expected:** The failure popup appears, retry reloads the current level, and score/combo/tray reset.  
**Why human:** Terminal state is tested, but popup UX and restart feel require a mobile/browser check.

### Gaps Summary

No blocking implementation gaps were found. Automated tests, runtime level validation, generated assets/levels, and production build all pass. The phase should not be marked fully passed until the listed mobile/browser UAT verifies canvas z-order, touch behavior, visual feedback readability, and end-to-end result/failure flows.

---

_Verified: 2026-07-04T19:31:03Z_  
_Verifier: the agent (gsd-verifier)_

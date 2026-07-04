---
phase: 01-core-engine-solvable-levels
plan: 02
subsystem: levels
tags: [typescript, vite, vitest, mahjong-solitaire, solver, generator]

requires:
  - phase: 01-core-engine-solvable-levels
    provides: [BoardModel, Solver, isBlocked, TypeScript scaffold]
provides:
  - 20 deterministic level layouts with Phase 1 tile and layer budgets
  - Backward-dealt solvable level generation with fixed seed
  - Build-time JSON generation into public/levels
  - Generator and solver validation tests
affects: [renderer, runtime-level-loader, tests, build]

tech-stack:
  added: []
  patterns:
    - "LayoutBuilder owns level specs and theme face sets."
    - "SolvableDealer assigns face pairs only to currently free stones."
    - "generate-levels validates budgets, even face counts, and Solver.isSolvable before writing JSON."

key-files:
  created:
    - src/generator/LayoutBuilder.ts
    - src/generator/SolvableDealer.ts
    - src/generator/generate-levels.ts
    - tools/generate-levels.ts
    - public/levels/.gitkeep
    - src/__tests__/generator.test.ts
    - src/__tests__/solver.test.ts
  modified:
    - src/engine/types.ts
    - src/engine/Solver.ts
    - .gitignore

key-decisions:
  - "Use DEFAULT_SEED plus the level id for stable per-level generation."
  - "Track only public/levels/.gitkeep; generated public/levels/*.json files remain ignored."
  - "Upgrade Solver to bounded backtracking because duplicate face IDs make greedy validation insufficient."
  - "Resolve the D-09 overlapping theme ranges by assigning levels 13-15 to oriental, while levels 12 and 16 remain traditional."

patterns-established:
  - "Theme face sets are exported from LayoutBuilder and expanded into pair lists by buildFacePairs."
  - "Build-time generation fails fast on unsolvable, odd-count, over-budget, or missing level data."
  - "Solver validation uses memoized tray-state search capped at 250000 visited states."

requirements-completed: [LVLS-01, LVLS-02, LVLS-03, LVLS-04]

coverage:
  - id: D1
    description: "Level 1 through 20 layouts exist with exact tile counts, even position counts, and level 20 within 128 tiles / 7 layers."
    requirement: LVLS-01
    verification:
      - kind: unit
        ref: "src/__tests__/generator.test.ts#LayoutBuilder"
        status: pass
      - kind: other
        ref: "node level 20 JSON validation command"
        status: pass
    human_judgment: false
  - id: D2
    description: "SolvableDealer produces deterministic even-count face assignments from a fixed seed."
    requirement: LVLS-04
    verification:
      - kind: unit
        ref: "src/__tests__/generator.test.ts#SolvableDealer"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every generated level passes Solver.isSolvable before JSON is written."
    requirement: LVLS-03
    verification:
      - kind: unit
        ref: "src/__tests__/solver.test.ts#levels 1, 10, and 20"
        status: pass
      - kind: integration
        ref: "npm run generate-levels"
        status: pass
    human_judgment: false
  - id: D4
    description: "Build pipeline regenerates level JSON before production build."
    requirement: LVLS-01
    verification:
      - kind: integration
        ref: "npm run generate-levels && test $(ls public/levels/*.json 2>/dev/null | wc -l) -eq 20 && npm run build"
        status: pass
    human_judgment: false

duration: 14min
completed: 2026-07-04
status: complete
---

# Phase 01 Plan 02: Solvable Levels Summary

**Deterministic build-time generation for 20 solvable Mahjong levels with even face counts and level-20 budget validation**

## Performance

- **Duration:** 14 min
- **Started:** 2026-07-04T17:53:57Z
- **Completed:** 2026-07-04T18:08:18Z
- **Tasks:** 3/3 complete
- **Files modified:** 10

## Accomplishments

- Authored level layouts 1-20 with exact PRD tile counts, even position counts, theme ids, and max layer budgets.
- Implemented deterministic backward-dealing with `DEFAULT_SEED = 'vita-mahjong-v1'`.
- Added build-time generation and validation for `public/levels/1.json` through `20.json`.
- Added generator and solver tests covering layout budgets, even face counts, deterministic output, dead-end rejection, and levels 1/10/20 solvability.
- Cleared the prior build blocker by adding `tools/generate-levels.ts`; `npm run build` now runs generation and completes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define level 1-20 layouts in LayoutBuilder** - `280b14d` (`feat`)
2. **Task 2 RED: Add failing tests for SolvableDealer** - `fef76e4` (`test`)
3. **Task 2 GREEN: Implement SolvableDealer and deterministic RNG** - `3abed56` (`feat`)
4. **Task 3: Build-time generator script and validation pipeline** - `39b5aa1` (`feat`)

## Files Created/Modified

- `src/engine/types.ts` - Added `ThemeId`, `FaceSet`, and `LevelLayout` contracts.
- `src/generator/LayoutBuilder.ts` - Level specs, theme face sets, and layout construction.
- `src/generator/SolvableDealer.ts` - Fixed-seed RNG and free-pair dealing.
- `src/generator/generate-levels.ts` - Node generator with budget, face-count, and solver validation.
- `tools/generate-levels.ts` - npm script wrapper for `tsx tools/generate-levels.ts`.
- `public/levels/.gitkeep` - Keeps the generated-level directory present in fresh clones.
- `src/__tests__/generator.test.ts` - LayoutBuilder and SolvableDealer coverage.
- `src/__tests__/solver.test.ts` - Solver validation for generated levels 1, 10, and 20.
- `src/engine/Solver.ts` - Replaced greedy-only verification with bounded tray-state search.
- `.gitignore` - Ignores generated `public/levels/*.json` while allowing `.gitkeep`.

## Decisions Made

- Package scripts were already present from Plan 01-01, so no `package.json` change was needed.
- The D-09 theme overlap was resolved by treating levels 13-15 as oriental and levels 12/16 as traditional.
- Generated JSON remains untracked; build-time generation is the source of truth.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Solver rejected solvable generated boards with duplicate face IDs**
- **Found during:** Task 2 and Task 3
- **Issue:** The existing solver used one greedy path. Duplicate face IDs let it match a legal but strategically wrong duplicate pair, causing false unsolvable results for generated boards.
- **Fix:** Replaced greedy-only verification with bounded memoized tray-state search that prioritizes matching tray faces but backtracks when duplicate matches are ambiguous.
- **Files modified:** `src/engine/Solver.ts`
- **Verification:** `npm test -- --run`; `npm run generate-levels && ... && npm run build`
- **Committed in:** `3abed56`, finalized in `39b5aa1`

**2. [Rule 3 - Blocking] Existing ignore rule prevented tracking `.gitkeep`**
- **Found during:** Task 3
- **Issue:** `.gitignore` ignored the entire `public/levels/` directory, conflicting with the plan requirement to track `public/levels/.gitkeep`.
- **Fix:** Changed the ignore rule to `public/levels/*.json`.
- **Files modified:** `.gitignore`, `public/levels/.gitkeep`
- **Verification:** `git status --ignored --short public/levels/` shows generated JSON ignored.
- **Committed in:** `39b5aa1`

---

**Total deviations:** 2 auto-fixed (1 Rule 1, 1 Rule 3).
**Impact on plan:** Both fixes were required to satisfy the solvability and generated-output tracking contracts.

## Issues Encountered

- `npm run generate-levels` initially failed at level 11 because duplicate face IDs exposed a solver false negative. The bounded solver fix resolved this.
- An extra, non-required `tsc` project-reference check exposed existing TypeScript config issues unrelated to the generator/build path. This is logged in `deferred-items.md`; required plan verification still passes.

## Verification

- `npm run generate-levels && test $(ls public/levels/*.json 2>/dev/null | wc -l) -eq 20 && npm run build` - passed.
- `npm test -- --run` - passed, 36 tests across 5 files.
- `git status --ignored --short public/levels/` - generated JSON files are ignored.
- Level 20 JSON validation - passed: 128 stones, `maxZ` 6, `maxLayer` 6.

## User Setup Required

None - no external service configuration required.

## Deferred Issues

- Standalone TypeScript project-reference/typecheck cleanup is deferred. The current required Vite build and Vitest suite pass, but `tsc --noEmit` / `tsc -b --noEmit` surface existing config issues around `tsconfig.node.json`, Vite test config typing, and TypeScript 6 deprecation handling.

## Next Phase Readiness

Plan 01-03 can consume deterministic generated level JSON and the exported theme ids/face sets when producing tile textures and manifests. Plan 01-04 can load `public/levels/{id}.json` knowing generation enforces tile count, layer budget, even face counts, and solver validation.

## Self-Check: PASSED

- Created files verified on disk.
- Task commits `280b14d`, `fef76e4`, `3abed56`, and `39b5aa1` verified in git history.
- `gsd-tools query verify-summary .planning/phases/01-core-engine-solvable-levels/01-02-SUMMARY.md` passed.

---
*Phase: 01-core-engine-solvable-levels*
*Completed: 2026-07-04*

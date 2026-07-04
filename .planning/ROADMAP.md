# Roadmap: Vita Mahjong

## Overview

Deliver a mobile-first Mahjong Solitaire experience in three coarse phases: first build a trustworthy engine and solvable level catalog, then wrap it in an accessible home → game → result flow with audio and assist controls, and finally add persistence, polish effects, and distribution builds. Each phase produces a playable, verifiable milestone.

## Phases

- [ ] **Phase 1: Core Engine & Solvable Levels** - Deterministic board model, free-tile rule, solvable generation, basic rendering/input, and win/deadlock detection
- [ ] **Phase 2: UI/UX, Accessibility & Game Flow** - Screens, HUD, level select, senior-friendly visuals, low-pressure mode, audio, undo/hint/shuffle
- [ ] **Phase 3: Polish, Persistence & Distribution** - Settings/progress persistence, session recovery, particles, performance tiers, PWA/native H5 builds

## Phase Details

### Phase 1: Core Engine & Solvable Levels
**Goal**: Players can start any of 20+ levels, see a correctly rendered stacked board, select and remove matching free tiles, and reach a win or deadlock state.
**Depends on**: Nothing (first phase)
**Requirements**: CORE-01, CORE-02, CORE-03, CORE-04, CORE-05, LVLS-01, LVLS-02, LVLS-03, LVLS-04, ACCS-03, VISL-04, PLAT-02, PLAT-04
**Success Criteria** (what must be TRUE):
  1. User can start a level from the home screen and see tiles stacked in correct z-order.
  2. User can tap two matching free tiles and both are removed from the board.
  3. Blocked tiles cannot be selected and free/blocked states are visually distinct.
  4. When the last tile is removed, the game transitions to a result screen.
  5. When no legal moves remain, the game detects deadlock and offers shuffle or retry.
**Plans**: 3 plans
**Risk Notes**:
  - Free-tile rule must be centralized and property-tested; boundary/layer cases are error-prone.
  - Level-20 density (≤128 tiles, 7 layers) may require build-time generation or a Web Worker to avoid startup jank.
  - Rendering budget (~150 nodes) must be validated on a low-end device target early.
**UI hint**: yes

Plans:
- [ ] 01-01-PLAN.md — Scaffold project, core engine types, BoardModel, Solver, and free-tile rule tests
- [ ] 01-02-PLAN.md — 20+ level layouts, solvable face generation, and build-time validation
- [ ] 01-03-PLAN.md — PixiJS renderer, touch input, home/game/result screens, and win/deadlock detection

### Phase 2: UI/UX, Accessibility & Game Flow
**Goal**: Players can navigate the full home → level-select → game → result flow with senior-friendly visuals, audio, assist controls, and a true low-pressure mode.
**Depends on**: Phase 1
**Requirements**: CORE-06, LVLS-05, ACCS-01, ACCS-02, ACCS-04, ACCS-05, VISL-01, VISL-02, AUDI-01, AUDI-02, AUDI-03, RSLT-01, RSLT-02, PLAT-01
**Success Criteria** (what must be TRUE):
  1. User can move between home, level-select, game, and result screens without losing game state.
  2. User can choose any unlocked level from a level-select screen.
  3. Tiles are large, high-contrast, and readable on a 20:9 mobile portrait screen.
  4. User can tap undo, hint, and shuffle buttons at any time during a level.
  5. Low-pressure mode hides timer and score and removes all urgency cues from the HUD.
  6. Sound effects and background music play and can be independently muted/controlled.
  7. Result screen shows level completion, time/score when enabled, and retry/next buttons.
**Plans**: 3 plans
**Risk Notes**:
  - Hint/shuffle must remain solution-aware to avoid dead-ends; reuse Solver from Phase 1.
  - Accessibility targets (≥10–12 mm physical tile width, WCAG contrast) need validation on real devices.
  - Relaxed mode must suppress combo decay and time multipliers, not just hide the timer.
**UI hint**: yes

Plans:
- [ ] 02-01: Build home screen, level-select grid, game HUD, and result screen flow
- [ ] 02-02: Implement Oriental classical theme, large/high-contrast tile set, selection/blocked highlights, and low-pressure mode
- [ ] 02-03: Add one-tap undo/hint/shuffle, audio manager with SFX/music/mute, and accessibility verification

### Phase 3: Polish, Persistence & Distribution
**Goal**: Player progress and settings survive restarts, visual effects degrade gracefully on low-end devices, and the project builds for mobile web / native H5 distribution.
**Depends on**: Phase 2
**Requirements**: VISL-03, PROG-01, PROG-02, PLAT-03
**Success Criteria** (what must be TRUE):
  1. Match and elimination feedback includes smooth animations and degradable particle effects.
  2. Unlocked levels, audio settings, and low-pressure preference persist after app restart.
  3. Closing and reopening the game restores the last active level, undo history, and selection.
  4. Project produces a static mobile web build and can be wrapped as a native H5 app (e.g., Capacitor).
**Plans**: 2 plans
**Risk Notes**:
  - localStorage writes during play can jank; persist only at level end, pause, or app background.
  - Session recovery must include the full undo stack and active selection, not just level number.
  - Particle/object-pool budget and low-end fallback must be measured on target hardware.
**UI hint**: yes

Plans:
- [ ] 03-01: Persist settings and progress in localStorage; implement session recovery including undo stack
- [ ] 03-02: Add degradable particles/animations, performance quality tiers, PWA manifest, and native H5 wrapper

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Engine & Solvable Levels | 0/3 | Not started | - |
| 2. UI/UX, Accessibility & Game Flow | 0/3 | Not started | - |
| 3. Polish, Persistence & Distribution | 0/2 | Not started | - |

## Coverage Validation

All 31 v1 requirements map to exactly one phase:

| Phase | Requirement Count | IDs |
|-------|-------------------|-----|
| Phase 1 | 13 | CORE-01–CORE-05, LVLS-01–LVLS-04, ACCS-03, VISL-04, PLAT-02, PLAT-04 |
| Phase 2 | 14 | CORE-06, LVLS-05, ACCS-01–ACCS-02, ACCS-04–ACCS-05, VISL-01–VISL-02, AUDI-01–AUDI-03, RSLT-01–RSLT-02, PLAT-01 |
| Phase 3 | 4 | VISL-03, PROG-01–PROG-02, PLAT-03 |

**Total mapped:** 31/31 ✓  
**Orphaned:** 0 ✓  
**Duplicated:** 0 ✓

---
*Roadmap created: 2026-07-04*
*Granularity: coarse*

# Roadmap: Vita Mahjong

## Overview

Deliver a mobile-first Mahjong Solitaire experience in three coarse phases: first build a trustworthy engine and solvable level catalog, then wrap it in an accessible home → game → result flow with audio and assist controls, and finally add persistence, polish effects, and distribution builds. Each phase produces a playable, verifiable milestone.

## Phases

- [x] **Phase 1: Core Engine & Solvable Levels** - Deterministic board model, free-tile rule, solvable generation, basic rendering/input, and win/deadlock detection (completed 2026-07-04)
- [x] **Phase 2: UI/UX, Accessibility & Game Flow** - Screens, HUD, level select, senior-friendly visuals, low-pressure mode, audio, undo/hint/shuffle (completed 2026-07-05)
- [x] **Phase 3: Polish, Persistence & Distribution** - Settings/progress persistence, session recovery, particles, performance tiers, PWA/native H5 builds (completed 2026-07-04)

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

**Plans**: 5/5 plans complete
**Risk Notes**:

  - Free-tile rule must be centralized and property-tested; boundary/layer cases are error-prone.
  - Level-20 density (≤128 tiles, 7 layers) may require build-time generation or a Web Worker to avoid startup jank.
  - Rendering budget (~150 nodes) must be validated on a low-end device target early.

**UI hint**: yes

Plans:

**Wave 1**

- [x] 01-01-PLAN.md — Scaffold project, core engine types, BoardModel, Solver, and free-tile rule tests

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — 20+ level layouts, solvable face generation, and build-time validation

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Procedurally generate textures, font manifest, and PixiJS asset loader

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-04-PLAN.md — PixiJS renderer, touch input, home/game/result screens, and win/deadlock detection

**Wave 5** *(gap closure after Phase 01 UAT)*

- [x] 01-05-PLAN.md — Timed blocked-tile feedback lifecycle and compact non-duplicated blocked hint

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

**Plans**: 3/3 plans complete
**Risk Notes**:

  - Hint/shuffle must remain solution-aware to avoid dead-ends; reuse Solver from Phase 1.
  - Accessibility targets (≥10–12 mm physical tile width, WCAG contrast) need validation on real devices.
  - Low-pressure mode REMOVED per D-03 (user decision in CONTEXT.md). Timer and score always visible.
  - Shuffle does not guarantee post-shuffle solvability per RESEARCH.md A4 — deadlock detection handles this.

**UI hint**: yes

Plans:

**Wave 1**

- [x] 02-01-PLAN.md — Screen flow, navigation, tile layout grid parameters, HUD timer, dynamic level button
- *(02-01 modifies ScreenManager, HomeScreen, GameScreen, HUD, App — sets foundation for Waves 2)*

**Wave 2** *(parallel execution: 02-02 and 02-03 both depend on 02-01)*

- [x] 02-02-PLAN.md — Assist controls: undo (3x), hint (3x via Solver), shuffle (1x) with count-limited AssistBar
- [x] 02-03-PLAN.md — Audio system (Web Audio API SFX + pentatonic BGM) + Settings screen with volume/mute controls

### Phase 3: Polish, Persistence & Distribution

**Goal**: Player progress and settings survive restarts, visual effects degrade gracefully on low-end devices, and the project builds for mobile web / native H5 distribution.
**Depends on**: Phase 2
**Requirements**: VISL-03, PROG-01, PROG-02, PLAT-03
**Success Criteria** (what must be TRUE):

  1. Match and elimination feedback includes smooth animations and degradable particle effects.
  2. Unlocked levels, audio settings, and low-pressure preference persist after app restart.
  3. Closing and reopening the game restores the last active level, undo history, and selection.
  4. Project produces a static mobile web build and can be wrapped as a native H5 app (e.g., Capacitor).

**Plans**: 2/2 plans complete
**Risk Notes**:

  - localStorage writes during play can jank; persist only at level end, pause, or app background.
  - Session recovery must include the full undo stack and active selection, not just level number.
  - Particle/object-pool budget and low-end fallback must be measured on target hardware.

**UI hint**: yes

Plans:

**Wave 1**

- [x] 03-01-PLAN.md — localStorage persistence (level + audio), session recovery (currentLevel), performance detection, Reset Progress button with confirmation dialog

**Wave 2** *(blocked on Wave 1 completion — reads config added in 03-01)*

- [x] 03-02-PLAN.md — ParticleBurst effect (object-pooled, 15-20/8-10 particles), GameScreen integration, PWA manifest + Service Worker (vite-plugin-pwa), app icons

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Engine & Solvable Levels | 5/5 | Complete   | 2026-07-04 |
| 2. UI/UX, Accessibility & Game Flow | 3/3 | Complete   | 2026-07-05 |
| 3. Polish, Persistence & Distribution | 2/2 | Complete   | 2026-07-04 |

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

# Project Research Summary

**Project:** Vita Mahjong
**Domain:** Mobile Mahjong Solitaire (tile-matching puzzle)
**Researched:** 2026-07-04
**Confidence:** MEDIUM-HIGH

## Executive Summary

Vita Mahjong is a mobile-first Mahjong Solitaire game targeting seniors, beginners, and casual players. Research shows the category is saturated but most competitors degrade the experience with ads, small tiles, account requirements, and inconsistent solvability. The strongest product opportunity is not novelty mechanics, but a clean, accessible, guaranteed-solvable single-player experience with large touch targets, high-contrast visuals, and an optional low-pressure mode.

The recommended approach is a monolithic single-page web app built with **PixiJS 8 + TypeScript + Vite**. A deterministic `BoardModel` serves as the single source of truth, fed by a solvable level generator that constructs layouts by backward dealing or forward simulation. PixiJS handles the 150-sprite budget, z-ordering, touch hit-testing, and degradable particles far better than DOM or raw Canvas 2D. State is managed locally with Zustand and persisted via `localStorage`; Capacitor can wrap the static build for app-store distribution without changing the core engine.

The key risks are all solvable with early focus: (1) generating truly solvable boards, (2) implementing the free-tile rule correctly, and (3) meeting senior-accessibility and low-end-performance requirements. These must be validated in the first phase, because every downstream feature—hints, shuffle, scoring, and undo—depends on a correct engine.

## Key Findings

### Recommended Stack

The stack is lightweight, modern, and mobile-friendly. PixiJS is the clear rendering choice for 128–150 stacked tiles at 60 fps; Vite provides fast HMR and a static `dist/` output that Capacitor or a PWA plugin can consume. TypeScript is essential for the tile-state and event-shape complexity. Howler abstracts mobile audio autoplay quirks, and Zustand adds only ~1 kB for global game state.

**Core technologies:**
- **PixiJS `^8.19.0`** — 2D WebGL/WebGPU rendering engine. Handles ~150 tile sprites, explicit z-ordering, touch events, particles, and alpha blending at 60 fps with automatic Canvas 2D fallback.
- **TypeScript `^5.7.0` (via Vite)** — Type-safe game logic for tile state, level data, and event shapes.
- **Vite `^8.1.3`** — Dev server, bundler, and production build. Outputs a static `dist/` suitable for web, PWA, or Capacitor wrapping.
- **howler.js `^2.2.3`** — Sound effects and background music with iOS/Safari autoplay-policy handling and a tiny footprint.
- **Zustand `^5.0.14`** — Minimal global store for level progress, settings, undo/hint state, and UI route.
- **Capacitor `^8.4.1`** — Optional native wrapper for iOS/Android; consumes the Vite `dist/` without requiring a frontend framework.

### Expected Features

The feature set splits cleanly into table stakes, differentiators, and anti-features. The MVP must deliver the core loop plus accessibility and solvability; cosmetics and meta-progression can wait.

**Must have (table stakes):**
- Classic pair-matching rules with free-tile detection and highlighting — users expect this to feel correct.
- 20+ distinct layouts escalating to 128 tiles / 7 layers — standard progression.
- Undo, Hint, Shuffle — basic assistance tools; multi-step undo is expected.
- Timer & score with the ability to toggle them off — required for both engagement and low-pressure play.
- Level select / progress map — players want to choose and see completion.
- Sound & music with mute and volume controls — expected ambiance.
- Offline play — all logic is local per project constraints.
- Result / victory screen with retry and next-level flow — closure after each level.

**Should have (competitive):**
- Guaranteed solvable layouts — eliminates the #1 frustration and is a strong selling point.
- Elderly-first accessibility — large tiles (~10–12 mm physical width), high contrast, generous touch targets, clear fonts.
- Toggleable low-pressure mode — removes timer, score, and combo-decay pressure.
- One-tap undo / hint controls — large, always-visible buttons reduce cognitive and motor load.
- Oriental classical art direction — distinctive visual identity; must not sacrifice readability.
- Smooth match/elimination animations with degradable particle feedback — reinforces combo "爽感".
- Ad-free / no-IAP experience — aligns with constraints and stands out against competitors.
- Persistent session recovery — resume exactly where the player left off, including undo stack.

**Defer (v2+):**
- Multiple unlockable themes and backgrounds — add after core validation.
- Daily challenges / achievements / seasons — maintenance burden outside core value.
- Advanced social features or cloud save — requires backend or adds friction.
- Wildcard / power-up tiles — breaks classic Mahjong expectations.

### Architecture Approach

Experts build Mahjong Solitaire as a thin client around a deterministic game-state core. The renderer is a pure function of `BoardModel`; input mutates the model and the view reflects it. This separation is critical for reliable undo, hints, and solvability checks.

**Major components:**
1. **GameController** — Owns game phase state (menu/playing/result), starts levels, processes matches, checks win/loss.
2. **BoardModel** — Canonical tile array with positions, faces, and matched flag; exposes `isFree`, `findMatches`, `isSolved`.
3. **LayoutManager** — Loads per-level tile position maps (x, y, z); pure data, no rendering.
4. **Solver** — Determines free tiles, counts available matches, finds hints, detects deadlocks, validates solvability.
5. **Generator** — Assigns tile faces to a layout so the board is provably solvable via forward simulation + backtracking.
6. **InputHandler** — Translates pointer/canvas coordinates into tile hits, debounces taps, handles deselect.
7. **Renderer** — Draws the board in z-order, highlights selection/blocked state, triggers match animations.
8. **Animator** — Runs selection pulse, match shrink/fade, particle bursts; falls back to simple fade on low-end devices.
9. **AudioManager** — Plays click, match, win, button sounds; respects mute setting.
10. **ScreenManager** — Switches between home, game, and result screens without page reload.
11. **Settings/Storage** — Persists audio, low-pressure mode, unlocked levels, best times in `localStorage`.

### Critical Pitfalls

1. **Assuming random layouts are solvable** — Mahjong Solitaire solvability is NP-complete; published classic layouts have 0.62%–100% unsolvable rates. Avoid by generating via backward dealing / forward simulation so solvability is guaranteed by construction, and validate every shipped layout with a solver.
2. **Broken free-tile detection** — Off-by-one errors in boundary and layered cases break trust. Avoid by defining occupancy on a discrete grid with explicit z-layer and centralizing the `isFree` rule in one tested function.
3. **Hints and shuffles that create dead-ends** — Highlighting any matching pair or shuffling blindly can leave the board unsolvable. Avoid by implementing solution-aware hints and solver-validated shuffles.
4. **Touch targets and typography that exclude seniors** — Small tiles and low contrast alienate the target audience. Avoid by designing for ~10–12 mm physical tile width, high-contrast symbols, WCAG-compliant text, and a large-tile accessibility mode.
5. **Frame-rate collapse on low-end devices** — 150+ tiles plus particles exceed budget phones. Avoid with WebGL batching, a sprite atlas, integer coordinates, object-pooled particles, and a degradable effects tier.
6. **Forced timer/score pressure without a real escape** — Relaxed mode must suppress all urgency cues, not just hide the timer. Avoid by surfacing the toggle prominently and removing combo decay, time-based multipliers, and leaderboard prompts in relaxed mode.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Engine & Solvable Levels
**Rationale:** Rendering and UI are useless until the board model, free-tile rule, and solvable generation are correct. This is the foundation every other feature depends on.
**Delivers:** Tile/position types, `BoardModel`, `Solver`, `Generator`, 20 level layouts, basic PixiJS renderer, tap input, win/deadlock detection.
**Addresses:** Core match logic, 20+ solvable levels, free-tile detection, guaranteed solvability.
**Avoids:** Random unsolvable layouts (Pitfall 1), broken free-tile detection (Pitfall 2), low-end rendering collapse (Pitfall 5).

### Phase 2: UI/UX, Assist Systems & Game Modes
**Rationale:** Once the engine is trustworthy, wrap it in the home → game → result flow and add the accessibility-first controls that differentiate the product.
**Delivers:** Home screen, game HUD, result screen, undo/hint/shuffle UI, low-pressure mode toggle, accessibility visuals, audio manager, oriental classical theme.
**Addresses:** Undo, hint, shuffle, timer/score toggles, level select, result screen, accessibility, low-pressure mode, sound & music.
**Avoids:** Hint/shuffle dead-ends (Pitfall 3), senior-unfriendly UX (Pitfall 4), relaxed mode still stressful (Pitfall 6).

### Phase 3: Polish, Persistence & Distribution
**Rationale:** With core gameplay and UX complete, add persistence, effects, quality tiers, and distribution wrappers.
**Delivers:** Settings/progress persistence, session recovery, combo indicator, degradable particles/haptics, PWA manifest, Capacitor native wrappers, performance benchmarking.
**Addresses:** Session recovery, combo indicator, haptics, multiple build targets.
**Avoids:** Low-end performance collapse (Pitfall 5), state loss on backgrounding.

### Phase Ordering Rationale

- **Engine before UI:** The `BoardModel`/`Solver`/`Generator` triad is a strict dependency for everything else; rendering and input are meaningless without it.
- **Solvability before assists:** Hints and shuffles must be solution-aware, which requires the solver and generator to already exist and be validated.
- **Accessibility alongside core UX:** Senior-friendly sizing and low-pressure mode should be designed into the HUD and result flow from the start, not bolted on later.
- **Distribution last:** Web, PWA, and native wrappers all consume the same Vite `dist/`; they should be wired once the game is feature-complete.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Solvable generation algorithm for 128-tile / 7-layer layouts and exact PixiJS v8 API patterns (sprite atlas, touch events, z-ordering). Recommend `/gsd-plan-phase --research-phase 1`.
- **Phase 2:** Accessibility validation and art-direction research for high-contrast oriental classical tile sets. Recommend `/gsd-plan-phase --research-phase 2`.

Phases with standard patterns (skip research-phase):
- **Phase 3:** PWA manifest, Capacitor wrapping, `localStorage` persistence, and Zustand state are well-documented patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official releases and docs for PixiJS, Vite, TypeScript, Howler, Zustand, Capacitor. Alternatives evaluated. |
| Features | MEDIUM-HIGH | Competitor analysis plus established Mahjong Solitaire conventions; some prioritization is reasoning-based. |
| Architecture | MEDIUM | Reference implementations exist (`jmcragun/mahjong-solitaire-engine`, `tcottrill/myMahjong`), but exact component boundaries need validation. |
| Pitfalls | LOW-MEDIUM | Algorithmic findings are cross-checked (Wikipedia, mjsolver study); UX/performance guidance is authoritative (W3C, MDN) but applied via reasoning. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Level layout coordinates:** Research identified the need for 20+ escalating layouts but did not produce the actual position maps. These must be authored or sourced during Phase 1 planning.
- **Asset pipeline:** No decision yet on tile spritesheet resolution, scale variants, or audio asset sourcing/licensing. Phase 2 planning should resolve this.
- **Performance baseline:** Low-end device targets (e.g., Mali-G52 / Adreno 5xx class) are inferred; real-world frame-time validation is needed in Phase 3.
- **Generator runtime cost:** For 128-tile boards, generation may need to be pre-computed at build time or moved to a Web Worker. Phase 1 planning should benchmark and decide.
- **Solvability vs. difficulty balance:** Guaranteeing a solution does not guarantee an enjoyable difficulty curve; seed tuning or difficulty rating may be needed after playtesting.

## Sources

### Primary (HIGH confidence)
- PixiJS v8.x docs and release `v8.19.0` — rendering, sprite batching, touch events, z-ordering.
- Vite release `v8.1.3` — build tooling, static output, PWA plugin.
- howler.js `v2.2.3` — mobile audio autoplay abstraction.
- Capacitor release `8.4.1` — native web-view wrapper for iOS/Android.
- Zustand release `v5.0.14` — minimal global state for TypeScript.

### Secondary (MEDIUM confidence)
- Wikipedia — Mahjong solitaire rules, PSPACE/NP-completeness, shuffle/undo conventions.
- de Bondt / Radboud University — Solitaire Mahjongg solver and empirical unsolvability rates for 10M turtle deals.
- Microsoft Mahjong, Mahjong Epic, Netflix Mahjong — competitor feature lists, monetization, and UX gaps.
- `jmcragun/mahjong-solitaire-engine` — TypeScript implementation with `BoardSolver`, `LayoutManager`, `MahjongGame`.
- `tcottrill/myMahjong` — Single-file PWA using canvas rendering, inline SVG sprites, and forward-simulation solvable generation.
- `acvrp-lab/mahjong-solitaire-algorithm` — C++ reference for depth-first forward simulation to generate solvable boards.

### Tertiary (LOW confidence)
- W3C WAI — Older Users and Web Accessibility applied to mobile tile games.
- MDN — Canvas optimization guidance applied to WebGL/sprite rendering choices.
- User reviews from app stores — qualitative signals about small tiles, ads, and account requirements.

---
*Research completed: 2026-07-04*
*Ready for roadmap: yes*

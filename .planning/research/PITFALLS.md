# Pitfalls Research

**Domain:** Mobile Mahjong Solitaire (tile-matching / 麻将连连看)
**Researched:** 2026-07-04
**Confidence:** LOW–MEDIUM

> Confidence note: Core solvability and algorithmic findings are cross-checked between Wikipedia and the mjsolver empirical study (MEDIUM). UX and performance guidance draws on W3C/WAI and MDN (authoritative) but is applied to this specific domain via reasoning (LOW–MEDIUM). No first-party competitor teardowns were available.

## Critical Pitfalls

### Pitfall 1: Assuming Random Layouts Are Solvable

**What goes wrong:**
Players reach mid-board and discover no legal moves remain. Frustration spikes, especially for casual/senior users who blame themselves rather than the generator. Retention drops and reviews cite "impossible levels."

**Why it happens:**
Mahjong Solitaire is mathematically hard (PSPACE-complete to play optimally, NP-complete to decide solvability with perfect information). Empirical analysis of 10 million classic "turtle" deals found ~2.95% unsolvable even when the player can peek at hidden tiles; other published layouts range from 0.62% (Theater) to 100% (Hourglass, Papillon) unsolvable. Random placement or naive forward dealing reproduces these failure rates.

**How to avoid:**
- Use **backward dealing**: start from an empty board and place pairs in reverse order, guaranteeing at least one valid removal sequence exists.
- OR run a **solver validation** pass on every generated layout before presenting it to the player.
- Track the guaranteed solution path (or one valid path) so hints can guide toward a real win, not just any match.

**Warning signs:**
- QA reports "stuck" boards.
- Win-rate statistics vary wildly by level seed.
- Shuffle gets used frequently because the board has dead-ended.

**Phase to address:**
Phase 1 — Level Generation & Core Rules. This must be the first hardened system; every downstream feature (hints, shuffle, scoring) depends on it.

---

### Pitfall 2: Broken "Free Tile" Detection

**What goes wrong:**
Tiles become selectable when they should be blocked, or vice versa. Players match illegally buried tiles, or cannot select obviously exposed tiles, breaking trust in the game.

**Why it happens:**
The rule is subtle: a tile is free only when (a) no tile sits above it, and (b) at least one horizontal side (left or right) is open. Boundary tiles, partially overlapping stacks, and unusual aspect-ratio layouts are rich sources of off-by-one errors.

**How to avoid:**
- Define tile occupancy on a discrete grid with explicit z-layer per cell.
- Write property-based tests that assert: a selected tile has `height == max(height of its footprint)` and `(left cell empty) OR (right cell empty)`.
- Visualize free tiles in a debug overlay during development.

**Warning signs:**
- Players report tiles "flickering" between selectable and not.
- Automated playtests make illegal moves or fail to complete solvable boards.
- Hint system highlights a tile that the input system rejects.

**Phase to address:**
Phase 1 — Core Engine / Input. Fix the shared `isFree(tile)` function; do not patch individual callers.

---

### Pitfall 3: Hints and Shuffles That Preserve or Restore Solvability

**What goes wrong:**
A hint recommends the first matching pair it finds, which happens to be a dead-end branch. A shuffle rearranges remaining tiles into a new unsolvable configuration. The player uses the safety net and still loses.

**Why it happens:**
Matching any two free identical tiles is not enough; the pair must leave the board in a solvable state. Shuffling without solver validation can recreate the same unsolvable statistics as random placement.

**How to avoid:**
- Implement **solution-aware hints**: traverse the precomputed solution path and highlight the next pair in that path. If the player has deviated, run a solver from the current state to find a new winning sequence.
- Make **shuffle solvability-guaranteed**: only accept shuffles that the solver validates, or reshuffle repeatedly until solvable (with a fallback to backward-redeal).
- Cap the number of shuffles per level and communicate it clearly.

**Warning signs:**
- Hints frequently lead to boards with no remaining moves.
- Shuffle usage correlates with losses rather than recoveries.
- Analytics show high hint-use followed by level-abandon.

**Phase to address:**
Phase 2 — Hint/Shuffle/Assist Systems.

---

### Pitfall 4: Touch Targets and Typography That Exclude Seniors

**What goes wrong:**
Older players mis-tap, cannot distinguish similar tiles, or give up because text and icons are too small. The game feels hostile to the exact audience it targets.

**Why it happens:**
Age-related decline in contrast sensitivity, near-focus, fine motor control, and short-term memory is normal. A design that looks fine to a 25-year-old developer on a high-end OLED is often unusable for a 65-year-old on a mid-range LCD.

**How to avoid:**
- Minimum tile size should be roughly **10–12 mm physical width** (about 90–110 CSS px at typical mobile densities) on the design baseline.
- Add generous **spacing between tiles** to prevent adjacent mis-taps.
- Use **high-contrast tile faces** (dark symbols on light ground or vice versa) and avoid relying on color alone; include shape/texture/pattern differentiation.
- Provide a "large tiles" accessibility mode that re-scales the board layout.
- Keep UI text at least **18 px** with strong contrast ratios (WCAG AA: 4.5:1 normal, 3:1 large).

**Warning signs:**
- High tap-error rate on analytics heatmaps.
- User feedback: "I can't tell the bamboo 6 from the bamboo 9."
- Players abandon on the first level despite simple layouts.

**Phase to address:**
Phase 2 — UI/UX & Visual Design.

---

### Pitfall 5: Frame-Rate Collapse on Low-End Devices

**What goes wrong:**
The game stutters, drains battery, or crashes on older phones when particles, shadows, and 150+ independently animated tiles render every frame.

**Why it happens:**
Canvas 2D performance degrades with many draw calls, state changes, sub-pixel coordinates, shadow effects, and per-frame full clears. A 7-layer board with 128+ tiles plus particles easily exceeds the budget of a Mali-G52 or Adreno 5xx class GPU in software-rendering paths.

**How to avoid:**
- Use a **WebGL/GPU-backed renderer** (e.g., Phaser 4 with WebGL, PixiJS) and a **sprite atlas** for tiles rather than drawing each tile from raw canvas primitives.
- Cache static backgrounds and tile faces on offscreen canvases; only re-render what changed.
- Batch draw calls, use integer coordinates, and avoid `shadowBlur`/text rendering in the hot path.
- Make particles **toggleable and degradable**: reduce count, simplify sprites, or disable entirely in low-quality mode.
- Target **60 fps on mid-range** and **30 fps stable on low-end**, not 60 everywhere.

**Warning signs:**
- Frame time exceeds 16 ms on target hardware.
- Device warms up quickly; battery drains.
- Particles cause visible hitching.

**Phase to address:**
Phase 1 — Rendering & Core Loop, with Phase 3 polish tuning.

---

### Pitfall 6: Forced Timer/Score Pressure Without a Real Escape

**What goes wrong:**
The "low pressure" setting is buried in options, still shows a ticking clock, or disables scoring but leaves combo timers. Senior and casual players feel rushed and stop playing.

**Why it happens:**
Designers often treat relaxed modes as an afterthought, simply hiding the HUD rather than rebalancing feedback. Any implicit time pressure (animation queues, combo windows, leaderboard prompts) undermines the promised stress-free experience.

**How to avoid:**
- Surface the **Relaxed / Timed toggle** prominently on the home screen and in pause menu.
- In relaxed mode: remove countdowns, combo decay, and time-based score multipliers; keep positive feedback (matches, clears) but eliminate urgency cues.
- Preserve separate high-score tables or simply disable scoring in relaxed mode to avoid comparison pressure.

**Warning signs:**
- Players enable relaxed mode but still mention feeling "rushed."
- Completion rate in relaxed mode is not meaningfully higher than timed mode.

**Phase to address:**
Phase 2 — Game Modes & Onboarding.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Forward random tile placement + manual QA for solvability | Fast level creation | High rework, angry players, unreliable metrics | Never for shipped levels |
| Store board state as flat array without z-layer | Simpler serialization | Free-tile bugs, collision errors, hard-to-extend layouts | Never |
| Hint = first matching free pair | Simple to implement | Leads players into dead ends, degrades trust | Only as placeholder; replace before beta |
| Canvas 2D with per-tile drawImage and no atlas | Quick prototype | Poor scaling, jank on low-end, large asset memory | Prototype only |
| Single global difficulty curve with fixed layouts | Easier balancing | Boredom or difficulty spikes; hard to add levels | Replace with seed-based generation + solver-rated difficulty |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Analytics (optional) | Logging every tile interaction, causing frame drops | Batch events and flush on level end/pause |
| Ad SDKs (out of scope) | N/A — project prohibits ads | N/A |
| IAP (out of scope) | N/A — project prohibits monetization | N/A |
| Social sharing (out of scope) | Blocking UI while waiting for share sheet | N/A — not planned |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Creating a new particle object per match | GC pauses, frame stutters | Object pool for particles; pre-allocate arrays | >20 particles/sec on low-end |
| Re-drawing the entire board every frame on Canvas 2D | High CPU, battery drain | Dirty-rectangle rendering or WebGL sprite batching | >80 tiles on screen |
| Loading full-resolution tile art for all screen densities | Memory bloat, slow startup | Use a sprite atlas with mip/scale variants | >144 tile faces on mobile |
| Synchronous localStorage writes during gameplay | UI jank on write | Defer saves to level end / pause; use async where available | Every session on slow storage |
| Continuous hint scan every frame | Wasted CPU | Recompute hints only on board state change | Always |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting client-side high-score storage | Easy score spoofing if leaderboards added later | Store scores in-memory only; if persisted, use signed local values and server validation only if a backend is introduced |
| Loading third-party tile assets from remote URLs | CSP bypass, broken offline play, tracking | Bundle all assets; use `Content-Security-Policy` if deployed as PWA |
| Exposing internal solver/solvability flags in save data | Players could reconstruct guaranteed solutions | Keep solution path server-side if online; offline, treat it as client-side convenience, not secret |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Tiles differ only by color | Colorblind players cannot distinguish suits | Add symbol shape, texture, or border patterns; provide a colorblind palette |
| Ambiguous selected-state highlight | Players don't know which tile is active | Use scale, glow, and audio feedback; support deselect by tapping again |
| Disappearing undo history after app backgrounding | Players lose progress and trust | Persist full game state including undo stack; restore on resume |
| Obscured top-layer tiles by UI chrome | Cannot see or tap tiles under menus | Keep play area clear; use safe-area insets on notched devices |
| Overly long victory/defeat screens | Breaks flow, especially in short sessions | Keep results concise; allow tap-to-skip with clear progress summary |
| Inconsistent iconography for seasons/flowers/winds | Beginners don't know which tiles match | Provide a quick reference or on-demand legend in early levels |
| No feedback on invalid tap | Users tap repeatedly, thinking the game is frozen | Play a subtle "blocked" sound or visual nudge |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Level generation:** Generates 20 levels, but has every layout been solver-validated? — verify with 100% automated solver pass.
- [ ] **Free-tile rule:** Looks correct on turtle layout, but tested on custom 7-layer layouts and boundary conditions? — verify with property-based tests.
- [ ] **Undo:** Restores removed tiles, but does it restore the exact prior exposed/free state and hint history? — verify state equality after multiple undo/redo cycles.
- [ ] **Hint:** Highlights a matching pair, but does that pair lead toward a guaranteed solution? — verify against solver path.
- [ ] **Relaxed mode:** Timer hidden, but are combo timers, score multipliers, and leaderboard prompts also suppressed? — verify UX audit.
- [ ] **Accessibility:** Text size option exists, but are touch targets and tile symbols also scaling? — verify on smallest target device.
- [ ] **Offline:** Game loads offline, but do levels 11–20 rely on lazy-loaded assets? — verify with network disabled from first launch.
- [ ] **Save/resume:** State saved on exit, but is the undo stack and active selection restored? — verify by killing app mid-level.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Unsolvable levels in the wild | HIGH | Add runtime solver + auto-shuffle on dead-end; regenerate level catalog; apologize/reward affected players |
| Free-tile logic bugs | MEDIUM | Centralize rule in one function; add debug overlay; replay recorded bug boards in tests |
| Performance regression | MEDIUM–HIGH | Profile on target device; switch to WebGL/atlas; add quality tiers; reduce particle budget |
| Poor senior accessibility | MEDIUM | Add large-tile mode, high-contrast palette, and tap-assist; test with representative users |
| Broken undo/hint | LOW–MEDIUM | Snapshot full state after every move; regenerate solver path on demand |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Random layouts unsolvable | Phase 1 — Core Engine & Level Gen | 100% solver validation on all 20+ levels; measured win rate ≥ 99% with optimal play |
| Free-tile detection bugs | Phase 1 — Core Engine | Property-based tests + manual board-edge cases + automated solvable-playthrough |
| Hint/shuffle dead-ends | Phase 2 — Assist Systems | Hint leads to completion on all test boards; shuffle never produces unsolvable state |
| Senior-unfriendly touch/readability | Phase 2 — UI/UX & Visuals | Usability tests on 5.5" device and 6.5" device; tap-error rate < 5% |
| Low-end performance collapse | Phase 1 + Phase 3 | 60 fps on mid-range, 30 fps stable on low-end; particle toggle works |
| Relaxed mode still stressful | Phase 2 — Game Modes | Audit all time/pressure cues; relaxed-mode completion rate higher than timed |
| Colorblind tile confusion | Phase 2 — Art & Accessibility | Simulate deuteranopia/protanopia; symbols remain distinct |
| State loss on backgrounding | Phase 3 — Polish | Kill-and-restore test passes on iOS Safari and Android Chrome |

## Sources

- Wikipedia — Mahjong solitaire: rules, PSPACE/NP-completeness, shuffle/undo conventions (https://en.wikipedia.org/wiki/Mahjong_solitaire)
- de Bondt / Radboud University — Solitaire Mahjongg solver, empirical unsolvability rates for 10M turtle deals and 24 layouts (https://www.math.ru.nl/~debondt/mjsolver.html)
- W3C WAI — Older Users and Web Accessibility: age-related impairments and WCAG overlap (https://www.w3.org/WAI/older-users/)
- MDN — Optimizing canvas: draw-call batching, offscreen caching, integer coordinates, layered canvases (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- Game Designing — Mobile Game Design principles: short sessions, clear goals, large controls, performance (https://www.gamedesigning.org/learn/mobile-game-design/)
- CrazyGames — Mahjongg Solitaire product notes: free-tile rule, hints, timed mode, no shuffle, special tiles (https://www.crazygames.com/game/mahjongg-solitaire)

---
*Pitfalls research for: Mobile Mahjong Solitaire*
*Researched: 2026-07-04*

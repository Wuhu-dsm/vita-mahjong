# Phase 1: Core Engine & Solvable Levels - Context

**Gathered:** 2026-07-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the playable core of Vita Mahjong: a deterministic board model, free-tile rule, solvable level generation, basic PixiJS rendering/input, and win/deadlock detection. The milestone must let a player start a level from the home screen, see stacked tiles in correct z-order, tap free tiles, match them via the 4-slot tray mechanic, and reach either a win or failure state with a result screen.

This phase does **not** include undo/hint/shuffle props, audio/haptics, persistent progress/settings, daily challenges, ads, IAP, or coin economies. Visual polish and accessibility refinements belong in Phase 2 unless explicitly decided below.

</domain>

<decisions>
## Implementation Decisions

### Core Match Mechanic

- **D-01:** Phase 1 implements the **4-slot tray mechanic** described in PRD §3.3, not the traditional "tap two matching free tiles to remove" wording in ROADMAP. A tapped free tile flies into the leftmost empty slot of a top tray; when a second matching tile enters the tray, the pair is removed immediately.
- **D-02:** Tray capacity is **4 unmatched tiles**. Failure is triggered in **two cases**: (1) the tray is filled with 4 unmatched tiles, and (2) the board has no clickable free tiles while the tray is not full (deadlock / no legal moves).
- **D-03:** There is **no revive/continue-after-failure** in Phase 1. The failure popup offers only **Restart** (retry the current level from scratch, score reset).
- **D-04:** Pairing inside the tray follows the rule: **any two matching tiles pair regardless of adjacency**; a third matching tile remains in the tray. This matches PRD's description of two identical tiles pairing as soon as they are both in the tray.
- **D-05:** Tapping a non-free (blocked) tile gives **visual + text feedback**: the tile darkens, red arrows appear on the blocked sides, and a "被左右锁住" text hint is shown.
- **D-06:** The **"tray almost full" warning popup** (3 unmatched tiles) is **deferred** to a later phase; Phase 1 only handles the full-tray failure state.

### Level Data Source

- **D-07:** Levels are generated **at build time** using a forward-simulation / backward-dealing algorithm to guarantee solvability. This aligns with the approach recorded in STATE.md while keeping runtime startup fast.
- **D-08:** Generation uses a **fixed random seed** so every build produces the same 20 levels, making testing, bug reproduction, and difficulty validation deterministic.
- **D-09:** Tile face themes are assigned **per the PRD theme table** (§7.2–7.3): levels 1–3 use zodiac signs, 4–8 & 12–16 use traditional mahjong, 9–11 use animals, 13–15 use oriental elements, 17–18 use seasons, and 19–20 use myth symbols.
- **D-10:** Generated level JSON is **not checked into version control**. The build pipeline runs the generator each time; the output is ignored by Git.

### Phase 1 Screen Completeness

- **D-11:** Phase 1 implements the **full PRD visual design** for home, game, and result screens, not placeholder skeletons. This includes the Oriental classical art style, color palette, layout proportions, and basic decorative elements described in PRD §4–6 and §11.
- **D-12:** The app **starts at the home screen** (PRD §4), not directly in level 1. The home screen shows the logo, level-1 entry button, and settings gear as described in the test-image references.
- **D-13:** The result screen shows the **full PRD settlement panel**: title/rank, time, score, combo, beat-ratio line, level-progress indicator, and next-level button.
- **D-14:** Screen transitions (home → game, game → result) include **transition animations** (fade/scale) in Phase 1.

### Scoring, Combo, and Stars in Phase 1

- **D-15:** Phase 1 implements **partial scoring**: base score per match and combo multiplier. It does **not** implement star targets, beat-ratio, or time bonus in Phase 1.
- **D-16:** The scoring formula follows **PRD §9.3** for the parts that are implemented: `单次匹配得分 = 100 × (1 + min(连击数 - 1, 9) × 0.2)`. End-game bonus, time reward, and star reward are omitted (treated as 0) because those systems are deferred.
- **D-17:** Combo interruption follows **PRD §9.4**: the combo resets if more than 3 seconds pass without a successful match, or if the player taps a blocked (non-free) tile.

### Agent Discretion

- None. Every gray area discussed resulted in an explicit user choice.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Design
- `PRD.md` — Complete product reference: match/tray mechanics, free-tile rule, level 1–20 designs, theme tables, UI layouts, color palette, animation list, and confirmed out-of-scope items.
- `assets/screenshots/key_nodes/` — Key-node screenshots referenced by PRD (home, game board, tile select, match feedback, blocked tile, result screen, second theme).

### Project Planning
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, plan breakdown, and requirement mapping.
- `.planning/REQUIREMENTS.md` — Requirement IDs (CORE-*, LVLS-*, ACCS-*, VISL-*, PLAT-*) and phase traceability.
- `.planning/PROJECT.md` — Core value, constraints, target users, and out-of-scope rules.
- `.planning/STATE.md` — Locked stack decision (PixiJS 8 + TypeScript + Vite) and level-generation approach (forward/backward dealing).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None. The project has no existing `src/` or `app/` codebase. All engine, renderer, and UI code must be created in Phase 1.

### Established Patterns
- Stack is locked in `.planning/STATE.md`: PixiJS 8 + TypeScript + Vite. Planner should assume this stack and not re-litigate it.
- Level generation uses a solver-backed build-time generator. The generator must be runnable as a Node script in the build pipeline.

### Integration Points
- No existing routes, navigation, or state management to integrate with. Phase 1 establishes the project scaffold and the screen-management architecture that Phase 2 will extend.

</code_context>

<specifics>
## Specific Ideas

- The 4-slot tray is the defining interaction; prioritize tray animation timing (0.2–0.3s elastic flight into the tray) and clear visual distinction between tray tiles and board tiles.
- Free-tile rule (PRD §3.2): a tile is free only when no tile sits directly on top and at least one long side is open.
- Result screen must show "关卡 2" next-button text pattern; level-progress text "达到第10关" should reflect cumulative progress / historical best.
- Mobile portrait 20:9, 1080×2400 design baseline; tile width ~0.21 screen width, height ~0.11 screen height; safe-area insets for notches/dynamic island.
- Performance budget: ~150 tile nodes on screen; object-pool tile sprites; particles degrade on low-end devices (particle work mostly Phase 3, but renderer should reserve a hook).

</specifics>

<deferred>
## Deferred Ideas

- **Props / assists:** undo, hint, shuffle — explicitly out of scope per PRD §8 and project constraints.
- **Audio / haptics:** sound effects, background music, vibration — out of scope per PRD §11.4–11.5.
- **Tray-almost-full warning:** the "小心！别让托盘装满！" 3-tile warning popup is deferred to a later phase.
- **Revive / continue-after-failure:** deferred; Phase 1 only offers restart.
- **Star rating system:** 3-star targets per level deferred to Phase 2 or later.
- **Beat ratio:** "击败了 X% 的玩家" local simulation deferred to Phase 2 or later.
- **Time reward and end-game bonus scoring:** omitted from Phase 1 scoring formula.
- **Daily challenges / Active Mind Levels / endless mode / cloud save / social sharing:** future phases per PRD §13.
- **Landscape / tablet optimization:** explicitly out of scope for v1.

</deferred>

---

*Phase: 1-Core Engine & Solvable Levels*
*Context gathered: 2026-07-04*

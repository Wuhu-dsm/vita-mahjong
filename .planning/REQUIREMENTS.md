# Requirements: Vita Mahjong

**Defined:** 2026-07-04
**Core Value:** 让玩家在手机上获得放松、直观、无压力的麻将消除体验——即使视力或反应速度下降的用户，也能一眼看清牌面、一键完成操作，并在即时反馈中感受到连击爽感。

## v1 Requirements

### Core Game Loop

- [ ] **CORE-01**: User can start a level from the home screen and enter the game screen
- [ ] **CORE-02**: User can select two free matching tiles to remove them from the board
- [ ] **CORE-03**: Game correctly enforces the free-tile rule (tile is free when no other tile sits directly on top and at least one long side is open)
- [ ] **CORE-04**: Game detects win when all tiles are cleared and shows the result screen
- [ ] **CORE-05**: Game detects deadlock when no more moves exist and offers shuffle or retry
- [ ] **CORE-06**: User can navigate back to the home screen from game/result screens

### Levels & Layouts

- [ ] **LVLS-01**: Game provides at least 20 playable levels
- [ ] **LVLS-02**: Level 20 contains no more than 128 tiles and 7 layers
- [ ] **LVLS-03**: Every level layout is guaranteed solvable (at least one clearable path exists)
- [ ] **LVLS-04**: Each tile face appears an even number of times in every level
- [ ] **LVLS-05**: User can select any unlocked level from a level-select screen

### Accessibility & UX

- [ ] **ACCS-01**: Tile size and touch targets are large enough for seniors and low-motor-precision users
- [ ] **ACCS-02**: Tile faces use high-contrast symbols with clear, readable fonts
- [ ] **ACCS-03**: Selected and blocked tiles are visually highlighted
- [ ] **ACCS-04**: Game supports one-tap undo, hint, and shuffle controls
- [ ] **ACCS-05**: Low-pressure mode can be toggled to hide timer and score pressure

### Visuals & Animation

- [ ] **VISL-01**: Game uses an Oriental classical art style for tiles and backgrounds
- [ ] **VISL-02**: Selection, match, and elimination animations are smooth and clearly visible
- [ ] **VISL-03**: Particle effects provide match feedback and can degrade on low-end devices
- [ ] **VISL-04**: Renderer stays within the ~150 tile-node performance budget on target devices

### Audio & Settings

- [ ] **AUDI-01**: Game plays sound effects for select, match, win, and button actions
- [ ] **AUDI-02**: Background music plays during gameplay and can be muted
- [ ] **AUDI-03**: User can independently control or mute sound effects and music

### Result & Progression

- [ ] **RSLT-01**: Result screen shows level completion status and basic stats (time, score if enabled)
- [ ] **RSLT-02**: User can retry the current level or proceed to the next unlocked level from the result screen
- [ ] **PROG-01**: Game persists unlocked levels and user settings locally
- [ ] **PROG-02**: Session can recover to the last played state after restart

### Platform & Constraints

- [ ] **PLAT-01**: Game targets mobile portrait 20:9 with 1080×2400 design baseline
- [ ] **PLAT-02**: All game logic and data run locally without a backend
- [ ] **PLAT-03**: Game can be built as mobile web / mini-game / native H5
- [ ] **PLAT-04**: No advertisements, in-app purchases, or coin economy are present

## v2 Requirements

### Themes & Meta

- **THEM-01**: Multiple unlockable tile themes and backgrounds
- **CHAL-01**: Daily challenges with unique layouts
- **ACHV-01**: Achievement/season system for long-term engagement

### Social & Cloud

- **SOCL-01**: Cloud save across devices
- **SOCL-02**: Social sharing of level completion

### Mechanics

- **MECH-01**: Wildcard or power-up tiles

## Out of Scope

| Feature | Reason |
|---------|--------|
| Advertisements / interstitials | Project explicitly prohibits commercialization |
| In-app purchases / coin economy | Project explicitly prohibits commercialization |
| Backend services / multiplayer | All logic must run locally per constraints |
| Leaderboards / accounts | Adds friction and conflicts with low-pressure, offline design |
| Real-time PvP | Outside core solitaire experience |
| Landscape / tablet optimization | Initial target is portrait 20:9 mobile only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CORE-01 | Phase 1 | Pending |
| CORE-02 | Phase 1 | Pending |
| CORE-03 | Phase 1 | Pending |
| CORE-04 | Phase 1 | Pending |
| CORE-05 | Phase 1 | Pending |
| CORE-06 | Phase 2 | Pending |
| LVLS-01 | Phase 1 | Pending |
| LVLS-02 | Phase 1 | Pending |
| LVLS-03 | Phase 1 | Pending |
| LVLS-04 | Phase 1 | Pending |
| LVLS-05 | Phase 2 | Pending |
| ACCS-01 | Phase 2 | Pending |
| ACCS-02 | Phase 2 | Pending |
| ACCS-03 | Phase 1 | Pending |
| ACCS-04 | Phase 2 | Pending |
| ACCS-05 | Phase 2 | Pending |
| VISL-01 | Phase 2 | Pending |
| VISL-02 | Phase 2 | Pending |
| VISL-03 | Phase 3 | Pending |
| VISL-04 | Phase 1 | Pending |
| AUDI-01 | Phase 2 | Pending |
| AUDI-02 | Phase 2 | Pending |
| AUDI-03 | Phase 2 | Pending |
| RSLT-01 | Phase 2 | Pending |
| RSLT-02 | Phase 2 | Pending |
| PROG-01 | Phase 3 | Pending |
| PROG-02 | Phase 3 | Pending |
| PLAT-01 | Phase 2 | Pending |
| PLAT-02 | Phase 1 | Pending |
| PLAT-03 | Phase 3 | Pending |
| PLAT-04 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-04*
*Last updated: 2026-07-04 after initial definition*

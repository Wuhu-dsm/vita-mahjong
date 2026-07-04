---
phase: 01
slug: core-engine-solvable-levels
status: draft
shadcn_initialized: false
preset: none
created: 2026-07-04
---

# Phase 01 — UI Design Contract

> Visual and interaction contract for Phase 1 of Vita Mahjong (PixiJS 8 + TypeScript + Vite). Generated for canvas-based game rendering.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | PixiJS 8 (canvas/WebGL) |
| Preset | not applicable |
| Component library | custom PixiJS containers / sprites |
| Icon library | custom PNG/SVG atlas |
| Font | Noto Sans SC (UI + numbers), custom serif/hand-drawn logo glyph |

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tiny gaps, particle offset |
| sm | 8px | Tight icon/text padding |
| md | 16px | Default element padding |
| lg | 24px | Section padding |
| xl | 32px | Major layout gaps |
| 2xl | 48px | Page-level section breaks |
| 3xl | 64px | Screen edge safe-area minimum |

Exceptions:
- Tile touch target padding: 8px visual + 4px hit-area bleed
- Top status bar height: 96px (includes safe-area inset)
- Tray height: 128px

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 28px | 400 | 1.4 |
| Label | 24px | 600 | 1.3 |
| Heading | 40px | 700 | 1.2 |
| Display | 72px | 800 | 1.1 |

- All Chinese numbers use Noto Sans SC with tabular figures where applicable.
- Logo uses a custom serif/hand-drawn treatment for "Vita" and uppercase sans for "MAHJONG".

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#7A4F2E` | Home wooden background, warm brown surfaces |
| Secondary (30%) | `#D4A574` | Cards, buttons, tray borders, highlights |
| Accent (10%) | `#F5D78E` | Score flashes, combo text, celebration titles |
| Destructive | `#C0392B` | Blocked-tile arrows, failure text |

Accent reserved for: score pop-ups, combo counters, result title glow, selected-tile halo.

Additional game palette:
- Game table background: `#1B4D3E` (deep green felt)
- Tile face: `#FAFAF8` (off-white)
- Tile side: `#2E8B57` (green)
- Tile shadow: `rgba(0,0,0,0.35)`
- Blocked overlay: `rgba(0,0,0,0.45)`
- Tray background: `#3E2723` (dark wood)
- Tray border: `#F5D78E` (gold)
- Result background: `#0F172A` (deep navy/black)

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (Home) | `关卡 1` |
| Primary CTA (Result) | `关卡 {N}` |
| Empty state heading | n/a — no empty states in Phase 1 |
| Error state (blocked tile) | `被左右锁住` |
| Failure state heading | `没有空位了` |
| Failure state CTA | `重新开始` |
| HUD labels | `关卡 {N}` / `分数 {score}` / `匹配 {combo}` |
| Result title | `智慧超群` (score tier placeholder) |
| Result progress label | `达到第{N}关` |

---

## Layout Contracts

### Screen Baseline
- Design resolution: 1080 × 2400 px
- Aspect ratio: 20:9 portrait
- Safe-area inset top: 48px (dynamic island/notch)
- Safe-area inset bottom: 34px (home indicator)

### Home Screen
- Background: warm wood grain + bamboo mat at bottom
- Logo centered at y ≈ 0.18 screen height
- Decorative ring centered below logo
- Main wooden capsule button at y ≈ 0.72 screen height
- Settings gear at top-right (x ≈ 0.93, y ≈ 0.06)
- Avatar + coin display at top-left (visual only)

### Game Screen
- Top status bar: full width, height 96px + safe-area
  - Back button at x ≈ 0.07
  - Center: `关卡 {N}` left, `分数 {score}` center, `匹配 {combo}` right
  - Menu button at x ≈ 0.93
- Tray: full width, height 128px, y ≈ 0.14
  - 4 slots, each slot ~120×120px, gap 16px
  - Centered horizontally
- Board area: centered, y ≈ 0.42, max height 0.52 screen
- Tile size: width 0.21 screen width (≈227px), height 0.11 screen height (≈120px)

### Result Screen
- Background: dark navy with golden lotus/glow center
- Title at y ≈ 0.16, 72px gold
- Stats row (time / score / combo) at y ≈ 0.36
- Beat ratio text at y ≈ 0.48
- Progress label at y ≈ 0.58
- Next-level green capsule button at y ≈ 0.82

---

## Component Inventory

### Shared
- `ScreenContainer`: root Pixi container per screen
- `Button`: 9-slice capsule with text label
- `IconButton`: circular button with icon sprite
- `GameText`: styled Pixi BitmapText/Text

### Home
- `HomeScreen`
- `Logo`
- `LevelButton`
- `SettingsButton` (visual)
- `AvatarCoin` (visual)

### Game
- `GameScreen`
- `HUD`
- `Tray` (4 slots)
- `TraySlot`
- `TileSprite`
- `BoardLayer`
- `BlockedHint` (red arrows + text)
- `ScoreFloater` (`+x.x` popup)
- `ComboFeedback` (`Good` + `Combo xN`)
- `FailurePopup`

### Result
- `ResultScreen`
- `RankTitle`
- `StatsRow`
- `ProgressLabel`
- `NextLevelButton`

---

## Animation Contract

| Interaction | Timing | Easing |
|-------------|--------|--------|
| Screen transition (fade/scale) | 0.35s | ease-out |
| Tile flight to tray | 0.25s | elastic out (0.3, 0.5) |
| Match particle burst | 0.6s | ease-out |
| Score floater | 0.8s | ease-out, translateY -60px + fade |
| Combo "Good" popup | 0.5s | scale 0→1.1→1 + fade |
| Blocked tile shake | 0.2s | ease-in-out, x ±6px |
| Failure popup appear | 0.3s | scale + fade |
| Home decorative breathing | 3s | sine, scale ±3% |

---

## Asset Registry

### Required Textures
- `bg_home` — warm wood home background
- `bg_game` — green felt table
- `bg_result` — dark navy with golden glow
- `logo_vita_mahjong` — logo sprite
- `btn_wooden_capsule` — 9-slice wooden button
- `btn_green_capsule` — 9-slice green button
- `btn_circle_brown` — circular icon button
- `icon_gear`, `icon_back`, `icon_menu` — UI icons
- `tile_face` — 9-slice tile face
- `tile_side` — tile side green
- `tile_blocked_arrow` — red arrow overlay
- `particle_square` — white match particle
- `deco_ring` — home decorative ring
- `deco_lotus` — result golden glow/lotus

### Required Tile Face Sets (per theme)
- Theme A (Zodiac): 12 unique faces
- Theme B (Traditional Mahjong): 42+ unique faces
- Theme C (Animals): 12 unique faces
- Theme D (Oriental Elements): 12 unique faces
- Theme E (Seasons): 8 unique faces
- Theme F (Myth Symbols): 12 unique faces

### Fonts
- `NotoSansSC-Regular.ttf`
- `NotoSansSC-Bold.ttf`

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| not applicable (PixiJS game) | — | — |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---
phase: 02
slug: ui-ux-accessibility-game-flow
status: draft
shadcn_initialized: false
preset: none
created: 2026-07-05
---

# Phase 02 — UI Design Contract

> Visual and interaction contract for Phase 2 of Vita Mahjong. Extends Phase 1's PixiJS 8 design system with screen navigation polish, assist controls, audio settings, tile layout adjustments, and timer display. Sources: CONTEXT.md (15 locked decisions), RESEARCH.md (architecture patterns), config.ts (existing tokens), Phase 01-UI-SPEC.md (baseline).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | PixiJS 8 (canvas/WebGL) |
| Preset | not applicable |
| Component library | custom PixiJS containers / sprites |
| Icon library | custom PNG atlas (Phase 1 assets extended) |
| Font | Noto Sans SC family stack: `Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif` |

> No new external packages. All UI is PixiJS 8 (already installed). All audio is Web Audio API (browser built-in). Source: RESEARCH.md §Standard Stack, D-12.

---

## Spacing Scale

Phase 1 scale preserved. Phase 2 additions and overrides:

### Preserved from Phase 1 (config.ts)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Particle offset, tiny gaps |
| sm | 8px | Tight icon padding |
| md | 16px | Tray slot gap |
| lg | 24px | Section padding |
| xl | 32px | Major layout gaps |
| 2xl | 48px | safe-area top inset |
| 3xl | 64px | Screen edge spacing |

### Phase 2 Specific

| Token | Value | Usage | Source |
|-------|-------|-------|--------|
| tile-width | 227px | Tile horizontal dimension | config.ts (unchanged) |
| tile-height | 120px | Tile vertical dimension | config.ts (unchanged) |
| tile-touch-pad | 12px | Hit-area bleed on all sides | config.ts (unchanged) |
| grid-x | 113.5px | Horizontal spacing between tile grid units (tile.width / 2) | D-08 |
| grid-y | 120px | Vertical spacing between tile grid units (tile.height) | D-08 |
| layer-offset | 56px | 3D stack offset per z-layer (tile.width / 4, tune in impl) | D-09, agent discretion |
| tray-height | 128px | Tray bar height | config.ts (unchanged) |
| tray-slot | 120px | Individual tray slot size | config.ts (unchanged) |
| tray-gap | 16px | Gap between tray slots | config.ts (unchanged) |
| hud-height | 96px | Top HUD height | config.ts (unchanged) |
| assist-btn-size | 160px | Circular assist button diameter | RESEARCH.md §Pattern 4 |
| assist-btn-gap | 40px | Horizontal gap between assist buttons | RESEARCH.md §Pattern 4 |
| assist-bar-y | 2224px | AssistBar vertical center (designHeight - 176) | calculated |
| settings-padding | 48px | Settings page horizontal padding | derived from Phase 1 safe-area |
| settings-row-height | 96px | Settings control row height | agent discretion |
| timer-x | designWidth * 0.615 | Timer label x position in HUD | agent discretion (between score and combo) |

Exceptions:
- `grid-x` uses 113.5 (decimal allowed — grid positioning, not CSS). The layout uses integer stone coordinates multiplied by half-tile-width, so exact tile abutment requires precise decimal values.
- `layer-offset` is a tuning parameter; implementer may adjust between 50–62px based on visual testing with levels 1–20.

---

## Typography

Typography uses a 4-size hierarchy (26/30/42/72) with 2 weights (400/800). All roles remap to these buckets.

| Role | Size | Weight | Line Height | Usage | Source |
|------|------|--------|-------------|-------|--------|
| Body | 30px | 400 | 1.4 | General UI text, HUD labels, timer, settings values | Phase 1 + Phase 2 |
| Assist | 26px | 800 | 1.3 | Assist button labels (smallest for 3-up fit), secondary labels | Phase 2 |
| Heading | 42px | 800 | 1.2 | Section titles, button labels, result stat values, large CTAs | Phase 1 + Phase 2 |
| Display | 72px | 800 | 1.1 | Hero titles, failure popup heading, tile face symbols | Phase 1 + Phase 2 |

Font stack (all text objects): `'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif'`

Text colors (fill):
- HUD / timer / assist labels: `0xfff4d6` (warm cream)
- Settings labels: `0xd4a574` (secondary gold-beige)
- Settings values: `0xfff5dc` (warm cream)
- Button labels: `0xfff7d2` (default from Button.ts)
- Result title: `0xf5d78e` (accent gold)
- Failure heading: `0xc0392b` (destructive red)

Stroke: All text uses dark stroke for contrast on varied backgrounds.
- Heading/Display roles (42px, 72px): stroke color `0x29170b` or `0x5a2d16`, width 4px
- Body/Assist roles (26px, 30px): stroke color `0x08352c` or `0x4a2414`, width 2–3px

---

## Color

Phase 1 palette preserved. Phase 2 additions for settings page and assist controls.

### Core Palette (from config.ts, unchanged)

| Role | Hex | Usage |
|------|-----|-------|
| Dominant (60%) | `#7A4F2E` | Home wooden background |
| Secondary (30%) | `#D4A574` | Buttons, tray borders, UI accents |
| Accent (10%) | `#F5D78E` | Score flashes, combo text, celebration titles, gold highlights |
| Destructive | `#C0392B` | Blocked-tile arrows, failure text, deadlock indicators |

Accent reserved for: score floater text, combo counter text, result screen title, selected-tile glow, golden borders (tray, lotus). Never used for standard UI labels or body text.

### Game Palette (from config.ts, unchanged)

| Token | Hex | Usage |
|-------|-----|-------|
| gameBg | `#1B4D3E` | Game screen background (green felt) |
| resultBg | `#0F172A` | Result screen background (dark navy) |
| tileFace | `#FAFAF8` | Tile face background |
| tileSide | `#2E8B57` | Tile side/thickness |
| tileShadow | `rgba(0,0,0,0.35)` | Tile drop shadow |
| trayBg | `#3E2723` | Tray bar background |
| trayBorder | `#F5D78E` | Tray bar border |
| blockedOverlay | `rgba(0,0,0,0.45)` | Blocked tile dimming |
| hudBg | `rgba(8,53,44,0.85)` | HUD background (dark green, semi-transparent) |

### Settings Page Palette (Phase 2 new)

| Token | Hex | Usage |
|-------|-----|-------|
| settingsBg | `#1B4D3E` | Settings page background (reuses gameBg for consistency) |
| settingsCard | `rgba(62,39,35,0.6)` | Settings control row background cards |
| settingsSliderTrack | `#D4A574` | Volume slider track (secondary color) |
| settingsSliderFill | `#F5D78E` | Volume slider filled portion (accent) |
| settingsMuteOff | `#D4A574` | Mute icon when sound is active |
| settingsMuteOn | `#C0392B` | Mute icon when sound is muted |

### Assist Button States (Phase 2 new)

| State | Visual |
|-------|--------|
| Active (count > 0) | Full texture + white label, full alpha |
| Disabled (count = 0) | Dimmed to alpha 0.35, eventMode = 'none' |
| Hover (active only) | Cursor = 'pointer', slight scale pulse |

---

## Copywriting Contract

All copy is Chinese (Simplified). English in brackets is for reference only.

### Primary CTAs

| Screen | Element | Copy | Note |
|--------|---------|------|------|
| Home | Level button | `关卡 {N}` | Dynamic — N = current level number. Always the next uncompleted level (D-01, D-02). |
| Result | Next level button | `关卡 {N}` | Dynamic — N = next level number. |
| Game | Back button (HUD) | _(icon only)_ | Uses `icon_back` sprite. No text label. Behavior per D-11. |

### Assist Controls (Game Screen Bottom Bar)

| Button | Copy Template | Example (initial) | Note |
|--------|---------------|-------------------|------|
| Undo | `撤销 {N}` | `撤销 3` | N = remaining uses. Depletes with each use. Disabled at 0 (D-05). |
| Hint | `提示 {N}` | `提示 3` | N = remaining uses. Depletes with each use. Disabled at 0 (D-05). |
| Shuffle | `洗牌 {N}` | `洗牌 1` | N = remaining uses. Depletes with each use. Disabled at 0 (D-05). |

### Timer (Game HUD)

| Element | Copy | Note |
|---------|------|------|
| Timer label | `00:00` | Format: MM:SS. Elapsed time since level start. Displayed in HUD top-right area. |

### Settings Page

| Element | Copy | Note |
|---------|------|------|
| Page title | `设置` | Centered at top |
| SFX volume label | `音效` | Left-aligned row label |
| SFX volume value | `{0-100}` | Current percentage |
| BGM volume label | `音乐` | Left-aligned row label |
| BGM volume value | `{0-100}` | Current percentage |
| SFX mute toggle | `音效` | Mute/unmute icon next to label |
| BGM mute toggle | `音乐` | Mute/unmute icon next to label |
| Back button | _(icon only)_ | Uses `icon_back` sprite. Returns to home screen. |
| Credits hint | _(placeholder)_ | Optional small text: "Vita Mahjong v1.0" — deferred to Phase 3 if time-constrained. |

### Empty / Error / Edge States

| State | Where | Copy | Behavior |
|-------|-------|------|----------|
| No undo available | AssistBar | `撤销 0` (button dimmed) | Button inactive. Click produces no action. |
| No hint available | AssistBar | `提示 0` (button dimmed) | Button inactive. Click produces no action. |
| No hint possible (deadlock) | AssistBar after hint tap | Button dims with count unchanged | Hint checks Solver.findHintPair(); if null, hint is not consumed, button stays active. |
| No shuffle available | AssistBar | `洗牌 0` (button dimmed) | Button inactive. |
| Deadlock (no moves + no shuffle left) | GameScreen | FailurePopup: `没有空位了`, CTA: `重新开始` | Existing Phase 1 behavior — unchanged. |
| Back from game (discard) | Game → Home | _(no confirmation dialog)_ | Per D-11: immediate transition, no copy, no pause. |
| Settings back | Settings → Home | _(icon button)_ | Immediate transition. No confirmation. |

### Destructive / Loss-of-Progress Actions

| Action | Confirmation? | Copy |
|--------|---------------|------|
| Back from game to home | **No** — per D-11 | No dialog. Immediate ScreenManager transition, game state discarded. |
| Restart from deadlock popup | Yes — existing FailurePopup | `重新开始` button. Phase 1 behavior — unchanged. |

---

## Layout Contracts

### Screen Baseline (unchanged from Phase 1)
- Design resolution: 1080 × 2400 px
- Aspect ratio: 20:9 portrait
- Safe-area inset top: 48px
- Safe-area inset bottom: 34px

---

### Home Screen (Phase 2 Modifications)

**Changes from Phase 1:**
1. Level button label: Changed from hardcoded `关卡 1` to dynamic `关卡 {X}` where X = current level (App-level state). Source: D-01.
2. Settings gear icon: Already positioned at top-right (x=0.93, y=0.06), 84px wide, hit area 108×108px. Phase 2 wires the `pointertap` event to `ScreenManager.show('settings')`.

**Layout (unchanged from Phase 1 except label):**
```
y=0.18  →  Logo (620px wide, centered)
y=0.43  →  Decorative ring (440px wide, centered)
y=0.72  →  Level button (520×150px, btn_wooden_capsule, centered)
y=0.06  →  Gear icon (84px, x=0.93)
y=0.06  →  Coin label (x=0.11)
```

---

### Game Screen (Phase 2 Modifications)

**HUD (top bar, height 96px + safe-area):**
```
x=0.07   →  Back button (76px circle, icon_back) [NOW ACTIVE]
x=0.31   →  Level label "关卡 {N}"
x=0.52   →  Score label "分数 {score}"
x=0.615  →  Timer label "MM:SS" [NEW]
x=0.73   →  Combo label "匹配 {combo}" [shifted right to accommodate timer]
x=0.93   →  Menu button (76px circle, icon_menu)
```

**Tray (below HUD, height 128px, y ≈ 0.068 screen height + safeAreaTop):**
- 4 slots, each 120×120px, gap 16px, centered horizontally. Unchanged from Phase 1.

**Board area (centered, y offset calculated from bounds):**
- Tile positioning changed per D-08/D-09 (see Tile Layout section below).
- Board bounds computed from stone positions with new grid parameters, then centered.

**AssistBar (bottom of screen):**
```
y = designHeight - 176  (centered vertically at 2224px)
3 circular buttons, horizontal row, centered:
  - Undo   ("撤销 N")   x = center - 200px   (160×160px, btn_circle_brown)
  - Hint   ("提示 N")   x = center            (160×160px, btn_circle_brown)
  - Shuffle ("洗牌 N")  x = center + 200px   (160×160px, btn_circle_brown)
Total bar width: 560px (3 × 160 + 2 × 40)
```

**ComboFeedback, ScoreFloater, FailurePopup:** Existing Phase 1 components — no layout changes.

---

### Result Screen (Phase 2 Modifications)

Minimal changes. Existing layout verified against key_nodes/08_level_clear.png and key_nodes/09_result.png.

**Layout (unchanged):**
```
y=0.16  →  Title "智慧超群" (72px Display, gold accent)
y=0.24  →  Lotus deco (620px, centered)
y=0.345 →  Stat labels row (time / score / combo)
y=0.39  →  Stat values row
y=0.48  →  Beat ratio text
y=0.58  →  Progress text "达到第{N}关"
y=0.82  →  Next level button (520×150px, btn_green_capsule)
```

---

### Settings Screen (NEW — Phase 2)

```
┌──────────────────────────────────┐
│  ← back       设置               │  y = safeAreaTop + 48
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │  y ≈ 0.25
│  │  ♪  音效     [━━━━━━━] 80  │  │  Row 1: SFX volume
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  ♪  音效     [ 🔊 / 🔇 ]  │  │  Row 2: SFX mute toggle
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │  y ≈ 0.45
│  │  ♫  音乐     [━━━━━━━] 60  │  │  Row 3: BGM volume
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  ♫  音乐     [ 🔊 / 🔇 ]  │  │  Row 4: BGM mute toggle
│  └────────────────────────────┘  │
│                                  │
│           Vita Mahjong v1.0      │  y ≈ 0.75 (small, optional)
└──────────────────────────────────┘
```

**Specs:**
- Background: `bg_game` or solid `0x1B4D3E` (gameBg for visual consistency)
- Title: "设置", 42px Heading, stroke 4px `0x29170b`, centered at y = safeAreaTop + 48
- Back button: `icon_back` inside `btn_circle_brown` (76px), positioned at x=0.07 same as HUD back
- Rows: 4 rows, each ~96px tall, with `rgba(62,39,35,0.6)` card background (900px wide, centered), rounded corners
- Row layout per row:
  - Icon (left): 32px, text symbol `♪` / `♫`
  - Label (left of center): 30px, `0xd4a574`
  - Control (right): Slider bar (for volume rows) / Mute icon (for toggle rows)
  - Value text (far right): 30px Body, `0xfff5dc`, shows "0"–"100" for volume, on/off for mute
- Slider bar: Track 600px × 8px, fill `0xF5D78E`, empty `0xD4A574`. Draggable thumb 28px circle. Vertical center aligned.
- Mute toggle: Tap on icon area toggles state. Icon shows enabled (white/gold) or muted (red `0xC0392B`).
- Footer: "Vita Mahjong v1.0", 26px Assist, `0xD4A574`, centered at y ≈ 0.75. Deferred to Phase 3 if time-constrained.

---

### Tile Layout (Phase 2 Override — D-08, D-09)

**Changes from Phase 1:** The `GameScreen.toBoardPosition()` grid parameters are replaced to achieve same-layer abutment and classic mahjong stacking.

| Parameter | Phase 1 Value | Phase 2 Value | Rationale |
|-----------|--------------|---------------|-----------|
| gridX | 64 | 113.5 | tile.width / 2. At Δx=2 (adjacent stones), spacing = 227px = tile.width → tiles touch edge-to-edge, no overlap (D-08). |
| gridY | 78 | 120 | tile.height. At Δy=1 (adjacent rows), spacing = 120px = tile.height → tiles touch edge-to-edge, no overlap (D-08). |
| layerOffset | 18 | ~~56~~ 28 | **CORRECTED.** tile.width / 8 ≈ 28.4 → rounded to 28. Shifts each z-layer diagonally (right + down) by ~half a tile in x, creating the classic mahjong "upper tile covers 4 lower tiles" effect (D-09). |

> **Agent Discretion:** `layerOffset` is a tuning parameter. The implementer should test with levels 1–20, particularly level 20 (128 tiles, 7 layers). If the upper-layer offset looks too large or too small, adjust between 24–32px. The formula `toBoardPosition` is:
> ```
> x = stone.x * gridX + stone.z * layerOffset
> y = stone.y * gridY - stone.z * layerOffset
> ```
> The `calculateBounds()` method compensates automatically for centering. No level data changes required.

---

## Component Inventory

### Preserved from Phase 1 (unchanged unless noted)

| Component | File | Phase 2 Status |
|-----------|------|----------------|
| ScreenManager | `src/renderer/ScreenManager.ts` | **EXTEND**: Add `'settings'` to `ScreenName` union, add `settings` Container |
| HomeScreen | `src/renderer/screens/HomeScreen.ts` | **MODIFY**: Dynamic level label, gear click to settings |
| GameScreen | `src/renderer/screens/GameScreen.ts` | **MODIFY**: AssistBar, HUD timer, back button active, grid parameters |
| ResultScreen | `src/renderer/screens/ResultScreen.ts` | Minimal changes (verified against key_nodes) |
| Button | `src/renderer/components/Button.ts` | Reused as-is for all buttons |
| HUD | `src/renderer/components/HUD.ts` | **MODIFY**: Back button click handler, add timer label, shift combo label |
| Tray | `src/renderer/components/Tray.ts` | Unchanged |
| TileSprite | `src/renderer/components/TileSprite.ts` | Unchanged |
| TilePool | `src/renderer/pools/TilePool.ts` | Unchanged |
| BlockedHint | `src/renderer/components/BlockedHint.ts` | Unchanged |
| ComboFeedback | `src/renderer/components/ComboFeedback.ts` | Unchanged |
| ScoreFloater | `src/renderer/effects/ScoreFloater.ts` | Unchanged |
| FailurePopup | `src/renderer/components/FailurePopup.ts` | Unchanged |

### New Components (Phase 2)

| Component | File | Description |
|-----------|------|-------------|
| **AssistBar** | `src/renderer/components/AssistBar.ts` | Container with 3 Button instances (undo, hint, shuffle). Methods: `updateCounts(undo, hint, shuffle)`, callbacks for each action. |
| **SettingsScreen** | `src/renderer/screens/SettingsScreen.ts` | Container with title, back button, 4 control rows (2 volume sliders + 2 mute toggles). Reads/writes AudioManager state. |
| **AudioManager** | `src/audio/AudioManager.ts` | **Singleton.** Manages AudioContext, SFX bus (GainNode), BGM bus (GainNode). Methods: `init()`, `playSfx(type)`, `startBgm()`, `stopBgm()`, `setSfxVolume(v)`, `setBgmVolume(v)`, `setSfxMuted(b)`, `setBgmMuted(b)`. |
| **Slider** | `src/renderer/components/Slider.ts` | Simple horizontal slider: track bar + draggable thumb. Emits value changes (0–1 range). Used on SettingsScreen for volume. |

### Engine Extensions (Phase 2)

| Extension | File | Description |
|-----------|------|-------------|
| `GameState.undo()` | `src/engine/GameState.ts` | Pops last match from history stack, restores stones to board/tray. Max 3 depth (D-05). |
| `GameState.hint()` | `src/engine/GameState.ts` | Calls `Solver.findHintPair()`, returns pair of stone IDs or null. Max 3 uses (D-05). |
| `GameState.shuffle()` | `src/engine/GameState.ts` | Calls `BoardModel.shuffle()`, reassigns positions. Max 1 use (D-05). |
| `Solver.findHintPair()` | `src/engine/Solver.ts` | Static method: finds one matching pair of free stones. Returns `[stoneId, partnerId] \| null`. |
| `BoardModel.shuffle()` | `src/engine/BoardModel.ts` | Fisher-Yates shuffle on remaining stone positions, then `buildNeighbors()`. |
| Timer tracking | `src/engine/GameState.ts` | `getStats()` returns `elapsedMs` from level start time. |

---

## Animation Contract

Phase 1 animations preserved. Phase 2 additions:

| Interaction | Timing | Easing | Description |
|-------------|--------|--------|-------------|
| Screen transition (fade/scale) | 350ms | ease-out | All screens. Unchanged from Phase 1. |
| Hint highlight glow | 400ms | pulse (sine, 2 cycles) | Both hinted tiles pulse brightness 1.0→1.3→1.0 twice. Yellow-gold overlay (`0xF5D78E`, alpha 0.3→0.6→0.3). |
| Assist button press feedback | 150ms | ease-out | Scale 1.0→0.92→1.0 on tap for tactile feel. |
| Assist button count decrement | instant | — | Label text updates immediately on tap. No animation on number change. |
| Volume slider drag | real-time | — | Thumb follows pointer. Fill bar width updates per frame during drag. |
| Settings mute toggle | 200ms | ease-in-out | Icon color transition (gold → red or red → gold). |
| Timer update | 1s interval | — | Text update every second. No animation, just text change. |
| Back button (game→home) | 350ms | ease-out | ScreenManager crossfade. Game state discarded. No confirm, no pause. |

---

## Audio Contract

### SFX Types and Characteristics

| SFX Type | Trigger | Waveform | Frequency | Duration | Envelope |
|----------|---------|----------|-----------|----------|----------|
| tap | Tile selected | sine | 880 Hz (A5) | 150ms | attack 5ms, decay to 0.001 at 150ms |
| match | Pair matched | triangle | 660 Hz (E5) | 200ms | attack 5ms, sustain 100ms at 0.3, decay to 0.001 at 200ms |
| combo | Combo 2+ | square (filtered) | 1047 Hz (C6) | 250ms | attack 5ms, sustain 80ms at 0.3, decay to 0.001 at 250ms |
| win | Level clear | sine chord (C-E-G) | 523/659/784 Hz | 600ms | staggered attack, decay to 0.001 at 600ms |
| fail | Deadlock | sine (descending) | 440→330 Hz | 400ms | sweep down, decay to 0.001 at 400ms |
| click | Button tap | sine | 1047 Hz (C6) | 80ms | attack 3ms, decay to 0.001 at 80ms |

### BGM Characteristics
- Style: Chinese pentatonic loop (C-D-E-G-A scale)
- Duration: ~16 bars, seamless loop
- Implementation: OscillatorNode scheduled via `AudioContext.currentTime`, look-ahead 4 bars
- Waveform: triangle (soft), with harmonic overtone at 2× frequency (sine, 0.15 gain)
- Tempo: ~80 BPM, gentle pacing

### Volume Ranges
- SFX volume: 0.0 – 1.0 (default: 0.7)
- BGM volume: 0.0 – 1.0 (default: 0.4, quieter than SFX by design)
- Independent mute toggles for SFX and BGM
- AudioContext created lazily on first user gesture (home screen button tap) per autoplay policy

---

## Interaction Contract

### Back Button Behavior (D-11)
1. User taps HUD back button during gameplay.
2. ScreenManager transitions to home with 350ms crossfade.
3. GameState is discarded (no save, no resume).
4. **No confirmation dialog.** Immediate.
5. Audio continues (AudioManager is App-level singleton, not bound to GameScreen lifecycle).

### Assist Button Behavior
1. User taps an assist button.
2. If count > 0: button plays press animation (150ms), triggers engine action, updates label count.
3. If count = 0: button is visually dimmed (alpha 0.35), pointer events disabled. No response.
4. Hint specifically: if `Solver.findHintPair()` returns null (deadlock), count is NOT decremented and no highlight appears. Button stays active.
5. Shuffle: After shuffle, game state updates. If board becomes deadlocked post-shuffle, existing FailurePopup handles it. Shuffle count is consumed regardless of outcome (D-07 says "re-randomize remaining tile positions").

### Settings Interaction
1. Home screen gear icon tap → ScreenManager.show('settings') with crossfade.
2. Settings back button → ScreenManager.show('home') with crossfade.
3. Volume slider: drag thumb to adjust. GainNode value updates in real time.
4. Mute toggle: tap cycles mute on/off. Sets GainNode value to 0 or stored volume.
5. Settings are NOT persisted (Phase 3). AudioManager defaults apply on app restart.

### Timer Behavior
1. Timer starts when level begins (GameScreen.startLevel).
2. Displays elapsed time as MM:SS in HUD.
3. Stops on WIN or deadlock.
4. Final elapsed time passed to ResultScreen via `GameStats`.
5. Timer is always visible — no low-pressure mode (D-03).

### Level Select (D-01, D-02)
1. Home screen shows single button "关卡 X" where X = current level.
2. Tapping starts that level via ScreenManager.show('game'), then GameScreen.startLevel(X).
3. After completing level N, current level advances to N+1.
4. Completed levels are NOT replayable from the UI.
5. Result screen "关卡 N+1" button starts the next level.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| not applicable (PixiJS game) | — | — |

No shadcn, no third-party component registries. All UI is custom PixiJS 8 containers. All audio is browser-native Web Audio API. Zero external runtime dependencies added in Phase 2.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

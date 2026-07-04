# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the planning, research, and design materials for a pixel-perfect recreation of **Vita Mahjong** (a modern Mahjong Solitaire mobile game). It was created as a take-home test assignment.

- **Goal**: Implement Home → Game → Result flow playable on mobile for at least 20 levels.
- **Design authority**: `PRD.md` is the canonical spec. It is derived from video frame analysis, the official website, and the test prompt screenshots.
- **Current state**: The repo has no application source code, build system, tests, or dependency manifests yet. It contains only research notes, screenshots, the original test PDF, and a Python virtual environment that was used for image/video frame processing.

## Repository Layout

```
/Users/mac/Documents/vita-mahjong/
├── PRD.md                              # Canonical product spec; read this first
├── 测试题.pdf                           # Original test prompt PDF
├── assets/screenshots/
│   ├── key_nodes/                      # 12 key-frame screenshots referenced by PRD
│   └── video_frames_fine/              # Fine-grained video frame extraction (~350 PNGs)
├── tmp/
│   ├── research_video.md               # Per-frame video analysis
│   ├── research_website.md             # vitamahjong.io rules/features notes
│   ├── research_test_images.md         # Test-prompt screenshot UI breakdown
│   ├── pdfs/                           # Rendered test-prompt page images
│   └── video/                          # Original source screen recording
└── .venv/                              # Python 3.13 venv with numpy + pillow
```

## Development Commands

There is **no build, lint, or test setup yet** because the project has not been scaffolded. When implementation begins, add the standard commands for the chosen stack here.

Current useful commands:

- **Activate the existing Python environment** (used for screenshot/frame processing):
  ```zsh
  source .venv/bin/activate
  ```
- **Installed Python packages**: `numpy`, `pillow`.
- **Run a Python helper script** (if you add one):
  ```zsh
  .venv/bin/python <script>.py
  ```

## High-Level Architecture Guidance

When implementing, aim for the following architecture that matches the PRD constraints.

### Core Flow

1. **Home**: warm wood/grain background, `Vita MAHJONG` logo, level button (`关卡 1`), settings gear.
2. **Game**: green felt board, top status bar (`关卡 / 分数 / 匹配`), 4-slot tile tray, multi-layer tile board.
3. **Result**: dark background, golden title, time/score/combo stats, "beat X% of players" text, next-level button.

### Tile Rules

- A tile is selectable only if it is a **free tile**:
  - No tile directly above it.
  - At least one side (left or right) is open.
- Tap a free tile to fly it into the leftmost empty tray slot.
- Match two identical tiles in the tray to remove them, score, and increment combo.
- Tray capacity is **4 slots**.
- Non-free tile taps should dim the tile and show a "被左右锁住" indicator.

### Scoring & Rating

- Use **分数** only; do not display IQ.
- Proposed formula from `PRD.md` §9.3:
  - `单次匹配得分 = 100 × (1 + 连击加成) + 终局加成`
  - `连击加成 = min(连击数 - 1, 9) × 0.2`
  - `终局加成 = +50` if ≤4 tiles remain
  - `时间奖励 = max(目标秒数 - 实际秒数, 0) × 2`
  - `星级奖励 = +500` for 3-star clear
- Combo resets after ~3 seconds without a successful match or after tapping a blocked tile.
- Rating: 5 tiers (Bronze → Silver → Gold → Platinum → Diamond) based on score.

### Level Design

- 20 levels are specified in `PRD.md` §7.3 with tile counts, layer counts, themes, and star targets.
- Themes include zodiac signs, traditional mahjong suits, animals, oriental symbols, seasons, and mythic symbols.
- Store level definitions in JSON so layouts/themes can be iterated without code changes.
- Every level must be **solvable**; the layout generator or validator must ensure at least one clear path and an even count of each tile type.

### Scope Exclusions (Do Not Implement)

These are explicitly out of scope per `PRD.md`:

- Ads, in-app purchases, currency/economy.
- Power-ups: Hint, Shuffle, Undo.
- Account levels (e.g., `Lv. 6`).
- Daily challenges and Active Mind Levels.
- Sound effects and haptics.
- Bottom toolbar on the game screen.

### Mobile Adaptation

- Design baseline: 1080 × 2400 portrait (20:9).
- Use relative/anchor-based layout; tile width ~0.21 screen width, height ~0.11 screen height.
- Honor safe-area insets for notches/dynamic island.
- Touch targets ≥ 64 px for top buttons; expand tile hit boxes slightly beyond visual bounds.

### Asset Notes

- All visual reference lives in `assets/screenshots/` and `tmp/`.
- The original screen recording is at `tmp/video/Screenrecorder-2026-07-04-17-52-17-140.mp4`.
- Use the key-node screenshots (`assets/screenshots/key_nodes/`) as the primary visual reference for layout, colors, and animations.

## Cursor / Copilot Rules

There are no `.cursorrules`, `.cursor/rules/`, or `.github/copilot-instructions.md` files in this repository.

## README

There is no `README.md` in this repository yet. Consider creating one when the project is scaffolded to explain how to run the game locally and on a mobile device.

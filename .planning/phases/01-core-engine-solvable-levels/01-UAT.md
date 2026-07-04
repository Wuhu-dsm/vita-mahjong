---
status: diagnosed
phase: 01-core-engine-solvable-levels
source:
  - 01-VERIFICATION.md
started: 2026-07-04T19:31:03Z
updated: 2026-07-04T19:48:58Z
---

# Phase 01 UAT

## Current Test

[testing complete]

## Tests

### 1. Mobile Start And Board Rendering

expected: In a 20:9 portrait viewport, tapping "关卡 1" on the home screen transitions to the game screen and shows a correctly stacked board.
result: pass

### 2. Free-Tile Match Interaction

expected: Tapping two matching free tiles moves them to the tray, clears the pair, updates score/combo, and removes both board tiles.
result: pass

### 3. Blocked-Tile Feedback

expected: A blocked tile cannot be selected and shows dimming, red arrows, and "被左右锁住" without obscuring nearby UI.
result: issue
reported: "不通过，阻挡的麻将牌点击后，在一定时间后还是展示的异常态，并且周围的麻将牌有箭头遮挡"
severity: major

### 4. Win Flow

expected: Clearing all tiles transitions to the result screen with time, score, combo, progress, and next-level action.
result: pass

### 5. Failure And Retry Flow

expected: Filling the tray with 4 unmatched tiles, or reaching a no-move state, shows the failure popup with "重新开始" and retry resets the level.
result: pass

## Summary

total: 5
passed: 4
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "A blocked tile cannot be selected and shows dimming, red arrows, and \"被左右锁住\" without obscuring nearby UI."
  status: failed
  reason: "User reported: 不通过，阻挡的麻将牌点击后，在一定时间后还是展示的异常态，并且周围的麻将牌有箭头遮挡"
  severity: major
  test: 3
  root_cause: "Blocked-tile feedback has two independent arrow systems and no lifecycle for clearing the TileSprite blocked state. GameScreen sets tile.setBlocked(true) on blocked taps but only BlockedHint has a 1.2s timeout; TileSprite arrows remain visible and are placed outside the tile bounds, so they persist and overlap neighboring tiles."
  artifacts:
    - path: "src/renderer/screens/GameScreen.ts"
      issue: "Blocked tap path calls tile.setBlocked(true) and returns without scheduling a reset for the TileSprite blocked state."
    - path: "src/renderer/components/TileSprite.ts"
      issue: "Tile-local blocked arrows remain visible until an unrelated reset path runs and are positioned outside the tile face where they can cover adjacent tiles."
    - path: "src/renderer/components/BlockedHint.ts"
      issue: "Hint component renders an additional pair of arrows, duplicating TileSprite arrows and increasing clutter."
  missing:
    - "Add a timed lifecycle that clears tile-local blocked feedback after the hint duration or next blocked tap."
    - "Avoid duplicate arrow systems by keeping arrows either in the temporary hint layer or within the tapped tile's visual bounds."
    - "Add verification for blocked feedback timeout/reset and run mobile/browser UAT for adjacent tile readability."
  debug_session: ".planning/debug/blocked-tile-feedback.md"

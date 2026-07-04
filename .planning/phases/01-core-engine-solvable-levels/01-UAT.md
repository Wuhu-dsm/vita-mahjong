---
status: testing
phase: 01-core-engine-solvable-levels
source:
  - 01-VERIFICATION.md
started: 2026-07-04T19:31:03Z
updated: 2026-07-04T19:31:03Z
---

# Phase 01 UAT

## Current Test

number: 1
name: Mobile start and board rendering
expected: |
  In a 20:9 portrait viewport, tapping "关卡 1" on the home screen transitions to the game screen and shows a correctly stacked board.
awaiting: user response

## Tests

### 1. Mobile Start And Board Rendering

expected: In a 20:9 portrait viewport, tapping "关卡 1" on the home screen transitions to the game screen and shows a correctly stacked board.
result: pending

### 2. Free-Tile Match Interaction

expected: Tapping two matching free tiles moves them to the tray, clears the pair, updates score/combo, and removes both board tiles.
result: pending

### 3. Blocked-Tile Feedback

expected: A blocked tile cannot be selected and shows dimming, red arrows, and "被左右锁住" without obscuring nearby UI.
result: pending

### 4. Win Flow

expected: Clearing all tiles transitions to the result screen with time, score, combo, progress, and next-level action.
result: pending

### 5. Failure And Retry Flow

expected: Filling the tray with 4 unmatched tiles, or reaching a no-move state, shows the failure popup with "重新开始" and retry resets the level.
result: pending

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

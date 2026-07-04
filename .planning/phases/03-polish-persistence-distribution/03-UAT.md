---
status: testing
phase: 03-polish-persistence-distribution
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md
started: 2026-07-05T07:45:00Z
updated: 2026-07-05T07:50:00Z
---

## Current Test

number: 2
name: Persistence Across App Restart
expected: |
  打开 App，玩一关，记住当前关卡号。关闭并重新打开浏览器。验证当前关卡号保持不变，首页按钮显示上一次玩的关卡。调整音量/静音设置，关闭并重新打开 — 验证设置正确恢复。
awaiting: user response

## Tests

### 1. Particle Burst Visual Behavior
expected: Start any level, match two identical tiles. Particles scatter radially from midpoint between matched tiles, fade out and shrink over ~500ms, then disappear cleanly. 15-20 particles on normal devices, 8-10 on low-end. Particles do NOT appear on blocked tap, undo, hint, shuffle, win, or fail. Rapid matches don't crash/leak.
result: pass

### 2. Persistence Across App Restart
expected: Open app, play a level, note currentLevel. Close and reopen browser. Verify currentLevel persists and home screen shows last played level. Change audio volume/mute settings, close and reopen — verify settings are restored correctly.
result: [pending]

### 3. Reset Progress Flow
expected: Open Settings, tap "重置进度" button. Confirmation dialog appears with heading "确认重置", body "确定要重置进度吗？所有关卡记录将被清除。", cancel "保留进度", confirm "确认重置". Tap "保留进度" — dialog dismisses, level unchanged. Tap "确认重置" — currentLevel resets to 1, home button shows "关卡 1".
result: [pending]

### 4. PWA Install & Offline
expected: Run `npm run build`, then `npx serve dist`. Open in Chrome/Safari. "Add to Home Screen" prompt or option appears. After installing PWA, go offline — home screen, level select, and cached levels still load from Service Worker.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

[none yet]

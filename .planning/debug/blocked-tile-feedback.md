---
status: awaiting_human_verify
trigger: "UAT test 3: 不通过，阻挡的麻将牌点击后，在一定时间后还是展示的异常态，并且周围的麻将牌有箭头遮挡"
created: 2026-07-04T19:48:58Z
updated: 2026-07-04T19:48:58Z
---

## Current Focus

hypothesis: "Blocked tile feedback is persistent because tile-local blocked state has no timeout/reset path."
test: "Inspect GameScreen blocked-tap path and TileSprite/BlockedHint feedback lifecycles."
expecting: "If true, the tapped TileSprite remains dimmed with arrows until reused or selected successfully, while the hint layer times out separately."
next_action: "Create a gap-closure plan that adds a timed blocked-feedback lifecycle and constrains arrows to the tapped tile/hint area."
reasoning_checkpoint: null
tdd_checkpoint: null

## Symptoms

expected: "A blocked tile cannot be selected and shows dimming, red arrows, and \"被左右锁住\" without obscuring nearby UI."
actual: "Blocked tile still shows an abnormal state after some time, and neighboring mahjong tiles are obscured by arrows."
errors: "None reported."
reproduction: "Phase 01 UAT test 3: tap a blocked tile during play."
started: "Discovered during UAT."

## Eliminated

- hypothesis: "The engine incorrectly allows blocked tiles to be selected."
  evidence: "UAT did not report tray movement/removal; GameScreen only enters feedback path when GameState.tapStone() returns !ok/blocked/no stone."
  timestamp: 2026-07-04T19:48:58Z

## Evidence

- timestamp: 2026-07-04T19:48:58Z
  checked: "src/renderer/screens/GameScreen.ts:171-175"
  found: "Blocked taps call tile.setBlocked(true) and blockedHint.showAt(...), then return."
  implication: "The tile-local blocked state is set, but no timeout or reset callback is scheduled."
- timestamp: 2026-07-04T19:48:58Z
  checked: "src/renderer/components/TileSprite.ts:178-183"
  found: "setBlocked(true) lowers face/symbol alpha and makes both tile-local arrows visible; setBlocked(false) only runs on pool reset, setStone, or successful tap of that same tile."
  implication: "A blocked tile can remain dimmed/arrowed indefinitely after the hint text fades."
- timestamp: 2026-07-04T19:48:58Z
  checked: "src/renderer/components/TileSprite.ts:129-131,197-205"
  found: "Tile-local arrows are positioned outside the tile face at +/- tile width / 2 + 18 and sized 54px wide."
  implication: "On a dense board, arrows extend into neighboring tile space and can obscure adjacent tiles."
- timestamp: 2026-07-04T19:48:58Z
  checked: "src/renderer/components/BlockedHint.ts:21-44,57-64"
  found: "BlockedHint also renders a second pair of arrows at +/-132 for 1.2s."
  implication: "The user sees both persistent tile-local arrows and temporary hint arrows, increasing visual clutter."

## Resolution

root_cause: "Blocked-tile feedback has two independent arrow systems and no lifecycle for clearing the TileSprite blocked state. GameScreen sets tile.setBlocked(true) on blocked taps but only BlockedHint has a 1.2s timeout; TileSprite arrows remain visible and are placed outside the tile bounds, so they persist and overlap neighboring tiles."
fix: "Pending gap-closure execution."
verification: "Pending implementation; expected checks are unit/static lifecycle coverage plus mobile UAT for visual readability."
files_changed: []

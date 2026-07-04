# Feature Landscape

**Domain:** Mobile Mahjong Solitaire (tile-matching puzzle)
**Researched:** 2026-07-04
**Confidence:** MEDIUM-HIGH

## Executive Summary

Mobile Mahjong Solitaire is a saturated category with well-established conventions. Players expect the core loop—match identical exposed tiles, clear the board, progress through layouts—to work flawlessly. The baseline feature set is large enough that a new entrant must nail the fundamentals before differentiating. For Vita Mahjong, the strongest opportunity is not to add novelty mechanics, but to optimize the experience for seniors and casual players: larger tiles, higher contrast, optional pressure, guaranteed solvability, and a clean, ad-free experience. Most competitors degrade their UX with aggressive monetization; avoiding that is itself a differentiator.

## Table Stakes

Features users expect. Missing these makes the product feel broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Classic pair-matching rules | Definition of the genre; any deviation confuses users | Low | Match identical exposed tiles; tile is free only when not covered and at least one long side is open. |
| Multiple levels / layouts | Standard in every modern Mahjong app; players want progression | Medium | At least 20 distinct layouts, escalating in tile count and layer depth. |
| Free-tile detection & highlighting | Players need clear feedback on which tiles are selectable | Low | Visual dimming of blocked tiles is table stakes; highlight on tap/selection. |
| Undo | Mistakes happen; users expect to walk back at least one move | Low | Simple move-stack. Multi-step undo is expected. |
| Hint | Casual players rely on hints when stuck | Low | Highlight one valid pair. Should not be unlimited in harder modes if scoring matters. |
| Shuffle / board reset | When no moves exist, players expect a way to continue | Medium | Either shuffle remaining tiles or regenerate the level while preserving progress. |
| Timer & score | Standard feedback loop; many players compete against themselves | Low | Score per match, combo bonus, time bonus. Must be toggleable for low-pressure mode. |
| Level select / progress map | Players want to choose levels and see completion status | Low | Simple grid or map showing locked/unlocked/complete states. |
| Tile themes / backgrounds | Nearly all competitors offer visual customization | Medium | Multiple tile sets and background art. Oriental classical style is the project brief. |
| Sound & music | Expected ambiance; mute option required | Low | Tile click, match chime, win fanfare, background music, separate volume controls. |
| Offline play | Many Mahjong apps advertise this as a feature | Low | All logic local; no backend required per project constraints. |
| Result / victory screen | Closure after completing a level | Low | Show score, time, stars, and next-level button. |
| Retry / replay level | Players want to improve scores or recover from failure | Low | Reset same layout or restart current level. |

## Differentiators

Features that set the product apart and align with the Core Value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Guaranteed solvable layouts | Eliminates the #1 frustration: unwinnable boards | High | Requires solvable level-generation algorithm or solve-check during shuffle. Strong selling point vs random generators. |
| Elderly-first accessibility | Large tiles, high contrast, clear fonts, generous touch targets | Medium | Directly serves target demographic; most competitors treat this as an afterthought. |
| Toggleable low-pressure mode | Removes timer/score pressure for relaxation | Low | Differentiates from ad-supported apps that push engagement metrics. |
| One-tap undo / hint controls | Reduces cognitive load and fine-motor demands | Low | Large, always-visible buttons; avoids hidden gestures. |
| Oriental classical art direction | Aesthetic cohesion vs generic tile sets | Medium | Distinctive visual identity; must not sacrifice readability. |
| Smooth match/elimination animations & particle feedback | Creates satisfying "combo" feel | Medium | Particles must be degradable on low-end devices per constraints. |
| Ad-free / no-IAP experience | Clean, uninterrupted play | Low | Aligns with project constraints; stands out against ad-heavy competitors. |
| Persistent session recovery | Players can resume exactly where they left off | Low | Important for seniors who may interrupt play frequently. |
| Visual combo / chain indicator | Reinforces the "instant feedback" and "combo爽感" from Core Value | Low | Show consecutive matches and multiplier. |
| Congratulatory haptics | Physical confirmation of matches and wins | Low | Optional; supports vibration API on mobile. |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Banner/interstitial ads | Violates project constraint; degrades senior UX and creates accidental taps | Stay ad-free; differentiate on cleanliness. |
| In-app purchases / coin economy | Violates project constraint; introduces friction and balance issues | Offer all content unlocked; no virtual currency. |
| Energy / lives system | Creates artificial stopping points and frustration | Unlimited retries; progress-based unlocking only. |
| Multiplayer / PvP | Outside core value; adds backend complexity | Stay single-player local. |
| Global leaderboards / social sharing | Requires backend; not valued by target demographic | Local high scores only; optional share sheet if needed later. |
| Account sign-in / cloud save | Requires backend; adds friction for seniors | Local storage with export/import if cross-device support is later desired. |
| Complex meta-progression (collectibles, seasons, battle passes) | Scope creep; distracts from core relaxing experience | Simple level progression and unlockable themes. |
| Wildcard / special power-up tiles | Breaks classic Mahjong expectation; complicates balance | Keep standard tile sets; rely on hint/shuffle for assistance. |
| Daily challenges / events | Adds maintenance burden and date logic | Defer; focus on core 20+ level campaign first. |
| Forced tutorial / unskippable onboarding | Seniors and casual players dislike hand-holding | Optional quick tips; tooltips on first use. |

## Feature Dependencies

```
Core Match Logic
    └──requires──> Free-Tile Detection
        └──requires──> Tile Layout Data Model

Scoring System
    └──requires──> Core Match Logic
    └──enhances──> Result Screen

Low-Pressure Mode
    └──requires──> Toggleable Timer
    └──requires──> Toggleable Score Display

Hint / Shuffle
    └──requires──> Free-Tile Detection
    └──requires──> Solvability Check (for shuffle)

Guaranteed Solvability
    └──requires──> Level Generation Algorithm
    └──requires──> Undo / Move History

Accessibility Mode
    └──requires──> Scalable Tile Size
    └──requires──> High-Contrast Tile Sets
    └──requires──> Large Touch Targets

Themes / Backgrounds
    └──requires──> Asset Loading Pipeline
    └──conflicts──> High-Contrast Readability (must validate each theme)

Particle Effects
    └──requires──> Animation System
    └──conflicts──> Low-End Performance (needs degrade path)
```

### Dependency Notes

- **Scoring requires Core Match Logic:** Points are derived from matches, combos, and remaining time.
- **Low-Pressure Mode requires Timer/Score toggles:** The mode is defined by the absence of time and score pressure.
- **Hint/Shuffle requires Solvability awareness:** Shuffling should never produce an unwinnable state.
- **Accessibility Mode conflicts with ornate themes:** Decorative tile faces must remain legible at large sizes and high contrast.
- **Particles conflict with low-end performance:** Always provide a "reduced motion / simple effects" setting.

## MVP Recommendation

Prioritize for the first playable milestone:

1. **Core match loop** — tile selection, free-tile validation, pair matching, removal.
2. **20+ solvable layouts** — escalating difficulty up to 128 tiles / 7 layers.
3. **Undo, Hint, Shuffle** — basic assistance tools.
4. **Accessibility-first visuals** — large tiles, high contrast, clear fonts.
5. **Low-pressure mode toggle** — timer/score can be disabled.
6. **Oriental classical visual theme** — one cohesive tile set and background.
7. **Basic result screen** — time, score, stars, retry, next level.

Defer:

- Multiple unlockable themes (add after core validation).
- Daily challenges / achievements.
- Advanced animation particles beyond match pop.
- Soundtrack complexity beyond simple SFX and ambient loop.
- Cloud save or cross-device sync.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Core match logic | High | Low | P1 |
| 20+ solvable levels | High | Medium | P1 |
| Free-tile detection | High | Low | P1 |
| Undo | High | Low | P1 |
| Hint | High | Low | P1 |
| Shuffle | High | Medium | P1 |
| Accessibility (large tiles, high contrast) | High | Medium | P1 |
| Low-pressure mode | High | Low | P1 |
| Result screen | High | Low | P1 |
| Guaranteed solvability | High | High | P1 |
| Oriental classical theme | Medium | Medium | P1 |
| Match/elimination animations | Medium | Medium | P2 |
| Particle effects (degradable) | Medium | Medium | P2 |
| Combo indicator | Medium | Low | P2 |
| Multiple themes/backgrounds | Medium | Medium | P2 |
| Haptics | Low | Low | P3 |
| Session recovery | Medium | Low | P2 |
| Daily challenges | Low | Medium | P3 |
| Achievements | Low | Medium | P3 |
| Social sharing | Low | Low | P3 |

## Competitor Feature Analysis

| Feature | Microsoft Mahjong | Mahjong Epic | Netflix Mahjong | Our Approach |
|---------|-------------------|--------------|-----------------|--------------|
| Ads / IAP | Yes / Subscription + IAP | Yes / Ads + IAP | No (subscription gate) | No ads, no IAP |
| Daily challenges | Yes | Yes | Yes | Defer |
| Themes / backgrounds | Many unlockable | 8 tile sets | Stranger Things themes | One strong oriental theme first |
| Guaranteed solvable | Yes (implied) | Yes (stated) | Yes (stated) | Yes, core differentiator |
| Large tiles for seniors | Mediocre | Mediocre | Mediocre | Primary design goal |
| Offline play | No (requires internet) | Yes | Requires Netflix login | Fully offline |
| Timer toggle | Yes | Limited | Yes | Yes, plus low-pressure mode |
| Account required | Yes | No | Yes (Netflix) | No account |

## Sources

- Wikipedia: Mahjong solitaire — rules, variations, history, common options (shuffle, undo, layouts, wildcard tiles). Confidence: HIGH.
- Microsoft Mahjong (App Store / Google Play) — feature list, monetization model, daily challenges, themes, account requirements. Confidence: HIGH.
- Mahjong Epic (Google Play) — offline play, large tile sets, solvability claim, senior-friendly positioning. Confidence: HIGH.
- Mahjong Solitaire NETFLIX (Google Play) — guaranteed solvable puzzles, XP progression, daily challenges, theme system. Confidence: HIGH.
- Mahjongg Solitaire on CrazyGames — free-tile counter, hint system, timed play, special tile matching rules. Confidence: MEDIUM.
- User reviews analyzed from Microsoft Mahjong and Mahjong Epic — complaints about small tiles, intrusive ads, account requirements. Confidence: MEDIUM.

---
*Feature landscape for: Vita Mahjong mobile game*
*Researched: 2026-07-04*

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { config } from '../app/config';
import { BlockedFeedbackLifecycle, type BlockedFeedbackTarget } from '../renderer/screens/GameScreen';

class FakeBlockedTile implements BlockedFeedbackTarget {
  readonly states: boolean[] = [];

  setBlocked(enabled: boolean): void {
    this.states.push(enabled);
  }

  get blocked(): boolean {
    return this.states.at(-1) ?? false;
  }
}

describe('blocked tile feedback lifecycle', () => {
  it('clears the previous blocked tile before marking another tile', () => {
    const lifecycle = new BlockedFeedbackLifecycle<FakeBlockedTile>();
    const first = new FakeBlockedTile();
    const second = new FakeBlockedTile();

    lifecycle.show(first, 1_000, config.timings.blockedFeedbackMs);
    lifecycle.show(second, 1_100, config.timings.blockedFeedbackMs);

    expect(first.states).toEqual([true, false]);
    expect(second.states).toEqual([true]);
    expect(first.blocked).toBe(false);
    expect(second.blocked).toBe(true);
  });

  it('clears the current blocked tile after the configured feedback duration', () => {
    const lifecycle = new BlockedFeedbackLifecycle<FakeBlockedTile>();
    const tile = new FakeBlockedTile();
    const now = 2_000;

    lifecycle.show(tile, now, config.timings.blockedFeedbackMs);
    lifecycle.update(now + config.timings.blockedFeedbackMs - 1);
    expect(tile.blocked).toBe(true);

    lifecycle.update(now + config.timings.blockedFeedbackMs);
    lifecycle.update(now + config.timings.blockedFeedbackMs + 1_000);

    expect(tile.states).toEqual([true, false]);
    expect(tile.blocked).toBe(false);
  });

  it('clears stale blocked feedback when the board is reset or re-rendered', () => {
    const lifecycle = new BlockedFeedbackLifecycle<FakeBlockedTile>();
    const tile = new FakeBlockedTile();

    lifecycle.show(tile, 3_000, config.timings.blockedFeedbackMs);
    lifecycle.clear();
    lifecycle.clear();

    expect(tile.states).toEqual([true, false]);
    expect(tile.blocked).toBe(false);
  });
});

describe('blocked tile visual cue ownership', () => {
  it('keeps TileSprite blocked state dim-only with no persistent local arrows', () => {
    const source = readFileSync(new URL('../renderer/components/TileSprite.ts', import.meta.url), 'utf8');

    expect(source).toContain('blockedOverlay.alpha = enabled ? 0.44 : 0');
    expect(source).toContain('faceSprite.alpha = enabled ? 0.72 : 1');
    expect(source).not.toContain('smallSymbolText');
    expect(source).not.toMatch(/[一二三四五六七八九][万条筒]/);
    expect(source).not.toMatch(/leftArrow|rightArrow|createBlockedArrow|tile_blocked_arrow/);
  });

  it('keeps BlockedHint as the reference-style label and red side-arrow cue', () => {
    const source = readFileSync(new URL('../renderer/components/BlockedHint.ts', import.meta.url), 'utf8');

    expect(source).toContain('被左右锁住');
    expect(source).toContain('HINT_LABEL_WIDTH = 318');
    expect(source).toContain('HINT_ARROW_OFFSET_X = 126');
    expect(source).toContain('HINT_ARROW_WIDTH = 118');
    expect(source).not.toContain('tile_blocked_arrow');
  });
});

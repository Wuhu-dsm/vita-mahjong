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

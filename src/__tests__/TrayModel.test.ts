import { describe, expect, it } from 'vitest';
import { ComboTracker, matchScore } from '../engine/GameState';
import { TrayModel } from '../engine/TrayModel';
import type { Stone } from '../engine/types';

function stone(id: string, face: number): Stone {
  return {
    id,
    z: 0,
    x: 0,
    y: 0,
    face,
    picked: false,
    top: [],
    left: [],
    right: [],
  };
}

describe('TrayModel', () => {
  it('adds a tile to the leftmost empty slot', () => {
    const tray = new TrayModel();
    const result = tray.add(stone('a', 1));

    expect(result).toEqual({ accepted: true, matched: false, removed: [], full: false });
    expect(tray.peek().map((slot) => slot?.id ?? null)).toEqual(['a', null, null, null]);
  });

  it('removes a matching pair immediately regardless of adjacency', () => {
    const tray = new TrayModel();
    const first = stone('a', 1);
    const blocker = stone('b', 2);
    const match = stone('c', 1);

    tray.add(first);
    tray.add(blocker);
    const result = tray.add(match);

    expect(result.matched).toBe(true);
    expect(result.full).toBe(false);
    expect(result.removed.map((s) => s.id)).toEqual(['a', 'c']);
    expect(tray.peek().map((slot) => slot?.id ?? null)).toEqual([null, 'b', null, null]);
  });

  it('keeps a third tile of a matched face in the tray after a pair clears', () => {
    const tray = new TrayModel();

    tray.add(stone('a', 1));
    tray.add(stone('b', 1));
    tray.add(stone('c', 1));

    expect(tray.peek().map((slot) => slot?.id ?? null)).toEqual(['c', null, null, null]);
  });

  it('reports full when four unmatched tiles occupy the tray', () => {
    const tray = new TrayModel();

    tray.add(stone('a', 1));
    tray.add(stone('b', 2));
    tray.add(stone('c', 3));
    const result = tray.add(stone('d', 4));

    expect(result).toEqual({ accepted: true, matched: false, removed: [], full: true });
    expect(tray.isFull()).toBe(true);
  });

  it('preserves remaining tile positions after a match', () => {
    const tray = new TrayModel();

    tray.add(stone('a', 1));
    tray.add(stone('b', 2));
    tray.add(stone('c', 3));
    tray.add(stone('d', 2));

    expect(tray.peek().map((slot) => slot?.id ?? null)).toEqual(['a', null, 'c', null]);
  });
});

describe('scoring helpers', () => {
  it('calculates PRD match scores', () => {
    expect(matchScore(1)).toBe(100);
    expect(matchScore(2)).toBe(120);
    expect(matchScore(5)).toBe(180);
    expect(matchScore(10)).toBe(280);
  });

  it('tracks combos inside the 3 second window', () => {
    const tracker = new ComboTracker();

    expect(tracker.onMatch(1000)).toBe(1);
    expect(tracker.onMatch(2500)).toBe(2);
    expect(tracker.getCombo()).toBe(2);
  });

  it('resets combos after the window elapses', () => {
    const tracker = new ComboTracker();

    tracker.onMatch(1000);
    expect(tracker.onMatch(4001)).toBe(1);
  });

  it('resets combos on blocked taps', () => {
    const tracker = new ComboTracker();

    tracker.onMatch(1000);
    tracker.onMatch(1500);
    tracker.onBlockedTap();

    expect(tracker.getCombo()).toBe(0);
    expect(tracker.onMatch(1600)).toBe(1);
  });
});

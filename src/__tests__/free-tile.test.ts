import { describe, expect, it } from 'vitest';
import { buildNeighbors, isBlocked, overlaps } from '../engine/isBlocked';
import type { Stone } from '../engine/types';

function stone(z: number, x: number, y: number): Stone {
  return {
    id: `${z}-${x}-${y}`,
    z,
    x,
    y,
    face: 0,
    picked: false,
    top: [],
    left: [],
    right: [],
  };
}

describe('isBlocked', () => {
  it('single stone is not blocked', () => {
    const s = stone(0, 0, 0);
    expect(isBlocked(s)).toBe(false);
  });

  it('stone with top neighbor is blocked', () => {
    const bottom = stone(0, 0, 0);
    const top = stone(1, 0, 0);
    buildNeighbors([bottom, top]);
    expect(isBlocked(bottom)).toBe(true);
    expect(isBlocked(top)).toBe(false);
  });

  it('stone with both left and right neighbors is blocked', () => {
    const center = stone(0, 0, 0);
    const left = stone(0, -2, 0);
    const right = stone(0, 2, 0);
    buildNeighbors([center, left, right]);
    expect(isBlocked(center)).toBe(true);
  });

  it('stone with only left neighbor is free', () => {
    const center = stone(0, 0, 0);
    const left = stone(0, -2, 0);
    buildNeighbors([center, left]);
    expect(isBlocked(center)).toBe(false);
  });

  it('stone with only right neighbor is free', () => {
    const center = stone(0, 0, 0);
    const right = stone(0, 2, 0);
    buildNeighbors([center, right]);
    expect(isBlocked(center)).toBe(false);
  });

  it('picked neighbors do not block', () => {
    const center = stone(0, 0, 0);
    const left = stone(0, -2, 0);
    const right = stone(0, 2, 0);
    left.picked = true;
    buildNeighbors([center, left, right]);
    expect(isBlocked(center)).toBe(false);
  });

  it('top overlap detects partial x overlap', () => {
    const bottom = stone(0, 0, 0);
    const top = stone(1, 0, 0);
    expect(overlaps(top, bottom)).toBe(true);
  });

  it('top overlap ignores non-overlapping stones', () => {
    const bottom = stone(0, 0, 0);
    const top = stone(1, 3, 0);
    expect(overlaps(top, bottom)).toBe(false);
  });
});

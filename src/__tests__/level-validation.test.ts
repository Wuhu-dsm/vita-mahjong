import { afterEach, describe, expect, it, vi } from 'vitest';
import { Solver } from '../engine/Solver';
import { validatePlayableLevel } from '../engine/validateLevel';
import type { Level } from '../engine/types';

function level(overrides: Partial<Level> = {}): Level {
  return {
    id: 1,
    name: 'Valid pair',
    theme: 'zodiac',
    maxLayer: 0,
    stones: [
      { z: 0, x: 0, y: 0, face: 1 },
      { z: 0, x: 0, y: 2, face: 1 },
    ],
    ...overrides,
  };
}

describe('validatePlayableLevel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts a small solvable level', () => {
    expect(validatePlayableLevel(level()).stones).toHaveLength(2);
  });

  it('rejects empty levels', () => {
    expect(() => validatePlayableLevel(level({ stones: [] }))).toThrow(/stone count/);
  });

  it('rejects levels above the seven-layer budget', () => {
    expect(() => validatePlayableLevel(level({ maxLayer: 7 }))).toThrow(/maxLayer/);
  });

  it('rejects duplicate stone positions', () => {
    expect(() =>
      validatePlayableLevel(
        level({
          stones: [
            { z: 0, x: 0, y: 0, face: 1 },
            { z: 0, x: 0, y: 0, face: 1 },
          ],
        }),
      ),
    ).toThrow(/duplicate position/);
  });

  it('rejects unsolvable levels', () => {
    vi.spyOn(Solver, 'isSolvable').mockReturnValue(false);

    expect(() => validatePlayableLevel(level())).toThrow(/not solvable/);
  });
});

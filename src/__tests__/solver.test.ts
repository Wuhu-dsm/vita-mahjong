import { describe, expect, it } from 'vitest';
import { Solver } from '../engine/Solver';
import { LayoutBuilder } from '../generator/LayoutBuilder';
import { DEFAULT_SEED, SolvableDealer, createSeededRng } from '../generator/SolvableDealer';
import { buildFacePairs } from '../generator/generate-levels';

function dealLevel(levelId: number) {
  const layout = LayoutBuilder.get(levelId);

  return SolvableDealer.deal(
    layout,
    buildFacePairs(layout.theme, layout.positions.length / 2),
    createSeededRng(`${DEFAULT_SEED}:${layout.id}`),
  );
}

describe('generated level solver validation', () => {
  it.each([1, 10, 20])('verifies level %i as solvable', (levelId) => {
    const level = dealLevel(levelId);

    expect(Solver.isSolvable(level)).toBe(true);
  });
});

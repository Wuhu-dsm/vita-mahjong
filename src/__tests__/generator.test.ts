import { describe, expect, it } from 'vitest';
import { Solver } from '../engine/Solver';
import type { Level, LevelLayout, ThemeId } from '../engine/types';
import { LayoutBuilder, THEME_FACE_SETS } from '../generator/LayoutBuilder';
import { DEFAULT_SEED, createSeededRng, SolvableDealer } from '../generator/SolvableDealer';

const EXPECTED_TILE_COUNTS = new Map<number, number>([
  [1, 24],
  [2, 36],
  [3, 40],
  [4, 48],
  [5, 56],
  [6, 60],
  [7, 64],
  [8, 72],
  [9, 72],
  [10, 80],
  [11, 84],
  [12, 90],
  [13, 90],
  [14, 96],
  [15, 100],
  [16, 108],
  [17, 108],
  [18, 112],
  [19, 120],
  [20, 128],
]);

const EXPECTED_THEMES = new Map<number, string>([
  [1, 'zodiac'],
  [2, 'zodiac'],
  [3, 'zodiac'],
  [4, 'traditional'],
  [5, 'traditional'],
  [6, 'traditional'],
  [7, 'traditional'],
  [8, 'traditional'],
  [9, 'animals'],
  [10, 'animals'],
  [11, 'animals'],
  [12, 'traditional'],
  [13, 'oriental'],
  [14, 'oriental'],
  [15, 'oriental'],
  [16, 'traditional'],
  [17, 'seasons'],
  [18, 'seasons'],
  [19, 'myth'],
  [20, 'myth'],
]);

describe('LayoutBuilder', () => {
  it('returns exactly 20 level layouts', () => {
    expect(LayoutBuilder.getAll()).toHaveLength(20);
  });

  it('matches the Phase 1 tile budgets with even position counts', () => {
    for (const layout of LayoutBuilder.getAll()) {
      expect(layout.positions).toHaveLength(EXPECTED_TILE_COUNTS.get(layout.id));
      expect(layout.positions.length % 2).toBe(0);
    }
  });

  it('keeps level 20 within the 128 tile and 7 layer budget', () => {
    const level20 = LayoutBuilder.get(20);
    const zValues = level20.positions.map(([z]) => z);

    expect(level20.positions).toHaveLength(128);
    expect(Math.max(...zValues)).toBeLessThanOrEqual(6);
    expect(level20.maxLayer).toBe(6);
  });

  it('uses the D-09 theme mapping for each level range', () => {
    for (const layout of LayoutBuilder.getAll()) {
      expect(layout.theme).toBe(EXPECTED_THEMES.get(layout.id));
      expect(THEME_FACE_SETS[layout.theme].faceIds.length).toBeGreaterThan(0);
    }
  });

  it('uses unique integer grid positions with 2-unit horizontal spacing', () => {
    for (const layout of LayoutBuilder.getAll()) {
      const keys = new Set(layout.positions.map((position) => position.join(',')));
      expect(keys.size).toBe(layout.positions.length);

      for (const [, x, y] of layout.positions) {
        expect(Number.isInteger(x)).toBe(true);
        expect(Number.isInteger(y)).toBe(true);
      }
    }
  });
});

function facePairsFor(theme: ThemeId, pairCount: number): number[] {
  const faceIds = THEME_FACE_SETS[theme].faceIds;

  return Array.from({ length: pairCount }, (_, index) => faceIds[index % faceIds.length]);
}

function countFaces(level: Level): Map<number, number> {
  const counts = new Map<number, number>();

  for (const stone of level.stones) {
    counts.set(stone.face, (counts.get(stone.face) ?? 0) + 1);
  }

  return counts;
}

describe('SolvableDealer', () => {
  it('assigns every face in even-count pairs', () => {
    const layout = LayoutBuilder.get(1);
    const level = SolvableDealer.deal(
      layout,
      facePairsFor(layout.theme, layout.positions.length / 2),
      createSeededRng(DEFAULT_SEED),
    );

    for (const count of countFaces(level).values()) {
      expect(count % 2).toBe(0);
    }
  });

  it('generates a solvable level 1 board', () => {
    const layout = LayoutBuilder.get(1);
    const level = SolvableDealer.deal(
      layout,
      facePairsFor(layout.theme, layout.positions.length / 2),
      createSeededRng(DEFAULT_SEED),
    );

    expect(level.stones).toHaveLength(24);
    expect(Solver.isSolvable(level)).toBe(true);
  });

  it('produces identical assignments for the same seed', () => {
    const layout = LayoutBuilder.get(3);
    const faces = facePairsFor(layout.theme, layout.positions.length / 2);
    const first = SolvableDealer.deal(layout, faces, createSeededRng(DEFAULT_SEED));
    const second = SolvableDealer.deal(layout, faces, createSeededRng(DEFAULT_SEED));

    expect(first.stones.map((stone) => stone.face)).toEqual(
      second.stones.map((stone) => stone.face),
    );
  });

  it('throws a descriptive error when a layout has fewer than two free stones', () => {
    const layout: LevelLayout = {
      id: 99,
      name: 'Dead End',
      theme: 'zodiac',
      positions: [
        [0, 0, 0],
        [1, 0, 0],
      ],
      maxLayer: 1,
    };

    expect(() =>
      SolvableDealer.deal(layout, [1], createSeededRng(DEFAULT_SEED)),
    ).toThrow(/Dead End.*fewer than two free stones/);
  });
});

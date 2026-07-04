import { describe, expect, it } from 'vitest';
import { BoardModel } from '../engine/BoardModel';
import { Solver } from '../engine/Solver';
import type { Level } from '../engine/types';

function makeLevel(stones: Array<{ z: number; x: number; y: number; face: number }>): Level {
  return {
    id: 1,
    name: 'Test',
    stones,
    theme: 'zodiac',
    maxLayer: Math.max(0, ...stones.map((s) => s.z)),
  };
}

describe('BoardModel', () => {
  it('reports a single stone as free', () => {
    const board = new BoardModel(makeLevel([{ z: 0, x: 0, y: 0, face: 1 }]));
    const stones = board.getStones();
    expect(board.isFree(stones[0])).toBe(true);
    expect(board.getFree().length).toBe(1);
  });

  it('detects win when all stones are picked', () => {
    const board = new BoardModel(makeLevel([
      { z: 0, x: 0, y: 0, face: 1 },
      { z: 0, x: 2, y: 0, face: 1 },
    ]));
    const stones = board.getStones();
    board.pick(stones[0]);
    board.pick(stones[1]);
    expect(board.hasWon()).toBe(true);
    expect(board.getRemaining().length).toBe(0);
  });

  it('reports center stones blocked when both left and right neighbors exist', () => {
    const board = new BoardModel(makeLevel([
      { z: 0, x: -2, y: 0, face: 1 },
      { z: 0, x: 0, y: 0, face: 2 },
      { z: 0, x: 2, y: 0, face: 1 },
      { z: 0, x: 4, y: 0, face: 2 },
    ]));
    const stones = board.getStones();
    const centerLeft = stones.find((s) => s.x === 0)!;
    const centerRight = stones.find((s) => s.x === 2)!;
    expect(board.isFree(centerLeft)).toBe(false);
    expect(board.isFree(centerRight)).toBe(false);
    // End tiles remain free.
    expect(board.getFree().length).toBe(2);
    expect(board.isDeadlocked()).toBe(false);
  });

  it('reports a stone covered from above as blocked', () => {
    const board = new BoardModel(makeLevel([
      { z: 0, x: 0, y: 0, face: 1 },
      { z: 1, x: 0, y: 0, face: 2 },
    ]));
    const [bottom, top] = board.getStones();
    expect(board.isFree(bottom)).toBe(false);
    expect(board.isFree(top)).toBe(true);
  });

  it('removes a covered stone from free list after pick exposes it', () => {
    const board = new BoardModel(makeLevel([
      { z: 0, x: 0, y: 0, face: 1 },
      { z: 1, x: 0, y: 0, face: 2 },
    ]));
    const [bottom, top] = board.getStones();
    board.pick(top);
    expect(board.isFree(bottom)).toBe(true);
  });

  it('Solver returns true for a trivial solvable pair', () => {
    const level = makeLevel([
      { z: 0, x: 0, y: 0, face: 1 },
      { z: 0, x: 2, y: 0, face: 1 },
    ]);
    expect(Solver.isSolvable(level)).toBe(true);
  });

  it('Solver returns false for a deadlocked single-tile layout', () => {
    const level = makeLevel([
      { z: 0, x: 0, y: 0, face: 1 },
      { z: 0, x: 2, y: 0, face: 2 },
      { z: 0, x: 4, y: 0, face: 3 },
      { z: 0, x: 6, y: 0, face: 4 },
    ]);
    expect(Solver.isSolvable(level)).toBe(false);
  });
});

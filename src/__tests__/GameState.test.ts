import { describe, expect, it } from 'vitest';
import { GameState } from '../engine/GameState';
import type { Level } from '../engine/types';

function openLevel(faces: number[]): Level {
  return {
    id: 1,
    name: 'Open test level',
    theme: 'zodiac',
    maxLayer: 0,
    stones: faces.map((face, index) => ({
      z: 0,
      x: 0,
      y: index * 2,
      face,
    })),
  };
}

describe('GameState terminal states', () => {
  it('does not mutate board or tray after a full-tray failure', () => {
    const game = new GameState(openLevel([1, 2, 3, 4, 5, 1, 2, 3, 4, 5]));
    const stones = game.getBoard().getStones();

    stones.slice(0, 4).forEach((stone) => {
      expect(game.tapStone(stone.id).ok).toBe(true);
    });

    const failed = game.tapStone(stones[4].id);
    const beforeRemaining = game.getBoard().getRemaining().length;
    const beforeTray = game.getTraySlots();

    const afterFailure = game.tapStone(stones[5].id);

    expect(failed.failed).toBe(true);
    expect(afterFailure.ok).toBe(false);
    expect(afterFailure.failed).toBe(true);
    expect(game.getBoard().getRemaining()).toHaveLength(beforeRemaining);
    expect(game.getTraySlots()).toEqual(beforeTray);
  });

  it('rejects extra taps after the board has been cleared', () => {
    const game = new GameState(openLevel([1, 1]));
    const [first, second] = game.getBoard().getStones();

    game.tapStone(first.id, 1000);
    const won = game.tapStone(second.id, 1200);
    const afterWin = game.tapStone(first.id, 1400);

    expect(won.won).toBe(true);
    expect(afterWin.ok).toBe(false);
    expect(afterWin.won).toBe(true);
    expect(game.getBoard().getRemaining()).toHaveLength(0);
    expect(game.getScore()).toBe(won.score);
  });
});

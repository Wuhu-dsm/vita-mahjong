import type { Level, Stone } from './types';
import { BoardModel } from './BoardModel';

export class Solver {
  /**
   * Deterministically verifies that a level can be cleared using the 4-slot tray.
   */
  static isSolvable(level: Level): boolean {
    const board = new BoardModel(level);
    const tray: Stone[] = [];

    while (!board.hasWon()) {
      const free = board.getFree();
      if (free.length === 0) return false;

      // Deterministic choice for test stability.
      const next = free.sort(
        (a, b) => a.z - b.z || a.y - b.y || a.x - b.x
      )[0];

      const matchIndex = tray.findIndex((s) => s.face === next.face);
      if (matchIndex !== -1) {
        tray.splice(matchIndex, 1);
      } else {
        tray.push(next);
      }

      // Four unmatched tiles in the tray is an immediate failure.
      if (tray.length === 4) return false;

      board.pick(next);
    }

    return true;
  }
}

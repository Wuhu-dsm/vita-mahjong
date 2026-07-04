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

      // Deterministic choice for test stability. If the tray already contains
      // a matching face, prefer clearing that pair before adding a new face.
      const sortedFree = free.sort(
        (a, b) => a.z - b.z || a.y - b.y || a.x - b.x
      );
      const next =
        sortedFree.find((stone) => tray.some((trayStone) => trayStone.face === stone.face)) ??
        sortedFree[0];

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

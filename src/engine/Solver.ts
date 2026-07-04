import type { Level, Stone } from './types';
import { buildNeighbors, isBlocked } from './isBlocked';

const MAX_VISITED_STATES = 250_000;

function createStones(level: Level): Stone[] {
  return level.stones.map((s, index) => ({
    id: `${s.z}-${s.x}-${s.y}-${index}`,
    z: s.z,
    x: s.x,
    y: s.y,
    face: s.face,
    picked: false,
    top: [],
    left: [],
    right: [],
  }));
}

function stoneOrder(a: Stone, b: Stone): number {
  return a.z - b.z || a.y - b.y || a.x - b.x;
}

function isFree(stone: Stone): boolean {
  return !stone.picked && !isBlocked(stone);
}

function stateKey(stones: Stone[], tray: number[]): string {
  const picked = stones.map((stone) => (stone.picked ? '1' : '0')).join('');
  const trayFaces = [...tray].sort((a, b) => a - b).join(',');

  return `${picked}|${trayFaces}`;
}

export class Solver {
  /**
   * Finds the first matching free pair for the hint feature.
   * Simple O(n²) scan — returns the first pair found, not the optimal one.
   */
  static findHintPair(stones: Stone[]): [string, string] | null {
    const free = stones.filter((s) => isFree(s));
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (free[i].face === free[j].face) {
          return [free[i].id, free[j].id];
        }
      }
    }
    return null;
  }

  /**
   * Verifies that a level can be cleared using the 4-slot tray.
   */
  static isSolvable(level: Level): boolean {
    const stones = createStones(level);
    const tray: number[] = [];
    const failedStates = new Set<string>();
    let visitedStates = 0;

    buildNeighbors(stones);

    function search(pickedCount: number): boolean {
      if (pickedCount === stones.length) return true;
      if (visitedStates > MAX_VISITED_STATES) return false;

      const key = stateKey(stones, tray);
      if (failedStates.has(key)) return false;

      visitedStates += 1;
      const free = stones
        .filter((stone) => !stone.picked && !isBlocked(stone))
        .sort(stoneOrder);
      if (free.length === 0) {
        failedStates.add(key);
        return false;
      }

      const matchingMoves = free.filter((stone) => tray.includes(stone.face));
      if (matchingMoves.length === 0 && tray.length === 3) {
        failedStates.add(key);
        return false;
      }

      const moves = matchingMoves.length > 0 ? matchingMoves : free;
      for (const next of moves) {
        const matchIndex = tray.indexOf(next.face);
        next.picked = true;

        if (matchIndex !== -1) {
          const [matchedFace] = tray.splice(matchIndex, 1);
          if (search(pickedCount + 1)) return true;
          tray.splice(matchIndex, 0, matchedFace);
        } else {
          tray.push(next.face);
          if (tray.length < 4 && search(pickedCount + 1)) return true;
          tray.pop();
        }

        next.picked = false;
      }

      failedStates.add(key);
      return false;
    }

    return search(0);
  }
}

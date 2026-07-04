import type { Stone } from './types';

export function hasUnpicked(stones: Stone[]): boolean {
  return stones.some((s) => !s.picked);
}

export function isBlocked(stone: Stone): boolean {
  return (
    hasUnpicked(stone.top) ||
    (hasUnpicked(stone.left) && hasUnpicked(stone.right))
  );
}

export function overlaps(a: Stone, b: Stone): boolean {
  // Footprint spans x to x+1 and y to y+1.
  return (
    a.x < b.x + 1 &&
    a.x + 1 > b.x &&
    a.y < b.y + 1 &&
    a.y + 1 > b.y
  );
}

export function buildNeighbors(stones: Stone[]): void {
  for (const s of stones) {
    s.top = [];
    s.left = [];
    s.right = [];
  }

  for (const s of stones) {
    for (const other of stones) {
      if (s === other || other.picked) continue;

      if (other.z === s.z + 1 && overlaps(other, s)) {
        s.top.push(other);
      }
      if (other.z === s.z && other.y === s.y) {
        if (other.x === s.x - 2) {
          s.left.push(other);
        } else if (other.x === s.x + 2) {
          s.right.push(other);
        }
      }
    }
  }
}

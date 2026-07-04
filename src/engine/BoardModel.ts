import type { Level, Stone } from './types';
import { buildNeighbors, isBlocked } from './isBlocked';

export class BoardModel {
  private stones: Stone[];
  private remaining: Set<Stone>;

  constructor(level: Level) {
    this.stones = level.stones.map((s, index) => ({
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
    buildNeighbors(this.stones);
    this.remaining = new Set(this.stones);
  }

  getStones(): Stone[] {
    return this.stones;
  }

  isFree(stone: Stone): boolean {
    return !stone.picked && !isBlocked(stone);
  }

  pick(stone: Stone): void {
    if (stone.picked) return;
    stone.picked = true;
    this.remaining.delete(stone);
    // Rebuild neighbor lists so covered stones may become free.
    buildNeighbors(this.stones);
  }

  getRemaining(): Stone[] {
    return Array.from(this.remaining);
  }

  getFree(): Stone[] {
    return this.stones.filter((s) => this.isFree(s));
  }

  hasWon(): boolean {
    return this.remaining.size === 0;
  }

  isDeadlocked(): boolean {
    return !this.hasWon() && this.getFree().length === 0;
  }
}

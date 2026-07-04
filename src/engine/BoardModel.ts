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

  /** Restore a stone back to the board (used for undo). */
  restore(stone: Stone): void {
    if (!stone.picked) return;
    stone.picked = false;
    this.remaining.add(stone);
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

  /** Fisher-Yates shuffle on remaining stone positions, then rebuild neighbors. */
  shuffle(): void {
    const remaining = this.getRemaining();
    if (remaining.length <= 1) return;

    const positions = remaining.map((s) => ({ x: s.x, y: s.y, z: s.z }));
    // Fisher-Yates
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].x = positions[i].x;
      remaining[i].y = positions[i].y;
      remaining[i].z = positions[i].z;
    }
    buildNeighbors(this.stones);
  }
}

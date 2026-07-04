import type { Stone } from './types';

export interface TrayAddResult {
  accepted: boolean;
  matched: boolean;
  removed: Stone[];
  full: boolean;
}

export class TrayModel {
  private readonly slots: Array<Stone | null>;

  constructor() {
    this.slots = Array.from({ length: 4 }, () => null);
  }

  add(stone: Stone): TrayAddResult {
    const matchIndex = this.slots.findIndex((slot) => slot?.face === stone.face);

    if (matchIndex !== -1) {
      const partner = this.slots[matchIndex];
      this.slots[matchIndex] = null;

      return {
        accepted: true,
        matched: true,
        removed: partner ? [partner, stone] : [stone],
        full: this.isFull(),
      };
    }

    const emptyIndex = this.slots.findIndex((slot) => slot === null);
    if (emptyIndex === -1) {
      return {
        accepted: false,
        matched: false,
        removed: [],
        full: true,
      };
    }

    this.slots[emptyIndex] = stone;

    return {
      accepted: true,
      matched: false,
      removed: [],
      full: this.isFull(),
    };
  }

  canAccept(stone: Stone): boolean {
    return this.slots.some((slot) => slot === null || slot.face === stone.face);
  }

  peek(): Array<Stone | null> {
    return [...this.slots];
  }

  isFull(): boolean {
    return this.slots.every((slot) => slot !== null);
  }

  clearSlot(index: number): void {
    if (index >= 0 && index < this.slots.length) {
      this.slots[index] = null;
    }
  }

  /** Restore a stone back to a specific slot (used for undo). */
  restoreAt(index: number, stone: Stone): void {
    if (index >= 0 && index < this.slots.length) {
      this.slots[index] = stone;
    }
  }
}

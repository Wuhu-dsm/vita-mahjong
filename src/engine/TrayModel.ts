import type { Stone } from './types';

export interface TrayAddResult {
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
        matched: true,
        removed: partner ? [partner, stone] : [stone],
        full: this.isFull(),
      };
    }

    const emptyIndex = this.slots.findIndex((slot) => slot === null);
    if (emptyIndex !== -1) {
      this.slots[emptyIndex] = stone;
    }

    return {
      matched: false,
      removed: [],
      full: this.isFull(),
    };
  }

  peek(): Array<Stone | null> {
    return [...this.slots];
  }

  isFull(): boolean {
    return this.slots.every((slot) => slot !== null);
  }
}

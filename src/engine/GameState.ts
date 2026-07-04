export function matchScore(combo: number): number {
  return 100 * (1 + Math.min(combo - 1, 9) * 0.2);
}

export class ComboTracker {
  private combo = 0;
  private lastMatchAt: number | null = null;

  constructor(private readonly comboWindowMs = 3000) {}

  onMatch(timestamp = Date.now()): number {
    if (this.lastMatchAt === null || timestamp - this.lastMatchAt > this.comboWindowMs) {
      this.combo = 1;
    } else {
      this.combo += 1;
    }

    this.lastMatchAt = timestamp;
    return this.combo;
  }

  onBlockedTap(): void {
    this.combo = 0;
    this.lastMatchAt = null;
  }

  getCombo(): number {
    return this.combo;
  }
}

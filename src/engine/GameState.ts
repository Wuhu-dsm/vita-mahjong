import { BoardModel } from './BoardModel';
import { TrayModel } from './TrayModel';
import type { Level, Stone } from './types';

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
    this.reset();
  }

  getCombo(): number {
    return this.combo;
  }

  resetIfExpired(timestamp = Date.now()): void {
    if (this.lastMatchAt !== null && timestamp - this.lastMatchAt > this.comboWindowMs) {
      this.reset();
    }
  }

  reset(): void {
    this.combo = 0;
    this.lastMatchAt = null;
  }
}

export interface GameTapResult {
  ok: boolean;
  blocked: boolean;
  matched: boolean;
  removed: Stone[];
  full: boolean;
  won: boolean;
  deadlocked: boolean;
  failed: boolean;
  scoreAwarded: number;
  score: number;
  combo: number;
  maxCombo: number;
  stone: Stone | null;
  traySlots: Array<Stone | null>;
  remaining: number;
}

export interface GameStats {
  level: number;
  nextLevel: number;
  elapsedSeconds: number;
  score: number;
  combo: number;
}

export class GameState {
  private board: BoardModel;
  private tray = new TrayModel();
  private comboTracker = new ComboTracker();
  private score = 0;
  private maxCombo = 0;
  private startedAt = Date.now();

  constructor(private level: Level) {
    this.board = new BoardModel(level);
  }

  tapStone(stoneId: string, timestamp = Date.now()): GameTapResult {
    const stone = this.getStone(stoneId);
    this.comboTracker.resetIfExpired(timestamp);

    if (!stone || stone.picked || !this.board.isFree(stone)) {
      this.comboTracker.onBlockedTap();
      return this.result({
        ok: false,
        blocked: true,
        matched: false,
        removed: [],
        scoreAwarded: 0,
        stone,
      });
    }

    this.board.pick(stone);
    const trayResult = this.tray.add(stone);
    let scoreAwarded = 0;

    if (trayResult.matched) {
      const combo = this.comboTracker.onMatch(timestamp);
      this.maxCombo = Math.max(this.maxCombo, combo);
      scoreAwarded = matchScore(combo);
      this.score += scoreAwarded;
    }

    return this.result({
      ok: true,
      blocked: false,
      matched: trayResult.matched,
      removed: trayResult.removed,
      scoreAwarded,
      stone,
    });
  }

  getLevel(): Level {
    return this.level;
  }

  getBoard(): BoardModel {
    return this.board;
  }

  getStone(stoneId: string): Stone | null {
    return this.board.getStones().find((stone) => stone.id === stoneId) ?? null;
  }

  getTraySlots(): Array<Stone | null> {
    return this.tray.peek();
  }

  getScore(): number {
    return this.score;
  }

  getCombo(): number {
    this.comboTracker.resetIfExpired();
    return this.comboTracker.getCombo();
  }

  getMaxCombo(): number {
    return this.maxCombo;
  }

  getStats(): GameStats {
    return {
      level: this.level.id,
      nextLevel: Math.min(20, this.level.id + 1),
      elapsedSeconds: (Date.now() - this.startedAt) / 1000,
      score: this.score,
      combo: this.maxCombo,
    };
  }

  reset(level = this.level): void {
    this.level = level;
    this.board = new BoardModel(level);
    this.tray = new TrayModel();
    this.comboTracker = new ComboTracker();
    this.score = 0;
    this.maxCombo = 0;
    this.startedAt = Date.now();
  }

  private result(args: {
    ok: boolean;
    blocked: boolean;
    matched: boolean;
    removed: Stone[];
    scoreAwarded: number;
    stone: Stone | null;
  }): GameTapResult {
    const won = this.board.hasWon();
    const full = this.tray.isFull();
    const deadlocked = !won && this.board.isDeadlocked();
    return {
      ok: args.ok,
      blocked: args.blocked,
      matched: args.matched,
      removed: args.removed,
      full,
      won,
      deadlocked,
      failed: full || deadlocked,
      scoreAwarded: args.scoreAwarded,
      score: this.score,
      combo: this.comboTracker.getCombo(),
      maxCombo: this.maxCombo,
      stone: args.stone,
      traySlots: this.tray.peek(),
      remaining: this.board.getRemaining().length,
    };
  }
}

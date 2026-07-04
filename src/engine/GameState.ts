import { BoardModel } from './BoardModel';
import { TrayModel } from './TrayModel';
import { Solver } from './Solver';
import { buildNeighbors } from './isBlocked';
import type { Level, Stone } from './types';
import { config } from '../app/config';

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
  private terminal = false;
  private readonly actionHistory: Array<{ stoneIds: [string, string]; face: number; trayIndices: [number, number] }> = [];
  private undoCount = config.assist.undoLimit;
  private hintCount = config.assist.hintLimit;
  private shuffleCount = config.assist.shuffleLimit;

  constructor(private level: Level) {
    this.board = new BoardModel(level);
  }

  tapStone(stoneId: string, timestamp = Date.now()): GameTapResult {
    const stone = this.getStone(stoneId);
    this.comboTracker.resetIfExpired(timestamp);

    if (this.terminal || !stone || stone.picked || !this.board.isFree(stone) || !this.tray.canAccept(stone)) {
      if (!this.terminal) {
        this.comboTracker.onBlockedTap();
      }
      return this.result({
        ok: false,
        blocked: !this.terminal,
        matched: false,
        removed: [],
        scoreAwarded: 0,
        stone,
      });
    }

    this.board.pick(stone);
    const preTray = this.tray.peek();
    const trayResult = this.tray.add(stone);
    if (!trayResult.accepted) {
      return this.result({
        ok: false,
        blocked: false,
        matched: false,
        removed: [],
        scoreAwarded: 0,
        stone,
      });
    }

    let scoreAwarded = 0;

    if (trayResult.matched) {
      const combo = this.comboTracker.onMatch(timestamp);
      this.maxCombo = Math.max(this.maxCombo, combo);
      scoreAwarded = matchScore(combo);
      this.score += scoreAwarded;

      // Record undo entry (partner was in tray, incoming stone was on board)
      const partnerIndex = preTray.findIndex((s) => s !== null && s.face === stone.face);
      const partner = partnerIndex !== -1 ? preTray[partnerIndex] : null;
      if (partner) {
        this.actionHistory.push({
          stoneIds: [partner.id, stone.id],
          face: stone.face,
          trayIndices: [partnerIndex, -1],
        });
        if (this.actionHistory.length > this.undoCount) {
          this.actionHistory.shift(); // FIFO — keep only last N
        }
      }
    }

    const result = this.result({
      ok: true,
      blocked: false,
      matched: trayResult.matched,
      removed: trayResult.removed,
      scoreAwarded,
      stone,
    });
    this.terminal = result.failed || result.won;
    return result;
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

  isTerminal(): boolean {
    return this.terminal;
  }

  undo(): boolean {
    const currentSlots = this.tray.peek();
    const hasUnmatched = currentSlots.some((s) => s !== null);

    if (hasUnmatched) {
      for (let i = 0; i < currentSlots.length; i++) {
        if (currentSlots[i] !== null) {
          this.board.restore(currentSlots[i]!);
          this.tray.clearSlot(i);
        }
      }
      buildNeighbors(this.board.getStones());
    }

    if (this.undoCount <= 0 || this.actionHistory.length === 0) return hasUnmatched;

    const entry = this.actionHistory.pop()!;
    const partner = this.getStone(entry.stoneIds[0]);
    const incoming = this.getStone(entry.stoneIds[1]);
    if (!partner || !incoming) return hasUnmatched;

    // Incoming stone was on board → restore to board only
    this.board.restore(incoming);
    // Partner was in tray → restore to tray only (NOT board)
    this.tray.restoreAt(entry.trayIndices[0], partner);
    buildNeighbors(this.board.getStones());

    this.undoCount--;
    return true;
  }

  hint(): { stoneId: string; partnerId: string } | null {
    if (this.hintCount <= 0) return null;
    const pair = Solver.findHintPair(this.board.getStones());
    if (!pair) return null; // deadlocked — do not consume
    this.hintCount--;
    return { stoneId: pair[0], partnerId: pair[1] };
  }

  shuffle(): boolean {
    if (this.shuffleCount <= 0) return false;
    this.board.shuffle();
    this.shuffleCount--;
    return true;
  }

  getUndoCount(): number { return this.undoCount; }
  getHintCount(): number { return this.hintCount; }
  getShuffleCount(): number { return this.shuffleCount; }

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
    this.terminal = false;
    this.actionHistory.length = 0;
    this.undoCount = config.assist.undoLimit;
    this.hintCount = config.assist.hintLimit;
    this.shuffleCount = config.assist.shuffleLimit;
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

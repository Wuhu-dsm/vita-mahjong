import { Assets, Container, Sprite, Texture, type Ticker } from 'pixi.js';
import { loadAssets } from '../../app/assets';
import { config } from '../../app/config';
import { GameState, type GameStats, type GameTapResult } from '../../engine/GameState';
import type { Level, Stone } from '../../engine/types';
import { validatePlayableLevel } from '../../engine/validateLevel';
import { AudioManager } from '../../audio/AudioManager';
import { BlockedHint } from '../components/BlockedHint';
import { AssistBar } from '../components/AssistBar';
import { ComboFeedback } from '../components/ComboFeedback';
import { FailurePopup } from '../components/FailurePopup';
import { HUD } from '../components/HUD';
import { TILE_TAPPED, TileSprite } from '../components/TileSprite';
import { Tray } from '../components/Tray';
import { ScoreFloater } from '../effects/ScoreFloater';
import { TilePool } from '../pools/TilePool';

export interface GameScreenOptions {
  ticker?: Ticker;
  onBack?: () => void;
}

interface Animation {
  elapsedMs: number;
  durationMs: number;
  update: (progress: number) => void;
  complete: () => void;
}

export interface BlockedFeedbackTarget {
  setBlocked(enabled: boolean): void;
}

export class BlockedFeedbackLifecycle<T extends BlockedFeedbackTarget = BlockedFeedbackTarget> {
  private current: T | null = null;
  private expiresAt = 0;

  show(target: T, now: number, durationMs: number): void {
    this.clear();
    this.current = target;
    this.expiresAt = now + durationMs;
    target.setBlocked(true);
  }

  update(now: number): void {
    if (this.current && now >= this.expiresAt) {
      this.clear();
    }
  }

  clear(): void {
    if (!this.current) return;
    this.current.setBlocked(false);
    this.current = null;
    this.expiresAt = 0;
  }
}

function requireTexture(key: 'bg_game'): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) {
    throw new Error(`Texture "${key}" has not been loaded`);
  }
  return texture;
}

export class GameScreen extends Container {
  static readonly TILE_TAPPED = 'game-tile-tapped';
  static readonly BLOCKED_TILE = 'game-blocked-tile';
  static readonly WIN = 'game-win';

  private readonly background: Sprite;
  private readonly hud: HUD;
  private readonly tray: Tray;
  private readonly boardLayer = new Container();
  private readonly blockedHint: BlockedHint;
  private readonly comboFeedback: ComboFeedback;
  private readonly failurePopup: FailurePopup;
  private readonly scoreFloater: ScoreFloater;
  private readonly tilePool = new TilePool();
  private readonly tileByStoneId = new Map<string, TileSprite>();
  private readonly animations: Animation[] = [];
  private readonly blockedFeedback = new BlockedFeedbackLifecycle<TileSprite>();
  private readonly assistBar: AssistBar;
  private hintTiles: TileSprite[] | null = null;
  private readonly ticker?: Ticker;
  private state: GameState | null = null;
  private level: Level | null = null;
  private inputLocked = false;
  private startedAt = 0;
  private readonly tick = (ticker: Ticker): void => {
    const now = performance.now();
    this.blockedFeedback.update(now);
    this.blockedHint.update(now);
    this.comboFeedback.update(ticker);
    this.scoreFloater.update(ticker);
    this.updateAnimations(ticker);

    if (this.state && !this.state.isTerminal()) {
      const elapsedMs = Date.now() - this.startedAt;
      this.hud.update(this.state.getLevel().id, this.state.getScore(), this.state.getCombo(), elapsedMs);
    }
  };

  constructor(options: GameScreenOptions = {}) {
    super();
    this.ticker = options.ticker;

    this.background = new Sprite(requireTexture('bg_game'));
    this.background.width = config.designWidth;
    this.background.height = config.designHeight;
    this.addChild(this.background);

    this.hud = new HUD(options.onBack);
    this.tray = new Tray();
    this.boardLayer.sortableChildren = true;
    this.comboFeedback = new ComboFeedback();
    this.failurePopup = new FailurePopup();
    this.scoreFloater = new ScoreFloater();

    this.addChild(this.hud, this.tray, this.boardLayer, this.comboFeedback, this.scoreFloater, this.failurePopup);

    this.blockedHint = new BlockedHint();
    this.boardLayer.addChild(this.blockedHint);

    this.failurePopup.on(FailurePopup.RESTART, () => {
      if (this.level) {
        this.startLevel(this.level.id).catch((error: unknown) => {
          console.error('Failed to restart level:', error);
        });
      }
    });

    this.assistBar = new AssistBar(
      () => this.handleUndo(),
      () => this.handleHint(),
      () => this.handleShuffle(),
    );
    this.assistBar.position.set(config.designWidth / 2, config.designHeight - 176);
    this.addChild(this.assistBar);

    this.ticker?.add(this.tick);
  }

  static async create(options: GameScreenOptions = {}): Promise<GameScreen> {
    await loadAssets(['game', 'result', 'ui', 'fonts']);
    return new GameScreen(options);
  }

  async startLevel(levelNumber: number): Promise<void> {
    const level = await this.loadLevel(levelNumber);
    this.loadLevelModel(level);
    this.startedAt = Date.now();
  }

  loadLevelModel(level: Level): void {
    this.clearBlockedFeedback();
    this.clearHintHighlights();
    this.level = this.validateLevel(level);
    this.state = new GameState(this.level);
    this.failurePopup.hide();
    this.inputLocked = false;
    this.tray.clear();
    this.updateHud();
    this.renderBoard();
    this.assistBar.updateCounts(
      this.state.getUndoCount(),
      this.state.getHintCount(),
      this.state.getShuffleCount(),
    );
  }

  getActiveTileCount(): number {
    return this.tilePool.getActiveCount();
  }

  private async loadLevel(levelNumber: number): Promise<Level> {
    const response = await fetch(`levels/${levelNumber}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load level ${levelNumber}: ${response.status}`);
    }
    return this.validateLevel(await response.json());
  }

  private renderBoard(): void {
    if (!this.state || !this.level) return;

    this.clearBlockedFeedback();
    this.tilePool.freeAll();
    this.tileByStoneId.clear();

    const stones = this.state.getBoard().getRemaining();
    if (stones.length === 0) return;
    const positions = stones.map((stone) => this.toBoardPosition(stone));
    const bounds = this.calculateBounds(positions);
    const boardScale = Math.min(
      1,
      (config.designWidth * 0.92) / Math.max(1, bounds.width),
      (config.designHeight * 0.52) / Math.max(1, bounds.height),
    );

    this.boardLayer.position.set(
      config.designWidth / 2 - ((bounds.minX + bounds.maxX) / 2) * boardScale,
      config.designHeight * 0.56 - ((bounds.minY + bounds.maxY) / 2) * boardScale,
    );
    this.boardLayer.scale.set(boardScale);

    stones.forEach((stone) => {
      const tile = this.tilePool.obtain(stone, this.level!.theme, this.boardLayer);
      const position = this.toBoardPosition(stone);
      tile.position.set(position.x, position.y);
      tile.zIndex = stone.z * 10_000 + stone.y * 100 + stone.x;
      tile.on(TILE_TAPPED, this.handleTileTap);
      this.tileByStoneId.set(stone.id, tile);
    });

    this.boardLayer.sortChildren();
    this.boardLayer.addChild(this.blockedHint);
  }

  private readonly handleTileTap = (stoneId: string): void => {
    if (!this.state || this.inputLocked) return;
    const tile = this.tileByStoneId.get(stoneId);
    if (!tile) return;

    const previousSlots = this.state.getTraySlots();
    const targetSlotIndex = this.findTargetSlotIndex(stoneId, previousSlots);
    const result = this.state.tapStone(stoneId);
    this.updateHud();

    if (!result.ok || result.blocked || !result.stone) {
      const now = performance.now();
      const hintPosition = this.getBlockedHintPosition(tile);
      this.blockedFeedback.show(tile, now, config.timings.blockedFeedbackMs);
      this.blockedHint.showAt(hintPosition.x, hintPosition.y, now);
      this.emit(GameScreen.BLOCKED_TILE, result.stone);
      return;
    }

    this.inputLocked = true;
    this.clearBlockedFeedback();
    this.clearHintHighlights();
    this.tileByStoneId.forEach((candidate) => candidate.highlight(false));
    tile.highlight(true);
    AudioManager.getInstance().playSfx('tap');
    this.emit(GameScreen.TILE_TAPPED, result.stone);
    this.animateTileToTray(tile, targetSlotIndex, result);
  };

  private clearBlockedFeedback(): void {
    this.blockedFeedback.clear();
    this.blockedHint.hide();
  }

  private getBlockedHintPosition(tile: TileSprite): { x: number; y: number } {
    const boardScale = this.boardLayer.scale.x || 1;
    const rawCanvasX = this.boardLayer.x + tile.x * boardScale;
    const rawCanvasY = this.boardLayer.y + (tile.y - config.tile.height * 0.72) * boardScale;
    const hintHalfWidth = 128;
    const hintHalfHeight = 42;
    const trayBottom = config.designHeight * 0.14 + config.tray.height / 2;
    const minCanvasX = hintHalfWidth;
    const maxCanvasX = config.designWidth - hintHalfWidth;
    const minCanvasY = Math.max(
      config.safeAreaTop + config.hud.height + hintHalfHeight,
      trayBottom + hintHalfHeight + 20,
    );
    const maxCanvasY = config.designHeight - config.safeAreaBottom - hintHalfHeight;
    const clampedCanvasX = this.clamp(rawCanvasX, minCanvasX, maxCanvasX);
    const clampedCanvasY = this.clamp(rawCanvasY, minCanvasY, maxCanvasY);

    return {
      x: (clampedCanvasX - this.boardLayer.x) / boardScale,
      y: (clampedCanvasY - this.boardLayer.y) / boardScale,
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private animateTileToTray(tile: TileSprite, targetSlotIndex: number, result: GameTapResult): void {
    const target = this.tray.getSlotCenter(targetSlotIndex);
    const targetLocal = {
      x: (target.x - this.boardLayer.x) / this.boardLayer.scale.x,
      y: (target.y - this.boardLayer.y) / this.boardLayer.scale.y,
    };
    const startX = tile.x;
    const startY = tile.y;
    const startScale = tile.scale.x;
    const endScale = 0.48 / this.boardLayer.scale.x;
    tile.zIndex = 999_999;
    this.boardLayer.sortChildren();

    if (!this.ticker) {
      tile.position.set(targetLocal.x, targetLocal.y);
      tile.scale.set(endScale);
      this.tilePool.free(tile);
      this.finishTapResult(result, targetSlotIndex);
      return;
    }

    this.animations.push({
      elapsedMs: 0,
      durationMs: config.timings.tileFlightMs,
      update: (progress) => {
        const eased = this.easeOutBack(progress);
        tile.position.set(
          startX + (targetLocal.x - startX) * eased,
          startY + (targetLocal.y - startY) * eased,
        );
        tile.scale.set(startScale + (endScale - startScale) * Math.min(1, progress));
        tile.alpha = 1 - progress * 0.12;
      },
      complete: () => {
        this.tilePool.free(tile);
        this.finishTapResult(result, targetSlotIndex);
      },
    });
  }

  private finishTapResult(result: GameTapResult, targetSlotIndex: number): void {
    if (!this.state || !this.level) return;

    const finalize = (): void => {
      if (!this.state || !this.level) return;
      this.tray.setSlots(result.traySlots, this.level.theme);
      this.renderBoard();
      this.updateHud();
      this.inputLocked = result.failed || result.won;

      if (result.scoreAwarded > 0) {
        const scoreAnchor = this.hud.getScoreAnchor();
        this.scoreFloater.show(result.scoreAwarded, scoreAnchor.x, scoreAnchor.y);
        AudioManager.getInstance().playSfx('match');
      }
      if (result.combo >= 2) {
        this.comboFeedback.show(result.combo);
        AudioManager.getInstance().playSfx('combo');
      }
      if (result.won) {
        const stats = this.state!.getStats();
        stats.elapsedSeconds = Math.floor((Date.now() - this.startedAt) / 1000);
        this.emit(GameScreen.WIN, stats satisfies GameStats);
      } else if (result.failed) {
        this.failurePopup.show();
        AudioManager.getInstance().playSfx('fail');
      }
    };

    if (result.matched && result.removed.length >= 2) {
      this.tray.playMatchRemoval(result.removed, targetSlotIndex, this.level.theme, this.ticker, finalize);
      return;
    }

    finalize();
  }

  private updateAnimations(ticker: Ticker): void {
    for (let index = this.animations.length - 1; index >= 0; index -= 1) {
      const animation = this.animations[index];
      animation.elapsedMs += ticker.deltaMS;
      const progress = Math.min(animation.elapsedMs / animation.durationMs, 1);
      animation.update(progress);
      if (progress >= 1) {
        this.animations.splice(index, 1);
        animation.complete();
      }
    }
  }

  private handleUndo(): void {
    if (!this.state || !this.level || this.inputLocked) return;
    AudioManager.getInstance().playSfx('click');
    this.clearHintHighlights();
    if (!this.state.undo()) return;
    this.renderBoard();
    this.tray.setSlots(this.state.getTraySlots(), this.level.theme);
    this.assistBar.updateCounts(
      this.state.getUndoCount(),
      this.state.getHintCount(),
      this.state.getShuffleCount(),
    );
  }

  private handleHint(): void {
    if (!this.state || this.inputLocked) return;
    AudioManager.getInstance().playSfx('click');
    const result = this.state.hint();
    if (!result) {
      // Hint not consumed — update counts without decrementing hint
      this.assistBar.updateCounts(
        this.state.getUndoCount(),
        this.state.getHintCount(),
        this.state.getShuffleCount(),
      );
      return;
    }

    const tile1 = this.tileByStoneId.get(result.stoneId);
    const tile2 = this.tileByStoneId.get(result.partnerId);
    if (!tile1 || !tile2) return;

    this.clearHintHighlights();
    this.hintTiles = [tile1, tile2];

    // Pulse animation: gold halo α 0.3→0.6→0.3, 2 cycles over 400ms
    this.animations.push({
      elapsedMs: 0,
      durationMs: 400,
      update: (progress) => {
        const alpha = 0.3 + 0.3 * Math.sin(progress * Math.PI * 4);
        tile1.setHintGlow(alpha);
        tile2.setHintGlow(alpha);
      },
      complete: () => {
        tile1.setHintGlow(0);
        tile2.setHintGlow(0);
        this.hintTiles = null;
      },
    });

    this.assistBar.updateCounts(
      this.state.getUndoCount(),
      this.state.getHintCount(),
      this.state.getShuffleCount(),
    );
  }

  private handleShuffle(): void {
    if (!this.state || !this.level || this.inputLocked) return;
    AudioManager.getInstance().playSfx('click');
    this.clearHintHighlights();
    if (!this.state.shuffle()) return;
    this.renderBoard();
    this.tray.setSlots(this.state.getTraySlots(), this.level.theme);
    this.assistBar.updateCounts(
      this.state.getUndoCount(),
      this.state.getHintCount(),
      this.state.getShuffleCount(),
    );
  }

  private clearHintHighlights(): void {
    if (this.hintTiles) {
      for (const tile of this.hintTiles) {
        tile.setHintGlow(0);
      }
      this.hintTiles = null;
    }
  }

  private updateHud(): void {
    if (!this.state || !this.level) {
      this.hud.update(1, 0, 0);
      return;
    }
    this.hud.update(this.level.id, this.state.getScore(), this.state.getCombo());
  }

  private findTargetSlotIndex(stoneId: string, slots: Array<Stone | null>): number {
    const stone = this.state?.getStone(stoneId);
    if (!stone) return this.tray.findFirstEmptySlot(slots);
    const matchIndex = slots.findIndex((slot) => slot?.face === stone.face);
    return matchIndex === -1 ? this.tray.findFirstEmptySlot(slots) : matchIndex;
  }

  private easeOutBack(progress: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
  }

  private toBoardPosition(stone: Stone): { x: number; y: number } {
    const gridX = 113.5;
    const gridY = 120;
    const layerOffset = 28;
    return {
      x: stone.x * gridX + stone.z * layerOffset,
      y: stone.y * gridY - stone.z * layerOffset,
    };
  }

  private calculateBounds(positions: Array<{ x: number; y: number }>): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  } {
    const halfWidth = config.tile.width / 2;
    const halfHeight = config.tile.height / 2 + 24;
    const minX = Math.min(...positions.map((p) => p.x - halfWidth));
    const maxX = Math.max(...positions.map((p) => p.x + halfWidth));
    const minY = Math.min(...positions.map((p) => p.y - halfHeight));
    const maxY = Math.max(...positions.map((p) => p.y + halfHeight));
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  }

  private validateLevel(value: unknown): Level {
    return validatePlayableLevel(value);
  }
}

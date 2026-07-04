import { Assets, Container, Sprite, Texture, type Ticker } from 'pixi.js';
import { loadAssets } from '../../app/assets';
import { config } from '../../app/config';
import { GameState, type GameStats, type GameTapResult } from '../../engine/GameState';
import type { Level, Stone, ThemeId } from '../../engine/types';
import { BlockedHint } from '../components/BlockedHint';
import { ComboFeedback } from '../components/ComboFeedback';
import { FailurePopup } from '../components/FailurePopup';
import { HUD } from '../components/HUD';
import { TILE_TAPPED, TileSprite } from '../components/TileSprite';
import { Tray } from '../components/Tray';
import { ScoreFloater } from '../effects/ScoreFloater';
import { TilePool } from '../pools/TilePool';

const VALID_THEMES: readonly ThemeId[] = [
  'zodiac',
  'traditional',
  'animals',
  'oriental',
  'seasons',
  'myth',
];

export interface GameScreenOptions {
  ticker?: Ticker;
}

interface Animation {
  elapsedMs: number;
  durationMs: number;
  update: (progress: number) => void;
  complete: () => void;
}

function requireTexture(key: 'bg_game'): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) {
    throw new Error(`Texture "${key}" has not been loaded`);
  }
  return texture;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTheme(value: unknown): value is ThemeId {
  return typeof value === 'string' && VALID_THEMES.includes(value as ThemeId);
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
  private readonly ticker?: Ticker;
  private state: GameState | null = null;
  private level: Level | null = null;
  private inputLocked = false;
  private readonly tick = (ticker: Ticker): void => {
    this.blockedHint.update();
    this.comboFeedback.update(ticker);
    this.scoreFloater.update(ticker);
    this.updateAnimations(ticker);
  };

  constructor(options: GameScreenOptions = {}) {
    super();
    this.ticker = options.ticker;

    this.background = new Sprite(requireTexture('bg_game'));
    this.background.width = config.designWidth;
    this.background.height = config.designHeight;
    this.addChild(this.background);

    this.hud = new HUD();
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

    this.ticker?.add(this.tick);
  }

  static async create(options: GameScreenOptions = {}): Promise<GameScreen> {
    await loadAssets(['game', 'result', 'ui', 'fonts']);
    return new GameScreen(options);
  }

  async startLevel(levelNumber: number): Promise<void> {
    const level = await this.loadLevel(levelNumber);
    this.loadLevelModel(level);
  }

  loadLevelModel(level: Level): void {
    this.level = this.validateLevel(level);
    this.state = new GameState(this.level);
    this.failurePopup.hide();
    this.inputLocked = false;
    this.tray.clear();
    this.updateHud();
    this.renderBoard();
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
      tile.setBlocked(true);
      this.blockedHint.showAt(tile.x, tile.y - config.tile.height * 0.85);
      this.emit(GameScreen.BLOCKED_TILE, result.stone);
      return;
    }

    this.inputLocked = true;
    this.tileByStoneId.forEach((candidate) => candidate.highlight(false));
    tile.setBlocked(false);
    tile.highlight(true);
    this.emit(GameScreen.TILE_TAPPED, result.stone);
    this.animateTileToTray(tile, targetSlotIndex, result);
  };

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
      }
      if (result.combo >= 2) {
        this.comboFeedback.show(result.combo);
      }
      if (result.won) {
        this.emit(GameScreen.WIN, this.state.getStats() satisfies GameStats);
      } else if (result.failed) {
        this.failurePopup.show();
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
    const gridX = 64;
    const gridY = 78;
    const layerOffset = 18;
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
    if (!isRecord(value)) {
      throw new Error('Malformed level: expected object');
    }

    const stones = value.stones;
    if (
      typeof value.id !== 'number' ||
      typeof value.name !== 'string' ||
      !isTheme(value.theme) ||
      typeof value.maxLayer !== 'number' ||
      !Array.isArray(stones)
    ) {
      throw new Error('Malformed level: invalid top-level fields');
    }

    if (value.maxLayer > 7) {
      throw new Error(`Malformed level ${value.id}: maxLayer exceeds 7`);
    }

    if (stones.length > 128) {
      throw new Error(`Malformed level ${value.id}: too many stones`);
    }

    const faceCounts = new Map<number, number>();
    const parsedStones = stones.map((stone, index) => {
      if (!isRecord(stone)) {
        throw new Error(`Malformed level ${value.id}: stone ${index} is not an object`);
      }

      const { z, x, y, face } = stone;
      if (
        !Number.isInteger(z) ||
        !Number.isInteger(x) ||
        !Number.isInteger(y) ||
        !Number.isInteger(face) ||
        z < 0 ||
        z > value.maxLayer ||
        face < 0
      ) {
        throw new Error(`Malformed level ${value.id}: invalid stone ${index}`);
      }

      faceCounts.set(face, (faceCounts.get(face) ?? 0) + 1);
      return { z, x, y, face };
    });

    const oddFace = Array.from(faceCounts.entries()).find(([, count]) => count % 2 !== 0);
    if (oddFace) {
      throw new Error(`Malformed level ${value.id}: odd face count for face ${oddFace[0]}`);
    }

    return Object.freeze({
      id: value.id,
      name: value.name,
      theme: value.theme,
      maxLayer: value.maxLayer,
      stones: parsedStones,
    });
  }
}

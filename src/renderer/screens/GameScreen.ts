import { Assets, Container, Sprite, Texture, type Ticker } from 'pixi.js';
import { loadAssets } from '../../app/assets';
import { config } from '../../app/config';
import { BoardModel } from '../../engine/BoardModel';
import type { Level, Stone, ThemeId } from '../../engine/types';
import { BlockedHint } from '../components/BlockedHint';
import { TILE_TAPPED, TileSprite } from '../components/TileSprite';
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
  ticker?: { add: (fn: (ticker: Ticker) => void) => void; remove: (fn: (ticker: Ticker) => void) => void };
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

  private readonly background: Sprite;
  private readonly boardLayer = new Container();
  private readonly blockedHint: BlockedHint;
  private readonly tilePool = new TilePool();
  private readonly tileByStoneId = new Map<string, TileSprite>();
  private board: BoardModel | null = null;
  private level: Level | null = null;
  private readonly tick = (): void => {
    this.blockedHint.update();
  };

  constructor(options: GameScreenOptions = {}) {
    super();

    this.background = new Sprite(requireTexture('bg_game'));
    this.background.width = config.designWidth;
    this.background.height = config.designHeight;
    this.addChild(this.background);

    this.boardLayer.sortableChildren = true;
    this.addChild(this.boardLayer);

    this.blockedHint = new BlockedHint();
    this.boardLayer.addChild(this.blockedHint);

    options.ticker?.add(this.tick);
  }

  static async create(options: GameScreenOptions = {}): Promise<GameScreen> {
    await loadAssets(['game', 'ui', 'fonts']);
    return new GameScreen(options);
  }

  async startLevel(levelNumber: number): Promise<void> {
    const level = await this.loadLevel(levelNumber);
    this.loadLevelModel(level);
  }

  loadLevelModel(level: Level): void {
    this.level = this.validateLevel(level);
    this.board = new BoardModel(this.level);
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
    if (!this.board || !this.level) return;

    this.tilePool.freeAll();
    this.tileByStoneId.clear();

    const stones = this.board.getRemaining();
    const positions = stones.map((stone) => this.toBoardPosition(stone));
    const bounds = this.calculateBounds(positions);
    const boardScale = Math.min(
      1,
      (config.designWidth * 0.92) / Math.max(1, bounds.width),
      (config.designHeight * 0.52) / Math.max(1, bounds.height),
    );

    this.boardLayer.position.set(
      config.designWidth / 2 - ((bounds.minX + bounds.maxX) / 2) * boardScale,
      config.designHeight * 0.55 - ((bounds.minY + bounds.maxY) / 2) * boardScale,
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
    if (!this.board) return;
    const stone = this.board.getStones().find((candidate) => candidate.id === stoneId);
    const tile = this.tileByStoneId.get(stoneId);
    if (!stone || !tile) return;

    if (!this.board.isFree(stone)) {
      tile.setBlocked(true);
      this.blockedHint.showAt(tile.x, tile.y - config.tile.height * 0.85);
      this.emit(GameScreen.BLOCKED_TILE, stone);
      return;
    }

    this.tileByStoneId.forEach((candidate) => candidate.highlight(false));
    tile.setBlocked(false);
    tile.highlight(true);
    this.emit(GameScreen.TILE_TAPPED, stone);
  };

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

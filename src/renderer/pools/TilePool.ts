import type { Container } from 'pixi.js';
import { TileSprite } from '../components/TileSprite';
import type { Stone, ThemeId } from '../../engine/types';

export const TILE_POOL_TRAY_NODE_ALLOWANCE = 4;
export const TILE_POOL_ACTIVE_TILE_BUDGET = 150;

export class TilePool {
  private readonly idle: TileSprite[] = [];
  private readonly active = new Set<TileSprite>();
  private allocated = 0;

  obtain(stone: Stone, theme: ThemeId, parent?: Container): TileSprite {
    let tile = this.idle.pop();

    if (!tile) {
      if (this.allocated >= TILE_POOL_ACTIVE_TILE_BUDGET) {
        throw new Error(`TilePool allocation budget exceeded: ${TILE_POOL_ACTIVE_TILE_BUDGET}`);
      }
      tile = new TileSprite();
      this.allocated += 1;
    }

    tile.setStone(stone, theme);
    this.active.add(tile);
    parent?.addChild(tile);
    return tile;
  }

  free(tile: TileSprite): void {
    if (!this.active.delete(tile)) return;
    tile.parent?.removeChild(tile);
    tile.resetForPool();
    this.idle.push(tile);
  }

  freeAll(): void {
    Array.from(this.active).forEach((tile) => this.free(tile));
  }

  getActiveCount(): number {
    return this.active.size;
  }

  getAllocatedCount(): number {
    return this.allocated;
  }
}

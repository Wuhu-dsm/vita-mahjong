import { Assets, Container, Sprite, type Ticker, Texture } from 'pixi.js';
import type { AssetKey } from '../../app/assets';
import { config } from '../../app/config';
import type { Stone, ThemeId } from '../../engine/types';
import { TileSprite } from './TileSprite';

export const TRAY_SLOT_COUNT = 4;

function requireTexture(key: AssetKey): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) {
    throw new Error(`Texture "${key}" has not been loaded`);
  }
  return texture;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export class Tray extends Container {
  private readonly slotTiles: Array<TileSprite | null> = Array.from({ length: TRAY_SLOT_COUNT }, () => null);
  private readonly slotX: number[] = [];

  constructor() {
    super();
    this.position.set(config.designWidth / 2, config.designHeight * 0.14);

    const totalWidth = TRAY_SLOT_COUNT * config.tray.slotSize + (TRAY_SLOT_COUNT - 1) * config.tray.gap + 48;

    const border = new Sprite(requireTexture('btn_circle_brown'));
    border.anchor.set(0.5);
    border.width = totalWidth + 16;
    border.height = config.tray.height + 22;
    border.tint = config.colors.trayBorder;
    border.alpha = 0.95;

    const background = new Sprite(requireTexture('btn_circle_brown'));
    background.anchor.set(0.5);
    background.width = totalWidth;
    background.height = config.tray.height;
    background.tint = config.colors.trayBg;
    background.alpha = 0.98;
    this.addChild(border, background);

    const startX = -((TRAY_SLOT_COUNT - 1) * (config.tray.slotSize + config.tray.gap)) / 2;
    for (let index = 0; index < TRAY_SLOT_COUNT; index += 1) {
      const x = startX + index * (config.tray.slotSize + config.tray.gap);
      this.slotX.push(x);

      const slot = new Sprite(requireTexture('tile_face'));
      slot.anchor.set(0.5);
      slot.position.set(x, 0);
      slot.width = config.tray.slotSize;
      slot.height = config.tray.slotSize;
      slot.alpha = 0.18;
      slot.tint = config.colors.accent;
      this.addChild(slot);
    }
  }

  setSlots(slots: Array<Stone | null>, theme: ThemeId): void {
    for (let index = 0; index < TRAY_SLOT_COUNT; index += 1) {
      const stone = slots[index] ?? null;
      let tile = this.slotTiles[index];

      if (!stone) {
        if (tile) {
          tile.visible = false;
        }
        continue;
      }

      if (!tile) {
        tile = new TileSprite();
        tile.eventMode = 'none';
        tile.scale.set(0.48);
        tile.position.set(this.slotX[index], -2);
        this.slotTiles[index] = tile;
        this.addChild(tile);
      }

      tile.setStone(stone, theme);
      tile.eventMode = 'none';
      tile.scale.set(0.48);
      tile.position.set(this.slotX[index], -2);
      tile.alpha = 1;
      tile.visible = true;
    }
  }

  clear(): void {
    this.slotTiles.forEach((tile) => {
      if (tile) {
        tile.visible = false;
      }
    });
  }

  getSlotCenter(index: number): { x: number; y: number } {
    const safeIndex = Math.max(0, Math.min(TRAY_SLOT_COUNT - 1, index));
    return {
      x: this.x + this.slotX[safeIndex],
      y: this.y - 2,
    };
  }

  findFirstEmptySlot(slots: Array<Stone | null>): number {
    const index = slots.findIndex((slot) => slot === null);
    return index === -1 ? TRAY_SLOT_COUNT - 1 : index;
  }

  findSlotForStone(stoneId: string): number {
    return this.slotTiles.findIndex((tile) => tile?.visible && tile.getStoneId() === stoneId);
  }

  playMatchRemoval(
    removed: Stone[],
    incomingSlotIndex: number,
    theme: ThemeId,
    ticker: Ticker | undefined,
    onComplete: () => void,
  ): void {
    const incoming = removed[removed.length - 1];
    const partner = removed[0];
    const partnerIndex = this.findVisiblePartnerSlot(partner.id, incoming.face);
    const affectedTiles: TileSprite[] = [];

    if (partnerIndex !== -1 && this.slotTiles[partnerIndex]) {
      affectedTiles.push(this.slotTiles[partnerIndex]!);
    }

    const transient = new TileSprite();
    transient.eventMode = 'none';
    transient.setStone(incoming, theme);
    transient.scale.set(0.48);
    transient.position.set(this.slotX[incomingSlotIndex], -2);
    this.addChild(transient);
    affectedTiles.push(transient);

    if (!ticker) {
      transient.parent?.removeChild(transient);
      onComplete();
      return;
    }

    let elapsed = 0;
    const duration = 180;
    const tick = (frame: Ticker): void => {
      elapsed += frame.deltaMS;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      affectedTiles.forEach((tile) => {
        tile.scale.set(0.48 * (1 - eased));
        tile.alpha = 1 - eased;
      });

      if (progress >= 1) {
        ticker.remove(tick);
        transient.parent?.removeChild(transient);
        onComplete();
      }
    };

    ticker.add(tick);
  }

  private findVisiblePartnerSlot(stoneId: string, face: number): number {
    return this.slotTiles.findIndex((tile) => {
      return tile?.visible && (tile.getStoneId() === stoneId || tile.getFaceId() === face);
    });
  }
}

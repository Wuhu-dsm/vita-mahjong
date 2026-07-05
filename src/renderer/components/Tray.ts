import { Container, Graphics, type Ticker } from 'pixi.js';
import { config } from '../../app/config';
import type { Stone, ThemeId } from '../../engine/types';
import { TileSprite } from './TileSprite';

export const TRAY_SLOT_COUNT = 4;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface RemovalShard {
  graphic: Graphics;
  vx: number;
  vy: number;
  rotationSpeed: number;
}

export class Tray extends Container {
  private readonly slotTiles: Array<TileSprite | null> = Array.from({ length: TRAY_SLOT_COUNT }, () => null);
  private readonly slotX: number[] = [];
  private readonly glow = new Graphics();

  constructor() {
    super();
    this.position.set(config.designWidth / 2, 352);

    const totalWidth = TRAY_SLOT_COUNT * config.tray.slotSize + 44;
    this.glow.roundRect(-totalWidth / 2 - 4, -config.tray.height / 2 - 4, totalWidth + 8, config.tray.height + 8, 24);
    this.glow.stroke({ color: 0x5cff28, width: 12, alpha: 0.0 });
    this.addChild(this.glow);

    const panel = new Graphics();
    panel.roundRect(-totalWidth / 2 - 8, -config.tray.height / 2 + 16, totalWidth + 16, config.tray.height, 22);
    panel.fill({ color: 0x120502, alpha: 0.48 });
    panel.roundRect(-totalWidth / 2, -config.tray.height / 2, totalWidth, config.tray.height, 20);
    panel.fill({ color: 0x421407 });
    panel.roundRect(-totalWidth / 2 + 10, -config.tray.height / 2 + 10, totalWidth - 20, config.tray.height - 20, 16);
    panel.fill({ color: 0x2b0d05 });
    panel.roundRect(-totalWidth / 2, -config.tray.height / 2, totalWidth, config.tray.height, 20);
    panel.stroke({ color: 0xb86f2d, width: 10 });
    this.addChild(panel);

    const startX = -((TRAY_SLOT_COUNT - 1) * (config.tray.slotSize + config.tray.gap)) / 2;
    for (let index = 0; index < TRAY_SLOT_COUNT; index += 1) {
      const x = startX + index * (config.tray.slotSize + config.tray.gap);
      this.slotX.push(x);

      const slot = new Graphics();
      slot.roundRect(x - config.tray.slotSize / 2, -config.tray.height / 2 + 16, config.tray.slotSize, config.tray.height - 32, 7);
      slot.fill({ color: 0x3a1008, alpha: 0.74 });
      if (index > 0) {
        slot.rect(x - config.tray.slotSize / 2, -config.tray.height / 2 + 14, 2, config.tray.height - 28);
        slot.fill({ color: 0x6d2b12, alpha: 0.7 });
      }
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
        tile.scale.set(0.52);
        tile.position.set(this.slotX[index], -2);
        this.slotTiles[index] = tile;
        this.addChild(tile);
      }

      tile.setStone(stone, theme);
      tile.eventMode = 'none';
      tile.scale.set(0.52);
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
    transient.scale.set(0.52);
    transient.position.set(this.slotX[incomingSlotIndex], -2);
    this.addChild(transient);
    affectedTiles.push(transient);

    if (!ticker) {
      transient.parent?.removeChild(transient);
      onComplete();
      return;
    }

    const shards = affectedTiles.flatMap((tile) => this.spawnRemovalShards(tile.x, tile.y));
    let elapsed = 0;
    const duration = 420;
    const tick = (frame: Ticker): void => {
      elapsed += frame.deltaMS;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const collapse = easeOutCubic(Math.max(0, (progress - 0.14) / 0.86));
      const pop = 1 + Math.sin(progress * Math.PI) * 0.24;
      this.glow.alpha = 1 - progress;
      this.glow.clear();
      this.glow.roundRect(
        -(TRAY_SLOT_COUNT * config.tray.slotSize + 44) / 2 - 4,
        -config.tray.height / 2 - 4,
        TRAY_SLOT_COUNT * config.tray.slotSize + 52,
        config.tray.height + 8,
        24,
      );
      this.glow.stroke({ color: 0xbaff4d, width: 18, alpha: Math.max(0, 1 - progress) });
      affectedTiles.forEach((tile) => {
        tile.scale.set(0.52 * pop * (1 - collapse));
        tile.alpha = 1 - collapse;
      });
      shards.forEach((shard) => {
        shard.graphic.x += shard.vx * frame.deltaMS;
        shard.graphic.y += shard.vy * frame.deltaMS;
        shard.vy += 0.03 * frame.deltaMS;
        shard.graphic.rotation += shard.rotationSpeed * frame.deltaMS;
        shard.graphic.alpha = 1 - eased;
        shard.graphic.scale.set(1 + progress * 0.55);
      });

      if (progress >= 1) {
        ticker.remove(tick);
        this.glow.clear();
        shards.forEach((shard) => shard.graphic.parent?.removeChild(shard.graphic));
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

  private spawnRemovalShards(x: number, y: number): RemovalShard[] {
    const shards: RemovalShard[] = [];
    for (let i = 0; i < 18; i += 1) {
      const shard = new Graphics();
      const width = 10 + Math.random() * 18;
      const height = 8 + Math.random() * 16;
      const angle = -Math.PI * 0.9 + Math.random() * Math.PI * 1.8;
      const speed = 0.28 + Math.random() * 0.46;
      shard.roundRect(-width / 2, -height / 2, width, height, 3);
      shard.fill({ color: i % 3 === 0 ? 0xffffff : i % 3 === 1 ? 0xf8f0d4 : 0xcfffd0 });
      shard.stroke({ color: 0x78d96b, width: 2, alpha: 0.68 });
      shard.position.set(x + (Math.random() - 0.5) * 58, y + (Math.random() - 0.5) * 38);
      shard.rotation = Math.random() * Math.PI;
      this.addChild(shard);
      shards.push({
        graphic: shard,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.22,
        rotationSpeed: (Math.random() - 0.5) * 0.018,
      });
    }
    return shards;
  }
}

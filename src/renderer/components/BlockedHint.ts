import { Assets, Container, Sprite, Text, Texture } from 'pixi.js';
import type { AssetKey } from '../../app/assets';
import { config } from '../../app/config';

function requireTexture(key: AssetKey): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) {
    throw new Error(`Texture "${key}" has not been loaded`);
  }
  return texture;
}

export class BlockedHint extends Container {
  private readonly text: Text;
  private visibleUntil = 0;

  constructor() {
    super();
    this.visible = false;

    const left = this.createArrow(-132, 0, 0);
    const right = this.createArrow(132, 0, Math.PI);
    this.addChild(left, right);

    this.text = new Text({
      text: '被左右锁住',
      style: {
        fontFamily: 'Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 30,
        fontWeight: '800',
        fill: config.colors.destructive,
        stroke: { color: 0xfff4df, width: 4 },
        align: 'center',
      },
    });
    this.text.anchor.set(0.5);
    this.addChild(this.text);
  }

  showAt(x: number, y: number, now = performance.now()): void {
    this.position.set(x, y);
    this.alpha = 1;
    this.visible = true;
    this.visibleUntil = now + 1200;
  }

  update(now = performance.now()): void {
    if (!this.visible) return;
    const remaining = this.visibleUntil - now;
    if (remaining <= 0) {
      this.visible = false;
      return;
    }
    this.alpha = Math.min(1, remaining / 300);
  }

  private createArrow(x: number, y: number, rotation: number): Sprite {
    const arrow = new Sprite(requireTexture('tile_blocked_arrow'));
    arrow.anchor.set(0.5);
    arrow.position.set(x, y);
    arrow.rotation = rotation;
    arrow.width = 62;
    arrow.height = 62 * (arrow.texture.height / arrow.texture.width);
    return arrow;
  }
}

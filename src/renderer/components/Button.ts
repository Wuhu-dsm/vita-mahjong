import { Assets, Container, Rectangle, Sprite, Text, Texture } from 'pixi.js';
import type { AssetKey } from '../../app/assets';
import { config } from '../../app/config';

export type ButtonTextureKey =
  | 'btn_wooden_capsule'
  | 'btn_green_capsule'
  | 'btn_circle_brown';

export interface ButtonOptions {
  textureKey: ButtonTextureKey;
  label: string;
  width: number;
  height: number;
  fontSize?: number;
  textColor?: number;
  onTap?: () => void;
}

function requireTexture(key: AssetKey): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) {
    throw new Error(`Texture "${key}" has not been loaded`);
  }
  return texture;
}

export class Button extends Container {
  private readonly background: Sprite;
  private readonly labelText: Text;

  constructor(options: ButtonOptions) {
    super();

    this.background = new Sprite(requireTexture(options.textureKey));
    this.background.anchor.set(0.5);
    this.background.width = options.width;
    this.background.height = options.height;
    this.addChild(this.background);

    this.labelText = new Text({
      text: options.label,
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: options.fontSize ?? 42,
        fontWeight: '800',
        fill: options.textColor ?? 0xfff7d2,
        stroke: { color: 0x5a2d16, width: 4 },
        align: 'center',
      },
    });
    this.labelText.anchor.set(0.5);
    this.addChild(this.labelText);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Rectangle(
      -options.width / 2 - config.tile.touchPadding,
      -options.height / 2 - config.tile.touchPadding,
      options.width + config.tile.touchPadding * 2,
      options.height + config.tile.touchPadding * 2,
    );

    if (options.onTap) {
      this.on('pointertap', options.onTap);
    }
  }

  setLabel(label: string): void {
    this.labelText.text = label;
  }
}

import { Container, Graphics, Rectangle, Text } from 'pixi.js';
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

export class Button extends Container {
  private readonly background = new Graphics();
  private readonly labelText: Text;

  constructor(options: ButtonOptions) {
    super();

    this.drawBackground(options);
    this.addChild(this.background);

    this.labelText = new Text({
      text: options.label,
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: options.fontSize ?? 42,
        fontWeight: '900',
        fill: options.textColor ?? 0xfff7d2,
        stroke: { color: 0x4f210c, width: 5 },
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

  private drawBackground(options: ButtonOptions): void {
    const g = this.background;
    const width = options.width;
    const height = options.height;
    const x = -width / 2;
    const y = -height / 2;

    if (options.textureKey === 'btn_circle_brown') {
      const radius = Math.min(width, height) / 2;
      g.circle(0, 0, radius);
      g.fill({ color: 0x130806, alpha: 0.7 });
      g.circle(0, 0, radius - 8);
      g.fill({ color: 0x7d3f18 });
      g.circle(0, 0, radius - 18);
      g.fill({ color: 0x421407 });
      g.circle(-radius * 0.18, -radius * 0.2, radius * 0.54);
      g.fill({ color: 0x6d3213, alpha: 0.55 });
      g.circle(0, 0, radius - 9);
      g.stroke({ color: 0xffcb79, width: 6, alpha: 0.95 });
      return;
    }

    const isGreen = options.textureKey === 'btn_green_capsule';
    const radius = height / 2;
    g.roundRect(x - 6, y + 14, width + 12, height, radius);
    g.fill({ color: 0x1b0b05, alpha: 0.55 });
    g.roundRect(x, y, width, height, radius);
    g.fill({ color: isGreen ? 0x118124 : 0x9c4d16 });
    g.roundRect(x + 10, y + 10, width - 20, height - 20, radius - 10);
    g.fill({ color: isGreen ? 0x4fb83c : 0xe87a17 });
    g.roundRect(x + 18, y + 16, width - 36, height * 0.36, height * 0.18);
    g.fill({ color: 0xfff0ad, alpha: isGreen ? 0.18 : 0.28 });
    g.roundRect(x, y, width, height, radius);
    g.stroke({ color: 0xffd889, width: 7, alpha: 0.95 });
  }
}

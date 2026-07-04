import { Assets, Container, Rectangle, Sprite, Text, Texture } from 'pixi.js';
import type { AssetKey } from '../../app/assets';
import { config } from '../../app/config';
import { Button } from './Button';

function requireTexture(key: AssetKey): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) {
    throw new Error(`Texture "${key}" has not been loaded`);
  }
  return texture;
}

export class FailurePopup extends Container {
  static readonly RESTART = 'restart';

  constructor() {
    super();
    this.visible = false;
    this.alpha = 0;
    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, config.designWidth, config.designHeight);

    const overlay = new Sprite(requireTexture('bg_result'));
    overlay.width = config.designWidth;
    overlay.height = config.designHeight;
    overlay.alpha = 0.62;
    overlay.eventMode = 'static';
    this.addChild(overlay);

    const panel = new Sprite(requireTexture('btn_circle_brown'));
    panel.anchor.set(0.5);
    panel.position.set(config.designWidth / 2, config.designHeight * 0.47);
    panel.width = 620;
    panel.height = 430;
    panel.tint = 0x4a2c21;
    this.addChild(panel);

    const heading = new Text({
      text: '没有空位了',
      style: {
        fontFamily: 'Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 58,
        fontWeight: '900',
        fill: 0xfff4d6,
        stroke: { color: config.colors.destructive, width: 5 },
        align: 'center',
      },
    });
    heading.anchor.set(0.5);
    heading.position.set(config.designWidth / 2, config.designHeight * 0.42);
    this.addChild(heading);

    const restartButton = new Button({
      textureKey: 'btn_green_capsule',
      label: '重新开始',
      width: 380,
      height: 118,
      fontSize: 40,
      textColor: 0xf9ffe6,
      onTap: () => this.emit(FailurePopup.RESTART),
    });
    restartButton.position.set(config.designWidth / 2, config.designHeight * 0.53);
    this.addChild(restartButton);
  }

  show(): void {
    this.visible = true;
    this.alpha = 1;
    this.scale.set(1);
  }

  hide(): void {
    this.visible = false;
    this.alpha = 0;
  }
}

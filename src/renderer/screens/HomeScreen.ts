import { Assets, Container, Rectangle, Sprite, Text, Texture } from 'pixi.js';
import type { AssetKey } from '../../app/assets';
import { config } from '../../app/config';
import { Button } from '../components/Button';

function requireTexture(key: AssetKey): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) {
    throw new Error(`Texture "${key}" has not been loaded`);
  }
  return texture;
}

function coverSprite(key: AssetKey): Sprite {
  const sprite = new Sprite(requireTexture(key));
  sprite.width = config.designWidth;
  sprite.height = config.designHeight;
  return sprite;
}

function centeredSprite(key: AssetKey, x: number, y: number, width: number): Sprite {
  const sprite = new Sprite(requireTexture(key));
  sprite.anchor.set(0.5);
  sprite.x = x;
  sprite.y = y;
  sprite.width = width;
  sprite.height = width * (sprite.texture.height / sprite.texture.width);
  return sprite;
}

export class HomeScreen extends Container {
  static readonly START_LEVEL = 'start-level';

  constructor() {
    super();

    this.addChild(coverSprite('bg_home'));

    const logo = centeredSprite(
      'logo_vita_mahjong',
      config.designWidth / 2,
      config.designHeight * 0.18,
      620,
    );
    this.addChild(logo);

    const ring = centeredSprite(
      'deco_ring',
      config.designWidth / 2,
      config.designHeight * 0.43,
      440,
    );
    this.addChild(ring);

    const levelButton = new Button({
      textureKey: 'btn_wooden_capsule',
      label: '关卡 1',
      width: 520,
      height: 150,
      fontSize: 48,
      onTap: () => this.emit(HomeScreen.START_LEVEL, 1),
    });
    levelButton.position.set(config.designWidth / 2, config.designHeight * 0.72);
    this.addChild(levelButton);

    const gear = centeredSprite(
      'icon_gear',
      config.designWidth * 0.93,
      config.designHeight * 0.06,
      84,
    );
    gear.eventMode = 'static';
    gear.cursor = 'pointer';
    gear.hitArea = new Rectangle(-54, -54, 108, 108);
    this.addChild(gear);

    const coinLabel = new Text({
      text: 'x0',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 32,
        fontWeight: '700',
        fill: 0xfff0b8,
        stroke: { color: 0x4a2414, width: 3 },
      },
    });
    coinLabel.anchor.set(0, 0.5);
    coinLabel.position.set(118, config.designHeight * 0.06);
    this.addChild(coinLabel);
  }
}

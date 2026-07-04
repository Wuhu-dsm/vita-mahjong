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

function makeLabel(text: string, x: number): Text {
  const label = new Text({
    text,
    style: {
      fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
      fontSize: 28,
      fontWeight: '800',
      fill: 0xfff4d6,
      stroke: { color: 0x08352c, width: 4 },
      align: 'center',
    },
  });
  label.anchor.set(0.5);
  label.position.set(x, config.safeAreaTop + 46);
  return label;
}

export class HUD extends Container {
  private readonly levelLabel = makeLabel('关卡 1', config.designWidth * 0.31);
  private readonly scoreLabel = makeLabel('分数 0', config.designWidth * 0.52);
  private readonly timerLabel: Text;
  private readonly comboLabel = makeLabel('匹配 0', config.designWidth * 0.78);

  constructor(private readonly onBack?: () => void) {
    super();

    this.timerLabel = new Text({
      text: '00:00',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 30,
        fontWeight: '800',
        fill: 0xfff4d6,
        stroke: { color: 0x08352c, width: 4 },
        align: 'center',
      },
    });
    this.timerLabel.anchor.set(0.5);
    this.timerLabel.position.set(config.designWidth * 0.615, config.safeAreaTop + 46);

    const backButton = this.createIconButton('icon_back', config.designWidth * 0.07);
    backButton.on('pointertap', () => {
      if (this.onBack) this.onBack();
    });
    const menuButton = this.createIconButton('icon_menu', config.designWidth * 0.93);
    this.addChild(backButton, menuButton, this.levelLabel, this.scoreLabel, this.timerLabel, this.comboLabel);
  }

  update(level: number, score: number, combo: number, timerMs?: number): void {
    this.levelLabel.text = `关卡 ${level}`;
    this.scoreLabel.text = `分数 ${Math.round(score)}`;
    this.comboLabel.text = `匹配 ${combo}`;
    if (timerMs !== undefined) {
      const minutes = Math.floor(timerMs / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((timerMs % 60000) / 1000).toString().padStart(2, '0');
      this.timerLabel.text = `${minutes}:${seconds}`;
    }
  }

  getScoreAnchor(): { x: number; y: number } {
    return { x: this.scoreLabel.x, y: this.scoreLabel.y - 18 };
  }

  private createIconButton(iconKey: AssetKey, x: number): Container {
    const button = new Container();
    button.position.set(x, config.safeAreaTop + 46);
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const background = new Sprite(requireTexture('btn_circle_brown'));
    background.anchor.set(0.5);
    background.width = 76;
    background.height = 76;

    const icon = new Sprite(requireTexture(iconKey));
    icon.anchor.set(0.5);
    icon.width = 42;
    icon.height = 42 * (icon.texture.height / icon.texture.width);
    button.addChild(background, icon);
    return button;
  }
}

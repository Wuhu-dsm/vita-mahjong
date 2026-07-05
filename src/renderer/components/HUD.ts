import { Container, Graphics, Text } from 'pixi.js';
import { config } from '../../app/config';
import { makeRoundIconButton } from './VisualPrimitives';

function makeHudText(text: string, fontSize: number, fill: number, strokeColor: number): Text {
  const label = new Text({
    text,
    style: {
      fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
      fontSize,
      fontWeight: '900',
      fill,
      stroke: { color: strokeColor, width: 5 },
      align: 'center',
    },
  });
  label.anchor.set(0.5);
  return label;
}

export class HUD extends Container {
  private readonly scoreLabel = makeHudText('积分', 52, 0xffcf30, 0x8c3508);
  private readonly scoreValue = makeHudText('0', 62, 0xfff8d7, 0x14362f);

  constructor(private readonly onBack?: () => void) {
    super();

    const vignette = new Graphics();
    vignette.rect(0, 0, config.designWidth, 280).fill({ color: 0x001b15, alpha: 0.08 });
    this.addChild(vignette);

    const backButton = makeRoundIconButton('‹', 76, 188, () => {
      if (this.onBack) this.onBack();
    });
    this.scoreLabel.position.set(config.designWidth / 2 - 72, 188);
    this.scoreValue.position.set(config.designWidth / 2 + 86, 188);
    this.addChild(backButton, this.scoreLabel, this.scoreValue);
  }

  update(_level: number, score: number, _combo: number, _timerMs?: number): void {
    this.scoreValue.text = String(Math.floor(score));
  }

  getScoreAnchor(): { x: number; y: number } {
    return { x: config.designWidth / 2 + 86, y: 188 };
  }
}

import { Container, Text, type Ticker } from 'pixi.js';
import { config } from '../../app/config';

export class ComboFeedback extends Container {
  private readonly goodText: Text;
  private readonly comboText: Text;
  private elapsedMs = 0;
  private durationMs = 500;

  constructor() {
    super();
    this.visible = false;
    this.position.set(config.designWidth / 2, config.designHeight * 0.42);

    this.goodText = this.makeText('Good', 58, config.colors.accent);
    this.comboText = this.makeText('Combo x2', 44, 0xfff4d6);
    this.comboText.y = 62;
    this.addChild(this.goodText, this.comboText);
  }

  show(combo: number): void {
    if (combo < 2) return;
    this.comboText.text = `Combo x${combo}`;
    this.elapsedMs = 0;
    this.alpha = 1;
    this.scale.set(0.2);
    this.visible = true;
  }

  update(ticker: Ticker): void {
    if (!this.visible) return;
    this.elapsedMs += ticker.deltaMS;
    const progress = Math.min(this.elapsedMs / this.durationMs, 1);
    const pop = progress < 0.55 ? progress / 0.55 : 1 - (progress - 0.55) * 0.08;
    this.scale.set(Math.min(1.1, 0.2 + pop));
    this.alpha = 1 - Math.max(0, progress - 0.65) / 0.35;
    if (progress >= 1) {
      this.visible = false;
    }
  }

  private makeText(text: string, fontSize: number, fill: number): Text {
    const label = new Text({
      text,
      style: {
        fontFamily: 'Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize,
        fontWeight: '900',
        fill,
        stroke: { color: 0x0d2f28, width: 5 },
        align: 'center',
      },
    });
    label.anchor.set(0.5);
    return label;
  }
}

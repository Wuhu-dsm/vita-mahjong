import { Container, Text, type Ticker } from 'pixi.js';
import { config } from '../../app/config';

interface Floater {
  text: Text;
  elapsedMs: number;
  startX: number;
  startY: number;
}

export class ScoreFloater extends Container {
  private readonly floaters: Floater[] = [];

  show(points: number, x: number, y: number): void {
    const text = new Text({
      text: `+${Math.round(points)}`,
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 36,
        fontWeight: '900',
        fill: config.colors.accent,
        stroke: { color: 0x0d2f28, width: 4 },
      },
    });
    text.anchor.set(0.5);
    text.position.set(x, y);
    this.floaters.push({ text, elapsedMs: 0, startX: x, startY: y });
    this.addChild(text);
  }

  update(ticker: Ticker): void {
    for (let index = this.floaters.length - 1; index >= 0; index -= 1) {
      const floater = this.floaters[index];
      floater.elapsedMs += ticker.deltaMS;
      const progress = Math.min(floater.elapsedMs / 800, 1);
      floater.text.position.set(floater.startX, floater.startY - 60 * progress);
      floater.text.alpha = 1 - progress;

      if (progress >= 1) {
        floater.text.parent?.removeChild(floater.text);
        this.floaters.splice(index, 1);
      }
    }
  }
}

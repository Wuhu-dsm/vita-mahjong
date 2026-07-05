import { Container, Graphics, Text } from 'pixi.js';
import { config } from '../../app/config';
import { Button } from '../components/Button';
import { addScreenGlow, makeGoldText, makeVerticalGradient } from '../components/VisualPrimitives';

export interface ResultStats {
  level: number;
  nextLevel: number;
  elapsedSeconds: number;
  score: number;
  combo: number;
}

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const remainder = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function makeText(text: string, fontSize: number, fill: number, weight = '700'): Text {
  const label = new Text({
    text,
    style: {
      fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
      fontSize,
      fontWeight: weight,
      fill,
      align: 'center',
      stroke: { color: 0x1b0902, width: fontSize >= 48 ? 5 : 3 },
    },
  });
  label.anchor.set(0.5);
  return label;
}

export class ResultScreen extends Container {
  static readonly NEXT_LEVEL = 'next-level';

  private readonly timeValue = makeText('00:00', 58, 0xffffc9, '900');
  private readonly scoreValue = makeText('0', 58, 0xffffc9, '900');
  private readonly comboValue = makeText('0', 58, 0xffffc9, '900');
  private readonly beatPercent = makeText('84.97%', 56, 0x49f13a, '900');
  private readonly progressLabel = makeText('达到第1关', 38, 0xffd98e);
  private readonly nextButton: Button;
  private nextLevel = 2;

  constructor(initialStats: ResultStats = {
    level: 1,
    nextLevel: 2,
    elapsedSeconds: 102,
    score: 63.9,
    combo: 9,
  }) {
    super();

    this.drawBackground();
    this.drawOrnaments();

    const title = makeGoldText('智慧超群', 116, 7);
    title.position.set(config.designWidth / 2, 690);
    this.addChild(title);

    this.addStatsCard('时间', '◷', this.timeValue, 235);
    this.addStatsCard('IQ', '◎', this.scoreValue, 540);
    this.addStatsCard('连击', '◴', this.comboValue, 845);

    const line1 = makeText('击败了', 52, 0xffd98e);
    line1.position.set(420, 1298);
    this.beatPercent.position.set(626, 1298);
    const line2 = makeText('的玩家！ 战略超凡！', 52, 0xffd98e);
    line2.position.set(config.designWidth / 2, 1374);
    this.addChild(line1, this.beatPercent, line2);

    this.drawProgress();
    this.progressLabel.position.set(config.designWidth / 2, 1642);
    this.addChild(this.progressLabel);

    this.nextButton = new Button({
      textureKey: 'btn_green_capsule',
      label: '关卡 2',
      width: 680,
      height: 158,
      fontSize: 78,
      textColor: 0xf9ffe6,
      onTap: () => this.emit(ResultScreen.NEXT_LEVEL, this.nextLevel),
    });
    this.nextButton.position.set(config.designWidth / 2, 1944);
    this.addChild(this.nextButton);

    this.setStats(initialStats);
  }

  setStats(stats: ResultStats): void {
    this.nextLevel = stats.nextLevel;
    this.timeValue.text = formatTime(stats.elapsedSeconds);
    this.scoreValue.text = this.formatIq(stats.score);
    this.comboValue.text = Math.max(0, Math.round(stats.combo)).toString();
    this.progressLabel.text = `达到第${Math.max(1, stats.level)}关`;
    this.beatPercent.text = `${this.calculateBeatRatio(stats)}%`;
    this.nextButton.setLabel(`关卡 ${stats.nextLevel}`);
  }

  private drawBackground(): void {
    this.addChild(
      makeVerticalGradient(config.designWidth, config.designHeight, [
        { y: 0, color: 0x00120b },
        { y: 0.36, color: 0x06130b },
        { y: 0.72, color: 0x000503 },
        { y: 1, color: 0x000000 },
      ]),
    );
    const veil = new Graphics();
    veil.rect(0, 0, config.designWidth, config.designHeight).fill({ color: 0x000000, alpha: 0.42 });
    this.addChild(veil);
    addScreenGlow(this, 0xf0a523, config.designWidth / 2, 620, 520, 1.2);
  }

  private drawOrnaments(): void {
    const lotus = new Graphics();
    for (let i = 0; i < 7; i += 1) {
      const x = config.designWidth / 2 + (i - 3) * 62;
      const y = 546 + Math.abs(i - 3) * 18;
      lotus.ellipse(x, y, 46, 116).fill({ color: i === 3 ? 0xffdf28 : 0xf0bd23, alpha: 0.98 });
      lotus.ellipse(x, y, 28, 86).stroke({ color: 0xa84b11, width: 5, alpha: 0.8 });
    }
    lotus.circle(config.designWidth / 2, 588, 24).fill({ color: 0xfff0a7, alpha: 0.72 });
    this.addChild(lotus);

    const clouds = new Graphics();
    for (const side of [-1, 1]) {
      const baseX = side < 0 ? -10 : config.designWidth + 10;
      clouds.ellipse(baseX, 740, 220, 120).fill({ color: 0x0b6861, alpha: 0.84 });
      clouds.ellipse(baseX + side * 80, 700, 160, 100).fill({ color: 0xf0af1a, alpha: 0.9 });
      clouds.ellipse(baseX + side * 120, 762, 150, 68).fill({ color: 0xc33a17, alpha: 0.88 });
      clouds.ellipse(baseX + side * 20, 792, 150, 72).fill({ color: 0x123d61, alpha: 0.9 });
    }
    this.addChild(clouds);
  }

  private addStatsCard(label: string, icon: string, value: Text, x: number): void {
    const card = new Graphics();
    card.roundRect(x - 136, 920, 272, 146, 14).fill({ color: 0x150806, alpha: 0.82 });
    card.roundRect(x - 136, 920, 272, 146, 14).stroke({ color: 0x7a3d1a, width: 3 });
    card.rect(x - 136, 920, 272, 56).fill({ color: 0x3d1b0b, alpha: 0.64 });
    this.addChild(card);

    const labelText = makeText(label, 40, 0xffd98e);
    labelText.position.set(x, 950);
    const iconText = makeText(icon, 42, 0x9a7350);
    iconText.position.set(x - 82, 1023);
    value.position.set(x + 24, 1022);
    this.addChild(labelText, iconText, value);
  }

  private drawProgress(): void {
    const g = new Graphics();
    g.rect(216, 1518, 560, 24).fill({ color: 0x444444, alpha: 0.72 });
    g.roundRect(214, 1514, 52, 32, 16).fill({ color: 0xffb12c });
    for (let i = 0; i < 9; i += 1) {
      g.roundRect(282 + i * 56, 1513, 42, 34, 5).fill({ color: 0x5c5c5c, alpha: 0.86 });
    }
    g.roundRect(782, 1484, 92, 64, 12).fill({ color: 0xc9311b });
    g.roundRect(792, 1472, 72, 52, 10).fill({ color: 0x2e9b75 });
    g.circle(828, 1498, 18).fill({ color: 0xffe7a2 });
    this.addChild(g);
  }

  private calculateBeatRatio(stats: ResultStats): string {
    const raw = 72 + Math.min(stats.score / 900, 18) + Math.min(stats.combo, 10) * 0.7;
    return Math.min(97.5, raw).toFixed(2);
  }

  private formatIq(score: number): string {
    const rounded = Math.round(score * 10) / 10;
    return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
  }
}

import { Assets, Container, Sprite, Text, Texture } from 'pixi.js';
import type { AssetKey } from '../../app/assets';
import { config } from '../../app/config';
import { Button } from '../components/Button';

export interface ResultStats {
  level: number;
  nextLevel: number;
  elapsedSeconds: number;
  score: number;
  combo: number;
}

function requireTexture(key: AssetKey): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) {
    throw new Error(`Texture "${key}" has not been loaded`);
  }
  return texture;
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
      fontFamily: 'Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
      fontSize,
      fontWeight: weight,
      fill,
      align: 'center',
      stroke: { color: 0x29170b, width: fontSize >= 48 ? 4 : 2 },
    },
  });
  label.anchor.set(0.5);
  return label;
}

export class ResultScreen extends Container {
  static readonly NEXT_LEVEL = 'next-level';

  private readonly timeValue = makeText('00:00', 42, 0xfff5dc);
  private readonly scoreValue = makeText('0', 42, 0xfff5dc);
  private readonly comboValue = makeText('0', 42, 0xfff5dc);
  private readonly beatRatio = makeText('击败了 84.97% 的玩家！', 34, 0xf5d78e);
  private readonly progressLabel = makeText('达到第1关', 40, 0xfff5dc);
  private readonly nextButton: Button;
  private nextLevel = 2;

  constructor(initialStats: ResultStats = {
    level: 1,
    nextLevel: 2,
    elapsedSeconds: 102,
    score: 0,
    combo: 0,
  }) {
    super();

    const background = new Sprite(requireTexture('bg_result'));
    background.width = config.designWidth;
    background.height = config.designHeight;
    this.addChild(background);

    const lotus = new Sprite(requireTexture('deco_lotus'));
    lotus.anchor.set(0.5);
    lotus.position.set(config.designWidth / 2, config.designHeight * 0.24);
    lotus.width = 620;
    lotus.height = 620 * (lotus.texture.height / lotus.texture.width);
    lotus.alpha = 0.92;
    this.addChild(lotus);

    const title = makeText('智慧超群', 78, 0xf5d78e, '900');
    title.position.set(config.designWidth / 2, config.designHeight * 0.16);
    this.addChild(title);

    this.addStatsColumn('时间', this.timeValue, config.designWidth * 0.22);
    this.addStatsColumn('分数', this.scoreValue, config.designWidth * 0.5);
    this.addStatsColumn('连击', this.comboValue, config.designWidth * 0.78);

    this.beatRatio.position.set(config.designWidth / 2, config.designHeight * 0.48);
    this.addChild(this.beatRatio);

    this.progressLabel.position.set(config.designWidth / 2, config.designHeight * 0.58);
    this.addChild(this.progressLabel);

    this.nextButton = new Button({
      textureKey: 'btn_green_capsule',
      label: '关卡 2',
      width: 520,
      height: 150,
      fontSize: 48,
      textColor: 0xf9ffe6,
      onTap: () => this.emit(ResultScreen.NEXT_LEVEL, this.nextLevel),
    });
    this.nextButton.position.set(config.designWidth / 2, config.designHeight * 0.82);
    this.addChild(this.nextButton);

    this.setStats(initialStats);
  }

  setStats(stats: ResultStats): void {
    this.nextLevel = stats.nextLevel;
    this.timeValue.text = formatTime(stats.elapsedSeconds);
    this.scoreValue.text = Math.round(stats.score).toString();
    this.comboValue.text = stats.combo.toString();
    this.progressLabel.text = `达到第${stats.level}关`;
    this.beatRatio.text = `击败了 ${this.calculateBeatRatio(stats)}% 的玩家！`;
    this.nextButton.setLabel(`关卡 ${stats.nextLevel}`);
  }

  private addStatsColumn(label: string, value: Text, x: number): void {
    const labelText = makeText(label, 30, 0xd4a574);
    labelText.position.set(x, config.designHeight * 0.345);
    value.position.set(x, config.designHeight * 0.39);
    this.addChild(labelText, value);
  }

  private calculateBeatRatio(stats: ResultStats): string {
    const raw = 72 + Math.min(stats.score / 900, 18) + Math.min(stats.combo, 10) * 0.7;
    return Math.min(97.5, raw).toFixed(2);
  }
}

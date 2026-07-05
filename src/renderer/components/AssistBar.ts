import { Container, Graphics, Text } from 'pixi.js';

type PowerIcon = 'undo' | 'hint' | 'shuffle';

class PowerButton extends Container {
  private readonly badge = new Graphics();
  private readonly badgeText: Text;

  constructor(
    icon: PowerIcon,
    onTap: () => void,
  ) {
    super();
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointertap', onTap);

    const bg = new Graphics();
    bg.circle(0, 14, 82).fill({ color: 0x120604, alpha: 0.58 });
    bg.circle(0, 0, 76).fill({ color: 0x934719 });
    bg.circle(0, 0, 62).fill({ color: 0x3c1208 });
    bg.circle(0, 0, 74).stroke({ color: 0xc87934, width: 8 });
    this.addChild(bg);

    const iconGraphic = new Graphics();
    this.drawIcon(iconGraphic, icon);
    this.addChild(iconGraphic);

    this.badgeText = new Text({
      text: '',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 28,
        fontWeight: '900',
        fill: 0xffffff,
        stroke: { color: 0x0d4b18, width: 3 },
      },
    });
    this.badgeText.anchor.set(0.5);
    this.badge.position.set(58, -60);
    this.badgeText.position.set(58, -60);
    this.addChild(this.badge, this.badgeText);
  }

  setCount(count: number): void {
    this.badge.clear();
    const enabled = count > 0;
    this.badge.circle(0, 0, 34).fill({ color: enabled ? 0xd73816 : 0x574335 });
    this.badge.circle(0, 0, 34).stroke({ color: enabled ? 0xff7b43 : 0xa98a6d, width: 4 });
    this.badgeText.text = String(count);
    this.badgeText.style.fontSize = 36;

    this.alpha = enabled ? 1 : 0.42;
    this.eventMode = enabled ? 'static' : 'none';
  }

  private drawIcon(g: Graphics, icon: PowerIcon): void {
    const strokeColor = 0xffd98e;
    const shadowColor = 0x4d1b09;
    const drawStroke = (color: number, width: number): void => {
      if (icon === 'undo') {
        g.moveTo(36, 12).quadraticCurveTo(0, -34, -42, -6).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(-42, -6).lineTo(-31, -34).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(-42, -6).lineTo(-12, -7).stroke({ color, width, cap: 'round', join: 'round' });
      } else if (icon === 'shuffle') {
        g.moveTo(-42, -22).lineTo(-14, -22).quadraticCurveTo(8, -22, 24, 16).lineTo(42, 16).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(-42, 20).lineTo(-12, 20).quadraticCurveTo(8, 20, 24, -16).lineTo(42, -16).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(42, 16).lineTo(28, 4).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(42, 16).lineTo(28, 28).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(42, -16).lineTo(28, -28).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(42, -16).lineTo(28, -4).stroke({ color, width, cap: 'round', join: 'round' });
      } else {
        g.circle(0, -12, 24).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(-16, 14).lineTo(16, 14).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(-11, 30).lineTo(11, 30).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(0, -54).lineTo(0, -42).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(-44, -36).lineTo(-34, -28).stroke({ color, width, cap: 'round', join: 'round' });
        g.moveTo(44, -36).lineTo(34, -28).stroke({ color, width, cap: 'round', join: 'round' });
      }
    };

    drawStroke(shadowColor, 16);
    drawStroke(strokeColor, 10);
    if (icon === 'hint') {
      g.circle(0, -12, 16).fill({ color: 0xffefad, alpha: 0.22 });
    }
  }
}

export class AssistBar extends Container {
  private readonly undoButton: PowerButton;
  private readonly hintButton: PowerButton;
  private readonly shuffleButton: PowerButton;

  constructor(onUndo: () => void, onHint: () => void, onShuffle: () => void) {
    super();

    this.undoButton = new PowerButton('undo', onUndo);
    this.undoButton.position.set(-270, 0);

    this.hintButton = new PowerButton('hint', onHint);
    this.hintButton.position.set(0, 0);

    this.shuffleButton = new PowerButton('shuffle', onShuffle);
    this.shuffleButton.position.set(270, 0);

    this.addChild(this.undoButton, this.hintButton, this.shuffleButton);
  }

  updateCounts(undo: number, hint: number, shuffle: number): void {
    this.undoButton.setCount(undo);
    this.hintButton.setCount(hint);
    this.shuffleButton.setCount(shuffle);
  }
}

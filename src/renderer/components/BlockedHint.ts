import { Container, Graphics, Text } from 'pixi.js';
import { config } from '../../app/config';

const HINT_LABEL_WIDTH = 318;
const HINT_LABEL_HEIGHT = 66;
const HINT_LABEL_Y = -68;
const HINT_ARROW_OFFSET_X = 126;
const HINT_ARROW_Y = 74;
const HINT_ARROW_WIDTH = 118;
const HINT_ARROW_HEIGHT = 72;

export class BlockedHint extends Container {
  private readonly text: Text;
  private readonly leftArrow: Graphics;
  private readonly rightArrow: Graphics;
  private readonly labelBg: Graphics;
  private visibleUntil = 0;
  private shownAt = 0;

  constructor() {
    super();
    this.visible = false;
    this.zIndex = 1_000_000;

    this.labelBg = new Graphics();
    this.labelBg.roundRect(-HINT_LABEL_WIDTH / 2, HINT_LABEL_Y - HINT_LABEL_HEIGHT / 2, HINT_LABEL_WIDTH, HINT_LABEL_HEIGHT, 8);
    this.labelBg.fill({ color: 0x1a120f, alpha: 0.68 });
    this.addChild(this.labelBg);

    this.text = new Text({
      text: '被左右锁住',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 40,
        fontWeight: '800',
        fill: 0xffe2b8,
        stroke: { color: 0x3b1b11, width: 3 },
        align: 'center',
      },
    });
    this.text.anchor.set(0.5);
    this.text.position.set(0, HINT_LABEL_Y);
    this.addChild(this.text);

    this.leftArrow = this.createArrow(-HINT_ARROW_OFFSET_X, HINT_ARROW_Y, -1);
    this.rightArrow = this.createArrow(HINT_ARROW_OFFSET_X, HINT_ARROW_Y, 1);
    this.addChild(this.leftArrow, this.rightArrow);
  }

  showAt(x: number, y: number, now = performance.now()): void {
    this.position.set(x, y);
    this.alpha = 1;
    this.scale.set(0.96);
    this.visible = true;
    this.shownAt = now;
    this.visibleUntil = now + config.timings.blockedFeedbackMs;
  }

  hide(): void {
    this.visible = false;
    this.alpha = 0;
    this.visibleUntil = 0;
  }

  update(now = performance.now()): void {
    if (!this.visible) return;
    const remaining = this.visibleUntil - now;
    if (remaining <= 0) {
      this.hide();
      return;
    }
    const elapsed = Math.max(0, now - this.shownAt);
    const intro = Math.min(1, elapsed / 140);
    const pulse = Math.sin(elapsed / 80) * 0.035;
    this.scale.set(0.96 + intro * 0.04 + pulse);
    this.alpha = Math.min(1, remaining / 260, 0.3 + intro * 0.7);
  }

  private createArrow(x: number, y: number, direction: -1 | 1): Graphics {
    const arrow = new Graphics();
    const halfWidth = HINT_ARROW_WIDTH / 2;
    const halfHeight = HINT_ARROW_HEIGHT / 2;
    const headX = direction * halfWidth;
    const tailX = -direction * halfWidth;
    const neckX = direction * 9;
    const shaftX = -direction * 18;

    arrow.position.set(x, y);
    arrow.ellipse(-direction * 8, 4, HINT_ARROW_WIDTH * 0.64, HINT_ARROW_HEIGHT * 0.48);
    arrow.fill({ color: 0xff3f2d, alpha: 0.24 });
    arrow.ellipse(-direction * 2, 4, HINT_ARROW_WIDTH * 0.48, HINT_ARROW_HEIGHT * 0.34);
    arrow.fill({ color: 0xff7256, alpha: 0.3 });
    arrow
      .moveTo(headX, 0)
      .lineTo(neckX, -halfHeight)
      .lineTo(neckX, -16)
      .lineTo(tailX, -16)
      .lineTo(tailX, 16)
      .lineTo(neckX, 16)
      .lineTo(neckX, halfHeight)
      .closePath()
      .fill({ color: config.colors.destructive, alpha: 0.96 });
    arrow
      .moveTo(headX, 0)
      .lineTo(neckX, -halfHeight)
      .lineTo(shaftX, -16)
      .stroke({ color: 0xff7b5c, width: 6, alpha: 0.42, join: 'round' });
    return arrow;
  }
}

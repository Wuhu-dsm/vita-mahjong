import { Container, Graphics, Text } from 'pixi.js';
import { config } from '../../app/config';

export function makeVerticalGradient(
  width: number,
  height: number,
  stops: Array<{ y: number; color: number; alpha?: number }>,
  steps = 96,
): Graphics {
  const g = new Graphics();
  const ordered = [...stops].sort((a, b) => a.y - b.y);
  for (let i = 0; i < steps; i += 1) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const mid = (t0 + t1) / 2;
    let from = ordered[0];
    let to = ordered[ordered.length - 1];
    for (let j = 0; j < ordered.length - 1; j += 1) {
      if (mid >= ordered[j].y && mid <= ordered[j + 1].y) {
        from = ordered[j];
        to = ordered[j + 1];
        break;
      }
    }
    const span = Math.max(0.001, to.y - from.y);
    const local = Math.max(0, Math.min(1, (mid - from.y) / span));
    const color = mixColor(from.color, to.color, local);
    const alpha = (from.alpha ?? 1) + ((to.alpha ?? 1) - (from.alpha ?? 1)) * local;
    g.rect(0, Math.round(t0 * height), width, Math.ceil((t1 - t0) * height) + 1);
    g.fill({ color, alpha });
  }
  return g;
}

export function addScreenGlow(parent: Container, color: number, x: number, y: number, radius: number, alpha: number): void {
  const steps = 14;
  for (let i = steps; i >= 1; i -= 1) {
    const g = new Graphics();
    const t = i / steps;
    g.circle(x, y, radius * t);
    g.fill({ color, alpha: alpha * (1 - t) * 0.22 });
    parent.addChild(g);
  }
}

export function makeGoldText(text: string, fontSize: number, stroke = 6): Text {
  const label = new Text({
    text,
    style: {
      fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
      fontSize,
      fontWeight: '900',
      fill: 0xffe9ad,
      stroke: { color: 0x6d2a0c, width: stroke },
      align: 'center',
      dropShadow: {
        color: 0x2a0902,
        alpha: 0.45,
        blur: 2,
        distance: 4,
        angle: Math.PI / 2,
      },
    },
  });
  label.anchor.set(0.5);
  return label;
}

export function makeRoundIconButton(symbol: string, x: number, y: number, onTap?: () => void): Container {
  const button = new Container();
  button.position.set(x, y);
  button.eventMode = 'static';
  button.cursor = 'pointer';
  if (onTap) button.on('pointertap', onTap);

  const bg = new Graphics();
  bg.circle(0, 0, 48).fill({ color: 0x190906, alpha: 0.55 });
  bg.circle(0, 0, 42).fill({ color: 0x91471b });
  bg.circle(0, 0, 34).fill({ color: 0x5b2310 });
  bg.circle(0, 0, 42).stroke({ color: 0xffc36f, width: 5 });

  const icon = new Text({
    text: symbol,
    style: {
      fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
      fontSize: 48,
      fontWeight: '900',
      fill: 0xffe2a2,
      stroke: { color: 0x5b230c, width: 3 },
      align: 'center',
    },
  });
  icon.anchor.set(0.5);
  icon.y = -2;
  button.addChild(bg, icon);
  return button;
}

export function addSubtleBorder(parent: Container): void {
  const border = new Graphics();
  border.rect(4, 0, 2, config.designHeight).fill({ color: 0xf7b15c, alpha: 0.28 });
  border.rect(config.designWidth - 6, 0, 2, config.designHeight).fill({ color: 0xf7b15c, alpha: 0.28 });
  parent.addChild(border);
}

function mixColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  return (
    (Math.round(ar + (br - ar) * t) << 16) |
    (Math.round(ag + (bg - ag) * t) << 8) |
    Math.round(ab + (bb - ab) * t)
  );
}

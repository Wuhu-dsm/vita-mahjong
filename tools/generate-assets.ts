import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePng } from './png-writer';

type Rgba = [number, number, number, number];

interface Canvas {
  width: number;
  height: number;
  data: Uint8Array;
}

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TEXTURE_DIR = join(ROOT, 'public', 'assets', 'textures');

const palette = {
  dominant: '#7A4F2E',
  secondary: '#D4A574',
  accent: '#F5D78E',
  destructive: '#C0392B',
  gameBg: '#1B4D3E',
  tileFace: '#FAFAF8',
  tileSide: '#2E8B57',
  trayBg: '#3E2723',
  resultBg: '#0F172A',
  dark: '#1F140F',
  white: '#FFFFFF',
  black: '#000000',
};

const glyphs: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  G: ['01110', '10000', '10000', '10111', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  V: ['10001', '10001', '10001', '10001', '01010', '01010', '00100'],
  a: ['00000', '01110', '00001', '01111', '10001', '10011', '01101'],
  i: ['00100', '00000', '01100', '00100', '00100', '00100', '01110'],
  t: ['00100', '00100', '11111', '00100', '00100', '00101', '00010'],
};

function hex(hexValue: string, alpha = 255): Rgba {
  const clean = hexValue.replace('#', '');
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
    alpha,
  ];
}

function mix(a: Rgba, b: Rgba, amount: number): Rgba {
  const t = Math.max(0, Math.min(1, amount));
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round(a[3] + (b[3] - a[3]) * t),
  ];
}

function canvas(width: number, height: number, fill: Rgba = [0, 0, 0, 0]): Canvas {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = fill[3];
  }
  return { width, height, data };
}

function pixel(target: Canvas, x: number, y: number, color: Rgba): void {
  if (x < 0 || y < 0 || x >= target.width || y >= target.height) return;
  const offset = (Math.floor(y) * target.width + Math.floor(x)) * 4;
  const alpha = color[3] / 255;
  const inv = 1 - alpha;
  target.data[offset] = Math.round(color[0] * alpha + target.data[offset] * inv);
  target.data[offset + 1] = Math.round(color[1] * alpha + target.data[offset + 1] * inv);
  target.data[offset + 2] = Math.round(color[2] * alpha + target.data[offset + 2] * inv);
  target.data[offset + 3] = Math.round(color[3] + target.data[offset + 3] * inv);
}

function rect(target: Canvas, x: number, y: number, width: number, height: number, color: Rgba): void {
  for (let yy = Math.floor(y); yy < y + height; yy += 1) {
    for (let xx = Math.floor(x); xx < x + width; xx += 1) {
      pixel(target, xx, yy, color);
    }
  }
}

function roundedRect(
  target: Canvas,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: Rgba,
): void {
  const right = x + width - 1;
  const bottom = y + height - 1;
  for (let yy = Math.floor(y); yy <= bottom; yy += 1) {
    for (let xx = Math.floor(x); xx <= right; xx += 1) {
      const cx = xx < x + radius ? x + radius : xx > right - radius ? right - radius : xx;
      const cy = yy < y + radius ? y + radius : yy > bottom - radius ? bottom - radius : yy;
      const dx = xx - cx;
      const dy = yy - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        pixel(target, xx, yy, color);
      }
    }
  }
}

function strokeRoundedRect(
  target: Canvas,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  thickness: number,
  color: Rgba,
): void {
  const right = x + width - 1;
  const bottom = y + height - 1;
  const innerX = x + thickness;
  const innerY = y + thickness;
  const innerRight = right - thickness;
  const innerBottom = bottom - thickness;
  const outerRadius = radius * radius;
  const innerRadius = Math.max(0, radius - thickness) ** 2;

  for (let yy = Math.floor(y); yy <= bottom; yy += 1) {
    for (let xx = Math.floor(x); xx <= right; xx += 1) {
      const outerCx = xx < x + radius ? x + radius : xx > right - radius ? right - radius : xx;
      const outerCy = yy < y + radius ? y + radius : yy > bottom - radius ? bottom - radius : yy;
      const outerDx = xx - outerCx;
      const outerDy = yy - outerCy;
      const inOuter = outerDx * outerDx + outerDy * outerDy <= outerRadius;

      const innerCx =
        xx < innerX + radius - thickness
          ? innerX + radius - thickness
          : xx > innerRight - radius + thickness
            ? innerRight - radius + thickness
            : xx;
      const innerCy =
        yy < innerY + radius - thickness
          ? innerY + radius - thickness
          : yy > innerBottom - radius + thickness
            ? innerBottom - radius + thickness
            : yy;
      const innerDx = xx - innerCx;
      const innerDy = yy - innerCy;
      const insideInnerBounds = xx >= innerX && yy >= innerY && xx <= innerRight && yy <= innerBottom;
      const inInner = insideInnerBounds && innerDx * innerDx + innerDy * innerDy <= innerRadius;

      if (inOuter && !inInner) {
        pixel(target, xx, yy, color);
      }
    }
  }
}

function line(target: Canvas, x0: number, y0: number, x1: number, y1: number, color: Rgba, thickness = 1): void {
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = Math.round(x0);
  let y = Math.round(y0);
  const endX = Math.round(x1);
  const endY = Math.round(y1);

  for (;;) {
    rect(target, x - Math.floor(thickness / 2), y - Math.floor(thickness / 2), thickness, thickness, color);
    if (x === endX && y === endY) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

function circle(target: Canvas, cx: number, cy: number, radius: number, color: Rgba): void {
  const radiusSquared = radius * radius;
  for (let y = Math.floor(cy - radius); y <= cy + radius; y += 1) {
    for (let x = Math.floor(cx - radius); x <= cx + radius; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radiusSquared) {
        pixel(target, x, y, color);
      }
    }
  }
}

function ring(target: Canvas, cx: number, cy: number, outer: number, inner: number, color: Rgba): void {
  const outerSquared = outer * outer;
  const innerSquared = inner * inner;
  for (let y = Math.floor(cy - outer); y <= cy + outer; y += 1) {
    for (let x = Math.floor(cx - outer); x <= cx + outer; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = dx * dx + dy * dy;
      if (dist <= outerSquared && dist >= innerSquared) {
        pixel(target, x, y, color);
      }
    }
  }
}

function drawText(target: Canvas, text: string, x: number, y: number, scale: number, color: Rgba): void {
  let cursor = x;
  for (const char of text) {
    if (char === ' ') {
      cursor += 4 * scale;
      continue;
    }
    const glyph = glyphs[char];
    if (!glyph) {
      cursor += 6 * scale;
      continue;
    }
    glyph.forEach((row, gy) => {
      [...row].forEach((bit, gx) => {
        if (bit === '1') {
          roundedRect(target, cursor + gx * scale, y + gy * scale, scale, scale, Math.max(1, scale / 5), color);
        }
      });
    });
    cursor += 6 * scale;
  }
}

function gradient(target: Canvas, top: Rgba, bottom: Rgba): void {
  for (let y = 0; y < target.height; y += 1) {
    const color = mix(top, bottom, y / Math.max(1, target.height - 1));
    rect(target, 0, y, target.width, 1, color);
  }
}

function save(name: string, image: Canvas): void {
  writePng(join(TEXTURE_DIR, `${name}.png`), image);
}

function bgHome(): Canvas {
  const image = canvas(16, 16);
  gradient(image, hex('#8B5A34'), hex(palette.dominant));
  for (let x = 0; x < image.width; x += 4) {
    rect(image, x, 0, 1, image.height, hex('#5E381E', 120));
  }
  for (let y = 2; y < image.height; y += 5) {
    rect(image, 0, y, image.width, 1, hex(palette.secondary, 70));
  }
  return image;
}

function bgGame(): Canvas {
  const image = canvas(8, 8, hex(palette.gameBg));
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if ((x + y) % 3 === 0) pixel(image, x, y, hex('#245F4D', 110));
    }
  }
  return image;
}

function bgResult(): Canvas {
  const image = canvas(128, 128, hex(palette.resultBg));
  const center = hex(palette.accent, 150);
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const dx = x - image.width / 2;
      const dy = y - image.height / 2;
      const t = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 78);
      pixel(image, x, y, mix(hex(palette.resultBg), center, t * 0.7));
    }
  }
  return image;
}

function capsule(width: number, height: number, fill: Rgba, edge: Rgba): Canvas {
  const image = canvas(width, height);
  roundedRect(image, 0, 0, width, height, height / 2, edge);
  roundedRect(image, 8, 8, width - 16, height - 16, height / 2 - 8, fill);
  roundedRect(image, 18, 14, width - 36, height / 3, height / 6, hex(palette.white, 55));
  return image;
}

function btnCircleBrown(): Canvas {
  const image = canvas(96, 96);
  circle(image, 48, 48, 45, hex('#2F1E18', 180));
  circle(image, 48, 48, 40, hex(palette.trayBg));
  ring(image, 48, 48, 41, 35, hex(palette.secondary));
  return image;
}

function iconGear(): Canvas {
  const image = canvas(64, 64);
  const color = hex(palette.accent);
  ring(image, 32, 32, 18, 9, color);
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8;
    const x = 32 + Math.cos(angle) * 24;
    const y = 32 + Math.sin(angle) * 24;
    roundedRect(image, x - 4, y - 4, 8, 8, 2, color);
  }
  return image;
}

function iconBack(): Canvas {
  const image = canvas(64, 64);
  line(image, 42, 14, 20, 32, hex(palette.white), 7);
  line(image, 20, 32, 42, 50, hex(palette.white), 7);
  return image;
}

function iconMenu(): Canvas {
  const image = canvas(64, 64);
  for (const y of [20, 32, 44]) {
    roundedRect(image, 14, y - 3, 36, 6, 3, hex(palette.white));
  }
  return image;
}

function tileFace(): Canvas {
  const image = canvas(227, 120);
  roundedRect(image, 4, 6, 219, 110, 20, hex('#D6D2C8'));
  roundedRect(image, 0, 0, 219, 108, 18, hex(palette.tileFace));
  roundedRect(image, 15, 13, 189, 25, 12, hex(palette.white, 110));
  strokeRoundedRect(image, 9, 9, 201, 90, 14, 4, hex(palette.secondary, 160));
  return image;
}

function tileSide(): Canvas {
  const image = canvas(227, 30, hex(palette.tileSide));
  gradient(image, hex('#3BA66A'), hex('#1D6E43'));
  rect(image, 0, 0, image.width, 4, hex(palette.white, 45));
  return image;
}

function tileBlockedArrow(): Canvas {
  const image = canvas(64, 64);
  const color = hex(palette.destructive);
  line(image, 50, 12, 18, 32, color, 8);
  line(image, 18, 32, 50, 52, color, 8);
  line(image, 18, 32, 56, 32, color, 8);
  return image;
}

function particleSquare(): Canvas {
  const image = canvas(16, 16);
  roundedRect(image, 2, 2, 12, 12, 2, hex(palette.white));
  return image;
}

function decoRing(): Canvas {
  const image = canvas(220, 220);
  ring(image, 110, 110, 96, 78, hex(palette.secondary));
  ring(image, 110, 110, 64, 58, hex(palette.accent, 180));
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8;
    const x = 110 + Math.cos(angle) * 86;
    const y = 110 + Math.sin(angle) * 86;
    circle(image, x, y, 8, hex(palette.accent));
  }
  return image;
}

function decoLotus(): Canvas {
  const image = canvas(360, 240);
  const gold = hex(palette.accent, 190);
  for (let i = 0; i < 12; i += 1) {
    const angle = (Math.PI * 2 * i) / 12;
    const x = 180 + Math.cos(angle) * 74;
    const y = 120 + Math.sin(angle) * 44;
    line(image, 180, 120, x, y, gold, 12);
  }
  for (let i = 0; i < 7; i += 1) {
    const x = 110 + i * 24;
    line(image, 180, 126, x, 182 - Math.abs(i - 3) * 12, hex(palette.accent), 16);
  }
  circle(image, 180, 125, 28, hex(palette.secondary, 220));
  return image;
}

function logo(): Canvas {
  const image = canvas(600, 160);
  drawText(image, 'Vita', 36, 14, 11, hex(palette.accent));
  drawText(image, 'MAHJONG', 92, 92, 7, hex(palette.tileFace));
  line(image, 34, 138, 560, 138, hex(palette.secondary, 160), 5);
  line(image, 492, 42, 558, 20, hex(palette.tileSide), 7);
  line(image, 492, 42, 561, 56, hex(palette.tileSide), 7);
  circle(image, 492, 42, 12, hex(palette.tileSide));
  return image;
}

function generateAssets(): void {
  mkdirSync(TEXTURE_DIR, { recursive: true });

  save('bg_home', bgHome());
  save('bg_game', bgGame());
  save('bg_result', bgResult());
  save('btn_wooden_capsule', capsule(400, 120, hex(palette.dominant), hex(palette.secondary)));
  save('btn_green_capsule', capsule(400, 120, hex(palette.gameBg), hex(palette.accent)));
  save('btn_circle_brown', btnCircleBrown());
  save('icon_gear', iconGear());
  save('icon_back', iconBack());
  save('icon_menu', iconMenu());
  save('tile_face', tileFace());
  save('tile_side', tileSide());
  save('tile_blocked_arrow', tileBlockedArrow());
  save('particle_square', particleSquare());
  save('deco_ring', decoRing());
  save('deco_lotus', decoLotus());
  save('logo_vita_mahjong', logo());
}

generateAssets();

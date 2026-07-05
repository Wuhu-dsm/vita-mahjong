import { Container, Graphics, Rectangle, Text } from 'pixi.js';
import { config } from '../../app/config';
import type { Stone, ThemeId } from '../../engine/types';

const FACE_SYMBOLS: Record<ThemeId, string[]> = {
  zodiac: ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
  traditional: [
    '♈',
    '♉',
    '♊',
    '♋',
    '♌',
    '♍',
    '♎',
    '♏',
    '♐',
    '♑',
    '♒',
    '♓',
    '猫',
    '鱼',
    '蟹',
    '蝎',
    '鸟',
    '蝶',
    '鹿',
    '兔',
    '鹤',
    '虎',
    '龟',
    '狐',
    '竹',
    '莲',
    '云',
    '太',
    '灯',
    '扇',
    '茶',
    '玉',
    '月',
    '桥',
    '琴',
    '棋',
    '春',
    '夏',
    '秋',
    '冬',
    '梅',
    '兰',
    '竹',
    '菊',
  ],
  animals: ['猫', '鱼', '蟹', '蝎', '鸟', '蝶', '鹿', '兔', '鹤', '虎', '龟', '狐'],
  oriental: ['竹', '莲', '云', '太', '灯', '扇', '茶', '玉', '月', '桥', '琴', '棋'],
  seasons: ['春', '夏', '秋', '冬', '花', '果', '雪', '风'],
  myth: ['龙', '凤', '麟', '卦', '意', '珠', '剑', '印', '星', '符', '鼎', '镜'],
};

const FACE_TINTS = [0xc42c2f, 0x006b8d, 0x147d59, 0x0f506f, 0x1f7f5b, 0xb4272b];

export const TILE_TAPPED = 'tile-tapped';

export class TileSprite extends Container {
  readonly faceSprite: Graphics;
  readonly sideSprite: Graphics;
  readonly shadowSprite: Graphics;

  private readonly haloSprite: Graphics;
  private readonly symbolText: Text;
  private readonly blockedOverlay: Graphics;
  private stoneId: string | null = null;
  private faceId: number | null = null;

  constructor() {
    super();

    this.shadowSprite = new Graphics();
    this.shadowSprite.roundRect(-config.tile.width / 2 + 14, -config.tile.height / 2 + 34, config.tile.width, config.tile.height, 22);
    this.shadowSprite.fill({ color: 0x00140d });
    this.shadowSprite.position.set(18, 30);
    this.shadowSprite.alpha = 0.22;
    this.addChild(this.shadowSprite);

    this.sideSprite = new Graphics();
    this.drawSide(0x0b9128);
    this.addChild(this.sideSprite);

    this.haloSprite = new Graphics();
    this.haloSprite.roundRect(-config.tile.width / 2 - 12, -config.tile.height / 2 - 12, config.tile.width + 24, config.tile.height + 24, 26);
    this.haloSprite.fill({ color: 0x73e9ff });
    this.haloSprite.alpha = 0;
    this.addChild(this.haloSprite);

    this.faceSprite = new Graphics();
    this.drawFace();
    this.addChild(this.faceSprite);

    this.symbolText = new Text({
      text: '',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 124,
        fontWeight: '900',
        fill: FACE_TINTS[0],
        align: 'center',
        stroke: { color: 0xffffff, width: 2 },
      },
    });
    this.symbolText.anchor.set(0.5);
    this.symbolText.position.set(0, 0);
    this.addChild(this.symbolText);

    this.blockedOverlay = new Graphics();
    this.blockedOverlay.roundRect(-config.tile.width / 2, -config.tile.height / 2, config.tile.width, config.tile.height, 22);
    this.blockedOverlay.fill({ color: 0x4f504b, alpha: 0.68 });
    this.blockedOverlay.alpha = 0;
    this.addChild(this.blockedOverlay);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Rectangle(
      -config.tile.width / 2 - config.tile.touchPadding,
      -config.tile.height / 2 - config.tile.touchPadding,
      config.tile.width + config.tile.touchPadding * 2,
      config.tile.height + 34 + config.tile.touchPadding * 2,
    );

    this.on('pointertap', () => {
      if (this.stoneId) {
        this.emit(TILE_TAPPED, this.stoneId);
      }
    });
  }

  setStone(stone: Stone, theme: ThemeId): void {
    this.stoneId = stone.id;
    this.setFace(theme, stone.face);
    this.highlight(false);
    this.setBlocked(false);
    this.visible = true;
  }

  setFace(theme: ThemeId, faceId: number): void {
    this.faceId = faceId;
    const faceSet = FACE_SYMBOLS[theme] ?? FACE_SYMBOLS.zodiac;
    this.symbolText.text = faceSet[faceId % faceSet.length] ?? String(faceId + 1);
    this.symbolText.style.fill = FACE_TINTS[faceId % FACE_TINTS.length];
    this.drawSide(config.colors.tileSide);
  }

  getStoneId(): string | null {
    return this.stoneId;
  }

  getFaceId(): number | null {
    return this.faceId;
  }

  highlight(enabled: boolean): void {
    this.haloSprite.clear();
    this.haloSprite.roundRect(-config.tile.width / 2 - 14, -config.tile.height / 2 - 14, config.tile.width + 28, config.tile.height + 28, 28);
    this.haloSprite.fill({ color: enabled ? 0x58ebff : config.colors.accent });
    this.haloSprite.alpha = enabled ? 0.92 : 0;
    this.scale.set(enabled ? 1.06 : 1);
  }

  /** Set halo alpha directly for hint pulse animation. */
  setHintGlow(alpha: number): void {
    this.haloSprite.alpha = alpha;
  }

  setBlocked(enabled: boolean): void {
    this.faceSprite.alpha = enabled ? 0.72 : 1;
    this.sideSprite.alpha = enabled ? 0.7 : 1;
    this.symbolText.alpha = enabled ? 0.7 : 1;
    this.blockedOverlay.alpha = enabled ? 0.44 : 0;
  }

  resetForPool(): void {
    this.stoneId = null;
    this.faceId = null;
    this.visible = false;
    this.alpha = 1;
    this.position.set(0, 0);
    this.scale.set(1);
    this.highlight(false);
    this.setBlocked(false);
    this.removeAllListeners(TILE_TAPPED);
  }

  private drawFace(): void {
    const w = config.tile.width;
    const h = config.tile.height;
    this.faceSprite.clear();
    this.faceSprite.roundRect(-w / 2, -h / 2, w, h, 22);
    this.faceSprite.fill({ color: 0xfdfdf5 });
    this.faceSprite.roundRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 18);
    this.faceSprite.stroke({ color: 0xd9c7aa, width: 3, alpha: 0.72 });
    this.faceSprite.roundRect(-w / 2, -h / 2, w, h, 22);
    this.faceSprite.stroke({ color: 0x0b6426, width: 4, alpha: 0.9 });
    this.faceSprite.roundRect(-w / 2 + 12, -h / 2 + 12, w * 0.24, h - 44, 15);
    this.faceSprite.fill({ color: 0xffffff, alpha: 0.38 });
  }

  private drawSide(color: number): void {
    const w = config.tile.width;
    const h = config.tile.height;
    this.sideSprite.clear();
    this.sideSprite.roundRect(w / 2 - 24, -h / 2 + 18, 42, h - 18, 14);
    this.sideSprite.fill({ color: 0x087c1c });
    this.sideSprite.roundRect(w / 2 - 15, -h / 2 + 26, 18, h - 34, 9);
    this.sideSprite.fill({ color: 0x17c738, alpha: 0.58 });
    this.sideSprite.roundRect(-w / 2 + 5, h / 2 - 24, w - 1, 48, 15);
    this.sideSprite.fill({ color });
    this.sideSprite.roundRect(-w / 2 + 10, h / 2 - 17, w - 19, 22, 9);
    this.sideSprite.fill({ color: 0x17c738, alpha: 0.74 });
    this.sideSprite.roundRect(w / 2 - 22, h / 2 - 14, 38, 31, 13);
    this.sideSprite.fill({ color: 0x075e18, alpha: 0.55 });
  }
}

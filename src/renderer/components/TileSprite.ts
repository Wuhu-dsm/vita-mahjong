import { Assets, Container, Rectangle, Sprite, Text, Texture } from 'pixi.js';
import type { AssetKey } from '../../app/assets';
import { config } from '../../app/config';
import type { Stone, ThemeId } from '../../engine/types';

const FACE_SYMBOLS: Record<ThemeId, string[]> = {
  zodiac: ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
  traditional: [
    '一筒',
    '二筒',
    '三筒',
    '四筒',
    '五筒',
    '六筒',
    '七筒',
    '八筒',
    '九筒',
    '一条',
    '二条',
    '三条',
    '四条',
    '五条',
    '六条',
    '七条',
    '八条',
    '九条',
    '一万',
    '二万',
    '三万',
    '四万',
    '五万',
    '六万',
    '七万',
    '八万',
    '九万',
    '中',
    '发',
    '白',
    '东',
    '南',
    '西',
    '北',
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

const FACE_TINTS = [0xc0392b, 0x1b4d3e, 0x2c3e50, 0x8e44ad, 0xb9770e, 0x117a65];

export const TILE_TAPPED = 'tile-tapped';

function requireTexture(key: AssetKey): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) {
    throw new Error(`Texture "${key}" has not been loaded`);
  }
  return texture;
}

export class TileSprite extends Container {
  readonly faceSprite: Sprite;
  readonly sideSprite: Sprite;
  readonly shadowSprite: Sprite;

  private readonly haloSprite: Sprite;
  private readonly symbolText: Text;
  private readonly leftArrow: Sprite;
  private readonly rightArrow: Sprite;
  private stoneId: string | null = null;
  private faceId: number | null = null;

  constructor() {
    super();

    this.shadowSprite = new Sprite(requireTexture('tile_side'));
    this.shadowSprite.anchor.set(0.5);
    this.shadowSprite.width = config.tile.width;
    this.shadowSprite.height = 34;
    this.shadowSprite.position.set(10, config.tile.height / 2 + 20);
    this.shadowSprite.tint = 0x000000;
    this.shadowSprite.alpha = 0.22;
    this.addChild(this.shadowSprite);

    this.sideSprite = new Sprite(requireTexture('tile_side'));
    this.sideSprite.anchor.set(0.5);
    this.sideSprite.width = config.tile.width;
    this.sideSprite.height = 38;
    this.sideSprite.position.set(0, config.tile.height / 2 + 12);
    this.addChild(this.sideSprite);

    this.haloSprite = new Sprite(requireTexture('tile_face'));
    this.haloSprite.anchor.set(0.5);
    this.haloSprite.width = config.tile.width + 26;
    this.haloSprite.height = config.tile.height + 26;
    this.haloSprite.tint = config.colors.accent;
    this.haloSprite.alpha = 0;
    this.addChild(this.haloSprite);

    this.faceSprite = new Sprite(requireTexture('tile_face'));
    this.faceSprite.anchor.set(0.5);
    this.faceSprite.width = config.tile.width;
    this.faceSprite.height = config.tile.height;
    this.addChild(this.faceSprite);

    this.symbolText = new Text({
      text: '',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 50,
        fontWeight: '900',
        fill: FACE_TINTS[0],
        align: 'center',
      },
    });
    this.symbolText.anchor.set(0.5);
    this.symbolText.position.set(0, -4);
    this.addChild(this.symbolText);

    this.leftArrow = this.createBlockedArrow(-config.tile.width / 2 - 18, 0, 0);
    this.rightArrow = this.createBlockedArrow(config.tile.width / 2 + 18, 0, Math.PI);
    this.addChild(this.leftArrow, this.rightArrow);

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
    this.sideSprite.tint = config.colors.tileSide;
  }

  getStoneId(): string | null {
    return this.stoneId;
  }

  getFaceId(): number | null {
    return this.faceId;
  }

  highlight(enabled: boolean): void {
    this.haloSprite.alpha = enabled ? 0.75 : 0;
    this.scale.set(enabled ? 1.04 : 1);
  }

  setBlocked(enabled: boolean): void {
    this.faceSprite.alpha = enabled ? 0.56 : 1;
    this.symbolText.alpha = enabled ? 0.42 : 1;
    this.leftArrow.visible = enabled;
    this.rightArrow.visible = enabled;
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

  private createBlockedArrow(x: number, y: number, rotation: number): Sprite {
    const arrow = new Sprite(requireTexture('tile_blocked_arrow'));
    arrow.anchor.set(0.5);
    arrow.position.set(x, y);
    arrow.rotation = rotation;
    arrow.width = 54;
    arrow.height = 54 * (arrow.texture.height / arrow.texture.width);
    arrow.visible = false;
    return arrow;
  }
}
